import { useState, useCallback, useRef } from 'react'

/**
 * useWearableBluetooth
 * Connects directly to smartwatches (Oraimo Watch 2 Pro, Polar, Garmin, etc.)
 * via Chrome Web Bluetooth API (navigator.bluetooth).
 * 
 * Approach 3 Improvements:
 * 1. acceptAllDevices: true to discover watches that do not advertise standard SIG UUIDs.
 * 2. Extensive optionalServices whitelist for vendor GATT inspection (0xFEE0, 0xFFE0, etc.).
 * 3. Diagnostic probe that inspects all discovered primary services & characteristics.
 */
export function useWearableBluetooth({ onHeartRateUpdate, onDisconnect } = {}) {
  const [connectionStatus, setConnectionStatus] = useState(() => {
    if (typeof navigator === 'undefined' || !navigator.bluetooth) {
      return 'unsupported'
    }
    return 'disconnected'
  })
  const [deviceName, setDeviceName] = useState(null)
  const [batteryLevel, setBatteryLevel] = useState(null)
  const [errorMessage, setErrorMessage] = useState(null)
  const [discoveredServices, setDiscoveredServices] = useState([])
  const [diagnosticLogs, setDiagnosticLogs] = useState([])

  const serverRef = useRef(null)

  const logDiag = useCallback((msg) => {
    console.log(`[WebBluetooth Probe] ${msg}`)
    setDiagnosticLogs((prev) => [...prev.slice(-49), `[${new Date().toLocaleTimeString()}] ${msg}`])
  }, [])

  const handleHeartRateChanged = useCallback((event) => {
    const dataView = event.target.value
    if (!dataView || dataView.byteLength < 2) return

    // Standard BLE Heart Rate Measurement format (0x2A37):
    const flags = dataView.getUint8(0)
    const is16Bit = (flags & 0x01) !== 0
    const heartRate = is16Bit ? dataView.getUint16(1, true) : dataView.getUint8(1)

    // Optional RR-interval parsing (for HRV)
    let rrInterval = null
    const hasRr = (flags & 0x10) !== 0
    if (hasRr) {
      const rrOffset = is16Bit ? 3 : 2
      if (dataView.byteLength >= rrOffset + 2) {
        rrInterval = Math.round((dataView.getUint16(rrOffset, true) / 1024) * 1000)
      }
    }

    logDiag(`Live HR reading received: ${heartRate} bpm`)

    if (onHeartRateUpdate) {
      onHeartRateUpdate({ heartRate, rrInterval, timestamp: Date.now() })
    }
  }, [onHeartRateUpdate, logDiag])

  const handleDeviceDisconnected = useCallback(() => {
    logDiag('Device disconnected.')
    setConnectionStatus('disconnected')
    setDeviceName(null)
    serverRef.current = null
    if (onDisconnect) onDisconnect()
  }, [onDisconnect, logDiag])

  const connectDevice = useCallback(async () => {
    if (typeof navigator === 'undefined' || !navigator.bluetooth) {
      const err = 'Web Bluetooth is not supported in this browser. Please open Chrome or Edge on localhost.'
      setErrorMessage(err)
      logDiag(err)
      alert(err)
      return
    }

    setErrorMessage(null)
    setConnectionStatus('connecting')
    logDiag('Prompting Chrome Bluetooth device pairing picker (acceptAllDevices: true)...')

    try {
      const selectedDevice = await navigator.bluetooth.requestDevice({
        acceptAllDevices: true,
        optionalServices: [
          'heart_rate',
          'battery_service',
          'device_information',
          '0000fee0-0000-1000-8000-00805f9b34fb', // Common vendor UUIDs
          '0000ffe0-0000-1000-8000-00805f9b34fb',
        ],
      })

      logDiag(`Selected device: ${selectedDevice.name || 'Unnamed Device'} (ID: ${selectedDevice.id})`)
      selectedDevice.addEventListener('gattserverdisconnected', handleDeviceDisconnected)

      logDiag('Connecting to GATT Server...')
      const server = await selectedDevice.gatt.connect()
      serverRef.current = server
      setDeviceName(selectedDevice.name || 'Oraimo Wearable')
      logDiag('GATT Server connected! Starting service discovery probe...')

      const foundServiceUuids = []

      // 1. Try to enumerate all primary services if browser supports it
      try {
        if (server.getPrimaryServices) {
          const allServices = await server.getPrimaryServices()
          for (const s of allServices) {
            foundServiceUuids.push(s.uuid)
          }
          logDiag(`Discovered ${allServices.length} total primary services: ${foundServiceUuids.join(', ')}`)
        }
      } catch (enumErr) {
        logDiag(`Service enumeration note: ${enumErr.message}`)
      }

      setDiscoveredServices(foundServiceUuids)

      // 2. Check Standard Heart Rate Service (0x180D)
      let hrFound = false
      try {
        const hrService = await server.getPrimaryService('heart_rate')
        logDiag('Found Primary Service: heart_rate (0x180D)')
        const hrCharacteristic = await hrService.getCharacteristic('heart_rate_measurement')
        await hrCharacteristic.startNotifications()
        hrCharacteristic.addEventListener('characteristicvaluechanged', handleHeartRateChanged)
        hrFound = true
        logDiag('SUCCESS: Subscribed to live heart_rate_measurement (0x2A37) notifications!')
      } catch (hrErr) {
        logDiag(`Standard heart_rate service not available: ${hrErr.message}`)
      }

      // 3. Check Battery Service
      try {
        const batService = await server.getPrimaryService('battery_service')
        const batChar = await batService.getCharacteristic('battery_level')
        const batVal = await batChar.readValue()
        const bLevel = batVal.getUint8(0)
        setBatteryLevel(bLevel)
        logDiag(`Battery level: ${bLevel}%`)
      } catch {
        // optional
      }

      // 4. Check Device Information
      try {
        const infoService = await server.getPrimaryService('device_information')
        const chars = await infoService.getCharacteristics()
        logDiag(`Device Information service exposed ${chars.length} characteristics.`)
      } catch {
        // optional
      }

      // 5. Probe Vendor Services (0xFEE0, 0xFFE0, etc.)
      const vendorCandidates = [
        '0000fee0-0000-1000-8000-00805f9b34fb',
        '0000ffe0-0000-1000-8000-00805f9b34fb',
      ]
      for (const vUuid of vendorCandidates) {
        try {
          const vService = await server.getPrimaryService(vUuid)
          logDiag(`Vendor Service detected: ${vUuid}`)
          const vChars = await vService.getCharacteristics()
          const charSummary = vChars
            .map((c) => `${c.uuid.slice(4, 8)}(read:${c.properties.read},write:${c.properties.write},notify:${c.properties.notify})`)
            .join(', ')
          logDiag(`Vendor Characteristics: ${charSummary}`)
        } catch {
          // not present
        }
      }

      setConnectionStatus('connected')
      logDiag('Device connection setup complete.')

      if (!hrFound) {
        alert(`Connected to ${selectedDevice.name || 'Oraimo Watch'}!\n\nGATT Discovery Report:\n- Standard Heart Rate (0x180D): Not advertised\n- Discovered Services: ${foundServiceUuids.length ? foundServiceUuids.join('\n') : 'Vendor proprietary'}\n\nCheck Chrome Developer Console (F12) for detailed characteristic descriptors.`)
      }
    } catch (err) {
      if (err.name === 'NotFoundError') {
        logDiag('User cancelled Bluetooth device selection dialog.')
        setConnectionStatus('disconnected')
      } else {
        const msg = err.message || 'Failed to connect to Bluetooth device.'
        setErrorMessage(msg)
        logDiag(`Connection error: ${msg}`)
        setConnectionStatus('disconnected')
        alert(`Bluetooth Connection Error:\n${msg}`)
      }
    }
  }, [handleHeartRateChanged, handleDeviceDisconnected, logDiag])

  const disconnectDevice = useCallback(() => {
    if (serverRef.current && serverRef.current.connected) {
      serverRef.current.disconnect()
    }
    handleDeviceDisconnected()
  }, [handleDeviceDisconnected])

  return {
    isSupported: connectionStatus !== 'unsupported',
    connectionStatus,
    deviceName,
    batteryLevel,
    errorMessage,
    discoveredServices,
    diagnosticLogs,
    connectDevice,
    disconnectDevice,
    isConnected: connectionStatus === 'connected',
  }
}

export default useWearableBluetooth

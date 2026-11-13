import { useState, useCallback, useRef } from 'react'

/**
 * useWearableBluetooth
 * Connects to consumer smartwatches (Oraimo, Apple, Polar, Garmin, etc.)
 * via the standard Web Bluetooth GATT Heart Rate Service (0x180D).
 * 
 * Falls back gracefully if Web Bluetooth is unavailable or device disconnects.
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

  const serverRef = useRef(null)

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

    if (onHeartRateUpdate) {
      onHeartRateUpdate({ heartRate, rrInterval, timestamp: Date.now() })
    }
  }, [onHeartRateUpdate])

  const handleDeviceDisconnected = useCallback(() => {
    setConnectionStatus('disconnected')
    setDeviceName(null)
    serverRef.current = null
    if (onDisconnect) onDisconnect()
  }, [onDisconnect])

  const connectDevice = useCallback(async () => {
    if (typeof navigator === 'undefined' || !navigator.bluetooth) {
      setErrorMessage('Web Bluetooth is not supported in this browser. Please use Chrome or Edge.')
      return
    }

    setErrorMessage(null)
    setConnectionStatus('connecting')

    try {
      const selectedDevice = await navigator.bluetooth.requestDevice({
        filters: [{ services: ['heart_rate'] }],
        optionalServices: ['battery_service', 'device_information'],
      })

      selectedDevice.addEventListener('gattserverdisconnected', handleDeviceDisconnected)

      const server = await selectedDevice.gatt.connect()
      serverRef.current = server

      const hrService = await server.getPrimaryService('heart_rate')
      const hrCharacteristic = await hrService.getCharacteristic('heart_rate_measurement')

      await hrCharacteristic.startNotifications()
      hrCharacteristic.addEventListener('characteristicvaluechanged', handleHeartRateChanged)

      try {
        const batService = await server.getPrimaryService('battery_service')
        const batChar = await batService.getCharacteristic('battery_level')
        const batVal = await batChar.readValue()
        setBatteryLevel(batVal.getUint8(0))
      } catch {
        // Battery service optional
      }

      setDeviceName(selectedDevice.name || 'Oraimo Wearable')
      setConnectionStatus('connected')
    } catch (err) {
      if (err.name === 'NotFoundError') {
        setConnectionStatus('disconnected')
      } else {
        setErrorMessage(err.message || 'Failed to connect to Bluetooth device.')
        setConnectionStatus('disconnected')
      }
    }
  }, [handleHeartRateChanged, handleDeviceDisconnected])

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
    connectDevice,
    disconnectDevice,
    isConnected: connectionStatus === 'connected',
  }
}

export default useWearableBluetooth

import { useState, useCallback, useRef, useEffect } from 'react'

/**
 * Lightweight recursive Protobuf Wire-Format Decoder
 * Decodes arbitrary Protobuf byte buffers without requiring compiled proto schemas.
 */
function decodeProtobuf(bytes) {
  let offset = 0
  const result = {}

  function readVarint() {
    let res = 0
    let shift = 0
    while (offset < bytes.length) {
      const b = bytes[offset++]
      res |= (b & 0x7f) << shift
      shift += 7
      if ((b & 0x80) === 0) break
    }
    return res
  }

  while (offset < bytes.length) {
    const key = readVarint()
    const fieldNum = key >> 3
    const wireType = key & 0x07
    if (fieldNum === 0) break

    if (wireType === 0) {
      // Varint (int32, int64, uint32, bool, enum)
      result[fieldNum] = readVarint()
    } else if (wireType === 2) {
      // Length-delimited (sub-message, string, or bytes)
      const len = readVarint()
      if (offset + len > bytes.length) break
      const slice = bytes.slice(offset, offset + len)
      offset += len
      try {
        result[fieldNum] = decodeProtobuf(slice)
      } catch {
        result[fieldNum] = Array.from(slice)
      }
    } else if (wireType === 1) {
      // 64-bit fixed
      offset += 8
    } else if (wireType === 5) {
      // 32-bit fixed
      offset += 4
    } else {
      break
    }
  }
  return result
}

/**
 * Deep Metric Extractor for Oraimo / SEWear / InfoWear Telemetry Frames
 * Extracts Steps, Heart Rate, SpO2, Stress, and Battery from parsed Protobuf trees.
 */
function extractMetricsFromTree(obj) {
  const metrics = {}
  if (!obj || typeof obj !== 'object') return metrics

  // Direct mapping for Message 165 (REPORT_BASIC_DATA):
  // Envelope: SEWear { 1: 165, 12: { 4: { 1: steps, 2: kcal, 3: dist, 4: hr, 5: spo2, 7: battery, 13: stress } } }
  const basicData = obj[12]?.[4] || obj[9]?.[2] || obj[9] || obj[12] || obj

  if (basicData && typeof basicData === 'object') {
    if (typeof basicData[1] === 'number') metrics.steps = basicData[1]
    if (typeof basicData[2] === 'number') metrics.calories = basicData[2]
    if (typeof basicData[3] === 'number') metrics.distance = basicData[3]
    if (typeof basicData[4] === 'number' && basicData[4] >= 30 && basicData[4] <= 240) {
      metrics.heartRate = basicData[4]
    }
    if (typeof basicData[5] === 'number' && basicData[5] >= 70 && basicData[5] <= 100) {
      metrics.bloodOxygen = basicData[5]
    }
    if (typeof basicData[7] === 'number' && basicData[7] >= 1 && basicData[7] <= 100) {
      metrics.battery = basicData[7]
    }
    if (typeof basicData[13] === 'number' && basicData[13] >= 0 && basicData[13] <= 100) {
      metrics.stress = basicData[13]
    }
  }

  // Recursive fallback scanner to catch any nested metric representation
  function scan(node) {
    if (!node || typeof node !== 'object') return
    for (const [k, v] of Object.entries(node)) {
      if (typeof v === 'number') {
        if (!metrics.heartRate && (k === '4' || k === 'hr') && v >= 40 && v <= 220) {
          metrics.heartRate = v
        }
        if (!metrics.bloodOxygen && (k === '5' || k === 'spo2') && v >= 80 && v <= 100) {
          metrics.bloodOxygen = v
        }
        if (!metrics.battery && (k === '7' || k === 'bat') && v >= 1 && v <= 100) {
          metrics.battery = v
        }
        if (!metrics.steps && (k === '1' || k === 'step') && v > 0) {
          metrics.steps = v
        }
        if (!metrics.stress && (k === '13' || k === 'pressure') && v > 0 && v <= 100) {
          metrics.stress = v
        }
      } else if (typeof v === 'object') {
        scan(v)
      }
    }
  }
  scan(obj)

  return metrics
}

/**
 * useWearableBluetooth
 * Connects directly to smartwatches (Oraimo Watch 2 Pro, Polar, Garmin, etc.)
 * via Chrome Web Bluetooth API (navigator.bluetooth).
 * 
 * Supports:
 * 1. Standard Bluetooth SIG Heart Rate Service (0x180D / 0x2A37)
 * 2. Oraimo Watch 2 Pro Vendor GATT Protocol (16186f00 / SEWear Protobuf Engine)
 * 3. Bidirectional Handshake: CMD 164 (App Open) & CMD 355 (Sport Start / Continuous Optical PPG)
 * 4. Deep Metric Extraction (Heart Rate, Steps, SpO2, Stress, Battery)
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
  const [packetCount, setPacketCount] = useState(0)
  const [lastVitals, setLastVitals] = useState({ heartRate: null, steps: null, bloodOxygen: null, stress: null })
  const [isSyncing, setIsSyncing] = useState(false)

  const serverRef = useRef(null)
  const txCharRef = useRef(null)
  const rxCharRef = useRef(null)
  const heartbeatTimerRef = useRef(null)

  const logDiag = useCallback((msg) => {
    console.log(`[WebBluetooth Probe] ${msg}`)
    setDiagnosticLogs((prev) => [...prev.slice(-49), `[${new Date().toLocaleTimeString()}] ${msg}`])
  }, [])

  // Standard BLE Heart Rate Measurement (0x2A37) handler
  const handleStandardHeartRate = useCallback((event) => {
    const dataView = event.target.value
    if (!dataView || dataView.byteLength < 2) return

    const flags = dataView.getUint8(0)
    const is16Bit = (flags & 0x01) !== 0
    const heartRate = is16Bit ? dataView.getUint16(1, true) : dataView.getUint8(1)

    let rrInterval = null
    const hasRr = (flags & 0x10) !== 0
    if (hasRr) {
      const rrOffset = is16Bit ? 3 : 2
      if (dataView.byteLength >= rrOffset + 2) {
        rrInterval = Math.round((dataView.getUint16(rrOffset, true) / 1024) * 1000)
      }
    }

    logDiag(`Standard HR received: ${heartRate} bpm`)
    setLastVitals((prev) => ({ ...prev, heartRate }))
    if (onHeartRateUpdate) {
      onHeartRateUpdate({ heartRate, rrInterval, timestamp: Date.now() })
    }
  }, [onHeartRateUpdate, logDiag])

  // Oraimo SEWear Transport Writer (Framed 3-phase packet transfer)
  const sendOraimoCommand = useCallback(async (payloadBytes, desc = 'Command') => {
    const tx = txCharRef.current
    if (!tx) {
      logDiag(`Cannot send ${desc}: TX characteristic not ready`)
      return false
    }

    try {
      logDiag(`Transmitting ${desc} [len: ${payloadBytes.length}]...`)

      // Phase 1: Start Frame (00 00 00 00 <chunk_count u16 LE>)
      const startFrame = new Uint8Array([0x00, 0x00, 0x00, 0x00, 0x01, 0x00])
      if (tx.writeValueWithoutResponse) {
        await tx.writeValueWithoutResponse(startFrame)
      } else {
        await tx.writeValue(startFrame)
      }

      await new Promise((r) => setTimeout(r, 60))

      // Phase 2: Chunk 1 (<idx u16 LE, 1-based> + payload)
      const chunk = new Uint8Array(2 + payloadBytes.length)
      chunk[0] = 0x01
      chunk[1] = 0x00
      chunk.set(payloadBytes, 2)
      if (tx.writeValueWithoutResponse) {
        await tx.writeValueWithoutResponse(chunk)
      } else {
        await tx.writeValue(chunk)
      }

      await new Promise((r) => setTimeout(r, 60))

      // Phase 3: End ACK (00 00 01 00)
      const endAck = new Uint8Array([0x00, 0x00, 0x01, 0x00])
      if (tx.writeValueWithoutResponse) {
        await tx.writeValueWithoutResponse(endAck)
      } else {
        await tx.writeValue(endAck)
      }

      logDiag(`SUCCESS: ${desc} sent to Oraimo Watch!`)
      return true
    } catch (err) {
      logDiag(`Failed sending ${desc}: ${err.message}`)
      return false
    }
  }, [logDiag])

  // Public Sync Action: Wakes sensors and triggers full telemetry report
  const triggerOraimoSync = useCallback(async () => {
    if (!txCharRef.current) return
    setIsSyncing(true)
    logDiag('Initiating Oraimo Full Sensor Sync sequence...')

    // 1. Command 164: App Open / Start Basic Data Mode (Envelope SEWear: 1:164, 12: {3: 0})
    const CMD_164 = new Uint8Array([0x08, 0xa4, 0x01, 0x62, 0x02, 0x18, 0x00])
    await sendOraimoCommand(CMD_164, 'CMD 164 (App Open)')

    await new Promise((r) => setTimeout(r, 120))

    // 2. Command 355: Start Workout / Optical PPG Sensor (Envelope SEWear: 1:355, 8: {10: {4: 1, 6: 1}})
    const CMD_355 = new Uint8Array([0x08, 0xe3, 0x02, 0x42, 0x06, 0x52, 0x04, 0x20, 0x01, 0x30, 0x01])
    await sendOraimoCommand(CMD_355, 'CMD 355 (Continuous Optical PPG)')

    await new Promise((r) => setTimeout(r, 120))

    // 3. Command 32: Device Info Request (Envelope SEWear: 1:32)
    const CMD_32 = new Uint8Array([0x08, 0x20])
    await sendOraimoCommand(CMD_32, 'CMD 32 (Device Info)')

    // 4. Poll RX characteristic directly once
    if (rxCharRef.current && rxCharRef.current.readValue) {
      try {
        const val = await rxCharRef.current.readValue()
        if (val && val.byteLength > 0) {
          logDiag(`Direct RX read: ${val.byteLength} bytes`)
        }
      } catch {
        // notification handler handles stream
      }
    }

    setIsSyncing(false)
  }, [sendOraimoCommand, logDiag])

  // Oraimo Vendor Packet Handler (Parses incoming bytes from 6f01 / 6f02)
  const handleVendorPacket = useCallback((event) => {
    const dataView = event.target.value
    if (!dataView || dataView.byteLength === 0) return

    setPacketCount((c) => c + 1)
    const rawBytes = new Uint8Array(dataView.buffer, dataView.byteOffset, dataView.byteLength)

    // Check for Transport ACK
    if (rawBytes.length >= 4 && rawBytes[0] === 0x00 && rawBytes[1] === 0x00) {
      if (rawBytes[2] === 0x01 && rawBytes[3] === 0x01) {
        logDiag('Watch Transport ACK: Ready')
        return
      }
      if (rawBytes[2] === 0x01 && rawBytes[3] === 0x00) {
        logDiag('Watch Transport ACK: Complete')
        return
      }
    }

    // Strip chunk index if present (<idx u16 LE, 1-based>)
    let payload = rawBytes
    if (rawBytes.length >= 4 && (rawBytes[0] === 0x01 || rawBytes[0] === 0x02) && rawBytes[1] === 0x00) {
      payload = rawBytes.slice(2)
    }

    // Decode Protobuf payload
    try {
      const tree = decodeProtobuf(payload)
      const metrics = extractMetricsFromTree(tree)

      const summaryParts = []
      if (metrics.heartRate) summaryParts.push(`HR: ${metrics.heartRate} bpm`)
      if (metrics.steps) summaryParts.push(`Steps: ${metrics.steps.toLocaleString()}`)
      if (metrics.bloodOxygen) summaryParts.push(`SpO2: ${metrics.bloodOxygen}%`)
      if (metrics.stress) summaryParts.push(`Stress: ${metrics.stress}`)
      if (metrics.battery) summaryParts.push(`Bat: ${metrics.battery}%`)

      if (summaryParts.length > 0) {
        logDiag(`DECODED TELEMETRY: ${summaryParts.join(' · ')}`)
        setLastVitals((prev) => ({ ...prev, ...metrics }))

        if (metrics.battery) {
          setBatteryLevel(metrics.battery)
        }

        if (onHeartRateUpdate) {
          onHeartRateUpdate({
            heartRate: metrics.heartRate,
            steps: metrics.steps,
            bloodOxygen: metrics.bloodOxygen,
            stress: metrics.stress,
            timestamp: Date.now(),
          })
        }
      } else {
        // Fallback: heuristic scan for ASCII step/heart rate text in payload
        const text = new TextDecoder('utf-8', { fatal: false }).decode(payload)
        const hrMatch = text.match(/(\d{2,3})\s*(?:bpm|BPM)/i)
        const stepMatch = text.match(/(\d{1,3}(?:,\d{3})+|\d{2,6})\s*(?:steps|Steps)/i)
        if (hrMatch || stepMatch) {
          const hr = hrMatch ? parseInt(hrMatch[1], 10) : undefined
          const st = stepMatch ? parseInt(stepMatch[1].replace(/,/g, ''), 10) : undefined
          logDiag(`ASCII Telemetry Matched: HR=${hr || 'N/A'}, Steps=${st || 'N/A'}`)
          if (onHeartRateUpdate) {
            onHeartRateUpdate({ heartRate: hr, steps: st, timestamp: Date.now() })
          }
        } else {
          logDiag(`Raw packet [len ${rawBytes.length}]: [${Array.from(rawBytes.slice(0, 10)).map(b => '0x' + b.toString(16).padStart(2, '0')).join(', ')}${rawBytes.length > 10 ? '...' : ''}]`)
        }
      }
    } catch (parseErr) {
      logDiag(`Protobuf parse note: ${parseErr.message}`)
    }
  }, [onHeartRateUpdate, logDiag])

  const handleDeviceDisconnected = useCallback(() => {
    logDiag('Device disconnected.')
    if (heartbeatTimerRef.current) {
      clearInterval(heartbeatTimerRef.current)
      heartbeatTimerRef.current = null
    }
    setConnectionStatus('disconnected')
    setDeviceName(null)
    serverRef.current = null
    txCharRef.current = null
    rxCharRef.current = null
    if (onDisconnect) onDisconnect()
  }, [onDisconnect, logDiag])

  const connectDevice = useCallback(async () => {
    if (typeof navigator === 'undefined' || !navigator.bluetooth) {
      const isLinux = typeof navigator !== 'undefined' && /linux/i.test(navigator.userAgent || navigator.platform || '')
      const linuxMsg = isLinux
        ? 'Web Bluetooth is disabled by default in Chrome on Linux.\n\nTo enable it:\n1. Open a new tab: chrome://flags/#enable-experimental-web-platform-features\n2. Change the dropdown from "Default" to "Enabled"\n3. Click "Relaunch" at the bottom of Chrome.'
        : 'Web Bluetooth is not supported in this browser. Please use Chrome or Edge.'
      setErrorMessage(linuxMsg)
      logDiag(linuxMsg)
      alert(linuxMsg)
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
          '16186f00-0000-1000-8000-00807f9b34fb', // Oraimo Watch 2 Pro / Sifli / InfoWear Service
          '0000aa01-0000-1000-8000-00805f9b34fb', // Oraimo NUS UART Service
          '0000fee7-0000-1000-8000-00805f9b34fb', // WeChat Sports Pedometer
          '0000fee0-0000-1000-8000-00805f9b34fb',
          '0000ffe0-0000-1000-8000-00805f9b34fb',
          '0000fe78-0000-1000-8000-00805f9b34fb',
          '0000fef5-0000-1000-8000-00805f9b34fb',
          '00001812-0000-1000-8000-00805f9b34fb',
        ],
      })

      logDiag(`Selected device: ${selectedDevice.name || 'Unnamed Device'} (ID: ${selectedDevice.id})`)
      selectedDevice.addEventListener('gattserverdisconnected', handleDeviceDisconnected)

      logDiag('Connecting to GATT Server...')
      const server = await selectedDevice.gatt.connect()
      serverRef.current = server
      setDeviceName(selectedDevice.name || 'Oraimo Watch 2 Pro')
      logDiag('GATT Server connected! Initializing sensor streams...')

      // 1. Probe Standard Heart Rate Service (0x180D)
      let standardHrFound = false
      try {
        const hrService = await server.getPrimaryService('heart_rate')
        const hrCharacteristic = await hrService.getCharacteristic('heart_rate_measurement')
        await hrCharacteristic.startNotifications()
        hrCharacteristic.addEventListener('characteristicvaluechanged', handleStandardHeartRate)
        standardHrFound = true
        logDiag('SUCCESS: Subscribed to standard heart_rate_measurement (0x180D)!')
      } catch {
        logDiag('Standard heart_rate service (0x180D) not advertised. Engaging Oraimo Vendor Engine...')
      }

      // 2. Probe Battery Service (0x180F)
      try {
        const batService = await server.getPrimaryService('battery_service')
        const batChar = await batService.getCharacteristic('battery_level')
        const batVal = await batChar.readValue()
        const bLevel = batVal.getUint8(0)
        setBatteryLevel(bLevel)
        logDiag(`Battery level: ${bLevel}%`)
      } catch {
        // Battery service optional
      }

      // 3. Probe Oraimo / InfoWear Vendor Service (16186f00)
      let vendorEngineActive = false
      try {
        const vendorService = await server.getPrimaryService('16186f00-0000-1000-8000-00807f9b34fb')
        logDiag('Discovered Primary Service: 16186f00 (Oraimo SEWear Telemetry Engine)')

        const chars = await vendorService.getCharacteristics()
        logDiag(`Found ${chars.length} characteristics under 16186f00`)

        // 6f01: RX (Notifications from watch to browser)
        const char6f01 = chars.find((c) => c.uuid.toLowerCase().startsWith('16186f01'))
        // 6f02: TX (Commands from browser to watch)
        const char6f02 = chars.find((c) => c.uuid.toLowerCase().startsWith('16186f02'))
        // 6f03: Bulk
        const char6f03 = chars.find((c) => c.uuid.toLowerCase().startsWith('16186f03'))

        if (char6f02) {
          txCharRef.current = char6f02
          logDiag('Mapped TX Command Characteristic: 16186f02')
        }

        if (char6f01) {
          rxCharRef.current = char6f01
          logDiag('Mapped RX Telemetry Characteristic: 16186f01')
          await char6f01.startNotifications()
          char6f01.addEventListener('characteristicvaluechanged', handleVendorPacket)
          logDiag('SUCCESS: Attached event listener on 16186f01 notifications!')
        }

        // Also listen on 6f02 & 6f03 notifications if supported
        for (const ch of [char6f02, char6f03]) {
          if (ch && ch.properties.notify) {
            try {
              await ch.startNotifications()
              ch.addEventListener('characteristicvaluechanged', handleVendorPacket)
            } catch {
              // optional
            }
          }
        }

        vendorEngineActive = true
      } catch (vErr) {
        logDiag(`Oraimo vendor service note: ${vErr.message}`)
      }

      // 4. Probe Nordic UART Service (0000aa01)
      try {
        const nusService = await server.getPrimaryService('0000aa01-0000-1000-8000-00805f9b34fb')
        const nusChars = await nusService.getCharacteristics()
        for (const nch of nusChars) {
          if (nch.properties.notify) {
            await nch.startNotifications()
            nch.addEventListener('characteristicvaluechanged', handleVendorPacket)
            logDiag(`Subscribed to NUS notification characteristic: ${nch.uuid.slice(0, 8)}`)
          }
        }
      } catch {
        // optional
      }

      setConnectionStatus('connected')
      logDiag('Device connection setup complete!')

      // 5. Trigger Initial Handshake & Sensor Activation
      if (txCharRef.current) {
        logDiag('Triggering automatic sensor wake-up handshake (CMD 164 & CMD 355)...')
        // Give connection 200ms to settle
        setTimeout(async () => {
          // Send CMD 164 (App Open)
          await sendOraimoCommand(new Uint8Array([0x08, 0xa4, 0x01, 0x62, 0x02, 0x18, 0x00]), 'CMD 164 (App Open)')
          // Send CMD 355 (Sport Start / PPG)
          await sendOraimoCommand(new Uint8Array([0x08, 0xe3, 0x02, 0x42, 0x06, 0x52, 0x04, 0x20, 0x01, 0x30, 0x01]), 'CMD 355 (Continuous PPG)')

          // Set 12-second keep-alive heartbeat to keep watch in active reporting mode
          if (heartbeatTimerRef.current) clearInterval(heartbeatTimerRef.current)
          heartbeatTimerRef.current = setInterval(async () => {
            if (txCharRef.current) {
              await sendOraimoCommand(new Uint8Array([0x08, 0xa4, 0x01, 0x62, 0x02, 0x18, 0x00]), 'Heartbeat Ping (CMD 164)')
            }
          }, 12000)
        }, 250)
      }

      if (!standardHrFound && vendorEngineActive) {
        logDiag('Oraimo SEWear Telemetry Protocol Engine is ACTIVE and streaming!')
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
  }, [handleStandardHeartRate, handleVendorPacket, sendOraimoCommand, handleDeviceDisconnected, logDiag])

  const disconnectDevice = useCallback(() => {
    if (heartbeatTimerRef.current) {
      clearInterval(heartbeatTimerRef.current)
      heartbeatTimerRef.current = null
    }
    if (serverRef.current && serverRef.current.connected) {
      serverRef.current.disconnect()
    }
    handleDeviceDisconnected()
  }, [handleDeviceDisconnected])

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (heartbeatTimerRef.current) {
        clearInterval(heartbeatTimerRef.current)
      }
    }
  }, [])

  return {
    isSupported: connectionStatus !== 'unsupported',
    connectionStatus,
    deviceName,
    batteryLevel,
    errorMessage,
    diagnosticLogs,
    packetCount,
    lastVitals,
    isSyncing,
    connectDevice,
    disconnectDevice,
    triggerOraimoSync,
    isConnected: connectionStatus === 'connected',
  }
}

export default useWearableBluetooth

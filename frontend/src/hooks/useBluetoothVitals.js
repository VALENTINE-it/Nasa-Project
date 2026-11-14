import { useCallback, useEffect, useRef, useState } from 'react'

const HEART_RATE_SERVICE = 'heart_rate'
const HEART_RATE_MEASUREMENT = 'heart_rate_measurement'

const initialState = {
  status: 'disconnected',
  deviceName: '',
  heartRate: null,
  heartRateSupported: false,
  error: '',
}

export default function useBluetoothVitals() {
  const [connection, setConnection] = useState(initialState)
  const deviceRef = useRef(null)
  const characteristicRef = useRef(null)
  const disconnectHandlerRef = useRef(null)
  const measurementHandlerRef = useRef(null)

  const disconnect = useCallback(() => {
    const device = deviceRef.current
    if (device && disconnectHandlerRef.current) {
      device.removeEventListener('gattserverdisconnected', disconnectHandlerRef.current)
    }
    if (characteristicRef.current && measurementHandlerRef.current) {
      characteristicRef.current.removeEventListener(
        'characteristicvaluechanged',
        measurementHandlerRef.current,
      )
    }

    deviceRef.current = null
    characteristicRef.current = null
    disconnectHandlerRef.current = null
    measurementHandlerRef.current = null
    device?.gatt?.disconnect()
    setConnection(initialState)
  }, [])

  const connect = useCallback(async () => {
    if (!window.isSecureContext) {
      setConnection({
        ...initialState,
        status: 'error',
        error: 'Bluetooth requires a secure HTTPS page. Open this app using HTTPS on your phone.',
      })
      return false
    }

    if (!navigator.bluetooth) {
      setConnection({
        ...initialState,
        status: 'error',
        error: 'This browser does not support Web Bluetooth. Use Chrome on Android.',
      })
      return false
    }

    setConnection({ ...initialState, status: 'connecting' })
    try {
      const device = await navigator.bluetooth.requestDevice({
        acceptAllDevices: true,
        optionalServices: [HEART_RATE_SERVICE],
      })
      deviceRef.current = device

      const onDisconnected = () => {
        if (characteristicRef.current && measurementHandlerRef.current) {
          characteristicRef.current.removeEventListener(
            'characteristicvaluechanged',
            measurementHandlerRef.current,
          )
        }
        deviceRef.current = null
        characteristicRef.current = null
        measurementHandlerRef.current = null
        disconnectHandlerRef.current = null
        setConnection(initialState)
      }
      disconnectHandlerRef.current = onDisconnected
      device.addEventListener('gattserverdisconnected', onDisconnected)

      const server = await device.gatt.connect()
      let heartRateSupported = false

      try {
        const service = await server.getPrimaryService(HEART_RATE_SERVICE)
        const characteristic = await service.getCharacteristic(HEART_RATE_MEASUREMENT)
        const onMeasurement = (event) => {
          const value = event.target.value
          if (!value || value.byteLength < 2) return

          const flags = value.getUint8(0)
          const heartRate = flags & 0x01 ? value.getUint16(1, true) : value.getUint8(1)
          setConnection((current) => ({ ...current, heartRate }))
        }

        characteristicRef.current = characteristic
        measurementHandlerRef.current = onMeasurement
        characteristic.addEventListener('characteristicvaluechanged', onMeasurement)
        await characteristic.startNotifications()
        heartRateSupported = true
      } catch (error) {
        if (error?.name !== 'NotFoundError') throw error
        heartRateSupported = false
      }

      setConnection({
        status: 'connected',
        deviceName: device.name || 'Bluetooth device',
        heartRate: null,
        heartRateSupported,
        error: '',
      })
      return true
    } catch (error) {
      const device = deviceRef.current
      if (device && disconnectHandlerRef.current) {
        device.removeEventListener('gattserverdisconnected', disconnectHandlerRef.current)
      }
      if (characteristicRef.current && measurementHandlerRef.current) {
        characteristicRef.current.removeEventListener(
          'characteristicvaluechanged',
          measurementHandlerRef.current,
        )
      }
      deviceRef.current = null
      characteristicRef.current = null
      disconnectHandlerRef.current = null
      measurementHandlerRef.current = null
      device?.gatt?.disconnect()

      const cancelled = error?.name === 'NotFoundError'
      setConnection({
        ...initialState,
        status: cancelled ? 'disconnected' : 'error',
        error: cancelled ? 'Pairing was canceled.' : error?.message || 'Could not connect to the watch.',
      })
      return false
    }
  }, [])

  useEffect(() => () => {
    const device = deviceRef.current
    if (device && disconnectHandlerRef.current) {
      device.removeEventListener('gattserverdisconnected', disconnectHandlerRef.current)
    }
    if (characteristicRef.current && measurementHandlerRef.current) {
      characteristicRef.current.removeEventListener(
        'characteristicvaluechanged',
        measurementHandlerRef.current,
      )
    }
    device?.gatt?.disconnect()
  }, [])

  return {
    ...connection,
    supported: typeof navigator !== 'undefined' && Boolean(navigator.bluetooth),
    secureContext: typeof window !== 'undefined' && window.isSecureContext,
    connect,
    disconnect,
  }
}

import { useEffect, useRef, useState } from 'react'

export function useTelemetryStream(liveVitals, isStreaming = true) {
  const [history, setHistory] = useState([])
  const vitalsRef = useRef(liveVitals)
  useEffect(() => { vitalsRef.current = liveVitals }, [liveVitals])
  useEffect(() => {
    if (!isStreaming) return
    const timer = setInterval(() => {
      if (vitalsRef.current) setHistory(prev => [...prev.slice(-23), vitalsRef.current])
    }, 2500)
    return () => clearInterval(timer)
  }, [isStreaming])
  return history
}

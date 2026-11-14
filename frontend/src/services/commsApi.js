export async function fetchHoustonMessages() {
  try {
    const res = await fetch('/api/comms/messages', { cache: 'no-store' })
    return res.ok ? await res.json() : []
  } catch {
    return []
  }
}

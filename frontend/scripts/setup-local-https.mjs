import { access, chmod, mkdir, writeFile } from 'node:fs/promises'
import { isIPv4 } from 'node:net'
import { networkInterfaces } from 'node:os'
import { spawnSync } from 'node:child_process'
import { fileURLToPath } from 'node:url'
import { dirname, resolve } from 'node:path'

const certDirectory = resolve(dirname(fileURLToPath(import.meta.url)), '../.certs')
const requestedIP = process.env.AURA_LAN_IP

function isPrivateIPv4(address) {
  const [first, second] = address.split('.').map(Number)
  return first === 10 || (first === 172 && second >= 16 && second <= 31) || (first === 192 && second === 168)
}

function findLanIP() {
  const addresses = Object.entries(networkInterfaces())
    .filter(([name]) => !/docker|podman|br-|veth|tun|tap|tailscale|vpn/i.test(name))
    .flatMap(([, entries]) => entries || [])
    .filter((entry) => entry.family === 'IPv4' && !entry.internal && isPrivateIPv4(entry.address))
    .map((entry) => entry.address)

  return addresses.find((address) => address.startsWith('192.168.')) || addresses[0]
}

function runOpenSSL(args) {
  const result = spawnSync('openssl', args, { cwd: certDirectory, stdio: 'inherit' })
  if (result.error) throw result.error
  if (result.status !== 0) throw new Error(`openssl exited with status ${result.status}`)
}

await mkdir(certDirectory, { recursive: true, mode: 0o700 })
const lanIP = requestedIP || findLanIP()
if (!lanIP) {
  throw new Error('Could not find a private IPv4 address. Set AURA_LAN_IP to your Wi-Fi IP and retry.')
}
if (!isIPv4(lanIP)) {
  throw new Error(`AURA_LAN_IP must be an IPv4 address; received "${lanIP}".`)
}

const caKey = resolve(certDirectory, 'ca-key.pem')
const caCert = resolve(certDirectory, 'ca.pem')
const caDER = resolve(certDirectory, 'ca.cer')
const serverKey = resolve(certDirectory, 'server-key.pem')
const serverCSR = resolve(certDirectory, 'server.csr')
const serverCert = resolve(certDirectory, 'server.pem')
const extensionFile = resolve(certDirectory, 'server.ext')

try {
  await Promise.all([access(caKey), access(caCert)])
} catch {
  runOpenSSL(['genrsa', '-out', caKey, '3072'])
  runOpenSSL([
    'req', '-x509', '-new', '-nodes', '-key', caKey, '-sha256', '-days', '3650',
    '-subj', '/CN=AURA-MED Local Development CA', '-out', caCert,
  ])
}
runOpenSSL(['genrsa', '-out', serverKey, '2048'])
runOpenSSL(['req', '-new', '-key', serverKey, '-subj', `/CN=${lanIP}`, '-out', serverCSR])

await writeFile(
  extensionFile,
  [
    'basicConstraints=CA:FALSE',
    'keyUsage=digitalSignature,keyEncipherment',
    'extendedKeyUsage=serverAuth',
    `subjectAltName=IP:${lanIP},IP:127.0.0.1,DNS:localhost`,
    '',
  ].join('\n'),
  { mode: 0o600 },
)

runOpenSSL([
  'x509', '-req', '-in', serverCSR, '-CA', caCert, '-CAkey', caKey, '-CAcreateserial',
  '-out', serverCert, '-days', '397', '-sha256', '-extfile', extensionFile,
])
runOpenSSL(['x509', '-in', caCert, '-outform', 'DER', '-out', caDER])
runOpenSSL(['x509', '-in', caCert, '-noout', '-fingerprint', '-sha256'])
await chmod(caKey, 0o600)
await chmod(serverKey, 0o600)

console.log(`\nLocal HTTPS certificate created for https://${lanIP}:5177`)
console.log(`Android CA download: http://${lanIP}:5178/ca.cer`)
console.log(`iPhone profile download: http://${lanIP}:5178/install.mobileconfig`)
console.log('Keep this directory private. It contains the CA private key and is excluded from Git.')

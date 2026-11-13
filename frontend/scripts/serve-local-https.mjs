import { createServer as createHTTPServer } from 'node:http'
import { readFile } from 'node:fs/promises'
import { randomUUID } from 'node:crypto'
import { spawnSync } from 'node:child_process'
import { fileURLToPath } from 'node:url'
import { dirname, resolve } from 'node:path'
import { createServer as createViteServer } from 'vite'

const scriptDirectory = dirname(fileURLToPath(import.meta.url))
const frontendDirectory = resolve(scriptDirectory, '..')
const certificatePath = resolve(frontendDirectory, '.certs/ca.pem')
const androidCertificatePath = resolve(frontendDirectory, '.certs/ca.cer')
const setup = spawnSync(process.execPath, [resolve(scriptDirectory, 'setup-local-https.mjs')], {
  stdio: 'inherit',
})

if (setup.error) throw setup.error
if (setup.status !== 0) throw new Error(`HTTPS certificate setup exited with status ${setup.status}`)

process.env.AURA_HTTPS = '1'
const vite = await createViteServer({
  configFile: resolve(frontendDirectory, 'vite.config.js'),
  server: { host: '0.0.0.0', port: 5177, strictPort: true },
})

const caServer = createHTTPServer(async (request, response) => {
  if (
    request.method !== 'GET' ||
    !['/ca.pem', '/ca.cer', '/install.mobileconfig'].includes(request.url)
  ) {
    response.writeHead(404).end('not found')
    return
  }

  try {
    if (request.url === '/ca.cer') {
      const caCertificate = await readFile(androidCertificatePath)
      response.writeHead(200, {
        'Content-Type': 'application/pkix-cert',
        'Content-Disposition': 'attachment; filename="aura-med-local-ca.cer"',
        'Cache-Control': 'no-store',
      })
      response.end(caCertificate)
      return
    }

    const caCertificate = await readFile(certificatePath)
    if (request.url === '/install.mobileconfig') {
      const payloadUUID = randomUUID().toUpperCase()
      const certificateData = caCertificate
        .toString('ascii')
        .replace(/-----BEGIN CERTIFICATE-----|-----END CERTIFICATE-----|\s/g, '')
      const profile = `<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0"><dict>
<key>PayloadContent</key><array><dict>
<key>PayloadCertificateFileName</key><string>aura-med-local-ca.cer</string>
<key>PayloadContent</key><data>${certificateData}</data>
<key>PayloadDescription</key><string>Trust the AURA-MED local development HTTPS certificate.</string>
<key>PayloadDisplayName</key><string>AURA-MED Local Development CA</string>
<key>PayloadIdentifier</key><string>local.auramed.ca</string>
<key>PayloadType</key><string>com.apple.security.root</string>
<key>PayloadUUID</key><string>${payloadUUID}</string>
<key>PayloadVersion</key><integer>1</integer>
</dict></array>
<key>PayloadDisplayName</key><string>AURA-MED Local HTTPS</string>
<key>PayloadIdentifier</key><string>local.auramed.profile</string>
<key>PayloadRemovalDisallowed</key><false/>
<key>PayloadType</key><string>Configuration</string>
<key>PayloadUUID</key><string>${randomUUID().toUpperCase()}</string>
<key>PayloadVersion</key><integer>1</integer>
</dict></plist>`
      response.writeHead(200, {
        'Content-Type': 'application/x-apple-aspen-config',
        'Content-Disposition': 'attachment; filename="aura-med-local-https.mobileconfig"',
        'Cache-Control': 'no-store',
      })
      response.end(profile)
      return
    }

    response.writeHead(200, {
      'Content-Type': 'application/x-x509-ca-cert',
      'Content-Disposition': 'attachment; filename="aura-med-local-ca.pem"',
      'Cache-Control': 'no-store',
    })
    response.end(caCertificate)
  } catch (error) {
    console.error('Unable to serve the local CA certificate:', error)
    response.writeHead(500).end('certificate unavailable')
  }
})

await vite.listen()
await new Promise((resolveListen, rejectListen) => {
  caServer.once('error', rejectListen)
  caServer.listen(5178, '0.0.0.0', resolveListen)
})

console.log('\nAURA-MED mobile test servers are ready:')
console.log('  HTTPS app: https://<this-computer-wi-fi-ip>:5177')
console.log('  Android CA: http://<this-computer-wi-fi-ip>:5178/ca.cer')
console.log('  iPhone profile: http://<this-computer-wi-fi-ip>:5178/install.mobileconfig')
console.log('  Both phone and computer must use the same private Wi-Fi network.')
console.log('  Stop both servers with Ctrl+C.')

const shutdown = async () => {
  caServer.close()
  await vite.close()
  process.exit(0)
}

process.once('SIGINT', shutdown)
process.once('SIGTERM', shutdown)

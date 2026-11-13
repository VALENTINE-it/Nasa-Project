# AURA-MED Frontend

The React + Vite dashboard supports a browser-based Bluetooth test connection to devices that expose the Bluetooth SIG Heart Rate Service.

## Run locally

Start the Go API from `backend/`, then start Vite from this directory:

```sh
npm install
npm run dev -- --host 0.0.0.0
```

Vite proxies `/api` requests to `http://localhost:8080`. Open the Vite URL in a browser and sign in with one of the demo accounts shown on the login screen.

## Open on Android and iPhone

1. Start the Go API from `backend/` with `go run .`.
2. In another terminal, run `npm run dev:https` from `frontend/`. The command prints your computer's Wi-Fi IP.
3. Connect the phone and computer to the same private Wi-Fi.
4. On Android, open `http://<computer-wi-fi-ip>:5178/ca.cer` and install the downloaded CA certificate from Android Security settings. Compare its SHA-256 fingerprint with the value printed in the computer terminal before trusting it.
5. On iPhone, open `http://<computer-wi-fi-ip>:5178/install.mobileconfig`, install the downloaded profile in Settings, compare the certificate SHA-256 fingerprint with the terminal output, then enable full trust for it under **Settings → General → About → Certificate Trust Settings**.
6. On either phone, open `https://<computer-wi-fi-ip>:5177` and sign in. The certificate is local-only; do not share the CA private key or use these demo credentials outside the test network.

The dashboard is responsive and can be opened on both Android and iPhone. Browser Bluetooth pairing is available only in supported browsers, such as Chrome on Android; iPhone browsers do not expose Web Bluetooth. Pair on Android by opening **Daily Vitals** or **Mission Profile**, selecting **Connect watch**, and choosing the watch in the browser prompt.

Oraimo Watch 2 Pro support is not confirmed. Direct browser pairing only reads live heart rate if the watch exposes the standard Bluetooth Heart Rate Service. The current integration does not read SpO2 or steps. Since the Oraimo app syncs with Health Connect, reading all three metrics will likely require a native Android Health Connect companion; the iPhone app can still display the dashboard but cannot use this browser Bluetooth flow.

All dashboard readings are test/demo data unless explicitly marked **Heart rate from watch**. This software is not a medical device.

## Validate

```sh
npm run build
npm run lint
```

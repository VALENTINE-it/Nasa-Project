# AURA-MED Watch Connection Guide

This document describes the current watch connection implementation, how to run it on a phone, and what to expect from an Oraimo Watch 2 Pro.

## What is implemented

The dashboard can connect from a supported browser to a Bluetooth Low Energy device that exposes the Bluetooth SIG Heart Rate Service. It subscribes to the Heart Rate Measurement characteristic and displays incoming heart-rate values in the dashboard.

The current browser integration:

- Requires **Chrome on Android** and an HTTPS page.
- Reads **heart rate only** from the standard Bluetooth Heart Rate Service.
- Does not read SpO2, steps, sleep, or other watch metrics.
- Does not currently connect to Oraimo's app, Health Connect, Google Fit, or a watch manufacturer's cloud.
- Keeps watch readings in the active browser session; it does not send them to or save them in the backend.

If a device connects but does not expose the standard heart-rate service, the app can report that Bluetooth is connected while continuing to show demo readings. A Bluetooth connection by itself does not mean that live measurements are available.

## Start the application for Android testing

Use a private Wi-Fi network shared by the computer and Android phone. The computer must allow the phone to reach its local ports.

1. In a terminal, start the Go API:

   ```sh
   cd backend
   go run .
   ```

   The API listens on port `8080`.

2. In a second terminal, start the mobile HTTPS frontend:

   ```sh
   cd frontend
   npm install
   npm run dev:https
   ```

   The script creates or refreshes local development certificates, prints the computer's private Wi-Fi IP and the certificate fingerprint, then starts the dashboard on port `5177` and certificate downloads on port `5178`. The certificate files are generated under `frontend/.certs/` and are excluded from Git. Keep that directory private, especially `ca-key.pem`.

3. On Android, open the CA download URL printed by the script:

   ```text
   http://<computer-wi-fi-ip>:5178/ca.cer
   ```

   Install the downloaded certificate using the Android security settings. Android setting names differ by version and device; look under **Security** or **Security & privacy** for certificate installation. Compare the certificate fingerprint printed in the computer terminal before trusting it. A locally installed CA is only for this development setup; do not install certificates from untrusted sources.

4. On the phone, open:

   ```text
   https://<computer-wi-fi-ip>:5177
   ```

   Sign in with an account shown by the app's demo login screen.

5. In **Daily Vitals** or **Mission Profile**, choose **Connect watch** / **Pair smartwatch**. Select the watch in Chrome's Bluetooth picker and allow the connection.

6. Check the connection status and the **Heart-rate service** status. The dashboard can use a live reading only after it detects the service and receives a measurement. Its watch-source badge indicates that the service was detected; wait for a watch measurement before treating the number as live. Other displayed values remain simulated.

To stop the local servers, stop each terminal process (for example, press Ctrl+C in the terminal where it is running).

## iPhone note

The local HTTPS setup also serves an iOS configuration profile at:

```text
http://<computer-wi-fi-ip>:5178/install.mobileconfig
```

After downloading it, install it from **Settings → Profile Downloaded** (or **General → VPN & Device Management**) and follow the device prompts. If iOS requires it, enable certificate trust under **Settings → General → About → Certificate Trust Settings**.

Installing this profile only establishes trust for the local development HTTPS certificate. **It does not enable Bluetooth pairing.** iPhone browsers do not support the Web Bluetooth connection used by this dashboard, so use Chrome on Android for direct browser-to-watch testing.

## Oraimo Watch 2 Pro status

In the reported test, Chrome connected to a device named `oraimo Watch 2 Pro_4ED7`, but the dashboard reported that it did not expose the standard Bluetooth heart-rate service. In that state, the dashboard cannot read the watch's heart rate, and the readings remain demo data. Repeating the same browser pairing is not expected to make measurements available.

Possible routes to investigate:

1. **Check for data sharing.** Look in the Oraimo app for a Health Connect or other health-data sharing option. If the watch data actually appears in Health Connect, a future native Android companion could request permission to read it and pass permitted readings to the dashboard. This companion and backend ingestion path are not implemented yet.
2. **Check for an official integration or export.** If Oraimo offers a documented API or data export for this model, the application could potentially integrate with it. No such integration is currently configured.
3. **Use a compatible sensor.** A heart-rate strap or watch that documents the standard Bluetooth Heart Rate Service can be tested with the existing Chrome-on-Android flow. Confirm its supported services before purchase or implementation.
4. **Investigate a proprietary Bluetooth protocol only as a last resort.** Reverse-engineering a vendor-specific protocol is device- and firmware-dependent and may be unreliable. It is not part of this application.

## Troubleshooting

- **The browser says Bluetooth is unavailable:** Use Chrome on Android, not iPhone Safari or iPhone Chrome, and open the dashboard over the `https://` URL.
- **The page is not trusted or will not load:** Confirm that the Android CA certificate was installed, the IP in the URL matches the current script output, and both devices are on the same private Wi-Fi. The Wi-Fi IP can change; rerun the setup and use its latest output.
- **The phone cannot reach the page:** Check local network isolation and the computer firewall for ports `5177` and `5178`.
- **The watch does not appear in the picker:** Keep it powered on and nearby, ensure Bluetooth is enabled, and follow the watch's pairing instructions. Some devices expose BLE services only while worn or while a measurement screen is active.
- **It says connected but data is still demo:** Check whether **Heart-rate service** says **Available**. If it says **Not detected**, the device does not expose the service this integration reads. The Oraimo Watch 2 Pro test above had this result.
- **Heart rate is live but other values look simulated:** This is expected. Only the standard heart-rate measurement is implemented; SpO2, steps, and other values remain demo data.

All readings are for software testing, not medical use. Do not rely on this dashboard for diagnosis, treatment, or emergency decisions.

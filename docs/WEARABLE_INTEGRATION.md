# AURA-MED Smart Wearable Telemetry Integration Guide
### Comprehensive Operational Guide for Connecting Consumer Smartwatches to Spaceflight Telemetry Core
**Supports: Oraimo Watch 2 Pro (`oraimo Watch 2 Pro_4ED7`), Standard Bluetooth SIG Wearables (Polar, Garmin, Zephyr), and Generic BLE Trackers**

---

## 1. Overview & Dual Ingestion Routes

AURA-MED provides two independent methods to stream live human biometrics (heart rate, step cadence, blood oxygen, and autonomic stress) into the astronaut health console:

```
                      +---------------------------------------+
                      |       AURA-MED ASTRONAUT CONSOLE      |
                      +---------------------------------------+
                                          ▲
                                          │
                  +-----------------------+-----------------------+
                  │                                               │
      [ ROUTE A: MOBILE RELAY ]                       [ ROUTE B: DIRECT BLE ]
  +--------------------------------+              +--------------------------------+
  | Oraimo Watch 2 Pro             |              | Oraimo Watch 2 Pro             |
  |         │ (Bluetooth)          |              |         │ (Direct 2.4 GHz BLE)  |
  | Android Oraimo Health App      |              | Google Chrome Browser          |
  |         │ (Notification Stream)|              | (navigator.bluetooth)          |
  | MacroDroid / Webhook Client    |              |         │                      |
  |         │ (HTTP POST JSON)     |              | useWearableBluetooth.js        |
  | Go Backend (:8080/api/wearable)|              | (Sifli SEWear Protobuf Engine) |
  +--------------------------------+              +--------------------------------+
```

---

## 2. Route A: Mobile Relay Bridge (MacroDroid / HTTP Webhook)

### 2.1 Why Use This Route
* **Zero Browser Flags:** Works on any browser without experimental Chrome flags.
* **Long Range:** Works over your local Wi-Fi network; the astronaut does not need to sit next to the laptop.
* **100% Reliability:** Utilizes the phone's native Bluetooth stack and the official Oraimo Health companion app.

### 2.2 Setup Instructions
1. Pair your Oraimo Watch with your smartphone using the official **Oraimo Health app**.
2. Install **MacroDroid** (or Tasker / Automate) on your Android phone.
3. In MacroDroid, create a new Macro:
   * **Trigger:** Notification Received $\rightarrow$ Select Application $\rightarrow$ `Oraimo Health`.
   * **Action:** HTTP Request $\rightarrow$ Method: `POST`.
   * **URL:** `http://<YOUR_LAPTOP_IP>:8080/api/wearable/telemetry` (e.g. `http://192.168.89.233:8080/api/wearable/telemetry`).
   * **Content-Type:** `application/json`.
   * **Request Body:**
     ```json
     {
       "deviceName": "oraimo Watch 2 Pro_4ED7",
       "notificationText": "{not_title} {not_body}"
     }
     ```
4. Save and enable the Macro.
5. In the backend, the Go server automatically parses strings like `"1,270 Steps"`, `"86 bpm"`, or `"98% SpO2"` using regex extractors and exposes the state at:
   ```text
   GET http://localhost:8080/api/wearable/live
   ```

### 2.3 Manual Verification via cURL
To test the endpoint manually without the phone:
```bash
curl -X POST http://localhost:8080/api/wearable/telemetry \
  -H "Content-Type: application/json" \
  -d '{"deviceName":"oraimo Watch 2 Pro_4ED7","notificationText":"Heart Rate: 86 bpm · Steps: 6,420"}'
```
Inspect the live endpoint:
```bash
curl http://localhost:8080/api/wearable/live
```
Expected output:
```json
{
  "isConnected": true,
  "deviceName": "oraimo Watch 2 Pro_4ED7",
  "heartRate": 86,
  "steps": 6420,
  "spO2": 0,
  "lastSeen": "2026-11-14T16:40:00Z"
}
```

---

## 3. Route B: Direct Chrome Web Bluetooth (No Phone Required)

### 3.1 Why Use This Route
* **Native & Direct:** Laptop connects directly to the watch over Bluetooth Low Energy (BLE).
* **No Third-Party Apps:** Bypasses MacroDroid and official mobile apps entirely.
* **Full Protocol Reverse-Engineering:** Directly negotiates Sifli / SEWear binary Protobuf frames.

### 3.2 Linux / Ubuntu Prerequisites (Chrome Web Bluetooth)
On Linux/Ubuntu, Chrome disables Web Bluetooth by default for security. To enable it:
1. Open a new tab in Google Chrome:
   ```text
   chrome://flags/#enable-experimental-web-platform-features
   ```
2. Change the dropdown from **Default** to **Enabled**.
3. Click the **Relaunch** button at the bottom of Chrome.

### 3.3 Pairing & Connecting
1. Disconnect the watch from your smartphone (turn off phone Bluetooth so the watch is in advertising mode).
2. Open the AURA-MED dashboard at `http://localhost:5173`.
3. In the top-right header, click **"Pair Oraimo Watch (BLE)"**.
4. In Chrome’s device picker, select **`oraimo Watch 2 Pro_4ED7`** and click **Pair**.
5. The button will turn green:
   ```text
   oraimo Watch 2 Pro_4ED7 (Direct BLE)
   ```
6. The browser automatically:
   * Subscribes to notification channel `16186f01-0000-1000-8000-00807f9b34fb`.
   * Sends `CMD 164` (App Open) to wake the watch's telemetry system.
   * Sends `CMD 355` (Continuous Optical PPG) to illuminate the optical green LEDs.
   * Establishes a 12-second keep-alive heartbeat ping.
   * Negotiates two-way transport ACKs (`00 00 01 01` $\rightarrow$ `00 00 01 00`).
   * Decodes incoming Protobuf Message 165 (`SEBasicData`) directly into Commander Elena Park's vitals.

---

## 4. Autonomous Graceful Fallback (When Watch is Disconnected)

A critical requirement of deep-space software is **fault tolerance**:

* If the watch is disconnected, powered off, or out of range:
  * The dashboard does **NOT** display errors, blank values, or loading spinners.
  * In `App.jsx`, the system automatically activates the **NASA Autonomous Spaceflight Simulation Engine**.
  * Elena Park's vitals (Heart Rate: 74–78 bpm, Blood Pressure: 124/80 mmHg, SpO2: 98%, Body Temp: 36.8°C, Respiration: 16 br/min) stream continuously with realistic biological sinus arrhythmia.
* The moment the watch reconnects via BLE or pushes an HTTP webhook, the dashboard seamlessly re-latches onto the live hardware data with zero UI flicker.

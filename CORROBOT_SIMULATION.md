# CorroBot — VOLTIX engineering simulation

This document accompanies the **CorroBot — ESP32-CAM rust-detection robot** circuit preset in VOLTIX.

## Load the circuit

Direct launch: [Open CorroBot in VOLTIX](https://ebramsameh.github.io/VOLTIX-Simulator/?example=corrobot). The preset is also available in the **Load an example** selector.

1. Open [VOLTIX Simulator](https://ebramsameh.github.io/VOLTIX-Simulator/).
2. Open **Load an example** and choose **CorroBot — ESP32-CAM rust-detection robot**.
3. The circuit is placed on the **ESP32-CAM** board profile.
4. Select the battery and set its voltage to **11.1 V** for nominal operation. Use **12.6 V** only to represent a fully charged 3S pack.
5. Select the LM2596 model and verify its regulated output is set to **5.0 V** if that property is exposed by the current model.
6. Save the loaded circuit with **Save to cloud**. Sign in when prompted and confirm the save message. The repository preset itself is not automatically a private Firestore project.

## Components in the preset

- ESP32-CAM AI Thinker board profile
- Generic VOLTIX DC supply used as the 3S battery source (set it to 11.1 V)
- LM2596 adjustable buck converter
- L298N dual H-bridge module
- Two independent DC motors
- SG90-compatible hobby servo model
- DHT11 temperature/humidity sensor

The preset reuses VOLTIX's existing component catalogue and connection graph. The battery is currently represented by the generic adjustable DC supply artwork/model; it is **not yet a dedicated 3S pack model**. The LM2596, L298N, servo, DHT11, and motor components also retain the simulation fidelity of their existing VOLTIX models.

## Wiring graph

### Main battery path
- Battery + → LM2596 IN+
- Battery + → L298N VS
- Battery − → LM2596 IN−
- Battery − → L298N GND

### Regulated 5 V and logic
- LM2596 OUT+ → L298N 5V
- LM2596 OUT− → L298N GND
- ESP32-CAM 5V → L298N 5V
- ESP32-CAM GND → L298N GND

These are connections to the **same regulated 5 V and common-ground nets**, not separate supplies. Do not connect two independent 5 V regulator outputs together.

### Motors and controls
- ESP32-CAM GPIO13 → L298N IN1
- ESP32-CAM GPIO12 → L298N IN2
- ESP32-CAM GPIO15 → L298N IN3
- ESP32-CAM GPIO14 → L298N IN4
- L298N OUT1/OUT2 → Motor A terminals
- L298N OUT3/OUT4 → Motor B terminals

Install both L298N enable jumpers (ENA and ENB). The L298N 5V-regulator-enable jumper must be **removed** when the module logic rail is supplied by the external LM2596. The jumper positions are documentation-only in this preset; they are not physical switchable objects in the current circuit model.

### Servo and DHT11
- ESP32-CAM GPIO3 → SG90 signal
- Regulated 5 V (L298N 5V net) → SG90 VCC
- Common GND → SG90 GND
- ESP32-CAM 3.3V → DHT11 VCC
- ESP32-CAM GPIO2 → DHT11 DATA
- Common GND → DHT11 GND

The servo is not powered from 3.3 V. The DHT11 is powered from 3.3 V.

## Firmware pin map

| Function | Firmware pin |
|---|---:|
| L298N IN1 | GPIO13 |
| L298N IN2 | GPIO12 |
| L298N IN3 | GPIO15 |
| L298N IN4 | GPIO14 |
| SG90 signal | GPIO3 |
| DHT11 DATA | GPIO2 |
| Onboard flash LED | GPIO4 |

The firmware mapping above is the preset's selected mapping. An earlier alternate mapping listed GPIO14, GPIO15, GPIO12, GPIO13 for IN1–IN4. That alternate order is **not** used here.

### Camera pin reservation

The camera signals are onboard connections, not external parts:

| Camera signal | GPIO |
|---|---:|
| D0–D7 | 5, 18, 19, 21, 36, 39, 34, 35 |
| XCLK | 0 |
| PCLK | 22 |
| VSYNC | 25 |
| HREF | 23 |
| SIOD / SIOC | 26 / 27 |
| PWDN | 32 |
| RESET | -1 (not connected) |

These camera pins must not be reassigned to external devices. The current VOLTIX ESP32-CAM board profile exposes the external GPIO subset used by the preset; it does not draw every internal camera trace as a separate wire.

## Firmware reference

The actual CorroBot Arduino firmware source was not attached with this request. For that reason, this preset does **not** invent or replace the firmware. Paste the supplied project firmware into the code editor when available.

The firmware documentation should include these endpoints:

| Endpoint | Intended role |
|---|---|
| / | Main control webpage |
| /cmd | Manual motor commands |
| /flash | Onboard flash LED control |
| /servo | Servo position |
| /tracking | Automatic tracking enable/disable |
| /trackstatus | Tracking status |
| /estop | Emergency stop |
| /capture | Capture camera image |
| /ws | Receive AI detection information |
| /stream | Camera stream |

The simulation preset does not run the actual camera stream, Wi-Fi access point, HTTP server, WebSocket AI client, or YOLO model. Those functions remain firmware/hardware integration work.

## Tracking parameters supplied in the project brief

| Parameter | Value |
|---|---:|
| STOP_SIZE | 0.47 |
| STOP_MARGIN | 0.03 |
| DEADZONE | 0.15 |
| MIN_CONF | 0.55 |
| TARGET_TIMEOUT | 400 ms |
| MANUAL_TIMEOUT | 1500 ms |
| STREAM_DELAY_MS | 60 ms |

The described tracking behavior is: stop when no valid detection is available or confidence is below the minimum; turn when the target is outside the horizontal dead zone; move forward when centered and too far away; move backward when too close; stop in the target-size range; and adjust the camera servo from vertical target position. This is a firmware behavior specification, not an implemented AI controller in this preset.

## Electrical and engineering review checklist

- [ ] Set battery source to 11.1 V nominal (12.6 V maximum fully charged).
- [ ] Verify LM2596 output is 5.0 V before connecting the 5 V rail.
- [ ] Verify battery polarity and the LM2596 IN+/IN− and OUT+/OUT− terminals.
- [ ] Verify L298N VS is on raw battery voltage; its 5V terminal is on the regulated logic rail.
- [ ] Remove the L298N onboard 5V regulator jumper when using the external LM2596.
- [ ] Install ENA and ENB jumpers; do not connect either enable pin to battery voltage.
- [ ] Verify ESP32-CAM 5V is supplied from the regulated L298N 5V node, never raw battery.
- [ ] Verify SG90 VCC is regulated 5 V, not 3.3 V.
- [ ] Verify DHT11 VCC is 3.3 V.
- [ ] Verify every ground is on one common ground net.
- [ ] Verify the four motor-control GPIO assignments against the firmware table.
- [ ] Verify OUT1/OUT2 and OUT3/OUT4 each feed a separate motor.\n- [ ] Pump remains unconnected until its real voltage/current rating, driver, and control signal are confirmed.
- [ ] Check LM2596 current capability against ESP32-CAM peak demand plus servo current spikes. A module rating alone is not proof that the rail is adequate.
- [ ] Check the motor current, L298N dissipation, wiring, connectors, and battery protection against the actual hardware datasheets before building.

## Hardware limitations to display during review

- GPIO3 is also ESP32-CAM UART RX.
- GPIO2, GPIO12, and GPIO15 have boot-strapping considerations.
- ESP32-CAM GPIO availability is limited and camera pins are reserved.
- A servo can create current spikes and brownouts on the 5 V rail.
- The L298N has a significant voltage drop and dissipates power.
- A 3S lithium-ion pack is 11.1 V nominal and 12.6 V fully charged.
- Motor stall current and the real LM2596 current/thermal capability must be measured or verified from specifications.

## Current VOLTIX implementation boundary

The preset creates a real VOLTIX circuit graph using the existing board, component and wire systems. The current engine does not yet provide a dedicated 3S battery component, a physical jumper-state model for the L298N, a complete ESP32-CAM camera pin schematic, a hardware-accurate LM2596 current/thermal model, or a CorroBot-specific firmware/AI runtime, or a pump driver/control circuit. A rendered component must not be interpreted as proof that its full physical behavior is simulated.

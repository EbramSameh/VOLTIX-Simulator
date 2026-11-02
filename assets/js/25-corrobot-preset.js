/* CorroBot prototype wiring preset for VOLTIX.
   The LM2596 is shown as a schematic-only four-pin block; its conversion is not simulated. */
(function () {
  PT.buck = ['LM2596 buck converter', 'Power', 'DC', 'IN+ IN- OUT+ OUT-', 'buck'];
  EXN.corrobot = 'CorroBot — ESP32-CAM + L298N + DHT11 + servo';
  EX.corrobot = {
    bt: 'cam',
    P: 'bat 250 35 11.1,buck 500 35,l298 770 35,mot 1080 35,mot 1080 260,servo 500 330,dht11 770 350',
    W: [
      'p1:+>p2:IN+',
      'p1:->p2:IN-',
      'p1:->p2:OUT-',
      'p1:+>p3:VS',
      'p1:->p3:GND',
      'p2:OUT+>p3:5V',
      'p2:OUT+>b:5V',
      'p2:OUT->b:GND',
      'p2:OUT+>p6:VCC',
      'p2:OUT->p6:GND',
      'b:3V3>p7:VCC',
      'b:GND>p7:GND',
      'b:G2>p7:DATA',
      'b:G3>p6:SIG',
      'b:G14>p3:IN1',
      'b:G15>p3:IN2',
      'b:G12>p3:IN3',
      'b:G13>p3:IN4',
      'p3:OUT1>p4:+',
      'p3:OUT2>p4:-',
      'p3:OUT3>p5:+',
      'p3:OUT4>p5:-'
    ].join(','),
    c: `// CorroBot pin map — ESP32-CAM AI Thinker
const int IN1 = 14;
const int IN2 = 15;
const int IN3 = 12;
const int IN4 = 13;
const int DHT_PIN = 2;
const int SERVO_PIN = 3;

void setup() {
  pinMode(IN1, OUTPUT);
  pinMode(IN2, OUTPUT);
  pinMode(IN3, OUTPUT);
  pinMode(IN4, OUTPUT);
  Serial.begin(115200);
}

void loop() {
  // Motor and sensor control is handled by the prototype firmware.
  // This preset documents the physical pin connections.
  delay(1000);
}`
  };

  window.addEventListener('load', function () {
    const params = new URLSearchParams(window.location.search);
    if (params.get('example') !== 'corrobot') return;
    const simButton = document.querySelector('[data-go="sim"]');
    if (simButton) simButton.click();
    loadEx('corrobot');
    toast('CorroBot schematic loaded. Review the LM2596 and power notes before wiring hardware.');
  });
})();
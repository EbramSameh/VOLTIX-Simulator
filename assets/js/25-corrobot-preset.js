/* CorroBot research-project preset. Uses VOLTIX's existing component and wire models. */
(function () {
  EXN.corrobot = 'CorroBot — ESP32-CAM rust-detection robot';
  const exampleSelect = document.getElementById('ex');
  if (exampleSelect && !exampleSelect.querySelector('option[value="corrobot"]')) {
    const option = document.createElement('option');
    option.value = 'corrobot';
    option.textContent = EXN.corrobot;
    exampleSelect.appendChild(option);
  }
  EX.corrobot = {
    bt: 'cam',
    P: 'bat 170 80 11.1,lm2596 410 70,l298 720 90,mot 1040 190,mot 1040 430,servo 430 370,dht11 180 390,pump 1060 650',
    W: [
      'p1:+>p2:IN+',
      'p1:+>p3:VS',
      'p1:->p2:IN-',
      'p1:->p3:GND',
      'p2:OUT+>p3:5V',
      'p2:OUT->p3:GND',
      'b:5V>p3:5V',
      'b:GND>p3:GND',
      'b:G13>p3:IN1',
      'b:G12>p3:IN2',
      'b:G15>p3:IN3',
      'b:G14>p3:IN4',
      'p3:OUT1>p4:+',
      'p3:OUT2>p4:-',
      'p3:OUT3>p5:+',
      'p3:OUT4>p5:-',
      'p3:5V>p6:VCC',
      'p3:GND>p6:GND',
      'b:G3>p6:SIG',
      'b:3V3>p7:VCC',
      'b:G2>p7:DATA',
      'b:GND>p7:GND'
    ].join(','),
    c: `// CorroBot — AI Thinker ESP32-CAM
// Wiring preset only. The exact project firmware source was not attached.
// Firmware GPIO map: IN1=13, IN2=12, IN3=15, IN4=14, SERVO=3, DHT11=2.
// GPIO4 controls the onboard flash LED. Camera signals are onboard/reserved.
// Wi-Fi AP: CorroBot. Paste the supplied firmware here when available.`
  };

  window.addEventListener('load', function () {
    const params = new URLSearchParams(window.location.search);
    if (params.get('example') !== 'corrobot') return;
    const simButton = document.querySelector('[data-go="sim"]');
    if (simButton) simButton.click();
    loadEx('corrobot');
    toast('CorroBot wiring preset loaded. Check the engineering notes and power warnings.');
  });
})();
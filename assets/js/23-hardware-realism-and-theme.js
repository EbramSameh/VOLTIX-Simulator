/* VOLTIX hardware realism pass: module pinouts, communication helpers and theme persistence. */
(()=>{
 if(typeof PT!=='undefined'){
  Object.assign(PT,{
   dht22:['DHT22 bare sensor','Sensors','💧','VCC DATA NC GND','dht'],
   dht11:['DHT11 bare sensor','Sensors','💧','VCC DATA NC GND','dht'],
   mpu6050:['MPU-6050 breakout','Sensors','','VCC GND SCL SDA INT AD0 FSYNC 3V3','i2c'],
   bmp280:['BMP280 breakout','Sensors','','VCC GND SCL SDA CSB SDO','i2c'],
   bme280:['BME280 breakout','Sensors','','VCC GND SCL SDA CSB SDO','vis'],
   sht31:['SHT31 breakout','Sensors','','VCC GND SCL SDA ADDR ALERT','vis'],
   vl53:['VL53L0X distance','Sensors','','VCC GND SCL SDA XSHUT GPIO1','vis'],
   tcs:['TCS34725 colour','Sensors','','VCC GND SCL SDA INT LED','vis'],
   apds:['APDS9960 gesture','Sensors','','VCC GND SCL SDA INT','vis'],
   qmc:['QMC5883L compass','Sensors','','VCC GND SCL SDA DRDY','vis'],
   mpu9250:['MPU-9250 9-axis IMU','Sensors','','VCC GND SCL SDA AD0 INT FSYNC','vis'],
   ds18:['DS18B20 temperature','Sensors','','GND DQ VCC','vis'],
   hx711:['HX711 load-cell amplifier','Sensors','','VCC GND DT SCK E+ E- A+ A-','vis'],
   rtc:['DS3231 real-time clock','Storage and time','','VCC GND SCL SDA SQW 32K','vis'],
   ads:['ADS1115 ADC','Analog and data','','VCC GND SCL SDA ADDR ALRT A0 A1 A2 A3','vis'],
   dac:['MCP4725 DAC','Analog and data','','VCC GND SCL SDA OUT','vis'],
   pca:['PCA9685 16-channel PWM driver','Drivers','','VCC GND SCL SDA OE V+','vis'],
   levelshifter:['4-channel logic-level converter','Communication','','HV LV GND HV1 HV2 HV3 HV4 LV1 LV2 LV3 LV4','vis'],
   tca9548:['TCA9548A I2C multiplexer','Communication','','VCC GND SDA SCL RST A0 A1 A2 SD0 SC0 SD1 SC1 SD2 SC2 SD3 SC3 SD4 SC4 SD5 SC5 SD6 SC6 SD7 SC7','vis'],
   uartusb:['USB-to-UART adapter','Communication','','5V 3V3 GND TXD RXD DTR RTS','vis'],
   hc12:['HC-12 serial radio','Communication','','VCC GND TXD RXD SET','vis'],
   canbus:['MCP2515 CAN bus module','Communication','','VCC GND CS SCK SI SO INT CANH CANL','vis'],
   max485:['MAX485 RS-485 transceiver','Communication','','VCC RO RE DE DI GND A B','vis'],
   hc05:['HC-05 Bluetooth module','Communication','','VCC GND TXD RXD STATE EN','vis'],
   nrf:['nRF24L01+ radio module','Communication','','VCC GND CE CSN SCK MOSI MISO IRQ','vis'],
   lora:['LoRa SX1278 module','Communication','','VCC GND MISO MOSI SCK NSS RST DIO0 DIO1 DIO2','vis'],
   rfid:['RC522 RFID reader','Communication','','VCC GND SDA SCK MOSI MISO IRQ RST','vis']
  });
  if(typeof palBuild==='function')palBuild();
  if(typeof draw==='function')draw();
 }
 const body=document.body,themeOptions=['ember','ocean','violet'];
 function applyTheme(value){
  const theme=themeOptions.includes(value)?value:'ember';
  body.dataset.vxTheme=theme;
  try{localStorage.setItem('voltix-theme',theme)}catch{}
  const selector=document.querySelector('#vx-theme-select');
  if(selector&&selector.value!==theme)selector.value=theme;
  window.dispatchEvent(new CustomEvent('voltix:themechange',{detail:{theme}}));
 }
 document.addEventListener('change',event=>{if(event.target&&event.target.matches('#vx-theme-select'))applyTheme(event.target.value)});
 let saved='ember';try{saved=localStorage.getItem('voltix-theme')||'ember'}catch{}
 applyTheme(saved);
 window.VOLTIXApplyTheme=applyTheme;
})();

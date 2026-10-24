/* Wire rendering and SVG helpers. */

(()=>{const f1=(v,n=1)=>(+v).toFixed(n);
// 1. wires on top of the board, with coloured pin-end rings + hover tooltip
const pl=document.querySelector('#pl'),wl=document.querySelector('#wl');pl.after(wl);
const dw=window.drawWires,nm=r=>r[0]=='b'?r.slice(2):((S.parts.find(p=>p.id==r.split(':')[0])||{t:'?'}).t.toUpperCase()+'.'+r.split(':')[1]);
window.drawWires=function(){dw();let h='';S.wires.forEach((w,i)=>{[w.a,w.b].forEach(r=>{const q=pp(r);h+=`<circle class="pe" cx="${q.x}" cy="${q.y}" r="5.5" fill="${w.c}"/>`});
 const p=wl.querySelector(`[data-w="${i}"]`);if(p)p.insertAdjacentHTML('afterbegin',`<title>${nm(w.a)}  →  ${nm(w.b)}</title>`)});wl.insertAdjacentHTML('beforeend',h)};
// 2. sensor drivers + controls for sensors that had none
const T=(o)=>Object.entries(o).forEach(([t,[pd,pr,ms]])=>{PD[t]=pd;PR[t]=pr;MS[t]=ms;SUP[t]='Driver model: library calls return the slider values';READ[t]=p=>ms(p.st)});
T({bme280:[{temp:22,hum:45,pres:1013.25},[RG('temp','Temperature (°C)',-40,85),RG('hum','Humidity (%)',0,100),RG('pres','Pressure (hPa)',300,1100)],s=>f1(s.temp)+' °C '+f1(s.hum,0)+'%'],
sht31:[{temp:24,hum:50},[RG('temp','Temperature (°C)',-40,125),RG('hum','Humidity (%)',0,100)],s=>f1(s.temp)+' °C '+f1(s.hum,0)+'%'],
vl53:[{dist:300},[RG('dist','Distance (mm)',30,2000)],s=>s.dist+' mm'],
ds18:[{temp:25},[RG('temp','Temperature (°C)',-55,125)],s=>f1(s.temp)+' °C'],
rtc:[{},[],()=>new Date().toLocaleTimeString()],
hx711:[{w:0},[RG('w','Weight (g)',0,5000)],s=>s.w+' g'],
ads:[{a0:1.65,a1:0,a2:0,a3:0},[RG('a0','A0 (V)',0,4,.01),RG('a1','A1 (V)',0,4,.01),RG('a2','A2 (V)',0,4,.01),RG('a3','A3 (V)',0,4,.01)],s=>'A0 '+f1(s.a0,2)+' V']});
const I=t=>i2c(t),P1=t=>S.parts.find(q=>q.t==t&&pwr(q));
class Adafruit_BME280{begin(){return !!I('bme280')}readTemperature(){const p=I('bme280');return p?+p.st.temp:NaN}readHumidity(){const p=I('bme280');return p?+p.st.hum:NaN}readPressure(){const p=I('bme280');return p?p.st.pres*100:NaN}readAltitude(s=1013.25){const p=I('bme280');return p?alt(p.st.pres,s):NaN}}
class Adafruit_SHT31{begin(){return !!I('sht31')}readTemperature(){const p=I('sht31');return p?+p.st.temp:NaN}readHumidity(){const p=I('sht31');return p?+p.st.hum:NaN}}
class Adafruit_VL53L0X{begin(){return !!I('vl53')}rangingTest(m){const p=I('vl53');m.RangeMilliMeter=p?+p.st.dist:0;m.RangeStatus=p?0:4}readRange(){const p=I('vl53');return p?+p.st.dist:8190}}
class OneWire{constructor(n){this.n=n}}
class DallasTemperature{begin(){}requestTemperatures(){}getDeviceCount(){return S.parts.filter(q=>q.t=='ds18').length}getTempCByIndex(){const p=P1('ds18');return p?+p.st.temp:-127}getTempC(){return this.getTempCByIndex()}}
class RTC_DS3231{begin(){return !!I('rtc')}adjust(){}lostPower(){return false}now(){const d=new Date();return{year:()=>d.getFullYear(),month:()=>d.getMonth()+1,day:()=>d.getDate(),hour:()=>d.getHours(),minute:()=>d.getMinutes(),second:()=>d.getSeconds(),unixtime:()=>d/1000|0}}}
class HX711{begin(){}set_scale(){}tare(){}is_ready(){return true}get_units(){const p=P1('hx711');return p?+p.st.w:0}read(){return this.get_units()*420}}
class Adafruit_ADS1115{begin(){return !!I('ads')}setGain(){}readADC_SingleEnded(c){const p=I('ads');return p?Math.round(p.st['a'+c]/4.096*32767):0}computeVolts(v){return v*4.096/32767}}
const NEW={Adafruit_BME280,Adafruit_SHT31,Adafruit_VL53L0X,OneWire,DallasTemperature,RTC_DS3231,HX711,Adafruit_ADS1115,Adafruit_ADS1015:Adafruit_ADS1115,GAIN_ONE:0},om=window.mkAPI;
window.mkAPI=function(){return Object.assign(om(),NEW)};
// 3. rebuild palette thumbnails with the new art and redraw the canvas
try{palBuild();draw()}catch(e){console.warn(e)}
})();

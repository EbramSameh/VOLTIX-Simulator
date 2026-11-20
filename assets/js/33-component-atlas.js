/* VOLTIX component atlas: detailed PCB finish and integrated sensor inspector. */
(()=>{
 if(typeof drawPart!=="function"||typeof PT==="undefined")return;
 const baseDrawPart=drawPart;
 const boardKinds=new Set(["i2c","vis","sx","dig","an","dht","us","relay","neo","sd","reg","pca","step","uart","rfid","hb"]);
 const boardNames=new Set(["mpu6050","adxl345","bmp280","ina219","bme280","sht31","vl53","tcs","apds","qmc","mpu9250","rtc","ads","dac","hx711","gps","hc05","nrf","lora","max485","hc12","canbus","uartusb","rfid","sdc","npk","soil","soilc","rain","wlevel","turb","tds","mq135","ph","vsens","uvs","ecg","eeg","emg","max30","l298","tb6612","a4988","drv8825","lm2596","mt3608","relay","neo","pir","ir","flame","touch","hall","loadc","fsr","flex","tmp36","lm35","acs712","dht11","dht22","us","lcd","oled","joy","seg7","step28"]);
 const esc=s=>String(s).replace(/[&<>"]/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c]));
 function boardDetails(p,w,h){
  if(!boardKinds.has(p.k)&&!boardNames.has(p.t))return "";
  const t=p.t,cx=w/2,cy=Math.max(48,Math.min(h-38,h*.48));
  const chipW=Math.min(54,Math.max(26,w*.3)),chipH=31,x=cx-chipW/2,y=cy-chipH/2;
  const name=({mpu6050:"MPU-6050",adxl345:"ADXL345",bmp280:"BMP280",bme280:"BME280",sht31:"SHT31",ina219:"INA219",vl53:"VL53L0X",tcs:"TCS34725",apds:"APDS9960",qmc:"QMC5883",max30:"MAX30102",rtc:"DS3231",ads:"ADS1115",dac:"MCP4725",hx711:"HX711",rfid:"MFRC522",max485:"MAX485",lora:"SX1278",hc05:"HC-05"})[t]||String(t).toUpperCase();
  const traces=[
   "M12 34H"+(x-6)+"V"+(cy-5)+"H"+x,
   "M"+(w-12)+" 34H"+(x+chipW+6)+"V"+(cy-5)+"H"+(x+chipW),
   "M12 "+(h-32)+"H"+(x-6)+"V"+(cy+7)+"H"+x,
   "M"+(w-12)+" "+(h-32)+"H"+(x+chipW+6)+"V"+(cy+7)+"H"+(x+chipW),
   "M"+cx+" 12V"+(y-5)+"V"+y,"M"+cx+" "+(y+chipH)+"V"+(h-12)
  ].map(d=>'<path d="'+d+'" fill="none" stroke="#c9b56e" stroke-opacity=".55" stroke-width="1.2"/>').join("");
  const holes=[[10,10],[w-10,10],[10,h-10],[w-10,h-10]].map(q=>'<g><circle cx="'+q[0]+'" cy="'+q[1]+'" r="3.3" fill="#aeb9bf" stroke="#293940"/><path d="M'+(q[0]-1.4)+' '+(q[1]+1.4)+'L'+(q[0]+1.4)+' '+(q[1]-1.4)+'" stroke="#35434a"/></g>').join("");
  const caps=[[-15,-15,"C1"],[chipW+15,-15,"C2"],[-15,chipH+15,"R1"],[chipW+15,chipH+15,"R2"]].map(q=>'<g><rect x="'+(x+q[0]-5)+'" y="'+(y+q[1]-3)+'" width="10" height="6" rx="1" fill="#202a31" stroke="#b0b8b6" stroke-width=".7"/><text x="'+(x+q[0])+'" y="'+(y+q[1]+8)+'" text-anchor="middle" font-size="4" fill="#d7e5d9">'+q[2]+'</text></g>').join("");
  const pads=Array.from({length:Math.min(8,Math.max(4,String(PT[t]&&PT[t][3]||"").split(/[ ,|]+/).filter(Boolean).length))},(_,i)=>'<rect x="'+(14+i*(w-28)/7-2)+'" y="'+(h-13)+'" width="4" height="7" rx=".8" fill="#d5b36a" stroke="#ffe4a6" stroke-width=".4"/>').join("");
  return '<g class="vx-atlas-details" pointer-events="none">'+holes+traces+
   '<rect x="'+x+'" y="'+y+'" width="'+chipW+'" height="'+chipH+'" rx="2.5" fill="#171d23" stroke="#aab4b6"/>'+
   '<rect x="'+(x+3)+'" y="'+(y+3)+'" width="'+(chipW-6)+'" height="'+(chipH-6)+'" rx="1.5" fill="#252e35" stroke="#68747a" stroke-width=".6"/>'+
   Array.from({length:Math.max(4,Math.floor(chipW/5))},(_,i)=>'<path d="M'+(x+4+i*5)+' '+(y-3)+'v3m0 '+chipH+'v3" stroke="#c4c9c5" stroke-width=".8"/>').join("")+
   '<text x="'+cx+'" y="'+(cy+2)+'" text-anchor="middle" font-size="'+(chipW>40?5.6:4.8)+'" font-family="monospace" fill="#e3e9e8">'+esc(name)+'</text>'+caps+pads+
   '<text x="13" y="22" font-size="5" font-family="monospace" fill="#d7e8d8" letter-spacing=".5">'+esc(String(t).toUpperCase())+'</text>'+
   '<text x="'+(w-13)+'" y="22" text-anchor="end" font-size="4.5" font-family="monospace" fill="#b9d2c0">VOLTIX LAB</text></g>';
 }
 drawPart=function(p){
  const html=baseDrawPart(p);
  if(!p||!p.t||!p.k)return html;
  const w=p.w||148,h=p.h||116,marker='<rect class="pb"',at=html.indexOf(marker);
  if(at<0)return html;
  const titleAt=html.indexOf('class="t"',at);
  if(titleAt<0)return html;
  const titleEnd=html.indexOf("</text>",titleAt);
  if(titleEnd<0)return html;
  const pos=titleEnd+7;
  return html.slice(0,pos)+boardDetails(p,w,h)+html.slice(pos);
 };
 window.VOLTIXComponentAtlas={version:"1.0",style:"detailed-pcb"};
 const panel=document.getElementById("vx-sensor-panel"),inspector=document.getElementById("props");
 if(panel&&inspector&&!inspector.contains(panel)){
  const label=inspector.querySelector(".vx-inspector-controls-label");
  if(label)label.after(panel);else inspector.append(panel);
  panel.classList.add("vx-inspector-sensor-panel");
 }
 if(typeof draw==="function")draw();
})();
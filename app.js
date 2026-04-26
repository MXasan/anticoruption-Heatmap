// ── CONSTANTS ────────────────────────────────────────────────────
const colorMap={"Ta'lim":"#185FA5","Sog'liqni saqlash":"#A32D2D","Qurilish":"#854F0B","Sport":"#3B6D11","Davlat xaridlari":"#534AB7","Boshqa":"#5F5E5A"};
const badgeMap={"Ta'lim":"b-edu","Sog'liqni saqlash":"b-med","Qurilish":"b-con","Sport":"b-spt","Davlat xaridlari":"b-gov","Boshqa":"b-oth"};

const seed=[
  {sector:"Davlat xaridlari",addr:"IT Park, Toshkent",lat:41.2995,lng:69.2401,text:"Tender hujjatlari oldindan bir kompaniyaga berilmoqda.",time:Date.now()-3600000},
  {sector:"Davlat xaridlari",addr:"IT Park, Toshkent",lat:41.2998,lng:69.2408,text:"Startup grant tanlovi adolatsiz o'tkazildi.",time:Date.now()-7200000},
  {sector:"Davlat xaridlari",addr:"IT Park, Toshkent",lat:41.2991,lng:69.2395,text:"Bir xil kompaniya har doim g'olib chiqmoqda.",time:Date.now()-14400000},
  {sector:"Davlat xaridlari",addr:"IT Park, Toshkent",lat:41.3001,lng:69.2412,text:"Aloqador kompaniyalarga imtiyoz berilmoqda.",time:Date.now()-28800000},
  {sector:"Davlat xaridlari",addr:"IT Park, Toshkent",lat:41.2988,lng:69.239,text:"Shartnomalar ochiq tanlovsiz imzolanmoqda.",time:Date.now()-50000000},
  {sector:"Ta'lim",addr:"Mirzo Ulug'bek, Toshkent",lat:41.320,lng:69.290,text:"Maktabda noqonuniy to'lovlar.",time:Date.now()-86400000},
  {sector:"Ta'lim",addr:"Yunusobod, Toshkent",lat:41.336,lng:69.298,text:"Qabulda pora.",time:Date.now()-50000000},
  {sector:"Ta'lim",addr:"Shayxontohur, Toshkent",lat:41.310,lng:69.268,text:"Pul yig'ilmoqda.",time:Date.now()-20000000},
  {sector:"Sog'liqni saqlash",addr:"Registon ko'chasi, Samarqand",lat:39.654,lng:66.975,text:"Shifokorlar to'lov talab qilmoqda.",time:Date.now()-172800000},
  {sector:"Sog'liqni saqlash",addr:"Samarqand markaz",lat:39.661,lng:66.968,text:"Dori bozorda sotilmoqda.",time:Date.now()-90000000},
  {sector:"Sog'liqni saqlash",addr:"Samarqand, Toshkent ko'chasi",lat:39.648,lng:66.980,text:"Navbat sotilmoqda.",time:Date.now()-30000000},
  {sector:"Qurilish",addr:"Ark ko'chasi, Buxoro",lat:39.774,lng:64.415,text:"Hujjatlar soxtalashtirilyapti.",time:Date.now()-3600000},
  {sector:"Sport",addr:"Andijon markaz",lat:40.782,lng:72.344,text:"Sport inshootida korrupsiya.",time:Date.now()-7200000},
];

let reports=[];
try{reports=JSON.parse(localStorage.getItem('ac_v8'))||seed;}catch(e){reports=seed;}
const aiCache={};
let toastKey=null,currentKey=null,selLat=null,selLng=null,selAddr='',tmpMarker=null,sugT=null;

// ── TABS ─────────────────────────────────────────────────────────
function switchTab(id,el){
  document.querySelectorAll('.tab').forEach(t=>t.classList.remove('on'));
  document.querySelectorAll('.page').forEach(p=>p.classList.remove('on'));
  el.classList.add('on');
  document.getElementById('page-'+id).classList.add('on');
  if(id==='map')setTimeout(()=>map&&map.invalidateSize(),50);
  if(id==='rating')renderRating('all');
  if(id==='detector')runDetector();
}

// ── MAP ──────────────────────────────────────────────────────────
const map=L.map('map').setView([41.0,63.5],6);
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',{attribution:'© OpenStreetMap',maxZoom:18}).addTo(map);
document.getElementById('legend').innerHTML=Object.entries(colorMap)
  .map(([k,v])=>`<div class="legend-item"><div class="legend-bullet" style="background:${v}"></div><span class="legend-label">${k}</span></div>`).join('');

const mcg=L.markerClusterGroup({maxClusterRadius:40,iconCreateFunction:function(c){
  const n=c.getChildCount(),sz=n>8?44:n>4?38:32,bg=n>8?'#A32D2D':n>4?'#854F0B':'#185FA5';
  return L.divIcon({html:`<div style="width:${sz}px;height:${sz}px;border-radius:50%;background:${bg};border:2.5px solid white;box-shadow:0 2px 8px rgba(0,0,0,0.25);display:flex;align-items:center;justify-content:center;font-size:12px;font-weight:600;color:white">${n}</div>`,className:'',iconSize:[sz,sz],iconAnchor:[sz/2,sz/2]});
}});

function makeIcon(s){const c=colorMap[s]||'#5F5E5A';return L.divIcon({html:`<div class="mk"><div class="ring" style="background:${c}"></div><div class="core" style="background:${c}"></div></div>`,className:'',iconSize:[16,16],iconAnchor:[8,8]});}
function makeTmpIcon(){return L.divIcon({html:`<div class="mk"><div class="ring" style="background:#E24B4A"></div><div class="core" style="background:#E24B4A"></div></div>`,className:'',iconSize:[16,16],iconAnchor:[8,8]});}

function getClusters(){
  const g={};
  reports.forEach(r=>{
    const city=r.addr.split(',').slice(-1)[0].trim()||r.addr.split(',')[0].trim();
    const key=`${r.sector}||${city}`;
    if(!g[key])g[key]={sector:r.sector,city,items:[]};
    g[key].items.push(r);
  });
  Object.values(g).forEach(cl=>{cl.risk=Math.min(95,30+cl.items.length*12);});
  return g;
}

function rebuildMap(){
  mcg.clearLayers();
  const clusters=getClusters();
  reports.forEach(r=>{
    const city=r.addr.split(',').slice(-1)[0].trim()||r.addr.split(',')[0].trim();
    const key=`${r.sector}||${city}`;
    const m=L.marker([r.lat,r.lng],{icon:makeIcon(r.sector)});
    m.on('click',()=>openDetail(key));
    mcg.addLayer(m);
  });
  if(!map.hasLayer(mcg))map.addLayer(mcg);
}
rebuildMap();

setTimeout(()=>{
  const clusters=getClusters();
  const hot=Object.entries(clusters).sort((a,b)=>b[1].items.length-a[1].items.length)[0];
  if(hot&&hot[1].items.length>=3){
    toastKey=hot[0];
    const cl=hot[1];
    document.getElementById('t-title').textContent='AI shubhali joy aniqladi';
    document.getElementById('t-body').textContent=`${cl.sector} · ${cl.city}: ${cl.items.length} ta shikoyat.`;
    document.getElementById('toast').style.display='block';
    setTimeout(closeToast,7000);
  }
},1000);

function closeToast(){document.getElementById('toast').style.display='none';}
function openFromToast(){closeToast();if(toastKey)openDetail(toastKey);}

map.on('click',async function(e){
  const{lat,lng}=e.latlng;selLat=lat;selLng=lng;
  if(tmpMarker)map.removeLayer(tmpMarker);
  tmpMarker=L.marker([lat,lng],{icon:makeTmpIcon()}).addTo(map);
  document.getElementById('addr-input').value='Aniqlanmoqda...';
  document.getElementById('loc-ok').style.display='none';
  let name=null;
  try{const r=await fetch(`https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json&accept-language=uz,ru&zoom=16`);const d=await r.json();if(d&&!d.error){const a=d.address||{};const parts=[];const sp=a.amenity||a.shop||a.building||a.road||a.neighbourhood||a.suburb;if(sp)parts.push(sp);const di=a.city_district||a.district;if(di)parts.push(di);const ci=a.city||a.town||a.village;if(ci)parts.push(ci);name=parts.length?parts.slice(0,3).join(', '):d.display_name.split(',').slice(0,3).join(', ').trim();}}catch(e){}
  if(!name){try{const r2=await fetch(`https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json&accept-language=uz,ru&zoom=10`);const d2=await r2.json();const a=d2.address||{};name=(a.city||a.town||a.village||a.state||"O'zbekiston");}catch(e){name="O'zbekiston";}}
  selAddr=name;document.getElementById('addr-input').value=name;document.getElementById('loc-text').textContent=name;document.getElementById('loc-ok').style.display='block';
});

async function onAddr(val){
  clearTimeout(sugT);const box=document.getElementById('suggestions');
  if(val.length<3){box.style.display='none';return;}
  sugT=setTimeout(async()=>{try{const r=await fetch(`https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(val+' Uzbekistan')}&format=json&limit=5&accept-language=uz,ru`);const data=await r.json();if(!data.length){box.style.display='none';return;}box.innerHTML=data.map(d=>{const s=d.display_name.split(',').slice(0,3).join(', ');return`<div class="sug-item" onclick="pickSug(${d.lat},${d.lon},'${s.replace(/'/g,"\\'")}')">${s}</div>`;}).join('');box.style.display='block';}catch(e){box.style.display='none';}},400);
}
function pickSug(lat,lon,name){selLat=parseFloat(lat);selLng=parseFloat(lon);selAddr=name;document.getElementById('addr-input').value=name;document.getElementById('suggestions').style.display='none';document.getElementById('loc-text').textContent=name;document.getElementById('loc-ok').style.display='block';if(tmpMarker)map.removeLayer(tmpMarker);tmpMarker=L.marker([selLat,selLng],{icon:makeTmpIcon()}).addTo(map);map.flyTo([selLat,selLng],14,{duration:1});}
document.addEventListener('click',e=>{if(!e.target.closest('.search-wrap'))document.getElementById('suggestions').style.display='none';});

function renderFeed(){
  const clusters=getClusters();
  document.getElementById('feed').innerHTML=[...reports].sort((a,b)=>b.time-a.time).slice(0,6).map(r=>{
    const city=r.addr.split(',').slice(-1)[0].trim()||r.addr.split(',')[0].trim();
    const key=`${r.sector}||${city}`;
    return`<div class="rep-card" onclick="openDetail('${key.replace(/'/g,"\\'")}')"><div class="rc-top"><span class="badge ${badgeMap[r.sector]||'b-oth'}">${r.sector}</span><span class="rc-loc">${r.addr.split(',')[0]}</span></div><div class="rc-text">${r.text.substring(0,60)}...</div></div>`;
  }).join('');
  document.getElementById('sc').textContent=reports.length;
  document.getElementById('rc').textContent=new Set(reports.map(r=>r.addr.split(',')[0])).size;
  document.getElementById('tc').textContent=reports.filter(r=>Date.now()-r.time<86400000).length;
}
renderFeed();

async function doSubmit(useAI){
  const sector=document.getElementById('sector').value,desc=document.getElementById('desc').value;
  if(!selLat){alert('Iltimos, xaritada joy tanlang yoki manzil kiriting');return;}
  if(!sector||!desc){alert('Soha va tavsif kiriting');return;}
  document.querySelectorAll('.btn').forEach(b=>b.disabled=true);
  let official=desc;
  if(useAI){
    document.getElementById('sub-load').style.display='block';document.getElementById('sub-res').style.display='none';
    try{const res=await fetch('https://api.anthropic.com/v1/messages',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({model:'claude-sonnet-4-20250514',max_tokens:300,messages:[{role:'user',content:`Shikoyatni rasmiy huquqiy tilga o'giring. Faqat 2-3 jumla:\nSoha: ${sector}\nJoy: ${selAddr}\nShikoyat: ${desc}`}]})});const d=await res.json();official=d.content?.[0]?.text||desc;}catch(e){official=`${sector} sohasida ${selAddr} manzilida korrupsiya belgilari qayd etildi.`;}
    document.getElementById('sub-load').style.display='none';document.getElementById('sub-res-text').textContent=official;document.getElementById('sub-res').style.display='block';
  }
  const newR={sector,addr:selAddr,lat:selLat,lng:selLng,text:desc,official,time:Date.now()};
  reports.push(newR);try{localStorage.setItem('ac_v8',JSON.stringify(reports));}catch(e){}
  rebuildMap();renderFeed();
  const city=selAddr.split(',').slice(-1)[0].trim()||selAddr.split(',')[0].trim();
  const key=`${sector}||${city}`;const clusters=getClusters();
  if(clusters[key]&&clusters[key].items.length>=3&&!aiCache[key]){
    setTimeout(()=>{toastKey=key;document.getElementById('t-title').textContent='AI yangi klaster aniqladi!';document.getElementById('t-body').textContent=`${sector} · ${city}: ${clusters[key].items.length} ta shikoyat.`;document.getElementById('toast').style.display='block';setTimeout(closeToast,6000);generateSignal(key,clusters[key]);},400);
  }
  selLat=null;selLng=null;selAddr='';document.getElementById('addr-input').value='';document.getElementById('loc-ok').style.display='none';document.getElementById('sector').value='';document.getElementById('desc').value='';
  document.querySelectorAll('.btn').forEach(b=>b.disabled=false);
  if(!useAI){const f=document.getElementById('sub-res');document.getElementById('sub-res-text').textContent='✓ Xabar muvaffaqiyatli yuborildi!';f.style.borderLeftColor='#185FA5';f.style.display='block';setTimeout(()=>{f.style.display='none';f.style.borderLeftColor='#1D9E75';},3000);}
}

function openDetail(key){
  const clusters=getClusters();const cl=clusters[key];if(!cl)return;
  currentKey=key;const c=colorMap[cl.sector]||'#5F5E5A';
  document.getElementById('panel-form').classList.add('hidden');
  document.getElementById('panel-detail').classList.remove('hidden');
  document.getElementById('d-sector').textContent=cl.sector;document.getElementById('d-sector').style.color=c;
  document.getElementById('d-addr').textContent=cl.city;document.getElementById('d-count').textContent=cl.items.length;
  const rc=cl.risk>=70?'#A32D2D':cl.risk>=45?'#E8A838':'#1D9E75';
  document.getElementById('d-risk').textContent=cl.risk+'%';document.getElementById('d-risk').style.color=rc;
  document.getElementById('d-rep-lbl').textContent=`Shikoyatlar (${cl.items.length})`;
  document.getElementById('d-reports').innerHTML=cl.items.sort((a,b)=>b.time-a.time).map(r=>`<div class="ri"><div class="ri-text">${r.text}</div><div class="ri-time">${new Date(r.time).toLocaleDateString('uz-UZ')}</div></div>`).join('');
  if(cl.items.length>=3){
    document.getElementById('pd-signal').style.display='block';
    if(aiCache[key]){document.getElementById('d-sig').textContent=aiCache[key];}
    else{document.getElementById('d-sig').innerHTML='<div class="sig-load"><div class="spinner"></div>AI signal tayyorlamoqda...</div>';generateSignal(key,cl);}
  }else{document.getElementById('pd-signal').style.display='none';}
}

async function generateSignal(key,cl){
  const texts=cl.items.map((r,i)=>`${i+1}. ${r.text}`).join('\n');
  let signal='';
  try{const res=await fetch('https://api.anthropic.com/v1/messages',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({model:'claude-sonnet-4-20250514',max_tokens:400,messages:[{role:'user',content:`Antikorrupsiya organiga yuborish uchun rasmiy, qisqa (3-4 jumla) xabar tayyorlang. O'zbek tilida, rasmiy uslubda. Faqat xabarni yozing.\n\nSoha: ${cl.sector}\nHudud: ${cl.city}\nShikoyatlar: ${cl.items.length}\n\n${texts}`}]})});const d=await res.json();signal=d.content?.[0]?.text||'';}catch(e){signal=`${cl.sector} sohasida ${cl.city} hududida ${cl.items.length} ta fuqaro shikoyati qayd etildi. Tizimli korrupsiya belgilari aniqlangan. Tekshiruv tavsiya etiladi.`;}
  aiCache[key]=signal;
  if(currentKey===key)document.getElementById('d-sig').textContent=signal;
}

function closeDetail(){currentKey=null;document.getElementById('panel-detail').classList.add('hidden');document.getElementById('panel-form').classList.remove('hidden');}

// ── RATING ───────────────────────────────────────────────────────
const regionsData=[
  {name:"Toshkent shahri",   complaints:12,trust:82,trend:+2, pop:"2.8M"},
  {name:"Samarqand viloyati",complaints:8, trust:71,trend:-1, pop:"3.9M"},
  {name:"Buxoro viloyati",   complaints:15,trust:48,trend:-6, pop:"1.9M"},
  {name:"Andijon viloyati",  complaints:6, trust:74,trend:+3, pop:"3.1M"},
  {name:"Farg'ona viloyati", complaints:18,trust:35,trend:-9, pop:"3.7M"},
  {name:"Namangan viloyati", complaints:11,trust:52,trend:-2, pop:"2.7M"},
  {name:"Qashqadaryo",       complaints:22,trust:24,trend:-14,pop:"3.3M"},
  {name:"Surxondaryo",       complaints:9, trust:61,trend:+1, pop:"2.5M"},
  {name:"Xorazm viloyati",   complaints:7, trust:68,trend:+4, pop:"1.8M"},
  {name:"Navoiy viloyati",   complaints:5, trust:79,trend:+2, pop:"1.0M"},
  {name:"Jizzax viloyati",   complaints:4, trust:83,trend:+5, pop:"1.3M"},
  {name:"Sirdaryo viloyati", complaints:3, trust:88,trend:+3, pop:"0.9M"},
  {name:"Qoraqalpog'iston",  complaints:14,trust:41,trend:-7, pop:"1.9M"},
];
function tc(s){return s>=75?'#1D9E75':s>=50?'#E8A838':s>=30?'#E07820':'#A32D2D';}
function tl(s){return s>=75?'Ishonchli':s>=50?"O'rtacha":s>=30?'Xavfli':'Juda xavfli';}
function th(t){return t===0?`<span class="trend t-eq">→ 0%</span>`:t>0?`<span class="trend t-dn">↑ +${t}%</span>`:`<span class="trend t-up">↓ ${t}%</span>`;}

function renderRating(filter){
  const sorted=[...regionsData].sort((a,b)=>b.trust-a.trust);
  const worst=[...regionsData].sort((a,b)=>a.trust-b.trust);
  document.getElementById('podium').innerHTML=`
    <div class="pod-card"><div class="pod-label">🏆 Eng ishonchli</div>${sorted.slice(0,3).map((r,i)=>`<div class="pod-item"><span class="pod-rank">${i+1}</span><span class="pod-name">${r.name}</span><span class="pod-score" style="color:#1D9E75">${r.trust}%</span></div>`).join('')}</div>
    <div class="pod-card"><div class="pod-label">⚠️ Yuqori risk</div>${worst.slice(0,3).map((r,i)=>`<div class="pod-item"><span class="pod-rank">${i+1}</span><span class="pod-name">${r.name}</span><span class="pod-score" style="color:#A32D2D">${r.trust}%</span></div>`).join('')}</div>`;
  let data=filter==='high'?sorted.filter(r=>r.trust>=75):filter==='mid'?sorted.filter(r=>r.trust>=50&&r.trust<75):filter==='low'?sorted.filter(r=>r.trust<50):sorted;
  document.getElementById('rgrid').innerHTML=data.map((r,i)=>{
    const c=tc(r.trust),globalRank=sorted.findIndex(x=>x.name===r.name)+1;
    const rb=globalRank===1?'#E8A838':globalRank===2?'#9E9E9E':globalRank===3?'#CD7F32':null;
    return`<div class="rcard">${rb?`<div class="rank-pip" style="background:${rb}">${globalRank}</div>`:''}<div class="rcard-top"><div><div class="rcard-name">${r.name}</div><div class="rcard-sub">Aholi: ${r.pop}</div></div><div style="text-align:right"><div class="rcard-score" style="color:${c}">${r.trust}%</div><div class="rcard-lbl">${tl(r.trust)}</div></div></div><div class="bar-wrap"><div class="bar-fill" style="width:${r.trust}%;background:${c}"></div></div><div class="rcard-foot"><span class="rcard-complaints">Shikoyat: <b>${r.complaints}</b></span>${th(r.trend)}</div></div>`;
  }).join('');
}
function setFilter(f,btn){document.querySelectorAll('.fb').forEach(b=>b.classList.remove('on'));btn.classList.add('on');renderRating(f);}

// ── DETECTOR ─────────────────────────────────────────────────────
let detectorRan=false;
async function runDetector(){
  const clusters=getClusters();
  const hot=Object.values(clusters).filter(cl=>cl.items.length>=3).sort((a,b)=>b.items.length-a.items.length);
  const list=document.getElementById('det-list');
  if(!hot.length){list.innerHTML=`<div style="text-align:center;padding:30px;font-size:12px;color:var(--color-text-secondary)">Hozircha shubhali klaster aniqlanmadi.<br>Bir joydan 3+ shikoyat kelib tushganda AI avtomatik aniqlaydi.</div>`;return;}
  document.getElementById('det-loading').style.display='block';list.innerHTML='';
  for(const cl of hot){
    const key=`${cl.sector}||${cl.city}`;
    const risk=cl.risk;const rc=risk>=70?'#A32D2D':risk>=45?'#E8A838':'#1D9E75';
    const rl=risk>=70?'Yuqori risk':risk>=45?"O'rta risk":'Past risk';
    const card=document.createElement('div');
    card.style.cssText='border:0.5px solid var(--color-border-tertiary);border-radius:10px;overflow:hidden;margin-bottom:10px';
    card.innerHTML=`<div style="padding:10px 13px;display:flex;justify-content:space-between;align-items:center;border-bottom:0.5px solid var(--color-border-tertiary)"><div><div style="font-size:12px;font-weight:500;color:var(--color-text-primary)">${cl.sector} — ${cl.city}</div><div style="font-size:10px;color:var(--color-text-secondary);margin-top:2px">${cl.items.length} ta shikoyat · Risk: ${risk}%</div></div><span style="font-size:10px;font-weight:600;padding:3px 9px;border-radius:20px;background:${risk>=70?'#FCEBEB':risk>=45?'#FAEEDA':'#EAF3DE'};color:${rc}">${rl}</span></div><div style="padding:10px 13px"><div style="font-size:9px;font-weight:500;color:var(--color-text-secondary);text-transform:uppercase;letter-spacing:0.4px;margin-bottom:5px">🤖 AI tahlili</div><div id="det-ai-${key.replace(/[^a-z0-9]/gi,'_')}" style="font-size:11px;color:var(--color-text-secondary);line-height:1.6"><div style="display:flex;align-items:center;gap:5px;font-size:10px"><div style="width:11px;height:11px;border:1.5px solid var(--color-border-secondary);border-top-color:var(--color-text-primary);border-radius:50%;animation:spin 0.8s linear infinite;flex-shrink:0"></div>Tahlil qilinmoqda...</div></div><div style="margin-top:8px;padding:6px 8px;background:#FFF8E1;border:0.5px solid #F5D87A;border-radius:var(--border-radius-md);font-size:10px;color:#7A5C00;display:flex;align-items:center;gap:5px"><div style="width:6px;height:6px;border-radius:50%;background:#E8A838;flex-shrink:0"></div>TEST MODE — Signal tayyorlandi, yuborilmaydi</div></div>`;
    list.appendChild(card);
    const elId=`det-ai-${key.replace(/[^a-z0-9]/gi,'_')}`;
    if(aiCache[key]){document.getElementById(elId).textContent=aiCache[key];}
    else{
      const texts=cl.items.map((r,i)=>`${i+1}. ${r.text}`).join('\n');
      fetch('https://api.anthropic.com/v1/messages',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({model:'claude-sonnet-4-20250514',max_tokens:250,messages:[{role:'user',content:`Korrupsiya tahlilchisi sifatida 2 jumlada tahlil qiling. Faqat tahlilni yozing:\n\nSoha: ${cl.sector}\nJoy: ${cl.city}\nShikoyatlar:\n${texts}`}]})})
        .then(r=>r.json()).then(d=>{const t=d.content?.[0]?.text||'';aiCache[key]=t;const el=document.getElementById(elId);if(el)el.textContent=t;})
        .catch(()=>{const el=document.getElementById(elId);if(el)el.textContent=`${cl.sector} sohasida ${cl.city}da ${cl.items.length} ta o'xshash shikoyat aniqlandi. Tizimli muammo belgisi bo'lishi mumkin.`;});
    }
  }
  document.getElementById('det-loading').style.display='none';
}

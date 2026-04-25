// ── DATA ──────────────────────────────────────────────────────────────────────
const orgsData = [
  { id: 1, name: "IT Park Toshkent", sector: "Davlat xaridlari", reports: 2, trust: 91, trend: -1, city: "Toshkent" },
  { id: 2, name: "Toshkent shahar ta'lim boshqarmasi", sector: "Ta'lim", reports: 5, trust: 74, trend: -3, city: "Toshkent" },
  { id: 3, name: "1-son shahar kasalxonasi", sector: "Sog'liqni saqlash", reports: 3, trust: 68, trend: +2, city: "Toshkent" },
  { id: 4, name: "Samarqand viloyat hokimligi", sector: "Qurilish", reports: 8, trust: 47, trend: -8, city: "Samarqand" },
  { id: 5, name: "Andijon sport qo'mitasi", sector: "Sport", reports: 4, trust: 55, trend: +1, city: "Andijon" },
  { id: 6, name: "Farg'ona qurilish nazorati", sector: "Qurilish", reports: 12, trust: 28, trend: -12, city: "Farg'ona" },
  { id: 7, name: "Namangan ta'lim markazi", sector: "Ta'lim", reports: 7, trust: 38, trend: -5, city: "Namangan" },
  { id: 8, name: "Buxoro davlat xaridlari", sector: "Davlat xaridlari", reports: 9, trust: 32, trend: -7, city: "Buxoro" },
  { id: 9, name: "Toshkent sport federatsiyasi", sector: "Sport", reports: 1, trust: 85, trend: 0, city: "Toshkent" },
  { id: 10, name: "Qashqadaryo sog'liqni saqlash", sector: "Sog'liqni saqlash", reports: 14, trust: 18, trend: -15, city: "Qarshi" },
  { id: 11, name: "Xorazm viloyat ta'lim bo'limi", sector: "Ta'lim", reports: 3, trust: 62, trend: +4, city: "Urganch" },
  { id: 12, name: "Surxondaryo qurilish inspeksiyasi", sector: "Qurilish", reports: 6, trust: 41, trend: -3, city: "Termiz" },
];

let currentFilter = 'all';

function trustColor(score) {
  if (score >= 75) return '#1D9E75';
  if (score >= 50) return '#E8A838';
  if (score >= 30) return '#E07820';
  return '#A32D2D';
}

function renderRating(filter) {
  const filtered = filter === 'all' ? [...orgsData] : orgsData.filter(o => o.sector === filter);
  const sorted = [...filtered].sort((a, b) => b.trust - a.trust);

  const best3 = sorted.slice(0, 3);
  const worst3 = [...filtered].sort((a, b) => a.trust - b.trust).slice(0, 3);
  document.getElementById('podium').innerHTML = `
    <div class="podium-card">
      <h4>🏆 Eng ishonchli</h4>
      ${best3.map(o => `<div class="podium-item">
        <span class="podium-name">${o.name.length > 22 ? o.name.slice(0, 22) + '…' : o.name}</span>
        <span class="podium-score green">${o.trust}%</span>
      </div>`).join('')}
    </div>
    <div class="podium-card">
      <h4>⚠️ Yuqori risk</h4>
      ${worst3.map(o => `<div class="podium-item">
        <span class="podium-name">${o.name.length > 22 ? o.name.slice(0, 22) + '…' : o.name}</span>
        <span class="podium-score red">${o.trust}%</span>
      </div>`).join('')}
    </div>`;

  const listEl = document.getElementById('org-list');
  listEl.innerHTML = sorted.map(o => {
    const c = trustColor(o.trust);
    const trendHtml = o.trend === 0
      ? `<span class="trend trend-same">→ O'zgarishsiz</span>`
      : o.trend > 0
        ? `<span class="trend trend-down">↑ +${o.trend}%</span>`
        : `<span class="trend trend-up">↓ ${o.trend}%</span>`;
    const label = o.trust >= 75 ? 'Ishonchli' : o.trust >= 50 ? 'O\'rtacha' : o.trust >= 30 ? 'Xavfli' : 'Juda xavfli';
    return `<div class="org-card">
      <div class="org-top">
        <div class="org-left">
          <div class="org-name">${o.name}</div>
          <div class="org-sector">${o.sector} · ${o.city}</div>
        </div>
        <div class="org-right">
          <div class="trust-score" style="color:${c}">${o.trust}%</div>
          <div class="trust-label">${label}</div>
        </div>
      </div>
      <div class="bar-wrap"><div class="bar-fill" style="width:${o.trust}%;background:${c}"></div></div>
      <div class="org-meta">
        <div class="meta-item">Shikoyat: <span>${o.reports}</span></div>
        <div class="meta-item">So'nggi oy: ${trendHtml}</div>
      </div>
    </div>`;
  }).join('');
}

function filterOrgs(f, btn) {
  currentFilter = f;
  document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
  btn.classList.add('active');
  renderRating(f);
}

renderRating('all');

function switchTab(tab) {
  document.querySelectorAll('.tab').forEach((t, i) => t.classList.toggle('active', (i === 0 && tab === 'map') || (i === 1 && tab === 'rating') || (i === 2 && tab === 'ai')));
  document.getElementById('page-map').classList.toggle('active', tab === 'map');
  document.getElementById('page-rating').classList.toggle('active', tab === 'rating');
  document.getElementById('page-ai').classList.toggle('active', tab === 'ai');
  if (tab === 'map') setTimeout(() => map.invalidateSize(), 50);
  if (tab === 'ai') updateAIStats();
}

const badgeMap = { "Ta'lim": "b-edu", "Sog'liqni saqlash": "b-med", "Qurilish": "b-con", "Sport": "b-spt", "Davlat xaridlari": "b-gov", "Boshqa": "b-oth" };
const colorMap = { "Ta'lim": "#185FA5", "Sog'liqni saqlash": "#A32D2D", "Qurilish": "#854F0B", "Sport": "#3B6D11", "Davlat xaridlari": "#534AB7", "Boshqa": "#5F5E5A" };
let selLat = null, selLng = null, selAddr = '', tempMarker = null, sugTimeout = null;
let currentClusterReports = [];

const sampleReports = [
  { sector: "Ta'lim", addr: "Mirzo Ulug'bek tumani, Toshkent", lat: 41.320, lng: 69.290, text: "Maktabda noqonuniy to'lovlar.", official: "Ta'lim muassasasida noqonuniy moliyaviy majburiyatlar qayd etilgan.", time: Date.now() - 86400000 },
  { sector: "Ta'lim", addr: "Yunusobod, Toshkent", lat: 41.336, lng: 69.298, text: "Universitet qabulida pora.", official: "Oliy ta'lim muassasasida qabul jarayonida korrupsiya holatlari aniqlangan.", time: Date.now() - 50000000 },
  { sector: "Ta'lim", addr: "Shayxontohur, Toshkent", lat: 41.310, lng: 69.268, text: "Maktabda pul yig'ilmoqda.", official: "Umumta'lim muassasasida noqonuniy mablag' yig'ish holati qayd etildi.", time: Date.now() - 20000000 },
  { sector: "Sog'liqni saqlash", addr: "Registon ko'chasi, Samarqand", lat: 39.654, lng: 66.975, text: "Shifokorlar to'lov talab qilmoqda.", official: "Tibbiyot muassasasida noqonuniy to'lov undirish holatlari aniqlangan.", time: Date.now() - 172800000 },
  { sector: "Sog'liqni saqlash", addr: "Chilonzor tumani, Toshkent", lat: 41.295, lng: 69.210, text: "Kasalxonada dori yo'q.", official: "Tibbiy muassasada dori vositalarini noqonuniy tarqatish holati aniqlangan.", time: Date.now() - 10000000 },
  { sector: "Qurilish", addr: "Ark ko'chasi, Buxoro", lat: 39.774, lng: 64.415, text: "Qurilishda hujjatlar soxtalashtirilyapti.", official: "Qurilish sohasida hujjatlarni soxtalashtirish belgilari qayd etilgan.", time: Date.now() - 3600000 },
  { sector: "Davlat xaridlari", addr: "Mustaqillik ko'chasi, Namangan", lat: 41.001, lng: 71.672, text: "Tender bir kompaniyaga berilmoqda.", official: "Davlat xaridlari jarayonida raqobatni cheklash holatlari aniqlangan.", time: Date.now() - 7200000 },
];
let reports = [];
try { reports = JSON.parse(localStorage.getItem('ac_v5')) || sampleReports; } catch (e) { reports = sampleReports; }

const map = L.map('map').setView([41.0, 63.5], 6);
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', { attribution: '© OpenStreetMap', maxZoom: 18 }).addTo(map);

const clusterGroup = L.markerClusterGroup({
  zoomToBoundsOnClick: false,
  maxClusterRadius: 50,
  iconCreateFunction: function (cluster) {
    const count = cluster.getChildCount();
    const size = count > 10 ? 44 : count > 5 ? 38 : 32;
    const bg = count > 10 ? '#A32D2D' : count > 5 ? '#854F0B' : '#185FA5';
    return L.divIcon({ html: `<div style="width:${size}px;height:${size}px;border-radius:50%;background:${bg};border:2.5px solid white;box-shadow:0 2px 6px rgba(0,0,0,0.3);display:flex;align-items:center;justify-content:center;font-size:12px;font-weight:500;color:white">${count}</div>`, className: '', iconSize: [size, size], iconAnchor: [size / 2, size / 2] });
  }
});
clusterGroup.on('clusterclick', function (e) {
  const reportsList = e.layer.getAllChildMarkers().map(m => m.reportData).filter(Boolean);
  if (reportsList.length > 1) {
    showReportDetails(reportsList);
    return;
  }
});

function makeIcon(sector) { const c = colorMap[sector] || '#5F5E5A'; return L.divIcon({ html: `<div style="width:12px;height:12px;border-radius:50%;background:${c};border:2px solid white;box-shadow:0 1px 4px rgba(0,0,0,0.35)"></div>`, className: '', iconSize: [12, 12], iconAnchor: [6, 6] }); }
function makeTempIcon() { return L.divIcon({ html: `<div style="width:15px;height:15px;border-radius:50%;background:#E24B4A;border:2px solid white;box-shadow:0 1px 6px rgba(0,0,0,0.4)"></div>`, className: '', iconSize: [15, 15], iconAnchor: [7, 7] }); }
function addToCluster(r) { const m = L.marker([r.lat, r.lng], { icon: makeIcon(r.sector) }); m.reportData = r; m.on('click', () => showReportDetails(r)); clusterGroup.addLayer(m); }
reports.forEach(addToCluster);
map.addLayer(clusterGroup);

async function reverseGeocode(lat, lng) {
  try {
    const r = await fetch(`https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json&accept-language=uz,ru&zoom=16`);
    const d = await r.json();
    if (!d || d.error) return null;
    const a = d.address || {};
    const parts = [];
    const specific = a.amenity || a.shop || a.building || a.leisure || a.tourism || a.office || a.historic || a.road || a.neighbourhood || a.suburb || a.quarter;
    if (specific) parts.push(specific);
    const district = a.city_district || a.district || a.county;
    if (district) parts.push(district);
    const city = a.city || a.town || a.village || a.hamlet;
    if (city) parts.push(city);
    if (parts.length > 0) return parts.slice(0, 3).join(', ');
    return d.display_name.split(',').slice(0, 3).join(', ').trim() || null;
  } catch (e) { return null; }
}

map.on('click', async function (e) {
  const { lat, lng } = e.latlng;
  selLat = lat; selLng = lng;
  if (tempMarker) map.removeLayer(tempMarker);
  tempMarker = L.marker([lat, lng], { icon: makeTempIcon() }).addTo(map);
  const inp = document.getElementById('addr-input');
  inp.value = 'Aniqlanmoqda...';
  document.getElementById('loc-chosen').style.display = 'none';
  let name = await reverseGeocode(lat, lng);
  if (!name) {
    try { const r2 = await fetch(`https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json&accept-language=uz,ru&zoom=10`); const d2 = await r2.json(); const a = d2.address || {}; const city = a.city || a.town || a.village || a.state || a.county || ''; name = city ? `${city}, O'zbekiston` : `O'zbekiston (${lat.toFixed(3)}, ${lng.toFixed(3)})`; } catch (e) { name = `O'zbekiston (${lat.toFixed(3)}, ${lng.toFixed(3)})`; }
  }
  selAddr = name; inp.value = name;
  document.getElementById('loc-text').textContent = name;
  document.getElementById('loc-chosen').style.display = 'block';
});

async function onAddrInput(val) {
  clearTimeout(sugTimeout); const box = document.getElementById('suggestions');
  if (val.length < 3) { box.style.display = 'none'; return; }
  sugTimeout = setTimeout(async () => {
    try {
      const r = await fetch(`https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(val + ' Uzbekistan')}&format=json&limit=5&accept-language=uz,ru`); const data = await r.json();
      if (!data.length) { box.style.display = 'none'; return; }
      box.innerHTML = data.map(d => { const short = d.display_name.split(',').slice(0, 3).join(', '); return `<div class="sug-item" onclick="pickSug(${d.lat},${d.lon},'${short.replace(/'/g, "\\'").replace(/"/g, '\\"')}')">${short}</div>`; }).join('');
      box.style.display = 'block';
    } catch (e) { box.style.display = 'none'; }
  }, 400);
}
function pickSug(lat, lon, name) { selLat = parseFloat(lat); selLng = parseFloat(lon); selAddr = name; document.getElementById('addr-input').value = name; document.getElementById('suggestions').style.display = 'none'; document.getElementById('loc-text').textContent = name; document.getElementById('loc-chosen').style.display = 'block'; if (tempMarker) map.removeLayer(tempMarker); tempMarker = L.marker([selLat, selLng], { icon: makeTempIcon() }).addTo(map); map.flyTo([selLat, selLng], 14, { duration: 1 }); }
document.addEventListener('click', e => { if (!e.target.closest('.search-wrap')) document.getElementById('suggestions').style.display = 'none'; });

function renderFeed() {
  const el = document.getElementById('feed');
  const sorted = [...reports].sort((a, b) => b.time - a.time).slice(0, 5);
  el.innerHTML = sorted.map(r => `<div class="report-item"><div class="ri-top"><span class="badge ${badgeMap[r.sector] || 'b-oth'}">${r.sector}</span><span class="ri-loc">${r.addr.split(',')[0]}</span></div><div class="ri-text">${(r.official || r.text).substring(0, 70)}...</div></div>`).join('');
  document.getElementById('sc').textContent = reports.length;
  document.getElementById('rc').textContent = new Set(reports.map(r => r.addr.split(',')[0])).size;
  document.getElementById('tc').textContent = reports.filter(r => Date.now() - r.time < 86400000).length;
}
renderFeed();

async function submitReport(useAI) {
  const sector = document.getElementById('sector').value;
  const desc = document.getElementById('desc').value;
  if (!selLat) { alert('Iltimos, xaritada joy tanlang yoki manzil kiriting'); return; }
  if (!sector || !desc) { alert('Soha va tavsif kiriting'); return; }
  const btns = document.querySelectorAll('.btn'); btns.forEach(b => b.disabled = true);
  let official = desc;
  if (useAI) {
    document.getElementById('loading').style.display = 'block';
    document.getElementById('result-box').style.display = 'none';
    try { const res = await fetch('https://api.anthropic.com/v1/messages', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ model: 'claude-sonnet-4-20250514', max_tokens: 1000, messages: [{ role: 'user', content: `Quyidagi oddiy tildagi shikoyatni rasmiy, huquqiy tilga o'giring. Faqat rasmiy matnni yozing, 2-3 jumla:\n\nSoha: ${sector}\nJoy: ${selAddr}\nShikoyat: ${desc}` }] }) }); const d = await res.json(); official = d.content?.[0]?.text || desc; }
    catch (e) { official = `${sector} sohasida ${selAddr} manzilida korrupsiya belgilari qayd etildi. Tekshiruv o'tkazilishi tavsiya etiladi.`; }
    document.getElementById('loading').style.display = 'none';
    document.getElementById('result-text').textContent = official;
    document.getElementById('result-box').style.display = 'block';
  }
  const newR = { sector, addr: selAddr, lat: selLat, lng: selLng, text: desc, official, time: Date.now() };
  reports.push(newR);
  try { localStorage.setItem('ac_v5', JSON.stringify(reports)); } catch (e) { }
  if (tempMarker) map.removeLayer(tempMarker);
  addToCluster(newR); renderFeed();
  selLat = null; selLng = null; selAddr = '';
  document.getElementById('addr-input').value = ''; document.getElementById('loc-chosen').style.display = 'none';
  document.getElementById('sector').value = ''; document.getElementById('desc').value = '';
  btns.forEach(b => b.disabled = false);
  if (!useAI) { const flash = document.getElementById('result-box'); document.getElementById('result-text').textContent = '✓ Xabar muvaffaqiyatli yuborildi!'; flash.style.borderLeftColor = '#185FA5'; flash.style.display = 'block'; setTimeout(() => { flash.style.display = 'none'; flash.style.borderLeftColor = '#1D9E75'; }, 2500); }
}

function showReportDetails(report) {
  const panel = document.getElementById('report-detail');
  const titleEl = document.getElementById('detail-title');
  const metaEl = document.getElementById('detail-meta');
  const bodyEl = document.getElementById('detail-body');
  if (Array.isArray(report)) {
    currentClusterReports = report;
    titleEl.textContent = `${report.length} ta xabar shu nuqtada`;
    metaEl.textContent = report[0]?.addr || '';
    bodyEl.innerHTML = report.map((r, i) => `<button class="detail-item" onclick="showClusterItem(${i})">` +
      `<strong>${r.sector}</strong> — ${r.addr}<div class="detail-item-sub">${(r.official || r.text).substring(0, 80)}...</div></button>`
    ).join('');
  } else {
    titleEl.textContent = report.sector;
    metaEl.textContent = report.addr;
    if (currentClusterReports.length > 1) {
      bodyEl.innerHTML = `<button class="detail-return" onclick="showClusterList()">← Barcha xabarlar</button>` +
        `<div class="report-full-text">${(report.official || report.text).replace(/\n/g, '<br>')}</div>`;
    } else {
      bodyEl.innerHTML = `<div>${report.official || report.text}</div>`;
    }
  }
  panel.style.display = 'block';
  panel.scrollIntoView({ behavior: 'smooth', block: 'start' });
}
function showClusterList() {
  if (currentClusterReports.length > 1) {
    showReportDetails(currentClusterReports);
  }
}
function hideReportDetail() { document.getElementById('report-detail').style.display = 'none'; }

// ── AI HOTSPOT DETECTION ENGINE ──────────────────────────────────────────────
const AI_CONFIG = {
  TEST_MODE: true,           // TRUE = НЕ отправляем в AntiCore
  CLUSTER_RADIUS_KM: 5,     // Радиус кластеризации (км)
  MIN_REPORTS_THRESHOLD: 3,  // Минимум жалоб для hotspot (снижен для демо, в проде 10-30)
  CRITICAL_THRESHOLD: 20,    // 20+ = критический
  HIGH_THRESHOLD: 10,        // 10-19 = высокий
  MEDIUM_THRESHOLD: 3,       // 3-9 = средний
  ANTICORE_API_URL: 'https://anticore.gov.uz/api/v1/signals', // будущий API
};

let detectedHotspots = [];
let aiLogEntries = [];

function getTimeStr() {
  const now = new Date();
  return `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}:${String(now.getSeconds()).padStart(2, '0')}`;
}

function addAILog(msg, level = 'info') {
  const logEl = document.getElementById('ai-log');
  if (!logEl) return;
  const entry = document.createElement('div');
  entry.className = `ai-log-entry ai-log-${level}`;
  entry.innerHTML = `<span class="ai-log-time">${getTimeStr()}</span><span class="ai-log-msg">${msg}</span>`;
  logEl.appendChild(entry);
  logEl.scrollTop = logEl.scrollHeight;
}

function haversineDistance(lat1, lng1, lat2, lng2) {
  const R = 6371;
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLng = (lng2 - lng1) * Math.PI / 180;
  const a = Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

function clusterReports(allReports) {
  const clusters = [];
  const visited = new Set();

  for (let i = 0; i < allReports.length; i++) {
    if (visited.has(i)) continue;
    const cluster = [allReports[i]];
    visited.add(i);

    for (let j = i + 1; j < allReports.length; j++) {
      if (visited.has(j)) continue;
      const dist = haversineDistance(
        allReports[i].lat, allReports[i].lng,
        allReports[j].lat, allReports[j].lng
      );
      if (dist <= AI_CONFIG.CLUSTER_RADIUS_KM) {
        cluster.push(allReports[j]);
        visited.add(j);
      }
    }
    clusters.push(cluster);
  }
  return clusters;
}

function getSeverity(count) {
  if (count >= AI_CONFIG.CRITICAL_THRESHOLD) return { level: 'critical', label: 'KRITIK', labelUz: 'Juda xavfli' };
  if (count >= AI_CONFIG.HIGH_THRESHOLD) return { level: 'high', label: 'YUQORI', labelUz: 'Xavfli' };
  return { level: 'medium', label: "O'RTACHA", labelUz: "O'rtacha xavf" };
}

function generateAIAnalysis(cluster) {
  const location = cluster[0].addr || 'Noma\'lum hudud';
  const count = cluster.length;
  const sectors = [...new Set(cluster.map(r => r.sector))];
  const sectorStr = sectors.join(', ');
  const severity = getSeverity(count);
  const recentCount = cluster.filter(r => Date.now() - r.time < 7 * 86400000).length;
  
  const templates = [
    `${location} hududida ${count} ta shikoyat aniqlangan. Asosiy sohalar: ${sectorStr}. So'nggi 7 kunda ${recentCount} ta yangi shikoyat qayd etildi. Korrupsiya xavfi ${severity.labelUz} darajasida baholandi. Ushbu hudud tizimli monitoring ostiga olinishi tavsiya etiladi.`,
    `AI tahlili natijasida ${location} hududida ${sectorStr} sohalarida shikoyatlar kontsentratsiyasi aniqlandi. Jami ${count} ta shikoyat kelib tushgan bo'lib, ular orasida takroriy mavzular kuzatilmoqda. Statistik tahlil ushbu hududda korrupsiya risklari ${severity.labelUz} ekanligini ko'rsatmoqda.`,
    `Sun'iy intellekt ${location} hududini „${severity.label}" risk zonasi sifatida belgiladi. ${sectorStr} sohalarida jami ${count} ta fuqarolar murojaati qayd etilgan. Shikoyatlar dinamikasi tizimli muammolarning mavjudligini ko'rsatmoqda.`
  ];
  return templates[Math.floor(Math.random() * templates.length)];
}

function updateAIStats() {
  const totalEl = document.getElementById('ai-total-reports');
  const hotspotEl = document.getElementById('ai-hotspot-count');
  const riskEl = document.getElementById('ai-risk-level');
  const sentEl = document.getElementById('ai-sent-count');
  if (!totalEl) return;
  
  totalEl.textContent = reports.length;
  hotspotEl.textContent = detectedHotspots.length;
  sentEl.textContent = AI_CONFIG.TEST_MODE ? '0' : detectedHotspots.length;
  
  if (detectedHotspots.length === 0) {
    riskEl.textContent = '—';
  } else {
    const maxCount = Math.max(...detectedHotspots.map(h => h.count));
    const sev = getSeverity(maxCount);
    riskEl.textContent = sev.label;
    riskEl.style.color = sev.level === 'critical' ? '#A32D2D' : sev.level === 'high' ? '#E07820' : '#E8A838';
  }
}

function renderHotspots() {
  const listEl = document.getElementById('ai-hotspots-list');
  if (!listEl) return;
  
  if (detectedHotspots.length === 0) {
    listEl.innerHTML = `<div class="ai-empty-state">
      <div class="ai-empty-icon">✅</div>
      <div class="ai-empty-text">Hotspot aniqlanmadi</div>
      <div class="ai-empty-sub">Hozircha shikoyatlar kontsentratsiyasi chegaradan past</div>
    </div>`;
    return;
  }

  listEl.innerHTML = detectedHotspots.map((h, idx) => {
    const severity = getSeverity(h.count);
    const sectors = [...new Set(h.reports.map(r => r.sector))];
    const recentCount = h.reports.filter(r => Date.now() - r.time < 7 * 86400000).length;
    const oldestDate = new Date(Math.min(...h.reports.map(r => r.time)));
    const dateStr = oldestDate.toLocaleDateString('uz-UZ');
    
    return `<div class="ai-hotspot-card severity-${severity.level}">
      <div class="ai-hotspot-top">
        <div>
          <div class="ai-hotspot-location">📍 ${h.location}</div>
          <div class="ai-hotspot-meta">${sectors.join(' · ')} · Birinchi shikoyat: ${dateStr}</div>
        </div>
        <div class="ai-severity-badge ${severity.level}">${severity.label}</div>
      </div>
      <div class="ai-hotspot-analysis">${h.analysis}</div>
      <div class="ai-hotspot-stats">
        <div class="ai-hotspot-stat">Jami: <strong>${h.count}</strong></div>
        <div class="ai-hotspot-stat">So'nggi 7 kun: <strong>${recentCount}</strong></div>
        <div class="ai-hotspot-stat">Sohalar: <strong>${sectors.length}</strong></div>
        <div class="ai-hotspot-stat">Radius: <strong>${AI_CONFIG.CLUSTER_RADIUS_KM} km</strong></div>
      </div>
      <div class="ai-hotspot-actions">
        <button class="ai-action-btn" onclick="viewHotspotOnMap(${idx})">🗺 Xaritada ko'rish</button>
        <button class="ai-action-btn blocked" onclick="showTestModeAlert()" title="Test rejimida bu funksiya o'chirilgan">
          🚫 AntiCore'ga yuborish (test)
        </button>
      </div>
    </div>`;
  }).join('');
}

async function runAIScan() {
  const scanBtn = document.querySelector('.ai-scan-btn');
  scanBtn.classList.add('scanning');
  scanBtn.disabled = true;
  
  addAILog('AI skanerlash boshlandi...', 'ai');
  addAILog(`Jami ${reports.length} ta shikoyat tahlil qilinmoqda`, 'info');
  
  // simulate processing delay for realistic feel
  await new Promise(r => setTimeout(r, 800));
  addAILog(`Geografik klasterlash: radius=${AI_CONFIG.CLUSTER_RADIUS_KM}km`, 'info');
  
  const clusters = clusterReports(reports);
  addAILog(`${clusters.length} ta klaster aniqlandi`, 'info');
  
  await new Promise(r => setTimeout(r, 600));
  
  // filter only clusters meeting threshold
  const hotClusters = clusters.filter(c => c.length >= AI_CONFIG.MIN_REPORTS_THRESHOLD);
  
  detectedHotspots = hotClusters.map(cluster => {
    const avgLat = cluster.reduce((s, r) => s + r.lat, 0) / cluster.length;
    const avgLng = cluster.reduce((s, r) => s + r.lng, 0) / cluster.length;
    const location = cluster[0].addr.split(',').slice(0, 2).join(', ');
    const analysis = generateAIAnalysis(cluster);
    return {
      lat: avgLat,
      lng: avgLng,
      location,
      count: cluster.length,
      reports: cluster,
      analysis,
      severity: getSeverity(cluster.length)
    };
  }).sort((a, b) => b.count - a.count);
  
  await new Promise(r => setTimeout(r, 500));
  
  if (detectedHotspots.length > 0) {
    detectedHotspots.forEach(h => {
      addAILog(`🔥 HOTSPOT: ${h.location} — ${h.count} shikoyat [${h.severity.label}]`, 
        h.severity.level === 'critical' ? 'danger' : h.severity.level === 'high' ? 'warn' : 'warn');
    });
    addAILog(`AI tahlili: ${detectedHotspots.length} ta hotspot aniqlandi`, 'ai');
    
    if (AI_CONFIG.TEST_MODE) {
      addAILog('⚠️ TEST REJIM: AntiCore\'ga hech narsa yuborilmadi', 'warn');
      addAILog('Haqiqiy rejimda bu ma\'lumotlar AntiCore API\'ga yuboriladi', 'info');
    }
  } else {
    addAILog('Hotspot aniqlanmadi — shikoyatlar soni chegaradan past', 'success');
  }
  
  addAILog('Skanerlash yakunlandi ✓', 'success');
  
  renderHotspots();
  updateAIStats();
  
  scanBtn.classList.remove('scanning');
  scanBtn.disabled = false;
}

function viewHotspotOnMap(idx) {
  const h = detectedHotspots[idx];
  if (!h) return;
  switchTab('map');
  setTimeout(() => {
    map.flyTo([h.lat, h.lng], 13, { duration: 1.2 });
  }, 200);
}

function showTestModeAlert() {
  alert('⚠️ Test rejimi faol!\n\nHozircha AntiCore tizimiga ma\'lumot yuborilmaydi.\nBu funksiya faqat tayyor bo\'lganda faollashtiriladi.');
}

// Future API integration (disabled in test mode)
async function sendToAntiCore(hotspot) {
  if (AI_CONFIG.TEST_MODE) {
    console.log('[TEST MODE] AntiCore signal blocked:', hotspot);
    addAILog('⚠️ TEST: Signal bloklandi — AntiCore\'ga yuborilmadi', 'warn');
    return { success: false, reason: 'test_mode' };
  }
  
  // Real API call — only when TEST_MODE = false
  try {
    const payload = {
      type: 'ai_hotspot_detection',
      location: hotspot.location,
      coordinates: { lat: hotspot.lat, lng: hotspot.lng },
      report_count: hotspot.count,
      severity: hotspot.severity.level,
      sectors: [...new Set(hotspot.reports.map(r => r.sector))],
      ai_analysis: hotspot.analysis,
      detected_at: new Date().toISOString(),
      source: 'anticorruption_portal_v1'
    };
    
    const res = await fetch(AI_CONFIG.ANTICORE_API_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    
    if (res.ok) {
      addAILog(`✅ AntiCore'ga yuborildi: ${hotspot.location}`, 'success');
      return { success: true };
    } else {
      addAILog(`❌ AntiCore xatosi: ${res.status}`, 'danger');
      return { success: false, reason: 'api_error' };
    }
  } catch (e) {
    addAILog(`❌ Tarmoq xatosi: ${e.message}`, 'danger');
    return { success: false, reason: 'network_error' };
  }
}

// Auto-run initial stats on page load
updateAIStats();

'use strict';

const USE_LEGACY_API = false;

// -- Auth check
const rawUser = sessionStorage.getItem('ssmjUser');
if (!rawUser) { window.location.replace('login.html'); }
const CU = rawUser ? JSON.parse(rawUser) : { username: '', name: 'Pengguna', role: 'user', token: '' };

// -- API helper
async function api(method, path, body) {
  const opts = {
    method,
    headers: {
      'Content-Type': 'application/json',
      'Authorization': 'Bearer ' + CU.token
    }
  };
  if (body !== undefined) opts.body = JSON.stringify(body);
  const res = await fetch(path, opts);
  if (res.status === 401) { sessionStorage.removeItem('ssmjUser'); window.location.replace('index.html'); }
  return res;
}

// -- In-memory DB (populated from API on init)
const DB = {
  inbox: [], tempahan: [], cuti: [], eizin: [], pengguna: [],
  slipGaji: [], tuntutan: [],
  pendingCuti: [], histCuti: [], pendingEizin: [], histEizin: [],
  pendingTempahan: [], histTempahan: [],
  ruangList: [], jenisCutiList: [], jenisEizinList: []
};

// -- Colours for avatars
const ACOLORS = ['#2980b9','#27ae60','#8e44ad','#16a085','#d35400','#c0392b','#2c3e50'];
function aColor(str) { let h=0; for(let c of str) h=(h<<5)-h+c.charCodeAt(0); return ACOLORS[Math.abs(h)%ACOLORS.length]; }
function initials(name) { return name.split(' ').filter(Boolean).slice(0,2).map(w=>w[0]).join('').toUpperCase(); }

// -- Navigation
const SECTIONS = {
  'home':           { title:'Papan Pemuka',                    sub:'SSMJ Portal \u203a Utama' },
  'inisiatif':      { title:'Pengurusan Inisiatif',             sub:'Portal Inisiatif \u203a Pengurusan' },
  'laporan-inisiatif': { title:'Laporan Kemajuan',              sub:'Portal Inisiatif \u203a Laporan' },
  'aktiviti-inisiatif': { title:'Aktiviti Inisiatif',           sub:'Portal Inisiatif \u203a Aktiviti' },
  'inbox':          { title:'Peti Masuk',                      sub:'SSMJ Portal \u203a Peti Masuk' },
  'tempahan':       { title:'Tempahan',                        sub:'SSMJ Portal \u203a Tempahan' },
  'mohon-cuti':     { title:'Mohon Cuti',                      sub:'SSMJ Portal \u203a Permohonan Cuti' },
  'eizin':          { title:'E-Izin Keluar Pejabat',           sub:'SSMJ Portal \u203a E-Izin' },
  'profil':         { title:'Profil Saya',                     sub:'SSMJ Portal \u203a Profil Saya' },
  'profiler':       { title:'Profiler Kakitangan SSMJ',        sub:'SSMJ Portal \u203a Pentadbir \u203a Profiler' },
  'lulus-tempahan': { title:'Luluskan Permohonan Tempahan',    sub:'SSMJ Portal \u203a Pentadbir \u203a Kelulusan Tempahan' },
  'lulus-cuti':     { title:'Luluskan Permohonan Cuti',        sub:'SSMJ Portal \u203a Pentadbir \u203a Kelulusan Cuti' },
  'lulus-eizin':    { title:'Luluskan Keluar (E-Izin)',        sub:'SSMJ Portal \u203a Pentadbir \u203a Kelulusan E-Izin' },
  'daftar-pengguna':{ title:'Daftar Pengguna Sistem',          sub:'SSMJ Portal › Pentadbir › Daftar Pengguna' },
  'notis':          { title:'Notis & Pengumuman',              sub:'SSMJ Portal › Pentadbir › Notis' },
  'urus-pilihan':   { title:'Urus Pilihan Sistem',             sub:'SSMJ Portal › Pentadbir › Urus Pilihan' },
  'slip-gaji':      { title:'Paparan Slip Gaji',               sub:'SSMJ Portal › Kewangan › Slip Gaji' },
  'tuntutan':       { title:'Tuntutan',                        sub:'SSMJ Portal › Kewangan › Tuntutan' },
  'hr-slip-gaji':   { title:'Terbit Slip Gaji',                sub:'SSMJ Portal › HR › Jana Slip Gaji' },
  'hr-tuntutan':    { title:'Urus Tuntutan Kakitangan',        sub:'SSMJ Portal › HR › Tuntutan' },
  'hr-kepala-vot':  { title:'Kepala Vot',                      sub:'SSMJ Portal › HR › Kepala Vot' }
};

/* ── Sidebar mobile toggle ── */
function toggleSidebar() {
  document.querySelector('.sidebar').classList.toggle('sb-open');
  document.getElementById('sbOverlay').classList.toggle('open');
}
function closeSidebar() {
  document.querySelector('.sidebar').classList.remove('sb-open');
  document.getElementById('sbOverlay').classList.remove('open');
}

function goTo(sec) {
  const legacySections = new Set(['tempahan', 'mohon-cuti', 'eizin', 'slip-gaji', 'tuntutan', 'hr-kepala-vot', 'hr-slip-gaji', 'hr-tuntutan', 'notis', 'urus-pilihan', 'profiler', 'daftar-pengguna', 'lulus-cuti', 'lulus-eizin', 'lulus-tempahan']);
  if (legacySections.has(sec)) {
    sec = 'inisiatif';
  }

  document.querySelectorAll('.section').forEach(s => s.classList.remove('active'));
  const el = document.getElementById('sec-' + sec);
  if (el) el.classList.add('active');
  document.querySelectorAll('.nav-item').forEach(n => {
    n.classList.toggle('active', n.dataset.sec === sec);
  });
  const info = SECTIONS[sec] || { title: sec, sub: 'SSMJ Portal' };
  document.getElementById('topTitle').textContent = info.title;
  document.getElementById('topSub').textContent   = info.sub;
  document.getElementById('userDD').classList.remove('open');
  // Tutup sidebar apabila navigation pada mobile
  closeSidebar();
  if (sec === 'profil')          muatProfil();
  if (sec === 'notis')           renderNotisLog();
  if (sec === 'urus-pilihan')    renderUrsPilihan();
  if (sec === 'lulus-tempahan')  fetchAndRenderPendingTempahan();
  if (sec === 'lulus-cuti')      fetchAndRenderPendingCuti();
  if (sec === 'lulus-eizin')     fetchAndRenderPendingEizin();
  if (sec === 'slip-gaji')       renderSlipGaji();
  if (sec === 'tuntutan')        renderTuntutan();
  if (sec === 'hr-slip-gaji')    renderHrSlipGaji();
  if (sec === 'hr-tuntutan')     renderHrTuntutan();
  if (sec === 'hr-kepala-vot')   renderKepalaVot();
}

// -- Kemas kini gambar avatar pada chip topbar & sidebar
function setAvatarChips(avatarUrl, name) {
  ['sbAvatar', 'chipAvatar'].forEach(function(id) {
    var el = document.getElementById(id);
    if (!el) return;
    if (avatarUrl) {
      el.style.backgroundImage    = 'url(' + avatarUrl + ')';
      el.style.backgroundSize     = 'cover';
      el.style.backgroundPosition = 'center';
      el.textContent = '';
    } else {
      el.style.backgroundImage = '';
      el.textContent = initials(name || CU.name);
    }
  });
}

// -- Init (async -- fetches all data from API)
async function init() {
  const av  = initials(CU.name);
  const col = aColor(CU.name);
  ['sbAvatar','chipAvatar'].forEach(id => {
    const el = document.getElementById(id); if (el) el.textContent = av;
  });
  document.getElementById('sbName').textContent    = CU.name.split(' ').slice(0,2).join(' ');
  document.getElementById('sbDept').textContent    = CU.dept || '';
  document.getElementById('chipName').textContent  = CU.name.split(' ').slice(0,2).join(' ');
  document.getElementById('chipRole').textContent  = CU.role === 'admin' ? 'Pentadbir' : CU.role === 'hr' ? 'HR' : 'Pengguna';
  document.getElementById('wbName').textContent    = CU.name;
  document.getElementById('wbJawatan').textContent = (CU.jawatan || '') + (CU.dept ? '  |  ' + CU.dept : '');

  if (CU.role === 'admin') {
    document.getElementById('adminNav').style.display = '';
  }
  if (CU.role === 'hr' || CU.role === 'admin') {
    document.getElementById('hrNav').style.display = '';
  }
  if (CU.role === 'hr') {
    document.getElementById('kewanganNav').style.display = 'none';
  }

  const d = new Date();
  const opts = { weekday:'long', year:'numeric', month:'long', day:'numeric' };
  const dateStr = d.toLocaleDateString('ms-MY', opts);
  document.getElementById('topDate').innerHTML = '<i class="fas fa-calendar-alt"></i> ' + dateStr;
  document.getElementById('wbDate').textContent = dateStr;

  if (USE_LEGACY_API) {
  try {
    const [
      inboxRes, tempahanRes, cutiRes, eizinRes,
      penggunaRes, optionsRes
    ] = await Promise.all([
      api('GET', '/api/inbox'),
      api('GET', '/api/tempahan'),
      api('GET', '/api/cuti'),
      api('GET', '/api/eizin'),
      api('GET', '/api/pengguna'),
      api('GET', '/api/options')
    ]);

    DB.inbox    = inboxRes.ok    ? await inboxRes.json()    : [];
    DB.tempahan = tempahanRes.ok ? await tempahanRes.json() : [];
    DB.cuti     = cutiRes.ok     ? await cutiRes.json()     : [];
    DB.eizin    = eizinRes.ok    ? await eizinRes.json()    : [];
    DB.pengguna = penggunaRes.ok ? await penggunaRes.json() : [];

    // Slip gaji & tuntutan
    const [sgRes, tunRes] = await Promise.all([api('GET','/api/slip-gaji'), api('GET','/api/tuntutan')]);
    DB.slipGaji = sgRes.ok ? await sgRes.json() : [];
    DB.tuntutan = tunRes.ok ? await tunRes.json() : [];

    if (optionsRes.ok) {
      const opts2 = await optionsRes.json();
      DB.ruangList      = opts2.ruangList      || [];
      DB.jenisCutiList  = opts2.jenisCutiList  || [];
      DB.jenisEizinList = opts2.jenisEizinList || [];
    }

    if (CU.role === 'admin') {
      const [pcRes, hcRes, peRes, heRes, ptRes, htRes] = await Promise.all([
        api('GET', '/api/pending-cuti'),
        api('GET', '/api/hist-cuti'),
        api('GET', '/api/pending-eizin'),
        api('GET', '/api/hist-eizin'),
        api('GET', '/api/pending-tempahan'),
        api('GET', '/api/hist-tempahan')
      ]);
      DB.pendingCuti     = pcRes.ok ? await pcRes.json() : [];
      DB.histCuti        = hcRes.ok ? await hcRes.json() : [];
      DB.pendingEizin    = peRes.ok ? await peRes.json() : [];
      DB.histEizin       = heRes.ok ? await heRes.json() : [];
      DB.pendingTempahan = ptRes.ok ? await ptRes.json() : [];
      DB.histTempahan    = htRes.ok ? await htRes.json() : [];
    }
  } catch (err) {
    console.error('Init fetch error:', err);
    toast('Ralat sambungan ke pelayan. Sila muat semula halaman.', 'error');
  }

  const unread = DB.inbox.filter(m => !m.read).length;
  document.getElementById('sbInboxBadge').textContent = unread;
  document.getElementById('notifDot').style.display = unread > 0 ? '' : 'none';

  const myRec = DB.pengguna.find(p => p.username === CU.username);
  const homeAlert = document.getElementById('homeProfilAlert');
  if (homeAlert && myRec && !myRec.profileLengkap && CU.role !== 'admin') {
    homeAlert.style.display = 'flex';
  }

  populateSelects();
  renderAll();

  // Muatkan avatar dari profil selepas semua data sedia
  api('GET', '/api/profil').then(function(r) {
    if (!r.ok) return;
    r.json().then(function(rec) { if (rec.avatar) setAvatarChips(rec.avatar, rec.nama); });
  }).catch(function() {});

  }

  if (!USE_LEGACY_API) {
    renderHome();
    renderInitiativeReports();
  }
}

function renderAll() {
  renderHome();
  renderInbox();
  renderTempahan();
  renderCuti();
  renderEizin();
  renderProfiler();
  renderPendingCuti();
  renderPendingEizin();
  renderPendingTempahan();
  renderPengguna();
  renderNotisLog();
  renderUrsPilihan();
  renderSlipGaji();
  renderTuntutan();
  renderHrSlipGaji();
  renderHrTuntutan();
  renderKepalaVot();
}

// -- HOME / PAPAN PEMUKA
function renderHome() {
  var stPelaksanaan = document.getElementById('stPelaksanaan');
  var stT    = document.getElementById('stTempahan');
  var stC    = document.getElementById('stCuti');
  var stE    = document.getElementById('stEizin');
  var stTLbl = document.getElementById('stTempahanLbl');
  var stCLbl = document.getElementById('stCutiLbl');
  var stELbl = document.getElementById('stEizinLbl');
  var scT    = document.getElementById('scTempahan');
  var scC    = document.getElementById('scCuti');
  var scE    = document.getElementById('scEizin');

  // Pelaksanaan dikira daripada rekod permohonan aktif pengguna.
  if (stPelaksanaan) {
    stPelaksanaan.textContent = DB.tempahan.filter(function(t) {
      return t.status === 'diluluskan';
    }).length;
  }

  if (CU.role === 'admin') {
    // ── Admin: tunjuk bilangan permohonan SEMUA pengguna ─────────────────
    if (stT) stT.textContent = DB.pendingTempahan.length;
    if (stC) stC.textContent = DB.pendingCuti.length;
    if (stE) stE.textContent = DB.pendingEizin.length;

    // Tukar label kepada konteks admin
    if (stTLbl) stTLbl.textContent = 'Permohonan Tempahan Menunggu';
    if (stCLbl) stCLbl.textContent = 'Permohonan Cuti Menunggu';
    if (stELbl) stELbl.textContent = 'Permohonan E-Izin Menunggu';

    // Kad klik → ke seksyen kelulusan masing-masing
    if (scT) scT.setAttribute('onclick', "goTo('lulus-tempahan')");
    if (scC) scC.setAttribute('onclick', "goTo('lulus-cuti')");
    if (scE) scE.setAttribute('onclick', "goTo('lulus-eizin')");

    // Segar kiraan dari pelayan (latar belakang, tak blok UI)
    refreshAdminHomeCounts();

    // ── Aktiviti Terkini (Admin): senarai permohonan menunggu ────────────
    renderHomeAktivitiAdmin();
  } else {
    // ── Pengguna biasa: tunjuk data sendiri ───────────────────────────────
    const now = new Date();
    const tempahanAktif = DB.tempahan.filter(function(t) {
      if (t.status !== 'menunggu' && t.status !== 'diluluskan') return false;
      // Semak sama ada tarikh+masa tamat tempahan masih belum berlalu
      var parts = (t.tarikh || '').split('/'); // DD/MM/YYYY
      if (parts.length !== 3) return true;
      var tm = (t.tamat || '23:59').split(':').map(Number);
      var end = new Date(+parts[2], +parts[1] - 1, +parts[0], tm[0] || 23, tm[1] || 59);
      return end >= now;
    }).length;
    const cutiMenunggu  = DB.cuti.filter(function(c) { return c.status === 'menunggu'; }).length;
    const eizinMenunggu = DB.eizin.filter(function(e) { return e.status === 'menunggu'; }).length;

    if (stT) stT.textContent = tempahanAktif;
    if (stC) stC.textContent = cutiMenunggu;
    if (stE) stE.textContent = eizinMenunggu;

    if (stTLbl) stTLbl.textContent = 'Tempahan Aktif';
    if (stCLbl) stCLbl.textContent = 'Cuti Menunggu Kelulusan';
    if (stELbl) stELbl.textContent = 'E-Izin Menunggu Kelulusan';

    // Reset kad onclick ke seksyen biasa
    if (scT) scT.setAttribute('onclick', "goTo('tempahan')");
    if (scC) scC.setAttribute('onclick', "goTo('mohon-cuti')");
    if (scE) scE.setAttribute('onclick', "goTo('eizin')");

    renderHomeAktivitiUser();
  }
}

// Ambil kiraan terkini dari pelayan untuk papan pemuka admin (senyap, latar belakang)
async function refreshAdminHomeCounts() {
  try {
    const [pcRes, peRes, ptRes] = await Promise.all([
      api('GET', '/api/pending-cuti'),
      api('GET', '/api/pending-eizin'),
      api('GET', '/api/pending-tempahan')
    ]);
    if (pcRes.ok) DB.pendingCuti     = await pcRes.json();
    if (peRes.ok) DB.pendingEizin    = await peRes.json();
    if (ptRes.ok) DB.pendingTempahan = await ptRes.json();

    var stT = document.getElementById('stTempahan');
    var stC = document.getElementById('stCuti');
    var stE = document.getElementById('stEizin');
    if (stT) stT.textContent = DB.pendingTempahan.length;
    if (stC) stC.textContent = DB.pendingCuti.length;
    if (stE) stE.textContent = DB.pendingEizin.length;

    // Kemas kini badge nav juga
    var bT = document.getElementById('pendingTempahanBadge');
    var bC = document.getElementById('pendingCutiBadge');
    var bE = document.getElementById('pendingEizinBadge');
    if (bT) bT.textContent = DB.pendingTempahan.length + ' permohonan';
    if (bC) bC.textContent = DB.pendingCuti.length + ' permohonan';
    if (bE) bE.textContent = DB.pendingEizin.length + ' permohonan';
  } catch (_) { /* senyap — jangan ganggu UI */ }
}

// Aktiviti terkini untuk Admin: gabungan permohonan menunggu dari semua pengguna
function renderHomeAktivitiAdmin() {
  var el = document.getElementById('homeAktiviti');
  if (!el) return;

  var items = [];

  DB.pendingCuti.slice(0, 5).forEach(function(c) {
    items.push({
      icon: 'fa-umbrella-beach', bg: '#fef5e7', color: '#d35400',
      txt: '<strong>' + c.nama + '</strong> memohon cuti <em>' + c.jenis + '</em> — ' + c.tarikhMula + ' hingga ' + c.tarikhTamat + ' (' + c.hari + ' hari)',
      time: 'Menunggu kelulusan',
      onclick: "goTo('lulus-cuti')"
    });
  });

  DB.pendingEizin.slice(0, 5).forEach(function(e) {
    items.push({
      icon: 'fa-door-open', bg: '#fef5ec', color: '#d35400',
      txt: '<strong>' + e.nama + '</strong> memohon E-Izin keluar ke <em>' + e.destinasi + '</em> pada ' + e.tarikh,
      time: e.masaKeluar + ' – ' + e.masaBalik,
      onclick: "goTo('lulus-eizin')"
    });
  });

  DB.pendingTempahan.slice(0, 5).forEach(function(t) {
    items.push({
      icon: 'fa-calendar-check', bg: '#eaf3fb', color: 'var(--blue-lt, #2980b9)',
      txt: '<strong>' + t.nama + '</strong> menempah <em>' + t.ruang + '</em> pada ' + t.tarikh,
      time: t.mula + ' – ' + t.tamat,
      onclick: "goTo('lulus-tempahan')"
    });
  });

  // Inbox terkini admin (pengumuman yang dihantar, dll)
  DB.inbox.slice(0, 3).forEach(function(m) {
    items.push({
      icon: 'fa-envelope', bg: '#eaf3fb', color: 'var(--blue-lt, #2980b9)',
      txt: m.subject,
      time: m.date + (m.time ? ', ' + m.time : ''),
      unread: !m.read,
      onclick: 'openInbox(' + m.id + ')'
    });
  });

  if (!items.length) {
    el.innerHTML = '<div style="text-align:center;padding:32px;color:var(--muted);font-size:13px">' +
      '<i class="fas fa-check-circle" style="font-size:28px;display:block;margin-bottom:10px;opacity:.3;color:var(--green)"></i>' +
      'Tiada permohonan menunggu. Semua selesai!</div>';
    return;
  }

  el.innerHTML = items.slice(0, 8).map(function(item) {
    return '<div class="act-item" style="cursor:pointer" onclick="' + item.onclick + '">' +
      '<div class="act-icon" style="background:' + item.bg + ';flex-shrink:0">' +
        '<i class="fas ' + item.icon + '" style="color:' + item.color + '"></i>' +
      '</div>' +
      '<div style="flex:1;min-width:0">' +
        '<div class="act-txt">' + (item.unread ? '<strong>' : '') + item.txt + (item.unread ? '</strong>' : '') + '</div>' +
        '<div class="act-time" style="color:' + (item.time === 'Menunggu kelulusan' ? '#e67e22' : 'var(--muted)') + '">' +
          (item.time === 'Menunggu kelulusan' ? '<i class="fas fa-clock"></i> ' : '') + item.time +
        '</div>' +
      '</div></div>';
  }).join('');
}

// Aktiviti terkini untuk Pengguna biasa
function renderHomeAktivitiUser() {
  var el = document.getElementById('homeAktiviti');
  if (!el) return;
  var items = [];

  // Inbox: tunjuk 5 terkini
  DB.inbox.slice(0, 5).forEach(function(m) {
    var isTolak = m.subject && (m.subject.indexOf('Tolak') !== -1 || m.subject.indexOf('tolak') !== -1 || m.subject.indexOf('Ditolak') !== -1);
    var isLulus = m.subject && (m.subject.indexOf('Diluluskan') !== -1 || m.subject.indexOf('diluluskan') !== -1 || m.subject.indexOf('✅') !== -1);
    var icon, bg, color;
    if (isTolak) { icon = 'fa-times-circle'; bg = '#fdecea'; color = '#e74c3c'; }
    else if (isLulus) { icon = 'fa-check-circle'; bg = '#eafaf1'; color = 'var(--green, #27ae60)'; }
    else { icon = 'fa-bullhorn'; bg = '#eaf3fb'; color = 'var(--blue-lt, #2980b9)'; }
    items.push({ icon: icon, bg: bg, color: color, txt: m.subject, time: m.date + (m.time ? ', ' + m.time : ''), unread: !m.read, onclick: 'openInbox(' + m.id + ')' });
  });

  // Cuti menunggu
  DB.cuti.filter(function(c) { return c.status === 'menunggu'; }).slice(0, 3).forEach(function(c) {
    items.push({ icon: 'fa-clock', bg: '#fef9e7', color: '#f0a500', txt: 'Permohonan cuti <strong>' + c.jenis + '</strong> ' + c.tarikhMula + ' – ' + c.tarikhTamat, time: 'Menunggu kelulusan', onclick: "goTo('mohon-cuti')" });
  });

  // E-Izin menunggu
  DB.eizin.filter(function(e) { return e.status === 'menunggu'; }).slice(0, 3).forEach(function(e) {
    items.push({ icon: 'fa-door-open', bg: '#fef5ec', color: '#d35400', txt: 'E-Izin ke <strong>' + e.destinasi + '</strong> pada ' + e.tarikh, time: 'Menunggu kelulusan', onclick: "goTo('eizin')" });
  });

  // Tempahan menunggu
  DB.tempahan.filter(function(t) { return t.status === 'menunggu'; }).slice(0, 3).forEach(function(t) {
    items.push({ icon: 'fa-calendar-alt', bg: '#eaf3fb', color: 'var(--blue-lt, #2980b9)', txt: 'Tempahan <strong>' + t.ruang + '</strong> pada ' + t.tarikh, time: 'Menunggu kelulusan', onclick: "goTo('tempahan')" });
  });

  if (!items.length) {
    el.innerHTML = '<div style="text-align:center;padding:32px;color:var(--muted);font-size:13px"><i class="fas fa-check-circle" style="font-size:28px;display:block;margin-bottom:10px;opacity:.3;color:var(--green)"></i>Tiada aktiviti terkini.</div>';
    return;
  }
  el.innerHTML = items.map(function(item) {
    return '<div class="act-item" style="cursor:pointer" onclick="' + item.onclick + '">' +
      '<div class="act-icon" style="background:' + item.bg + ';flex-shrink:0"><i class="fas ' + item.icon + '" style="color:' + item.color + '"></i></div>' +
      '<div style="flex:1;min-width:0"><div class="act-txt">' + (item.unread ? '<strong>' : '') + item.txt + (item.unread ? '</strong>' : '') + '</div>' +
      '<div class="act-time" style="color:' + (item.time === 'Menunggu kelulusan' ? '#e67e22' : 'var(--muted)') + '">' + (item.time === 'Menunggu kelulusan' ? '<i class="fas fa-clock"></i> ' : '') + item.time + '</div></div></div>';
  }).join('');
}

// -- INBOX
function renderInbox() {
  const msgs = DB.inbox;
  const list = document.getElementById('inboxList');
  if (!msgs.length) {
    list.innerHTML = '<div style="text-align:center;padding:40px;color:var(--muted)"><i class="fas fa-inbox" style="font-size:36px;display:block;margin-bottom:12px;opacity:.4"></i>Peti masuk anda kosong.</div>';
  } else {
    list.innerHTML = msgs.map(m => `
      <div class="inbox-item ${m.read ? '' : 'unread'}" onclick="openInbox(${m.id})">
        <div class="inb-avatar" style="background:${m.color}">${m.avatar}</div>
        <div class="inb-body">
          <div class="inb-top">
            <div class="inb-sender">${m.sender}</div>
            <div class="inb-date">${m.date} &nbsp; ${m.time}</div>
          </div>
          <div class="inb-subject">${m.read ? '' : '<strong>'} ${m.subject} ${m.read ? '' : '</strong>'}</div>
          <div class="inb-preview">${m.preview}${m.image ? ' <i class="fas fa-image" style="color:var(--muted);font-size:11px"></i>' : ''}</div>
        </div>
        ${m.read ? '' : '<div class="unread-dot"></div>'}
      </div>`).join('');
  }
  const unread = msgs.filter(x => !x.read).length;
  document.getElementById('inboxCountBadge').textContent = msgs.length + ' mesej';
  document.getElementById('sbInboxBadge').textContent = unread;
  document.getElementById('notifDot').style.display = unread > 0 ? '' : 'none';
  document.getElementById('stInbox').textContent = unread;
}

async function bacaSemua() {
  const unread = DB.inbox.filter(x => !x.read);
  if (!unread.length) { toast('Semua mesej sudah dibaca.', 'info'); return; }
  await api('PUT', '/api/inbox/read-all');
  DB.inbox.forEach(m => { m.read = true; });
  renderInbox();
  toast('Semua mesej ditandakan sebagai dibaca.', 'success');
}

async function openInbox(id) {
  const m = DB.inbox.find(x => x.id === id);
  if (!m) return;
  if (!m.read) {
    m.read = true;
    await api('PUT', `/api/inbox/${id}/read`);
    renderInbox();
  }
  document.getElementById('mdInboxSubject').textContent = m.subject;
  document.getElementById('mdInboxSender').textContent  = m.sender;
  document.getElementById('mdInboxDate').textContent    = m.date;
  document.getElementById('mdInboxTime').textContent    = m.time;
  document.getElementById('mdInboxBody').textContent    = m.body;
  const imgWrap = document.getElementById('mdInboxImgWrap');
  const imgEl   = document.getElementById('mdInboxImg');
  if (m.image) { imgEl.src = m.image; imgWrap.style.display = ''; }
  else          { imgWrap.style.display = 'none'; imgEl.src = ''; }
  openModal('mdInbox');
}

// -- SLIP GAJI (Pengguna)
function renderSlipGaji() {
  const tbody = document.getElementById('slipGajiTbl');
  if (!tbody) return;
  const list = DB.slipGaji || [];
  tbody.innerHTML = list.length
    ? list.map((s, i) => `
      <tr>
        <td>${i + 1}</td>
        <td><strong>${s.bulan}</strong></td>
        <td>${s.tahun}</td>
        <td>${s.gajiPokok.toFixed(2)}</td>
        <td>${s.elaun.toFixed(2)}</td>
        <td>${s.potongan.toFixed(2)}</td>
        <td><strong style="color:#27ae60">RM ${s.gajiBersih.toFixed(2)}</strong></td>
        <td><button class="btn btn-outline btn-xs" onclick="exportSlipGajiPDF(${s.id})"><i class="fas fa-file-pdf" style="color:#c0392b"></i> Cetak</button></td>
      </tr>`).join('')
    : '<tr><td colspan="8" style="text-align:center;color:var(--muted);padding:28px">Tiada slip gaji tersedia. Slip gaji anda akan diterbitkan oleh Bahagian HR.</td></tr>';
}

// -- TUNTUTAN (Pengguna)
function renderTuntutan() {
  const tbody = document.getElementById('tuntutanTbl');
  if (!tbody) return;
  const list = DB.tuntutan || [];
  tbody.innerHTML = list.length
    ? list.map((t, i) => `
      <tr>
        <td>${i + 1}</td>
        <td>${t.tarikh}</td>
        <td>${t.jenis}</td>
        <td>RM ${t.jumlah.toFixed(2)}</td>
        <td>${t.keterangan || '-'}</td>
        <td>${statusBadge(t.status)}</td>
        <td>${t.status === 'diluluskan' ? `<button class="btn btn-outline btn-xs" onclick="exportTuntutanPDF(${t.id})"><i class="fas fa-file-pdf" style="color:#c0392b"></i> Cetak</button>` : '-'}</td>
      </tr>`).join('')
    : '<tr><td colspan="7" style="text-align:center;color:var(--muted);padding:28px">Tiada rekod tuntutan.</td></tr>';
}

async function submitTuntutan(e) {
  e.preventDefault();
  const body = {
    tarikh     : document.getElementById('tuntTarikh').value,
    jenis      : document.getElementById('tuntJenis').value,
    jumlah     : document.getElementById('tuntJumlah').value,
    keterangan : document.getElementById('tuntKeterangan').value
  };
  const res = await api('POST', '/api/tuntutan', body);
  if (!res.ok) { const d = await res.json(); toast(d.error || 'Ralat menghantar tuntutan.', 'error'); return; }
  const r2 = await api('GET', '/api/tuntutan');
  DB.tuntutan = r2.ok ? await r2.json() : DB.tuntutan;
  renderTuntutan();
  e.target.reset();
  toast('Tuntutan telah dihantar! Menunggu kelulusan HR.', 'success');
}

// ─── KEPALA VOT (HR) ──────────────────────────────────────────────────────────
// Simpan dalam localStorage supaya kekal walaupun bahagian HR baharu
function loadKepalaVot() {
  try { return JSON.parse(localStorage.getItem('ssmj_kepala_vot') || '[]'); } catch { return []; }
}
function saveKepalaVot(list) {
  localStorage.setItem('ssmj_kepala_vot', JSON.stringify(list));
}

function renderKepalaVot() {
  const all = loadKepalaVot();
  const jenisMap = { Gaji: 'kvGajiTbl', Tuntutan: 'kvTuntutanTbl', Tempahan: 'kvTempahanTbl' };
  Object.entries(jenisMap).forEach(([jenis, tbId]) => {
    const tbody = document.getElementById(tbId);
    if (!tbody) return;
    const rows = all.filter(k => k.jenis === jenis);
    tbody.innerHTML = rows.length
      ? rows.map((k, i) => `
        <tr>
          <td>${i + 1}</td>
          <td><strong>${k.kod}</strong></td>
          <td>${k.keterangan}</td>
          <td>RM ${parseFloat(k.peruntukan || 0).toFixed(2)}</td>
          <td><button class="btn btn-danger btn-xs" onclick="hapusKepalaVot(${k._id})"><i class="fas fa-trash"></i></button></td>
        </tr>`).join('')
      : `<tr><td colspan="5" style="text-align:center;color:var(--muted);padding:16px">Tiada kod peruntukan.</td></tr>`;
  });
  // Refresh dropdown Kepala Vot dalam borang slip gaji
  const sel = document.getElementById('sgKepalaVot');
  if (sel) {
    const curr = sel.value;
    sel.innerHTML = '<option value="">— Pilih Kepala Vot —</option>';
    all.filter(k => k.jenis === 'Gaji').forEach(k => {
      const opt = document.createElement('option');
      opt.value = k.kod + ' – ' + k.keterangan;
      opt.textContent = k.kod + ' – ' + k.keterangan;
      sel.appendChild(opt);
    });
    sel.value = curr;
  }
}

function submitKepalaVot(e) {
  e.preventDefault();
  const all = loadKepalaVot();
  const rec = {
    _id        : Date.now(),
    jenis      : document.getElementById('kvJenis').value,
    kod        : document.getElementById('kvKod').value.trim(),
    keterangan : document.getElementById('kvKeterangan').value.trim(),
    peruntukan : document.getElementById('kvPeruntukan').value
  };
  all.push(rec);
  saveKepalaVot(all);
  renderKepalaVot();
  e.target.reset();
  toast('Kod peruntukan ditambah.', 'success');
}

function hapusKepalaVot(id) {
  if (!confirm('Padam kod ini?')) return;
  const all = loadKepalaVot().filter(k => k._id !== id);
  saveKepalaVot(all);
  renderKepalaVot();
  toast('Kod dipadam.', 'success');
}

// -- HR: TERBIT SLIP GAJI
function populateHrSlipGajiUsers() {
  const sel = document.getElementById('sgUsername');
  if (!sel) return;
  const current = sel.value;
  sel.innerHTML = '<option value="">— Pilih Kakitangan —</option>';
  (DB.pengguna || []).filter(p => p.peranan !== 'admin').forEach(p => {
    const opt = document.createElement('option');
    opt.value = p.username;
    opt.textContent = p.nama + ' (' + p.username + ')';
    sel.appendChild(opt);
  });
  sel.value = current;
}

function renderHrSlipGaji() {
  const tbody = document.getElementById('hrSlipGajiTbl');
  if (!tbody) return;
  populateHrSlipGajiUsers();
  const list = DB.slipGaji || [];
  tbody.innerHTML = list.length
    ? list.map((s, i) => `
      <tr>
        <td>${i + 1}</td>
        <td><strong>${s.nama || s.username}</strong></td>
        <td>${s.bulan}</td>
        <td>${s.tahun}</td>
        <td>${s.kepalaVot || '-'}</td>
        <td>RM ${s.gajiPokok.toFixed(2)}</td>
        <td>RM ${s.elaun.toFixed(2)}</td>
        <td>RM ${s.potongan.toFixed(2)}</td>
        <td><strong style="color:#27ae60">RM ${s.gajiBersih.toFixed(2)}</strong></td>
        <td>
          <button class="btn btn-outline btn-xs" onclick="exportSlipGajiPDFHr(${s.id})"><i class="fas fa-file-pdf" style="color:#c0392b"></i> Cetak</button>
          <button class="btn btn-danger btn-xs" onclick="hapusSlipGaji(${s.id})" style="margin-left:4px"><i class="fas fa-trash"></i></button>
        </td>
      </tr>`).join('')
    : '<tr><td colspan="10" style="text-align:center;color:var(--muted);padding:28px">Belum ada slip gaji diterbitkan.</td></tr>';
}

async function submitSlipGaji(e) {
  e.preventDefault();
  const body = {
    username  : document.getElementById('sgUsername').value,
    bulan     : document.getElementById('sgBulan').value,
    tahun     : document.getElementById('sgTahun').value,
    kepalaVot : document.getElementById('sgKepalaVot').value,
    gajiPokok : document.getElementById('sgGajiPokok').value,
    elaun     : document.getElementById('sgElaun').value,
    potongan  : document.getElementById('sgPotongan').value,
    catatan   : document.getElementById('sgCatatan').value
  };
  const res = await api('POST', '/api/slip-gaji', body);
  if (!res.ok) { const d = await res.json(); toast(d.error || 'Ralat menerbitkan slip gaji.', 'error'); return; }
  const r2 = await api('GET', '/api/slip-gaji');
  DB.slipGaji = r2.ok ? await r2.json() : DB.slipGaji;
  renderHrSlipGaji();
  renderSlipGaji();
  e.target.reset();
  toast('Slip gaji berjaya diterbitkan! Notifikasi telah dihantar kepada kakitangan.', 'success');
}

async function hapusSlipGaji(id) {
  if (!confirm('Padam slip gaji ini?')) return;
  const res = await api('DELETE', `/api/slip-gaji/${id}`);
  if (!res.ok) { toast('Ralat memadam slip gaji.', 'error'); return; }
  DB.slipGaji = DB.slipGaji.filter(s => s.id !== id);
  renderHrSlipGaji();
  renderSlipGaji();
  toast('Slip gaji dipadam.', 'success');
}

// -- HR: URUS TUNTUTAN
function renderHrTuntutan() {
  const tbody = document.getElementById('hrTuntutanTbl');
  const badge = document.getElementById('hrTuntutanBadge');
  if (!tbody) return;
  const list = DB.tuntutan || [];
  const menunggu = list.filter(t => t.status === 'menunggu').length;
  if (badge) badge.textContent = menunggu + ' menunggu';
  tbody.innerHTML = list.length
    ? list.map((t, i) => `
      <tr>
        <td>${i + 1}</td>
        <td><strong>${t.nama || t.username}</strong></td>
        <td>${t.tarikh}</td>
        <td>${t.jenis}</td>
        <td>RM ${t.jumlah.toFixed(2)}</td>
        <td>${t.keterangan || '-'}</td>
        <td>${statusBadge(t.status)}</td>
        <td>${t.status === 'menunggu'
          ? `<button class="btn btn-warning btn-xs" onclick="bukaTuntutanAction(${t.id})"><i class="fas fa-gavel"></i> Proses</button>`
          : `<button class="btn btn-outline btn-xs" onclick="exportTuntutanPDFHr(${t.id})"><i class="fas fa-file-pdf" style="color:#c0392b"></i> Cetak</button>`
        }</td>
      </tr>`).join('')
    : '<tr><td colspan="8" style="text-align:center;color:var(--muted);padding:28px">Tiada rekod tuntutan.</td></tr>';

  // Senarai Slip Gaji di bawah senarai Tuntutan
  const slipTbl = document.getElementById('hrTuntutanSlipTbl');
  if (slipTbl) {
    const slips = DB.slipGaji || [];
    slipTbl.innerHTML = slips.length
      ? slips.map((s, i) => `
        <tr>
          <td>${i + 1}</td>
          <td><strong>${s.nama || s.username}</strong></td>
          <td>${s.bulan}</td>
          <td>${s.tahun}</td>
          <td>${s.kepalaVot || '-'}</td>
          <td>RM ${s.gajiPokok.toFixed(2)}</td>
          <td>RM ${s.elaun.toFixed(2)}</td>
          <td>RM ${s.potongan.toFixed(2)}</td>
          <td><strong style="color:#27ae60">RM ${s.gajiBersih.toFixed(2)}</strong></td>
          <td><button class="btn btn-outline btn-xs" onclick="exportSlipGajiPDFHr(${s.id})"><i class="fas fa-file-pdf" style="color:#c0392b"></i> Cetak</button></td>
        </tr>`).join('')
      : '<tr><td colspan="10" style="text-align:center;color:var(--muted);padding:16px">Belum ada slip gaji diterbitkan.</td></tr>';
  }
}

let _activeTuntutanId = null;
function bukaTuntutanAction(id) {
  _activeTuntutanId = id;
  const t = (DB.tuntutan || []).find(x => x.id === id);
  if (!t) return;
  document.getElementById('mdTuntutanInfo').innerHTML = `
    <div style="display:grid;grid-template-columns:1fr 1fr;gap:8px">
      <div><span style="color:var(--muted)">Kakitangan:</span> <strong>${t.nama || t.username}</strong></div>
      <div><span style="color:var(--muted)">Tarikh:</span> ${t.tarikh}</div>
      <div><span style="color:var(--muted)">Jenis:</span> ${t.jenis}</div>
      <div><span style="color:var(--muted)">Jumlah:</span> <strong style="color:#27ae60">RM ${t.jumlah.toFixed(2)}</strong></div>
      <div style="grid-column:1/-1"><span style="color:var(--muted)">Keterangan:</span> ${t.keterangan || '-'}</div>
    </div>`;
  document.getElementById('mdTuntutanAlasan').value = '';
  openModal('mdTuntutanAction');
}

async function prosesTuntutan(status) {
  const alasan = document.getElementById('mdTuntutanAlasan').value.trim();
  const res = await api('PUT', `/api/tuntutan/${_activeTuntutanId}/status`, { status, alasan });
  if (!res.ok) { toast('Ralat memproses tuntutan.', 'error'); return; }
  const r2 = await api('GET', '/api/tuntutan');
  DB.tuntutan = r2.ok ? await r2.json() : DB.tuntutan;
  renderHrTuntutan();
  renderTuntutan();
  closeModal('mdTuntutanAction');
  toast(status === 'diluluskan' ? 'Tuntutan diluluskan.' : 'Tuntutan ditolak.', status === 'diluluskan' ? 'success' : 'error');
}

// ─── PDF: SLIP GAJI ───────────────────────────────────────────────────────────
function pdfSlipGajiTemplate(s, namaPenuh) {
  const bersih = s.gajiBersih || (s.gajiPokok + s.elaun - s.potongan);
  return pdfHeader() + `
    <div style="text-align:center;margin-bottom:18px">
      <div style="font-size:13pt;font-weight:800;color:#1a3c6e;letter-spacing:.5px;text-transform:uppercase">PENYATA GAJI</div>
      <div style="font-size:10pt;color:#555;margin-top:4px">${s.bulan} ${s.tahun}</div>
    </div>

    <table class="info" style="margin-bottom:18px">
      <tr><td>Nama</td><td><strong>${namaPenuh || s.username}</strong></td></tr>
      <tr><td>No. Staf</td><td>${s.noStaf || '-'}</td></tr>
      <tr><td>Jawatan</td><td>${s.jawatan || '-'}</td></tr>
      <tr><td>Jabatan</td><td>${s.jabatan || '-'}</td></tr>
      <tr><td>Tempoh Gaji</td><td>1 ${s.bulan} ${s.tahun} – Akhir ${s.bulan} ${s.tahun}</td></tr>
    </table>

    <table style="width:100%;border-collapse:collapse;margin-bottom:18px">
      <thead>
        <tr style="background:#1a3c6e;color:#fff">
          <th style="padding:8px 12px;text-align:left;border:1px solid #ccc">Perkara</th>
          <th style="padding:8px 12px;text-align:right;border:1px solid #ccc">Jumlah (RM)</th>
        </tr>
      </thead>
      <tbody>
        <tr style="background:#f9f9f9">
          <td style="padding:8px 12px;border:1px solid #ccc">Gaji Pokok</td>
          <td style="padding:8px 12px;text-align:right;border:1px solid #ccc">${s.gajiPokok.toFixed(2)}</td>
        </tr>
        <tr>
          <td style="padding:8px 12px;border:1px solid #ccc">Elaun</td>
          <td style="padding:8px 12px;text-align:right;border:1px solid #ccc">+ ${s.elaun.toFixed(2)}</td>
        </tr>
        <tr style="background:#fff0f0">
          <td style="padding:8px 12px;border:1px solid #ccc">Potongan</td>
          <td style="padding:8px 12px;text-align:right;border:1px solid #ccc;color:#c0392b">- ${s.potongan.toFixed(2)}</td>
        </tr>
        <tr style="background:#e8f8f5;font-weight:800">
          <td style="padding:10px 12px;border:2px solid #27ae60;font-size:11pt">GAJI BERSIH</td>
          <td style="padding:10px 12px;text-align:right;border:2px solid #27ae60;font-size:11pt;color:#27ae60">RM ${bersih.toFixed(2)}</td>
        </tr>
      </tbody>
    </table>

    ${s.catatan ? `<div class="nota"><strong>Catatan:</strong> ${s.catatan}</div>` : ''}

    <div style="margin-top:10px;font-size:9pt;color:#888;text-align:center">
      Dokumen ini dijanakan secara automatik oleh Portal SSMJ. Sebarang pertanyaan sila hubungi Bahagian HR.
    </div>
  ` + pdfFooter('SG-' + s.id);
}

function exportSlipGajiPDF(id) {
  const s = (DB.slipGaji || []).find(x => x.id === id);
  if (!s) { toast('Rekod tidak ditemui.', 'error'); return; }
  cetakPDF(pdfSlipGajiTemplate(s, CU.name));
}

function exportSlipGajiPDFHr(id) {
  const s = (DB.slipGaji || []).find(x => x.id === id);
  if (!s) { toast('Rekod tidak ditemui.', 'error'); return; }
  const pengguna = (DB.pengguna || []).find(p => p.username === s.username);
  cetakPDF(pdfSlipGajiTemplate(s, pengguna ? pengguna.nama : s.username));
}

// ─── PDF: TUNTUTAN ────────────────────────────────────────────────────────────
function pdfTuntutanTemplate(t, namaPenuh) {
  return pdfHeader() + `
    <div style="text-align:center;margin-bottom:18px">
      <div style="font-size:13pt;font-weight:800;color:#1a3c6e;letter-spacing:.5px;text-transform:uppercase">SURAT KELULUSAN TUNTUTAN</div>
      <div style="font-size:10pt;color:#555;margin-top:4px">No. Rujukan: TUN-${t.id}</div>
    </div>

    <p>Dengan hormatnya perkara di atas adalah dirujuk.</p>
    <p>Sukacita dimaklumkan bahawa tuntutan tuan/puan adalah seperti berikut dan <strong>telah diluluskan</strong>:</p>

    <table class="info">
      <tr><td>No. Rujukan</td><td>TUN-${t.id}</td></tr>
      <tr><td>Nama Pemohon</td><td><strong>${namaPenuh || t.username}</strong></td></tr>
      <tr><td>Jenis Tuntutan</td><td>${t.jenis}</td></tr>
      <tr><td>Tarikh Tuntutan</td><td>${t.tarikh}</td></tr>
      <tr><td>Keterangan</td><td>${t.keterangan || '-'}</td></tr>
      <tr><td>Jumlah Tuntutan</td><td><strong style="color:#27ae60">RM ${t.jumlah.toFixed(2)}</strong></td></tr>
      <tr><td>Status</td><td><strong>✅ DILULUSKAN</strong></td></tr>
      ${t.alasan ? `<tr><td>Catatan HR</td><td>${t.alasan}</td></tr>` : ''}
      ${t.diprosesBy ? `<tr><td>Diproses Oleh</td><td>${t.diprosesBy}</td></tr>` : ''}
    </table>

    <div class="nota">
      Pembayaran tuntutan ini akan diproses mengikut prosedur kewangan yang berkuatkuasa. Sebarang pertanyaan bolehlah dikemukakan kepada Bahagian HR/Kewangan.
    </div>

    <p>Sekian, terima kasih atas kerjasama tuan/puan.</p>
    <p><em>"Berkhidmat Untuk Negara"</em></p>
  ` + pdfFooter('TUN-' + t.id);
}

function exportTuntutanPDF(id) {
  const t = (DB.tuntutan || []).find(x => x.id === id);
  if (!t) { toast('Rekod tidak ditemui.', 'error'); return; }
  cetakPDF(pdfTuntutanTemplate(t, CU.name));
}

function exportTuntutanPDFHr(id) {
  const t = (DB.tuntutan || []).find(x => x.id === id);
  if (!t) { toast('Rekod tidak ditemui.', 'error'); return; }
  const pengguna = (DB.pengguna || []).find(p => p.username === t.username);
  cetakPDF(pdfTuntutanTemplate(t, pengguna ? pengguna.nama : t.username));
}

// -- SLIP GAJI (old placeholder replaced — keep this comment as boundary marker)

// -- TEMPAHAN
function renderTempahan() {
  const tbody = document.getElementById('tempahanTbl');
  tbody.innerHTML = DB.tempahan.map((t,i) => `
    <tr>
      <td>${i+1}</td>
      <td><strong>${t.ruang}</strong></td>
      <td>${t.tarikh}</td>
      <td>${t.mula} - ${t.tamat}</td>
      <td>${t.tujuan}</td>
      <td>${t.bilangan || '-'} orang</td>
      <td>${statusBadge(t.status)}</td>
      <td>${t.status === 'diluluskan' ? `<button class="btn btn-outline btn-xs" onclick="exportTempahanPDFUser(${t.id})"><i class="fas fa-file-pdf" style="color:#c0392b"></i> PDF</button>` : '-'}</td>
    </tr>`).join('') || '<tr><td colspan="8" style="text-align:center;color:var(--muted);padding:24px">Tiada rekod tempahan.</td></tr>';
}

async function submitTempahan(e) {
  e.preventDefault();
  const body = {
    ruang    : document.getElementById('tRuang').value,
    tarikh   : document.getElementById('tTarikh').value,
    mula     : document.getElementById('tMula').value,
    tamat    : document.getElementById('tTamat').value,
    tujuan   : document.getElementById('tTujuan').value,
    bilangan : document.getElementById('tBilangan').value
  };
  const res = await api('POST', '/api/tempahan', body);
  if (!res.ok) { const d = await res.json(); toast(d.error || 'Ralat menghantar tempahan.', 'error'); return; }
  const r2 = await api('GET', '/api/tempahan');
  DB.tempahan = r2.ok ? await r2.json() : DB.tempahan;
  renderTempahan();
  e.target.reset();
  toast('Permohonan tempahan telah dihantar! Menunggu kelulusan pejabat.', 'success');
}

// -- CUTI
function renderCuti() {
  const tbody = document.getElementById('cutiTbl');
  tbody.innerHTML = DB.cuti.map((c,i) => `
    <tr>
      <td>${c.id}</td>
      <td><strong>${c.jenis}</strong></td>
      <td>${c.tarikhMula}</td>
      <td>${c.tarikhTamat}</td>
      <td>${c.hari} hari</td>
      <td>${c.pengganti}</td>
      <td style="max-width:160px;font-size:12px;color:var(--muted)">${c.sebab}</td>
      <td>${statusBadge(c.status)}</td>
      <td>${c.status === 'diluluskan' ? `<button class="btn btn-outline btn-xs" onclick="exportCutiPDFUser('${c.id}')"><i class="fas fa-file-pdf" style="color:#c0392b"></i> PDF</button>` : '-'}</td>
    </tr>`).join('') || '<tr><td colspan="9" style="text-align:center;color:var(--muted);padding:24px">Tiada rekod cuti.</td></tr>';
}

function kiraCutiHari() {
  const m = document.getElementById('cMula').value;
  const t = document.getElementById('cTamat').value;
  if (m && t) {
    const diff = (new Date(t) - new Date(m)) / 86400000 + 1;
    document.getElementById('cHari').value = diff > 0 ? diff + ' hari' : '';
  }
}

async function submitCuti(e) {
  e.preventDefault();
  const hariStr = document.getElementById('cHari').value;
  const body = {
    jenis      : document.getElementById('cJenis').value,
    pengganti  : document.getElementById('cPengganti').value,
    tarikhMula : document.getElementById('cMula').value,
    tarikhTamat: document.getElementById('cTamat').value,
    hari       : parseInt(hariStr) || 1,
    sebab      : document.getElementById('cSebab').value
  };
  const res = await api('POST', '/api/cuti', body);
  if (!res.ok) { const d = await res.json(); toast(d.error || 'Ralat menghantar permohonan cuti.', 'error'); return; }
  const r2 = await api('GET', '/api/cuti');
  DB.cuti = r2.ok ? await r2.json() : DB.cuti;
  renderCuti();
  e.target.reset();
  document.getElementById('cHari').value = '';
  toast('Permohonan cuti berjaya dihantar! Status: Menunggu kelulusan.', 'success');
}

// -- E-IZIN
function renderEizin() {
  const tbody = document.getElementById('eizinTbl');
  tbody.innerHTML = DB.eizin.map((ei,i) => `
    <tr>
      <td>${ei.id}</td>
      <td>${ei.tarikh}</td>
      <td>${ei.masaKeluar}</td>
      <td>${ei.masaBalik}</td>
      <td>${ei.jenis}</td>
      <td>${ei.destinasi}</td>
      <td>${statusBadge(ei.status)}</td>
    </tr>`).join('') || '<tr><td colspan="7" style="text-align:center;color:var(--muted);padding:24px">Tiada rekod E-Izin.</td></tr>';
}

async function submitEizin(e) {
  e.preventDefault();
  const body = {
    tarikh    : document.getElementById('eTarikh').value,
    jenis     : document.getElementById('eJenis').value,
    masaKeluar: document.getElementById('eMasaKeluar').value,
    masaBalik : document.getElementById('eMasaBalik').value,
    destinasi : document.getElementById('eDestinasi').value
  };
  const res = await api('POST', '/api/eizin', body);
  if (!res.ok) { const d = await res.json(); toast(d.error || 'Ralat menghantar E-Izin.', 'error'); return; }
  const r2 = await api('GET', '/api/eizin');
  DB.eizin = r2.ok ? await r2.json() : DB.eizin;
  renderEizin();
  e.target.reset();
  toast('E-Izin berjaya didaftarkan! Menunggu kelulusan pentadbir.', 'success');
}

// -- PROFILER (Admin)
function renderProfiler() {
  const q    = (document.getElementById('profilerSearch')?.value || '').toLowerCase();
  const list = DB.pengguna.filter(p =>
    (p.nama || '').toLowerCase().includes(q) ||
    (p.jawatan || '').toLowerCase().includes(q) ||
    (p.jabatan || '').toLowerCase().includes(q) ||
    (p.noStaf || '').toLowerCase().includes(q)
  );
  const grid = document.getElementById('profilerGrid');
  if (!list.length) { grid.innerHTML = '<div class="empty" style="grid-column:1/-1"><i class="fas fa-search"></i><p>Tiada profil yang sepadan dengan carian anda.</p></div>'; return; }

  grid.innerHTML = list.map(p => `
    <div class="prof-card">
      <div class="pc-avatar" style="background:${aColor(p.nama)}">${initials(p.nama)}</div>
      <div class="pc-name">${p.nama}</div>
      <div class="pc-pos">${p.jawatan || '-'}</div>
      <div class="pc-dept"><i class="fas fa-building"></i> ${p.jabatan || '-'}</div>
      <div class="pc-info">
        <div><i class="fas fa-id-badge"></i> ${p.noStaf || '-'}</div>
        <div><i class="fas fa-circle" style="color:${p.status==='aktif'?'var(--green)':'#bbb'};font-size:9px"></i> ${p.status==='aktif'?'Aktif':'Tidak Aktif'}</div>
      </div>
    </div>`).join('');
}

// -- Fetch & Render helpers (sentiasa fresh dari pelayan apabila admin buka seksyen)
async function fetchAndRenderPendingTempahan() {
  const [ptRes, htRes] = await Promise.all([
    api('GET', '/api/pending-tempahan'),
    api('GET', '/api/hist-tempahan')
  ]);
  DB.pendingTempahan = ptRes.ok ? await ptRes.json() : DB.pendingTempahan;
  DB.histTempahan    = htRes.ok ? await htRes.json() : DB.histTempahan;
  renderPendingTempahan();
}

async function fetchAndRenderPendingCuti() {
  const [pcRes, hcRes] = await Promise.all([
    api('GET', '/api/pending-cuti'),
    api('GET', '/api/hist-cuti')
  ]);
  DB.pendingCuti = pcRes.ok ? await pcRes.json() : DB.pendingCuti;
  DB.histCuti    = hcRes.ok ? await hcRes.json() : DB.histCuti;
  renderPendingCuti();
}

async function fetchAndRenderPendingEizin() {
  const [peRes, heRes] = await Promise.all([
    api('GET', '/api/pending-eizin'),
    api('GET', '/api/hist-eizin')
  ]);
  DB.pendingEizin = peRes.ok ? await peRes.json() : DB.pendingEizin;
  DB.histEizin    = heRes.ok ? await heRes.json() : DB.histEizin;
  renderPendingEizin();
}

// -- PENDING TEMPAHAN (Admin)
function renderPendingTempahan() {
  const ptbl = document.getElementById('pendingTempahanTbl');
  if (!ptbl) return;
  ptbl.innerHTML = DB.pendingTempahan.map(t => `
    <tr>
      <td><strong>${t.id}</strong></td>
      <td>${t.nama}</td>
      <td><span class="badge b-secondary">${t.noStaf}</span></td>
      <td>${t.ruang}</td>
      <td>${t.tarikh}</td>
      <td>${t.mula} - ${t.tamat}</td>
      <td>${t.tujuan}</td>
      <td>${t.bilangan || '-'}</td>
      <td>
        <button class="btn btn-success btn-xs" onclick="openApproval('tempahan',${t.id},'Luluskan Permohonan Tempahan')"><i class="fas fa-check"></i> Tindakan</button>
      </td>
    </tr>`).join('') || '<tr><td colspan="9" style="text-align:center;color:var(--muted);padding:24px">Tiada permohonan tempahan yang menunggu kelulusan.</td></tr>';

  const badge = document.getElementById('pendingTempahanBadge');
  if (badge) badge.textContent = DB.pendingTempahan.length + ' permohonan';

  const htbl = document.getElementById('histTempahanTbl');
  if (!htbl) return;
  htbl.innerHTML = DB.histTempahan.map(t => `
    <tr>
      <td>${t.id}</td><td>${t.nama}</td><td>${t.ruang}</td>
      <td>${t.tarikh}</td><td>${t.mula} - ${t.tamat}</td>
      <td>${statusBadge(t.status)}</td>
      <td style="font-size:12px;color:var(--muted)">${t.alasan || '-'}</td>
      <td>${t.status === 'diluluskan' ? `<button class="btn btn-outline btn-xs" onclick="exportTempahanPDF('${t.id}')"><i class="fas fa-file-pdf" style="color:#c0392b"></i> PDF</button>` : '-'}</td>
    </tr>`).join('') || '<tr><td colspan="8" style="text-align:center;color:var(--muted);padding:24px">Tiada rekod keputusan terdahulu.</td></tr>';
}

// -- PENDING CUTI (Admin)
function renderPendingCuti() {
  const ptbl = document.getElementById('pendingCutiTbl');
  if (!ptbl) return;
  ptbl.innerHTML = DB.pendingCuti.map(c => `
    <tr>
      <td><strong>${c.id}</strong></td>
      <td>${c.nama}</td>
      <td><span class="badge b-secondary">${c.noStaf}</span></td>
      <td>${c.jenis}</td>
      <td>${c.tarikhMula}</td>
      <td>${c.tarikhTamat}</td>
      <td>${c.hari} hari</td>
      <td style="max-width:140px;font-size:12px;color:var(--muted)">${c.sebab}</td>
      <td>${c.pengganti}</td>
      <td>
        <button class="btn btn-success btn-xs" onclick="openApproval('cuti','${c.id}','Luluskan Permohonan Cuti')"><i class="fas fa-check"></i> Tindakan</button>
      </td>
    </tr>`).join('') || '<tr><td colspan="10" style="text-align:center;color:var(--muted);padding:24px">Tiada permohonan cuti yang menunggu kelulusan.</td></tr>';

  document.getElementById('pendingCutiBadge').textContent = DB.pendingCuti.length + ' permohonan';

  const htbl = document.getElementById('histCutiTbl');
  if (!htbl) return;
  htbl.innerHTML = DB.histCuti.map(c => `
    <tr>
      <td>${c.id}</td><td>${c.nama}</td><td>${c.jenis}</td>
      <td>${c.tarikhMula} - ${c.tarikhTamat}</td>
      <td>${c.hari} hari</td>
      <td>${statusBadge(c.status)}</td>
      <td style="font-size:12px;color:var(--muted)">${c.alasan||'-'}</td>
      <td>${c.status === 'diluluskan' ? `<button class="btn btn-outline btn-xs" onclick="exportCutiPDF('${c.id}')"><i class="fas fa-file-pdf" style="color:#c0392b"></i> PDF</button>` : '-'}</td>
    </tr>`).join('') || '<tr><td colspan="8" style="text-align:center;color:var(--muted);padding:24px">Tiada rekod keputusan terdahulu.</td></tr>';
}

// -- PENDING E-IZIN (Admin)
function renderPendingEizin() {
  const ptbl = document.getElementById('pendingEizinTbl');
  if (!ptbl) return;
  ptbl.innerHTML = DB.pendingEizin.map(e => `
    <tr>
      <td><strong>${e.id}</strong></td>
      <td>${e.nama}</td>
      <td><span class="badge b-secondary">${e.noStaf}</span></td>
      <td>${e.tarikh}</td>
      <td>${e.masaKeluar}</td>
      <td>${e.masaBalik}</td>
      <td>${e.jenis}</td>
      <td>${e.destinasi}</td>
      <td>
        <button class="btn btn-success btn-xs" onclick="openApproval('eizin','${e.id}','Luluskan E-Izin Keluar')"><i class="fas fa-check"></i> Tindakan</button>
      </td>
    </tr>`).join('') || '<tr><td colspan="9" style="text-align:center;color:var(--muted);padding:24px">Tiada permohonan E-Izin yang menunggu kelulusan.</td></tr>';

  document.getElementById('pendingEizinBadge').textContent = DB.pendingEizin.length + ' permohonan';

  const htbl = document.getElementById('histEizinTbl');
  if (!htbl) return;
  htbl.innerHTML = DB.histEizin.map(e => `
    <tr>
      <td>${e.id}</td><td>${e.nama}</td><td>${e.tarikh}</td><td>${e.masaKeluar}</td>
      <td>${e.destinasi}</td>
      <td>${statusBadge(e.status)}</td>
      <td style="font-size:12px;color:var(--muted)">${e.alasan||'-'}</td>
    </tr>`).join('') || '<tr><td colspan="7" style="text-align:center;color:var(--muted);padding:24px">Tiada rekod terdahulu.</td></tr>';
}

// ── PDF EXPORT ────────────────────────────────────────────────────────────────

const SSMJ_ALAMAT = `Sekretariat Sabah Maju Jaya,\nBlok A, Tingkat 15, Jabatan Ketua Menteri,\nMenara Kinabalu, Jalan Sulaman, Teluk Likas,\n88400 Kota Kinabalu, Sabah.`;

const SSMJ_LOGO_URL = 'assets/LOGO SMJ.jpg';

function pdfHeader() {
  return `
    <div style="display:flex;align-items:center;gap:18px;border-bottom:3px solid #1a3c6e;padding-bottom:14px;margin-bottom:18px">
      <img src="${SSMJ_LOGO_URL}" style="height:70px;width:auto;object-fit:contain" alt="Logo SSMJ">
      <div>
        <div style="font-size:11pt;font-weight:800;color:#1a3c6e;letter-spacing:.3px">SEKRETARIAT SABAH MAJU JAYA (SSMJ)</div>
        <div style="font-size:9pt;color:#333;margin-top:3px;line-height:1.5">${SSMJ_ALAMAT.replace(/\n/g,'<br>')}</div>
      </div>
    </div>`;
}

function pdfFooter(noRujukan) {
  const now = new Date();
  const tStamp = now.toLocaleDateString('ms-MY',{day:'2-digit',month:'long',year:'numeric'}) +
    ' ' + now.toLocaleTimeString('ms-MY',{hour:'2-digit',minute:'2-digit'});
  return `
    <div style="margin-top:50px">
      <table style="width:100%;font-size:9.5pt">
        <tr>
          <td style="width:50%;vertical-align:top">
            <div style="margin-bottom:60px">Disahkan oleh,</div>
            <div style="border-top:1px solid #333;padding-top:4px;width:220px">
              <strong>.........................................................</strong><br>
              <span style="font-size:8.5pt;color:#555">Tandatangan &amp; Cop Pentadbir</span>
            </div>
          </td>
          <td style="width:50%;vertical-align:top;text-align:right">
            <div style="font-size:8.5pt;color:#888;line-height:1.8">
              No. Rujukan: <strong>${noRujukan}</strong><br>
              Dijana: ${tStamp}<br>
              Portal SSMJ &mdash; Integrasi Data
            </div>
          </td>
        </tr>
      </table>
    </div>`;
}

function cetakPDF(htmlContent) {
  const win = window.open('', '_blank', 'width=900,height=700');
  win.document.write(`<!DOCTYPE html><html><head>
    <meta charset="UTF-8">
    <style>
      * { margin:0; padding:0; box-sizing:border-box; }
      body { font-family: 'Times New Roman', serif; font-size: 10.5pt; color: #111; background: white;
             width: 210mm; min-height: 297mm; margin: 0 auto; padding: 20mm 20mm 20mm 20mm; }
      h2 { font-size: 13pt; color: #1a3c6e; text-align: center; text-transform: uppercase; letter-spacing: 1px; margin: 14px 0 4px; }
      h3 { font-size: 10.5pt; text-align: center; color: #333; margin-bottom: 18px; font-style: italic; }
      table.info { width: 100%; border-collapse: collapse; margin: 14px 0; }
      table.info td { padding: 6px 10px; font-size: 10pt; border: 1px solid #ccc; vertical-align: top; }
      table.info td:first-child { width: 38%; font-weight: 600; background: #f4f6fb; color: #1a3c6e; }
      .nota { background: #f9f9f9; border-left: 4px solid #1a3c6e; padding: 10px 14px; font-size: 9.5pt; color: #333; margin: 16px 0; line-height: 1.7; }
      p { line-height: 1.8; font-size: 10.5pt; margin: 8px 0; }
      @media print {
        html, body { width: 210mm; height: 297mm; margin: 0; padding: 0; }
        body { padding: 15mm 20mm; }
        @page { size: A4 portrait; margin: 0; }
      }
    </style>
  </head><body>${htmlContent}
    <script>window.onload=function(){window.print();}<\/script>
  </body></html>`);
  win.document.close();
}

function exportCutiPDF(id) {
  const c = DB.histCuti.find(function(x){ return x.id === id; });
  if (!c) { toast('Rekod tidak ditemui.', 'error'); return; }

  const html = pdfHeader() + `
    <h2>Surat Kelulusan Cuti</h2>
    <h3>Sekretariat Sabah Maju Jaya (SSMJ)</h3>

    <p>Dengan hormatnya perkara di atas adalah dirujuk.</p>
    <p>Sukacita dimaklumkan bahawa permohonan cuti tuan/puan adalah seperti berikut:</p>

    <table class="info">
      <tr><td>No. Rujukan</td><td>${c.id}</td></tr>
      <tr><td>Nama Kakitangan</td><td>${c.nama}</td></tr>
      <tr><td>Jenis Cuti</td><td>${c.jenis}</td></tr>
      <tr><td>Tarikh Mula</td><td>${c.tarikhMula}</td></tr>
      <tr><td>Tarikh Tamat</td><td>${c.tarikhTamat}</td></tr>
      <tr><td>Tempoh Cuti</td><td>${c.hari} hari</td></tr>
      <tr><td>Status Permohonan</td><td><strong>✅ DILULUSKAN</strong></td></tr>
      ${c.alasan ? `<tr><td>Catatan</td><td>${c.alasan}</td></tr>` : ''}
    </table>

    <div class="nota">
      Sila ambil maklum bahawa kelulusan ini adalah tertakluk kepada keperluan perkhidmatan. Sebarang pertanyaan bolehlah dikemukakan kepada Bahagian Pengurusan Sumber Manusia.
    </div>

    <p>Sekian, terima kasih.</p>
    <p><em>"Berkhidmat Untuk Negara"</em></p>
  ` + pdfFooter(c.id);

  cetakPDF(html);
}

function exportTempahanPDF(id) {
  const t = DB.histTempahan.find(function(x){ return String(x.id) === String(id); });
  if (!t) { toast('Rekod tidak ditemui.', 'error'); return; }

  const html = pdfHeader() + `
    <h2>Surat Pengesahan Tempahan</h2>
    <h3>Sekretariat Sabah Maju Jaya (SSMJ)</h3>

    <p>Dengan hormatnya perkara di atas adalah dirujuk.</p>
    <p>Sukacita dimaklumkan bahawa permohonan tempahan kemudahan adalah seperti berikut dan <strong>telah diluluskan</strong>:</p>

    <table class="info">
      <tr><td>No. Rujukan</td><td>${t.id}</td></tr>
      <tr><td>Nama Pemohon</td><td>${t.nama}</td></tr>
      <tr><td>Ruang / Kemudahan</td><td>${t.ruang}</td></tr>
      <tr><td>Tarikh Tempahan</td><td>${t.tarikh}</td></tr>
      <tr><td>Masa</td><td>${t.mula} – ${t.tamat}</td></tr>
      <tr><td>Tujuan Penggunaan</td><td>${t.tujuan || '-'}</td></tr>
      <tr><td>Status</td><td><strong>✅ DILULUSKAN</strong></td></tr>
      ${t.alasan ? `<tr><td>Catatan</td><td>${t.alasan}</td></tr>` : ''}
    </table>

    <div class="nota">
      Sila pastikan ruang/kemudahan yang ditempah dikembalikan dalam keadaan bersih dan teratur selepas digunakan. Sebarang kerosakan hendaklah dilaporkan kepada Bahagian Pengurusan Kemudahan.
    </div>

    <p>Sekian, terima kasih atas kerjasama tuan/puan.</p>
    <p><em>"Berkhidmat Untuk Negara"</em></p>
  ` + pdfFooter(t.id);

  cetakPDF(html);
}

// PDF untuk pengguna biasa — guna DB.cuti (data sendiri)
function exportCutiPDFUser(id) {
  const c = DB.cuti.find(function(x){ return x.id === id; });
  if (!c) { toast('Rekod tidak ditemui.', 'error'); return; }

  const html = pdfHeader() + `
    <h2>Surat Kelulusan Cuti</h2>
    <h3>Sekretariat Sabah Maju Jaya (SSMJ)</h3>

    <p>Dengan hormatnya perkara di atas adalah dirujuk.</p>
    <p>Sukacita dimaklumkan bahawa permohonan cuti tuan/puan adalah seperti berikut:</p>

    <table class="info">
      <tr><td>No. Rujukan</td><td>${c.id}</td></tr>
      <tr><td>Nama Kakitangan</td><td>${CU.name}</td></tr>
      <tr><td>Jawatan</td><td>${CU.jawatan || '-'}</td></tr>
      <tr><td>Jabatan</td><td>${CU.dept || '-'}</td></tr>
      <tr><td>Jenis Cuti</td><td>${c.jenis}</td></tr>
      <tr><td>Tarikh Mula</td><td>${c.tarikhMula}</td></tr>
      <tr><td>Tarikh Tamat</td><td>${c.tarikhTamat}</td></tr>
      <tr><td>Tempoh Cuti</td><td>${c.hari} hari</td></tr>
      <tr><td>Pengganti Tugas</td><td>${c.pengganti || '-'}</td></tr>
      <tr><td>Sebab Permohonan</td><td>${c.sebab || '-'}</td></tr>
      <tr><td>Status Permohonan</td><td><strong>✅ DILULUSKAN</strong></td></tr>
    </table>

    <div class="nota">
      Sila ambil maklum bahawa kelulusan ini adalah tertakluk kepada keperluan perkhidmatan. Sebarang pertanyaan bolehlah dikemukakan kepada Bahagian Pengurusan Sumber Manusia.
    </div>

    <p>Sekian, terima kasih.</p>
    <p><em>"Berkhidmat Untuk Negara"</em></p>
  ` + pdfFooter(c.id);

  cetakPDF(html);
}

// PDF untuk pengguna biasa — guna DB.tempahan (data sendiri)
function exportTempahanPDFUser(id) {
  const t = DB.tempahan.find(function(x){ return x.id == id; });
  if (!t) { toast('Rekod tidak ditemui.', 'error'); return; }

  const html = pdfHeader() + `
    <h2>Surat Pengesahan Tempahan</h2>
    <h3>Sekretariat Sabah Maju Jaya (SSMJ)</h3>

    <p>Dengan hormatnya perkara di atas adalah dirujuk.</p>
    <p>Sukacita dimaklumkan bahawa permohonan tempahan kemudahan tuan/puan adalah seperti berikut dan <strong>telah diluluskan</strong>:</p>

    <table class="info">
      <tr><td>No. Rujukan</td><td>${t.id}</td></tr>
      <tr><td>Nama Pemohon</td><td>${CU.name}</td></tr>
      <tr><td>Jawatan</td><td>${CU.jawatan || '-'}</td></tr>
      <tr><td>Jabatan</td><td>${CU.dept || '-'}</td></tr>
      <tr><td>Ruang / Kemudahan</td><td>${t.ruang}</td></tr>
      <tr><td>Tarikh Tempahan</td><td>${t.tarikh}</td></tr>
      <tr><td>Masa</td><td>${t.mula} – ${t.tamat}</td></tr>
      <tr><td>Tujuan Penggunaan</td><td>${t.tujuan || '-'}</td></tr>
      <tr><td>Bilangan Peserta</td><td>${t.bilangan || '-'}</td></tr>
      <tr><td>Status</td><td><strong>✅ DILULUSKAN</strong></td></tr>
    </table>

    <div class="nota">
      Sila pastikan ruang/kemudahan yang ditempah dikembalikan dalam keadaan bersih dan teratur selepas digunakan. Sebarang kerosakan hendaklah dilaporkan kepada Bahagian Pengurusan Kemudahan.
    </div>

    <p>Sekian, terima kasih atas kerjasama tuan/puan.</p>
    <p><em>"Berkhidmat Untuk Negara"</em></p>
  ` + pdfFooter(t.id);

  cetakPDF(html);
}

// -- Approval Flow
let _approvalCtx = null;

function openApproval(type, id, title) {
  _approvalCtx = { type, id };
  const rec = type === 'cuti'
    ? DB.pendingCuti.find(c => c.id == id)
    : type === 'tempahan'
    ? DB.pendingTempahan.find(t => t.id == id)
    : DB.pendingEizin.find(e => e.id == id);

  document.getElementById('mdApprTitle').innerHTML = '<i class="fas fa-clipboard-check"></i> ' + title;
  const detailEl = document.getElementById('mdApprDetail');
  if (!rec) { detailEl.innerHTML = ''; openModal('mdApproval'); return; }

  if (type === 'cuti') {
    detailEl.innerHTML = '<i class="fas fa-info-circle"></i><div><strong>' + rec.nama + '</strong> (' + rec.noStaf + ') | ' + rec.jenis + '<br><small>Tarikh: ' + rec.tarikhMula + ' - ' + rec.tarikhTamat + ' (' + rec.hari + ' hari) | Sebab: ' + rec.sebab + '</small></div>';
  } else if (type === 'tempahan') {
    detailEl.innerHTML = '<i class="fas fa-info-circle"></i><div><strong>' + rec.nama + '</strong> (' + rec.noStaf + ') | ' + rec.ruang + '<br><small>Tarikh: ' + rec.tarikh + ' | Masa: ' + rec.mula + ' - ' + rec.tamat + ' | Tujuan: ' + rec.tujuan + '</small></div>';
  } else {
    detailEl.innerHTML = '<i class="fas fa-info-circle"></i><div><strong>' + rec.nama + '</strong> (' + rec.noStaf + ') | ' + rec.jenis + '<br><small>Tarikh: ' + rec.tarikh + ' | Keluar: ' + rec.masaKeluar + ' - Balik: ' + rec.masaBalik + ' | Destinasi: ' + rec.destinasi + '</small></div>';
  }

  document.getElementById('mdApprAction').value = '';
  document.getElementById('mdApprReason').value = '';
  openModal('mdApproval');
}

async function submitApproval() {
  const action = document.getElementById('mdApprAction').value;
  const reason = document.getElementById('mdApprReason').value.trim();

  if (!action) { toast('Sila pilih tindakan (Luluskan / Tolak).', 'error'); return; }
  if (action === 'tolak' && !reason) { toast('Sila nyatakan alasan penolakan.', 'error'); return; }

  const { type, id } = _approvalCtx;
  const res = await api('POST', '/api/approval', { type, id, action, reason });
  const data = await res.json();
  if (!res.ok) { toast(data.error || 'Ralat kelulusan.', 'error'); return; }

  if (type === 'cuti') {
    const [pc, hc] = await Promise.all([api('GET','/api/pending-cuti'), api('GET','/api/hist-cuti')]);
    DB.pendingCuti = pc.ok ? await pc.json() : DB.pendingCuti;
    DB.histCuti    = hc.ok ? await hc.json() : DB.histCuti;
    renderPendingCuti();
  } else if (type === 'eizin') {
    const [pe, he] = await Promise.all([api('GET','/api/pending-eizin'), api('GET','/api/hist-eizin')]);
    DB.pendingEizin = pe.ok ? await pe.json() : DB.pendingEizin;
    DB.histEizin    = he.ok ? await he.json() : DB.histEizin;
    renderPendingEizin();
  } else {
    const [pt, ht] = await Promise.all([api('GET','/api/pending-tempahan'), api('GET','/api/hist-tempahan')]);
    DB.pendingTempahan = pt.ok ? await pt.json() : DB.pendingTempahan;
    DB.histTempahan    = ht.ok ? await ht.json() : DB.histTempahan;
    renderPendingTempahan();
  }

  closeModal('mdApproval');
  toast('Permohonan ' + id + ' telah diproses. Pemohon telah dimaklumkan melalui peti masuk.', action === 'lulus' ? 'success' : 'warn');
}

// -- Modal helpers
function openModal(id)  { document.getElementById(id).classList.add('open'); }
function closeModal(id) { document.getElementById(id).classList.remove('open'); }

document.querySelectorAll('.modal-bg').forEach(bg => {
  bg.addEventListener('click', e => { if (e.target === bg) bg.classList.remove('open'); });
});

// -- Dropdown
function toggleDD() { document.getElementById('userDD').classList.toggle('open'); }
document.addEventListener('click', e => {
  if (!document.getElementById('userChip').contains(e.target)) {
    document.getElementById('userDD').classList.remove('open');
  }
});

// -- Toast
function toast(msg, type) {
  if (!type) type = 'success';
  const icons = { success:'fa-check-circle', error:'fa-times-circle', info:'fa-info-circle', warn:'fa-exclamation-triangle' };
  const area  = document.getElementById('toastArea');
  const el    = document.createElement('div');
  el.className = 'toast t-' + type;
  el.innerHTML = '<i class="fas ' + (icons[type]||icons.info) + '"></i><span>' + msg + '</span>';
  area.appendChild(el);
  setTimeout(function() { el.style.opacity='0'; el.style.transform='translateX(80px)'; el.style.transition='all .4s'; setTimeout(function(){el.remove();}, 400); }, 4000);
}

// -- Helpers
function statusBadge(s) {
  const map = {
    'aktif':       ['b-success','fa-circle-check','Aktif'],
    'diluluskan':  ['b-success','fa-circle-check','Diluluskan'],
    'menunggu':    ['b-warning','fa-clock','Menunggu'],
    'ditolak':     ['b-danger','fa-times-circle','Ditolak'],
    'selesai':     ['b-secondary','fa-archive','Selesai'],
    'tidak-aktif': ['b-danger','fa-times-circle','Tidak Aktif']
  };
  const info = map[s] || ['b-secondary','fa-question','-'];
  return '<span class="badge ' + info[0] + '"><i class="fas ' + info[1] + '"></i>' + info[2] + '</span>';
}

// -- POPULATE SELECTS
function populateSelects() {
  const opt = function(v) { return '<option>' + v + '</option>'; };

  const tR = document.getElementById('tRuang');
  if (tR) tR.innerHTML = '<option value="">- Pilih ruang -</option>' + DB.ruangList.map(opt).join('');

  const cJ = document.getElementById('cJenis');
  if (cJ) cJ.innerHTML = '<option value="">- Pilih jenis cuti -</option>' + DB.jenisCutiList.map(opt).join('');

  const eJ = document.getElementById('eJenis');
  if (eJ) eJ.innerHTML = '<option value="">- Pilih jenis -</option>' + DB.jenisEizinList.map(opt).join('');

  const cP = document.getElementById('cPengganti');
  if (cP) {
    const others = DB.pengguna.filter(function(p) { return p.username !== CU.username && p.status === 'aktif' && p.peranan !== 'admin'; });
    cP.innerHTML = '<option value="">- Pilih pengganti -</option>' + others.map(function(p) { return '<option>' + p.nama + '</option>'; }).join('');
  }
}

// -- URUS PILIHAN SISTEM (Admin)
function upsItemHtml(label, idx, editFn, padamFn) {
  return '<div class="ups-item" id="upsItem_' + editFn + '_' + idx + '">' +
    '<span style="flex:1">' + label + '</span>' +
    '<button class="btn btn-outline btn-xs" onclick="' + editFn + '(' + idx + ')" style="margin-right:4px"><i class="fas fa-pencil-alt"></i> Edit</button>' +
    '<button class="btn btn-danger btn-xs" onclick="' + padamFn + '(' + idx + ')"><i class="fas fa-trash"></i></button>' +
    '</div>';
}

function renderUrsPilihan() {
  const rEl = document.getElementById('ursPilRuangList');
  if (rEl) rEl.innerHTML = DB.ruangList.length
    ? DB.ruangList.map(function(r,i) { return upsItemHtml(r, i, 'editRuang', 'padamRuang'); }).join('')
    : '<p style="color:var(--muted);padding:8px 0">Tiada ruang didaftarkan.</p>';

  const cEl = document.getElementById('ursPilCutiList');
  if (cEl) cEl.innerHTML = DB.jenisCutiList.length
    ? DB.jenisCutiList.map(function(j,i) { return upsItemHtml(j, i, 'editJenisCuti', 'padamJenisCuti'); }).join('')
    : '<p style="color:var(--muted);padding:8px 0">Tiada jenis cuti.</p>';

  const eEl = document.getElementById('ursPilEizinList');
  if (eEl) eEl.innerHTML = DB.jenisEizinList.length
    ? DB.jenisEizinList.map(function(j,i) { return upsItemHtml(j, i, 'editJenisEizin', 'padamJenisEizin'); }).join('')
    : '<p style="color:var(--muted);padding:8px 0">Tiada jenis urusan.</p>';
}

async function saveOptionList(key, list) {
  await api('PUT', '/api/options/' + key, { value: list });
}

async function tambahRuang() {
  const inp = document.getElementById('inpTambahRuang');
  const val = inp.value.trim();
  if (!val) { toast('Sila masukkan nama ruang.', 'error'); return; }
  if (DB.ruangList.includes(val)) { toast('Ruang sudah wujud.', 'error'); return; }
  DB.ruangList.push(val);
  await saveOptionList('ruangList', DB.ruangList);
  populateSelects(); renderUrsPilihan(); inp.value = '';
  toast('Ruang "' + val + '" berjaya ditambah.', 'success');
}
async function padamRuang(idx) {
  const nama = DB.ruangList[idx];
  DB.ruangList.splice(idx, 1);
  await saveOptionList('ruangList', DB.ruangList);
  populateSelects(); renderUrsPilihan();
  toast('Ruang "' + nama + '" telah dipadam.', 'warn');
}

async function tambahJenisCuti() {
  const inp = document.getElementById('inpTambahCuti');
  const val = inp.value.trim();
  if (!val) { toast('Sila masukkan jenis cuti.', 'error'); return; }
  if (DB.jenisCutiList.includes(val)) { toast('Jenis cuti sudah wujud.', 'error'); return; }
  DB.jenisCutiList.push(val);
  await saveOptionList('jenisCutiList', DB.jenisCutiList);
  populateSelects(); renderUrsPilihan(); inp.value = '';
  toast('Jenis cuti "' + val + '" berjaya ditambah.', 'success');
}
async function padamJenisCuti(idx) {
  const nama = DB.jenisCutiList[idx];
  DB.jenisCutiList.splice(idx, 1);
  await saveOptionList('jenisCutiList', DB.jenisCutiList);
  populateSelects(); renderUrsPilihan();
  toast('Jenis cuti "' + nama + '" telah dipadam.', 'warn');
}

async function tambahJenisEizin() {
  const inp = document.getElementById('inpTambahEizin');
  const val = inp.value.trim();
  if (!val) { toast('Sila masukkan jenis urusan.', 'error'); return; }
  if (DB.jenisEizinList.includes(val)) { toast('Jenis urusan sudah wujud.', 'error'); return; }
  DB.jenisEizinList.push(val);
  await saveOptionList('jenisEizinList', DB.jenisEizinList);
  populateSelects(); renderUrsPilihan(); inp.value = '';
  toast('Jenis urusan "' + val + '" berjaya ditambah.', 'success');
}
async function padamJenisEizin(idx) {
  const nama = DB.jenisEizinList[idx];
  DB.jenisEizinList.splice(idx, 1);
  await saveOptionList('jenisEizinList', DB.jenisEizinList);
  populateSelects(); renderUrsPilihan();
  toast('Jenis urusan "' + nama + '" telah dipadam.', 'warn');
}

// ── Inline edit helpers ──────────────────────────────────────────────────────
function _inlineEdit(itemId, currentVal, saveFn) {
  const el = document.getElementById(itemId);
  if (!el) return;
  el.innerHTML =
    '<input class="fc" id="' + itemId + '_inp" value="' + currentVal.replace(/"/g, '&quot;') + '" style="flex:1;max-width:360px" onkeydown="if(event.key===\'Enter\'){event.preventDefault();' + saveFn + '}" />' +
    '<button class="btn btn-success btn-xs" onclick="' + saveFn + '" style="margin-right:4px"><i class="fas fa-check"></i> Simpan</button>' +
    '<button class="btn btn-secondary btn-xs" onclick="renderUrsPilihan()"><i class="fas fa-times"></i></button>';
  document.getElementById(itemId + '_inp').focus();
}

function editRuang(idx) {
  _inlineEdit('upsItem_editRuang_' + idx, DB.ruangList[idx], 'simpanRuang(' + idx + ')');
}
async function simpanRuang(idx) {
  const val = (document.getElementById('upsItem_editRuang_' + idx + '_inp') || {}).value;
  if (!val || !val.trim()) { toast('Nilai tidak boleh kosong.', 'error'); return; }
  DB.ruangList[idx] = val.trim();
  await saveOptionList('ruangList', DB.ruangList);
  populateSelects(); renderUrsPilihan();
  toast('Ruang berjaya dikemas kini.', 'success');
}

function editJenisCuti(idx) {
  _inlineEdit('upsItem_editJenisCuti_' + idx, DB.jenisCutiList[idx], 'simpanJenisCuti(' + idx + ')');
}
async function simpanJenisCuti(idx) {
  const val = (document.getElementById('upsItem_editJenisCuti_' + idx + '_inp') || {}).value;
  if (!val || !val.trim()) { toast('Nilai tidak boleh kosong.', 'error'); return; }
  DB.jenisCutiList[idx] = val.trim();
  await saveOptionList('jenisCutiList', DB.jenisCutiList);
  populateSelects(); renderUrsPilihan();
  toast('Jenis cuti berjaya dikemas kini.', 'success');
}

function editJenisEizin(idx) {
  _inlineEdit('upsItem_editJenisEizin_' + idx, DB.jenisEizinList[idx], 'simpanJenisEizin(' + idx + ')');
}
async function simpanJenisEizin(idx) {
  const val = (document.getElementById('upsItem_editJenisEizin_' + idx + '_inp') || {}).value;
  if (!val || !val.trim()) { toast('Nilai tidak boleh kosong.', 'error'); return; }
  DB.jenisEizinList[idx] = val.trim();
  await saveOptionList('jenisEizinList', DB.jenisEizinList);
  populateSelects(); renderUrsPilihan();
  toast('Jenis urusan berjaya dikemas kini.', 'success');
}

// -- DAFTAR PENGGUNA (Admin)
function renderPengguna() {
  const tbody = document.getElementById('penggunaTbl');
  if (!tbody) return;
  tbody.innerHTML = DB.pengguna.map(function(p, i) { return (
    '<tr>' +
    '<td>' + (i + 1) + '</td>' +
    '<td><strong>' + p.nama + '</strong></td>' +
    '<td>' + (p.ic || '-') + '</td>' +
    '<td><code style="background:#f0f2f6;padding:2px 7px;border-radius:5px;font-size:12px">' + p.username + '</code></td>' +
    '<td>' + (p.peranan === 'admin' ? '<span class="badge b-warning"><i class="fas fa-shield-alt"></i> Pentadbir</span>' : '<span class="badge b-info"><i class="fas fa-user"></i> Pengguna</span>') + '</td>' +
    '<td>' + (p.profileLengkap ? '<span class="badge b-success"><i class="fas fa-check-circle"></i> Lengkap</span>' : '<span class="badge b-warn"><i class="fas fa-exclamation-circle"></i> Belum Lengkap</span>') + '</td>' +
    '<td>' + statusBadge(p.status) + '</td>' +
    '<td><button class="btn btn-danger btn-xs" onclick="padamPengguna(\'' + p.username + '\')"><i class="fas fa-trash"></i> Padam</button></td>' +
    '</tr>');
  }).join('') || '<tr><td colspan="8" style="text-align:center;color:var(--muted);padding:24px">Tiada pengguna berdaftar.</td></tr>';
  document.getElementById('penggunaBadge').textContent = DB.pengguna.length + ' pengguna';
}

async function submitDaftarPengguna(e) {
  e.preventDefault();
  const pwd  = document.getElementById('dpPassword').value;
  const pwd2 = document.getElementById('dpPasswordSahkan').value;
  if (pwd !== pwd2) { toast('Kata laluan tidak sepadan.', 'error'); return; }
  if (pwd.length < 8) { toast('Kata laluan mestilah sekurang-kurangnya 8 aksara.', 'error'); return; }

  const body = {
    nama    : document.getElementById('dpNama').value.trim(),
    ic      : document.getElementById('dpIC').value.trim(),
    username: document.getElementById('dpUsername').value.trim(),
    password: pwd,
    peranan : document.getElementById('dpPeranan').value
  };

  const res = await api('POST', '/api/pengguna', body);
  const data = await res.json();
  if (!res.ok) { toast(data.error || 'Ralat mendaftar pengguna.', 'error'); return; }

  const r2 = await api('GET', '/api/pengguna');
  DB.pengguna = r2.ok ? await r2.json() : DB.pengguna;
  renderPengguna();
  document.getElementById('formDaftarPengguna').reset();
  toast('Pengguna "' + body.nama + '" berjaya didaftarkan!', 'success');
}

async function padamPengguna(username) {
  if (username === 'adminssmj') { toast('Akaun pentadbir utama tidak boleh dipadam.', 'error'); return; }
  const rec = DB.pengguna.find(function(p) { return p.username === username; });
  const nama = rec ? rec.nama : username;
  const res = await api('DELETE', '/api/pengguna/' + username);
  if (!res.ok) { toast('Ralat memadam pengguna.', 'error'); return; }
  DB.pengguna = DB.pengguna.filter(function(p) { return p.username !== username; });
  renderPengguna();
  toast('Pengguna "' + nama + '" telah dipadam.', 'warn');
}

// -- PROFIL SAYA
let _profilRec = null;

async function muatProfil() {
  const res = await api('GET', '/api/profil');
  if (!res.ok) return;
  const rec = await res.json();
  _profilRec = rec;

  document.getElementById('pvNama').textContent    = rec.nama || '-';
  document.getElementById('pvJawatan').textContent = rec.jawatan || 'Jawatan belum diisi';
  document.getElementById('pvJabatan').textContent = rec.jabatan || '-';
  document.getElementById('pvNoStaf').textContent  = rec.noStaf || '-';

  const avatarEl   = document.getElementById('profileAvatar');
  const avatarText = document.getElementById('profileAvatarText');
  if (rec.avatar) {
    avatarEl.style.backgroundImage = 'url(' + rec.avatar + ')';
    avatarEl.style.backgroundSize  = 'cover';
    avatarEl.style.backgroundPosition = 'center';
    avatarText.style.display = 'none';
  } else {
    avatarEl.style.backgroundImage = '';
    avatarText.style.display = '';
    avatarText.textContent = initials(rec.nama) || '?';
  }
  // Kemas kini chip topbar & sidebar juga
  setAvatarChips(rec.avatar || null, rec.nama);

  function s(id, val) { const el = document.getElementById(id); if(el) el.value = val || ''; }
  s('ppNama', rec.nama); s('ppIC', rec.ic); s('ppJantina', rec.jantina);
  s('ppTarikhLahir', rec.tarikhLahir); s('ppBangsa', rec.bangsa); s('ppAgama', rec.agama);
  s('ppTelBimbit', rec.telBimbit); s('ppEmailPeribadi', rec.emailPeribadi); s('ppAlamat', rec.alamat);
  s('ppNoStaf', rec.noStaf); s('ppJawatan', rec.jawatan); s('ppJabatan', rec.jabatan);
  s('ppTarikhMula', rec.tarikhMula); s('ppJenisPelantikan', rec.jenis);
  s('ppEmailPejabat', rec.emailPejabat); s('ppTelPejabat', rec.telPejabat); s('ppPenyelia', rec.penyelia);
  s('ppPassword', ''); s('ppPasswordSahkan', '');

  document.getElementById('profilIncompleteAlert').style.display = rec.profileLengkap ? 'none' : 'flex';
  kiraProgress();
}

function kiraProgress() {
  const fields = ['ppNama','ppIC','ppJantina','ppTarikhLahir','ppBangsa','ppTelBimbit',
    'ppEmailPeribadi','ppAlamat','ppNoStaf','ppJawatan','ppJabatan'];
  const filled = fields.filter(function(id) {
    const el = document.getElementById(id); return el && el.value.trim() !== '';
  }).length;
  const pct = Math.round((filled / fields.length) * 100);
  const dash = (pct / 100) * 100;
  document.getElementById('progressCircle').setAttribute('stroke-dasharray', dash + ' ' + (100 - dash));
  document.getElementById('progressPct').textContent = pct + '%';
  document.getElementById('progressCircle').setAttribute('stroke', pct >= 100 ? 'var(--green)' : pct >= 50 ? 'var(--gold)' : 'var(--red)');
}

function handleAvatarUpload(event) {
  const file = event.target.files[0];
  if (!file) return;
  if (file.size > 2 * 1024 * 1024) { toast('Saiz gambar melebihi 2MB.', 'error'); return; }
  const reader = new FileReader();
  reader.onload = function(e) {
    const url = e.target.result;
    const avatarEl = document.getElementById('profileAvatar');
    const avatarText = document.getElementById('profileAvatarText');
    avatarEl.style.backgroundImage = 'url(' + url + ')';
    avatarEl.style.backgroundSize  = 'cover';
    avatarEl.style.backgroundPosition = 'center';
    avatarText.style.display = 'none';
    if (_profilRec) _profilRec.avatar = url;
    // Paparan segera pada chip topbar & sidebar
    setAvatarChips(url, CU.name);
    toast('Gambar berjaya dimuat naik. Klik "Simpan Profil" untuk menyimpan.', 'info');
  };
  reader.readAsDataURL(file);
}

async function simpanProfil(e) {
  e.preventDefault();
  const pwd  = document.getElementById('ppPassword').value;
  const pwd2 = document.getElementById('ppPasswordSahkan').value;
  if (pwd && pwd !== pwd2) { toast('Kata laluan baharu tidak sepadan.', 'error'); return; }

  const body = {
    nama         : document.getElementById('ppNama').value.trim(),
    ic           : document.getElementById('ppIC').value.trim(),
    jantina      : document.getElementById('ppJantina').value,
    tarikhLahir  : document.getElementById('ppTarikhLahir').value,
    bangsa       : document.getElementById('ppBangsa').value,
    agama        : document.getElementById('ppAgama').value,
    telBimbit    : document.getElementById('ppTelBimbit').value.trim(),
    emailPeribadi: document.getElementById('ppEmailPeribadi').value.trim(),
    alamat       : document.getElementById('ppAlamat').value.trim(),
    noStaf       : document.getElementById('ppNoStaf').value.trim(),
    jawatan      : document.getElementById('ppJawatan').value.trim(),
    jabatan      : document.getElementById('ppJabatan').value,
    tarikhMula   : document.getElementById('ppTarikhMula').value,
    jenis        : document.getElementById('ppJenisPelantikan').value,
    emailPejabat : document.getElementById('ppEmailPejabat').value.trim(),
    telPejabat   : document.getElementById('ppTelPejabat').value.trim(),
    penyelia     : document.getElementById('ppPenyelia').value.trim(),
    avatar       : _profilRec ? _profilRec.avatar : null
  };
  if (pwd) body.password = pwd;

  const res = await api('PUT', '/api/profil', body);
  const data = await res.json();
  if (!res.ok) { toast(data.error || 'Ralat menyimpan profil.', 'error'); return; }

  document.getElementById('sbName').textContent = body.nama.split(' ').slice(0,2).join(' ');
  // Pastikan chip avatar dikemas kini selepas simpan
  setAvatarChips(body.avatar || null, body.nama);
  await muatProfil();
  toast('Profil berjaya disimpan' + (data.profileLengkap ? '! Profil anda kini lengkap.' : '. Sila lengkapkan semua maklumat wajib.'), data.profileLengkap ? 'success' : 'warn');
}

// -- NOTIS & PENGUMUMAN (Admin)
let _notisImgData = null;

function handleNotisImg(input) {
  const file = input.files[0];
  if (!file) return;
  if (file.size > 5 * 1024 * 1024) { toast('Saiz gambar melebihi 5MB.', 'error'); return; }
  const reader = new FileReader();
  reader.onload = function(e) {
    _notisImgData = e.target.result;
    document.getElementById('notisImgPreview').src = _notisImgData;
    document.getElementById('notisImgPreviewWrap').style.display = '';
    document.getElementById('notisImgPlaceholder').style.display = 'none';
    document.getElementById('notisImgClear').style.display = '';
    document.getElementById('notisImgDrop').style.borderColor = 'var(--green)';
  };
  reader.readAsDataURL(file);
}

function handleNotisDrop(event) {
  event.preventDefault();
  document.getElementById('notisImgDrop').style.borderColor = 'var(--border)';
  const file = event.dataTransfer.files[0];
  if (!file || !file.type.startsWith('image/')) { toast('Fail mesti berformat gambar.', 'error'); return; }
  handleNotisImg({ files: [file] });
}

function clearNotisImg() {
  _notisImgData = null;
  document.getElementById('notisImgInput').value = '';
  document.getElementById('notisImgPreview').src = '';
  document.getElementById('notisImgPreviewWrap').style.display = 'none';
  document.getElementById('notisImgPlaceholder').style.display = '';
  document.getElementById('notisImgClear').style.display = 'none';
  document.getElementById('notisImgDrop').style.borderColor = 'var(--border)';
}

async function submitNotis(e) {
  e.preventDefault();
  const body = {
    tajuk    : document.getElementById('notisTajuk').value.trim(),
    jenis    : document.getElementById('notisJenis').value,
    kandungan: document.getElementById('notisKandungan').value.trim(),
    kepada   : document.getElementById('notisKepada').value,
    keutamaan: document.getElementById('notisKeutamaan').value,
    image    : _notisImgData
  };
  const res = await api('POST', '/api/notis', body);
  const data = await res.json();
  if (!res.ok) { toast(data.error || 'Ralat menghantar notis.', 'error'); return; }

  await renderNotisLog();
  document.getElementById('formNotis').reset();
  clearNotisImg();
  toast('Notis "' + body.tajuk + '" berjaya dihantar kepada ' + data.sentCount + ' pengguna.', 'success');
}

async function renderNotisLog() {
  const el = document.getElementById('notisLogList');
  if (!el) return;
  const res = await api('GET', '/api/notis-log');
  if (!res.ok) return;
  const log = await res.json();
  document.getElementById('notisBadge').textContent = log.length + ' notis';
  if (!log.length) {
    el.innerHTML = '<div style="text-align:center;padding:32px;color:var(--muted);font-size:13px"><i class="fas fa-inbox" style="font-size:28px;display:block;margin-bottom:10px;opacity:.4"></i>Belum ada notis dihantar.</div>';
    return;
  }
  const kepadaMap = { all:'Semua Pengguna', user:'Pengguna Biasa', admin:'Pentadbir' };
  const kColor = { normal:'b-info', tinggi:'b-warning', kritikal:'b-danger' };
  el.innerHTML = log.map(function(n) { return (
    '<div style="display:flex;align-items:flex-start;gap:14px;padding:14px 20px;border-bottom:1px solid var(--border)">' +
    '<div style="width:40px;height:40px;border-radius:10px;background:var(--navy);display:flex;align-items:center;justify-content:center;flex-shrink:0;color:var(--gold);font-size:16px"><i class="fas fa-bullhorn"></i></div>' +
    '<div style="flex:1;min-width:0">' +
    '<div style="font-weight:700;font-size:13.5px;color:var(--text);margin-bottom:3px">' + n.tajuk + '</div>' +
    '<div style="font-size:12px;color:var(--muted);margin-bottom:6px">' + n.jenis + ' | ' + n.dateStr + ' ' + n.timeStr + ' | Dihantar kepada: <strong>' + (kepadaMap[n.kepada]||n.kepada) + '</strong> (' + n.sentCount + ' pengguna)</div>' +
    '<div style="display:flex;gap:6px;flex-wrap:wrap"><span class="badge ' + (kColor[n.keutamaan]||'b-secondary') + '" style="font-size:10.5px">' + n.keutamaan + '</span>' +
    (n.hasImage ? '<span class="badge b-secondary" style="font-size:10.5px"><i class="fas fa-image"></i> Ada Gambar</span>' : '') +
    '</div></div></div>');
  }).join('');
}

// -- Logout
function doLogout() {
  sessionStorage.removeItem('ssmjUser');
  window.location.replace('index.html');
}

// -- Bootstrap
const INITIATIVE_REPORTS_KEY = 'ssmj-initiative-reports';

function getInitiativeReports() {
  try {
    const reports = JSON.parse(localStorage.getItem(INITIATIVE_REPORTS_KEY) || '[]');
    return Array.isArray(reports) ? reports : [];
  } catch (_) {
    return [];
  }
}

function renderInitiativeReports() {
  const list = document.getElementById('initiativeReportList');
  if (!list) return;
  const username = typeof CU !== 'undefined' && CU.username ? CU.username : 'pengguna';
  const reports = getInitiativeReports().filter(report => report.username === username);
  if (!reports.length) {
    list.innerHTML = '<p class="empty-state">Belum ada laporan dihantar.</p>';
    return;
  }
  list.innerHTML = reports.map(report => `
    <div class="alert al-info" style="margin-bottom:12px">
      <strong>${report.title}</strong> · ${report.status} · ${report.progress}%<br>
      <span>${report.summary}</span><br>
      <small>Status semakan: ${report.reviewStatus} | ${report.updatedAt}</small>
    </div>`).join('');
}

function submitInitiativeReport(event) {
  event.preventDefault();
  const report = {
    id: `initiative-${Date.now()}`,
    username: typeof CU !== 'undefined' && CU.username ? CU.username : 'pengguna',
    title: document.getElementById('initiativeTitle').value.trim(),
    type: document.getElementById('initiativeType').value,
    status: document.getElementById('initiativeStatus').value,
    progress: Math.max(0, Math.min(100, Number(document.getElementById('initiativeProgress').value) || 0)),
    target: document.getElementById('initiativeTarget').value.trim(),
    officer: document.getElementById('initiativeOfficer').value.trim(),
    summary: document.getElementById('initiativeSummary').value.trim(),
    challenges: document.getElementById('initiativeChallenges').value.trim(),
    nextAction: document.getElementById('initiativeNextAction').value.trim(),
    reviewStatus: 'Menunggu Semakan SSMJ',
    updatedAt: new Date().toLocaleString('ms-MY')
  };
  if (!report.title || !report.summary) return;
  const reports = getInitiativeReports();
  reports.unshift(report);
  localStorage.setItem(INITIATIVE_REPORTS_KEY, JSON.stringify(reports));
  document.getElementById('initiativeReportForm').reset();
  renderInitiativeReports();
  const feedback = document.getElementById('initiativeReportFeedback');
  if (feedback) feedback.textContent = 'Laporan berjaya dihantar dan menunggu semakan SSMJ.';
  const reportCount = document.getElementById('initiativeReportCount');
  const pendingCount = document.getElementById('initiativePendingCount');
  if (reportCount) reportCount.textContent = reports.filter(item => item.username === report.username).length;
  if (pendingCount) pendingCount.textContent = reports.filter(item => item.username === report.username && item.reviewStatus === 'Menunggu Semakan SSMJ').length;
}

init();
setTimeout(renderInitiativeReports, 0);
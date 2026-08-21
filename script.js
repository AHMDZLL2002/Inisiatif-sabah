const toggleButton = document.querySelector('.menu-toggle');
const navLinks = document.querySelector('.nav-links');
const yearLabel = document.getElementById('year');
const dropdowns = document.querySelectorAll('.nav-dropdown');

if (toggleButton && navLinks) {
  toggleButton.addEventListener('click', () => {
    navLinks.classList.toggle('open');
  });
}

dropdowns.forEach((dropdown) => {
  const menu = dropdown.querySelector('.dropdown-menu');
  const trigger = dropdown.querySelector('.nav-link-dropdown');

  if (!menu || !trigger) return;

  const updateMenuPosition = () => {
    const rect = trigger.getBoundingClientRect();
    const left = Math.max(12, Math.min(rect.left, window.innerWidth - 24 - 420));
    const top = Math.min(rect.bottom + 8, window.innerHeight - 80);
    menu.style.left = `${left}px`;
    menu.style.top = `${top}px`;
  };

  dropdown.addEventListener('mouseenter', () => {
    updateMenuPosition();
    dropdown.classList.add('is-open');
  });

  dropdown.addEventListener('mouseleave', () => {
    dropdown.classList.remove('is-open');
  });

  dropdown.addEventListener('focusin', () => {
    updateMenuPosition();
    dropdown.classList.add('is-open');
  });

  dropdown.addEventListener('focusout', (event) => {
    if (!dropdown.contains(event.relatedTarget)) {
      dropdown.classList.remove('is-open');
    }
  });

  window.addEventListener('resize', updateMenuPosition);
  window.addEventListener('scroll', updateMenuPosition, true);
  updateMenuPosition();
});

if (yearLabel) {
  yearLabel.textContent = new Date().getFullYear();
}

const storageKeys = {
  auth: 'bea-auth',
  reports: 'bea-reports',
  pending: 'bea-pending-updates',
  pendingFollowups: 'bea-pending-followups',
  users: 'bea-admin-users',
  activities: 'bea-admin-activities',
  gallery: 'bea-ministry-gallery'
};

const firebaseConfig = {
  apiKey: 'AIzaSyB0Z3N0n7mR19hhTBGPoLkOotW7eTFgs_A',
  authDomain: 'inisiatif-sabah.firebaseapp.com',
  projectId: 'inisiatif-sabah',
  storageBucket: 'inisiatif-sabah.firebasestorage.app',
  messagingSenderId: '565943558519',
  appId: '1:565943558519:web:5d4cb81b09a71c66d54172',
  measurementId: 'G-LGMZND09DS'
};

const isFirebaseConfigured = () => Object.values(firebaseConfig).every((value) => value && !String(value).startsWith('YOUR_'));

let firebaseAuth = null;
let firebaseRegistrationAuth = null;

if (typeof window !== 'undefined' && window.firebase && isFirebaseConfigured()) {
  window.firebase.initializeApp(firebaseConfig);
  firebaseAuth = window.firebase.auth();
  firebaseRegistrationAuth = window.firebase.initializeApp(firebaseConfig, 'admin-user-registration').auth();
}

const ALLOWED_GALLERY_IMAGE_HOSTS = [
  'images.unsplash.com',
  'unsplash.com',
  'source.unsplash.com'
];
const MAX_GALLERY_UPLOAD_BYTES = 8 * 1024 * 1024;
const MAX_GALLERY_IMAGE_DIMENSION = 1400;
const MAX_GALLERY_DATA_URL_LENGTH = 4_500_000;

const SSMJ_ADMIN_DEPARTMENT = 'ssmj';

const departmentPasswords = {
  ssmj: 'SMJ2026',
  'kerja-raya': 'SMJ2026',
  kewangan: 'SMJ2026',
  perindustrian: 'SMJ2026',
  tempatan: 'SMJ2026',
  pertanian: 'SMJ2026',
  'luar-bandar': 'SMJ2026',
  pendidikan: 'SMJ2026',
  pelancongan: 'SMJ2026',
  wanita: 'SMJ2026',
  belia: 'SMJ2026'
};

const departmentData = {
  'kerja-raya': {
    title: 'Kementerian Kerja Raya dan Utiliti',
    summary: 'Memantau infrastruktur dasar, utiliti dan pembangunan ruang yang menyokong ekonomi biru.',
    progress: 72,
    status: 'Dalam pelaksanaan',
    statusText: 'Projek infrastruktur utama sedang berjalan dengan pemantauan berkala.',
    initiatives: ['Penyediaan infrastruktur pesisir', 'Pembinaan utiliti yang lestari', 'Penyelarasan laluan logistik'],
    updated: 'Kemas kini terakhir: 29 Julai 2026, 09:30',
    officer: 'Pegawai Penyelia Infrastruktur'
  },
  'kewangan': {
    title: 'Kementerian Kewangan',
    summary: 'Mengawasi belanjawan strategik, insentif dan mekanisme pembiayaan bagi projek ekonomi biru.',
    progress: 64,
    status: 'Sedia untuk pelancaran',
    statusText: 'Skim insentif sedang disiapkan untuk pelancaran panel pemantau.',
    initiatives: ['Skim insentif projek biru', 'Pembiayaan pemuliharaan pantai', 'Penyediaan laporan fiskal'],
    updated: 'Kemas kini terakhir: 28 Julai 2026, 16:10',
    officer: 'Pegawai Pemantau Pembiayaan'
  },
  'perindustrian': {
    title: 'Kementerian Perindustrian, Keusahawanan dan Pengangkutan',
    summary: 'Membina ekosistem pengangkutan dan keusahawanan yang menyokong pertumbuhan sektor biru.',
    progress: 81,
    status: 'Dalam pelaksanaan',
    statusText: 'Rangkaian logistik dan platform usahawan sedang diperluas.',
    initiatives: ['Peningkatan infrastruktur pengangkutan', 'Program pendaftaran usahawan baharu', 'Integrasi logistik pintar'],
    updated: 'Kemas kini terakhir: 30 Julai 2026, 08:15',
    officer: 'Pegawai Operasi Industri'
  },
  'tempatan': {
    title: 'Kementerian Kerajaan Tempatan dan Perumahan',
    summary: 'Memastikan perancangan tempatan dan penyediaan kediaman menyokong masyarakat pesisir.',
    progress: 58,
    status: 'Dalam pelaksanaan',
    statusText: 'Program perumahan serta pemantauan ruang komuniti sedang disusun.',
    initiatives: ['Pemantauan pembangunan bandar', 'Program perumahan komuniti', 'Penyelarasan tadbir urus tempatan'],
    updated: 'Kemas kini terakhir: 27 Julai 2026, 14:40',
    officer: 'Pegawai Penyelarasan Tempatan'
  },
  'pertanian': {
    title: 'Kementerian Pertanian, Perikanan dan Industri Makanan',
    summary: 'Menyokong sektor makanan, perikanan dan sumber laut secara lestari dan berdaya saing.',
    progress: 77,
    status: 'Berjaya disiapkan',
    statusText: 'Beberapa inisiatif utama telah mencapai tahap pelaksanaan penuh.',
    initiatives: ['Pemantauan stok sumber laut', 'Program pertanian marin', 'Pembangunan rantaian makanan'],
    updated: 'Kemas kini terakhir: 30 Julai 2026, 10:05',
    officer: 'Pegawai Pemantauan Sumber Laut'
  },
  'luar-bandar': {
    title: 'Kementerian Pembangunan Luar Bandar',
    summary: 'Memperluas kapasiti ekonomi komuniti luar bandar yang berkaitan dengan ekosistem laut.',
    progress: 69,
    status: 'Dalam pelaksanaan',
    statusText: 'Pelan pembangunan luar bandar sedang diteruskan dengan sokongan komuniti.',
    initiatives: ['Program ekonomi luar bandar', 'Pembinaan pusat latihan', 'Penyediaan akses digital'],
    updated: 'Kemas kini terakhir: 29 Julai 2026, 11:20',
    officer: 'Pegawai Pembangunan Komuniti'
  },
  'pendidikan': {
    title: 'Kementerian Pendidikan, Sains, Teknologi dan Inovasi',
    summary: 'Menggalakkan pembelajaran, penyelidikan dan inovasi yang menyokong ekonomi biru.',
    progress: 88,
    status: 'Berjaya disiapkan',
    statusText: 'Program penyelidikan dan latihan sedang memberi impak positif.',
    initiatives: ['Program latihan teknologi biru', 'Penyelidikan ekosistem marin', 'Integrasi kurikulum sains'],
    updated: 'Kemas kini terakhir: 30 Julai 2026, 12:55',
    officer: 'Pegawai Inovasi dan Penyelidikan'
  },
  'pelancongan': {
    title: 'Kementerian Pelancongan, Kebudayaan dan Alam Sekitar',
    summary: 'Menyelaraskan pelancongan, alam sekitar dan warisan budaya dalam ekosistem pesisir.',
    progress: 74,
    status: 'Dalam pelaksanaan',
    statusText: 'Program kelestarian dan tarikan pelancongan biru sedang diperkukuh.',
    initiatives: ['Promosi pelancongan beretika', 'Program pemuliharaan alam', 'Aktiviti budaya pesisir'],
    updated: 'Kemas kini terakhir: 28 Julai 2026, 15:35',
    officer: 'Pegawai Pelancongan Pesisir'
  },
  'wanita': {
    title: 'Kementerian Wanita, Kesihatan dan Kesejahteraan Rakyat',
    summary: 'Memastikan perlindungan sosial, kesihatan dan kesejahteraan rakyat menjadi teras pembangunan.',
    progress: 66,
    status: 'Sedia untuk pelancaran',
    statusText: 'Program kesihatan komuniti dan sokongan sosial sedang dirancang.',
    initiatives: ['Program kesihatan pesisir', 'Sokongan komuniti wanita', 'Pemantauan kesejahteraan rakyat'],
    updated: 'Kemas kini terakhir: 29 Julai 2026, 13:10',
    officer: 'Pegawai Kesejahteraan Rakyat'
  },
  'belia': {
    title: 'Kementerian Pembangunan Belia, Kemajuan Sukan dan Ekonomi Kreatif',
    summary: 'Mengembangkan peluang belia, sukan dan ekonomi kreatif yang selaras dengan sektor biru.',
    progress: 71,
    status: 'Dalam pelaksanaan',
    statusText: 'Program kreatif dan sukan sedang dikembangkan untuk komuniti pesisir.',
    initiatives: ['Program belia maritim', 'Pembangunan ekonomi kreatif', 'Aktiviti sukan komuniti'],
    updated: 'Kemas kini terakhir: 30 Julai 2026, 07:30',
    officer: 'Pegawai Pembangunan Belia'
  }
};

const createDefaultReports = () => JSON.parse(JSON.stringify(departmentData));

const createDefaultGalleryItems = () => ({
  'kerja-raya': {
    image: 'https://images.unsplash.com/photo-1581094794329-c8112a89af12?auto=format&fit=crop&w=900&q=80',
    summary: 'Infrastruktur pesisir, utiliti cekap tenaga, dan rangkaian logistik sokongan kementerian.'
  },
  kewangan: {
    image: 'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?auto=format&fit=crop&w=900&q=80',
    summary: 'Skim pembiayaan projek kementerian, insentif hijau, serta pemantauan prestasi fiskal.'
  },
  perindustrian: {
    image: 'https://images.unsplash.com/photo-1494412574643-ff11b0a5c1c3?auto=format&fit=crop&w=900&q=80',
    summary: 'Integrasi pengangkutan maritim, inkubator usahawan, dan rantaian industri berasaskan inovasi.'
  },
  tempatan: {
    image: 'https://images.unsplash.com/photo-1472220625704-91e1462799b2?auto=format&fit=crop&w=900&q=80',
    summary: 'Inisiatif perumahan pesisir inklusif dan perancangan bandar rendah karbon.'
  },
  pertanian: {
    image: 'https://images.unsplash.com/photo-1579170053380-58064b2dee67?auto=format&fit=crop&w=900&q=80',
    summary: 'Pemodenan rantaian bekalan makanan dan pengembangan industri perikanan lestari.'
  },
  'luar-bandar': {
    image: 'https://images.unsplash.com/photo-1518005020951-eccb494ad742?auto=format&fit=crop&w=900&q=80',
    summary: 'Akses infrastruktur, latihan kemahiran komuniti, dan ekonomi setempat berasaskan sektor marin.'
  },
  pendidikan: {
    image: 'https://images.unsplash.com/photo-1523240795612-9a054b0db644?auto=format&fit=crop&w=900&q=80',
    summary: 'Program penyelidikan, latihan teknologi, dan kolaborasi inovasi institusi serta industri.'
  },
  pelancongan: {
    image: 'https://images.unsplash.com/photo-1519046904884-53103b34b206?auto=format&fit=crop&w=900&q=80',
    summary: 'Pelancongan pesisir bertanggungjawab, warisan budaya, dan konservasi habitat sensitif.'
  },
  wanita: {
    image: 'https://images.unsplash.com/photo-1559027615-cd4628902d4a?auto=format&fit=crop&w=900&q=80',
    summary: 'Inisiatif kesihatan komuniti, perlindungan sosial, dan pemerkasaan wanita setempat.'
  },
  belia: {
    image: 'https://images.unsplash.com/photo-1517649763962-0c623066013b?auto=format&fit=crop&w=900&q=80',
    summary: 'Program belia maritim, aktiviti sukan komuniti, dan platform ekonomi kreatif pesisir.'
  }
});

const getStoredReports = () => {
  const savedReports = window.localStorage.getItem(storageKeys.reports);

  if (!savedReports) {
    const defaults = createDefaultReports();
    window.localStorage.setItem(storageKeys.reports, JSON.stringify(defaults));
    return defaults;
  }

  try {
    return { ...createDefaultReports(), ...JSON.parse(savedReports) };
  } catch (error) {
    const defaults = createDefaultReports();
    window.localStorage.setItem(storageKeys.reports, JSON.stringify(defaults));
    return defaults;
  }
};

const saveReports = (reports) => {
  window.localStorage.setItem(storageKeys.reports, JSON.stringify(reports));
};

const cloneJson = (value) => JSON.parse(JSON.stringify(value));

const getStoredPendingUpdates = () => {
  const saved = window.localStorage.getItem(storageKeys.pending);

  if (!saved) {
    return {};
  }

  try {
    return JSON.parse(saved);
  } catch (error) {
    window.localStorage.removeItem(storageKeys.pending);
    return {};
  }
};

const savePendingUpdates = (pendingUpdates) => {
  window.localStorage.setItem(storageKeys.pending, JSON.stringify(pendingUpdates));
};

const getStoredPendingFollowups = () => {
  const saved = window.localStorage.getItem(storageKeys.pendingFollowups);

  if (!saved) {
    return {};
  }

  try {
    return JSON.parse(saved);
  } catch (error) {
    window.localStorage.removeItem(storageKeys.pendingFollowups);
    return {};
  }
};

const savePendingFollowups = (followups) => {
  window.localStorage.setItem(storageKeys.pendingFollowups, JSON.stringify(followups));
};

const getStoredUsers = () => {
  const saved = window.localStorage.getItem(storageKeys.users);

  if (!saved) {
    return [];
  }

  try {
    const parsed = JSON.parse(saved);
    return Array.isArray(parsed) ? parsed : [];
  } catch (error) {
    window.localStorage.removeItem(storageKeys.users);
    return [];
  }
};

const saveStoredUsers = (users) => {
  window.localStorage.setItem(storageKeys.users, JSON.stringify(users));
};

const getStoredGalleryItems = () => {
  const saved = window.localStorage.getItem(storageKeys.gallery);
  const defaults = createDefaultGalleryItems();

  if (!saved) {
    window.localStorage.setItem(storageKeys.gallery, JSON.stringify(defaults));
    return defaults;
  }

  try {
    const parsed = JSON.parse(saved);
    return { ...defaults, ...(parsed || {}) };
  } catch (error) {
    window.localStorage.setItem(storageKeys.gallery, JSON.stringify(defaults));
    return defaults;
  }
};

const saveStoredGalleryItems = (galleryItems) => {
  window.localStorage.setItem(storageKeys.gallery, JSON.stringify(galleryItems));
};

const createDefaultActivities = () => ([
  {
    id: 'activity-ssmj-20260822',
    title: 'Mesyuarat Takwim SSMJ',
    date: '2026-08-22',
    time: '09:00',
    department: 'ssmj',
    description: 'Semakan agenda bulanan dan pengesahan aktiviti utama.',
    alert: true
  },
  {
    id: 'activity-all-20260825',
    title: 'Hantar Laporan Mingguan',
    date: '2026-08-25',
    time: '16:00',
    department: 'all',
    description: 'Semua kementerian menghantar ringkasan status terkini.',
    alert: true
  },
  {
    id: 'activity-kewangan-20260826',
    title: 'Taklimat Kewangan Projek',
    date: '2026-08-26',
    time: '10:30',
    department: 'kewangan',
    description: 'Penyelarasan bajet dan penyediaan dokumen sokongan.',
    alert: false
  }
]);

const getStoredActivities = () => {
  const saved = window.localStorage.getItem(storageKeys.activities);

  if (!saved) {
    const defaults = createDefaultActivities();
    window.localStorage.setItem(storageKeys.activities, JSON.stringify(defaults));
    return defaults;
  }

  try {
    const parsed = JSON.parse(saved);
    return Array.isArray(parsed) ? parsed : createDefaultActivities();
  } catch (error) {
    const defaults = createDefaultActivities();
    window.localStorage.setItem(storageKeys.activities, JSON.stringify(defaults));
    return defaults;
  }
};

const saveStoredActivities = (activities) => {
  window.localStorage.setItem(storageKeys.activities, JSON.stringify(activities));
};

const getActivityDepartmentLabel = (department) => {
  if (!department || department === 'all') {
    return 'Semua kementerian';
  }
  return getDepartmentTitle(department);
};

const formatActivityDate = (dateValue) => {
  const date = new Date(`${dateValue}T00:00:00`);
  return date.toLocaleDateString('ms-MY', {
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  });
};

const formatActivityTime = (timeValue) => {
  if (!timeValue) {
    return 'Sepanjang hari';
  }
  return timeValue;
};

const toActivityDateKey = (dateValue) => {
  const date = dateValue instanceof Date ? dateValue : new Date(dateValue);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

const parseActivityDateTime = (activity) => {
  const dateValue = activity.date || new Date().toISOString().slice(0, 10);
  const timeValue = activity.time || '00:00';
  const parsed = new Date(`${dateValue}T${timeValue}:00`);
  return Number.isNaN(parsed.getTime()) ? new Date(`${dateValue}T00:00:00`) : parsed;
};

const sortActivities = (left, right) => parseActivityDateTime(left) - parseActivityDateTime(right);

const getVisibleActivities = (department, session) => {
  const activities = getStoredActivities();

  if (session && canAccessSsmjAdminFeatures(session)) {
    return activities.slice().sort(sortActivities);
  }

  return activities
    .filter((activity) => {
      if (!activity.department || activity.department === 'all') {
        return true;
      }
      return activity.department === department;
    })
    .sort(sortActivities);
};

const renderActivityManagementList = (session) => {
  if (!activityManagementList || !session || !canAccessSsmjAdminFeatures(session)) {
    return;
  }

  const activities = getStoredActivities().slice().sort(sortActivities);

  if (!activities.length) {
    activityManagementList.innerHTML = '<p class="dashboard-copy">Tiada aktiviti takwim disimpan buat masa ini.</p>';
    return;
  }

  activityManagementList.innerHTML = '';

  activities.forEach((activity) => {
    const card = document.createElement('article');
    card.className = 'pending-item activity-item';

    const title = document.createElement('h3');
    title.textContent = activity.title || 'Aktiviti takwim';
    card.appendChild(title);

    const meta = document.createElement('p');
    meta.className = 'dashboard-copy';
    meta.innerHTML = `<strong>Tarikh:</strong> ${formatActivityDate(activity.date)} | <strong>Masa:</strong> ${formatActivityTime(activity.time)}`;
    card.appendChild(meta);

    const department = document.createElement('p');
    department.className = 'dashboard-copy';
    department.innerHTML = `<strong>Sasaran:</strong> ${getActivityDepartmentLabel(activity.department)}`;
    card.appendChild(department);

    if (activity.description) {
      const description = document.createElement('p');
      description.className = 'dashboard-copy';
      description.textContent = activity.description;
      card.appendChild(description);
    }

    const actions = document.createElement('div');
    actions.className = 'pending-actions';

    const deleteButton = document.createElement('button');
    deleteButton.type = 'button';
    deleteButton.className = 'btn btn-ghost';
    deleteButton.dataset.action = 'delete-activity';
    deleteButton.dataset.activityId = activity.id;
    deleteButton.textContent = 'Padam';
    actions.appendChild(deleteButton);

    card.appendChild(actions);
    activityManagementList.appendChild(card);
  });
};

const renderActivityWidgets = (department, session) => {
  const activities = getVisibleActivities(department, session);
  const today = new Date();
  const monthStart = new Date(today.getFullYear(), today.getMonth(), 1);
  const daysInMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0).getDate();
  const mondayOffset = (monthStart.getDay() + 6) % 7;
  const cells = Array.from({ length: mondayOffset }, () => null)
    .concat(Array.from({ length: daysInMonth }, (_, index) => index + 1));
  const monthLabel = new Intl.DateTimeFormat('ms-MY', { month: 'long', year: 'numeric' }).format(today);
  const todayKey = toActivityDateKey(today);

  if (activityCalendarTitle) {
    activityCalendarTitle.textContent = 'Takwim Aktiviti';
  }

  if (activityCalendarGrid) {
    activityCalendarGrid.innerHTML = '';

    ['Isn', 'Sel', 'Rab', 'Kha', 'Jum', 'Sab', 'Aha'].forEach((weekday) => {
      const label = document.createElement('span');
      label.className = 'calendar-weekday';
      label.textContent = weekday;
      activityCalendarGrid.appendChild(label);
    });

    cells.forEach((dayNumber) => {
      const cell = document.createElement('div');
      cell.className = 'calendar-day';

      if (!dayNumber) {
        cell.classList.add('is-empty');
        activityCalendarGrid.appendChild(cell);
        return;
      }

      const isoDate = toActivityDateKey(new Date(today.getFullYear(), today.getMonth(), dayNumber));
      const dayActivities = activities.filter((activity) => activity.date === isoDate);

      if (isoDate === todayKey) {
        cell.classList.add('is-today');
      }

      if (dayActivities.length) {
        cell.classList.add('has-activity');
        if (dayActivities.some((activity) => activity.alert)) {
          cell.classList.add('has-alert');
        }
      }

      cell.innerHTML = `
        <span class="calendar-day-number">${dayNumber}</span>
        <span class="calendar-day-meta">${dayActivities.length ? `${dayActivities.length} aktiviti` : ''}</span>
      `;

      if (dayActivities.length) {
        const dots = document.createElement('div');
        dots.className = 'calendar-day-dots';
        dayActivities.slice(0, 3).forEach(() => {
          const dot = document.createElement('span');
          dots.appendChild(dot);
        });
        cell.appendChild(dots);
      }

      cell.setAttribute('aria-label', `${dayNumber} ${monthLabel}${dayActivities.length ? `, ${dayActivities.length} aktiviti` : ''}`);
      activityCalendarGrid.appendChild(cell);
    });
  }

  if (activityUpcomingList) {
    const upcoming = activities.filter((activity) => parseActivityDateTime(activity) >= new Date(today.getFullYear(), today.getMonth(), today.getDate())).slice(0, 5);
    activityUpcomingList.innerHTML = '';

    if (!upcoming.length) {
      const empty = document.createElement('li');
      empty.textContent = 'Tiada aktiviti dijadualkan buat masa ini.';
      activityUpcomingList.appendChild(empty);
    } else {
      upcoming.forEach((activity) => {
        const li = document.createElement('li');
        li.innerHTML = `<span class="summary-label">${formatActivityDate(activity.date)}</span><span class="summary-value">${activity.title} • ${getActivityDepartmentLabel(activity.department)}</span>`;
        activityUpcomingList.appendChild(li);
      });
    }
  }

  if (activityAlert) {
    const nextActivity = activities.find((activity) => parseActivityDateTime(activity) >= new Date(today.getFullYear(), today.getMonth(), today.getDate()));
    if (nextActivity) {
      activityAlert.textContent = nextActivity.alert
        ? `Alert takwim: ${nextActivity.title} pada ${formatActivityDate(nextActivity.date)} jam ${formatActivityTime(nextActivity.time)}.`
        : `Aktiviti terdekat: ${nextActivity.title} pada ${formatActivityDate(nextActivity.date)} jam ${formatActivityTime(nextActivity.time)}.`;
    } else {
      activityAlert.textContent = 'Tiada alert aktiviti pada masa ini.';
    }
  }
};

const getDepartmentTitle = (department) => {
  if (department === SSMJ_ADMIN_DEPARTMENT) {
    return 'Sekretariat Sabah Maju Jaya';
  }
  return (departmentData[department] && departmentData[department].title) || department;
};

const getDepartmentCodeFromTitle = (title) => {
  const normalizedTitle = (title || '').trim().toLowerCase();
  if (!normalizedTitle) {
    return '';
  }

  if (normalizedTitle === 'sekretariat sabah maju jaya') {
    return SSMJ_ADMIN_DEPARTMENT;
  }

  const match = Object.entries(departmentData).find(([, data]) => {
    return (data.title || '').trim().toLowerCase() === normalizedTitle;
  });

  return match ? match[0] : '';
};

const AUTH_SESSION_TTL_MS = 8 * 60 * 60 * 1000;

const getAuthSession = () => {
  const authData = window.localStorage.getItem(storageKeys.auth);

  if (!authData) {
    return null;
  }

  try {
    const session = JSON.parse(authData);
    if (!session || !session.department || !session.loggedInAt) {
      window.localStorage.removeItem(storageKeys.auth);
      return null;
    }

    const elapsed = Date.now() - new Date(session.loggedInAt).getTime();
    if (elapsed > AUTH_SESSION_TTL_MS) {
      window.localStorage.removeItem(storageKeys.auth);
      return null;
    }

    return session;
  } catch (error) {
    window.localStorage.removeItem(storageKeys.auth);
    return null;
  }
};

const setAuthSession = (department, username = '', role = '', ministry = '') => {
  window.localStorage.setItem(storageKeys.auth, JSON.stringify({
    department,
    username,
    role,
    ministry,
    loggedInAt: new Date().toISOString()
  }));
};

const normalizePassword = (password) => password.trim().toUpperCase();

const clearAuthSession = async () => {
  if (firebaseAuth && typeof firebaseAuth.signOut === 'function') {
    try {
      await firebaseAuth.signOut();
    } catch (error) {
      console.warn('Firebase sign-out failed:', error);
    }
  }

  window.localStorage.removeItem(storageKeys.auth);
};

const getDepartmentFromQuery = () => {
  const params = new URLSearchParams(window.location.search);
  return params.get('dept');
};

const syncDashboardUrl = (department) => {
  const url = new URL(window.location.href);
  url.searchParams.set('dept', department);
  window.history.replaceState({}, '', url);
};

const formatUpdatedStamp = () => {
  const timestamp = new Date();
  const dateText = timestamp.toLocaleDateString('ms-MY', {
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  });
  const timeText = timestamp.toLocaleTimeString('ms-MY', {
    hour: '2-digit',
    minute: '2-digit'
  });

  return `Kemas kini terakhir: ${dateText}, ${timeText}`;
};

const drawPieChart = (progress) => {
  if (!pieChartCanvas) return;
  const ctx = pieChartCanvas.getContext('2d');
  if (!ctx) return;

  const safeProgress = Math.min(100, Math.max(0, progress));
  const completionAngle = (safeProgress / 100) * Math.PI * 2;
  const centerX = pieChartCanvas.width / 2;
  const centerY = pieChartCanvas.height / 2;
  const radius = Math.min(centerX, centerY) - 20;

  ctx.clearRect(0, 0, pieChartCanvas.width, pieChartCanvas.height);

  ctx.beginPath();
  ctx.moveTo(centerX, centerY);
  ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
  ctx.fillStyle = '#dbeeff';
  ctx.fill();

  ctx.beginPath();
  ctx.moveTo(centerX, centerY);
  ctx.arc(centerX, centerY, radius, -Math.PI / 2, completionAngle - Math.PI / 2);
  ctx.fillStyle = '#0f67a2';
  ctx.fill();

  ctx.beginPath();
  ctx.arc(centerX, centerY, radius * 0.58, 0, Math.PI * 2);
  ctx.fillStyle = '#ffffff';
  ctx.fill();

  ctx.fillStyle = '#072a49';
  ctx.font = '700 28px Inter';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(`${safeProgress}%`, centerX, centerY);
};

const drawProgressTrendChart = (progress) => {
  if (!progressChartCanvas) return;
  const ctx = progressChartCanvas.getContext('2d');
  if (!ctx) return;

  const points = [
    Math.max(20, progress - 32),
    Math.max(28, progress - 20),
    Math.max(35, progress - 13),
    Math.max(42, progress - 7),
    progress
  ];
  const labels = ['Q1', 'Q2', 'Q3', 'Q4', 'Semasa'];

  const padding = 36;
  const chartWidth = progressChartCanvas.width - padding * 2;
  const chartHeight = progressChartCanvas.height - padding * 2;
  const xStep = chartWidth / (points.length - 1);
  const toY = (value) => padding + chartHeight - (value / 100) * chartHeight;

  ctx.clearRect(0, 0, progressChartCanvas.width, progressChartCanvas.height);

  ctx.strokeStyle = '#cfe4f8';
  ctx.lineWidth = 1;
  for (let i = 0; i <= 4; i += 1) {
    const y = padding + (chartHeight / 4) * i;
    ctx.beginPath();
    ctx.moveTo(padding, y);
    ctx.lineTo(padding + chartWidth, y);
    ctx.stroke();
  }

  ctx.beginPath();
  points.forEach((value, index) => {
    const x = padding + xStep * index;
    const y = toY(value);
    if (index === 0) ctx.moveTo(x, y);
    else ctx.lineTo(x, y);
  });
  ctx.strokeStyle = '#0f67a2';
  ctx.lineWidth = 3;
  ctx.stroke();

  points.forEach((value, index) => {
    const x = padding + xStep * index;
    const y = toY(value);
    ctx.fillStyle = '#0f67a2';
    ctx.beginPath();
    ctx.arc(x, y, 4, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = '#5c7388';
    ctx.font = '600 12px Inter';
    ctx.textAlign = 'center';
    ctx.fillText(labels[index], x, progressChartCanvas.height - 10);
  });
};

const drawDistrictChartAndMap = (progress) => {
  const districts = [
    { name: 'Kota Kinabalu', value: Math.min(100, progress + 8), x: 34, y: 36 },
    { name: 'Tuaran', value: Math.min(100, progress + 2), x: 41, y: 31 },
    { name: 'Kudat', value: Math.max(20, progress - 6), x: 52, y: 17 },
    { name: 'Sandakan', value: Math.min(100, progress + 5), x: 78, y: 37 },
    { name: 'Lahad Datu', value: Math.max(20, progress - 4), x: 81, y: 55 },
    { name: 'Tawau', value: Math.max(20, progress - 1), x: 85, y: 69 },
    { name: 'Ranau', value: Math.min(100, progress + 1), x: 56, y: 41 },
    { name: 'Keningau', value: Math.max(20, progress - 3), x: 55, y: 57 }
  ];

  if (districtChartCanvas) {
    const ctx = districtChartCanvas.getContext('2d');
    if (ctx) {
      const padding = 34;
      const chartWidth = districtChartCanvas.width - padding * 2;
      const chartHeight = districtChartCanvas.height - padding * 2;
      const barWidth = chartWidth / districts.length - 10;

      ctx.clearRect(0, 0, districtChartCanvas.width, districtChartCanvas.height);

      ctx.strokeStyle = '#d8e9f8';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(padding, padding + chartHeight);
      ctx.lineTo(padding + chartWidth, padding + chartHeight);
      ctx.stroke();

      districts.forEach((district, index) => {
        const x = padding + index * (barWidth + 10);
        const barHeight = (district.value / 100) * chartHeight;
        const y = padding + chartHeight - barHeight;

        ctx.fillStyle = '#4db6e6';
        ctx.fillRect(x, y, barWidth, barHeight);
        ctx.fillStyle = '#35546d';
        ctx.font = '600 10px Inter';
        ctx.textAlign = 'center';
        ctx.fillText(district.name.split(' ')[0], x + barWidth / 2, padding + chartHeight + 14);
      });
    }
  }

  if (sabahMapMarkers) {
    sabahMapMarkers.innerHTML = '';
    districts.forEach((district) => {
      const marker = document.createElement('button');
      marker.type = 'button';
      marker.className = 'map-marker';
      marker.style.left = `${district.x}%`;
      marker.style.top = `${district.y}%`;
      marker.title = `${district.name}: ${district.value}%`;
      marker.textContent = district.value;
      sabahMapMarkers.appendChild(marker);
    });
  }

  if (districtMapList) {
    districtMapList.innerHTML = '';
    districts.forEach((district) => {
      const li = document.createElement('li');
      li.textContent = `${district.name}: ${district.value}%`;
      districtMapList.appendChild(li);
    });
  }
};

const renderPublicAnalytics = (department, reports) => {
  const data = reports[department] || reports['kerja-raya'];

  drawPieChart(data.progress);
  drawProgressTrendChart(data.progress);
  drawDistrictChartAndMap(data.progress);

  if (pieChartLabel) {
    pieChartLabel.textContent = `Peratus pelaksanaan inisiatif semasa: ${data.progress}%`;
  }
  if (publicAdminLink) {
    publicAdminLink.href = `login.html?dept=${department}`;
  }
};

const isAllowedGalleryImageHost = (hostname) => ALLOWED_GALLERY_IMAGE_HOSTS.includes((hostname || '').toLowerCase());

const getGalleryImageValidation = (value) => {
  const normalized = (value || '').trim();

  if (!normalized) {
    return {
      valid: false,
      allowed: false,
      normalized,
      reason: 'empty'
    };
  }

  try {
    const parsed = new URL(normalized);
    const validProtocol = parsed.protocol === 'http:' || parsed.protocol === 'https:';
    const hasHost = Boolean(parsed.hostname);
    const allowedHost = isAllowedGalleryImageHost(parsed.hostname);

    return {
      valid: validProtocol && hasHost,
      allowed: validProtocol && hasHost && allowedHost,
      normalized,
      reason: !validProtocol || !hasHost ? 'invalid-format' : (allowedHost ? 'ok' : 'invalid-host')
    };
  } catch (error) {
    return {
      valid: false,
      allowed: false,
      normalized,
      reason: 'invalid-format'
    };
  }
};

const canLoadGalleryImage = (imageUrl) => new Promise((resolve) => {
  const image = new Image();
  let settled = false;

  const finalize = (result) => {
    if (settled) {
      return;
    }
    settled = true;
    window.clearTimeout(timeoutId);
    image.onload = null;
    image.onerror = null;
    resolve(result);
  };

  const timeoutId = window.setTimeout(() => {
    finalize(false);
  }, 7000);

  image.onload = () => finalize(true);
  image.onerror = () => finalize(false);
  image.src = imageUrl;
});

const isUploadedGalleryDataUrl = (value) => typeof value === 'string' && /^data:image\//i.test(value.trim());

const readFileAsDataUrl = (file) => new Promise((resolve, reject) => {
  const reader = new FileReader();
  reader.onload = () => resolve(String(reader.result || ''));
  reader.onerror = () => reject(new Error('fail-read-file'));
  reader.readAsDataURL(file);
});

const loadImageElement = (src) => new Promise((resolve, reject) => {
  const image = new Image();
  image.onload = () => resolve(image);
  image.onerror = () => reject(new Error('fail-load-image'));
  image.src = src;
});

const compressUploadedGalleryImage = async (dataUrl) => {
  const image = await loadImageElement(dataUrl);
  const maxSide = Math.max(image.width, image.height);
  const scale = maxSide > MAX_GALLERY_IMAGE_DIMENSION ? (MAX_GALLERY_IMAGE_DIMENSION / maxSide) : 1;

  const canvas = document.createElement('canvas');
  canvas.width = Math.max(1, Math.round(image.width * scale));
  canvas.height = Math.max(1, Math.round(image.height * scale));

  const context = canvas.getContext('2d');
  if (!context) {
    throw new Error('fail-canvas-context');
  }

  context.drawImage(image, 0, 0, canvas.width, canvas.height);

  let compressed = canvas.toDataURL('image/jpeg', 0.82);
  if (compressed.length > MAX_GALLERY_DATA_URL_LENGTH) {
    compressed = canvas.toDataURL('image/jpeg', 0.68);
  }

  if (compressed.length > MAX_GALLERY_DATA_URL_LENGTH) {
    throw new Error('fail-upload-too-large');
  }

  return compressed;
};

const prepareUploadedGalleryImage = async (file) => {
  if (!file) {
    throw new Error('fail-upload-missing-file');
  }

  if (!file.type || !file.type.startsWith('image/')) {
    throw new Error('fail-upload-not-image');
  }

  if (file.size > MAX_GALLERY_UPLOAD_BYTES) {
    throw new Error('fail-upload-file-size');
  }

  const dataUrl = await readFileAsDataUrl(file);
  return compressUploadedGalleryImage(dataUrl);
};

const getUploadGalleryErrorMessage = (error) => {
  switch (error.message) {
    case 'fail-upload-not-image':
      return 'Fail yang dipilih bukan gambar. Sila pilih fail imej.';
    case 'fail-upload-file-size':
      return 'Saiz fail terlalu besar. Had maksimum ialah 8MB.';
    case 'fail-upload-too-large':
      return 'Gambar terlalu besar untuk disimpan. Cuba imej yang lebih kecil.';
    default:
      return 'Gagal memproses gambar upload. Sila cuba gambar lain.';
  }
};

const getRenderableGalleryImage = (image, fallbackImage) => {
  if (isUploadedGalleryDataUrl(image)) {
    return image;
  }

  const validation = getGalleryImageValidation(image);
  if (validation.valid && validation.allowed) {
    return validation.normalized;
  }
  return fallbackImage || '';
};

const renderHomepageGallery = () => {
  const homepageGalleryGrid = document.querySelector('.gallery-grid');
  if (!homepageGalleryGrid) {
    return;
  }

  const defaults = createDefaultGalleryItems();
  const galleryItems = getStoredGalleryItems();
  const departments = Object.keys(departmentData);

  homepageGalleryGrid.innerHTML = '';

  departments.forEach((department) => {
    const title = getDepartmentTitle(department);
    const fallback = defaults[department] || { image: '', summary: '' };
    const item = galleryItems[department] || fallback;
    const image = getRenderableGalleryImage(item.image, fallback.image);
    const summary = item.summary || fallback.summary;

    const card = document.createElement('article');
    card.className = 'gallery-card';

    const imageElement = document.createElement('img');
    imageElement.src = image;
    imageElement.alt = `Inisiatif ${title}`;
    imageElement.addEventListener('error', () => {
      imageElement.src = 'assets/LOGO%20SMJ.jpg';
    }, { once: true });

    const content = document.createElement('div');
    content.className = 'gallery-content';

    const heading = document.createElement('h3');
    heading.textContent = title;

    const paragraph = document.createElement('p');
    paragraph.textContent = summary;

    content.appendChild(heading);
    content.appendChild(paragraph);

    card.appendChild(imageElement);
    card.appendChild(content);

    homepageGalleryGrid.appendChild(card);
  });
};

const dashboardTitle = document.getElementById('dashboard-title');
const dashboardSummary = document.getElementById('dashboard-summary');
const dashboardSubtitle = document.getElementById('dashboard-subtitle');
const progressBar = document.getElementById('progress-bar');
const progressText = document.getElementById('progress-text');
const statusPill = document.getElementById('status-pill');
const statusText = document.getElementById('status-text');
const initiativeList = document.getElementById('initiative-list');
const summaryTitle = document.getElementById('summary-title');
const summaryText = document.getElementById('summary-text');
const summaryPoints = document.getElementById('summary-points');
const updatedInfo = document.getElementById('updated-info');
const loginForm = document.getElementById('login-form');
const departmentSelect = document.getElementById('department-select');
const usernameInput = document.getElementById('username-input');
const loginFeedback = document.getElementById('login-feedback');
const forgotPasswordLink = document.getElementById('forgot-password-link');
const forgotPasswordForm = document.getElementById('forgot-password-form');
const forgotEmailInput = document.getElementById('forgot-email-input');
const forgotDepartmentSelect = document.getElementById('forgot-department-select');
const forgotAccountSummary = document.getElementById('forgot-account-summary');
const forgotPasswordFeedback = document.getElementById('forgot-password-feedback');
const resendVerificationButton = document.getElementById('resend-verification-button');
const dashboardSession = document.getElementById('dashboard-session');
const officerInfo = document.getElementById('officer-info');
const reportForm = document.getElementById('report-form');
const statusForm = document.getElementById('status-form');
const initiativeForm = document.getElementById('initiative-form');
const logoutLink = document.getElementById('logout-link');
const adminMinistryTitle = document.getElementById('admin-ministry-title');
const reportFeedback = document.getElementById('report-feedback');
const statusFeedback = document.getElementById('status-feedback');
const initiativeFeedback = document.getElementById('initiative-feedback');
const approvalFeedback = document.getElementById('approval-feedback');
const summaryInput = document.getElementById('summary-input');
const officerNameInput = document.getElementById('officer-name');
const statusSelect = document.getElementById('status-select');
const progressInput = document.getElementById('progress-input');
const initiativeInput = document.getElementById('initiative-input');
const galleryForm = document.getElementById('gallery-form');
const gallerySummaryInput = document.getElementById('gallery-summary-input');
const galleryImageInput = document.getElementById('gallery-image-input');
const galleryImageFileInput = document.getElementById('gallery-image-file');
const galleryPreviewImage = document.getElementById('gallery-preview-image');
const galleryPreviewState = document.getElementById('gallery-preview-state');
const galleryFeedback = document.getElementById('gallery-feedback');
const pendingNotice = document.getElementById('pending-notice');
const pendingApprovalsList = document.getElementById('pending-approvals-list');
const pendingFollowupsList = document.getElementById('pending-followups-list');
const activityCalendarTitle = document.getElementById('activity-calendar-title');
const activityCalendarGrid = document.getElementById('activity-calendar-grid');
const activityAlert = document.getElementById('activity-alert');
const activityUpcomingList = document.getElementById('activity-upcoming-list');
const activityManagementList = document.getElementById('activity-management-list');
const activityForm = document.getElementById('activity-form');
const activityFeedback = document.getElementById('activity-feedback');
const activityTitleInput = document.getElementById('activity-title');
const activityDateInput = document.getElementById('activity-date');
const activityTimeInput = document.getElementById('activity-time');
const activityDepartmentInput = document.getElementById('activity-department');
const activityDescriptionInput = document.getElementById('activity-description');
const activityAlertInput = document.getElementById('activity-alert-input');
const ssmjFeatureBox = document.getElementById('ssmj-feature-box');
const featureLinks = document.querySelectorAll('.admin-feature-link');
const ssmjKpiGrid = document.getElementById('ssmj-kpi-grid');
const ministryDashboardGrid = document.getElementById('ministry-dashboard-grid');
const ssmjKpiPending = document.getElementById('ssmj-kpi-pending');
const ssmjKpiRejected = document.getElementById('ssmj-kpi-rejected');
const ssmjKpiFocus = document.getElementById('ssmj-kpi-focus');
const ssmjKpiInitiatives = document.getElementById('ssmj-kpi-initiatives');
const publicAdminLink = document.getElementById('public-admin-link');
const pieChartCanvas = document.getElementById('pie-chart-canvas');
const pieChartLabel = document.getElementById('pie-chart-label');
const progressChartCanvas = document.getElementById('progress-chart-canvas');
const districtChartCanvas = document.getElementById('district-chart-canvas');
const sabahMapMarkers = document.getElementById('sabah-map-markers');
const districtMapList = document.getElementById('district-map-list');
const topbarTime = document.getElementById('topbar-time');
const topbarUser = document.getElementById('topbar-user');
const userSettingsButton = document.getElementById('user-settings-button');
const userSettingsForm = document.getElementById('user-settings-form');
const userSettingsName = document.getElementById('user-settings-name');
const heroDepartmentChip = document.getElementById('hero-department-chip');
const heroProgressChip = document.getElementById('hero-progress-chip');
const heroStatusChip = document.getElementById('hero-status-chip');
const adminMenuLinks = document.querySelectorAll('.admin-menu-link');
const allPanelLinks = document.querySelectorAll('.admin-menu-link, .admin-feature-link');
const adminPanels = document.querySelectorAll('.admin-section-panel');
const adminTopbar = document.querySelector('.admin-topbar');
const adminShell = document.querySelector('.admin-shell');
const adminSidebar = document.querySelector('.admin-sidebar');
const sidebarToggleButton = document.getElementById('sidebar-toggle-button');
const adminUsersForm = document.getElementById('admin-users-form');
const adminUserUsernameInput = document.getElementById('admin-user-username');
const adminUserPasswordInput = document.getElementById('admin-user-password');
const adminUserRoleInput = document.getElementById('admin-user-role');
const adminUserMinistryInput = document.getElementById('admin-user-ministry');
const adminUsersFeedback = document.getElementById('admin-users-feedback');
const adminUsersList = document.getElementById('admin-users-list');
const sidebarUserLink = document.querySelector('.admin-sidebar-footer .admin-user-link');
const adminActivityLink = document.querySelector('.admin-menu .admin-activity-link');
const adminBrandMark = document.querySelector('.admin-brand .brand-mark');
const adminBrandName = document.querySelector('.admin-brand .brand-mark + span');
const adminBrandLogoSrc = (adminBrandMark && adminBrandMark.querySelector('.brand-logo'))
  ? adminBrandMark.querySelector('.brand-logo').getAttribute('src')
  : 'assets/LOGO%20SMJ.jpg';

if (adminSidebar) {
  adminSidebar.id = 'admin-sidebar';
}

const sidebarStorageKey = 'bea-admin-sidebar-collapsed';

let currentDepartment = null;
let currentSession = null;
let gallerySubmissionInProgress = false;
let galleryUploadInProgress = false;
let galleryUploadedImageData = '';

const isValidDepartment = (department) => Boolean(departmentPasswords[department]);
const isSsmjDepartment = (department) => department === SSMJ_ADMIN_DEPARTMENT;
const isPublicDashboardDepartment = (department) => isValidDepartment(department) && !isSsmjDepartment(department);
const isSsmjAdminRole = (role) => {
  const normalized = (role || '').trim().toLowerCase();
  return normalized === 'admin ssmj' || normalized === 'ssmj' || normalized === 'admin';
};
const isGeneralUserRole = (role) => {
  const normalized = (role || '').trim().toLowerCase();
  return !normalized || normalized === 'user' || normalized === 'focal person' || normalized === 'pegawai' || normalized === 'staff';
};
const canAccessSsmjAdminFeatures = (session) => Boolean(
  session &&
  isSsmjDepartment(session.department) &&
  (isSsmjAdminRole(session.role) || !session.role)
);
const canAccessDepartmentDashboard = (session, department) => {
  if (!session || !session.department || !departmentPasswords[session.department]) {
    return false;
  }

  if (department === SSMJ_ADMIN_DEPARTMENT) {
    return canAccessSsmjAdminFeatures(session);
  }

  return session.department === department && (isGeneralUserRole(session.role) || isSsmjAdminRole(session.role) || !session.role);
};

const departmentMonograms = {
  ssmj: 'SMJ',
  'kerja-raya': 'KRU',
  kewangan: 'KWG',
  perindustrian: 'PKP',
  tempatan: 'KTP',
  pertanian: 'KPIM',
  'luar-bandar': 'PLB',
  pendidikan: 'PSTI',
  pelancongan: 'PKAS',
  wanita: 'WKR',
  belia: 'BSKE'
};

const setHidden = (element, hidden) => {
  if (element) {
    element.hidden = hidden;
  }
};

const updateAdminSidebarIdentity = (session) => {
  if (!session || !session.department || !adminBrandMark || !adminBrandName) {
    return;
  }

  const department = session.department;
  const isSsmj = isSsmjDepartment(department);
  const ministryName = isSsmj
    ? 'Bahagian Pengurusan & Inisiatif, Sekretariat Sabah Maju Jaya'
    : getDepartmentTitle(department);

  adminBrandName.textContent = ministryName;

  if (isSsmj) {
    adminBrandMark.classList.remove('brand-mark-monogram');
    adminBrandMark.innerHTML = `<img src="${adminBrandLogoSrc}" alt="Logo Sekretariat Sabah Maju Jaya" class="brand-logo" />`;
    return;
  }

  const monogram = departmentMonograms[department] || 'LOGO';
  adminBrandMark.classList.add('brand-mark-monogram');
  adminBrandMark.innerHTML = `<span class="admin-brand-monogram" aria-hidden="true">${monogram}</span>`;
};

const setSidebarCollapsed = (collapsed) => {
  if (!document.body) {
    return;
  }

  document.body.classList.toggle('sidebar-collapsed', collapsed);

  if (sidebarToggleButton) {
    sidebarToggleButton.innerHTML = `<span aria-hidden="true">${collapsed ? '&gt;' : '&lt;'}</span>`;
    sidebarToggleButton.setAttribute('aria-label', collapsed ? 'Buka panel sisi' : 'Tutup panel sisi');
    sidebarToggleButton.title = collapsed ? 'Buka panel sisi' : 'Tutup panel sisi';
    sidebarToggleButton.setAttribute('aria-expanded', String(!collapsed));
  }
};

const initializeAdminSidebarToggle = () => {
  if (!sidebarToggleButton || !adminShell || !adminSidebar || !document.body.classList.contains('dashboard-admin-page')) {
    return;
  }

  const storedState = window.localStorage.getItem(sidebarStorageKey);
  setSidebarCollapsed(storedState === '1');

  sidebarToggleButton.addEventListener('click', () => {
    const collapsed = !document.body.classList.contains('sidebar-collapsed');
    setSidebarCollapsed(collapsed);
    window.localStorage.setItem(sidebarStorageKey, collapsed ? '1' : '0');
  });
};

const showPanel = (panelId) => {
  adminPanels.forEach((panel) => {
    const isActivePanel = panel.id === panelId;
    panel.classList.toggle('is-active', isActivePanel);
    setHidden(panel, !isActivePanel);
  });

  allPanelLinks.forEach((link) => {
    link.classList.toggle('is-active', link.dataset.target === panelId);
  });
};

const updateTopbarTime = () => {
  if (topbarTime) {
    topbarTime.textContent = new Date().toLocaleString('ms-MY', {
      weekday: 'short',
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }
};

const updateTopbarUser = (department, reports) => {
  const report = reports[department] || reports['kerja-raya'];
  if (topbarUser) {
    topbarUser.textContent = `Pengguna: ${report.officer}`;
  }
};

const refreshDashboardView = () => {
  if (!currentSession) {
    return;
  }

  if (isSsmjDepartment(currentSession.department)) {
    renderPendingApprovals();
    renderSsmjSummary();
    renderSsmjDashboardKpis();
    return;
  }

  if (!currentDepartment) {
    return;
  }

  const reports = getStoredReports();
  renderDashboard(currentDepartment, reports, currentSession);
  populateReportForm(currentDepartment, reports);
  populateGalleryForm(currentDepartment);
  updateTopbarUser(currentDepartment, reports);
  updatePendingNotice(currentDepartment);
};

const saveSectionFeedback = (feedbackElement, message) => {
  if (feedbackElement) {
    feedbackElement.textContent = message;
  }
};

const renderAdminUsers = () => {
  if (!adminUsersList) {
    return;
  }

  const users = getStoredUsers();

  if (!users.length) {
    adminUsersList.innerHTML = '<p class="dashboard-copy">Tiada pengguna didaftarkan buat masa ini.</p>';
    return;
  }

  adminUsersList.innerHTML = '';

  users.forEach((user) => {
    const userRole = user.role || user.summary || '-';
    const userMinistryCode = user.ministryCode || getDepartmentCodeFromTitle(user.ministry || '');
    const userMinistry = userMinistryCode ? getDepartmentTitle(userMinistryCode) : (user.ministry || '-');
    const card = document.createElement('article');
    card.className = 'pending-item';
    card.innerHTML = `
      <h3>${user.username}</h3>
      <p class="dashboard-copy"><strong>Password:</strong> ${user.password}</p>
      <p class="dashboard-copy"><strong>Role:</strong> ${userRole}</p>
      <p class="dashboard-copy"><strong>Kementerian:</strong> ${userMinistry}</p>
      <p class="pending-meta">Dicipta pada ${new Date(user.createdAt).toLocaleString('ms-MY')}</p>
    `;
    adminUsersList.appendChild(card);
  });
};

const clearAllFeedbacks = () => {
  saveSectionFeedback(reportFeedback, '');
  saveSectionFeedback(statusFeedback, '');
  saveSectionFeedback(initiativeFeedback, '');
  saveSectionFeedback(galleryFeedback, '');
  saveSectionFeedback(approvalFeedback, '');
};

const updatePendingNotice = (department) => {
  if (!pendingNotice || !department || isSsmjDepartment(department)) {
    return;
  }

  const pendingUpdates = getStoredPendingUpdates();
  const pending = pendingUpdates[department];

  if (!pending) {
    pendingNotice.textContent = 'Tiada kemaskini tertunggak. Sebarang kemaskini baharu akan dihantar ke Gateway SSMJ untuk semakan.';
    return;
  }

  const submittedAt = pending.submittedAt
    ? new Date(pending.submittedAt).toLocaleString('ms-MY')
    : 'masa tidak direkodkan';
  pendingNotice.textContent = `Kemaskini terkini sedang menunggu semakan SSMJ (dihantar pada ${submittedAt}). Paparan dashboard utama masih menggunakan data yang telah diluluskan.`;
};

const buildPendingDraft = (department, reports, pendingUpdates) => {
  const pending = pendingUpdates[department];
  if (pending && pending.report) {
    return cloneJson(pending.report);
  }
  return cloneJson(reports[department]);
};

const submitPendingUpdate = ({ department, officerName, updateType, mutate }) => {
  const reports = getStoredReports();
  const pendingUpdates = getStoredPendingUpdates();
  const pendingFollowups = getStoredPendingFollowups();
  const draft = buildPendingDraft(department, reports, pendingUpdates);

  mutate(draft);

  const submitter = officerName || draft.officer;
  draft.officer = submitter;
  draft.updated = formatUpdatedStamp();
  draft.statusText = `${submitter} telah menghantar kemaskini untuk semakan dan kelulusan SSMJ.`;

  pendingUpdates[department] = {
    report: draft,
    submittedAt: new Date().toISOString(),
    submittedBy: submitter,
    updateType
  };

  if (pendingFollowups[department]) {
    delete pendingFollowups[department];
    savePendingFollowups(pendingFollowups);
  }

  savePendingUpdates(pendingUpdates);
};

const renderPendingApprovals = () => {
  if (!pendingApprovalsList) {
    return;
  }

  const pendingUpdates = getStoredPendingUpdates();
  const entries = Object.entries(pendingUpdates).filter(([department]) => isPublicDashboardDepartment(department));

  if (!entries.length) {
    pendingApprovalsList.innerHTML = '<p class="dashboard-copy">Tiada kemaskini tertunggak buat masa ini.</p>';
    return;
  }

  pendingApprovalsList.innerHTML = '';

  entries.forEach(([department, payload]) => {
    const data = payload.report || {};
    const card = document.createElement('article');
    card.className = 'pending-item';

    const submittedAt = payload.submittedAt
      ? new Date(payload.submittedAt).toLocaleString('ms-MY')
      : 'Tidak direkodkan';
    const firstInitiative = Array.isArray(data.initiatives) && data.initiatives.length
      ? data.initiatives[0]
      : 'Tiada inisiatif baharu';

    card.innerHTML = `
      <h3>${getDepartmentTitle(department)}</h3>
      <p class="dashboard-copy"><strong>Ringkasan:</strong> ${data.summary || '-'}</p>
      <p class="dashboard-copy"><strong>Status:</strong> ${data.status || '-'} | <strong>Kemajuan:</strong> ${Number(data.progress || 0)}%</p>
      <p class="dashboard-copy"><strong>Inisiatif Utama:</strong> ${firstInitiative}</p>
      <p class="pending-meta">Dihantar oleh ${payload.submittedBy || data.officer || 'Pegawai kementerian'} pada ${submittedAt}</p>
      <div class="pending-actions">
        <button type="button" class="btn btn-primary" data-action="approve" data-department="${department}">Luluskan</button>
        <button type="button" class="btn btn-ghost" data-action="reject" data-department="${department}">Tolak</button>
      </div>
    `;

    pendingApprovalsList.appendChild(card);
  });
};

const renderPendingFollowups = () => {
  if (!pendingFollowupsList) {
    return;
  }

  const followups = getStoredPendingFollowups();
  const entries = Object.entries(followups).filter(([department]) => isPublicDashboardDepartment(department));

  if (!entries.length) {
    pendingFollowupsList.innerHTML = '<p class="dashboard-copy">Tiada pending kemaskini jabatan buat masa ini.</p>';
    return;
  }

  pendingFollowupsList.innerHTML = '';

  entries.forEach(([department, payload]) => {
    const rejectedAt = payload.rejectedAt
      ? new Date(payload.rejectedAt).toLocaleString('ms-MY')
      : 'Tidak direkodkan';

    const card = document.createElement('article');
    card.className = 'pending-item pending-followup-item';
    card.innerHTML = `
      <h3>${getDepartmentTitle(department)}</h3>
      <p class="dashboard-copy"><strong>Status:</strong> Pending kemaskini semula jabatan</p>
      <p class="dashboard-copy"><strong>Tindakan terakhir:</strong> Permohonan ditolak oleh SSMJ pada ${rejectedAt}</p>
      <p class="dashboard-copy"><strong>Jenis permohonan:</strong> ${payload.updateType || 'Kemaskini kementerian'}</p>
      <p class="pending-meta">Jabatan perlu hantar semula kemaskini untuk masuk semula ke senarai Semakan &amp; Luluskan.</p>
    `;

    pendingFollowupsList.appendChild(card);
  });
};

const renderSsmjDashboardKpis = () => {
  const pendingUpdates = getStoredPendingUpdates();
  const followups = getStoredPendingFollowups();
  const reports = getStoredReports();

  const pendingEntries = Object.entries(pendingUpdates).filter(([department]) => isPublicDashboardDepartment(department));
  const followupEntries = Object.entries(followups).filter(([department]) => isPublicDashboardDepartment(department));
  const initiativeCount = Object.entries(reports)
    .filter(([department]) => isPublicDashboardDepartment(department))
    .reduce((total, [, report]) => total + (Array.isArray(report.initiatives) ? report.initiatives.length : 0), 0);

  if (ssmjKpiPending) {
    ssmjKpiPending.textContent = `${pendingEntries.length}`;
  }

  if (ssmjKpiRejected) {
    ssmjKpiRejected.textContent = `${followupEntries.length}`;
  }

  if (ssmjKpiFocus) {
    ssmjKpiFocus.textContent = pendingEntries.length
      ? getDepartmentTitle(pendingEntries[0][0])
      : 'Tiada permohonan menunggu semakan';
  }

  if (ssmjKpiInitiatives) {
    ssmjKpiInitiatives.textContent = `${initiativeCount}`;
  }

  renderPendingFollowups();
  renderSsmjInitiativeInbox();
};

const renderSsmjInitiativeInbox = () => {
  const list = document.getElementById('ssmj-initiative-inbox-list');
  if (!list) return;
  let reports = [];
  try {
    reports = JSON.parse(window.localStorage.getItem('ssmj-initiative-reports') || '[]');
  } catch (error) {
    reports = [];
  }
  const pending = reports.filter((report) => report.reviewStatus === 'Menunggu Semakan SSMJ');
  if (!pending.length) {
    list.innerHTML = '<p class="dashboard-copy">Tiada laporan baharu menunggu semakan.</p>';
    return;
  }
  list.innerHTML = '';
  pending.forEach((report) => {
    const item = document.createElement('article');
    item.className = 'pending-item';
    const title = document.createElement('h3');
    title.textContent = report.title || 'Inisiatif tanpa nama';
    const detail = document.createElement('p');
    detail.className = 'dashboard-copy';
    detail.textContent = `${report.username || 'Pengguna'} | ${report.status || '-'} | Kemajuan ${report.progress || 0}%`;
    const summary = document.createElement('p');
    summary.className = 'dashboard-copy';
    summary.textContent = report.summary || '-';
    const actions = document.createElement('div');
    actions.className = 'pending-actions';
    const approve = document.createElement('button');
    approve.className = 'btn btn-primary';
    approve.type = 'button';
    approve.textContent = 'Luluskan';
    approve.addEventListener('click', () => updateInitiativeReview(report.id, 'Diluluskan'));
    const reject = document.createElement('button');
    reject.className = 'btn btn-ghost';
    reject.type = 'button';
    reject.textContent = 'Tolak';
    reject.addEventListener('click', () => updateInitiativeReview(report.id, 'Ditolak'));
    actions.append(approve, reject);
    item.append(title, detail, summary, actions);
    list.appendChild(item);
  });
};

const updateInitiativeReview = (id, reviewStatus) => {
  let reports = [];
  try { reports = JSON.parse(window.localStorage.getItem('ssmj-initiative-reports') || '[]'); } catch (error) { reports = []; }
  reports = reports.map((report) => report.id === id ? { ...report, reviewStatus, reviewedAt: new Date().toISOString() } : report);
  window.localStorage.setItem('ssmj-initiative-reports', JSON.stringify(reports));
  renderSsmjInitiativeInbox();
  renderSsmjDashboardKpis();
};

const renderSsmjSummary = () => {
  const pendingUpdates = getStoredPendingUpdates();
  const pendingFollowups = getStoredPendingFollowups();
  const entries = Object.entries(pendingUpdates).filter(([department]) => isPublicDashboardDepartment(department));
  const followupCount = Object.entries(pendingFollowups).filter(([department]) => isPublicDashboardDepartment(department)).length;

  if (summaryTitle) {
    summaryTitle.textContent = 'Ringkasan Semakan SSMJ';
  }

  if (summaryText) {
    summaryText.textContent = entries.length
      ? `Terdapat ${entries.length} kemaskini kementerian menunggu semakan dan kelulusan.`
      : 'Tiada kemaskini tertunggak buat masa ini.';
  }

  if (summaryPoints) {
    summaryPoints.innerHTML = '';
    const summaryItems = entries.length
      ? [
          { label: 'Jumlah menunggu semakan', value: `${entries.length}` },
          { label: 'Jumlah pending kemaskini jabatan', value: `${followupCount}` },
          { label: 'Fokus semasa', value: entries[0] ? getDepartmentTitle(entries[0][0]) : 'Tiada' },
          { label: 'Nota', value: 'Semua kemaskini perlu diluluskan sebelum dipaparkan ke dashboard utama.' }
        ]
      : [
          { label: 'Status', value: 'Tiada kemaskini tertunggak' },
          { label: 'Pending kemaskini jabatan', value: `${followupCount}` },
          { label: 'Ketersediaan', value: 'SSMJ bersedia menerima kemaskini baharu' },
          { label: 'Paparan', value: 'Status kelulusan akan dipaparkan selepas semakan' }
        ];

    summaryItems.forEach((item) => {
      const li = document.createElement('li');
      li.innerHTML = `<span class="summary-label">${item.label}</span><span class="summary-value">${item.value}</span>`;
      summaryPoints.appendChild(li);
    });
  }
};

const applyDepartmentTheme = (department) => {
  if (!document.body || !department) {
    return;
  }
  document.body.dataset.dept = department;
};

const renderDashboard = (department, reports, session) => {
  const data = reports[department] || reports['kerja-raya'];

  applyDepartmentTheme(department);

  if (dashboardTitle) dashboardTitle.textContent = data.title;
  if (dashboardSummary) dashboardSummary.textContent = data.summary;
  if (dashboardSubtitle) dashboardSubtitle.textContent = 'Laporan Kemajuan ' + data.title;
  if (progressBar) progressBar.style.width = `${data.progress}%`;
  if (progressText) progressText.textContent = `Kemajuan keseluruhan: ${data.progress}%`;
  if (statusPill) {
    statusPill.textContent = data.status;
    statusPill.className = 'pill';
    if (data.status === 'Berjaya disiapkan') {
      statusPill.classList.add('pill-success');
    } else if (data.status === 'Sedia untuk pelancaran') {
      statusPill.classList.add('pill-warning');
    } else {
      statusPill.classList.add('pill-info');
    }
  }
  if (statusText) statusText.textContent = data.statusText;
  if (summaryTitle) {
    summaryTitle.textContent = `Ringkasan ${data.title}`;
  }
  if (summaryText) {
    summaryText.textContent = data.summary;
  }
  if (summaryPoints) {
    summaryPoints.innerHTML = '';
    const summaryItems = [
      { label: 'Status semasa', value: data.status },
      { label: 'Kemajuan keseluruhan', value: `${data.progress}%` },
      { label: 'Pegawai penyelaras', value: data.officer }
    ];

    summaryItems.forEach((item) => {
      const li = document.createElement('li');
      li.innerHTML = `<span class="summary-label">${item.label}</span><span class="summary-value">${item.value}</span>`;
      summaryPoints.appendChild(li);
    });
  }
  if (heroDepartmentChip) {
    heroDepartmentChip.textContent = data.title;
  }
  if (heroProgressChip) {
    heroProgressChip.textContent = `${data.progress}% siap`;
  }
  if (heroStatusChip) {
    heroStatusChip.textContent = data.status;
  }
  if (initiativeList) {
    initiativeList.innerHTML = '';
    data.initiatives.forEach((item) => {
      const li = document.createElement('li');
      li.textContent = item;
      initiativeList.appendChild(li);
    });
  }
  if (updatedInfo) updatedInfo.textContent = data.updated;
  if (officerInfo) officerInfo.textContent = `Pegawai terakhir yang mengemas kini laporan: ${data.officer}`;
  if (dashboardSession && session) {
    if (isSsmjDepartment(session.department)) {
      dashboardSession.textContent = `Sesi aktif Sekretariat Sabah Maju Jaya (SSMJ). Log masuk pada ${new Date(session.loggedInAt).toLocaleString('ms-MY')}.`;
    } else {
      dashboardSession.textContent = `Sesi aktif untuk ${data.title}. Log masuk pada ${new Date(session.loggedInAt).toLocaleString('ms-MY')}.`;
      updatePendingNotice(session.department);
    }
  }
  if (dashboardSession && !session) {
    dashboardSession.textContent = `Paparan awam laporan untuk ${data.title}. Log masuk sebagai admin untuk kemaskini laporan.`;
  }
  if (adminMinistryTitle) {
    adminMinistryTitle.textContent = data.title;
  }

  renderActivityWidgets(department, session);
};

const populateReportForm = (department, reports) => {
  const pendingUpdates = getStoredPendingUpdates();
  const data = (pendingUpdates[department] && pendingUpdates[department].report)
    ? pendingUpdates[department].report
    : (reports[department] || reports['kerja-raya']);

  if (officerNameInput) officerNameInput.value = data.officer;
  if (summaryInput) summaryInput.value = data.summary;
  if (statusSelect) statusSelect.value = data.status;
  if (progressInput) progressInput.value = data.progress;
  if (initiativeInput) initiativeInput.value = data.initiatives[0] || '';
};

const populateGalleryForm = (department) => {
  if (!gallerySummaryInput || !galleryImageInput || !department || isSsmjDepartment(department)) {
    return;
  }

  const defaults = createDefaultGalleryItems();
  const galleryItems = getStoredGalleryItems();
  const fallback = defaults[department] || { image: '', summary: '' };
  const current = galleryItems[department] || fallback;
  const isUploadedImage = isUploadedGalleryDataUrl(current.image || '');

  gallerySummaryInput.value = current.summary || '';
  galleryImageInput.value = isUploadedImage ? '' : (current.image || '');
  galleryUploadedImageData = isUploadedImage ? (current.image || '') : '';

  if (galleryImageFileInput) {
    galleryImageFileInput.value = '';
  }

  updateGalleryPreview(galleryUploadedImageData || current.image || '', department);
};

const updateGalleryPreview = (imageUrl, department) => {
  if (!galleryPreviewImage || !galleryPreviewState) {
    return;
  }

  const defaults = createDefaultGalleryItems();
  const fallback = defaults[department] || { image: '', summary: '' };

  if (isUploadedGalleryDataUrl(imageUrl || '')) {
    galleryPreviewImage.hidden = false;
    galleryPreviewImage.src = String(imageUrl || '').trim();
    galleryPreviewImage.alt = `Pratonton gambar inisiatif ${getDepartmentTitle(department)}`;
    galleryPreviewState.textContent = 'Pratonton gambar upload untuk halaman utama.';
    return;
  }

  const validation = getGalleryImageValidation(imageUrl || '');
  const previewImage = validation.valid && validation.allowed ? validation.normalized : fallback.image;

  if (!previewImage) {
    galleryPreviewImage.hidden = true;
    galleryPreviewImage.removeAttribute('src');
    galleryPreviewState.textContent = 'Masukkan URL gambar sah untuk pratonton.';
    return;
  }

  galleryPreviewImage.hidden = false;
  galleryPreviewImage.src = previewImage;
  galleryPreviewImage.alt = `Pratonton gambar inisiatif ${getDepartmentTitle(department)}`;

  if (!validation.valid) {
    galleryPreviewState.textContent = 'URL tidak sah. Pratonton menggunakan gambar asal kementerian.';
    return;
  }

  if (!validation.allowed) {
    galleryPreviewState.textContent = 'Domain gambar tidak dibenarkan. Guna domain rasmi yang disokong.';
    return;
  }

  galleryPreviewState.textContent = 'Pratonton gambar semasa untuk halaman utama.';
};

const requireDashboardAccess = () => {
  const session = getAuthSession();

  if (!session || !departmentPasswords[session.department]) {
    return null;
  }

  return session;
};

const requireAdminAccessForMutation = () => {
  const session = requireDashboardAccess();
  if (!session || isSsmjDepartment(session.department) || session.department !== currentDepartment) {
    window.location.href = `login.html`;
    return null;
  }

  return session;
};

const applyDashboardMode = (session, reports) => {
  const isSsmj = isSsmjDepartment(session.department);
  const isSsmjAdmin = canAccessSsmjAdminFeatures(session);
  const ministryTargets = ['menu-maklumat', 'menu-status', 'menu-inisiatif', 'menu-galeri'];
  const ssmjTargets = ['menu-semakan', 'menu-pending'];

  adminMenuLinks.forEach((link) => {
    if (ministryTargets.includes(link.dataset.target)) {
      setHidden(link, isSsmj);
    }
    if (ssmjTargets.includes(link.dataset.target)) {
      setHidden(link, !isSsmjAdmin);
    }
    if (link.dataset.target === 'menu-dashboard') {
      setHidden(link, false);
    }
  });

  ministryTargets.forEach((panelId) => {
    const panel = document.getElementById(panelId);
    setHidden(panel, isSsmj);
  });

  const semakanPanel = document.getElementById('menu-semakan');
  setHidden(semakanPanel, !isSsmjAdmin);

  const pendingPanel = document.getElementById('menu-pending');
  setHidden(pendingPanel, !isSsmjAdmin);

  const dashboardPanel = document.getElementById('menu-dashboard');
  setHidden(dashboardPanel, false);

  if (ssmjFeatureBox) {
    setHidden(ssmjFeatureBox, !isSsmjAdmin);
  }

  if (sidebarUserLink) {
    setHidden(sidebarUserLink, !isSsmjAdmin);
  }

  if (adminActivityLink) {
    setHidden(adminActivityLink, !isSsmjAdmin);
  }

  if (isSsmj) {
    if (document.body) {
      document.body.dataset.dept = SSMJ_ADMIN_DEPARTMENT;
      document.body.classList.add('is-ssmj-admin');
    }
    if (dashboardTitle) {
      dashboardTitle.textContent = 'Gateway Semakan Sekretariat Sabah Maju Jaya';
    }
    if (dashboardSummary) {
      dashboardSummary.textContent = 'Semua kemaskini kementerian perlu disemak dan diluluskan oleh SSMJ sebelum dipaparkan pada dashboard utama.';
      setHidden(dashboardSummary, true);
    }
    if (pendingNotice) {
      pendingNotice.textContent = isSsmjAdmin
        ? 'Pantau metrik semasa di Dashboard, kemudian gunakan menu sisi untuk Semakan & Luluskan atau Pending Jabatan.'
        : 'Akses anda terhad sebagai pengguna biasa. Menu semakan dan kelulusan hanya untuk Admin SSMJ.';
      setHidden(pendingNotice, true);
    }
    if (dashboardSession && session.loggedInAt) {
      dashboardSession.textContent = `Sesi aktif SSMJ. Log masuk pada ${new Date(session.loggedInAt).toLocaleString('ms-MY')}.`;
    }
    renderSsmjSummary();
    renderSsmjDashboardKpis();
    renderActivityWidgets(SSMJ_ADMIN_DEPARTMENT, session);
    setHidden(ssmjKpiGrid, false);
    setHidden(ministryDashboardGrid, true);
    if (topbarUser) {
      topbarUser.textContent = `Pengguna: ${session.username || 'Admin SSMJ'}`;
    }
    if (topbarTime) {
      setHidden(topbarTime, true);
    }
    if (userSettingsButton) {
      setHidden(userSettingsButton, true);
    }
    setHidden(userSettingsForm, true);
    showPanel('menu-dashboard');
    if (isSsmjAdmin) {
      renderPendingApprovals();
      renderPendingFollowups();
    }
  } else {
    if (document.body) {
      document.body.classList.remove('is-ssmj-admin');
    }
    if (topbarTime) {
      setHidden(topbarTime, false);
    }
    updateTopbarUser(session.department, reports);
    if (userSettingsButton) {
      setHidden(userSettingsButton, false);
    }
    if (dashboardSummary) {
      setHidden(dashboardSummary, false);
    }
    if (pendingNotice) {
      setHidden(pendingNotice, false);
    }
    setHidden(ssmjKpiGrid, true);
    setHidden(ministryDashboardGrid, false);
    showPanel('menu-dashboard');
  }

  if (logoutLink) {
    logoutLink.textContent = 'Log Keluar';
    logoutLink.href = 'login.html';
    logoutLink.classList.add('topbar-danger');
  }

  if (adminTopbar) {
    adminTopbar.classList.remove('is-public');
  }
};

if (document.body.dataset.page === 'dashboard-admin') {
  const session = requireDashboardAccess();
  if (!session) {
    window.location.href = 'login.html';
  } else {
    const requestedDepartment = getDepartmentFromQuery() || session.department;
    const departmentAllowed = canAccessDepartmentDashboard(session, requestedDepartment || session.department);

    if (!departmentAllowed) {
      clearAuthSession();
      window.location.href = 'login.html';
      return;
    }

    initializeAdminSidebarToggle();
    const reports = getStoredReports();
    currentSession = session;
    updateAdminSidebarIdentity(session);

    if (isSsmjDepartment(session.department)) {
      currentDepartment = null;
      syncDashboardUrl(SSMJ_ADMIN_DEPARTMENT);
      applyDashboardMode(session, reports);
    } else {
      currentDepartment = session.department;
      syncDashboardUrl(session.department);
      renderDashboard(session.department, reports, currentSession);
      populateReportForm(session.department, reports);
      populateGalleryForm(session.department);
      applyDashboardMode(session, reports);
    }

    updateTopbarTime();
    setInterval(updateTopbarTime, 1000 * 30);

    adminMenuLinks.forEach((link) => {
      link.addEventListener('click', () => {
        if (!link.dataset.target) {
          return;
        }
        showPanel(link.dataset.target);
      });
    });
  }
}

if (document.body.dataset.page === 'dashboard-admin-review') {
  const session = requireDashboardAccess();
  if (!canAccessSsmjAdminFeatures(session)) {
    window.location.href = 'login.html';
  } else {
    initializeAdminSidebarToggle();
    currentSession = session;
    updateAdminSidebarIdentity(session);
    syncDashboardUrl(SSMJ_ADMIN_DEPARTMENT);
    updateTopbarTime();
    setInterval(updateTopbarTime, 1000 * 30);
    if (topbarUser) {
      topbarUser.textContent = `Pengguna: ${session.username || 'Admin SSMJ'}`;
    }
    renderPendingApprovals();
    if (dashboardSession && session.loggedInAt) {
      dashboardSession.textContent = `Sesi aktif SSMJ. Log masuk pada ${new Date(session.loggedInAt).toLocaleString('ms-MY')}.`;
    }
    if (logoutLink) {
      logoutLink.addEventListener('click', () => {
        clearAuthSession();
      });
    }
  }
}

if (document.body.dataset.page === 'dashboard-admin-pending') {
  const session = requireDashboardAccess();
  if (!canAccessSsmjAdminFeatures(session)) {
    window.location.href = 'login.html';
  } else {
    initializeAdminSidebarToggle();
    currentSession = session;
    updateAdminSidebarIdentity(session);
    syncDashboardUrl(SSMJ_ADMIN_DEPARTMENT);
    updateTopbarTime();
    setInterval(updateTopbarTime, 1000 * 30);
    if (topbarUser) {
      topbarUser.textContent = `Pengguna: ${session.username || 'Admin SSMJ'}`;
    }
    renderPendingFollowups();
    if (dashboardSession && session.loggedInAt) {
      dashboardSession.textContent = `Sesi aktif SSMJ. Log masuk pada ${new Date(session.loggedInAt).toLocaleString('ms-MY')}.`;
    }
    if (logoutLink) {
      logoutLink.addEventListener('click', () => {
        clearAuthSession();
      });
    }
  }
}

if (document.body.dataset.page === 'dashboard-admin-users') {
  const session = requireDashboardAccess();
  if (!canAccessSsmjAdminFeatures(session)) {
    window.location.href = 'login.html';
  } else {
    currentSession = session;
    updateAdminSidebarIdentity(session);
    syncDashboardUrl(SSMJ_ADMIN_DEPARTMENT);
    initializeAdminSidebarToggle();
    updateTopbarTime();
    setInterval(updateTopbarTime, 1000 * 30);
    if (topbarUser) {
      topbarUser.textContent = `Pengguna: ${session.username || 'Admin SSMJ'}`;
    }
    renderAdminUsers();

    if (logoutLink) {
      logoutLink.addEventListener('click', () => {
        clearAuthSession();
      });
    }
  }
}

if (document.body.dataset.page === 'dashboard-admin-activity') {
  const session = requireDashboardAccess();
  if (!canAccessSsmjAdminFeatures(session)) {
    window.location.href = 'login.html';
  } else {
    initializeAdminSidebarToggle();
    currentSession = session;
    updateAdminSidebarIdentity(session);
    syncDashboardUrl(SSMJ_ADMIN_DEPARTMENT);
    updateTopbarTime();
    setInterval(updateTopbarTime, 1000 * 30);

    if (topbarUser) {
      topbarUser.textContent = `Pengguna: ${session.username || 'Admin SSMJ'}`;
    }

    renderActivityWidgets(SSMJ_ADMIN_DEPARTMENT, session);
    renderActivityManagementList(session);

    if (activityForm) {
      activityForm.addEventListener('submit', (event) => {
        event.preventDefault();

        const title = activityTitleInput ? activityTitleInput.value.trim() : '';
        const date = activityDateInput ? activityDateInput.value : '';
        const time = activityTimeInput ? activityTimeInput.value : '';
        const department = activityDepartmentInput ? activityDepartmentInput.value : '';
        const description = activityDescriptionInput ? activityDescriptionInput.value.trim() : '';
        const alert = Boolean(activityAlertInput && activityAlertInput.checked);

        if (!title || !date || !department) {
          saveSectionFeedback(activityFeedback, 'Tajuk aktiviti, tarikh dan sasaran kementerian wajib diisi.');
          return;
        }

        const activities = getStoredActivities();
        const activity = {
          id: `activity-${Date.now()}`,
          title,
          date,
          time,
          department,
          description,
          alert,
          createdAt: new Date().toISOString(),
          createdBy: session.username || 'Admin SSMJ'
        };

        activities.unshift(activity);
        saveStoredActivities(activities.sort(sortActivities));
        renderActivityWidgets(SSMJ_ADMIN_DEPARTMENT, session);
        renderActivityManagementList(session);
        activityForm.reset();

        if (activityAlertInput) {
          activityAlertInput.checked = true;
        }

        saveSectionFeedback(activityFeedback, 'Aktiviti takwim berjaya ditambah dan dipaparkan pada kalendar.');
      });
    }

    if (activityManagementList) {
      activityManagementList.addEventListener('click', (event) => {
        const button = event.target.closest('button[data-action="delete-activity"]');
        if (!button) {
          return;
        }

        const activities = getStoredActivities().filter((activity) => activity.id !== button.dataset.activityId);
        saveStoredActivities(activities);
        renderActivityWidgets(SSMJ_ADMIN_DEPARTMENT, session);
        renderActivityManagementList(session);
        saveSectionFeedback(activityFeedback, 'Aktiviti takwim telah dipadam.');
      });
    }

    if (logoutLink) {
      logoutLink.addEventListener('click', () => {
        clearAuthSession();
      });
    }
  }
}

if (document.body.dataset.page === 'dashboard') {
  const requestedDepartment = getDepartmentFromQuery();
  const reports = getStoredReports();
  const fallbackDepartment = 'kerja-raya';
  const activeDepartment = isPublicDashboardDepartment(requestedDepartment) ? requestedDepartment : fallbackDepartment;

  currentDepartment = activeDepartment;
  currentSession = null;

  syncDashboardUrl(activeDepartment);
  renderDashboard(activeDepartment, reports, null);
  renderPublicAnalytics(activeDepartment, reports);
}

if (document.body.classList.contains('index-page')) {
  renderHomepageGallery();
}

if (loginForm && departmentSelect && document.getElementById('email-input') && document.getElementById('password-input')) {
  const preferredDepartment = getDepartmentFromQuery();
  const emailInput = document.getElementById('email-input');

  if (isValidDepartment(preferredDepartment)) {
    departmentSelect.value = preferredDepartment;
  }

  const updateForgotPasswordLink = () => {
    if (!forgotPasswordLink) {
      return;
    }

    const params = new URLSearchParams();
    const email = emailInput ? emailInput.value.trim().toLowerCase() : '';
    if (email) {
      params.set('email', email);
    }
    if (isValidDepartment(departmentSelect.value)) {
      params.set('dept', departmentSelect.value);
    }
    forgotPasswordLink.href = `forgot-password.html${params.toString() ? `?${params.toString()}` : ''}`;
  };

  if (emailInput) {
    emailInput.addEventListener('input', updateForgotPasswordLink);
  }
  departmentSelect.addEventListener('change', updateForgotPasswordLink);
  updateForgotPasswordLink();

  loginForm.addEventListener('submit', async (event) => {
    event.preventDefault();

    const emailInput = document.getElementById('email-input');
    const passwordInput = document.getElementById('password-input');
    const email = (emailInput ? emailInput.value.trim() : '').toLowerCase();
    const department = departmentSelect.value;
    const passwordRaw = passwordInput ? passwordInput.value.trim() : '';
    const password = normalizePassword(passwordRaw);

    if (!email || !department || !passwordRaw || !isValidDepartment(department)) {
      if (loginFeedback) {
        loginFeedback.textContent = 'Email, kementerian yang sah dan kata laluan wajib diisi.';
      }
      return;
    }

    if (loginFeedback) {
      loginFeedback.textContent = '';
    }

    if (firebaseAuth && isFirebaseConfigured()) {
      try {
        const credential = await firebaseAuth.signInWithEmailAndPassword(email, passwordRaw);
        const user = credential.user;

        if (!user.emailVerified) {
          await firebaseAuth.signOut();
          if (loginFeedback) {
            loginFeedback.textContent = 'Sila sahkan email Firebase anda sebelum log masuk.';
          }
          return;
        }

        const departmentTitle = getDepartmentTitle(department);
        const authRole = department === SSMJ_ADMIN_DEPARTMENT ? 'Admin SSMJ' : 'User';

        setAuthSession(
          department,
          user.displayName || user.email?.split('@')[0] || email.split('@')[0],
          authRole,
          departmentTitle
        );

        window.location.href = `admin-dashboard.html?dept=${department}`;
        return;
      } catch (error) {
        if (loginFeedback) {
          loginFeedback.textContent = 'Login Firebase gagal. Sila semak email dan kata laluan yang benar.';
        }
        console.warn('Firebase login failed:', error);
        return;
      }
    }

    const users = getStoredUsers();
    const departmentTitle = getDepartmentTitle(department);
    const matchedUser = users.find((user) => {
      const cleanedUsername = (user.username || '').trim().toLowerCase();
      const cleanedEmail = (user.email || '').trim().toLowerCase();
      const sameIdentity = cleanedUsername === email || cleanedEmail === email;
      const samePassword = normalizePassword(user.password || '') === password;
      const userMinistryCode = user.ministryCode || getDepartmentCodeFromTitle(user.ministry || '');
      const userMinistryTitle = (user.ministry || '').trim();
      const sameMinistry = !userMinistryCode
        ? (!userMinistryTitle || userMinistryTitle === departmentTitle)
        : userMinistryCode === department;
      const validRoleForDepartment = department === SSMJ_ADMIN_DEPARTMENT
        ? isSsmjAdminRole(user.role)
        : (isGeneralUserRole(user.role) || isSsmjAdminRole(user.role) || !user.role);

      return sameIdentity && samePassword && sameMinistry && validRoleForDepartment;
    });

    if (users.length > 0 && !matchedUser) {
      if (loginFeedback) {
        loginFeedback.textContent = 'Pengesahan gagal. Sila semak email, kementerian dan kata laluan yang didaftarkan.';
      }
      return;
    }

    if (!matchedUser && (!departmentPasswords[department] || password !== normalizePassword(departmentPasswords[department]))) {
      if (loginFeedback) {
        loginFeedback.textContent = 'Pengesahan gagal. Pastikan anda menggunakan kata laluan yang sah untuk kementerian tersebut.';
      }
      return;
    }

    const authRole = matchedUser
      ? (matchedUser.role || '')
      : (department === SSMJ_ADMIN_DEPARTMENT ? 'Admin SSMJ' : 'User');

    if (department === SSMJ_ADMIN_DEPARTMENT && !isSsmjAdminRole(authRole)) {
      if (loginFeedback) {
        loginFeedback.textContent = 'Akses Admin SSMJ hanya dibenarkan untuk akaun berperanan admin.';
      }
      return;
    }

    setAuthSession(
      department,
      matchedUser ? (matchedUser.username || matchedUser.email || email.split('@')[0]) : email.split('@')[0],
      authRole,
      matchedUser
        ? (matchedUser.ministry || getDepartmentTitle(matchedUser.ministryCode || department))
        : departmentTitle
    );
    window.location.href = `admin-dashboard.html?dept=${department}`;
  });
}

if (forgotPasswordForm && forgotEmailInput && forgotDepartmentSelect) {
  const recoveryParams = new URLSearchParams(window.location.search);
  const recoveryEmail = recoveryParams.get('email') || '';
  const recoveryDepartment = recoveryParams.get('dept') || '';

  if (recoveryEmail) {
    forgotEmailInput.value = recoveryEmail;
  }
  if (isValidDepartment(recoveryDepartment)) {
    forgotDepartmentSelect.value = recoveryDepartment;
  }

  const updateForgotAccountSummary = () => {
    const email = forgotEmailInput.value.trim().toLowerCase();
    const department = forgotDepartmentSelect.value;
    const departmentTitle = department && isValidDepartment(department)
      ? getDepartmentTitle(department)
      : 'Kementerian belum dipilih';

    if (forgotAccountSummary) {
      forgotAccountSummary.textContent = email
        ? `Email: ${email} | Kementerian: ${departmentTitle}`
        : `Email belum diisi | Kementerian: ${departmentTitle}`;
    }
  };

  forgotEmailInput.addEventListener('input', updateForgotAccountSummary);
  forgotDepartmentSelect.addEventListener('change', updateForgotAccountSummary);
  updateForgotAccountSummary();

  forgotPasswordForm.addEventListener('submit', async (event) => {
    event.preventDefault();

    const email = forgotEmailInput.value.trim().toLowerCase();
    const department = forgotDepartmentSelect.value;

    if (!email || !isValidDepartment(department)) {
      if (forgotPasswordFeedback) {
        forgotPasswordFeedback.textContent = 'Alamat email dan kementerian yang sah wajib diisi.';
      }
      return;
    }

    if (!firebaseAuth || !isFirebaseConfigured()) {
      if (forgotPasswordFeedback) {
        forgotPasswordFeedback.textContent = 'Firebase Authentication belum tersedia. Sila hubungi pentadbir sistem.';
      }
      return;
    }

    const submitButton = forgotPasswordForm.querySelector('button[type="submit"]');
    if (submitButton) {
      submitButton.disabled = true;
    }

    try {
      await firebaseAuth.sendPasswordResetEmail(email);
      if (forgotPasswordFeedback) {
        forgotPasswordFeedback.textContent = `Pautan reset telah dihantar ke ${email}. Semak Inbox atau folder Spam.`;
      }
    } catch (error) {
      if (forgotPasswordFeedback) {
        forgotPasswordFeedback.textContent = error.code === 'auth/user-not-found'
          ? 'Email ini belum didaftarkan dalam Firebase Authentication.'
          : 'Pautan reset tidak dapat dihantar. Sila semak email dan cuba lagi.';
      }
      console.warn('Firebase password reset failed:', error);
    } finally {
      if (submitButton) {
        submitButton.disabled = false;
      }
    }
  });
}

if (resendVerificationButton) {
  resendVerificationButton.addEventListener('click', async () => {
    const emailInput = document.getElementById('email-input');
    const passwordInput = document.getElementById('password-input');
    const email = emailInput ? emailInput.value.trim().toLowerCase() : '';
    const password = passwordInput ? passwordInput.value.trim() : '';

    if (!email || !password) {
      if (loginFeedback) {
        loginFeedback.textContent = 'Masukkan email dan kata laluan untuk menghantar semula pengesahan email.';
      }
      return;
    }

    if (!firebaseAuth || !isFirebaseConfigured()) {
      if (loginFeedback) {
        loginFeedback.textContent = 'Pengesahan email Firebase belum tersedia dalam mod demo tempatan.';
      }
      return;
    }

    try {
      const credential = await firebaseAuth.signInWithEmailAndPassword(email, password);
      if (credential.user.emailVerified) {
        if (loginFeedback) {
          loginFeedback.textContent = 'Email anda telah pun disahkan. Anda boleh log masuk.';
        }
      } else {
        await credential.user.sendEmailVerification();
        if (loginFeedback) {
          loginFeedback.textContent = 'Email pengesahan baharu telah dihantar.';
        }
      }
      await firebaseAuth.signOut();
    } catch (error) {
      if (loginFeedback) {
        loginFeedback.textContent = 'Email atau kata laluan tidak sah.';
      }
      console.warn('Firebase verification email failed:', error);
    }
  });
}

if (reportForm) {
  reportForm.addEventListener('submit', (event) => {
    event.preventDefault();

    const session = requireAdminAccessForMutation();
    if (!session) {
      return;
    }

    const officerName = officerNameInput.value.trim();
    const summary = summaryInput.value.trim();

    submitPendingUpdate({
      department: session.department,
      officerName,
      updateType: 'Kemaskini Maklumat',
      mutate: (draft) => {
        draft.summary = summary;
      }
    });

    refreshDashboardView();
    clearAllFeedbacks();
    saveSectionFeedback(reportFeedback, 'Kemaskini maklumat telah dihantar ke Gateway SSMJ untuk semakan dan kelulusan.');
  });
}

if (statusForm) {
  statusForm.addEventListener('submit', (event) => {
    event.preventDefault();

    const session = requireAdminAccessForMutation();
    if (!session) {
      return;
    }

    const reports = getStoredReports();
    const report = reports[session.department];
    const officerName = (officerNameInput.value || report.officer).trim();
    const status = statusSelect.value;
    const progress = Number(progressInput.value);

    submitPendingUpdate({
      department: session.department,
      officerName,
      updateType: 'Kemaskini Status',
      mutate: (draft) => {
        draft.status = status;
        draft.progress = Math.min(100, Math.max(0, progress));
      }
    });

    refreshDashboardView();
    clearAllFeedbacks();
    saveSectionFeedback(statusFeedback, 'Kemaskini status dihantar ke Gateway SSMJ untuk semakan dan kelulusan.');
  });
}

if (initiativeForm) {
  initiativeForm.addEventListener('submit', (event) => {
    event.preventDefault();

    const session = requireAdminAccessForMutation();
    if (!session) {
      return;
    }

    const reports = getStoredReports();
    const report = reports[session.department];
    const officerName = (officerNameInput.value || report.officer).trim();
    const initiative = initiativeInput.value.trim();

    submitPendingUpdate({
      department: session.department,
      officerName,
      updateType: 'Kemaskini Inisiatif',
      mutate: (draft) => {
        const currentInitiatives = Array.isArray(draft.initiatives) ? draft.initiatives : [];
        draft.initiatives = [initiative, ...currentInitiatives.filter((item) => item !== initiative)].slice(0, 3);
      }
    });

    refreshDashboardView();
    clearAllFeedbacks();
    saveSectionFeedback(initiativeFeedback, 'Kemaskini inisiatif dihantar ke Gateway SSMJ untuk semakan dan kelulusan.');
  });
}

if (galleryForm) {
  galleryForm.addEventListener('submit', async (event) => {
    event.preventDefault();

    if (gallerySubmissionInProgress) {
      saveSectionFeedback(galleryFeedback, 'Semakan pautan gambar sedang berjalan. Sila tunggu sebentar.');
      return;
    }

    const session = requireAdminAccessForMutation();
    if (!session) {
      return;
    }

    const summary = gallerySummaryInput ? gallerySummaryInput.value.trim() : '';
    const image = galleryImageInput ? galleryImageInput.value.trim() : '';
    const hasUploadedImage = Boolean(galleryUploadedImageData);

    if (!summary || (!image && !hasUploadedImage)) {
      saveSectionFeedback(galleryFeedback, 'Ringkasan galeri wajib diisi serta pilih URL atau upload gambar.');
      return;
    }

    if (galleryUploadInProgress) {
      saveSectionFeedback(galleryFeedback, 'Gambar upload sedang diproses. Sila tunggu sebentar.');
      return;
    }

    let finalImage = '';

    if (hasUploadedImage) {
      finalImage = galleryUploadedImageData;
    } else {
      const imageValidation = getGalleryImageValidation(image);

      if (!imageValidation.valid) {
        updateGalleryPreview(image, session.department);
        saveSectionFeedback(galleryFeedback, 'Pautan gambar tidak sah. Gunakan URL bermula dengan http:// atau https://.');
        return;
      }

      if (!imageValidation.allowed) {
        updateGalleryPreview(image, session.department);
        saveSectionFeedback(galleryFeedback, `Domain gambar tidak dibenarkan. Sila guna: ${ALLOWED_GALLERY_IMAGE_HOSTS.join(', ')}.`);
        return;
      }

      saveSectionFeedback(galleryFeedback, 'Semakan pautan gambar sedang dijalankan...');

      const imageCanLoad = await canLoadGalleryImage(imageValidation.normalized);
      if (!imageCanLoad) {
        saveSectionFeedback(galleryFeedback, 'Gambar tidak dapat dimuatkan. Sila semak pautan dan cuba lagi.');
        return;
      }

      finalImage = imageValidation.normalized;
    }

    gallerySubmissionInProgress = true;
    const submitButton = galleryForm.querySelector('button[type="submit"]');
    if (submitButton) {
      submitButton.disabled = true;
    }

    try {
      if (hasUploadedImage) {
        saveSectionFeedback(galleryFeedback, 'Menyimpan gambar upload ke galeri kementerian...');
      }

      const galleryItems = getStoredGalleryItems();
      galleryItems[session.department] = {
        ...galleryItems[session.department],
        summary,
        image: finalImage,
        updatedAt: new Date().toISOString(),
        updatedBy: session.username || 'Pegawai kementerian'
      };

      saveStoredGalleryItems(galleryItems);
      updateGalleryPreview(finalImage, session.department);
      clearAllFeedbacks();
      saveSectionFeedback(galleryFeedback, 'Galeri kementerian berjaya dikemaskini dan dipaparkan di halaman utama.');
    } finally {
      gallerySubmissionInProgress = false;
      if (submitButton) {
        submitButton.disabled = false;
      }
    }
  });
}

if (galleryImageInput) {
  galleryImageInput.addEventListener('input', () => {
    if (!currentSession || !currentSession.department || isSsmjDepartment(currentSession.department)) {
      return;
    }

    if (galleryImageInput.value.trim()) {
      galleryUploadedImageData = '';
      if (galleryImageFileInput) {
        galleryImageFileInput.value = '';
      }
    }

    updateGalleryPreview(galleryImageInput.value, currentSession.department);
  });
}

if (galleryImageFileInput) {
  galleryImageFileInput.addEventListener('change', async () => {
    if (!currentSession || !currentSession.department || isSsmjDepartment(currentSession.department)) {
      return;
    }

    const selectedFile = galleryImageFileInput.files && galleryImageFileInput.files[0];
    if (!selectedFile) {
      galleryUploadedImageData = '';
      updateGalleryPreview(galleryImageInput ? galleryImageInput.value : '', currentSession.department);
      return;
    }

    galleryUploadInProgress = true;
    saveSectionFeedback(galleryFeedback, 'Gambar upload sedang diproses...');

    try {
      const processedImageData = await prepareUploadedGalleryImage(selectedFile);
      galleryUploadedImageData = processedImageData;
      if (galleryImageInput) {
        galleryImageInput.value = '';
      }
      updateGalleryPreview(processedImageData, currentSession.department);
      saveSectionFeedback(galleryFeedback, 'Gambar upload sedia untuk disimpan. Klik Simpan Galeri Inisiatif.');
    } catch (error) {
      galleryUploadedImageData = '';
      updateGalleryPreview(galleryImageInput ? galleryImageInput.value : '', currentSession.department);
      saveSectionFeedback(galleryFeedback, getUploadGalleryErrorMessage(error));
    } finally {
      galleryUploadInProgress = false;
    }
  });
}

if (pendingApprovalsList) {
  pendingApprovalsList.addEventListener('click', (event) => {
    const button = event.target.closest('button[data-action][data-department]');
    if (!button) {
      return;
    }

    const session = requireDashboardAccess();
    if (!canAccessSsmjAdminFeatures(session)) {
      window.location.href = 'login.html';
      return;
    }

    const action = button.dataset.action;
    const department = button.dataset.department;
    const pendingUpdates = getStoredPendingUpdates();
    const payload = pendingUpdates[department];

    if (!payload) {
      renderPendingApprovals();
      return;
    }

    if (action === 'approve') {
      const reports = getStoredReports();
      reports[department] = cloneJson(payload.report);
      reports[department].updated = formatUpdatedStamp();
      reports[department].statusText = 'Kemaskini ini telah disemak dan diluluskan oleh Sekretariat Sabah Maju Jaya (SSMJ).';
      saveReports(reports);

      const followups = getStoredPendingFollowups();
      if (followups[department]) {
        delete followups[department];
        savePendingFollowups(followups);
      }

      saveSectionFeedback(approvalFeedback, `${getDepartmentTitle(department)} telah diluluskan dan dipaparkan ke dashboard utama.`);
    }

    if (action === 'reject') {
      const followups = getStoredPendingFollowups();
      followups[department] = {
        rejectedAt: new Date().toISOString(),
        updateType: payload.updateType || 'Kemaskini kementerian'
      };
      savePendingFollowups(followups);

      saveSectionFeedback(approvalFeedback, `Kemaskini ${getDepartmentTitle(department)} ditolak. Kementerian boleh hantar semula selepas pembetulan.`);
    }

    delete pendingUpdates[department];
    savePendingUpdates(pendingUpdates);
    renderPendingApprovals();
    renderPendingFollowups();
    renderSsmjSummary();
    renderSsmjDashboardKpis();
  });
}

if (featureLinks.length) {
  featureLinks.forEach((link) => {
    link.addEventListener('click', () => {
      const panelId = link.dataset.target;
      if (!panelId) {
        return;
      }
      showPanel(panelId);
    });
  });
}

if (adminUsersForm) {
  adminUsersForm.addEventListener('submit', async (event) => {
    event.preventDefault();

    const session = requireDashboardAccess();
    if (!session || !isSsmjDepartment(session.department)) {
      window.location.href = 'login.html';
      return;
    }

    const username = adminUserUsernameInput ? adminUserUsernameInput.value.trim() : '';
    const password = adminUserPasswordInput ? adminUserPasswordInput.value.trim() : '';
    const role = adminUserRoleInput ? adminUserRoleInput.value.trim() : '';
    const ministryCode = adminUserMinistryInput ? adminUserMinistryInput.value.trim() : '';
    const ministry = getDepartmentTitle(ministryCode);

    if (!username || !password || !role || !ministryCode) {
      saveSectionFeedback(adminUsersFeedback, 'Email, password, role pengguna dan kementerian wajib diisi.');
      return;
    }

    if (firebaseRegistrationAuth && password.length < 6) {
      saveSectionFeedback(adminUsersFeedback, 'Password Firebase mestilah sekurang-kurangnya 6 aksara.');
      return;
    }

    if (firebaseRegistrationAuth) {
      try {
        await firebaseRegistrationAuth.createUserWithEmailAndPassword(username.toLowerCase(), password);
        await firebaseRegistrationAuth.signOut();
      } catch (error) {
        const message = error.code === 'auth/email-already-in-use'
          ? 'Email ini sudah wujud dalam Firebase Authentication.'
          : 'Akaun Firebase tidak dapat dicipta. Sila semak email dan password.';
        saveSectionFeedback(adminUsersFeedback, message);
        return;
      }
    }

    const users = getStoredUsers();
    const existingIndex = users.findIndex((user) => user.username.toLowerCase() === username.toLowerCase());
    const userPayload = {
      username,
      password,
      role,
      ministryCode,
      ministry,
      createdAt: new Date().toISOString()
    };

    if (existingIndex >= 0) {
      users[existingIndex] = {
        ...users[existingIndex],
        password,
        role,
        ministryCode,
        ministry,
        createdAt: users[existingIndex].createdAt || userPayload.createdAt
      };
      saveSectionFeedback(adminUsersFeedback, `Pengguna ${username} telah dikemas kini.`);
    } else {
      users.unshift(userPayload);
      saveSectionFeedback(adminUsersFeedback, `Pengguna ${username} berjaya dicipta.`);
    }

    saveStoredUsers(users);
    renderAdminUsers();

    adminUsersForm.reset();
  });
}

if (userSettingsButton) {
  userSettingsButton.addEventListener('click', () => {
    if (!userSettingsForm) {
      return;
    }

    const currentName = officerNameInput ? officerNameInput.value.trim() : '';
    userSettingsName.value = currentName;
    userSettingsForm.hidden = !userSettingsForm.hidden;
  });
}

if (userSettingsForm) {
  userSettingsForm.addEventListener('submit', (event) => {
    event.preventDefault();

    const session = requireAdminAccessForMutation();
    if (!session) {
      return;
    }

    const name = userSettingsName.value.trim();
    if (!name || !currentDepartment) {
      return;
    }

    const reports = getStoredReports();
    const report = reports[currentDepartment];
    report.officer = name;
    report.updated = formatUpdatedStamp();

    saveReports(reports);
    refreshDashboardView();
    clearAllFeedbacks();
    saveSectionFeedback(reportFeedback, 'Nama pengguna berjaya dikemaskini melalui setting.');
    userSettingsForm.hidden = true;
    showPanel('menu-maklumat');
  });
}

if (logoutLink) {
  logoutLink.addEventListener('click', () => {
    clearAuthSession();
  });
}

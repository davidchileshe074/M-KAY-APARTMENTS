/**
 * M KAY APARTMENTS — Admin Dashboard JavaScript
 * Complete modular dashboard controller.
 */

// Global State
let cachedState = null;
let cachedBookings = [];
let cachedPricing = [];
let cachedBlockedDates = [];
let cachedGallery = [];
let calendarInstance = null;

// Helper: Get Firebase API (wait for initialization)
async function getFirebaseApi() {
  if (window.firebaseApi) return window.firebaseApi;
  if (window.firebaseApiReady) return await window.firebaseApiReady;
  return new Promise((resolve) => {
    const check = setInterval(() => {
      if (window.firebaseApi) {
        clearInterval(check);
        resolve(window.firebaseApi);
      }
    }, 100);
  });
}

// Helper: Format ZMW Currency
function formatCurrency(amount) {
  return `K${Number(amount || 0).toLocaleString()}`;
}

// Helper: Format Date for Display
function formatDate(dateStr) {
  if (!dateStr) return '';
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return dateStr;
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

// Helper: Calculate Nights between two dates
function calcNights(checkin, checkout) {
  if (!checkin || !checkout) return 0;
  const start = new Date(checkin);
  const end = new Date(checkout);
  const diffTime = Math.abs(end - start);
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays || 0;
}

// Helper: Get Month Name from 1-indexed number
function getMonthName(monthIndex) {
  const months = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];
  return months[monthIndex - 1] || '';
}

// Helper: Show Toast Notification
function showToast(message, type = 'info') {
  const container = document.getElementById('adminToastContainer');
  if (!container) return;

  const toast = document.createElement('div');
  toast.className = `admin-toast admin-toast-${type}`;
  
  let icon = 'fa-circle-info';
  if (type === 'success') icon = 'fa-circle-check';
  if (type === 'error') icon = 'fa-circle-exclamation';
  if (type === 'warning') icon = 'fa-triangle-exclamation';

  toast.innerHTML = `
    <i class="fa-solid ${icon}"></i>
    <span>${message}</span>
  `;
  container.appendChild(toast);

  // Trigger animation reflow
  setTimeout(() => toast.classList.add('show'), 10);

  // Auto remove
  setTimeout(() => {
    toast.classList.remove('show');
    setTimeout(() => toast.remove(), 300);
  }, 3500);
}

// Helper: Calculate Total Booking Price dynamically
function calculateBookingPrice(booking, state, pricing) {
  if (!booking.checkin || !booking.checkout) return 0;
  const start = new Date(booking.checkin);
  const end = new Date(booking.checkout);
  let total = 0;
  
  const current = new Date(start);
  while (current < end) {
    const month = current.getMonth() + 1; // 1-indexed
    const year = current.getFullYear();
    
    // Check custom seasonal pricing first
    const customRate = pricing.find(p => Number(p.month) === month && Number(p.year) === year);
    if (customRate) {
      total += Number(customRate.nightlyRate || customRate.price || 0);
    } else {
      // Check legacy state rules
      const legacyRule = (state?.seasonalRules || []).find(r => Number(r.month) === month && r.enabled !== false);
      if (legacyRule) {
        total += Number(legacyRule.price || 0);
      } else {
        total += Number(state?.basePrice || 2000);
      }
    }
    current.setDate(current.getDate() + 1);
  }
  return total;
}

// ── SESSION & AUTH ───────────────────────────────────────────────────────────
function getToken() {
  return sessionStorage.getItem('mkAdminToken');
}

function checkSession() {
  const token = getToken();
  const loginScreen = document.getElementById('mkAdminLogin');
  const dashboard = document.getElementById('mkAdminDashboard');
  
  if (token === 'admin_token_123') {
    loginScreen.style.display = 'none';
    dashboard.style.display = 'flex';
    initDashboard();
  } else {
    loginScreen.style.display = 'flex';
    dashboard.style.display = 'none';
  }
}

// Wire Auth Login Form
document.getElementById('adminLoginForm').addEventListener('submit', async (e) => {
  e.preventDefault();
  const emailInput = document.getElementById('adminEmailInput');
  const passwordInput = document.getElementById('adminPasswordInput');
  const errorEl = document.getElementById('adminLoginError');
  const btn = document.getElementById('adminLoginBtn');
  const btnIcon = document.getElementById('loginBtnIcon');
  const btnText = document.getElementById('loginBtnText');

  errorEl.textContent = '';
  btn.disabled = true;
  btnIcon.className = 'fa-solid fa-spinner fa-spin';
  btnText.textContent = 'Authenticating...';

  try {
    const firebaseApi = await getFirebaseApi();
    if (!firebaseApi?.signInAdmin) {
      throw new Error('Firebase authentication module is not initialized.');
    }
    
    // Log in with Firebase email & password
    await firebaseApi.signInAdmin(emailInput.value, passwordInput.value);
    
    // Store the admin token for backend API authentication
    sessionStorage.setItem('mkAdminToken', 'admin_token_123');
    showToast('Welcome back, Administrator!', 'success');
    
    emailInput.value = '';
    passwordInput.value = '';
    checkSession();
  } catch (err) {
    console.error(err);
    errorEl.textContent = err.message || 'Invalid admin credentials.';
    showToast('Authentication failed', 'error');
  } finally {
    btn.disabled = false;
    btnIcon.className = 'fa-solid fa-lock-open';
    btnText.textContent = 'Sign In';
  }
});

// Logout Button Handler
document.getElementById('adminLogoutBtn').addEventListener('click', async () => {
  sessionStorage.removeItem('mkAdminToken');
  try {
    const firebaseApi = await getFirebaseApi();
    if (firebaseApi?.signOutAdmin) {
      await firebaseApi.signOutAdmin();
    }
  } catch (err) {
    console.warn('Firebase signout warning:', err);
  }
  showToast('Logged out successfully', 'info');
  checkSession();
});

// ── NAVIGATION & SIDEBAR ──────────────────────────────────────────────────────
function switchSection(name) {
  // Hide all sections
  document.querySelectorAll('.admin-section').forEach(sec => sec.classList.remove('active'));
  
  // Show target section
  const target = document.getElementById(`section-${name}`);
  if (target) target.classList.add('active');
  
  // Update sidebar links
  document.querySelectorAll('.sidebar-link').forEach(link => {
    if (link.dataset.section === name) {
      link.classList.add('active');
    } else {
      link.classList.remove('active');
    }
  });

  // Mobile menu close
  const sidebar = document.getElementById('adminSidebar');
  const overlay = document.getElementById('sidebarOverlay');
  sidebar.classList.remove('active');
  overlay.style.display = 'none';

  // Load Section Specific Data
  if (name === 'overview') loadOverview();
  else if (name === 'apartments') loadApartments();
  else if (name === 'gallery') loadGallery();
  else if (name === 'pricing') loadPricing();
  else if (name === 'calendar') loadCalendar();
  else if (name === 'bookings') loadBookings();
  else if (name === 'settings') loadSettings();
}

// Setup Nav Click Listeners
document.querySelectorAll('.sidebar-link[data-section]').forEach(link => {
  link.addEventListener('click', (e) => {
    e.preventDefault();
    switchSection(link.dataset.section);
  });
});

// Mobile Menu Toggle
const mobileBtn = document.getElementById('adminMobileMenuBtn');
const sidebar = document.getElementById('adminSidebar');
const overlay = document.getElementById('sidebarOverlay');

mobileBtn.addEventListener('click', () => {
  sidebar.classList.add('active');
  overlay.style.display = 'block';
});

overlay.addEventListener('click', () => {
  sidebar.classList.remove('active');
  overlay.style.display = 'none';
});

// ── DASHBOARD INITIALIZATION ──────────────────────────────────────────────────
let subscriptionsActive = false;

// Default CMS state seeded from the local cms.json structure
const DEFAULT_CMS_STATE = {
  basePrice: 2000,
  hero: {
    kicker: "Livingstone, Zambia | Dambwa North Extension",
    headline: "Luxury Meets Comfort in Livingstone",
    subtitle: "Experience modern apartments with Starlink internet, backup power, air-conditioned rooms, and unforgettable comfort.",
    statPills: [
      { icon: "fa-solid fa-shield-halved", text: "24/7 Security" },
      { icon: "fa-solid fa-wifi", text: "Starlink WiFi" },
      { icon: "fa-solid fa-bolt", text: "Backup Power" },
      { icon: "fa-solid fa-hotel", text: "Luxury Apartments" }
    ]
  },
  about: {
    title: "Premium Hospitality for Every Traveler",
    paragraphs: [
      "M KAY APARTMENTS LTD offers modern, comfortable, and affordable luxury apartments in the heart of Livingstone, Zambia.",
      "Designed for travelers, tourists, families, and business guests, our apartments provide the perfect blend of comfort, convenience, security, and entertainment to make your stay memorable."
    ],
    images: [
      "assets/628243551_122164141748841441_551392952465463934_n.jpg",
      "assets/629235778_122164141736841441_5726096542652318515_n.jpg",
      "assets/557449767_122144858396841441_3476021069714433910_n.jpg"
    ]
  },
  apartments: [
    {
      name: "Executive Comfort Suite",
      priceLabel: "K2,000 / night",
      badge: "Available Tonight",
      features: ["Air-conditioned rooms", "Smart TV with Netflix", "Starlink high-speed internet", "Modern kitchen and clean bathroom"],
      images: [
        "assets/630362444_122164141550841441_5390268530041289102_n.jpg",
        "assets/628303594_122164141568841441_8306337482201048236_n.jpg",
        "assets/629226266_122164141592841441_2117617871875713527_n.jpg"
      ]
    },
    {
      name: "Family Premium Apartment",
      priceLabel: "K2,000 / night",
      badge: "High Demand",
      features: ["Spacious family-friendly living area", "Comfortable beds and fresh interiors", "Backup power and hot water", "Secure and quiet environment"],
      images: [
        "assets/628390692_122164141604841441_719272422453125891_n.jpg",
        "assets/628418418_122164141634841441_8295295334317346115_n.jpg",
        "assets/629222782_122164141676841441_4548154573022666384_n.jpg"
      ]
    },
    {
      name: "Signature Getaway Apartment",
      priceLabel: "K2,000 / night",
      badge: "Ready to Book",
      features: ["Luxury finishes and modern furniture", "Full kitchen and dining convenience", "Strong WiFi for remote work", "Ideal for couples and business travelers"],
      images: [
        "assets/629248919_122164141658841441_2851255111157590005_n.jpg",
        "assets/629254608_122164141694841441_8967582750012875948_n.jpg",
        "assets/627265331_122164141766841441_3315502584912791369_n.jpg"
      ]
    }
  ],
  contact: {
    phone: "+260978176858",
    whatsapp: "260764336304",
    email: "kamangamasozi495@gmail.com",
    facebook: "https://www.facebook.com/",
    address: "Dambwa North Extension<br>Livingstone, Zambia, 60010",
    contactPerson: "Masozi Kamanga",
    footerDescription: "Luxury and comfort in Livingstone, Zambia for tourists, couples, families, and business travelers."
  }
};

// Seed default state into Firestore if cms/state document is missing
window.seedDefaultData = async function() {
  const btn = document.getElementById('seedDataBtn');
  if (btn) { btn.disabled = true; btn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Seeding...'; }
  try {
    const firebaseApi = await getFirebaseApi();
    await firebaseApi.saveState(DEFAULT_CMS_STATE);
    showToast('Default data seeded successfully! Apartments will load now.', 'success');
  } catch (err) {
    console.error('Seed error:', err);
    showToast('Failed to seed data: ' + err.message, 'error');
    if (btn) { btn.disabled = false; btn.innerHTML = '<i class="fa-solid fa-database"></i> Initialize Default Data'; }
  }
};

async function initDashboard() {
  const firebaseApi = await getFirebaseApi();
  if (!firebaseApi) {
    showToast('Failed to initialize Firebase API', 'error');
    return;
  }

  // Auto-seed cms/state if it doesn't exist yet in Firestore
  try {
    const existingState = await firebaseApi.getState();
    if (!existingState) {
      showToast('First run detected — seeding default apartment data...', 'info');
      await firebaseApi.saveState(DEFAULT_CMS_STATE);
      showToast('Default data loaded! Apartments are ready.', 'success');
    }
  } catch (seedErr) {
    console.warn('Could not auto-seed state:', seedErr);
  }

  // Set up real-time listener for CMS State
  firebaseApi.subscribeToState((state) => {
    cachedState = state;
    // Populate selects/apartments filters globally once loaded
    populateApartmentSelects();
    
    // Refresh active section if relevant
    const activeSec = document.querySelector('.admin-section.active');
    if (activeSec) {
      const id = activeSec.id.replace('section-', '');
      if (id === 'apartments') renderApartments();
      if (id === 'settings') renderSettings();
      if (id === 'overview') renderOverview();
    }
  });

  // Set up real-time listener for Bookings
  firebaseApi.subscribeBookings((bookings) => {
    cachedBookings = bookings;
    
    // Update sidebar badge
    const pendingCount = bookings.filter(b => b.status === 'new').length;
    const badge = document.getElementById('pendingBadge');
    if (pendingCount > 0) {
      badge.textContent = pendingCount;
      badge.style.display = 'inline-block';
    } else {
      badge.style.display = 'none';
    }

    // Refresh active views
    const activeSec = document.querySelector('.admin-section.active');
    if (activeSec) {
      const id = activeSec.id.replace('section-', '');
      if (id === 'overview') renderOverview();
      if (id === 'bookings') renderBookings();
      if (id === 'calendar') renderCalendar();
    }
  });

  // Set up real-time listener for pricing
  firebaseApi.subscribePricing((pricing) => {
    cachedPricing = pricing;
    const activeSec = document.querySelector('.admin-section.active');
    if (activeSec && activeSec.id === 'section-pricing') renderPricing();
  });

  // Set up real-time listener for blocked dates
  firebaseApi.subscribeBlockedDates((blocked) => {
    cachedBlockedDates = blocked;
    const activeSec = document.querySelector('.admin-section.active');
    if (activeSec && activeSec.id === 'section-calendar') renderCalendar();
  });

  // Set up real-time listener for gallery
  firebaseApi.subscribeGallery((gallery) => {
    cachedGallery = gallery;
    const activeSec = document.querySelector('.admin-section.active');
    if (activeSec && activeSec.id === 'section-gallery') renderGalleryGrid();
  });

  // Load the initial view
  switchSection('overview');
}

// Populate all Apartment Select Dropdowns in Admin
function populateApartmentSelects() {
  if (!cachedState?.apartments) return;
  const apartments = cachedState.apartments;

  const filters = [
    document.getElementById('galleryApartmentFilter'),
    document.getElementById('calendarApartmentFilter'),
    document.getElementById('bookingsApartmentFilter'),
    document.getElementById('blockApartmentSelect')
  ];

  filters.forEach(select => {
    if (!select) return;
    // Save current selected value
    const val = select.value;
    
    // Re-fill options
    let html = '';
    if (select.id !== 'blockApartmentSelect') {
      html += '<option value="">All Apartments</option>';
    } else {
      html += '<option value="">All Apartments</option>';
    }
    
    apartments.forEach(ap => {
      html += `<option value="${escapeHtml(ap.name)}">${escapeHtml(ap.name)}</option>`;
    });
    
    select.innerHTML = html;
    select.value = val; // Restore value
  });
}

// Escape HTML Helper
function escapeHtml(str) {
  if (!str) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

// ── OVERVIEW SECTION ──────────────────────────────────────────────────────────
function loadOverview() {
  renderOverview();
}

function renderOverview() {
  const statsContainer = document.getElementById('overviewStats');
  const recentList = document.getElementById('recentBookingsList');
  const welcome = document.getElementById('overviewWelcome');
  
  if (cachedState?.contact?.contactPerson) {
    welcome.textContent = `Hello, ${cachedState.contact.contactPerson}. Welcome back.`;
  } else {
    welcome.textContent = 'Welcome back to M KAY admin portal.';
  }

  // Calculate statistics
  const total = cachedBookings.length;
  const pending = cachedBookings.filter(b => b.status === 'new').length;
  const confirmed = cachedBookings.filter(b => b.status === 'confirmed').length;
  
  // Calculate Revenue
  let revenue = 0;
  cachedBookings.forEach(booking => {
    if (booking.status === 'confirmed' || booking.status === 'completed') {
      const price = calculateBookingPrice(booking, cachedState, cachedPricing);
      revenue += price;
    }
  });

  // Render Stats Grid
  statsContainer.innerHTML = `
    <div class="stat-card">
      <div class="stat-icon" style="background:var(--info-dim); color:var(--info);"><i class="fa-solid fa-book-open"></i></div>
      <div class="stat-val">${total}</div>
      <div class="stat-lbl">Total Reservations</div>
    </div>
    <div class="stat-card">
      <div class="stat-icon" style="background:var(--warning-dim); color:var(--warning);"><i class="fa-solid fa-hourglass-half"></i></div>
      <div class="stat-val">${pending}</div>
      <div class="stat-lbl">Pending Approval</div>
    </div>
    <div class="stat-card">
      <div class="stat-icon" style="background:var(--success-dim); color:var(--success);"><i class="fa-solid fa-circle-check"></i></div>
      <div class="stat-val">${confirmed}</div>
      <div class="stat-lbl">Confirmed Bookings</div>
    </div>
    <div class="stat-card">
      <div class="stat-icon" style="background:var(--gold-dim); color:var(--gold);"><i class="fa-solid fa-money-bill-wave"></i></div>
      <div class="stat-val">${formatCurrency(revenue)}</div>
      <div class="stat-lbl">Estimated Earnings</div>
    </div>
  `;

  // Render Recent Bookings (last 5)
  const recent = cachedBookings.slice(0, 5);
  if (recent.length === 0) {
    recentList.innerHTML = '<p class="no-data"><i class="fa-solid fa-calendar-xmark"></i>No bookings received yet.</p>';
    return;
  }

  recentList.innerHTML = recent.map(booking => {
    let statusClass = 'status-new';
    if (booking.status === 'confirmed') statusClass = 'status-confirmed';
    if (booking.status === 'cancelled') statusClass = 'status-cancelled';
    if (booking.status === 'completed') statusClass = 'status-completed';

    const price = calculateBookingPrice(booking, cachedState, cachedPricing);

    return `
      <div class="recent-booking-item">
        <div>
          <strong>${escapeHtml(booking.name)}</strong>
          <div style="font-size:0.8rem; color:var(--text-muted); margin-top:0.15rem;">
            ${escapeHtml(booking.apartment)} • ${formatDate(booking.checkin)} to ${formatDate(booking.checkout)}
          </div>
        </div>
        <div style="text-align:right">
          <div style="font-weight:700; font-size:0.9rem;">${formatCurrency(price)}</div>
          <span class="status-badge ${statusClass}" style="margin-top:0.25rem;">${escapeHtml(booking.status || 'new')}</span>
        </div>
      </div>
    `;
  }).join('');
}

// ── APARTMENTS SECTION ────────────────────────────────────────────────────────
function loadApartments() {
  renderApartments();
}

function renderApartments() {
  const container = document.getElementById('apartmentsManager');
  if (!cachedState?.apartments) {
    container.innerHTML = `
      <div class="loading-center" style="flex-direction:column; gap:1rem; padding:3rem;">
        <i class="fa-solid fa-database" style="font-size:2.5rem; color:var(--gold);"></i>
        <p style="color:var(--text-muted); font-size:1rem; text-align:center; max-width:360px;">
          No apartment data found in Firestore.<br>
          Click below to initialize the default apartment data.
        </p>
        <button id="seedDataBtn" class="admin-btn admin-btn-primary" onclick="seedDefaultData()">
          <i class="fa-solid fa-database"></i> Initialize Default Data
        </button>
      </div>`;
    return;
  }

  const apartments = cachedState.apartments;

  container.innerHTML = apartments.map((ap, apIdx) => {
    const imagesHtml = (ap.images || []).map((imgUrl, imgIdx) => `
      <div class="apartment-img-thumb">
        <img src="${escapeHtml(imgUrl)}" alt="Apartment Photo">
        <div class="apartment-img-overlay">
          <button class="img-action-btn" title="Set Featured" onclick="setApartmentFeatured(${apIdx}, ${imgIdx})">
            <i class="fa-solid fa-star" style="${imgIdx === 0 ? 'color:var(--gold)' : ''}"></i>
          </button>
          <button class="img-action-btn text-danger" title="Delete Image" onclick="deleteApartmentImage(${apIdx}, ${imgIdx})">
            <i class="fa-solid fa-trash"></i>
          </button>
        </div>
        ${imgIdx === 0 ? '<span class="featured-tag">Featured</span>' : ''}
      </div>
    `).join('');

    return `
      <div class="admin-card apartment-manager-card" data-index="${apIdx}">
        <div class="apartment-header-row" onclick="toggleApartmentCollapse(${apIdx})">
          <h3><i class="fa-solid fa-building"></i> ${escapeHtml(ap.name)}</h3>
          <i class="fa-solid fa-chevron-down toggle-icon" id="ap-toggle-icon-${apIdx}"></i>
        </div>
        
        <div class="apartment-card-body collapsed" id="ap-card-body-${apIdx}">
          <div class="form-grid">
            <div class="form-group">
              <label>Apartment Name</label>
              <input type="text" class="admin-input ap-name" value="${escapeHtml(ap.name)}" required>
            </div>
            <div class="form-group">
              <label>Nightly Price Label</label>
              <input type="text" class="admin-input ap-price" value="${escapeHtml(ap.priceLabel)}" placeholder="K2,000 / night" required>
            </div>
          </div>
          
          <div class="form-group">
            <label>Badge text (e.g. High Demand, Available Tonight)</label>
            <input type="text" class="admin-input ap-badge" value="${escapeHtml(ap.badge || '')}">
          </div>
          
          <div class="form-group">
            <label>Apartment Features (comma-separated list)</label>
            <textarea class="admin-textarea admin-input ap-features" rows="3" placeholder="Starlink WiFi, Backup Power, Air Conditioning">${escapeHtml((ap.features || []).join(', '))}</textarea>
          </div>
          
          <div class="form-group">
            <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:0.75rem;">
              <label>Apartment Gallery Images</label>
              <label class="admin-btn admin-btn-sm admin-btn-outline" style="cursor:pointer; margin:0;">
                <i class="fa-solid fa-plus"></i> Add Image
                <input type="file" class="ap-image-upload-input" accept="image/*" multiple style="display:none" onchange="uploadApartmentImage(this, ${apIdx})">
              </label>
            </div>
            <div class="apartment-thumbs-grid" id="ap-thumbs-${apIdx}">
              ${imagesHtml.length ? imagesHtml : '<p style="color:var(--text-muted); font-size:0.85rem;">No images uploaded for this apartment yet.</p>'}
            </div>
          </div>
        </div>
      </div>
    `;
  }).join('');
}

// Collapsible helper
window.toggleApartmentCollapse = function(idx) {
  const body = document.getElementById(`ap-card-body-${idx}`);
  const icon = document.getElementById(`ap-toggle-icon-${idx}`);
  if (body.classList.contains('collapsed')) {
    body.classList.remove('collapsed');
    icon.style.transform = 'rotate(180deg)';
  } else {
    body.classList.add('collapsed');
    icon.style.transform = 'rotate(0deg)';
  }
};

// Set Featured image (move to index 0)
window.setApartmentFeatured = function(apIdx, imgIdx) {
  if (!cachedState?.apartments) return;
  const ap = cachedState.apartments[apIdx];
  if (!ap || !ap.images || ap.images.length === 0) return;
  
  const imgUrl = ap.images.splice(imgIdx, 1)[0];
  ap.images.unshift(imgUrl); // Insert at index 0
  
  showToast('Featured image updated. Click Save All Changes to persist.', 'info');
  renderApartments();
  // Keep expanded
  const body = document.getElementById(`ap-card-body-${apIdx}`);
  if (body) body.classList.remove('collapsed');
};

// Delete image from apartment list
window.deleteApartmentImage = function(apIdx, imgIdx) {
  if (!cachedState?.apartments) return;
  const ap = cachedState.apartments[apIdx];
  if (!ap || !ap.images) return;
  
  if (confirm('Are you sure you want to remove this photo from this apartment? (It will not delete the image from the Cloudinary repository, only this suite)')) {
    ap.images.splice(imgIdx, 1);
    showToast('Photo removed. Click Save All Changes to persist.', 'warning');
    renderApartments();
    // Keep expanded
    const body = document.getElementById(`ap-card-body-${apIdx}`);
    if (body) body.classList.remove('collapsed');
  }
};

// Upload images specifically for an apartment (auto-saves to Firestore → updates public site instantly)
window.uploadApartmentImage = async function(input, apIdx) {
  if (!input.files || input.files.length === 0) return;
  const files = Array.from(input.files);
  const token = getToken();
  const ap = cachedState?.apartments?.[apIdx];
  if (!ap) return;

  showToast(`Uploading ${files.length} image${files.length > 1 ? 's' : ''}...`, 'info');

  let uploaded = 0;
  for (const file of files) {
    const formData = new FormData();
    formData.append('image', file);
    try {
      const res = await fetch('/api/upload', {
        method: 'POST',
        headers: { 'Authorization': token },
        body: formData
      });
      const data = await res.json();
      if (res.ok && data.success) {
        if (!ap.images) ap.images = [];
        ap.images.push(data.url);
        // Also record in gallery collection
        try {
          const firebaseApi = await getFirebaseApi();
          await firebaseApi.addGalleryImage({
            apartmentId: ap.name,
            imageUrl: data.url,
            publicId: data.publicId || ''
          });
        } catch (_) {}
        uploaded++;
      } else {
        showToast(`Failed: ${data.message || 'upload error'}`, 'error');
      }
    } catch (err) {
      console.error(err);
      showToast('Server error uploading image', 'error');
    }
  }

  if (uploaded > 0) {
    // Auto-save to Firestore so public site updates immediately
    try {
      const firebaseApi = await getFirebaseApi();
      await firebaseApi.saveState(cachedState);
      showToast(`${uploaded} image${uploaded > 1 ? 's' : ''} uploaded & live on the website!`, 'success');
    } catch (err) {
      showToast('Uploaded but failed to save. Click Save All Changes.', 'warning');
    }
    renderApartments();
    const body = document.getElementById(`ap-card-body-${apIdx}`);
    if (body) body.classList.remove('collapsed');
  }
  input.value = '';
};

// Save a single apartment card immediately to Firestore → updates public site in real-time
window.saveApartmentCard = async function(apIdx) {
  if (!cachedState?.apartments) return;
  const card = document.querySelector(`.apartment-manager-card[data-index="${apIdx}"]`);
  if (!card) return;
  const ap = cachedState.apartments[apIdx];
  if (!ap) return;

  ap.name = card.querySelector('.ap-name').value.trim();
  ap.priceLabel = card.querySelector('.ap-price').value.trim();
  ap.badge = card.querySelector('.ap-badge').value.trim();
  const featVal = card.querySelector('.ap-features').value;
  ap.features = featVal.split(',').map(f => f.trim()).filter(f => f.length > 0);

  try {
    const firebaseApi = await getFirebaseApi();
    await firebaseApi.saveState(cachedState);
    showToast(`"${ap.name}" saved & live on the website!`, 'success');
    renderApartments();
    const body = document.getElementById(`ap-card-body-${apIdx}`);
    if (body) body.classList.remove('collapsed');
  } catch (err) {
    console.error(err);
    showToast('Failed to save apartment changes', 'error');
  }
};

// Add a new blank apartment
window.addNewApartment = async function() {
  if (!cachedState) return;
  if (!cachedState.apartments) cachedState.apartments = [];
  const newApartment = {
    name: 'New Apartment',
    priceLabel: 'K2,000 / night',
    badge: 'Available',
    features: ['Air conditioning', 'Starlink WiFi', 'Backup power'],
    images: []
  };
  cachedState.apartments.push(newApartment);
  try {
    const firebaseApi = await getFirebaseApi();
    await firebaseApi.saveState(cachedState);
    showToast('New apartment added! Edit the details and save.', 'success');
    renderApartments();
    // Auto-expand the new card
    const newIdx = cachedState.apartments.length - 1;
    const body = document.getElementById(`ap-card-body-${newIdx}`);
    const icon = document.getElementById(`ap-toggle-icon-${newIdx}`);
    if (body) body.classList.remove('collapsed');
    if (icon) icon.style.transform = 'rotate(180deg)';
    body?.scrollIntoView({ behavior: 'smooth', block: 'center' });
  } catch (err) {
    console.error(err);
    showToast('Failed to add apartment', 'error');
  }
};

// Delete an apartment
window.deleteApartment = async function(apIdx) {
  if (!cachedState?.apartments) return;
  const ap = cachedState.apartments[apIdx];
  if (!ap) return;
  if (!confirm(`Delete "${ap.name}" permanently? This will remove it from the public website.`)) return;
  cachedState.apartments.splice(apIdx, 1);
  try {
    const firebaseApi = await getFirebaseApi();
    await firebaseApi.saveState(cachedState);
    showToast(`"${ap.name}" deleted from the website.`, 'success');
    renderApartments();
  } catch (err) {
    console.error(err);
    showToast('Failed to delete apartment', 'error');
  }
};

// Save All Apartments handler (saves all at once)
document.getElementById('saveAllApartmentsBtn').addEventListener('click', async () => {
  if (!cachedState) return;
  
  const token = getToken();
  const btn = document.getElementById('saveAllApartmentsBtn');
  btn.disabled = true;
  btn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Saving...';

  // Gather values from all visible cards
  const cards = document.querySelectorAll('.apartment-manager-card');
  cards.forEach(card => {
    const idx = Number(card.dataset.index);
    const ap = cachedState.apartments[idx];
    if (!ap) return;
    ap.name = card.querySelector('.ap-name').value.trim();
    ap.priceLabel = card.querySelector('.ap-price').value.trim();
    ap.badge = card.querySelector('.ap-badge').value.trim();
    const featVal = card.querySelector('.ap-features').value;
    ap.features = featVal.split(',').map(f => f.trim()).filter(f => f.length > 0);
  });

  try {
    const firebaseApi = await getFirebaseApi();
    await firebaseApi.saveState(cachedState);
    showToast('All apartments saved & live on the website!', 'success');
  } catch (err) {
    console.error(err);
    showToast('Failed to save apartments', 'error');
  } finally {
    btn.disabled = false;
    btn.innerHTML = '<i class="fa-solid fa-floppy-disk"></i> Save All Changes';
    renderApartments();
  }
});

// ── PHOTO GALLERY SECTION ─────────────────────────────────────────────────────
function loadGallery() {
  renderGalleryGrid();
}

// Upload images to global Gallery
document.getElementById('galleryUploadFiles').addEventListener('change', async (e) => {
  const files = e.target.files;
  if (!files || files.length === 0) return;

  const apartmentFilter = document.getElementById('galleryApartmentFilter');
  const apartmentName = apartmentFilter.value;
  const token = getToken();
  const statusEl = document.getElementById('galleryUploadStatus');
  
  statusEl.style.display = 'block';
  statusEl.textContent = `Uploading 0 / ${files.length} images...`;

  const firebaseApi = await getFirebaseApi();

  let successCount = 0;
  for (let i = 0; i < files.length; i++) {
    const file = files[i];
    statusEl.textContent = `Uploading ${i + 1} / ${files.length}: ${file.name}...`;

    const formData = new FormData();
    formData.append('image', file);

    try {
      const res = await fetch('/api/upload', {
        method: 'POST',
        headers: { 'Authorization': token },
        body: formData
      });

      const data = await res.json();
      if (res.ok && data.success) {
        // Save to Firestore gallery collection
        await firebaseApi.addGalleryImage({
          apartmentId: apartmentName || 'global',
          imageUrl: data.url,
          publicId: data.publicId || ''
        });

        // Also add to the state apartment's images list if filtered by an apartment
        if (apartmentName && cachedState?.apartments) {
          const ap = cachedState.apartments.find(a => a.name === apartmentName);
          if (ap) {
            if (!ap.images) ap.images = [];
            ap.images.push(data.url);
          }
        }
        
        successCount++;
      } else {
        showToast(`Failed to upload ${file.name}: ${data.message || 'error'}`, 'error');
      }
    } catch (err) {
      console.error(err);
      showToast(`Error uploading ${file.name}`, 'error');
    }
  }

  // Save state if updated
  if (apartmentName && successCount > 0) {
    try {
      await firebaseApi.saveState(cachedState);
    } catch (err) {
      console.warn('Failed to sync updated apartment state image array:', err);
    }
  }

  statusEl.style.display = 'none';
  showToast(`Successfully uploaded ${successCount} of ${files.length} images!`, 'success');
  e.target.value = ''; // Reset input
  renderGalleryGrid();
});

// Render the grid
function renderGalleryGrid() {
  const grid = document.getElementById('adminGalleryGrid');
  const filterVal = document.getElementById('galleryApartmentFilter').value;

  if (cachedGallery.length === 0) {
    grid.innerHTML = '<p class="no-data"><i class="fa-solid fa-images"></i>No gallery images uploaded yet.</p>';
    return;
  }

  // Filter images
  let filtered = cachedGallery;
  if (filterVal) {
    filtered = cachedGallery.filter(img => img.apartmentId === filterVal);
  }

  if (filtered.length === 0) {
    grid.innerHTML = '<p class="no-data"><i class="fa-solid fa-filter"></i>No images match the selected filter.</p>';
    return;
  }

  grid.innerHTML = filtered.map(img => `
    <div class="admin-gallery-item">
      <img src="${escapeHtml(img.imageUrl)}" alt="Gallery Photo" loading="lazy">
      <div class="gallery-item-info">
        <span class="gallery-item-suite">${escapeHtml(img.apartmentId || 'global')}</span>
      </div>
      <div class="gallery-item-actions">
        <button class="gallery-action-btn" title="Set Featured" onclick="setGalleryFeatured('${escapeHtml(img.apartmentId)}', '${escapeHtml(img.id)}')">
          <i class="fa-solid fa-star" style="${img.featured ? 'color:var(--gold)' : ''}"></i>
        </button>
        <button class="gallery-action-btn text-danger" title="Delete Image" onclick="deleteGalleryImage('${escapeHtml(img.id)}', '${escapeHtml(img.publicId)}')">
          <i class="fa-solid fa-trash"></i>
        </button>
      </div>
      ${img.featured ? '<span class="featured-tag">Featured</span>' : ''}
    </div>
  `).join('');
}

// Filter change handler
document.getElementById('galleryApartmentFilter').addEventListener('change', () => {
  renderGalleryGrid();
});

// Set Featured via global gallery
window.setGalleryFeatured = async function(apartmentId, imageId) {
  if (!apartmentId || apartmentId === 'global') {
    showToast('Cannot set featured for global images. Select an apartment.', 'warning');
    return;
  }

  showToast('Setting featured image...', 'info');

  try {
    const firebaseApi = await getFirebaseApi();
    await firebaseApi.setFeaturedImage(apartmentId, imageId);

    // Also update in state.apartments for public site
    const galleryImage = cachedGallery.find(g => g.id === imageId);
    if (galleryImage && cachedState?.apartments) {
      const ap = cachedState.apartments.find(a => a.name === apartmentId);
      if (ap && ap.images) {
        const idx = ap.images.indexOf(galleryImage.imageUrl);
        if (idx !== -1) {
          ap.images.splice(idx, 1);
        }
        ap.images.unshift(galleryImage.imageUrl); // Featured is first
        await firebaseApi.saveState(cachedState);
      }
    }

    showToast('Featured image updated successfully!', 'success');
  } catch (err) {
    console.error(err);
    showToast('Failed to set featured image', 'error');
  }
};

// Delete global gallery image
window.deleteGalleryImage = async function(id, publicId) {
  if (!confirm('Are you sure you want to delete this image permanently? This deletes it from Cloudinary and all references.')) return;
  
  const token = getToken();
  showToast('Deleting image...', 'info');

  try {
    // Delete from Cloudinary via node server
    if (publicId) {
      await fetch('/api/cloudinary', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': token
        },
        body: JSON.stringify({ publicId })
      });
    }

    // Delete from Firestore gallery collection
    const firebaseApi = await getFirebaseApi();
    const targetImage = cachedGallery.find(g => g.id === id);
    await firebaseApi.deleteGalleryImage(id);

    // Also remove from state.apartments images array
    if (targetImage && cachedState?.apartments) {
      cachedState.apartments.forEach(ap => {
        if (ap.images) {
          const idx = ap.images.indexOf(targetImage.imageUrl);
          if (idx !== -1) ap.images.splice(idx, 1);
        }
      });
      await firebaseApi.saveState(cachedState);
    }

    showToast('Image deleted successfully', 'success');
  } catch (err) {
    console.error(err);
    showToast('Error deleting image', 'error');
  }
};

// ── PRICING SECTION ───────────────────────────────────────────────────────────
function loadPricing() {
  renderPricing();
}

function renderPricing() {
  const tbody = document.getElementById('pricingTableBody');
  if (cachedPricing.length === 0) {
    tbody.innerHTML = '<tr><td colspan="5" class="no-data"><i class="fa-solid fa-tag"></i>No seasonal pricing records configured yet. Default rates apply.</td></tr>';
    return;
  }

  tbody.innerHTML = cachedPricing.map(p => `
    <tr>
      <td><strong>${getMonthName(p.month)}</strong></td>
      <td>${p.year}</td>
      <td><strong>${formatCurrency(p.nightlyRate)}</strong></td>
      <td><span class="pricing-label-badge">${escapeHtml(p.label || 'Standard')}</span></td>
      <td>
        <div class="row-actions">
          <button class="admin-btn admin-btn-sm admin-btn-outline" onclick="editPricingRecord('${escapeHtml(p.id)}')">
            <i class="fa-solid fa-pencil"></i>
          </button>
          <button class="admin-btn admin-btn-sm admin-btn-danger" onclick="deletePricingRecord('${escapeHtml(p.id)}')">
            <i class="fa-solid fa-trash"></i>
          </button>
        </div>
      </td>
    </tr>
  `).join('');
}

// Modal Toggle Helpers
const pricingModal = document.getElementById('pricingModal');
document.getElementById('openAddPricingBtn').addEventListener('click', () => {
  document.getElementById('pricingForm').reset();
  document.getElementById('pricingRecordId').value = '';
  document.getElementById('pricingModalTitle').textContent = 'Add Seasonal Rate';
  pricingModal.style.display = 'flex';
});

const closePricing = () => pricingModal.style.display = 'none';
document.getElementById('closePricingModal').addEventListener('click', closePricing);
document.getElementById('cancelPricingModal').addEventListener('click', closePricing);

// Form Submit (Save / Edit)
document.getElementById('pricingForm').addEventListener('submit', async (e) => {
  e.preventDefault();
  const id = document.getElementById('pricingRecordId').value;
  const month = Number(document.getElementById('pricingMonth').value);
  const year = Number(document.getElementById('pricingYear').value);
  const nightlyRate = Number(document.getElementById('pricingRate').value);
  const label = document.getElementById('pricingLabel').value.trim();

  const record = { month, year, nightlyRate, label };
  if (id) record.id = id;

  showToast('Saving seasonal pricing...', 'info');

  try {
    const firebaseApi = await getFirebaseApi();
    await firebaseApi.savePricingRecord(record);
    showToast('Pricing saved successfully!', 'success');
    closePricing();
  } catch (err) {
    console.error(err);
    showToast('Failed to save seasonal rate', 'error');
  }
});

// Edit pricing trigger
window.editPricingRecord = function(id) {
  const p = cachedPricing.find(item => item.id === id);
  if (!p) return;

  document.getElementById('pricingRecordId').value = p.id;
  document.getElementById('pricingMonth').value = p.month;
  document.getElementById('pricingYear').value = p.year;
  document.getElementById('pricingRate').value = p.nightlyRate;
  document.getElementById('pricingLabel').value = p.label || '';

  document.getElementById('pricingModalTitle').textContent = 'Edit Seasonal Rate';
  pricingModal.style.display = 'flex';
};

// Delete pricing trigger
window.deletePricingRecord = async function(id) {
  if (!confirm('Are you sure you want to delete this seasonal rate? Nightly price will revert to the default rate.')) return;
  
  showToast('Deleting pricing record...', 'info');
  try {
    const firebaseApi = await getFirebaseApi();
    await firebaseApi.deletePricingRecord(id);
    showToast('Rate deleted successfully', 'success');
  } catch (err) {
    console.error(err);
    showToast('Failed to delete pricing record', 'error');
  }
};

// ── CALENDAR SECTION ──────────────────────────────────────────────────────────
function loadCalendar() {
  if (typeof FullCalendar === 'undefined') {
    showToast('FullCalendar script is still loading...', 'warning');
    return;
  }
  renderCalendar();
}

function renderCalendar() {
  const calendarEl = document.getElementById('adminCalendar');
  const filterVal = document.getElementById('calendarApartmentFilter').value;

  // Build events array from bookings + blocked dates
  const events = [];

  // 1. Add Bookings
  cachedBookings.forEach(b => {
    // If filtering by apartment
    if (filterVal && b.apartment !== filterVal) return;

    let color = '#f39c12'; // new/pending
    if (b.status === 'confirmed') color = '#2ecc71';
    if (b.status === 'cancelled') color = '#e74c3c';
    if (b.status === 'completed') color = '#3498db';

    events.push({
      id: `booking-${b.id}`,
      title: `${b.name} (${b.apartment})`,
      start: b.checkin,
      end: b.checkout, // Checkout date is exclusive for FullCalendar ranges
      backgroundColor: color,
      borderColor: color,
      textColor: color === '#f39c12' ? '#000' : '#fff',
      extendedProps: { type: 'booking', bookingId: b.id }
    });
  });

  // 2. Add Blocked Dates
  cachedBlockedDates.forEach(d => {
    // If filtering by apartment (or if blocked applies to all apartments)
    if (filterVal && d.apartmentId && d.apartmentId !== filterVal) return;

    events.push({
      id: `blocked-${d.id}`,
      title: `BLOCKED: ${d.reason || 'Maintenance'}`,
      start: d.startDate,
      end: d.endDate,
      backgroundColor: '#666666',
      borderColor: '#555555',
      textColor: '#ffffff',
      extendedProps: { type: 'blocked', blockedId: d.id }
    });
  });

  if (!calendarInstance) {
    calendarInstance = new FullCalendar.Calendar(calendarEl, {
      initialView: 'dayGridMonth',
      themeSystem: 'standard',
      headerToolbar: {
        left: 'prev,next today',
        center: 'title',
        right: 'dayGridMonth,listMonth'
      },
      events: events,
      eventClick: function(info) {
        const type = info.event.extendedProps.type;
        if (type === 'booking') {
          const bookingId = info.event.extendedProps.bookingId;
          viewBookingDetails(bookingId);
        } else if (type === 'blocked') {
          const blockedId = info.event.extendedProps.blockedId;
          deleteBlockedDate(blockedId);
        }
      }
    });
    calendarInstance.render();
  } else {
    // Update events in existing calendar
    calendarInstance.removeAllEventSources();
    calendarInstance.addEventSource(events);
  }
}

// Block Dates Modal toggle
const blockModal = document.getElementById('blockDatesModal');
document.getElementById('addBlockedDateBtn').addEventListener('click', () => {
  document.getElementById('blockDatesForm').reset();
  blockModal.style.display = 'flex';
});

const closeBlock = () => blockModal.style.display = 'none';
document.getElementById('closeBlockModal').addEventListener('click', closeBlock);
document.getElementById('cancelBlockModal').addEventListener('click', closeBlock);

// Block dates submit handler
document.getElementById('blockDatesForm').addEventListener('submit', async (e) => {
  e.preventDefault();
  const apartmentId = document.getElementById('blockApartmentSelect').value;
  const startDate = document.getElementById('blockStartDate').value;
  const endDate = document.getElementById('blockEndDate').value;
  const reason = document.getElementById('blockReason').value.trim();

  if (new Date(startDate) > new Date(endDate)) {
    alert('Start date must be before or equal to End date.');
    return;
  }

  showToast('Blocking dates...', 'info');

  try {
    const firebaseApi = await getFirebaseApi();
    await firebaseApi.addBlockedDate({ apartmentId, startDate, endDate, reason });
    showToast('Dates blocked successfully', 'success');
    closeBlock();
  } catch (err) {
    console.error(err);
    showToast('Failed to block dates', 'error');
  }
});

// Delete blocked date
async function deleteBlockedDate(id) {
  const d = cachedBlockedDates.find(item => item.id === id);
  if (!d) return;

  if (confirm(`Do you want to unblock these dates? \nPeriod: ${formatDate(d.startDate)} to ${formatDate(d.endDate)} \nReason: ${d.reason || 'None'}`)) {
    showToast('Unblocking dates...', 'info');
    try {
      const firebaseApi = await getFirebaseApi();
      await firebaseApi.deleteBlockedDate(id);
      showToast('Dates unblocked successfully', 'success');
    } catch (err) {
      console.error(err);
      showToast('Failed to unblock dates', 'error');
    }
  }
}

// Calendar Filter Change
document.getElementById('calendarApartmentFilter').addEventListener('change', () => {
  renderCalendar();
});

// ── BOOKINGS SECTION ──────────────────────────────────────────────────────────
function loadBookings() {
  renderBookings();
}

function renderBookings() {
  const tbody = document.getElementById('bookingsTableBody');
  const searchVal = document.getElementById('bookingsSearch').value.toLowerCase().trim();
  const statusFilter = document.getElementById('bookingsStatusFilter').value;
  const apartmentFilter = document.getElementById('bookingsApartmentFilter').value;

  if (cachedBookings.length === 0) {
    tbody.innerHTML = '<tr><td colspan="8" class="no-data"><i class="fa-solid fa-book-open"></i>No bookings found.</td></tr>';
    return;
  }

  // Filter Bookings client-side
  let filtered = cachedBookings.filter(b => {
    // Search match
    const nameMatch = (b.name || '').toLowerCase().includes(searchVal);
    const emailMatch = (b.email || '').toLowerCase().includes(searchVal);
    const phoneMatch = (b.phone || '').toLowerCase().includes(searchVal);
    const searchMatch = !searchVal || nameMatch || emailMatch || phoneMatch;

    // Status filter
    const statusMatch = !statusFilter || b.status === statusFilter;

    // Apartment filter
    const apartmentMatch = !apartmentFilter || b.apartment === apartmentFilter;

    return searchMatch && statusMatch && apartmentMatch;
  });

  if (filtered.length === 0) {
    tbody.innerHTML = '<tr><td colspan="8" class="no-data"><i class="fa-solid fa-filter"></i>No bookings match your filter criteria.</td></tr>';
    return;
  }

  tbody.innerHTML = filtered.map(b => {
    let statusClass = 'status-new';
    if (b.status === 'confirmed') statusClass = 'status-confirmed';
    if (b.status === 'cancelled') statusClass = 'status-cancelled';
    if (b.status === 'completed') statusClass = 'status-completed';

    const nights = calcNights(b.checkin, b.checkout);
    const price = calculateBookingPrice(b, cachedState, cachedPricing);

    return `
      <tr>
        <td>
          <strong>${escapeHtml(b.name)}</strong>
          <div style="font-size:0.75rem; color:var(--text-muted);">${escapeHtml(b.phone)}</div>
        </td>
        <td><span style="font-size:0.9rem;">${escapeHtml(b.apartment)}</span></td>
        <td>${formatDate(b.checkin)}</td>
        <td>${formatDate(b.checkout)}</td>
        <td>${nights} nights</td>
        <td><strong>${formatCurrency(price)}</strong></td>
        <td><span class="status-badge ${statusClass}">${escapeHtml(b.status || 'new')}</span></td>
        <td>
          <div class="row-actions">
            <button class="admin-btn admin-btn-sm admin-btn-outline" onclick="viewBookingDetails('${escapeHtml(b.id)}')" title="Details">
              <i class="fa-solid fa-eye"></i> View
            </button>
          </div>
        </td>
      </tr>
    `;
  }).join('');
}

// Search and Filter Listeners
document.getElementById('bookingsSearch').addEventListener('input', renderBookings);
document.getElementById('bookingsStatusFilter').addEventListener('change', renderBookings);
document.getElementById('bookingsApartmentFilter').addEventListener('change', renderBookings);
document.getElementById('refreshBookingsBtnAdmin').addEventListener('click', () => {
  showToast('Refreshing bookings...', 'info');
  renderBookings();
});

// View Booking Details inside modal
const bookingModal = document.getElementById('bookingDetailModal');
window.viewBookingDetails = function(id) {
  const b = cachedBookings.find(item => String(item.id) === String(id));
  if (!b) return;

  const content = document.getElementById('bookingDetailContent');
  const actions = document.getElementById('bookingDetailActions');
  const price = calculateBookingPrice(b, cachedState, cachedPricing);
  const nights = calcNights(b.checkin, b.checkout);

  let statusClass = 'status-new';
  if (b.status === 'confirmed') statusClass = 'status-confirmed';
  if (b.status === 'cancelled') statusClass = 'status-cancelled';
  if (b.status === 'completed') statusClass = 'status-completed';

  content.innerHTML = `
    <div style="display:grid; grid-template-columns: 1fr 1fr; gap: 1.5rem; margin-bottom: 1.5rem;">
      <div>
        <label style="color:var(--text-muted); font-size:0.75rem; display:block; text-transform:uppercase;">Guest Name</label>
        <span style="font-weight:700; font-size:1.1rem; display:block; margin-top:0.25rem;">${escapeHtml(b.name)}</span>
      </div>
      <div>
        <label style="color:var(--text-muted); font-size:0.75rem; display:block; text-transform:uppercase;">Booking Status</label>
        <span class="status-badge ${statusClass}" style="margin-top:0.4rem; display:inline-block;">${escapeHtml(b.status || 'new')}</span>
      </div>
      <div>
        <label style="color:var(--text-muted); font-size:0.75rem; display:block; text-transform:uppercase;">Phone Number</label>
        <a href="tel:${escapeHtml(b.phone)}" style="font-weight:600; display:block; margin-top:0.25rem;">${escapeHtml(b.phone)}</a>
      </div>
      <div>
        <label style="color:var(--text-muted); font-size:0.75rem; display:block; text-transform:uppercase;">Email Address</label>
        <a href="mailto:${escapeHtml(b.email)}" style="font-weight:600; display:block; margin-top:0.25rem;">${escapeHtml(b.email || 'Not provided')}</a>
      </div>
      <div>
        <label style="color:var(--text-muted); font-size:0.75rem; display:block; text-transform:uppercase;">Check-In</label>
        <span style="font-weight:600; display:block; margin-top:0.25rem;">${formatDate(b.checkin)}</span>
      </div>
      <div>
        <label style="color:var(--text-muted); font-size:0.75rem; display:block; text-transform:uppercase;">Check-Out</label>
        <span style="font-weight:600; display:block; margin-top:0.25rem;">${formatDate(b.checkout)}</span>
      </div>
      <div>
        <label style="color:var(--text-muted); font-size:0.75rem; display:block; text-transform:uppercase;">Selected Apartment</label>
        <span style="font-weight:600; display:block; margin-top:0.25rem;">${escapeHtml(b.apartment)}</span>
      </div>
      <div>
        <label style="color:var(--text-muted); font-size:0.75rem; display:block; text-transform:uppercase;">Guests</label>
        <span style="font-weight:600; display:block; margin-top:0.25rem;">${escapeHtml(b.guests || 2)} persons</span>
      </div>
      <div>
        <label style="color:var(--text-muted); font-size:0.75rem; display:block; text-transform:uppercase;">Estimated Total Amount</label>
        <span style="font-weight:700; font-size:1.2rem; color:var(--gold); display:block; margin-top:0.25rem;">${formatCurrency(price)}</span>
        <small style="color:var(--text-muted);">${nights} nights @ rate</small>
      </div>
      <div>
        <label style="color:var(--text-muted); font-size:0.75rem; display:block; text-transform:uppercase;">Payment Method</label>
        <span style="font-weight:600; display:block; margin-top:0.25rem;">${escapeHtml(b.payment_method || 'WhatsApp Direct')}</span>
      </div>
    </div>
    
    <div class="form-group">
      <label style="color:var(--text-muted); font-size:0.75rem; display:block; text-transform:uppercase;">Special Request</label>
      <div style="background:var(--surface2); padding:0.75rem 1rem; border-radius:var(--radius-sm); border:1px solid var(--border-soft); margin-top:0.25rem; font-size:0.9rem; min-height:3em;">
        ${escapeHtml(b.request || 'No special instructions provided.')}
      </div>
    </div>
    
    <div style="font-size:0.7rem; color:var(--text-muted); margin-top:1rem; text-align:right;">
      Created: ${formatDate(b.createdAt)}
    </div>
  `;

  // Status transition buttons
  let actionHtml = `<button type="button" class="admin-btn admin-btn-ghost" onclick="closeBookingModal()">Close</button>`;
  
  if (b.status === 'new') {
    actionHtml += `
      <button type="button" class="admin-btn admin-btn-danger" onclick="updateBookingStatus('${escapeHtml(b.id)}', 'cancelled')">
        <i class="fa-solid fa-xmark"></i> Reject
      </button>
      <button type="button" class="admin-btn admin-btn-primary" onclick="updateBookingStatus('${escapeHtml(b.id)}', 'confirmed')">
        <i class="fa-solid fa-check"></i> Approve & Confirm
      </button>
    `;
  } else if (b.status === 'confirmed') {
    actionHtml += `
      <button type="button" class="admin-btn admin-btn-danger" onclick="updateBookingStatus('${escapeHtml(b.id)}', 'cancelled')">
        <i class="fa-solid fa-xmark"></i> Cancel Booking
      </button>
      <button type="button" class="admin-btn admin-btn-primary" onclick="updateBookingStatus('${escapeHtml(b.id)}', 'completed')">
        <i class="fa-solid fa-circle-check"></i> Mark Completed
      </button>
    `;
  } else if (b.status === 'cancelled') {
    actionHtml += `
      <button type="button" class="admin-btn admin-btn-primary" onclick="updateBookingStatus('${escapeHtml(b.id)}', 'confirmed')">
        <i class="fa-solid fa-arrow-rotate-left"></i> Re-confirm Booking
      </button>
    `;
  }
  
  actions.innerHTML = actionHtml;
  bookingModal.style.display = 'flex';
};

const closeBookingModal = () => bookingModal.style.display = 'none';
document.getElementById('closeBookingModal').addEventListener('click', closeBookingModal);
window.closeBookingModal = closeBookingModal;

// Update booking status API call
window.updateBookingStatus = async function(id, status) {
  showToast(`Updating booking to: ${status}...`, 'info');
  const token = getToken();

  try {
    const firebaseApi = await getFirebaseApi();
    // Update Firestore
    await firebaseApi.updateBookingStatus(id, status);

    // Update locally in JSON endpoint
    await fetch(`/api/bookings/${id}/status`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': token
      },
      body: JSON.stringify({ status })
    });

    showToast(`Booking successfully updated to ${status}!`, 'success');
    closeBookingModal();
  } catch (err) {
    console.error(err);
    showToast('Failed to update booking status', 'error');
  }
};

// ── SETTINGS SECTION ──────────────────────────────────────────────────────────
function loadSettings() {
  renderSettings();
}

function renderSettings() {
  if (!cachedState) return;

  // Contact Info
  document.getElementById('settingsPhone').value = cachedState.contact?.phone || '';
  document.getElementById('settingsWhatsapp').value = cachedState.contact?.whatsapp || '';
  document.getElementById('settingsEmail').value = cachedState.contact?.email || '';
  document.getElementById('settingsFacebook').value = cachedState.contact?.facebook || '';
  document.getElementById('settingsAddress').value = cachedState.contact?.address?.replace(/<br>/g, ', ') || '';

  // Default nightly base price
  document.getElementById('settingsBasePrice').value = cachedState.basePrice || 2000;

  // About Info
  document.getElementById('settingsHeroHeadline').value = cachedState.hero?.headline || '';
  document.getElementById('settingsHeroSubtitle').value = cachedState.hero?.subtitle || '';
  document.getElementById('settingsAboutTitle').value = cachedState.about?.title || '';
  document.getElementById('settingsAboutP1').value = cachedState.about?.paragraphs?.[0] || '';

  // Activities Info
  const actSection = cachedState.activitiesSection || {
    kicker: 'Livingstone Experiences',
    headline: 'Adventure Starts Here',
    subtitle: 'Turn your stay into a full travel story with unforgettable local activities.'
  };
  document.getElementById('settingsActivitiesKicker').value = actSection.kicker || '';
  document.getElementById('settingsActivitiesHeadline').value = actSection.headline || '';
  document.getElementById('settingsActivitiesSubtitle').value = actSection.subtitle || '';

  // Render activities list
  const activitiesListContainer = document.getElementById('adminActivitiesList');
  const activities = cachedState.activities || [];
  activitiesListContainer.innerHTML = activities.map(act => createActivityRowHtml(act.title || '', act.image || '')).join('');
}

function createActivityRowHtml(title = '', imgUrl = '') {
  return `
    <div class="activity-row-item" style="display: flex; align-items: center; gap: 1rem; background: var(--surface2); padding: 0.75rem; border-radius: 6px; border: 1px solid var(--border-soft);">
      <div style="width: 80px; height: 60px; border-radius: 4px; overflow: hidden; background: var(--bg); display: flex; align-items: center; justify-content: center; position: relative; flex-shrink: 0;">
        <img src="${escapeHtml(imgUrl)}" class="activity-row-preview" style="width: 100%; height: 100%; object-fit: cover; ${imgUrl ? '' : 'display: none;'}">
        <i class="fa-solid fa-image" style="font-size: 1.5rem; color: var(--text-muted); ${imgUrl ? 'display: none;' : ''}"></i>
      </div>
      <div style="flex: 1; display: flex; flex-direction: column; gap: 0.5rem; min-width: 0;">
        <input type="text" class="admin-input activity-row-title" value="${escapeHtml(title)}" placeholder="Activity Name (e.g. Helicopter Ride)">
        <div style="display: flex; gap: 0.5rem; align-items: center;">
          <input type="text" class="admin-input activity-row-image-url" value="${escapeHtml(imgUrl)}" placeholder="Image URL" style="font-size: 0.8rem; flex: 1;" onchange="syncActivityPreview(this)">
          <label class="admin-btn admin-btn-outline" style="cursor: pointer; padding: 0.35rem 0.75rem; font-size: 0.8rem; margin: 0; white-space: nowrap;">
            <i class="fa-solid fa-upload"></i> Upload
            <input type="file" class="activity-row-file-input" accept="image/*" style="display: none;" onchange="handleActivityImageUpload(this)">
          </label>
        </div>
      </div>
      <button type="button" class="admin-btn text-danger" style="padding: 0.5rem;" onclick="removeActivityRow(this)">
        <i class="fa-solid fa-trash"></i>
      </button>
    </div>
  `;
}

window.syncActivityPreview = function(input) {
  const row = input.closest('.activity-row-item');
  const previewImg = row.querySelector('.activity-row-preview');
  const placeholderIcon = row.querySelector('.fa-image');
  const url = input.value.trim();
  if (url) {
    previewImg.src = url;
    previewImg.style.display = 'block';
    if (placeholderIcon) placeholderIcon.style.display = 'none';
  } else {
    previewImg.style.display = 'none';
    if (placeholderIcon) placeholderIcon.style.display = 'block';
  }
};

window.handleActivityImageUpload = async function(input) {
  const file = input.files[0];
  if (!file) return;
  
  const token = getToken();
  const row = input.closest('.activity-row-item');
  const previewImg = row.querySelector('.activity-row-preview');
  const urlInput = row.querySelector('.activity-row-image-url');
  const placeholderIcon = row.querySelector('.fa-image');
  
  showToast('Uploading activity image...', 'info');
  
  const formData = new FormData();
  formData.append('image', file);
  
  try {
    const res = await fetch('/api/upload', {
      method: 'POST',
      headers: { 'Authorization': token },
      body: formData
    });
    const data = await res.json();
    if (res.ok && data.success) {
      previewImg.src = data.url;
      previewImg.style.display = 'block';
      if (placeholderIcon) placeholderIcon.style.display = 'none';
      urlInput.value = data.url;
      showToast('Activity image uploaded successfully!', 'success');
      
      // Also register in global gallery
      try {
        const firebaseApi = await getFirebaseApi();
        await firebaseApi.addGalleryImage({
          apartmentId: 'global',
          imageUrl: data.url,
          publicId: data.publicId || ''
        });
      } catch (_) {}
    } else {
      showToast(`Upload failed: ${data.message || 'error'}`, 'error');
    }
  } catch (err) {
    console.error(err);
    showToast('Error uploading activity image', 'error');
  }
};

window.removeActivityRow = function(btn) {
  if (confirm('Are you sure you want to remove this activity?')) {
    const row = btn.closest('.activity-row-item');
    row.remove();
  }
};

// 1. PIN Form handler
document.getElementById('changePinForm').addEventListener('submit', async (e) => {
  e.preventDefault();
  const oldPin = document.getElementById('currentPin').value;
  const newPin = document.getElementById('newPin').value;
  const confirmPin = document.getElementById('confirmPin').value;
  const token = getToken();

  if (newPin !== confirmPin) {
    showToast('New PINs do not match.', 'error');
    return;
  }

  showToast('Updating PIN...', 'info');

  try {
    const res = await fetch('/api/pin', {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ token, oldPin, newPin })
    });

    const data = await res.json();
    if (res.ok && data.success) {
      showToast('PIN successfully updated!', 'success');
      document.getElementById('changePinForm').reset();
    } else {
      showToast(data.message || 'Incorrect current PIN.', 'error');
    }
  } catch (err) {
    console.error(err);
    showToast('Server connection error.', 'error');
  }
});

// 2. Contact form handler
document.getElementById('settingsContactForm').addEventListener('submit', async (e) => {
  e.preventDefault();
  if (!cachedState) return;

  const phone = document.getElementById('settingsPhone').value.trim();
  const whatsapp = document.getElementById('settingsWhatsapp').value.trim();
  const email = document.getElementById('settingsEmail').value.trim();
  const facebook = document.getElementById('settingsFacebook').value.trim();
  const address = document.getElementById('settingsAddress').value.trim();

  cachedState.contact = cachedState.contact || {};
  cachedState.contact.phone = phone;
  cachedState.contact.whatsapp = whatsapp;
  cachedState.contact.email = email;
  cachedState.contact.facebook = facebook;
  cachedState.contact.address = address.replace(/,\s*/g, '<br>');

  await saveSettingsState();
});

// 3. Base price form handler
document.getElementById('basePriceForm').addEventListener('submit', async (e) => {
  e.preventDefault();
  if (!cachedState) return;

  cachedState.basePrice = Number(document.getElementById('settingsBasePrice').value);
  await saveSettingsState();
});

// 4. About form handler
document.getElementById('settingsAboutForm').addEventListener('submit', async (e) => {
  e.preventDefault();
  if (!cachedState) return;

  const headline = document.getElementById('settingsHeroHeadline').value.trim();
  const subtitle = document.getElementById('settingsHeroSubtitle').value.trim();
  const title = document.getElementById('settingsAboutTitle').value.trim();
  const p1 = document.getElementById('settingsAboutP1').value.trim();

  cachedState.hero = cachedState.hero || {};
  cachedState.hero.headline = headline;
  cachedState.hero.subtitle = subtitle;

  cachedState.about = cachedState.about || {};
  cachedState.about.title = title;
  cachedState.about.paragraphs = cachedState.about.paragraphs || [];
  cachedState.about.paragraphs[0] = p1;

  await saveSettingsState();
});

// Add Activity row button
document.getElementById('addActivityBtn').addEventListener('click', () => {
  const container = document.getElementById('adminActivitiesList');
  const div = document.createElement('div');
  div.innerHTML = createActivityRowHtml('', '');
  container.appendChild(div.firstElementChild);
});

// 5. Activities Form handler
document.getElementById('settingsActivitiesForm').addEventListener('submit', async (e) => {
  e.preventDefault();
  if (!cachedState) return;

  const kicker = document.getElementById('settingsActivitiesKicker').value.trim();
  const headline = document.getElementById('settingsActivitiesHeadline').value.trim();
  const subtitle = document.getElementById('settingsActivitiesSubtitle').value.trim();

  // Read all activities
  const activityRows = document.querySelectorAll('.activity-row-item');
  const activities = [];
  
  activityRows.forEach(row => {
    const title = row.querySelector('.activity-row-title').value.trim();
    const image = row.querySelector('.activity-row-image-url').value.trim();
    if (title || image) {
      activities.push({ title, image });
    }
  });

  cachedState.activitiesSection = { kicker, headline, subtitle };
  cachedState.activities = activities;

  await saveSettingsState();
});

// Settings Save Helper
async function saveSettingsState() {
  showToast('Saving changes...', 'info');
  const token = getToken();

  try {
    const firebaseApi = await getFirebaseApi();
    await firebaseApi.saveState(cachedState);

    // Save fallback to server
    await fetch('/api/state', {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': token
      },
      body: JSON.stringify({ token, state: cachedState })
    });

    showToast('Settings saved successfully!', 'success');
  } catch (err) {
    console.error(err);
    showToast('Failed to save settings', 'error');
  }
}

// ── INITIALIZATION ────────────────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  checkSession();

  // Mobile Hamburger menu toggles
  const menuBtn = document.getElementById('adminMobileMenuBtn');
  const sidebar = document.getElementById('adminSidebar');
  const overlay = document.getElementById('sidebarOverlay');
  
  if (menuBtn && sidebar && overlay) {
    menuBtn.addEventListener('click', () => {
      sidebar.classList.toggle('open');
      overlay.classList.toggle('active');
    });
    
    overlay.addEventListener('click', () => {
      sidebar.classList.remove('open');
      overlay.classList.remove('active');
    });

    // Close menu when navigation links are clicked on mobile
    const navLinks = sidebar.querySelectorAll('.sidebar-nav a, .sidebar-footer button, .sidebar-footer a');
    navLinks.forEach(link => {
      link.addEventListener('click', () => {
        sidebar.classList.remove('open');
        overlay.classList.remove('active');
      });
    });
  }
});


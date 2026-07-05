// ResFood Global Javascript Application Helper

// Global state
window.ResFood = {
  apiBase: '/api',
  user: null
};

// Check auth status from localStorage
function checkSession() {
  const cachedUser = localStorage.getItem('resfood_user');
  if (cachedUser) {
    window.ResFood.user = JSON.parse(cachedUser);
  }
}

// Save session
function setSession(user) {
  window.ResFood.user = user;
  localStorage.setItem('resfood_user', JSON.stringify(user));
  updateNavbarState();
}

// Clear session
function clearSession() {
  window.ResFood.user = null;
  localStorage.removeItem('resfood_user');
  updateNavbarState();
  // Redirect to home if on dashboard
  if (window.location.pathname.includes('/dashboard')) {
    window.location.href = '/';
  }
}

// Update Navbar to show user or login/register buttons
function updateNavbarState() {
  const actionsContainer = document.getElementById('nav-actions-container');
  if (!actionsContainer) return;

  const user = window.ResFood.user;
  
  if (user) {
    let dashboardLink = '';
    if (user.role === 'restaurant') {
      dashboardLink = `<a href="/dashboard" class="nav-link">Dasbor</a>`;
    } else if (user.role === 'nonprofit') {
      dashboardLink = `<a href="/donor" class="nav-link">Sistem Donasi</a>`;
    } else {
      dashboardLink = `<a href="/marketplace" class="nav-link">Marketplace</a>`;
    }

    actionsContainer.innerHTML = `
      <div style="display:flex; align-items:center; gap:0.75rem;">
        <span style="font-size:0.85rem; font-weight:700; color:var(--text-secondary)">👋 ${user.name}</span>
        <button id="logout-btn" class="btn btn-outline" style="padding:0.5rem 1rem; font-size:0.8rem;">Keluar</button>
      </div>
    `;
    
    // Add event listener to logout
    document.getElementById('logout-btn').addEventListener('click', clearSession);
  } else {
    actionsContainer.innerHTML = `
      <a href="/auth/login.html" class="btn btn-outline" style="padding:0.5rem 1rem;">Masuk</a>
      <a href="/auth/register.html" class="btn btn-primary" style="padding:0.5rem 1.25rem;">Daftar</a>
    `;
  }
}

// Initialize Theme Setup
function initTheme() {
  const currentTheme = localStorage.getItem('theme') || 'light';
  document.documentElement.setAttribute('data-theme', currentTheme);
  
  const themeToggle = document.getElementById('theme-toggle');
  if (themeToggle) {
    updateThemeIcon(currentTheme);
    themeToggle.addEventListener('click', () => {
      const activeTheme = document.documentElement.getAttribute('data-theme');
      const newTheme = activeTheme === 'dark' ? 'light' : 'dark';
      document.documentElement.setAttribute('data-theme', newTheme);
      localStorage.setItem('theme', newTheme);
      updateThemeIcon(newTheme);
    });
  }
}

function updateThemeIcon(theme) {
  const themeToggle = document.getElementById('theme-toggle');
  if (!themeToggle) return;
  if (theme === 'dark') {
    themeToggle.innerHTML = `
      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-sun"><circle cx="12" cy="12" r="4"/><path d="M12 2v2"/><path d="M12 20v2"/><path d="m4.93 4.93 1.41 1.41"/><path d="m17.66 17.66 1.41 1.41"/><path d="M2 12h2"/><path d="M20 12h2"/><path d="m6.34 17.66-1.41 1.41"/><path d="m19.07 4.93-1.41 1.41"/></svg>
    `;
  } else {
    themeToggle.innerHTML = `
      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-moon"><path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z"/></svg>
    `;
  }
}

// Navigation mobile responsiveness
function initMobileMenu() {
  const menuToggle = document.getElementById('menu-toggle');
  const navMenu = document.getElementById('nav-menu');
  if (menuToggle && navMenu) {
    menuToggle.addEventListener('click', () => {
      navMenu.classList.toggle('open');
    });
  }
}

// Load navigation HTML dynamically or render it to ensure consistent navbar/footer
function renderLayoutShell() {
  // Let's check if the navbar exists, if not we build it inside the header placeholder
  const headerPlaceholder = document.getElementById('global-header');
  if (headerPlaceholder) {
    const isDashboard = window.location.pathname.includes('/dashboard/');
    const isMarketplace = window.location.pathname.includes('/marketplace/');
    const isDonor = window.location.pathname.includes('/donor/');
    const isHome = !isDashboard && !isMarketplace && !isDonor && window.location.pathname.endsWith('/');

    headerPlaceholder.innerHTML = `
      <div class="nav-container">
        <a href="/" class="logo">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-leaf"><path d="M11 20A7 7 0 0 1 9.8 6.1C15.5 5 17 4.48 19 2c1 2 2 3.5 1 9.8a7 7 0 0 1-13.9.2"/><path d="M9 22v-4h4"/></svg>
          <span>ResFood</span>
        </a>
        <button class="menu-toggle" id="menu-toggle">☰</button>
        <ul class="nav-menu" id="nav-menu">
          <li><a href="/" class="nav-link ${isHome ? 'active' : ''}">Beranda</a></li>
          <li><a href="/marketplace/" class="nav-link ${isMarketplace ? 'active' : ''}">Marketplace</a></li>
          <li><a href="/donor/" class="nav-link ${isDonor ? 'active' : ''}">Redistribusi Donasi</a></li>
          <li><a href="/dashboard/" class="nav-link ${isDashboard ? 'active' : ''}">Mitra Portal</a></li>
        </ul>
        <div class="nav-actions">
          <button class="theme-btn" id="theme-toggle" title="Toggle Tema"></button>
          <div id="nav-actions-container" style="display:flex; align-items:center; gap:0.75rem;"></div>
        </div>
      </div>
    `;
  }

  const footerPlaceholder = document.getElementById('global-footer');
  if (footerPlaceholder) {
    footerPlaceholder.innerHTML = `
      <div class="footer-container">
        <div class="footer-brand">
          <h3 style="display:flex; align-items:center; gap:0.5rem; color:var(--text-primary)">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-leaf" style="width:1.5rem; height:1.5rem; color:var(--primary)"><path d="M11 20A7 7 0 0 1 9.8 6.1C15.5 5 17 4.48 19 2c1 2 2 3.5 1 9.8a7 7 0 0 1-13.9.2"/><path d="M9 22v-4h4"/></svg>
            ResFood
          </h3>
          <p>Ekosistem penyelamatan surplus pangan untuk mengatasi isu food waste, kerawanan pangan global, dan kelestarian lingkungan secara real-time.</p>
        </div>
        <div class="footer-links">
          <h4>Platform</h4>
          <ul>
            <li><a href="/marketplace/">Surplus Marketplace</a></li>
            <li><a href="/donor/">Redistribution Network</a></li>
            <li><a href="/dashboard/">Portal Mitra Bisnis</a></li>
          </ul>
        </div>
        <div class="footer-links">
          <h4>Teknologi & Infra</h4>
          <ul>
            <li><a href="/#core-infra">Keamanan Makanan (Safety)</a></li>
            <li><a href="/#core-infra">Pemantauan Karbon CO2</a></li>
            <li><a href="/#core-infra">Transparansi Distribusi</a></li>
          </ul>
        </div>
        <div class="footer-links">
          <h4>Hubungi Kami</h4>
          <ul>
            <li><a href="mailto:info@resfood.com">info@resfood.com</a></li>
            <li><a href="tel:+622112345678">+62 (21) 1234-5678</a></li>
            <li><p style="font-size:0.85rem; color:var(--text-muted)">DKI Jakarta, Indonesia</p></li>
          </ul>
        </div>
      </div>
      <div class="footer-bottom">
        <p>&copy; 2026 ResFood Platform. Hak Cipta Dilindungi.</p>
        <p>Premium Digital Solution for Global Food Security</p>
      </div>
    `;
  }
}

// Initializing hooks
document.addEventListener('DOMContentLoaded', () => {
  checkSession();
  renderLayoutShell();
  initTheme();
  initMobileMenu();
  updateNavbarState();
});

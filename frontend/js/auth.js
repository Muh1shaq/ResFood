// Authentication Logic
document.addEventListener('DOMContentLoaded', () => {
  const loginForm = document.getElementById('login-form');
  const registerForm = document.getElementById('register-form');
  const alertEl = document.getElementById('auth-alert');
  
  // Setup Role Selector (in register form)
  const roleOptions = document.querySelectorAll('.role-option');
  let selectedRole = 'public'; // Default role

  if (roleOptions.length > 0) {
    roleOptions.forEach(opt => {
      opt.addEventListener('click', () => {
        roleOptions.forEach(o => o.classList.remove('active'));
        opt.classList.add('active');
        selectedRole = opt.dataset.role;
      });
    });

    // Check query params for role auto-selection (e.g. ?role=restaurant)
    const urlParams = new URLSearchParams(window.location.search);
    const roleParam = urlParams.get('role');
    if (roleParam) {
      const matchingOpt = document.querySelector(`.role-option[data-role="${roleParam}"]`);
      if (matchingOpt) {
        matchingOpt.click();
      }
    }
  }

  // ============================================================
  // CLIENT-SIDE VALIDATION HELPERS
  // ============================================================
  function isValidEmail(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  }

  function isValidIndonesianPhone(phone) {
    return /^(\+62|62|0)8[0-9]{8,11}$/.test(phone.replace(/[\s\-]/g, ''));
  }

  // ============================================================
  // Handle Login submission
  // ============================================================
  if (loginForm) {
    loginForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const email = document.getElementById('email').value.trim();
      // NOTE: Do NOT trim password — spaces in password are intentional
      const password = document.getElementById('password').value;

      showAlert('', 'none'); // Clear alert

      // Client-side validation
      if (!email || !password) {
        showAlert('Email dan kata sandi wajib diisi.', 'danger');
        return;
      }

      if (!isValidEmail(email)) {
        showAlert('Format email tidak valid. Contoh: nama@domain.com', 'danger');
        return;
      }

      if (password.length < 8) {
        showAlert('Kata sandi minimal 8 karakter.', 'danger');
        return;
      }

      // Disable submit button to prevent double submit
      const submitBtn = loginForm.querySelector('button[type="submit"]');
      submitBtn.disabled = true;
      submitBtn.textContent = 'Memproses...';

      try {
        const response = await fetch('/api/auth/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, password })
        });
        
        const data = await response.json();
        
        if (response.ok && data.success) {
          showAlert(data.message, 'success');
          // Cache user and update header
          setSession(data.user);
          
          // Redirect based on role
          setTimeout(() => {
            if (data.user.role === 'restaurant') {
              window.location.href = '/dashboard/';
            } else if (data.user.role === 'nonprofit') {
              window.location.href = '/donor/';
            } else {
              // public & courier
              window.location.href = '/marketplace/';
            }
          }, 1000);
        } else {
          showAlert(data.message || 'Login gagal. Periksa email dan kata sandi Anda.', 'danger');
          submitBtn.disabled = false;
          submitBtn.textContent = 'Masuk';
        }
      } catch (err) {
        console.error(err);
        showAlert('Koneksi ke server gagal. Pastikan backend aktif.', 'danger');
        submitBtn.disabled = false;
        submitBtn.textContent = 'Masuk';
      }
    });
  }

  // ============================================================
  // Handle Register submission
  // ============================================================
  if (registerForm) {
    registerForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const name = document.getElementById('name').value.trim();
      const email = document.getElementById('email').value.trim();
      const password = document.getElementById('password').value;
      const confirmPasswordEl = document.getElementById('confirm-password');
      const confirmPassword = confirmPasswordEl ? confirmPasswordEl.value : null;

      showAlert('', 'none'); // Clear alert

      // Client-side validation
      if (!name || !email || !password) {
        showAlert('Semua kolom wajib diisi.', 'danger');
        return;
      }

      if (name.length < 2) {
        showAlert('Nama minimal 2 karakter.', 'danger');
        return;
      }

      if (!isValidEmail(email)) {
        showAlert('Format email tidak valid. Contoh: nama@domain.com', 'danger');
        return;
      }

      if (password.length < 8) {
        showAlert('Kata sandi minimal 8 karakter.', 'danger');
        return;
      }

      if (password.length > 20) {
        showAlert('Kata sandi maksimal 20 karakter.', 'danger');
        return;
      }

      // Confirm password check
      if (confirmPassword !== null && confirmPassword !== password) {
        showAlert('Konfirmasi kata sandi tidak cocok. Periksa kembali.', 'danger');
        return;
      }

      // Disable submit button
      const submitBtn = registerForm.querySelector('button[type="submit"]');
      submitBtn.disabled = true;
      submitBtn.textContent = 'Mendaftarkan...';

      try {
        const response = await fetch('/api/auth/register', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ name, email, password, role: selectedRole })
        });
        
        const data = await response.json();
        
        if (response.ok && data.success) {
          showAlert(data.message + '! Mengalihkan ke halaman masuk...', 'success');
          setTimeout(() => {
            window.location.href = '/auth/login.html';
          }, 1500);
        } else {
          showAlert(data.message || 'Pendaftaran gagal. Coba lagi.', 'danger');
          submitBtn.disabled = false;
          submitBtn.textContent = 'Daftar Akun';
        }
      } catch (err) {
        console.error(err);
        showAlert('Koneksi ke server gagal. Pastikan backend aktif.', 'danger');
        submitBtn.disabled = false;
        submitBtn.textContent = 'Daftar Akun';
      }
    });
  }

  function showAlert(msg, type) {
    if (!alertEl) return;
    if (type === 'none') {
      alertEl.style.display = 'none';
      alertEl.textContent = '';
      return;
    }

    alertEl.style.display = 'block';
    alertEl.textContent = msg;
    alertEl.className = `alert alert-${type}`;
    // Scroll alert into view smoothly
    alertEl.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  }
});

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

  // Handle Login submission
  if (loginForm) {
    loginForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const email = document.getElementById('email').value.trim();
      const password = document.getElementById('password').value.trim();

      showAlert('', 'none'); // Clear alert

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
              window.location.href = '/marketplace/';
            }
          }, 1000);
        } else {
          showAlert(data.message || 'Login gagal, silakan periksa email/password Anda', 'danger');
        }
      } catch (err) {
        console.error(err);
        showAlert('Koneksi ke server gagal, pastikan backend aktif', 'danger');
      }
    });
  }

  // Handle Register submission
  if (registerForm) {
    registerForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const name = document.getElementById('name').value.trim();
      const email = document.getElementById('email').value.trim();
      const password = document.getElementById('password').value.trim();

      showAlert('', 'none'); // Clear alert

      try {
        const response = await fetch('/api/auth/register', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ name, email, password, role: selectedRole })
        });
        
        const data = await response.json();
        
        if (response.ok && data.success) {
          showAlert(data.message + '! Mengalihkan ke login...', 'success');
          setTimeout(() => {
            window.location.href = '/auth/login.html';
          }, 1500);
        } else {
          showAlert(data.message || 'Pendaftaran gagal', 'danger');
        }
      } catch (err) {
        console.error(err);
        showAlert('Koneksi ke server gagal, pastikan backend aktif', 'danger');
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
  }
});

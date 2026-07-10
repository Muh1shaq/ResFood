// Dashboard logic
document.addEventListener('DOMContentLoaded', () => {
  const welcomeMsg = document.getElementById('dashboard-welcome-msg');
  const demoBanner = document.getElementById('demo-mode-banner');
  const demoLoginBtn = document.getElementById('demo-login-btn');
  const addForm = document.getElementById('add-food-form');
  const tbody = document.getElementById('dashboard-listings-tbody');
  const countBadge = document.getElementById('listing-count-badge');
  const formAlert = document.getElementById('form-alert');

  let currentPartner = null;

  // Strict auth & role guard (enforceRoleAccess in app.js handles redirect,
  // but we add a local guard here as a safety net in case app.js loads late)
  const cachedUser = localStorage.getItem('resfood_user');
  if (!cachedUser) {
    window.location.href = '/';
    return;
  }
  const user = JSON.parse(cachedUser);
  if (user.role !== 'restaurant') {
    const ROLE_HOME = { nonprofit: '/donor/', public: '/marketplace/', courier: '/marketplace/' };
    window.location.href = ROLE_HOME[user.role] || '/';
    return;
  }

  currentPartner = user;
  if (welcomeMsg) {
    welcomeMsg.textContent = `Selamat datang kembali, ${user.name}! Kelola surplus makanan Anda secara real-time.`;
  }
  if (demoBanner) demoBanner.style.display = 'none';

  if (demoLoginBtn) {
    demoLoginBtn.addEventListener('click', () => {
      window.location.href = '/auth/login.html';
    });
  }

  // Load listings
  async function loadListings() {
    try {
      const response = await fetch('/api/foods');
      if (!response.ok) throw new Error('Gagal memuat makanan');
      const data = await response.json();

      // Filter foods that belong to the logged-in partner
      const partnerListings = data.filter(food =>
        food.restaurantId === currentPartner.id || food.restaurantName === currentPartner.name
      );

      renderTable(partnerListings);
    } catch (err) {
      console.error(err);
      tbody.innerHTML = `
        <tr>
          <td colspan="6" style="text-align: center; color: var(--danger); padding: 2rem; font-weight: bold;">
            Gagal terhubung ke backend API. Pastikan server Node Anda sedang berjalan.
          </td>
        </tr>
      `;
    }
  }

  // Format currency helper
  function formatRupiah(val) {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      maximumFractionDigits: 0
    }).format(val);
  }

  // Render Table rows
  function renderTable(foods) {
    countBadge.textContent = `${foods.length} Item`;
    if (foods.length === 0) {
      tbody.innerHTML = `
        <tr>
          <td colspan="6" style="text-align: center; color: var(--text-muted); padding: 3rem;">
            Tidak ada makanan surplus aktif. Tambahkan item baru di panel kiri!
          </td>
        </tr>
      `;
      return;
    }

    tbody.innerHTML = foods.map(food => {
      return `
        <tr id="food-row-${food.id}">
          <td>
            <div style="display:flex; align-items:center; gap:0.75rem;">
              <img src="${food.imageUrl}" alt="${food.title}" style="width:3rem; height:3rem; border-radius:0.5rem; object-fit:cover; border:1px solid var(--border-card);">
              <div>
                <p class="food-title-cell">${food.title}</p>
                <span style="font-size:0.75rem; color:var(--text-muted);">Batas: ${food.expiryTime}</span>
              </div>
            </div>
          </td>
          <td><span class="badge badge-primary">${food.category}</span></td>
          <td style="font-weight:700;">${food.quantity} Porsi</td>
          <td>
            <span style="text-decoration:line-through; font-size:0.75rem; color:var(--text-muted);">${formatRupiah(food.originalPrice)}</span><br>
            <span style="font-weight:700; color:var(--primary);">${formatRupiah(food.discountPrice)}</span>
          </td>
          <td>
            <span class="badge badge-info" style="font-size:0.7rem; white-space:nowrap;">
              🛡️ ${food.safetyStatus || 'Safety Check OK'}
            </span>
          </td>
          <td>
            <button class="btn-delete" data-id="${food.id}" title="Hapus Listing">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-trash-2"><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/><line x1="10" x2="10" y1="11" y2="17"/><line x1="14" x2="14" y1="11" y2="17"/></svg>
            </button>
          </td>
        </tr>
      `;
    }).join('');

    // Attach delete listeners
    tbody.querySelectorAll('.btn-delete').forEach(btn => {
      btn.addEventListener('click', async () => {
        const id = btn.dataset.id;
        if (confirm('Apakah Anda yakin ingin menghapus surplus makanan ini?')) {
          btn.disabled = true;
          try {
            const response = await fetch(`/api/foods/${id}`, { method: 'DELETE' });
            const data = await response.json();
            if (response.ok && data.success) {
              // Remove row from UI
              const row = document.getElementById(`food-row-${id}`);
              if (row) row.remove();
              // Reload table to refresh count
              loadListings();
            } else {
              alert(data.message || 'Gagal menghapus makanan');
              btn.disabled = false;
            }
          } catch (err) {
            console.error(err);
            alert('Koneksi terputus ke backend server');
            btn.disabled = false;
          }
        }
      });
    });
  }

  // Handle Form Submission
  if (addForm) {
    addForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      
      const title = document.getElementById('food-title').value.trim();
      const category = document.getElementById('food-category').value;
      const quantityRaw = document.getElementById('food-qty').value;
      const originalPriceRaw = document.getElementById('food-original-price').value;
      const priceRaw = document.getElementById('food-price').value;
      const expiryTimeRaw = document.getElementById('food-expiry').value;
      const description = document.getElementById('food-desc').value.trim();

      // Convert datetime-local to readable Indonesian format
      let expiryTime = expiryTimeRaw;
      if (expiryTimeRaw) {
        const expiryDate = new Date(expiryTimeRaw);
        expiryTime = expiryDate.toLocaleString('id-ID', {
          weekday: 'long', day: 'numeric', month: 'long', year: 'numeric',
          hour: '2-digit', minute: '2-digit', timeZoneName: 'short'
        });
      }

      showFormAlert('', 'none');

      // ============================================================
      // CLIENT-SIDE VALIDATION
      // ============================================================
      if (!title) {
        showFormAlert('Nama makanan wajib diisi.', 'danger');
        return;
      }

      if (title.length < 3) {
        showFormAlert('Nama makanan minimal 3 karakter.', 'danger');
        return;
      }

      const quantity = Number(quantityRaw);
      if (!quantityRaw || isNaN(quantity) || quantity <= 0 || !Number.isInteger(quantity)) {
        showFormAlert('Jumlah porsi harus berupa bilangan bulat positif (misal: 5).', 'danger');
        return;
      }

      if (quantity > 1000) {
        showFormAlert('Jumlah porsi tidak boleh lebih dari 1000.', 'danger');
        return;
      }

      const price = Number(priceRaw);
      if (!priceRaw || isNaN(price) || price <= 0) {
        showFormAlert('Harga diskon harus berupa angka positif.', 'danger');
        return;
      }

      // Compute original price: use input if provided, otherwise auto 2x
      const originalPrice = originalPriceRaw ? Number(originalPriceRaw) : price * 2;
      if (isNaN(originalPrice) || originalPrice <= 0) {
        showFormAlert('Harga asli harus berupa angka positif.', 'danger');
        return;
      }

      if (price >= originalPrice) {
        showFormAlert('Harga diskon harus lebih rendah dari harga asli. Ini adalah syarat listing surplus makanan.', 'danger');
        return;
      }

      if (!expiryTimeRaw) {
        showFormAlert('Batas waktu pengambilan wajib diisi.', 'danger');
        return;
      }

      // Ensure the expiry time is in the future
      const expiryDate = new Date(expiryTimeRaw);
      if (expiryDate <= new Date()) {
        showFormAlert('Batas waktu pengambilan harus di masa mendatang.', 'danger');
        return;
      }

      // Disable submit button
      const submitBtn = addForm.querySelector('button[type="submit"]');
      submitBtn.disabled = true;
      submitBtn.textContent = 'Memproses...';

      try {
        const payload = {
          title,
          category,
          quantity,
          originalPrice,
          price,
          expiryTime,
          description,
          restaurantId: currentPartner.id,
          restaurantName: currentPartner.name
        };

        const response = await fetch('/api/foods', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });

        const data = await response.json();

        if (response.ok && data.success) {
          showFormAlert('✅ Makanan surplus berhasil dipasang dan live di Marketplace!', 'success');
          addForm.reset();
          loadListings();
        } else {
          showFormAlert(data.message || 'Gagal menambahkan makanan surplus', 'danger');
        }
      } catch (err) {
        console.error(err);
        showFormAlert('Koneksi ke backend server gagal. Pastikan server aktif.', 'danger');
      } finally {
        submitBtn.disabled = false;
        submitBtn.textContent = 'Pasang Makanan →';
      }
    });
  }

  function showFormAlert(msg, type) {
    if (!formAlert) return;
    if (type === 'none') {
      formAlert.style.display = 'none';
      formAlert.textContent = '';
      return;
    }
    formAlert.style.display = 'block';
    formAlert.textContent = msg;
    formAlert.className = `alert alert-${type}`;
    formAlert.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  }

  // Initial load
  loadListings();
});

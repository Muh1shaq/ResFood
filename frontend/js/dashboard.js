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

  // Check auth
  const cachedUser = localStorage.getItem('resfood_user');
  if (cachedUser) {
    const user = JSON.parse(cachedUser);
    if (user.role === 'restaurant') {
      currentPartner = user;
      welcomeMsg.textContent = `Selamat datang kembali, ${user.name}! Kelola surplus makanan Anda secara real-time.`;
      demoBanner.style.display = 'none';
    } else {
      // User is logged in but not a restaurant. Allow demo mode but advise
      currentPartner = { id: '1', name: 'Bakery Aroma Indah', role: 'restaurant' };
      demoBanner.style.display = 'flex';
      demoBanner.querySelector('strong').textContent = `Perhatian: Peran Anda saat ini (${user.role}) bukan Mitra Restoran.`;
      welcomeMsg.textContent = `Portal Mitra (Mode Simulasi - Bakery Aroma Indah)`;
    }
  } else {
    // Guest. Activate demo mode
    currentPartner = { id: '1', name: 'Bakery Aroma Indah', role: 'restaurant' };
    demoBanner.style.display = 'flex';
    welcomeMsg.textContent = `Portal Mitra (Mode Simulasi - Bakery Aroma Indah)`;
  }

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

      // In a real database we filter by partner ID:
      // const partnerListings = data.filter(food => food.restaurantId === currentPartner.id);
      // For the demo we show all foods that belong to 'Bakery Aroma Indah' (ID 1) OR show all if none
      const partnerListings = data.filter(food => food.restaurantId === currentPartner.id || food.restaurantName === currentPartner.name);

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
          try {
            const response = await fetch(`/api/foods/${id}`, { method: 'DELETE' });
            const data = await response.json();
            if (response.ok && data.success) {
              // Remove row from UI
              const row = document.getElementById(`food-row-${id}`);
              if (row) row.remove();
              // Reload table just in case
              loadListings();
            } else {
              alert(data.message || 'Gagal menghapus makanan');
            }
          } catch (err) {
            console.error(err);
            alert('Koneksi terputus ke backend server');
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
      const quantity = document.getElementById('food-qty').value;
      const originalPrice = document.getElementById('food-original-price').value || Number(document.getElementById('food-price').value) * 2;
      const price = document.getElementById('food-price').value;
      const expiryTime = document.getElementById('food-expiry').value.trim();
      const description = document.getElementById('food-desc').value.trim();

      showFormAlert('', 'none');

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
          showFormAlert('Makanan surplus berhasil dipasang dan live di Marketplace!', 'success');
          addForm.reset();
          loadListings();
          // Also update core infra logs (if landing page impact data is updated, this will align)
        } else {
          showFormAlert(data.message || 'Gagal menambahkan makanan surplus', 'danger');
        }
      } catch (err) {
        console.error(err);
        showFormAlert('Koneksi ke backend server gagal', 'danger');
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
  }

  // Initial load
  loadListings();
});

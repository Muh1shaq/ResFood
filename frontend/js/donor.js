// Redistribution Network logic
document.addEventListener('DOMContentLoaded', () => {
  const donationsList = document.getElementById('donations-list-container');
  const countBadge = document.getElementById('active-donations-count');
  const addForm = document.getElementById('add-donation-request-form');
  const volunteerForm = document.getElementById('volunteer-signup-form');
  const formAlert = document.getElementById('request-form-alert');
  const volunteerAlert = document.getElementById('volunteer-form-alert');
  const programDropdown = document.getElementById('vol-target-id');

  // Modal Donate elements
  const donateModal = document.getElementById('donate-food-modal');
  const closeDonateBtn = document.getElementById('close-donate-modal-btn');
  const donateModalReqTitle = document.getElementById('donate-modal-req-title');
  const donateModalProtocol = document.getElementById('donate-modal-protocol');
  const donatorNameInput = document.getElementById('donator-name');
  const donateQtyInput = document.getElementById('donate-qty');
  const confirmDonateBtn = document.getElementById('confirm-donate-btn');

  // Local state
  let requests = [];
  let selectedReq = null;

  // Fetch all requests
  async function fetchRequests() {
    try {
      const response = await fetch('/api/donations');
      if (!response.ok) throw new Error('Gagal mengambil donasi pangan');
      requests = await response.json();
      renderRequests();
      populateProgramDropdown();
    } catch (err) {
      console.error(err);
      donationsList.innerHTML = `
        <div style="text-align: center; color: var(--danger); padding: 4rem 0; font-weight: bold;">
          Gagal terhubung ke API backend. Pastikan server Node Anda sedang berjalan.
        </div>
      `;
    }
  }

  // Populate volunteer dropdown
  function populateProgramDropdown() {
    if (!programDropdown) return;
    const activeRequests = requests.filter(r => r.status === 'Berlangsung');
    
    let optionsHtml = '<option value="">Pilih program di samping...</option>';
    optionsHtml += activeRequests.map(r => {
      return `<option value="${r.id}">${r.name} - ${r.title}</option>`;
    }).join('');

    programDropdown.innerHTML = optionsHtml;
  }

  // Render Requests to DOM
  function renderRequests() {
    countBadge.textContent = `${requests.length} Lembaga`;
    if (requests.length === 0) {
      donationsList.innerHTML = `
        <div style="text-align: center; color: var(--text-muted); padding: 4rem 0;">
          Tidak ada permintaan donasi pangan yang sedang berlangsung.
        </div>
      `;
      return;
    }

    donationsList.innerHTML = requests.map(req => {
      const pct = Math.min(100, Math.floor((req.current / req.target) * 100));
      const statusBadge = req.status === 'Selesai' 
        ? `<span class="badge badge-primary">Selesai</span>` 
        : `<span class="badge badge-accent">Berlangsung</span>`;

      return `
        <div class="glass-card request-card animate-slide-up" style="border-left-color: ${req.status === 'Selesai' ? 'var(--primary)' : 'var(--accent)'}">
          <div class="request-card-header">
            <div>
              <h3 class="request-card-title">${req.title}</h3>
              <p class="request-card-org">
                <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-users"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
                ${req.name}
              </p>
            </div>
            <div style="display:flex; flex-direction:column; align-items:flex-end; gap:0.25rem;">
              ${statusBadge}
              <span style="font-size:0.7rem; color:var(--text-muted); font-weight:700;">Batas: ${req.deadline}</span>
            </div>
          </div>

          <p style="font-size:0.85rem; color:var(--text-secondary); line-height:1.5; margin-bottom:1rem;">
            ${req.description}
          </p>

          <!-- Progress Bar -->
          <div class="progress-box">
            <div class="progress-labels">
              <span>Pengumpulan:</span>
              <span style="color:var(--text-primary)">${req.current} / ${req.target} Porsi (${pct}%)</span>
            </div>
            <div class="progress-bg">
              <div class="progress-fill" style="width: ${pct}%; background: ${req.status === 'Selesai' ? 'var(--primary)' : 'linear-gradient(90deg, var(--accent), #f59e0b)'}"></div>
            </div>
          </div>

          <div style="font-size: 0.75rem; color: var(--text-muted); font-weight: 600; margin-bottom: 1rem;">
            🛡️ Protokol Logistik Keamanan: ${req.safetyProtocol}
          </div>

          ${req.status === 'Berlangsung' ? `
            <div class="card-actions">
              <button class="btn btn-outline donate-trigger-btn" data-id="${req.id}" style="padding: 0.5rem 1rem; font-size:0.8rem;">
                Salurkan Makanan
              </button>
            </div>
          ` : `
            <div style="text-align:right; font-size:0.8rem; color:var(--primary); font-weight:700; padding-top:0.5rem;">
              ✓ Target Donasi Terpenuhi
            </div>
          `}
        </div>
      `;
    }).join('');

    // Attach click listeners to donate trigger buttons
    donationsList.querySelectorAll('.donate-trigger-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const reqId = btn.dataset.id;
        openDonateModal(reqId);
      });
    });
  }

  // Open Donate Modal
  function openDonateModal(reqId) {
    selectedReq = requests.find(r => r.id === reqId);
    if (!selectedReq) return;

    donateModalReqTitle.textContent = selectedReq.title;
    donateModalProtocol.textContent = `🛡️ Protokol: ${selectedReq.safetyProtocol}`;
    
    // Auto populate donator name if logged in
    const cachedUser = localStorage.getItem('resfood_user');
    if (cachedUser) {
      const user = JSON.parse(cachedUser);
      donatorNameInput.value = user.name;
    } else {
      donatorNameInput.value = '';
    }

    donateQtyInput.value = '';
    donateModal.style.display = 'flex';
  }

  // Close Donate Modal
  function closeDonateModal() {
    donateModal.style.display = 'none';
    selectedReq = null;
  }

  if (closeDonateBtn) closeDonateBtn.addEventListener('click', closeDonateModal);

  // Submit Donation Contribution
  if (confirmDonateBtn) {
    confirmDonateBtn.addEventListener('click', async () => {
      if (!selectedReq) return;

      const contributorName = donatorNameInput.value.trim() || 'Donatur Anonim';
      const quantity = donateQtyInput.value;

      if (!quantity || quantity <= 0) {
        alert('Silakan masukkan jumlah porsi donasi yang valid.');
        return;
      }

      try {
        const response = await fetch(`/api/donations/${selectedReq.id}/donate`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ quantity, contributorName })
        });

        const data = await response.json();

        if (response.ok && data.success) {
          alert('Terima kasih atas kontribusi donasi Anda! Koordinasikan pengiriman bersama kurir relawan kami.');
          closeDonateModal();
          fetchRequests();
        } else {
          alert(data.message || 'Gagal mengirimkan donasi.');
        }
      } catch (err) {
        console.error(err);
        alert('Koneksi terputus ke server backend.');
      }
    });
  }

  // Submit new request (for nonprofit organizations)
  if (addForm) {
    addForm.addEventListener('submit', async (e) => {
      e.preventDefault();

      const name = document.getElementById('req-org').value.trim();
      const title = document.getElementById('req-title').value.trim();
      const target = document.getElementById('req-target').value;
      const deadline = document.getElementById('req-deadline').value.trim();
      const safetyProtocol = document.getElementById('req-protocol').value.trim();
      const description = document.getElementById('req-desc').value.trim();

      showAlert(formAlert, '', 'none');

      try {
        const response = await fetch('/api/donations', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name, title, target, deadline, safetyProtocol, description
          })
        });

        const data = await response.json();

        if (response.ok && data.success) {
          showAlert(formAlert, 'Permintaan donasi pangan berhasil diterbitkan!', 'success');
          addForm.reset();
          fetchRequests();
        } else {
          showAlert(formAlert, data.message || 'Gagal menerbitkan permintaan donasi.', 'danger');
        }
      } catch (err) {
        console.error(err);
        showAlert(formAlert, 'Gagal terhubung ke server backend.', 'danger');
      }
    });
  }

  // Submit Courier Volunteer Form
  if (volunteerForm) {
    volunteerForm.addEventListener('submit', async (e) => {
      e.preventDefault();

      const programId = programDropdown.value;
      const volunteerName = document.getElementById('vol-name').value.trim();
      const volunteerPhone = document.getElementById('vol-phone').value.trim();

      if (!programId) {
        showAlert(volunteerAlert, 'Pilihlah salah satu program logistik donasi di samping.', 'danger');
        return;
      }

      showAlert(volunteerAlert, '', 'none');

      try {
        const response = await fetch(`/api/donations/${programId}/volunteer`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ volunteerName, volunteerPhone })
        });

        const data = await response.json();

        if (response.ok && data.success) {
          showAlert(volunteerAlert, 'Terima kasih, Anda terdaftar sebagai Kurir Relawan! Kami akan segera menghubungi Anda.', 'success');
          volunteerForm.reset();
        } else {
          showAlert(volunteerAlert, data.message || 'Pendaftaran kurir gagal.', 'danger');
        }
      } catch (err) {
        console.error(err);
        showAlert(volunteerAlert, 'Gagal terhubung ke server backend.', 'danger');
      }
    });
  }

  function showAlert(alertEl, msg, type) {
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

  // Initial load
  fetchRequests();
});

// Marketplace Javascript Logic
document.addEventListener('DOMContentLoaded', () => {
  const listBtn = document.getElementById('view-mode-list-btn');
  const mapBtn = document.getElementById('view-mode-map-btn');
  const listBlock = document.getElementById('marketplace-list-block');
  const mapBlock = document.getElementById('map-view-block');
  const searchInput = document.getElementById('search-input');
  const categoryContainer = document.getElementById('category-pills-container');
  const mapSvg = document.getElementById('jakarta-food-map');

  // Modal elements
  const modal = document.getElementById('claim-modal');
  const closeModalBtn = document.getElementById('close-modal-btn');
  const modalTitle = document.getElementById('claim-modal-title');
  const modalResto = document.getElementById('claim-modal-resto');
  const modalDesc = document.getElementById('claim-modal-desc');
  const modalPrice = document.getElementById('claim-modal-price');
  const modalTotal = document.getElementById('claim-modal-total');
  const qtyMinus = document.getElementById('qty-minus');
  const qtyPlus = document.getElementById('qty-plus');
  const qtyVal = document.getElementById('qty-val');
  const confirmClaimBtn = document.getElementById('confirm-claim-btn');
  const modalNormal = document.getElementById('claim-modal-normal');
  const modalSuccess = document.getElementById('claim-modal-success');
  const successCode = document.getElementById('success-pickup-code');
  const finishClaimBtn = document.getElementById('finish-claim-btn');

  // State
  let foods = [];
  let filteredFoods = [];
  let activeCategory = 'semua';
  let activeSearch = '';
  let viewMode = 'list'; // 'list' or 'map'

  let selectedFood = null;
  let currentQty = 1;

  // Formatting currency helper
  function formatRupiah(val) {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      maximumFractionDigits: 0
    }).format(val);
  }

  // Strict auth & role guard
  const _cachedUser = localStorage.getItem('resfood_user');
  if (!_cachedUser) {
    window.location.href = '/';
    return;
  }
  const _user = JSON.parse(_cachedUser);
  if (_user.role !== 'public' && _user.role !== 'courier') {
    const ROLE_HOME = { restaurant: '/dashboard/', nonprofit: '/donor/' };
    window.location.href = ROLE_HOME[_user.role] || '/';
    return;
  }

  // Fetch foods
  async function fetchFoods() {
    try {
      const response = await fetch('/api/foods');
      if (!response.ok) throw new Error('Gagal mengambil data surplus makanan');
      foods = await response.json();
      applyFilters();
    } catch (err) {
      console.error(err);
      listBlock.innerHTML = `
        <div style="grid-column: 1 / -1; text-align: center; color: var(--danger); padding: 5rem 0; font-weight: bold;">
          Gagal terhubung ke API backend. Pastikan server Node Anda sedang berjalan.
        </div>
      `;
    }
  }

  // Apply filters and search keywords
  function applyFilters() {
    filteredFoods = foods.filter(food => {
      const matchesSearch = food.title.toLowerCase().includes(activeSearch.toLowerCase()) || 
                            food.restaurantName.toLowerCase().includes(activeSearch.toLowerCase());
      const matchesCategory = activeCategory === 'semua' || food.category === activeCategory;
      return matchesSearch && matchesCategory;
    });

    renderFoods();
    renderMapPoints();
  }

  // Render standard list cards
  function renderFoods() {
    if (filteredFoods.length === 0) {
      listBlock.innerHTML = `
        <div style="grid-column: 1 / -1; text-align: center; color: var(--text-muted); padding: 5rem 0;">
          <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-search-code" style="opacity: 0.25; margin-bottom:1rem;"><circle cx="10" cy="10" r="7"/><path d="m21 21-6-6"/></svg>
          <p style="font-weight:700;">Makanan tidak ditemukan</p>
          <p style="font-size:0.85rem;">Cobalah cari kata kunci lain atau pilih kategori yang berbeda.</p>
        </div>
      `;
      return;
    }

    listBlock.innerHTML = filteredFoods.map(food => {
      return `
        <div class="glass-card food-card animate-slide-up">
          <img src="${food.imageUrl}" alt="${food.title}" class="food-card-img">
          <div class="food-card-body">
            <div class="restaurant-name">
              <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-store"><path d="m2 7 4.4-4c.3-.3.8-.5 1.2-.5h8.8c.4 0 .9.2 1.2.5L22 7"/><path d="M9 22v-4h6v4"/><path d="M20 7v13a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V7"/><path d="M2 7h20"/><path d="M12 2v5"/></svg>
              ${food.restaurantName}
            </div>
            <h3 class="food-card-title">${food.title}</h3>
            <p class="food-desc">${food.description}</p>
            
            <div class="food-meta">
              <span>📍 ${food.distance} km terdekat</span>
              <span style="color:var(--primary)">HALAL ✓</span>
            </div>

            <div style="display:flex; justify-content:space-between; align-items:center; margin-top:auto;">
              <div>
                <span class="price-original">${formatRupiah(food.originalPrice)}</span><br>
                <span class="price-discount">${formatRupiah(food.discountPrice)}</span>
              </div>
              <span class="badge badge-danger" style="font-size: 0.7rem; font-weight:800;">Tersisa: ${food.quantity} Porsi</span>
            </div>

            <div style="margin-top:1.25rem; display:flex; justify-content:space-between; align-items:center; gap:0.5rem;">
              <span class="badge badge-info" style="font-size:0.65rem;">🛡️ Safety Checked</span>
              <button class="btn btn-primary claim-trigger-btn" data-id="${food.id}" style="padding: 0.5rem 1rem; font-size: 0.8rem;">Klaim Porsi</button>
            </div>
          </div>
        </div>
      `;
    }).join('');

    // Attach click triggers to claim buttons
    listBlock.querySelectorAll('.claim-trigger-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const foodId = btn.dataset.id;
        openClaimModal(foodId);
      });
    });
  }

  // Draw interactive coordinates on the custom SVG map
  function renderMapPoints() {
    if (!mapSvg) return;

    // Clear existing dynamic elements (pins, labels)
    const dynamicElements = mapSvg.querySelectorAll('.dynamic-map-element');
    dynamicElements.forEach(el => el.remove());

    // Scale coordinates to fit SVG size (800x400)
    // Jakarta bounding box approximations: Lat -6.23 to -6.19, Long 106.8200 to 106.8600
    const latMin = -6.2300;
    const latMax = -6.1900;
    const lonMin = 106.8200;
    const lonMax = 106.8600;

    filteredFoods.forEach(food => {
      // Scale coordinates
      const x = ((food.longitude - lonMin) / (lonMax - lonMin)) * 800;
      const y = 400 - (((food.latitude - latMin) / (latMax - latMin)) * 400); // SVG coordinates start at top left

      // Create pin element
      const pinG = document.createElementNS("http://www.w3.org/2000/svg", "g");
      pinG.setAttribute("class", "map-pin-point dynamic-map-element");
      pinG.setAttribute("transform", `translate(${x}, ${y})`);
      pinG.addEventListener('click', () => openClaimModal(food.id));

      // Pin circle glow
      const pulseCircle = document.createElementNS("http://www.w3.org/2000/svg", "circle");
      pulseCircle.setAttribute("cx", "0");
      pulseCircle.setAttribute("cy", "0");
      pulseCircle.setAttribute("r", "12");
      pulseCircle.setAttribute("fill", "var(--primary)");
      pulseCircle.setAttribute("opacity", "0.25");

      // Pin center circle
      const centerCircle = document.createElementNS("http://www.w3.org/2000/svg", "circle");
      centerCircle.setAttribute("cx", "0");
      centerCircle.setAttribute("cy", "0");
      centerCircle.setAttribute("r", "6");
      centerCircle.setAttribute("fill", food.distance < 1.0 ? "var(--accent)" : "var(--primary)");

      // Text label
      const textLabel = document.createElementNS("http://www.w3.org/2000/svg", "text");
      textLabel.setAttribute("x", "8");
      textLabel.setAttribute("y", "3");
      textLabel.setAttribute("class", "map-pin-label");
      textLabel.textContent = `${food.restaurantName} (${formatRupiah(food.discountPrice)})`;

      pinG.appendChild(pulseCircle);
      pinG.appendChild(centerCircle);
      pinG.appendChild(textLabel);
      mapSvg.appendChild(pinG);
    });
  }

  // Open Claim Modal
  function openClaimModal(foodId) {
    selectedFood = foods.find(f => f.id === foodId);
    if (!selectedFood) return;

    currentQty = 1;
    modalTitle.textContent = selectedFood.title;
    modalResto.textContent = selectedFood.restaurantName;
    modalDesc.textContent = selectedFood.description;
    modalPrice.textContent = formatRupiah(selectedFood.discountPrice);
    
    updateModalPriceDetails();

    modalNormal.style.display = 'block';
    modalSuccess.style.display = 'none';
    modal.style.display = 'flex';
  }

  function updateModalPriceDetails() {
    qtyVal.textContent = currentQty;
    const totalPrice = selectedFood.discountPrice * currentQty;
    modalTotal.textContent = formatRupiah(totalPrice);
  }

  // Close modal
  function closeModal() {
    modal.style.display = 'none';
    selectedFood = null;
  }

  if (closeModalBtn) closeModalBtn.addEventListener('click', closeModal);
  if (finishClaimBtn) finishClaimBtn.addEventListener('click', () => {
    closeModal();
    fetchFoods(); // Reload listings to update quantities
  });

  // Quantity adjusting
  if (qtyMinus) {
    qtyMinus.addEventListener('click', () => {
      if (currentQty > 1) {
        currentQty--;
        updateModalPriceDetails();
      }
    });
  }

  if (qtyPlus) {
    qtyPlus.addEventListener('click', () => {
      if (selectedFood && currentQty < selectedFood.quantity) {
        currentQty++;
        updateModalPriceDetails();
      } else {
        alert('Tidak bisa melebihi jumlah porsi makanan surplus yang tersedia.');
      }
    });
  }

  // Confirm claim action
  if (confirmClaimBtn) {
    confirmClaimBtn.addEventListener('click', async () => {
      if (!selectedFood) return;

      // Get logged-in user
      let userId = '3'; // Default guest public user
      let userName = 'Masyarakat';
      const cachedUser = localStorage.getItem('resfood_user');
      if (cachedUser) {
        const user = JSON.parse(cachedUser);
        userId = user.id;
        userName = user.name;
      }

      try {
        const response = await fetch('/api/foods/claim', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            foodId: selectedFood.id,
            quantity: currentQty,
            userId,
            userName
          })
        });

        const data = await response.json();

        if (response.ok && data.success) {
          // Display success state with pick up code
          successCode.textContent = data.claim.claimCode;
          modalNormal.style.display = 'none';
          modalSuccess.style.display = 'block';
        } else {
          alert(data.message || 'Klaim makanan surplus gagal.');
        }
      } catch (err) {
        console.error(err);
        alert('Koneksi terputus ke server backend. Gagal memvalidasi klaim.');
      }
    });
  }

  // Filter tag click handler
  if (categoryContainer) {
    categoryContainer.addEventListener('click', (e) => {
      if (e.target.classList.contains('category-pill')) {
        categoryContainer.querySelectorAll('.category-pill').forEach(pill => pill.classList.remove('active'));
        e.target.classList.add('active');
        activeCategory = e.target.dataset.cat;
        applyFilters();
      }
    });
  }

  // Search input handler
  if (searchInput) {
    searchInput.addEventListener('input', (e) => {
      activeSearch = e.target.value;
      applyFilters();
    });
  }

  // Switch View Mode list vs map
  if (listBtn) {
    listBtn.addEventListener('click', () => {
      listBtn.classList.add('active');
      mapBtn.classList.remove('active');
      listBlock.style.display = 'grid';
      mapBlock.style.display = 'none';
      viewMode = 'list';
    });
  }

  if (mapBtn) {
    mapBtn.addEventListener('click', () => {
      mapBtn.classList.add('active');
      listBtn.classList.remove('active');
      listBlock.style.display = 'none';
      mapBlock.style.display = 'block';
      viewMode = 'map';
      renderMapPoints();
    });
  }

  // Initial load
  fetchFoods();
});

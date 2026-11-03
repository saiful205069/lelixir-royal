/**
 * L’ÉLIXIR ROYAL — Haute Parfumerie
 * Interactive Application & Client Logic
 */

// Global State
const state = {
  products: [],
  filteredProducts: [],
  currentCategory: 'All',
  cart: JSON.parse(localStorage.getItem('elixir_cart') || '[]'),
  heroIndex: 0,
  promoDiscountRate: 0,
  appliedPromo: '',
  reviews: [],
  currentReviewIndex: 0,
  settings: {
    storeName: "L’Élixir Royal",
    announcementText: "Complimentary Delivery across Bangladesh on orders over ৳2,500 • Cash On Delivery Available • Code: ROYAL10",
    promoCode: "ROYAL10",
    promoDiscount: 10,
    insideDhakaDelivery: 70,
    outsideDhakaDelivery: 130,
    freeShippingThreshold: 2500,
    contactPhone: "+880 1711-000000",
    contactEmail: "concierge@lelixirroyal.com",
    contactAddress: "Gulshan Avenue, Dhaka • 12 Place Vendôme, Paris"
  },
  heroPerfumes: [
    {
      id: 'sovereign-oud',
      name: 'Sovereign Oud',
      tagline: 'A Symphony of Scent',
      description: 'Indulge in a fragrance crafted to transcend time—a symphony of elegance, mystery, and allure, designed for those who seek beauty in every breath.',
      image: 'assets/images/hero-perfume.jpg',
      price: 3950,
      discountBadge: '30% OFF'
    },
    {
      id: 'noir-elixir',
      name: 'Noir Elixir',
      tagline: 'Shadows of Seduction',
      description: 'An enigmatic blend of blackcurrant nectar, smoked saffron, and aged Haitian vetiver crafted for nocturnal royalty.',
      image: 'assets/images/noir-elixir.jpg',
      price: 3450,
      discountBadge: '18% OFF'
    },
    {
      id: 'celestial-blossom',
      name: 'Celestial Blossom',
      tagline: 'An Ethereal Floral Reverie',
      description: 'Grasse May rose and crystalline jasmine petals interwoven with warm amber for a transcendent royal trail.',
      image: 'assets/images/celestial-blossom.jpg',
      price: 2850,
      discountBadge: '20% OFF'
    }
  ]
};

// Initialize Application
function initApp() {
  updateDynamicSEO();
  setupDialogLightDismiss();
  setupMobileMenu();
  setupHeroSlider();
  setupCartUI();
  fetchSettings();
  fetchProducts();
  fetchReviews();
  setupNewsletter();
  setupContactForm();
  setupCheckoutForm();
  setupOrderTracking();
  setupReviewForm();
  setupSearch();
  setupSmoothScroll();
}

function updateDynamicSEO() {
  try {
    const origin = window.location.origin;
    if (origin && !origin.includes('localhost') && !origin.includes('127.0.0.1')) {
      const canonical = document.querySelector('link[rel="canonical"]');
      if (canonical) canonical.href = origin + '/';
      const ogUrl = document.querySelector('meta[property="og:url"]');
      if (ogUrl) ogUrl.content = origin + '/';
      const ogImg = document.querySelector('meta[property="og:image"]');
      if (ogImg && ogImg.content.includes('localhost')) {
        ogImg.content = origin + '/assets/images/hero-perfume.jpg';
      }
      const twImg = document.querySelector('meta[name="twitter:image"]');
      if (twImg && twImg.content.includes('localhost')) {
        twImg.content = origin + '/assets/images/hero-perfume.jpg';
      }
    }
  } catch (e) {}
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initApp);
} else {
  initApp();
}

/* ===================================================================
   GOOGLE ANALYTICS 4 & FIREBASE MEASUREMENT INTEGRATION
   =================================================================== */
function initAnalytics(gaId) {
  if (!gaId || typeof gaId !== 'string') return;
  const cleanId = gaId.trim();
  if (!cleanId) return;

  // Initialize dataLayer and gtag function globally if not already set
  window.dataLayer = window.dataLayer || [];
  if (typeof window.gtag !== 'function') {
    window.gtag = function() {
      window.dataLayer.push(arguments);
    };
  }

  // Inject Google Analytics gtag.js script if not already present
  let script = document.getElementById('google-analytics-script');
  if (!script) {
    script = document.createElement('script');
    script.id = 'google-analytics-script';
    script.async = true;
    script.src = `https://www.googletagmanager.com/gtag/js?id=${encodeURIComponent(cleanId)}`;
    document.head.appendChild(script);

    window.gtag('js', new Date());
  }

  // Configure Measurement ID (supports both Google Analytics and Firebase web streams)
  window.gtag('config', cleanId, {
    send_page_view: true,
    page_title: document.title,
    page_location: window.location.href
  });

  console.log('📊 Google Analytics & Firebase active with ID:', cleanId);
}

function trackAnalyticsEvent(eventName, params = {}) {
  try {
    if (typeof window.gtag === 'function') {
      window.gtag('event', eventName, params);
      console.log(`📊 [Analytics Event] ${eventName}:`, params);
    }
  } catch (err) {
    console.debug('Analytics tracking notice:', err);
  }
}
window.initAnalytics = initAnalytics;
window.trackAnalyticsEvent = trackAnalyticsEvent;

async function fetchSettings() {
  try {
    const res = await fetch('/api/settings');
    const json = await res.json();
    if (json.success && json.data) {
      state.settings = json.data;
      applyDynamicContent(json.data);
      if (json.data.googleAnalyticsId) {
        initAnalytics(json.data.googleAnalyticsId);
      }
    }
  } catch (e) {
    console.error('Error loading settings:', e);
  }
}

function applyDynamicContent(s) {
  if (!s) return;

  const setTxt = (id, val) => {
    const el = document.getElementById(id);
    if (el && val !== undefined && val !== null && String(val).trim() !== '') {
      el.textContent = val;
    }
  };

  const setImg = (id, src) => {
    const el = document.getElementById(id);
    if (el && src && String(src).trim() !== '') {
      el.src = src;
    }
  };

  // Hero Section
  setTxt('hero-badge-el', s.heroBadge);
  setTxt('hero-headline-el', s.heroHeadline);
  setTxt('hero-desc-el', s.heroDesc);

  // Stats Strip
  setTxt('stat-num-1', s.stat1Num);
  setTxt('stat-label-1', s.stat1Label);
  setTxt('stat-num-2', s.stat2Num);
  setTxt('stat-label-2', s.stat2Label);
  setTxt('stat-num-3', s.stat3Num);
  setTxt('stat-label-3', s.stat3Label);
  setTxt('stat-num-4', s.stat4Num);
  setTxt('stat-label-4', s.stat4Label);

  // About Us
  setTxt('about-title-el', s.aboutTitle);
  setTxt('about-subtitle-el', s.aboutSubtitle);
  setTxt('about-desc1-el', s.aboutDesc1);
  setTxt('about-desc2-el', s.aboutDesc2);
  setImg('about-img-el', s.aboutImage);

  // Why Choose Us
  setTxt('why-subtitle-el', s.whySubtitle);
  setTxt('why-title-el', s.whyTitle);
  setImg('why-img-1', s.whyImage1);
  setImg('why-img-2', s.whyImage2);
  setImg('why-img-3', s.whyImage3);
  setImg('why-img-4', s.whyImage4);
  setTxt('feat-title-1', s.feat1Title);
  setTxt('feat-desc-1', s.feat1Desc);
  setTxt('feat-title-2', s.feat2Title);
  setTxt('feat-desc-2', s.feat2Desc);
  setTxt('feat-title-3', s.feat3Title);
  setTxt('feat-desc-3', s.feat3Desc);
  setTxt('feat-title-4', s.feat4Title);
  setTxt('feat-desc-4', s.feat4Desc);

  // Commitment to Purity
  setTxt('purity-title-el', s.purityTitle);
  setTxt('purity-desc1-el', s.purityDesc1);
  setTxt('purity-desc2-el', s.purityDesc2);

  // Newsletter Section
  setTxt('newsletter-title-el', s.newsletterTitle);
  setTxt('newsletter-desc-el', s.newsletterDesc);

  // Contact & Footer
  setTxt('footer-phone-el', s.contactPhone);
  setTxt('footer-email-el', s.contactEmail);
  setTxt('footer-address-el', s.contactAddress);
  setTxt('announcement-text-el', s.announcementText);
}

/* ===================================================================
   MODERN WEB GUIDANCE: DIALOG SETUP & LIGHT-DISMISS FALLBACK
   =================================================================== */
function setupDialogLightDismiss() {
  const dialogs = document.querySelectorAll('dialog');

  dialogs.forEach(dialog => {
    // Handle close buttons inside dialog
    const closeBtns = dialog.querySelectorAll('.modal-close-btn, [data-close-dialog]');
    closeBtns.forEach(btn => {
      btn.addEventListener('click', () => dialog.close());
    });

    // Light-dismiss click outside check
    dialog.addEventListener('click', (e) => {
      const rect = dialog.getBoundingClientRect();
      const isInDialog = (
        rect.top <= e.clientY &&
        e.clientY <= rect.top + rect.height &&
        rect.left <= e.clientX &&
        e.clientX <= rect.left + rect.width
      );
      if (!isInDialog) {
        dialog.close();
      }
    });
  });
}

function openModal(dialogId) {
  const dialog = document.getElementById(dialogId);
  if (dialog && typeof dialog.showModal === 'function') {
    dialog.showModal();
  }
}

function closeModal(dialogId) {
  const dialog = document.getElementById(dialogId);
  if (dialog && typeof dialog.close === 'function') {
    dialog.close();
  }
}

/* ===================================================================
   TOAST NOTIFICATIONS
   =================================================================== */
function showToast(message, icon = '⚜️') {
  let container = document.querySelector('.toast-container');
  if (!container) {
    container = document.createElement('div');
    container.className = 'toast-container';
    document.body.appendChild(container);
  }

  const toast = document.createElement('div');
  toast.className = 'toast';
  toast.innerHTML = `<span>${icon}</span> <span>${message}</span>`;
  container.appendChild(toast);

  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transform = 'translateY(10px)';
    toast.style.transition = 'all 0.3s ease';
    setTimeout(() => toast.remove(), 300);
  }, 3500);
}

/* ===================================================================
   HERO PERFUME CAROUSEL (DYNAMIC FROM ADMIN PANEL)
   =================================================================== */
function updateHeroFromProducts(products) {
  if (!products || products.length === 0) return;
  // Filter products marked as featured in Admin Panel
  const featured = products.filter(p => p.featured === true || p.featured === 'true');
  const selected = featured.length > 0 ? featured : products.slice(0, 3);

  state.heroPerfumes = selected.map(p => {
    let discountStr = '';
    if (p.discount && String(p.discount).includes('%')) {
      discountStr = String(p.discount).trim();
    } else if (p.originalPrice && p.price && Number(p.originalPrice) > Number(p.price)) {
      const pct = Math.round(((Number(p.originalPrice) - Number(p.price)) / Number(p.originalPrice)) * 100);
      discountStr = `${pct}% OFF`;
    } else {
      discountStr = '30% OFF';
    }

    return {
      id: p.id,
      name: p.name,
      tagline: p.tagline || 'Haute Parfumerie Exclusive',
      description: p.description || 'Masterpiece perfume from L’Élixir Royal.',
      image: (p.id === 'sovereign-oud' && !p.image?.startsWith('uploads/')) ? 'assets/images/hero-perfume.jpg' : (p.image || 'assets/images/hero-perfume.jpg'),
      price: p.price,
      originalPrice: p.originalPrice,
      discountBadge: discountStr,
      badge: p.badge || ''
    };
  });

  setupHeroSlider(false);
}

function handleHeroShopNow(e) {
  if (e) e.preventDefault();
  const current = (state.heroPerfumes && state.heroPerfumes[state.heroIndex]) || (state.products && state.products[0]);
  if (current) {
    addToCart(current.id);
    renderCartDrawer();
    openModal('cart-drawer');
  } else {
    const col = document.getElementById('collection');
    if (col) col.scrollIntoView({ behavior: 'smooth' });
  }
}
window.handleHeroShopNow = handleHeroShopNow;

function handleHeroViewDetails(e) {
  if (e) e.preventDefault();
  const current = (state.heroPerfumes && state.heroPerfumes[state.heroIndex]) || (state.products && state.products[0]);
  if (current) {
    openQuickView(current.id);
  }
}
window.handleHeroViewDetails = handleHeroViewDetails;

function renderHero(index, isInteractiveSlide = false) {
  if (!state.heroPerfumes || state.heroPerfumes.length === 0) return;
  state.heroIndex = (index + state.heroPerfumes.length) % state.heroPerfumes.length;
  const current = state.heroPerfumes[state.heroIndex];

  const bottleImg = document.getElementById('hero-bottle-img');
  const discountText = document.getElementById('hero-discount-text');

  if (bottleImg) {
    if (isInteractiveSlide) {
      bottleImg.style.transition = 'opacity 0.2s ease, transform 0.2s ease';
      bottleImg.style.opacity = '0.3';
      bottleImg.style.transform = 'scale(0.96)';
      setTimeout(() => {
        if (!bottleImg.src.endsWith(current.image)) {
          bottleImg.src = current.image;
        }
        bottleImg.alt = current.name;
        bottleImg.title = `${current.name} - ৳${(current.price || 0).toLocaleString('en-BD')}`;
        bottleImg.style.opacity = '1';
        bottleImg.style.transform = 'scale(1)';
      }, 120);
    } else {
      // Instant rendering on load / refresh — ZERO FLICKER!
      if (!bottleImg.src.endsWith(current.image)) {
        bottleImg.src = current.image;
      }
      bottleImg.alt = current.name;
      bottleImg.title = `${current.name} - ৳${(current.price || 0).toLocaleString('en-BD')}`;
      bottleImg.style.opacity = '1';
      bottleImg.style.transform = 'scale(1)';
    }
  }

  // Render Offer Badge (ALWAYS strictly % OFF)
  if (discountText) {
    let disc = current.discountBadge || '';
    if (!disc.includes('%') && current.originalPrice && current.price && Number(current.originalPrice) > Number(current.price)) {
      const pct = Math.round(((Number(current.originalPrice) - Number(current.price)) / Number(current.originalPrice)) * 100);
      disc = `${pct}% OFF`;
    }
    if (!disc) disc = '30% OFF';

    const match = disc.match(/^(\d+%)\s*(.*)$/);
    if (match) {
      discountText.innerHTML = `<span class="num">${match[1]}</span><span class="text">${match[2] || 'OFF'}</span>`;
    } else {
      const parts = disc.trim().split(/\s+/);
      discountText.innerHTML = `<span class="num">${parts[0]}</span><span class="text">${parts.slice(1).join(' ') || 'OFF'}</span>`;
    }
  }

  const dots = document.querySelectorAll('.slider-dot');
  dots.forEach((dot, idx) => {
    dot.classList.toggle('active', idx === state.heroIndex);
  });
}

function setupHeroSlider(animate = false) {
  if (!state.heroPerfumes || state.heroPerfumes.length === 0) return;

  const prevBtn = document.getElementById('hero-prev-btn');
  const nextBtn = document.getElementById('hero-next-btn');
  const dotsContainer = document.querySelector('.slider-dots');

  // Render dots dynamically matching hero perfumes count
  if (dotsContainer && !dotsContainer.dataset.initialized) {
    dotsContainer.dataset.initialized = 'true';
    dotsContainer.innerHTML = state.heroPerfumes.map((_, idx) => 
      `<span class="slider-dot ${idx === state.heroIndex ? 'active' : ''}" data-index="${idx}" aria-label="Slide ${idx + 1}"></span>`
    ).join('');
    
    dotsContainer.querySelectorAll('.slider-dot').forEach(dot => {
      dot.onclick = (e) => {
        const idx = parseInt(e.target.dataset.index, 10);
        if (!isNaN(idx)) renderHero(idx, true);
      };
    });
  }

  // Bind controls with direct onclick once
  if (prevBtn && !prevBtn.dataset.bound) {
    prevBtn.dataset.bound = 'true';
    prevBtn.onclick = () => renderHero(state.heroIndex - 1, true);
  }
  if (nextBtn && !nextBtn.dataset.bound) {
    nextBtn.dataset.bound = 'true';
    nextBtn.onclick = () => renderHero(state.heroIndex + 1, true);
  }

  // Hero CTA Buttons (bound once)
  const heroShopNow = document.getElementById('hero-shop-now-btn');
  if (heroShopNow && !heroShopNow.dataset.bound) {
    heroShopNow.dataset.bound = 'true';
    heroShopNow.onclick = (e) => handleHeroShopNow(e);
  }

  const heroViewDetails = document.getElementById('hero-view-details-btn');
  if (heroViewDetails && !heroViewDetails.dataset.bound) {
    heroViewDetails.dataset.bound = 'true';
    heroViewDetails.onclick = (e) => handleHeroViewDetails(e);
  }

  // Mobile Swipe Gesture Support for Hero Perfume (bound once)
  const heroBottleWrap = document.querySelector('.hero-bottle-wrap');
  if (heroBottleWrap && !heroBottleWrap.dataset.hasSwipe) {
    heroBottleWrap.dataset.hasSwipe = 'true';
    let startX = 0;
    heroBottleWrap.addEventListener('touchstart', (e) => {
      startX = e.changedTouches[0].screenX;
    }, { passive: true });
    heroBottleWrap.addEventListener('touchend', (e) => {
      const endX = e.changedTouches[0].screenX;
      if (startX - endX > 45) renderHero(state.heroIndex + 1, true);
      else if (endX - startX > 45) renderHero(state.heroIndex - 1, true);
    }, { passive: true });
  }

  if (animate) {
    renderHero(state.heroIndex, true);
  }
}

/* ===================================================================
   FETCH & RENDER PRODUCTS
   =================================================================== */
async function fetchProducts() {
  try {
    const res = await fetch('/api/products?t=' + Date.now(), { cache: 'no-store' });
    const json = await res.json();
    if (json.success) {
      state.products = json.data;
      updateHeroFromProducts(state.products);
      renderProducts(state.products);
      setupCategoryFilters();
    }
  } catch (err) {
    console.error('Failed to load fragrances:', err);
  }
}

function renderProducts(items) {
  const grid = document.getElementById('products-grid');
  if (!grid) return;

  if (items.length === 0) {
    grid.innerHTML = `
      <div style="grid-column: 1 / -1; text-align: center; padding: 60px 20px; color: #8A8177;">
        <h3 class="serif" style="font-size: 1.8rem; margin-bottom: 8px;">No Fragrances Found</h3>
        <p>Select another category or explore our signature creations.</p>
      </div>
    `;
    grid.dataset.renderedCategory = state.currentCategory;
    return;
  }

  // Smooth in-place DOM sync: If cards with matching IDs already exist, update image/text/price directly
  // This guarantees ZERO layout shift / zero reload jumping, while immediately reflecting Admin Panel changes!
  const existingCards = Array.from(grid.querySelectorAll('.product-card'));
  const canUpdateInPlace = existingCards.length === items.length &&
    items.every((p, idx) => existingCards[idx] && existingCards[idx].dataset.id === p.id);

  if (canUpdateInPlace) {
    items.forEach((p, idx) => {
      const card = existingCards[idx];
      const img = card.querySelector('.product-image-wrap img');
      if (img && img.getAttribute('src') !== p.image) {
        img.src = p.image;
        img.alt = p.name;
      }
      const badge = card.querySelector('.product-badge-tag');
      if (p.badge) {
        if (badge) {
          if (badge.textContent !== p.badge) badge.textContent = p.badge;
        } else {
          const newBadge = document.createElement('span');
          newBadge.className = 'product-badge-tag';
          newBadge.textContent = p.badge;
          card.querySelector('.product-image-wrap')?.appendChild(newBadge);
        }
      } else if (badge) {
        badge.remove();
      }
      const title = card.querySelector('.product-title');
      if (title && title.textContent !== p.name) title.textContent = p.name;
      const tagline = card.querySelector('.product-tagline');
      if (tagline && tagline.textContent !== (p.tagline || '')) tagline.textContent = p.tagline || '';
      const priceEl = card.querySelector('.product-price');
      if (priceEl) priceEl.textContent = `৳${Number(p.price).toLocaleString('en-BD')}`;
      const origPriceEl = card.querySelector('.product-orig-price');
      if (p.originalPrice) {
        if (origPriceEl) origPriceEl.textContent = `৳${Number(p.originalPrice).toLocaleString('en-BD')}`;
        else {
          const wrap = card.querySelector('.product-price-wrap');
          if (wrap) wrap.insertAdjacentHTML('beforeend', `<div class="product-orig-price">৳${Number(p.originalPrice).toLocaleString('en-BD')}</div>`);
        }
      } else if (origPriceEl) {
        origPriceEl.remove();
      }
    });
    grid.dataset.renderedCategory = state.currentCategory;
    return;
  }

  // Full re-render when switching categories or adding/removing products
  grid.innerHTML = items.map(p => `
    <article class="product-card" data-id="${p.id}">
      <div class="product-image-wrap">
        <img src="${p.image}" alt="${p.name}" loading="lazy" decoding="async" width="360" height="360" />
        ${p.badge ? `<span class="product-badge-tag">${p.badge}</span>` : ''}
      </div>
      <div class="product-details">
        <h3 class="product-title">${p.name}</h3>
        <p class="product-tagline">${p.tagline || ''}</p>
        <div class="product-bottom-row" style="gap: 8px;">
          <button type="button" class="product-shop-btn" onclick="expressBuyNow('${p.id}')" title="Instant 1-Click Order (Cash On Delivery)">
            Order Now
          </button>
          <button type="button" class="action-btn" style="padding: 6px 10px; font-size: 0.8rem; border: 1px solid var(--border-light); background: #FAF7F2;" onclick="addToCart('${p.id}')" title="Add to Shopping Bag">
            Bag +
          </button>
          <button type="button" style="font-size: 0.8rem; text-decoration: underline; color: #6B655F; padding: 4px;" onclick="openQuickView('${p.id}')" title="Inspect Olfactory Notes">
            Notes
          </button>
          <div class="product-price-wrap">
            <div class="product-price">৳${Number(p.price).toLocaleString('en-BD')}</div>
            ${p.originalPrice ? `<div class="product-orig-price">৳${Number(p.originalPrice).toLocaleString('en-BD')}</div>` : ''}
          </div>
        </div>
      </div>
    </article>
  `).join('');
  grid.dataset.renderedCategory = state.currentCategory;
}

// 1-Click Express Purchase for Bangladeshi Customers
function expressBuyNow(productId) {
  let product = state.products.find(p => p.id === productId);
  if (!product) {
    product = state.heroPerfumes.find(p => p.id === productId);
  }
  if (!product) return;

  const existing = state.cart.find(item => item.id === productId);
  if (!existing) {
    state.cart.push({
      id: product.id,
      name: product.name,
      price: product.price,
      image: product.image,
      quantity: 1
    });
    saveCart();
    updateCartBadge();
  }

  openCheckoutModal();
}

function setupCategoryFilters() {
  const tabs = document.querySelectorAll('.filter-tab');
  tabs.forEach(tab => {
    tab.addEventListener('click', () => {
      tabs.forEach(t => t.classList.remove('active'));
      tab.classList.add('active');

      const cat = tab.dataset.category;
      state.currentCategory = cat;

      if (cat === 'All') {
        renderProducts(state.products);
      } else {
        const filtered = state.products.filter(p => 
          p.category.toLowerCase().includes(cat.toLowerCase())
        );
        renderProducts(filtered);
      }
    });
  });
}

/* ===================================================================
   QUICK VIEW MODAL (FRAGRANCE PYRAMID)
   =================================================================== */
async function openQuickView(productId) {
  let product = state.products.find(p => p.id === productId);
  if (!product) {
    try {
      const res = await fetch(`/api/products/${productId}`);
      const json = await res.json();
      if (json.success) product = json.data;
    } catch (e) {
      console.error(e);
    }
  }

  if (!product) return;

  const content = document.getElementById('quickview-modal-content');
  if (content) {
    content.innerHTML = `
      <div class="qv-grid">
        <div style="background: #F8F4EE; border-radius: var(--radius-md); padding: 30px; text-align: center;">
          <img src="${product.image}" alt="${product.name}" style="max-height: 340px; margin: 0 auto; object-fit: contain;" />
          <div style="margin-top: 16px; font-size: 0.85rem; color: #8A8177;">
            ${product.volume} • ${product.concentration}
          </div>
        </div>
        <div>
          <span style="font-size: 0.8rem; font-weight: 700; color: var(--accent-gold); text-transform: uppercase; letter-spacing: 0.08em;">
            ${product.category}
          </span>
          <h2 class="serif" style="font-size: 2.2rem; margin: 6px 0 10px; color: var(--text-main);">${product.name}</h2>
          <div style="font-family: var(--font-serif); font-size: 1.8rem; font-weight: 700; color: var(--accent-gold); margin-bottom: 16px;">
            ৳${product.price.toLocaleString('en-BD')} <span style="font-size: 1rem; color: #9E9488; text-decoration: line-through; font-weight: normal;">৳${(product.originalPrice || 0).toLocaleString('en-BD')}</span>
          </div>
          <p style="font-size: 0.95rem; color: var(--text-muted); line-height: 1.7; margin-bottom: 22px;">
            ${product.description}
          </p>

          <!-- Olfactory Pyramid -->
          <div style="background: #FFF; border: 1px solid var(--border-light); border-radius: var(--radius-sm); padding: 16px; margin-bottom: 24px;">
            <div style="font-size: 0.75rem; font-weight: 700; text-transform: uppercase; color: var(--accent-gold); margin-bottom: 8px;">
              Olfactory Pyramid Notes
            </div>
            <div style="font-size: 0.825rem; margin-bottom: 4px;">
              <strong>Top:</strong> ${product.notes?.top?.join(', ') || 'Fresh Accords'}
            </div>
            <div style="font-size: 0.825rem; margin-bottom: 4px;">
              <strong>Heart:</strong> ${product.notes?.heart?.join(', ') || 'Royal Florals'}
            </div>
            <div style="font-size: 0.825rem;">
              <strong>Base:</strong> ${product.notes?.base?.join(', ') || 'Aged Woods & Amber'}
            </div>
          </div>

          <div class="qv-action-row">
            <button type="button" class="btn btn-primary" style="flex-grow: 1;" onclick="expressBuyNow('${product.id}'); closeModal('quickview-dialog');">
              Order Now (৳${product.price.toLocaleString('en-BD')})
            </button>
            <button type="button" class="btn btn-secondary" onclick="addToCart('${product.id}'); closeModal('quickview-dialog');">
              Add to Bag
            </button>
          </div>
        </div>
      </div>
    `;
    openModal('quickview-dialog');

    trackAnalyticsEvent('view_item', {
      currency: 'BDT',
      value: product.price,
      items: [{
        item_id: String(product.id),
        item_name: product.name,
        item_category: product.category || 'Perfumes',
        price: product.price,
        quantity: 1
      }]
    });
  }
}

/* ===================================================================
   SHOPPING CART LOGIC
   =================================================================== */
function setupCartUI() {
  const cartTriggerBtn = document.getElementById('cart-trigger-btn');
  if (cartTriggerBtn) {
    cartTriggerBtn.addEventListener('click', () => {
      renderCartDrawer();
      openModal('cart-drawer');
    });
  }

  // Promo code apply button
  const promoBtn = document.getElementById('cart-apply-promo');
  const promoInput = document.getElementById('cart-promo-input');
  if (promoBtn && promoInput) {
    promoBtn.addEventListener('click', () => {
      const code = promoInput.value.trim().toUpperCase();
      if (code === 'ROYAL10') {
        state.promoDiscountRate = 0.10;
        state.appliedPromo = 'ROYAL10 (10% OFF)';
        showToast('Royal 10% privilege applied!', '👑');
      } else if (code === 'ROYAL30') {
        state.promoDiscountRate = 0.30;
        state.appliedPromo = 'ROYAL30 (30% OFF)';
        showToast('Grand 30% privilege applied!', '👑');
      } else {
        state.promoDiscountRate = 0;
        state.appliedPromo = '';
        showToast('Invalid privilege code', '⚠️');
      }
      renderCartDrawer();
    });
  }

  // Checkout button in cart drawer
  const checkoutBtn = document.getElementById('cart-checkout-proceed-btn');
  if (checkoutBtn) {
    checkoutBtn.addEventListener('click', () => {
      if (state.cart.length === 0) {
        showToast('Your flacon is empty', '⚜️');
        return;
      }
      closeModal('cart-drawer');
      openCheckoutModal();
    });
  }

  updateCartBadge();
}

function addToCart(productId) {
  let product = state.products.find(p => p.id === productId);
  if (!product) {
    product = state.heroPerfumes.find(p => p.id === productId);
  }
  if (!product) return;

  const existing = state.cart.find(item => item.id === productId);
  if (existing) {
    existing.quantity += 1;
  } else {
    state.cart.push({
      id: product.id,
      name: product.name,
      price: product.price,
      image: product.image,
      quantity: 1
    });
  }

  saveCart();
  updateCartBadge();
  showToast(`${product.name} added to your cart!`, '✨');

  trackAnalyticsEvent('add_to_cart', {
    currency: 'BDT',
    value: product.price,
    items: [{
      item_id: String(product.id),
      item_name: product.name,
      item_category: product.category || 'Perfumes',
      price: product.price,
      quantity: 1
    }]
  });
}

function updateCartQuantity(productId, delta) {
  const item = state.cart.find(i => i.id === productId);
  if (!item) return;

  item.quantity += delta;
  if (item.quantity <= 0) {
    state.cart = state.cart.filter(i => i.id !== productId);
  }

  saveCart();
  updateCartBadge();
  renderCartDrawer();
}

function removeCartItem(productId) {
  state.cart = state.cart.filter(i => i.id !== productId);
  saveCart();
  updateCartBadge();
  renderCartDrawer();
  showToast('Item removed from cart', '🗑️');
}

function saveCart() {
  localStorage.setItem('elixir_cart', JSON.stringify(state.cart));
}

function updateCartBadge() {
  const badge = document.getElementById('cart-count-badge');
  const count = state.cart.reduce((sum, i) => sum + i.quantity, 0);
  if (badge) {
    badge.textContent = count;
    badge.style.display = count > 0 ? 'flex' : 'none';
  }
}

function renderCartDrawer() {
  const container = document.getElementById('cart-items-container');
  const subtotalEl = document.getElementById('cart-subtotal');
  const discountEl = document.getElementById('cart-discount-line');
  const shippingEl = document.getElementById('cart-shipping');
  const totalEl = document.getElementById('cart-total');

  if (!container) return;

  if (state.cart.length === 0) {
    container.innerHTML = `
      <div style="text-align: center; padding: 60px 10px; color: #8A8177;">
        <svg style="width: 48px; height: 48px; stroke: #C8BFB4; margin: 0 auto 16px;" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"/>
        </svg>
        <h4 class="serif" style="font-size: 1.4rem; margin-bottom: 6px;">Your Flacon Bag is Empty</h4>
        <p style="font-size: 0.85rem;">Discover our creations and click "Order Now" or "Bag +".</p>
      </div>
    `;
    if (subtotalEl) subtotalEl.textContent = '৳0';
    if (shippingEl) shippingEl.textContent = '৳0';
    if (totalEl) totalEl.textContent = '৳0';
    if (discountEl) discountEl.style.display = 'none';
    return;
  }

  container.innerHTML = state.cart.map(item => `
    <div class="cart-item-row">
      <img src="${item.image}" alt="${item.name}" class="cart-item-img" />
      <div>
        <div class="cart-item-name">${item.name}</div>
        <div class="cart-item-price">৳${Number(item.price).toLocaleString('en-BD')}</div>
        <div class="cart-qty-ctrl">
          <button type="button" class="qty-btn" onclick="updateCartQuantity('${item.id}', -1)">−</button>
          <span class="qty-val">${item.quantity}</span>
          <button type="button" class="qty-btn" onclick="updateCartQuantity('${item.id}', 1)">+</button>
        </div>
      </div>
      <div>
        <button type="button" class="cart-remove-btn" onclick="removeCartItem('${item.id}')" title="Remove">✕</button>
      </div>
    </div>
  `).join('');

  const subtotal = state.cart.reduce((sum, i) => sum + (Number(i.price) * Number(i.quantity)), 0);
  const discount = Math.round(subtotal * state.promoDiscountRate);
  const freeThreshold = state.settings?.freeShippingThreshold || 2500;
  const shipping = subtotal >= freeThreshold ? 0 : (state.settings?.insideDhakaDelivery || 70);
  const total = subtotal - discount + shipping;

  if (subtotalEl) subtotalEl.textContent = `৳${subtotal.toLocaleString('en-BD')}`;
  if (discountEl) {
    if (discount > 0) {
      discountEl.style.display = 'flex';
      discountEl.querySelector('.val').textContent = `-৳${discount.toLocaleString('en-BD')} (${state.appliedPromo})`;
    } else {
      discountEl.style.display = 'none';
    }
  }
  if (shippingEl) shippingEl.textContent = shipping === 0 ? 'Free Delivery' : `৳${shipping}`;
  if (totalEl) totalEl.textContent = `৳${total.toLocaleString('en-BD')}`;
}

/* ===================================================================
   CHECKOUT MODAL & BACKEND API ORDER SUBMISSION
   =================================================================== */
function openCheckoutModal() {
  if (state.cart.length === 0) {
    showToast('Your shopping bag is empty. Please select a fragrance.', '⚠️');
    return;
  }
  updateCheckoutCalculation();
  openModal('checkout-dialog');

  trackAnalyticsEvent('begin_checkout', {
    currency: 'BDT',
    value: state.cart.reduce((sum, i) => sum + (Number(i.price) * Number(i.quantity)), 0),
    items: state.cart.map(i => ({
      item_id: String(i.id),
      item_name: i.name,
      price: i.price,
      quantity: i.quantity
    }))
  });
}

function onCityChange(val) {
  updateCheckoutCalculation();
}

function updateCheckoutCalculation() {
  const subtotal = state.cart.reduce((sum, i) => sum + (Number(i.price) * Number(i.quantity)), 0);
  const discount = Math.round(subtotal * state.promoDiscountRate);
  const freeThreshold = state.settings?.freeShippingThreshold || 2500;
  
  const citySelect = document.getElementById('order-city');
  const selectedCity = citySelect ? citySelect.value : '';
  const isOutsideDhaka = selectedCity.toLowerCase().includes('outside');

  let shipping = isOutsideDhaka ? (state.settings?.outsideDhakaDelivery || 130) : (state.settings?.insideDhakaDelivery || 70);
  const isFree = subtotal >= freeThreshold;
  if (isFree) shipping = 0;

  const total = subtotal - discount + shipping;

  const summaryEl = document.getElementById('checkout-items-summary');
  if (summaryEl) {
    summaryEl.innerHTML = state.cart.map(i => `
      <div style="display: flex; justify-content: space-between; font-size: 0.9rem; margin-bottom: 6px;">
        <span>${i.name} × ${i.quantity}</span>
        <strong>৳${(i.price * i.quantity).toLocaleString('en-BD')}</strong>
      </div>
    `).join('');
  }

  const freeTag = document.getElementById('checkout-free-shipping-tag');
  if (freeTag) {
    freeTag.textContent = isFree ? '🎉 Free Delivery Unlocked!' : `(Complimentary delivery on orders over ৳${freeThreshold.toLocaleString('en-BD')})`;
  }

  const shipVal = document.getElementById('checkout-shipping-val');
  if (shipVal) {
    shipVal.textContent = shipping === 0 ? 'Free Delivery (৳0)' : `৳${shipping}`;
  }

  const totalVal = document.getElementById('checkout-total-val');
  if (totalVal) {
    totalVal.textContent = `৳${total.toLocaleString('en-BD')}`;
  }
}

function setupCheckoutForm() {
  const form = document.getElementById('checkout-order-form');
  if (!form) return;

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const submitBtn = form.querySelector('button[type="submit"]');
    if (submitBtn) {
      submitBtn.disabled = true;
      submitBtn.textContent = 'Processing Royal Order...';
    }

    const formData = new FormData(form);
    const customer = {
      fullName: formData.get('fullName'),
      phone: formData.get('phone'),
      city: formData.get('city'),
      address: formData.get('address'),
      email: formData.get('email') || ''
    };
    const paymentMethod = formData.get('paymentMethod') || 'Cash On Delivery (Pay upon delivery)';

    try {
      const response = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customer,
          items: state.cart,
          promoCode: state.promoDiscountRate > 0 ? (state.promoDiscountRate === 0.3 ? 'ROYAL30' : 'ROYAL10') : null,
          paymentMethod
        })
      });

      const res = await response.json();
      if (res.success) {
        state.cart = [];
        saveCart();
        updateCartBadge();

        closeModal('checkout-dialog');
        displayOrderConfirmation(res.order);
        form.reset();
        showToast('Your royal order has been confirmed successfully!', '🎉');

        trackAnalyticsEvent('purchase', {
          transaction_id: res.order?.orderId || ('LR-' + Date.now()),
          value: res.order?.total || 0,
          currency: 'BDT',
          shipping: res.order?.shipping || 0,
          tax: 0,
          items: (res.order?.items || []).map(item => ({
            item_id: String(item.id),
            item_name: item.name,
            price: item.price,
            quantity: item.quantity
          }))
        });
      } else {
        alert(res.message || 'There was an issue processing your order.');
      }
    } catch (err) {
      alert('Unable to connect to order server.');
    } finally {
      if (submitBtn) {
        submitBtn.disabled = false;
        submitBtn.textContent = 'Confirm Royal Order (Cash On Delivery)';
      }
    }
  });
}


function displayOrderConfirmation(order) {
  const receiptEl = document.getElementById('confirmation-details');
  if (receiptEl) {
    receiptEl.innerHTML = `
      <div style="text-align: center; margin-bottom: 24px;">
        <img src="assets/images/brand-logo.png" alt="L’Élixir Royal Crest" style="width: 72px; height: 72px; border-radius: 50%; border: 2px solid var(--accent-gold); box-shadow: 0 4px 16px rgba(214,151,82,0.3); margin-bottom: 12px;" />
        <h3 class="serif" style="font-size: 1.8rem; color: var(--text-main);">Order Placed Successfully!</h3>
        <p style="color: #6B655F; font-size: 0.95rem;">Order Reference ID: <strong style="color: var(--accent-gold); font-size: 1.15rem;">${order.orderId}</strong></p>
        <p style="color: #2E7D32; font-size: 0.85rem; font-weight: 600; margin-top: 4px;">Our client concierge will call your phone shortly to confirm shipping dispatch.</p>
      </div>

      <!-- Mobile SMS Confirmation & Tracking Alert -->
      <div style="background: #E8F5E9; border: 1px solid #A5D6A7; border-radius: 8px; padding: 14px 18px; margin-bottom: 20px; text-align: left; display: flex; align-items: flex-start; gap: 14px;">
        <span style="font-size: 1.8rem; line-height: 1;">📱</span>
        <div style="flex-grow: 1;">
          <div style="font-weight: 700; color: #1B5E20; font-size: 0.95rem; margin-bottom: 4px;">
            অর্ডার কনফার্মেশন ও ট্র্যাকিং SMS পাঠানো হয়েছে!
          </div>
          <div style="font-size: 0.85rem; color: #2E7D32; line-height: 1.5;">
            আপনার মোবাইল নম্বর <strong>${order.customer.phone}</strong>-এ <strong>Order Tracking ID: ${order.orderId}</strong> সহ বিস্তারিত SMS মেসেজ প্রেরণ করা হয়েছে।
          </div>
          <div style="margin-top: 10px; display: flex; gap: 8px; flex-wrap: wrap;">
            <a href="https://wa.me/88${order.customer.phone.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(`L’Élixir Royal Order Tracking ID: ${order.orderId}\nTotal: ৳${order.total}\nTrack: ${window.location.origin}/?track=${order.orderId}`)}" target="_blank" class="btn btn-secondary" style="font-size: 0.8rem; padding: 6px 14px; background: #25D366; color: #fff; border: none; display: inline-flex; align-items: center; gap: 6px;">
              <span>💬 WhatsApp এ ট্র্যাকিং সেভ করুন</span>
            </a>
            <button type="button" class="btn btn-secondary" style="font-size: 0.8rem; padding: 6px 14px;" onclick="copyTrackingId('${order.orderId}')">
              <span>📋 ট্র্যাকিং আইডি কপি করুন</span>
            </button>
          </div>
        </div>
      </div>

      <div style="background: #FFF; border: 1px solid var(--border-light); border-radius: var(--radius-md); padding: 18px; margin-bottom: 18px;">
        <h4 style="font-size: 0.85rem; text-transform: uppercase; letter-spacing: 0.05em; margin-bottom: 10px; color: var(--accent-gold);">
          Customer & Delivery Details
        </h4>
        <div style="font-size: 0.875rem; color: var(--text-muted); line-height: 1.7;">
          <p><strong>Customer Name:</strong> ${order.customer.fullName}</p>
          <p><strong>Contact Phone:</strong> ${order.customer.phone}</p>
          <p><strong>Shipping Address:</strong> ${order.customer.address}, ${order.customer.city}</p>
          <p><strong>Payment Mode:</strong> ${order.paymentMethod}</p>
          <p><strong>Estimated Arrival:</strong> ${order.estimatedDelivery}</p>
        </div>
      </div>

      <div style="background: #FFF; border: 1px solid var(--border-light); border-radius: var(--radius-md); padding: 18px; margin-bottom: 18px;">
        <h4 style="font-size: 0.85rem; text-transform: uppercase; letter-spacing: 0.05em; margin-bottom: 10px; color: var(--accent-gold);">
          Itemized Fragrance Receipt
        </h4>
        ${order.items.map(i => `
          <div style="display: flex; justify-content: space-between; font-size: 0.875rem; margin-bottom: 6px;">
            <span>${i.name} × ${i.quantity}</span>
            <strong>৳${(Number(i.price) * Number(i.quantity)).toLocaleString('en-BD')}</strong>
          </div>
        `).join('')}
        <div style="display: flex; justify-content: space-between; font-size: 0.85rem; color: #666; margin-top: 6px; border-top: 1px dashed #E2D7C8; padding-top: 6px;">
          <span>Delivery Charge:</span>
          <span>${order.shipping === 0 ? 'Complimentary (Free)' : `৳${order.shipping}`}</span>
        </div>
        <div style="border-top: 1px solid #ECE4DA; margin-top: 8px; padding-top: 8px; display: flex; justify-content: space-between; font-weight: 700; font-size: 1.25rem; color: var(--text-main);">
          <span>Total Payable Amount:</span>
          <span style="color: var(--accent-gold);">৳${Number(order.total).toLocaleString('en-BD')}</span>
        </div>
      </div>
    `;
    openModal('confirmation-dialog');
  }
}

/* ===================================================================
   ORDER TRACKING
   =================================================================== */
function setupOrderTracking() {
  const trackBtn = document.getElementById('track-order-trigger');
  if (trackBtn) {
    trackBtn.addEventListener('click', () => {
      openModal('tracking-dialog');
    });
  }

  const trackForm = document.getElementById('tracking-form');
  if (trackForm) {
    trackForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const orderId = document.getElementById('tracking-input').value.trim();
      const resultEl = document.getElementById('tracking-result');

      if (!orderId) return;

      resultEl.innerHTML = `<p style="text-align:center; padding:20px; color:#8C847A;">Consulting Imperial Registry...</p>`;

      try {
        const res = await fetch(`/api/orders?orderId=${encodeURIComponent(orderId)}`);
        const json = await res.json();

        if (json.success && json.data.length > 0) {
          const order = json.data[0];
          resultEl.innerHTML = `
            <div style="background: #FFF; border: 1px solid var(--border-light); border-radius: var(--radius-md); padding: 20px;">
              <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px;">
                <span class="serif" style="font-size: 1.4rem; font-weight: 700; color: var(--accent-gold);">${order.orderId}</span>
                <span style="background: #E8F5E9; color: #2E7D32; font-size: 0.75rem; font-weight: 700; padding: 4px 10px; border-radius: var(--radius-full);">
                  ${order.status}
                </span>
              </div>
              <p style="font-size: 0.85rem; color: var(--text-muted); margin-bottom: 6px;">
                <strong>Recipient:</strong> ${order.customer.fullName} • ${order.customer.city}
              </p>
              <p style="font-size: 0.85rem; color: var(--text-muted); margin-bottom: 6px;">
                <strong>Total:</strong> ৳${Number(order.total).toLocaleString('en-BD')} (${order.paymentMethod})
              </p>
              <p style="font-size: 0.85rem; color: var(--text-muted); margin-bottom: 12px;">
                <strong>Estimated Delivery:</strong> ${order.estimatedDelivery}
              </p>
              <div style="border-top: 1px solid #ECE4DA; padding-top: 10px;">
                <span style="font-size: 0.75rem; font-weight: 700; text-transform: uppercase; color: #8A8177;">Items:</span>
                <ul style="font-size: 0.85rem; color: var(--text-main); margin-top: 4px; padding-left: 18px;">
                  ${order.items.map(i => `<li>${i.name} (Qty: ${i.quantity})</li>`).join('')}
                </ul>
              </div>
            </div>
          `;
        } else {
          resultEl.innerHTML = `
            <div style="text-align: center; padding: 24px; color: #C62828;">
              <p>No order found with reference "<strong>${orderId}</strong>". Please verify your Order ID.</p>
            </div>
          `;
        }
      } catch (err) {
        resultEl.innerHTML = `<p style="color:red; text-align:center;">Failed to connect to order registry.</p>`;
      }
    });
  }

  // Auto-check URL parameter ?track=LR-...
  const urlParams = new URLSearchParams(window.location.search);
  const trackParam = urlParams.get('track');
  if (trackParam) {
    const input = document.getElementById('tracking-input');
    if (input) {
      input.value = trackParam;
      openModal('tracking-dialog');
      if (trackForm) {
        trackForm.dispatchEvent(new Event('submit', { cancelable: true }));
      }
    }
  }
}

function copyTrackingId(id) {
  if (navigator.clipboard) {
    navigator.clipboard.writeText(id).then(() => {
      showToast(`Tracking ID ${id} কপি করা হয়েছে!`, '📋');
    }).catch(() => {
      showToast(`Tracking ID: ${id}`, '📋');
    });
  } else {
    showToast(`Tracking ID: ${id}`, '📋');
  }
}

/* ===================================================================
   TESTIMONIALS / REVIEWS CAROUSEL & SUBMISSION
   =================================================================== */
async function fetchReviews() {
  try {
    const res = await fetch('/api/reviews');
    const json = await res.json();
    if (json.success && json.data.length > 0) {
      state.reviews = json.data;
      renderCurrentReview(false);
      setupReviewControls();
    }
  } catch (err) {
    console.error(err);
  }
}

function renderCurrentReview(isInteractive = false) {
  if (state.reviews.length === 0) return;
  const rev = state.reviews[state.currentReviewIndex];

  const col = document.querySelector('.testimonial-content-col');
  const avatar = document.getElementById('review-avatar');
  const quoteHead = document.getElementById('review-headline');
  const quoteBody = document.getElementById('review-body');
  const authorName = document.getElementById('review-author-name');
  const authorRole = document.getElementById('review-author-role');

  const updateFields = () => {
    if (avatar && !avatar.src.endsWith(rev.avatar)) avatar.src = rev.avatar;
    if (quoteHead && quoteHead.textContent !== rev.headline) quoteHead.textContent = rev.headline;
    if (quoteBody && quoteBody.textContent !== rev.comment) quoteBody.textContent = rev.comment;
    if (authorName && authorName.textContent !== rev.name) authorName.textContent = rev.name;
    if (authorRole && authorRole.textContent !== rev.role) authorRole.textContent = rev.role;
  };

  if (isInteractive && col) {
    col.style.transition = 'opacity 0.2s ease';
    col.style.opacity = '0.3';
    setTimeout(() => {
      updateFields();
      col.style.opacity = '1';
    }, 120);
  } else {
    // Instant update on initial load — NO flicker!
    updateFields();
    if (col) col.style.opacity = '1';
  }
}

function setupReviewControls() {
  const prevBtn = document.getElementById('review-prev-btn');
  const nextBtn = document.getElementById('review-next-btn');

  if (prevBtn) {
    prevBtn.onclick = () => {
      state.currentReviewIndex = (state.currentReviewIndex - 1 + state.reviews.length) % state.reviews.length;
      renderCurrentReview(true);
    };
  }

  if (nextBtn) {
    nextBtn.onclick = () => {
      state.currentReviewIndex = (state.currentReviewIndex + 1) % state.reviews.length;
      renderCurrentReview(true);
    };
  }

  // Mobile Swipe Gesture Support for Customer Reviews
  const reviewCard = document.querySelector('.testimonial-card-wrap');
  if (reviewCard && !reviewCard.dataset.hasSwipe) {
    reviewCard.dataset.hasSwipe = 'true';
    let touchStartX = 0;
    reviewCard.addEventListener('touchstart', (e) => {
      touchStartX = e.changedTouches[0].screenX;
    }, { passive: true });
    reviewCard.addEventListener('touchend', (e) => {
      const touchEndX = e.changedTouches[0].screenX;
      const diff = touchEndX - touchStartX;
      if (Math.abs(diff) > 40) {
        if (diff < 0) {
          state.currentReviewIndex = (state.currentReviewIndex + 1) % state.reviews.length;
        } else {
          state.currentReviewIndex = (state.currentReviewIndex - 1 + state.reviews.length) % state.reviews.length;
        }
        renderCurrentReview(true);
      }
    }, { passive: true });
  }

  const writeReviewBtn = document.getElementById('write-review-trigger');
  if (writeReviewBtn) {
    writeReviewBtn.addEventListener('click', () => {
      openModal('write-review-dialog');
    });
  }
}

// Customer Review Photo & Sticker State
let pendingReviewPhotoBase64 = null;
let pendingReviewPhotoName = '';

function handleReviewPhotoSelect(e) {
  const file = e.target.files[0];
  if (!file) return;

  if (!file.type.startsWith('image/')) {
    alert('Please select an image file (JPG, PNG, WEBP).');
    return;
  }

  const reader = new FileReader();
  const preview = document.getElementById('review-avatar-preview');
  const nameEl = document.getElementById('rev-avatar-name');
  const valInput = document.getElementById('rev-avatar-val');

  reader.onload = function(evt) {
    pendingReviewPhotoBase64 = evt.target.result;
    pendingReviewPhotoName = file.name;

    if (preview) preview.src = evt.target.result;
    if (nameEl) nameEl.textContent = `✓ Selected photo: ${file.name}`;
    if (valInput) valInput.value = evt.target.result;

    document.querySelectorAll('.sticker-opt').forEach(opt => opt.classList.remove('active'));
  };

  reader.readAsDataURL(file);
}

function selectReviewSticker(el) {
  if (!el) return;
  const src = el.getAttribute('data-src');
  if (!src) return;

  pendingReviewPhotoBase64 = null;
  pendingReviewPhotoName = '';
  const fileInput = document.getElementById('rev-photo-file');
  if (fileInput) fileInput.value = '';

  const preview = document.getElementById('review-avatar-preview');
  const nameEl = document.getElementById('rev-avatar-name');
  const valInput = document.getElementById('rev-avatar-val');

  if (preview) preview.src = src;
  if (valInput) valInput.value = src;
  if (nameEl) nameEl.textContent = `✓ Selected: ${el.getAttribute('title') || 'Royal Sticker'}`;

  document.querySelectorAll('.sticker-opt').forEach(opt => opt.classList.remove('active'));
  el.classList.add('active');
}

function setupReviewForm() {
  const form = document.getElementById('submit-review-form');
  if (!form) return;

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const submitBtn = form.querySelector('button[type="submit"]');
    if (submitBtn) {
      submitBtn.disabled = true;
      submitBtn.textContent = 'Publishing Experience...';
    }

    const formData = new FormData(form);
    let avatarUrl = document.getElementById('rev-avatar-val')?.value || 'assets/images/stickers/sticker-crown.svg';

    // If user uploaded a custom photo, upload it to server via /api/upload
    if (pendingReviewPhotoBase64) {
      try {
        const uploadRes = await fetch('/api/upload', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            image: pendingReviewPhotoBase64,
            filename: pendingReviewPhotoName || 'reviewer'
          })
        });
        const uploadJson = await uploadRes.json();
        if (uploadJson.success && uploadJson.imageUrl) {
          avatarUrl = uploadJson.imageUrl;
        }
      } catch (err) {
        console.warn('Could not save avatar file to server, using base64 fallback');
      }
    }

    try {
      const res = await fetch('/api/reviews', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: formData.get('name'),
          role: formData.get('role'),
          headline: formData.get('headline'),
          rating: formData.get('rating'),
          product: formData.get('product'),
          comment: formData.get('comment'),
          avatar: avatarUrl
        })
      });

      const json = await res.json();
      if (json.success) {
        state.reviews.unshift(json.data);
        state.currentReviewIndex = 0;
        renderCurrentReview();
        closeModal('write-review-dialog');
        form.reset();
        pendingReviewPhotoBase64 = null;
        pendingReviewPhotoName = '';
        selectReviewSticker(document.querySelector('.sticker-opt[data-src*="sticker-crown"]'));
        showToast('Your review has been recorded with distinction!', '⚜️');
      }
    } catch (err) {
      alert('Failed to submit review.');
    } finally {
      if (submitBtn) {
        submitBtn.disabled = false;
        submitBtn.textContent = 'Publish Experience';
      }
    }
  });
}

/* ===================================================================
   NEWSLETTER SUBSCRIPTION
   =================================================================== */
function setupNewsletter() {
  const form = document.getElementById('newsletter-form');
  const input = document.getElementById('newsletter-email');
  const feedback = document.getElementById('newsletter-feedback');

  if (!form) return;

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const email = input.value.trim();
    if (!email) return;

    try {
      const res = await fetch('/api/newsletter', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      });

      const json = await res.json();
      feedback.textContent = json.message;
      feedback.className = json.success ? 'newsletter-feedback success' : 'newsletter-feedback error';

      if (json.success) {
        input.value = '';
        showToast('Privilege Code ROYAL10 unlocked for you!', '🎁');
      }
    } catch (err) {
      feedback.textContent = 'Service unavailable. Please try again.';
      feedback.className = 'newsletter-feedback error';
    }
  });
}

/* ===================================================================
   CONTACT CONCIERGE MODAL
   =================================================================== */
function setupContactForm() {
  const trigger = document.getElementById('contact-concierge-trigger');
  if (trigger) {
    trigger.addEventListener('click', (e) => {
      e.preventDefault();
      openModal('contact-dialog');
    });
  }

  const form = document.getElementById('contact-modal-form');
  if (!form) return;

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const formData = new FormData(form);

    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: formData.get('name'),
          email: formData.get('email'),
          subject: formData.get('subject'),
          message: formData.get('message')
        })
      });

      const json = await res.json();
      if (json.success) {
        closeModal('contact-dialog');
        form.reset();
        showToast(json.message, '🕊️');
      } else {
        alert(json.message);
      }
    } catch (err) {
      alert('Error contacting fragrance concierge.');
    }
  });
}

/* ===================================================================
   SEARCH FUNCTIONALITY
   =================================================================== */
function setupSearch() {
  const searchTrigger = document.getElementById('search-trigger-btn');
  if (searchTrigger) {
    searchTrigger.addEventListener('click', () => {
      openModal('search-dialog');
    });
  }

  const searchInput = document.getElementById('modal-search-input');
  const searchResults = document.getElementById('modal-search-results');

  if (searchInput && searchResults) {
    searchInput.addEventListener('input', (e) => {
      const q = e.target.value.toLowerCase().trim();
      if (!q) {
        searchResults.innerHTML = '';
        return;
      }

      const matches = state.products.filter(p => 
        p.name.toLowerCase().includes(q) ||
        p.category.toLowerCase().includes(q) ||
        p.tagline.toLowerCase().includes(q)
      );

      if (matches.length === 0) {
        searchResults.innerHTML = `<p style="text-align:center; padding:20px; color:#8C847A;">No fragrances matching "${q}"</p>`;
        return;
      }

      searchResults.innerHTML = matches.map(m => `
        <div style="display:flex; align-items:center; gap:16px; padding:12px; border-bottom:1px solid var(--border-light); cursor:pointer;" onclick="closeModal('search-dialog'); openQuickView('${m.id}')">
          <img src="${m.image}" style="width:48px; height:48px; object-fit:contain; background:#F8F4EE; border-radius:4px;" />
          <div style="flex-grow:1;">
            <div style="font-weight:700; font-size:0.95rem;">${m.name}</div>
            <div style="font-size:0.8rem; color:#8C847A;">${m.category} • ৳${m.price.toLocaleString('en-BD')}</div>
          </div>
          <button type="button" class="btn btn-primary" style="padding:6px 14px; font-size:0.8rem;" onclick="event.stopPropagation(); expressBuyNow('${m.id}'); closeModal('search-dialog');">Order Now</button>
        </div>
      `).join('');
    });
  }
}

/* ===================================================================
   SMOOTH SCROLL LINKS
   =================================================================== */
function setupSmoothScroll() {
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
      const targetId = this.getAttribute('href');
      if (targetId === '#' || targetId === '') return;
      const target = document.querySelector(targetId);
      if (target) {
        e.preventDefault();
        target.scrollIntoView({ behavior: 'smooth' });
      }
    });
  });
}

/* ===================================================================
   MOBILE NAVIGATION DRAWER LOGIC
   =================================================================== */
function setupMobileMenu() {
  const triggerBtn = document.getElementById('mobile-menu-btn');
  const closeBtn = document.getElementById('mobile-menu-close');
  const overlay = document.getElementById('mobile-nav-overlay');
  const drawer = document.getElementById('mobile-nav-drawer');

  if (triggerBtn) {
    triggerBtn.addEventListener('click', () => {
      const isOpen = drawer.classList.contains('open');
      if (isOpen) {
        closeMobileMenu();
      } else {
        openMobileMenu();
      }
    });
  }

  if (closeBtn) {
    closeBtn.addEventListener('click', closeMobileMenu);
  }

  if (overlay) {
    overlay.addEventListener('click', closeMobileMenu);
  }

  // Escape key handler
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && drawer && drawer.classList.contains('open')) {
      closeMobileMenu();
    }
  });

  // Touch Swipe Dismiss on Mobile
  let touchStartX = 0;
  let touchEndX = 0;

  if (drawer) {
    drawer.addEventListener('touchstart', (e) => {
      touchStartX = e.changedTouches[0].screenX;
    }, { passive: true });

    drawer.addEventListener('touchend', (e) => {
      touchEndX = e.changedTouches[0].screenX;
      // If user swiped right more than 60px, close drawer
      if (touchEndX - touchStartX > 60) {
        closeMobileMenu();
      }
    }, { passive: true });
  }

  // Quick search inside mobile drawer
  const mobileSearchInput = document.getElementById('mobile-quick-search-input');
  const mobileSearchBtn = document.getElementById('mobile-quick-search-btn');

  function handleMobileSearch() {
    if (!mobileSearchInput) return;
    const q = mobileSearchInput.value.trim();
    if (!q) return;

    closeMobileMenu();
    const mainSearchInput = document.getElementById('modal-search-input');
    if (mainSearchInput) {
      mainSearchInput.value = q;
      mainSearchInput.dispatchEvent(new Event('input', { bubbles: true }));
    }
    openModal('search-dialog');
  }

  if (mobileSearchBtn) {
    mobileSearchBtn.addEventListener('click', handleMobileSearch);
  }
  if (mobileSearchInput) {
    mobileSearchInput.addEventListener('keypress', (e) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        handleMobileSearch();
      }
    });
  }
}

function openMobileMenu() {
  const triggerBtn = document.getElementById('mobile-menu-btn');
  const overlay = document.getElementById('mobile-nav-overlay');
  const drawer = document.getElementById('mobile-nav-drawer');

  if (drawer && overlay) {
    drawer.classList.add('open');
    drawer.setAttribute('aria-hidden', 'false');
    overlay.classList.add('open');
    overlay.setAttribute('aria-hidden', 'false');

    if (triggerBtn) {
      triggerBtn.classList.add('is-active');
      triggerBtn.setAttribute('aria-expanded', 'true');
    }
    drawer.focus();
  }
}

function closeMobileMenu() {
  const triggerBtn = document.getElementById('mobile-menu-btn');
  const overlay = document.getElementById('mobile-nav-overlay');
  const drawer = document.getElementById('mobile-nav-drawer');

  if (drawer && overlay) {
    drawer.classList.remove('open');
    drawer.setAttribute('aria-hidden', 'true');
    overlay.classList.remove('open');
    overlay.setAttribute('aria-hidden', 'true');

    if (triggerBtn) {
      triggerBtn.classList.remove('is-active');
      triggerBtn.setAttribute('aria-expanded', 'false');
      triggerBtn.focus();
    }
  }
}

// Global window bindings for inline HTML onclick handlers
window.expressBuyNow = expressBuyNow;
window.addToCart = addToCart;
window.openQuickView = openQuickView;
window.openModal = openModal;
window.closeModal = closeModal;
window.handleHeroShopNow = handleHeroShopNow;
window.handleHeroViewDetails = handleHeroViewDetails;
window.openMobileMenu = openMobileMenu;
window.closeMobileMenu = closeMobileMenu;
window.openCheckoutModal = openCheckoutModal;
window.updateCartQuantity = updateCartQuantity;
window.removeFromCart = removeFromCart;
window.renderCartDrawer = renderCartDrawer;
window.onCityChange = onCityChange;
window.handleReviewPhotoSelect = handleReviewPhotoSelect;
window.clearReviewPhoto = clearReviewPhoto;
window.selectAvatarSticker = selectAvatarSticker;



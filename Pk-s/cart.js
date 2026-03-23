/* =====================================================
   LUMISKIN — CART SYSTEM
   Handles: cart state, cart sidebar, checkout form,
            plus/minus qty in product detail, order placement.
   No backend touched. Frontend-only.
===================================================== */

(function () {

  /* ─── Cart state (stored in localStorage) ─── */
  let cart = [];

  function loadCart() {
    try { cart = JSON.parse(localStorage.getItem('lumiCart') || '[]'); } catch { cart = []; }
  }

  function saveCart() {
    try { localStorage.setItem('lumiCart', JSON.stringify(cart)); } catch {}
  }

  loadCart();

  /* ─── Badge update (both cartCount badges) ─── */
  function updateBadges() {
    const total = cart.reduce((sum, item) => sum + item.qty, 0);
    ['cartCount', 'pdCartBadge'].forEach(id => {
      const el = document.getElementById(id);
      if (el) el.textContent = total;
    });
  }

  updateBadges();

  /* ─── Add item to cart ─── */
  window.lumiAddToCart = function (product, qty) {
    if (!product) return;
    qty = qty || 1;
    const existing = cart.find(i => i.id === product.id || i.name === product.product_name);
    if (existing) {
      existing.qty += qty;
    } else {
      cart.push({
        id: product.id || product.product_name,
        name: product.product_name,
        price: product.price,
        image: product.image_url,
        qty: qty
      });
    }
    saveCart();
    updateBadges();
    showCartToast(product.product_name);
  };

  /* ─── Add a simple named item (for "You May Also Like" cards) ─── */
  window.lumiAddNamedItem = function (name, price, image) {
    const existing = cart.find(i => i.name === name);
    if (existing) {
      existing.qty += 1;
    } else {
      cart.push({ id: name, name: name, price: price || 0, image: image || '', qty: 1 });
    }
    saveCart();
    updateBadges();
    showCartToast(name);
  };

  /* ─── Toast notification ─── */
  function showCartToast(name) {
    const toast = document.getElementById('toastCart');
    if (toast) {
      toast.innerHTML = `<i class="fa-solid fa-check" style="margin-right:7px;"></i> "${name}" added to cart!`;
      toast.classList.add('show');
      setTimeout(() => toast.classList.remove('show'), 2600);
    }
  }

  /* =====================================================
     CART SIDEBAR
  ===================================================== */

  function buildSidebar() {
    if (document.getElementById('lumiCartSidebar')) return;

    const overlay = document.createElement('div');
    overlay.id = 'lumiCartOverlay';
    overlay.style.cssText = `
      display:none; position:fixed; inset:0; background:rgba(0,0,0,0.55);
      z-index:99998; backdrop-filter:blur(3px);
    `;
    overlay.addEventListener('click', closeCart);

    const sidebar = document.createElement('div');
    sidebar.id = 'lumiCartSidebar';
    sidebar.style.cssText = `
      display:none; position:fixed; top:0; right:0; width:420px; max-width:96vw;
      height:100%; background:#0f0f0f; z-index:99999;
      flex-direction:column; font-family:'Inter',sans-serif;
      box-shadow:-8px 0 40px rgba(0,0,0,0.5);
      transition:transform 0.35s cubic-bezier(.16,1,.3,1);
      transform:translateX(100%);
    `;

    sidebar.innerHTML = `
      <!-- Header -->
      <div style="display:flex;align-items:center;justify-content:space-between;
                  padding:22px 24px;border-bottom:1px solid #222;">
        <div style="display:flex;align-items:center;gap:10px;">
          <i class="fa-solid fa-bag-shopping" style="color:#C9A84C;font-size:18px;"></i>
          <span style="font-size:18px;font-weight:700;color:#fff;">Your Cart</span>
          <span id="cartSidebarCount" style="background:#C9A84C;color:#000;
                font-size:11px;font-weight:700;padding:2px 8px;border-radius:20px;">0</span>
        </div>
        <button id="cartCloseBtn" style="background:none;border:none;color:#888;
                font-size:22px;cursor:pointer;transition:color 0.2s;">
          <i class="fa-solid fa-xmark"></i>
        </button>
      </div>

      <!-- Items list -->
      <div id="cartItemsList" style="flex:1;overflow-y:auto;padding:16px 24px;min-height:0;"></div>

      <!-- Order Summary -->
      <div id="cartSummarySection" style="padding:0 24px 10px;">
        <div style="display:flex;justify-content:space-between;padding:12px 0;
                    border-top:1px solid #222;margin-top:8px;">
          <span style="color:#aaa;font-size:14px;">Subtotal</span>
          <span id="cartSubtotal" style="color:#fff;font-weight:700;font-size:15px;">₹0</span>
        </div>
        <div style="display:flex;justify-content:space-between;padding:4px 0 12px;">
          <span style="color:#aaa;font-size:13px;">Delivery</span>
          <span style="color:#10b981;font-size:13px;font-weight:600;">FREE</span>
        </div>
      </div>

      <!-- Address + Checkout Form -->
      <div id="cartCheckoutForm" style="padding:0 24px 24px;border-top:1px solid #222;">
        <p style="color:#C9A84C;font-size:12px;font-weight:700;
                  text-transform:uppercase;letter-spacing:1px;margin:16px 0 12px;">
          Delivery Details
        </p>

        <div style="display:grid;grid-template-columns:1fr 1fr;gap:10px;margin-bottom:10px;">
          <input id="c_name" placeholder="Full Name" style="
            background:#1a1a1a;border:1px solid #333;border-radius:8px;
            padding:10px 12px;color:#fff;font-size:13px;outline:none;
            font-family:inherit;transition:border 0.2s;
          ">
          <input id="c_phone" placeholder="Phone Number" style="
            background:#1a1a1a;border:1px solid #333;border-radius:8px;
            padding:10px 12px;color:#fff;font-size:13px;outline:none;
            font-family:inherit;transition:border 0.2s;
          ">
        </div>

        <input id="c_address" placeholder="Flat / House No, Street, Area" style="
          width:100%;box-sizing:border-box;background:#1a1a1a;border:1px solid #333;
          border-radius:8px;padding:10px 12px;color:#fff;font-size:13px;
          outline:none;font-family:inherit;margin-bottom:10px;transition:border 0.2s;
        ">

        <div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:10px;margin-bottom:14px;">
          <input id="c_city" placeholder="City" style="
            background:#1a1a1a;border:1px solid #333;border-radius:8px;
            padding:10px 12px;color:#fff;font-size:13px;outline:none;
            font-family:inherit;transition:border 0.2s;
          ">
          <input id="c_state" placeholder="State" style="
            background:#1a1a1a;border:1px solid #333;border-radius:8px;
            padding:10px 12px;color:#fff;font-size:13px;outline:none;
            font-family:inherit;transition:border 0.2s;
          ">
          <input id="c_pincode" placeholder="Pincode" style="
            background:#1a1a1a;border:1px solid #333;border-radius:8px;
            padding:10px 12px;color:#fff;font-size:13px;outline:none;
            font-family:inherit;transition:border 0.2s;
          ">
        </div>

        <button id="placeOrderBtn" style="
          width:100%;padding:14px;background:linear-gradient(90deg,#C9A84C,#e8c96e);
          border:none;border-radius:10px;color:#000;font-size:15px;font-weight:700;
          cursor:pointer;letter-spacing:0.5px;transition:opacity 0.2s,transform 0.15s;
          font-family:inherit;
        ">
          <i class="fa-solid fa-bag-shopping" style="margin-right:8px;"></i>
          Place Order
        </button>
      </div>

      <!-- Order Success -->
      <div id="orderSuccessPanel" style="display:none;padding:32px 24px;text-align:center;">
        <div style="font-size:52px;margin-bottom:16px;">🎉</div>
        <h3 style="color:#C9A84C;font-size:20px;margin:0 0 8px;">Order Placed!</h3>
        <p style="color:#aaa;font-size:14px;margin:0 0 20px;">Thank you for shopping with LumiSkin.<br>Your order will arrive in 3–5 days.</p>
        <div id="orderSummaryDisplay" style="text-align:left;background:#1a1a1a;
             border-radius:10px;padding:16px;margin-bottom:20px;font-size:13px;color:#ccc;"></div>
        <button id="continueShopping" style="
          background:linear-gradient(90deg,#C9A84C,#e8c96e);border:none;
          border-radius:8px;color:#000;padding:12px 24px;
          font-size:14px;font-weight:700;cursor:pointer;font-family:inherit;
        ">Continue Shopping</button>
      </div>
    `;

    document.body.appendChild(overlay);
    document.body.appendChild(sidebar);

    /* Close button */
    document.getElementById('cartCloseBtn').addEventListener('click', closeCart);

    /* Place Order */
    document.getElementById('placeOrderBtn').addEventListener('click', placeOrder);

    /* Continue Shopping */
    document.getElementById('continueShopping').addEventListener('click', () => {
      closeCart();
      setTimeout(() => {
        document.getElementById('orderSuccessPanel').style.display = 'none';
        document.getElementById('cartCheckoutForm').style.display = 'block';
        document.getElementById('cartSummarySection').style.display = 'block';
        document.getElementById('cartItemsList').style.display = 'block';
      }, 400);
    });

    /* Input focus glow */
    sidebar.querySelectorAll('input').forEach(inp => {
      inp.addEventListener('focus', () => inp.style.borderColor = '#C9A84C');
      inp.addEventListener('blur', () => inp.style.borderColor = '#333');
    });

    /* Place order hover */
    const placeBtn = document.getElementById('placeOrderBtn');
    placeBtn.addEventListener('mouseenter', () => { placeBtn.style.opacity = '0.88'; placeBtn.style.transform = 'translateY(-1px)'; });
    placeBtn.addEventListener('mouseleave', () => { placeBtn.style.opacity = '1'; placeBtn.style.transform = 'none'; });
  }

  /* ─── Open cart ─── */
  window.openCart = function () {
    buildSidebar();
    renderCartItems();
    const sidebar = document.getElementById('lumiCartSidebar');
    const overlay = document.getElementById('lumiCartOverlay');
    overlay.style.display = 'block';
    sidebar.style.display = 'flex';
    setTimeout(() => { sidebar.style.transform = 'translateX(0)'; }, 10);
  };

  /* ─── Close cart ─── */
  function closeCart() {
    const sidebar = document.getElementById('lumiCartSidebar');
    const overlay = document.getElementById('lumiCartOverlay');
    if (!sidebar) return;
    sidebar.style.transform = 'translateX(100%)';
    setTimeout(() => {
      sidebar.style.display = 'none';
      overlay.style.display = 'none';
    }, 350);
  }

  /* ─── Render cart items ─── */
  function renderCartItems() {
    const list = document.getElementById('cartItemsList');
    const countEl = document.getElementById('cartSidebarCount');
    const subtotalEl = document.getElementById('cartSubtotal');
    if (!list) return;

    const totalQty = cart.reduce((s, i) => s + i.qty, 0);
    const subtotal = cart.reduce((s, i) => s + (i.price * i.qty), 0);

    if (countEl) countEl.textContent = totalQty;
    if (subtotalEl) subtotalEl.textContent = '₹' + subtotal.toLocaleString('en-IN');

    if (cart.length === 0) {
      list.innerHTML = `
        <div style="text-align:center;padding:60px 0;color:#555;">
          <i class="fa-solid fa-bag-shopping" style="font-size:40px;margin-bottom:16px;display:block;"></i>
          <p style="margin:0;font-size:15px;">Your cart is empty</p>
          <p style="margin:8px 0 0;font-size:13px;">Add some products to get started</p>
        </div>`;
      return;
    }

    list.innerHTML = cart.map((item, idx) => `
      <div class="cart-item-row" style="display:flex;gap:14px;align-items:center;
           padding:14px 0;border-bottom:1px solid #1e1e1e;">
        <img src="${item.image}" alt="${item.name}" style="
          width:64px;height:64px;object-fit:cover;border-radius:8px;
          background:#1a1a1a;flex-shrink:0;
        " onerror="this.src='https://via.placeholder.com/64x64/1a1a1a/C9A84C?text=✦'">

        <div style="flex:1;min-width:0;">
          <div style="color:#fff;font-size:13px;font-weight:600;
               white-space:nowrap;overflow:hidden;text-overflow:ellipsis;
               margin-bottom:4px;">${item.name}</div>
          <div style="color:#C9A84C;font-size:13px;font-weight:700;">₹${item.price.toLocaleString('en-IN')}</div>
        </div>

        <div style="display:flex;align-items:center;gap:8px;flex-shrink:0;">
          <button onclick="lumiChangeQty(${idx}, -1)" style="
            width:26px;height:26px;background:#222;border:1px solid #333;
            border-radius:6px;color:#fff;cursor:pointer;font-size:14px;
            display:flex;align-items:center;justify-content:center;
          ">−</button>
          <span style="color:#fff;font-size:13px;font-weight:600;min-width:16px;text-align:center;">
            ${item.qty}
          </span>
          <button onclick="lumiChangeQty(${idx}, 1)" style="
            width:26px;height:26px;background:#222;border:1px solid #333;
            border-radius:6px;color:#fff;cursor:pointer;font-size:14px;
            display:flex;align-items:center;justify-content:center;
          ">+</button>
        </div>

        <div style="color:#aaa;font-size:13px;font-weight:600;min-width:52px;text-align:right;">
          ₹${(item.price * item.qty).toLocaleString('en-IN')}
        </div>

        <button onclick="lumiRemoveItem(${idx})" style="
          background:none;border:none;color:#555;cursor:pointer;
          font-size:14px;padding:4px;transition:color 0.2s;flex-shrink:0;
        " title="Remove">
          <i class="fa-solid fa-trash-can"></i>
        </button>
      </div>
    `).join('');
  }

  /* ─── Change quantity inside sidebar ─── */
  window.lumiChangeQty = function (idx, delta) {
    if (!cart[idx]) return;
    cart[idx].qty += delta;
    if (cart[idx].qty <= 0) cart.splice(idx, 1);
    saveCart();
    updateBadges();
    renderCartItems();
  };

  /* ─── Remove item ─── */
  window.lumiRemoveItem = function (idx) {
    cart.splice(idx, 1);
    saveCart();
    updateBadges();
    renderCartItems();
  };

  /* ─── Place order ─── */
  function placeOrder() {
    if (cart.length === 0) {
      alert('Your cart is empty! Add products before placing an order.');
      return;
    }

    const name = document.getElementById('c_name')?.value.trim();
    const phone = document.getElementById('c_phone')?.value.trim();
    const address = document.getElementById('c_address')?.value.trim();
    const city = document.getElementById('c_city')?.value.trim();
    const state = document.getElementById('c_state')?.value.trim();
    const pincode = document.getElementById('c_pincode')?.value.trim();

    if (!name || !phone || !address || !city || !state || !pincode) {
      alert('Please fill in all delivery details before placing your order.');
      return;
    }

    if (!/^\d{10}$/.test(phone)) {
      alert('Please enter a valid 10-digit phone number.');
      return;
    }

    if (!/^\d{6}$/.test(pincode)) {
      alert('Please enter a valid 6-digit pincode.');
      return;
    }

    /* Build order summary */
    const subtotal = cart.reduce((s, i) => s + i.price * i.qty, 0);
    const orderId = 'LS' + Date.now().toString().slice(-8);

    const summaryHTML = `
      <div style="margin-bottom:12px;">
        <span style="color:#C9A84C;font-weight:700;">Order ID:</span> #${orderId}
      </div>
      <div style="margin-bottom:8px;">
        <span style="color:#C9A84C;font-weight:700;">Items:</span>
        <ul style="margin:6px 0 0 16px;padding:0;color:#ccc;">
          ${cart.map(i => `<li style="margin-bottom:4px;">${i.name} × ${i.qty} — ₹${(i.price * i.qty).toLocaleString('en-IN')}</li>`).join('')}
        </ul>
      </div>
      <div style="margin-bottom:8px;">
        <span style="color:#C9A84C;font-weight:700;">Total:</span> ₹${subtotal.toLocaleString('en-IN')} (Free Delivery)
      </div>
      <div style="margin-bottom:4px;">
        <span style="color:#C9A84C;font-weight:700;">Deliver to:</span><br>
        ${name}, ${phone}<br>
        ${address}, ${city}, ${state} — ${pincode}
      </div>
    `;

    document.getElementById('orderSummaryDisplay').innerHTML = summaryHTML;

    /* Switch to success screen */
    document.getElementById('cartCheckoutForm').style.display = 'none';
    document.getElementById('cartSummarySection').style.display = 'none';
    document.getElementById('cartItemsList').style.display = 'none';
    document.getElementById('orderSuccessPanel').style.display = 'block';

    /* Clear cart */
    cart = [];
    saveCart();
    updateBadges();
  }

  /* =====================================================
     WIRE UP CART ICONS — both in product list & detail
  ===================================================== */

  document.addEventListener('DOMContentLoaded', function () {

    /* 1. Products navbar cart icon */
    const cartWrapper = document.querySelector('.cart-wrapper');
    if (cartWrapper) {
      cartWrapper.addEventListener('click', function (e) {
        e.stopPropagation();
        window.openCart();
      });
    }

    /* 2. Product detail page cart icon */
    const pdCartIconWrap = document.getElementById('pdCartIconWrap');
    if (pdCartIconWrap) {
      pdCartIconWrap.addEventListener('click', function (e) {
        e.stopPropagation();
        window.openCart();
      });
    }

    /* ─── Fix Plus / Minus quantity buttons ─── */
    /* These are in the product detail overlay */
    const plusBtn = document.getElementById('plusBtn');
    const minusBtn = document.getElementById('minusBtn');
    const qtyEl = document.getElementById('qtyValue');

    if (plusBtn && qtyEl) {
      /* Remove any previous onclick to avoid double-fire */
      plusBtn.onclick = null;
      plusBtn.addEventListener('click', function () {
        const current = parseInt(qtyEl.textContent, 10) || 1;
        qtyEl.textContent = current + 1;
      });
    }

    if (minusBtn && qtyEl) {
      minusBtn.onclick = null;
      minusBtn.addEventListener('click', function () {
        const current = parseInt(qtyEl.textContent, 10) || 1;
        if (current > 1) qtyEl.textContent = current - 1;
      });
    }

    /* ─── Fix Add to Cart button in product detail ─── */
    const addCartBtn = document.getElementById('addCartBtn');
    if (addCartBtn) {
      addCartBtn.onclick = null; /* clear shopskincare.js handler */
      addCartBtn.addEventListener('click', function () {
        /* currentProduct is set by shopskincare.js openProduct() */
        const product = window.currentProduct || null;
        if (!product) return;

        const qty = parseInt(document.getElementById('qtyValue')?.textContent, 10) || 1;

        window.lumiAddToCart(product, qty);

        /* Visual feedback */
        const orig = addCartBtn.textContent.trim();
        addCartBtn.classList.add('added');
        addCartBtn.textContent = '✓  Added to Cart!';
        setTimeout(() => {
          addCartBtn.classList.remove('added');
          addCartBtn.textContent = orig || 'ADD TO CART';
        }, 2000);
      });
    }

    /* ─── Fix "Add to Cart" on product cards in the grid ─── */
    /* Delegate because cards are dynamically rendered */
    const productsGrid = document.getElementById('productsGrid');
    if (productsGrid) {
      productsGrid.addEventListener('click', function (e) {
        const btn = e.target.closest('.addCartBtn');
        if (!btn) return;
        e.stopPropagation();

        /* Get the product data from the card's data set via shopskincare products array */
        /* shopskincare.js stores nothing per-card; we read from DOM */
        const card = btn.closest('.product-card');
        if (!card) return;
        const name = card.querySelector('h4')?.textContent || 'Product';
        const priceText = card.querySelector('p')?.textContent?.replace(/[₹,]/g, '') || '0';
        const img = card.querySelector('img')?.src || '';
        const price = parseFloat(priceText) || 0;

        window.lumiAddNamedItem(name, price, img);

        btn.textContent = '✓ Added!';
        btn.style.background = '#10b981';
        setTimeout(() => {
          btn.textContent = 'Add to Cart';
          btn.style.background = '';
        }, 2000);
      });
    }

    /* ─── Fix "You May Also Like" cart buttons ─── */
    window.addRecToCart = function (btn, name) {
      if (btn.classList.contains('added-rec')) return;

      /* Read price from sibling .pd-rec-price */
      const card = btn.closest('.pd-rec-card');
      const priceText = card?.querySelector('.pd-rec-price')?.textContent?.replace(/[₹,]/g, '') || '0';
      const img = card?.querySelector('img')?.src || '';
      const price = parseFloat(priceText) || 0;

      window.lumiAddNamedItem(name, price, img);

      btn.classList.add('added-rec');
      btn.textContent = '✓ Added!';
      setTimeout(() => {
        btn.classList.remove('added-rec');
        btn.textContent = 'Add to Cart';
      }, 2500);
    };

  });

})();

let products = [];

async function loadProductsFromApi() {
  try {
    const params = new URLSearchParams();
    if (searchTerm) params.set('q', searchTerm);
    if (activeCategory && activeCategory !== 'All') params.set('category', activeCategory);

    const response = await fetch(`/api/products${params.toString() ? `?${params.toString()}` : ''}`);
    if (!response.ok) throw new Error('Failed to load products');
    products = await response.json();
    if (productGrid) renderProducts();
    if (productDetail) {
      const product = products.find(item => item.id === Number(new URLSearchParams(window.location.search).get('id'))) || products[0];
      if (product) {
        document.title = `${product.name} | vamsiMart`;
        productDetail.innerHTML = `<div class="detail-image"><img src="${product.image}" alt="${product.name}"></div><div class="detail-copy"><p class="eyebrow">${product.category} / vamsiMart</p><h1>${product.name}</h1><div class="detail-rating">★ 4.8 <span>1,248 ratings</span></div><div class="detail-price">${formatPrice(product.price)} ${product.oldPrice ? `<del>${formatPrice(product.oldPrice)}</del><b>${Math.round((1 - product.price / product.oldPrice) * 100)}% off</b>` : ''}</div><p class="detail-description">${product.description} Designed for everyday use with thoughtful materials, dependable performance, and a finish that feels right at home.</p><div class="detail-delivery"><b>Delivery available</b><span>Enter your pincode to check delivery and offers.</span><div><input placeholder="Enter pincode" inputmode="numeric"><button type="button">Check</button></div></div><button class="primary-button detail-add" type="button">Add to bag <span>↗</span></button><a class="detail-back" href="products.html">← Back to all products</a></div>`;
        productDetail.querySelector('.detail-add').addEventListener('click', () => { addToCart(product.id); });
        productDetail.querySelector('.detail-delivery button').addEventListener('click', event => { const input = event.currentTarget.previousElementSibling; const message = productDetail.querySelector('.detail-delivery span'); message.textContent = /^\d{6}$/.test(input.value.trim()) ? 'Great news, delivery is available to this pincode.' : 'Enter a valid 6-digit pincode to check delivery.'; });
      }
    }
  } catch (error) {
    console.error('Unable to load products from API:', error);
    if (productGrid) renderProducts();
    if (productDetail && products.length) {
      const product = products.find(item => item.id === Number(pageParams.get('id'))) || products[0];
      document.title = `${product.name} | vamsiMart`;
      productDetail.innerHTML = `<div class="detail-image"><img src="${product.image}" alt="${product.name}"></div><div class="detail-copy"><p class="eyebrow">${product.category} / vamsiMart</p><h1>${product.name}</h1><div class="detail-price">${formatPrice(product.price)}</div><p class="detail-description">${product.description}</p><button class="primary-button detail-add" type="button">Add to bag <span>↗</span></button><a class="detail-back" href="products.html">← Back to all products</a></div>`;
      productDetail.querySelector('.detail-add').addEventListener('click', () => addToCart(product.id));
    }
  }
}

const categoryCatalog = {
  Electronics: {items:['Wireless Earbuds','Bluetooth Speaker','Smart Watch','Power Bank','Desk Lamp','USB-C Hub','Portable Projector','Mechanical Keyboard','Webcam','Phone Stand','Noise Cancelling Headphones','Charging Dock','Fitness Tracker','Tablet Sleeve','Travel Adapter'], brands:['boAt','NovaTech','Soundcore','Realme','Portronics','Logitech','JBL'], basePrice:899, imageTerm:'electronics'} ,
  Fashion: {items:['Cotton Shirt','Relaxed Trousers','Knit Cardigan','Oversized Hoodie','Midi Dress','Cargo Pants','Everyday Sneakers','Denim Jacket','Linen Co-ord','Ribbed Top','Canvas Tote','Leather Belt','Satin Blouse','Pleated Skirt','Classic Sunglasses'], brands:['House of Vamsi','Mango Street','Urban Loom','Westside Edit','Thread Theory','Cedar & Co','Mode Studio'], basePrice:799, imageTerm:'fashion clothing'} ,
  Beauty: {items:['Glow Serum','Hydrating Moisturizer','Face Cleanser','Lip Tint','Hair Mask','Body Lotion','Daily Sunscreen','Clay Face Mask','Perfume Mist','Eye Cream','Bath Salts','Nourishing Oil','Makeup Brush Set','Hand Cream','Shampoo Bar'], brands:['Glow Lab','Pure Ritual','The Botanist','Skin Story','Luma Beauty','Daily Dew','Bloom Co'], basePrice:399, imageTerm:'beauty skincare'} ,
  Home: {items:['Ceramic Vase','Linen Cushion','Storage Basket','Accent Table','Wall Mirror','Bedside Lamp','Cotton Bedsheet','Serving Tray','Scented Candle','Glass Carafe','Throw Blanket','Desk Organizer','Planter Pot','Bath Towel Set','Kitchen Canister'], brands:['Loom & Oak','Casa Vamsi','Nordic Nest','Sunday Home','Form & Field','Warm House','Studio Living'], basePrice:499, imageTerm:'home decor'} ,
  Grocery: {items:['Organic Coffee','Farmhouse Honey','Granola Mix','Green Tea','Olive Oil','Pantry Staples','Fresh Greens Box','Dark Chocolate','Almond Butter','Dried Fruit Mix','Pasta Pack','Coconut Water','Breakfast Oats','Spice Collection','Snack Box'], brands:['Farm & Fresh','Harvest Table','Good Earth','Daily Pantry','Local Basket','Pure Field','Freshfolk'], basePrice:249, imageTerm:'grocery food'} ,
  Appliances: {items:['Air Fryer','Mixer Grinder','Tower Fan','Electric Kettle','Rice Cooker','Toaster Oven','Hand Blender','Coffee Maker','Steam Iron','Room Heater','Induction Cooktop','Juicer','Vacuum Cleaner','Food Chopper','Kitchen Scale'], brands:['HomePro','ChefMate','Breeze Living','QuickCook','DailyEase','Culina','Compact Living'], basePrice:1290, imageTerm:'kitchen appliance'} ,
  Sports: {items:['Training Mat','Running Shoes','Dumbbell Set','Foam Roller','Gym Bag','Resistance Bands','Sports Bottle','Cycling Gloves','Yoga Block Set','Fitness Towel','Skipping Rope','Tennis Racket','Recovery Ball','Workout Shorts','Trail Backpack'], brands:['FlexFit','Move Lab','ActiveArc','Trail Core','Peak Motion','Runwell','BodyKind'], basePrice:599, imageTerm:'fitness sports'}
};
let generatedProductId = products.length + 1;
Object.entries(categoryCatalog).forEach(([category, catalog]) => {
  let categoryNumber = products.filter(product => product.category === category).length;
  let itemIndex = 0;
  while (categoryNumber < 105) {
    const item = catalog.items[itemIndex % catalog.items.length];
    const brand = catalog.brands[Math.floor(itemIndex / catalog.items.length) % catalog.brands.length];
    const color = ['Midnight','Cloud White','Rose','Sage','Sand','Cobalt','Charcoal','Coral','Mint'][itemIndex % 9];
    const model = `Edition ${Math.floor(itemIndex / (catalog.items.length * catalog.brands.length)) + 1}`;
    const price = catalog.basePrice + ((itemIndex * 137) % 12) * 100;
    products.push({id:generatedProductId++, name:`${brand} ${item} - ${color} ${model}`, category, price, oldPrice:itemIndex % 3 === 0 ? price + 300 : null, image:`https://loremflickr.com/700/700/${catalog.imageTerm}?lock=${generatedProductId}`, description:`A thoughtfully chosen ${item.toLowerCase()} from ${brand}, made for better everyday living. Reliable quality, considered design, and excellent value from vamsiMart.`, badge:itemIndex % 5 === 0 ? 'New' : itemIndex % 3 === 0 ? 'Deal' : ''});
    categoryNumber += 1;
    itemIndex += 1;
  }
});
const pageParams = new URLSearchParams(window.location.search);
let activeCategory = pageParams.get('category') || 'All';
let searchTerm = pageParams.get('q') || '';
let visibleLimit = 24;
let sortMode = 'featured';
const productGrid = document.getElementById('productGrid');
const resultCount = document.getElementById('resultCount');
const cartDrawer = document.getElementById('cartDrawer');
const overlay = document.getElementById('overlay');
const searchPanel = document.getElementById('searchPanel');

const accountStorageKey = 'vamsiMartCurrentAccount';
const currentAccount = (() => {
  try {
    return localStorage.getItem(accountStorageKey) || 'guest';
  } catch {
    return 'guest';
  }
})();
const cartStorageKey = `vamsiMartCart:${currentAccount}`;
let cart = JSON.parse(localStorage.getItem(cartStorageKey) || '[]');

document.querySelectorAll('.site-footer').forEach(footer => {
  const credit = footer.querySelector('.footer-credit') || footer.querySelector('p');
  if (credit) {
    credit.className = 'footer-credit';
    credit.innerHTML = 'Created by <strong>Govathoti Vamsi</strong><br><a href="mailto:vamsigovathoti8125@gmail.com">vamsigovathoti8125@gmail.com</a><br><a href="https://www.linkedin.com/in/vamsigovathoti8125/" target="_blank" rel="noreferrer">Govathoti Vamsi | LinkedIn</a><br><a href="https://github.com/vamsigovathoti8125" target="_blank" rel="noreferrer">vamsigovathoti8125 (Govathoti vamsi) · GitHub</a><br><a href="tel:+918125723070">8125723070</a>';
  }
});

const formatPrice = value => `₹${value.toLocaleString('en-IN')}`;
function visibleProducts() {
  return products.filter(product => {
    const categoryMatch = activeCategory === 'All' || product.category === activeCategory;
    const searchMatch = `${product.name} ${product.category}`.toLowerCase().includes(searchTerm.toLowerCase());
    return categoryMatch && searchMatch;
  });
}
function renderProducts() {
  if (!productGrid) return;
  const matchingProducts = visibleProducts();
  const sortedProducts = [...matchingProducts].sort((first, second) => sortMode === 'low' ? first.price - second.price : sortMode === 'high' ? second.price - first.price : first.id - second.id);
  const visible = sortedProducts.slice(0, visibleLimit);
  resultCount.textContent = `Showing ${visible.length} of ${matchingProducts.length}`;
  productGrid.innerHTML = visible.map(product => `<article class="product-card">
    <a class="product-link" href="product.html?id=${product.id}" aria-label="View ${product.name}"><div class="product-image">${product.badge ? `<span class="product-badge">${product.badge}</span>` : ''}<button class="wish-button" type="button" aria-label="Add ${product.name} to wishlist">♡</button><img src="${product.image}" alt="${product.name}" loading="lazy"><span class="quick-button">View product &nbsp;↗</span></div>
    <div class="product-info"><h3>${product.name}</h3><p>${product.category}</p><div class="product-price">${formatPrice(product.price)} ${product.oldPrice ? `<del>${formatPrice(product.oldPrice)}</del>` : ''}</div></div></a>
  </article>`).join('') || '<p class="no-results">No pieces found. Try another search.</p>';
  const loadMore = document.getElementById('loadMore');
  if (loadMore) loadMore.hidden = visible.length >= matchingProducts.length;
}
function showQuickView(id) {
  const product = products.find(item => item.id === id);
  document.getElementById('quickContent').innerHTML = `<div class="quick-layout"><img src="${product.image}" alt="${product.name}"><div class="quick-detail"><p class="eyebrow">${product.category} / vamsiMart edit</p><h2>${product.name}</h2><div class="product-price">${formatPrice(product.price)}</div><p>${product.description}</p><button class="primary-button" id="quickAdd">Add to bag <span>↗</span></button></div></div>`;
  document.getElementById('quickView').classList.add('open'); overlay.classList.add('active');
  document.getElementById('quickAdd').addEventListener('click', () => { addToCart(product.id); closeQuickView(); });
}
function closeQuickView() { document.getElementById('quickView').classList.remove('open'); if (!cartDrawer.classList.contains('open')) overlay.classList.remove('active'); }
function addToCart(id) { const found = cart.find(item => item.id === id); if (found) found.quantity += 1; else cart.push({id, quantity:1}); saveCart(); renderCart(); openCart(); }
function saveCart() { localStorage.setItem(cartStorageKey, JSON.stringify(cart)); }
function renderCart() {
  const count = cart.reduce((sum, item) => sum + item.quantity, 0);
  const cartCount = document.getElementById('cartCount');
  if (cartCount) cartCount.textContent = count;
  document.querySelectorAll('.cart-button span').forEach(counter => { counter.textContent = count; });
  renderCartPage();
  const cartItems = document.getElementById('cartItems');
  if (!cartItems) return;
  if (!cart.length) { cartItems.innerHTML = '<div class="empty-cart"><span>✦</span><p>Your bag is waiting<br>for something lovely.</p><a href="#shop" id="startShopping">Start exploring</a></div>'; }
  else { cartItems.innerHTML = cart.map(item => { const product = products.find(entry => entry.id === item.id); return `<div class="cart-line"><img src="${product.image}" alt="${product.name}"><div><h3>${product.name}</h3><p>${formatPrice(product.price)} each</p><div class="quantity-control"><button type="button" data-quantity="${product.id}" data-change="-1" aria-label="Decrease quantity">−</button><span>${item.quantity}</span><button type="button" data-quantity="${product.id}" data-change="1" aria-label="Increase quantity">+</button></div><button class="remove-line" data-remove="${product.id}">Remove</button></div></div>`; }).join(''); document.querySelectorAll('[data-remove]').forEach(button => button.addEventListener('click', () => { cart = cart.filter(item => item.id !== Number(button.dataset.remove)); saveCart(); renderCart(); })); document.querySelectorAll('[data-quantity]').forEach(button => button.addEventListener('click', () => { const item = cart.find(entry => entry.id === Number(button.dataset.quantity)); if (!item) return; item.quantity += Number(button.dataset.change); if (item.quantity < 1) cart = cart.filter(entry => entry.id !== item.id); saveCart(); renderCart(); })); }
  const total = cart.reduce((sum, item) => sum + products.find(product => product.id === item.id).price * item.quantity, 0);
  const cartTotal = document.getElementById('cartTotal'); if (cartTotal) cartTotal.textContent = formatPrice(total);
}
function openCart() { if (!cartDrawer || !overlay) return; cartDrawer.classList.add('open'); overlay.classList.add('active'); }
function closeCart() { if (!cartDrawer) return; cartDrawer.classList.remove('open'); const quickView = document.getElementById('quickView'); if (overlay && (!quickView || !quickView.classList.contains('open'))) overlay.classList.remove('active'); }

function renderAccountState() {
  const accounts = JSON.parse(localStorage.getItem('vamsiMartAccounts') || '{}');
  const account = accounts[currentAccount];
  const accountCard = document.getElementById('accountCard');
  if (!accountCard) return;
  let accountDashboard = document.getElementById('accountDashboard');
  if (!accountDashboard) { accountDashboard = document.createElement('div'); accountDashboard.className = 'account-dashboard'; accountDashboard.id = 'accountDashboard'; accountDashboard.innerHTML = '<p class="eyebrow">Your account</p><h2 id="accountWelcomeName">Welcome back.</h2><p class="account-dashboard-note">Your bag and completed orders stay connected to this browser session.</p><div class="account-orders" id="accountOrders"></div><button class="account-logout" id="logoutButton" type="button">Log out</button>'; accountCard.insertAdjacentElement('afterend', accountDashboard); }
  if (!account || currentAccount === 'guest') { accountCard.hidden = false; accountDashboard.hidden = true; return; }
  accountCard.hidden = true;
  accountDashboard.hidden = false;
  const orders = JSON.parse(localStorage.getItem(`vamsiMartOrders:${currentAccount}`) || '[]');
  const welcome = document.getElementById('accountWelcomeName');
  const orderList = document.getElementById('accountOrders');
  if (welcome) welcome.textContent = `Welcome back, ${account.name}.`;
  if (orderList) orderList.innerHTML = orders.length ? orders.map(order => `<article class="account-order"><div><b>Order ${order.id}</b><small>${new Date(order.createdAt).toLocaleDateString('en-IN')}</small></div><strong>${order.total}</strong><span>Confirmed</span></article>`).join('') : '<p class="account-empty">Your completed orders will appear here.</p>';
  const logout = document.getElementById('logoutButton');
  if (logout) logout.onclick = () => { localStorage.removeItem(accountStorageKey); window.location.reload(); };
}

document.querySelectorAll('.category-card').forEach(card => {
  if (card.dataset.category === activeCategory) card.classList.add('active');
  card.addEventListener('click', async () => {
    activeCategory = card.dataset.category;
    if (!productGrid) {
      window.location.href = `products.html?category=${encodeURIComponent(activeCategory)}`;
      return;
    }
    const active = document.querySelector('.category-card.active');
    if (active) active.classList.remove('active');
    card.classList.add('active');
    visibleLimit = 24;
    await loadProductsFromApi();
    const shop = document.getElementById('shop');
    if (shop) shop.scrollIntoView({ behavior: 'smooth' });
  });
});
const loadMoreButton = document.getElementById('loadMore'); if (loadMoreButton) loadMoreButton.addEventListener('click', () => { visibleLimit += 24; renderProducts(); });
const sortSelect = document.getElementById('sortSelect'); if (sortSelect) sortSelect.addEventListener('change', async event => { sortMode = event.target.value; visibleLimit = 24; await loadProductsFromApi(); });
const searchToggle = document.querySelector('.search-toggle'); if (searchToggle && searchPanel) searchToggle.addEventListener('click', () => { searchPanel.classList.add('open'); const input = document.getElementById('searchInput'); input.value = searchTerm; input.focus(); });
if (searchToggle && !searchPanel) searchToggle.addEventListener('click', () => { window.location.href = 'products.html'; });
const closeSearch = document.getElementById('closeSearch'); if (closeSearch) closeSearch.addEventListener('click', () => searchPanel.classList.remove('open'));
const searchInput = document.getElementById('searchInput'); if (searchInput) { searchInput.value = searchTerm; searchInput.addEventListener('input', async event => { searchTerm = event.target.value; visibleLimit = 24; await loadProductsFromApi(); }); searchInput.addEventListener('keydown', event => { if (event.key === 'Enter' && searchTerm.trim()) window.location.href = `products.html?q=${encodeURIComponent(searchTerm.trim())}`; }); }
const cartButton = document.getElementById('cartButton'); if (cartButton) cartButton.addEventListener('click', openCart); const closeCartButton = document.getElementById('closeCart'); if (closeCartButton) closeCartButton.addEventListener('click', closeCart); if (overlay) overlay.addEventListener('click', () => { closeCart(); closeQuickView(); }); const quickClose = document.getElementById('quickClose'); if (quickClose) quickClose.addEventListener('click', closeQuickView);
const newsletterForm = document.getElementById('newsletterForm'); if (newsletterForm) newsletterForm.addEventListener('submit', event => { event.preventDefault(); document.getElementById('newsletterMessage').textContent = 'You are on the list. See you in your inbox.'; event.target.reset(); });
const checkoutButton = document.querySelector('.checkout-button'); if (checkoutButton) checkoutButton.addEventListener('click', () => { if (cart.length) window.location.href = currentAccount === 'guest' ? 'account.html?return=checkout.html' : 'checkout.html'; });
function renderCartPage() {
  const cartPageItems = document.getElementById('cartPageItems');
  if (!cartPageItems) return;
  const cartPageTotal = document.getElementById('cartPageTotal');
  const cartPageEmpty = document.getElementById('cartPageEmpty');
  const cartPageContent = document.getElementById('cartPageContent');
  if (!cart.length) { if (cartPageEmpty) cartPageEmpty.hidden = false; if (cartPageContent) cartPageContent.hidden = true; return; }
  if (cartPageEmpty) cartPageEmpty.hidden = true; if (cartPageContent) cartPageContent.hidden = false;
  cartPageItems.innerHTML = cart.map(item => { const product = products.find(entry => entry.id === item.id); return `<article class="cart-page-line"><a href="product.html?id=${product.id}"><img src="${product.image}" alt="${product.name}"></a><div><p class="eyebrow">${product.category}</p><h3>${product.name}</h3><span>${item.quantity} × ${formatPrice(product.price)}</span><button class="remove-page-item" data-page-remove="${product.id}">Remove</button></div><strong>${formatPrice(product.price * item.quantity)}</strong></article>`; }).join('');
  const total = cart.reduce((sum, item) => sum + products.find(product => product.id === item.id).price * item.quantity, 0); if (cartPageTotal) cartPageTotal.textContent = formatPrice(total);
  document.querySelectorAll('[data-page-remove]').forEach(button => button.addEventListener('click', () => { cart = cart.filter(item => item.id !== Number(button.dataset.pageRemove)); saveCart(); renderCart(); }));
  const pageCheckout = document.getElementById('pageCheckout');
  if (pageCheckout) pageCheckout.onclick = () => { if (cart.length) window.location.href = currentAccount === 'guest' ? 'account.html?return=checkout.html' : 'checkout.html'; else renderCartPage(); };
}
const productDetail = document.getElementById('productDetail');
if (productDetail && products.length) {
  const product = products.find(item => item.id === Number(new URLSearchParams(window.location.search).get('id'))) || products[0];
  document.title = `${product.name} | vamsiMart`;
  productDetail.innerHTML = `<div class="detail-image"><img src="${product.image}" alt="${product.name}"></div><div class="detail-copy"><p class="eyebrow">${product.category} / vamsiMart</p><h1>${product.name}</h1><div class="detail-rating">★ 4.8 <span>1,248 ratings</span></div><div class="detail-price">${formatPrice(product.price)} ${product.oldPrice ? `<del>${formatPrice(product.oldPrice)}</del><b>${Math.round((1 - product.price / product.oldPrice) * 100)}% off</b>` : ''}</div><p class="detail-description">${product.description} Designed for everyday use with thoughtful materials, dependable performance, and a finish that feels right at home.</p><div class="detail-delivery"><b>Delivery available</b><span>Enter your pincode to check delivery and offers.</span><div><input placeholder="Enter pincode" inputmode="numeric"><button type="button">Check</button></div></div><button class="primary-button detail-add" type="button">Add to bag <span>↗</span></button><a class="detail-back" href="products.html">← Back to all products</a></div>`;
  productDetail.querySelector('.detail-add').addEventListener('click', () => { addToCart(product.id); });
  productDetail.querySelector('.detail-delivery button').addEventListener('click', event => { const input = event.currentTarget.previousElementSibling; const message = productDetail.querySelector('.detail-delivery span'); message.textContent = /^\d{6}$/.test(input.value.trim()) ? 'Great news, delivery is available to this pincode.' : 'Enter a valid 6-digit pincode to check delivery.'; });
}
const accountForm = document.getElementById('accountForm');
function mergeGuestCartIntoAccount(email) { const guestItems = JSON.parse(localStorage.getItem('vamsiMartCart:guest') || '[]'); const accountKey = `vamsiMartCart:${email}`; const accountItems = JSON.parse(localStorage.getItem(accountKey) || '[]'); guestItems.forEach(guestItem => { const existing = accountItems.find(item => item.id === guestItem.id); if (existing) existing.quantity += guestItem.quantity; else accountItems.push(guestItem); }); localStorage.setItem(accountKey, JSON.stringify(accountItems)); localStorage.removeItem('vamsiMartCart:guest'); }
async function apiRequest(path, options = {}) {
  const token = localStorage.getItem('vamsiMartToken');
  let response;
  try {
    response = await fetch(path, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...(options.headers || {})
      }
    });
  } catch (error) {
    throw new Error('The vamsiMart server is unavailable. Start it with "node server.js" and try again.');
  }

  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(data.message || 'Request failed');
  }

  return data;
}
if (accountForm) {
  let accountMode = 'login';
  const message = document.getElementById('accountMessage');
  const nameInput = document.getElementById('accountName');
  const nameLabel = document.getElementById('accountNameLabel');
  const submitText = document.getElementById('accountSubmitText');
  document.querySelectorAll('[data-account-mode]').forEach(tab => tab.addEventListener('click', () => { accountMode = tab.dataset.accountMode; document.querySelectorAll('[data-account-mode]').forEach(item => item.classList.toggle('active', item === tab)); const signup = accountMode === 'signup'; nameInput.hidden = !signup; nameLabel.hidden = !signup; nameInput.required = signup; submitText.textContent = signup ? 'Create account' : 'Log in'; message.textContent = ''; }));
  accountForm.addEventListener('submit', async event => { event.preventDefault(); const email = document.getElementById('accountEmail').value.trim().toLowerCase(); const password = document.getElementById('accountPassword').value; const returnUrl = new URLSearchParams(window.location.search).get('return') || 'index.html'; try {
    if (accountMode === 'signup') {
      if (password.length < 6) { message.textContent = 'Use at least 6 characters for your password.'; return; }
      const result = await apiRequest('/api/auth/register', { method: 'POST', body: JSON.stringify({ name: nameInput.value.trim() || 'vamsiMart shopper', email, password }) });
      localStorage.setItem('vamsiMartToken', result.token);
      localStorage.setItem('vamsiMartCurrentAccount', result.user.email);
      mergeGuestCartIntoAccount(result.user.email);
      message.textContent = 'Account created. Your bag is now linked to this account.';
      accountForm.reset();
      window.setTimeout(() => window.location.href = returnUrl, 700);
      return;
    }

    const result = await apiRequest('/api/auth/login', { method: 'POST', body: JSON.stringify({ email, password }) });
    localStorage.setItem('vamsiMartToken', result.token);
    localStorage.setItem('vamsiMartCurrentAccount', result.user.email);
    message.textContent = `Welcome back, ${result.user.name}.`;
    accountForm.reset();
    window.setTimeout(() => window.location.href = returnUrl, 700);
  } catch (error) {
    message.textContent = error.message;
  }
});
}
renderAccountState();
const checkoutForm = document.getElementById('checkoutForm');
if (checkoutForm) {
  const checkoutItems = document.getElementById('checkoutItems');
  const checkoutSubtotal = document.getElementById('checkoutSubtotal');
  const checkoutDelivery = document.getElementById('checkoutDelivery');
  const checkoutTotal = document.getElementById('checkoutTotal');
  const checkoutItemsTotal = cart.reduce((sum, item) => sum + products.find(product => product.id === item.id).price * item.quantity, 0);
  checkoutItems.innerHTML = cart.length ? cart.map(item => { const product = products.find(entry => entry.id === item.id); return `<div class="checkout-item"><img src="${product.image}" alt="${product.name}"><span>${product.name}<small>${item.quantity} × ${formatPrice(product.price)}</small></span></div>`; }).join('') : '<p class="checkout-empty">Your bag is empty. <a href="products.html">Browse products</a></p>';
  if (!cart.length) checkoutForm.closest('#checkoutLayout').hidden = true;
  checkoutSubtotal.textContent = formatPrice(checkoutItemsTotal);
  function updateCheckoutTotal() { const express = checkoutForm.querySelector('input[name="delivery"]:checked')?.value === 'express'; const cod = document.querySelector('[data-payment].active')?.dataset.payment === 'cod'; const delivery = express ? 99 : 0; const handling = cod ? 30 : 0; checkoutDelivery.textContent = delivery || handling ? formatPrice(delivery + handling) : 'FREE'; checkoutTotal.textContent = formatPrice(checkoutItemsTotal + delivery + handling); }
  checkoutForm.querySelectorAll('input[name="delivery"]').forEach(input => input.addEventListener('change', updateCheckoutTotal));
  document.querySelectorAll('[data-payment]').forEach(tab => tab.addEventListener('click', () => { document.querySelectorAll('[data-payment]').forEach(item => item.classList.toggle('active', item === tab)); document.querySelectorAll('[data-panel]').forEach(panel => { panel.hidden = panel.dataset.panel !== tab.dataset.payment; }); updateCheckoutTotal(); }));
  checkoutForm.addEventListener('submit', async event => { event.preventDefault(); if (!cart.length) { window.location.href = 'products.html'; return; } const deliveryInput = checkoutForm.querySelector('input[name="delivery"]:checked'); const paymentTab = document.querySelector('[data-payment].active'); const address = {
    name: checkoutForm.querySelector('input[name="name"]').value,
    phone: checkoutForm.querySelector('input[name="phone"]').value,
    address: checkoutForm.querySelector('input[name="address"]').value,
    city: checkoutForm.querySelector('input[name="city"]').value,
    state: checkoutForm.querySelector('input[name="state"]').value,
    pincode: checkoutForm.querySelector('input[name="pincode"]').value
  };

  try {
    const orderPayload = {
      items: cart.map(item => {
        const product = products.find(product => product.id === item.id);
        return { ...item, name: product ? product.name : 'Product', price: product ? product.price : 0 };
      }),
      total: checkoutTotal.textContent,
      paymentMethod: paymentTab ? paymentTab.dataset.payment : 'upi',
      deliveryMode: deliveryInput ? deliveryInput.value : 'standard',
      address
    };

    const paymentResult = await apiRequest('/api/payments/confirm', {
      method: 'POST',
      body: JSON.stringify({ method: orderPayload.paymentMethod, amount: orderPayload.total })
    });

    if (paymentResult.status !== 'paid') {
      throw new Error('Payment was not confirmed.');
    }

    const orderResult = await apiRequest('/api/orders', {
      method: 'POST',
      body: JSON.stringify(orderPayload)
    });

    localStorage.setItem(cartStorageKey, '[]');
    cart = [];
    checkoutForm.closest('#checkoutLayout').hidden = true;
    document.getElementById('orderSuccess').hidden = false;
    renderCart();
    window.scrollTo({top: 0, behavior: 'smooth'});
    console.log('Order created:', orderResult);
  } catch (error) {
    alert(error.message || 'Unable to place order.');
  }
});
  updateCheckoutTotal();
}
if (productGrid) renderProducts(); renderCart(); saveCart(); loadProductsFromApi();
// Product data array
const products = [
    { id: 1, name: "Wireless Headphones", price: 500, image: "assets/images.jpeg" },
    { id: 2, name: "Smart Watch", price: 750, image: "assets/image.jpeg" },
    { id: 3, name: "Phone Case", price: 300, image: "assets/image1.jpeg" },
    { id: 4, name: "Bluetooth Speaker", price: 900, image: "assets/images.jpg" }
];

// Shipping fee and tax constants
const SHIPPING_FEE = 100;
const GST_RATE = 0.35; // 45% GST

// Get cart from localStorage or initialize empty array
function getCart() {
    const cart = localStorage.getItem('cart');
    return cart ? JSON.parse(cart) : [];
}

// Save cart to localStorage
function saveCart(cart) {
    localStorage.setItem('cart', JSON.stringify(cart));
}

// Update cart count in header
function updateCartCount() {
    const cart = getCart();
    const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
    const cartCountElement = document.getElementById('cart-count');
    if (cartCountElement) {
        cartCountElement.textContent = totalItems;
    }
}

// Add product to cart
function addToCart(productId) {
    const product = products.find(p => p.id === productId);
    if (!product) return;

    let cart = getCart();
    const existingItem = cart.find(item => item.id === productId);

    if (existingItem) {
        existingItem.quantity += 1;
    } else {
        cart.push({
            id: product.id,
            name: product.name,
            price: product.price,
            quantity: 1
        });
    }

    saveCart(cart);
    updateCartCount();
    
    // Show feedback to user
    const button = event.target;
    const originalText = button.textContent;
    button.textContent = 'item has been added to cart!';
    button.style.background = '#f8f9fa';
    button.style.color = '#2c3e50';
    setTimeout(() => {
        button.textContent = originalText;
        button.style.background = '#ffffff';
    }, 1000);
}

// Buy now function
function buyNow(productId) {
    addToCart(productId);
    setTimeout(() => {
        goToCart();
    }, 500);
}

// Remove item from cart
function removeFromCart(productId) {
    let cart = getCart();
    cart = cart.filter(item => item.id !== productId);
    saveCart(cart);
    updateCartCount();
    renderCartPage();
}

// Update item quantity in cart
function updateQuantity(productId, change) {
    let cart = getCart();
    const item = cart.find(item => item.id === productId);
    
    if (item) {
        item.quantity += change;
        if (item.quantity <= 0) {
            removeFromCart(productId);
            return;
        }
        saveCart(cart);
        updateCartCount();
        renderCartPage();
    }
}

// Navigate to cart page
function goToCart() {
    window.location.href = 'cart.html';
}

// Navigate to products page
function goToProducts() {
    window.location.href = 'index.html';
}

// Render products on index page
function renderProductsPage() {
    const container = document.getElementById('products-container');
    if (!container) return;

    container.innerHTML = '';
    
    products.forEach(product => {
        const productCard = document.createElement('div');
        productCard.className = 'product-card';
        
        productCard.innerHTML = `
            <div class="product-image">
                <img src="${product.image}" alt="${product.name}" style="width: 100%; height: 100%; object-fit: cover; border-radius: 12px;" onerror="this.style.display='none'; this.parentNode.innerHTML='📱';">
            </div>
            <div class="product-name">${product.name}</div>
            <div class="product-price">$${product.price}</div>
            <div class="product-actions">
                <button class="add-to-cart-btn" onclick="addToCart(${product.id})">
                    Add to Cart
                </button>
                <button class="buy-now-btn" onclick="buyNow(${product.id})">
                    Buy Now
                </button>
            </div>
        `;
        
        container.appendChild(productCard);
    });
}

// Render cart page
function renderCartPage() {
    const cartItemsContainer = document.getElementById('cart-items');
    const totalQuantityElement = document.getElementById('total-quantity');
    const totalPriceElement = document.getElementById('total-price');
    
    if (!cartItemsContainer) return;

    const cart = getCart();
    
    if (cart.length === 0) {
        cartItemsContainer.innerHTML = `
            <div class="empty-cart">
                <div class="empty-cart-icon">🛒</div>
                <h2>Your cart is empty</h2>
                <p>Add some products to get started!</p>
            </div>
        `;
        
        // Hide summary when cart is empty
        const summaryContainer = document.querySelector('.cart-summary');
        if (summaryContainer) {
            summaryContainer.style.display = 'none';
        }
        return;
    }

    cartItemsContainer.innerHTML = '';
    let totalQuantity = 0;
    let subtotal = 0;

    cart.forEach(item => {
        totalQuantity += item.quantity;
        subtotal += item.price * item.quantity;

        const cartItem = document.createElement('div');
        cartItem.className = 'cart-item';
        
        cartItem.innerHTML = `
            <div class="item-info">
                <div class="item-name">${item.name}</div>
                <div class="item-price">$${item.price} each</div>
            </div>
            <div class="quantity-controls">
                <button class="quantity-btn" onclick="updateQuantity(${item.id}, -1)">-</button>
                <span class="quantity">${item.quantity}</span>
                <button class="quantity-btn" onclick="updateQuantity(${item.id}, 1)">+</button>
            </div>
        `;
        
        cartItemsContainer.appendChild(cartItem);
    });

    // Calculate shipping, tax and total
    const shipping = totalQuantity > 0 ? SHIPPING_FEE : 0;
    const tax = subtotal * GST_RATE;
    const finalTotal = subtotal + shipping + tax;

    // Update summary with shipping and tax
    const summaryContainer = document.querySelector('.cart-summary');
    if (summaryContainer) {
        summaryContainer.style.display = 'block';
        summaryContainer.innerHTML = `
            <div class="summary-row">
                <span>Subtotal (${totalQuantity} items):</span>
                <span>$${subtotal.toFixed(2)}</span>
            </div>
            <div class="summary-row shipping-row">
                <span>Shipping:</span>
                <span>$${shipping.toFixed(2)}</span>
            </div>
            <div class="summary-row shipping-row">
                <span>GST (35%):</span>
                <span>$${tax.toFixed(2)}</span>
            </div>
            <div class="summary-row total-row">
                <span>Total:</span>
                <span>$${finalTotal.toFixed(2)}</span>
            </div>
            <button class="checkout-btn" onclick="checkout()">
                Proceed to Checkout
            </button>
        `;
    }

    if (totalQuantityElement) totalQuantityElement.textContent = totalQuantity;
    if (totalPriceElement) totalPriceElement.textContent = finalTotal;
}

// Checkout function
function checkout() {
    const cart = getCart();
    if (cart.length === 0) return;
    
    const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
    const subtotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const shipping = SHIPPING_FEE;
    const tax = subtotal * GST_RATE;
    const total = subtotal + shipping + tax;
    
    alert(`Order Summary:\n${totalItems} items\nSubtotal: $${subtotal.toFixed(2)}\nShipping: $${shipping.toFixed(2)}\nGST (35%): ${tax.toFixed(2)}\nTotal: $${total.toFixed(2)}\n\nThank you for your purchase!`);
    
    // Clear cart after purchase
    localStorage.removeItem('cart');
    updateCartCount();
    renderCartPage();
}

// Initialize page based on current location
document.addEventListener('DOMContentLoaded', function() {
    updateCartCount();
    
    // Check which page we're on and render accordingly
    if (window.location.pathname.includes('cart.html')) {
        renderCartPage();
    } else {
        renderProductsPage();
    }
});
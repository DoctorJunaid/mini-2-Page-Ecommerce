// this script handles all the main functonality of the e-commerce site

document.addEventListener('DOMContentLoaded', function () {

    // some basic variables
    const SHIPPING_FEE = 100;
    const GST_RATE = 0.45; // 45% GST

    // all the products we are selling
    const productsArray = [
        { id: 1, name: "Expensive Laptop", price: 10000, image: "assets/images.jpg" },
        { id: 2, name: "Cheap Laptop", price: 500, image: "assets/image.jpeg" },
        { id: 3, name: "Expensive Mobile", price: 1000, image: "assets/images.jpeg" },
        { id: 4, name: "Cheap Mobile", price: 300, image: "assets/image1.jpeg" }
    ];

    // get cart items from localstorage, or make a new empty array
    let cartProducts = JSON.parse(localStorage.getItem("cartProducts")) || [];

    
    // run functions when the page loads
    updateCartCount();

    if (document.getElementById("products-container")) {
        loadProducts();
    }
    if (document.getElementById("cart-items")) {
        renderCart();
    }


    // shows cart item count in header
    function updateCartCount() {
        const cartCountElement = document.getElementById("cart-count");
        if (cartCountElement) {
            let totalItems = 0;
            for (let i = 0; i < cartProducts.length; i++) {
                totalItems += cartProducts[i].quantity;
            }
            cartCountElement.innerText = totalItems;
        }
    }

    // saves cart to local storage and updates the page
    function updateAndSaveCart() {
        localStorage.setItem("cartProducts", JSON.stringify(cartProducts));
        // rerender the cart page if we are on it
        if (document.getElementById("cart-items")) {
            renderCart();
        }
        updateCartCount();
    }

    // puts the products on the main page
    function loadProducts() {
        const productPage = document.getElementById("products-container");
        if (!productPage) return;
        productPage.innerHTML = ''; // clear the page first

        for (let i = 0; i < productsArray.length; i++) {
            const product = productsArray[i];

            // creating elements
            const card = document.createElement("div");
            card.className = "product-card";

            const productImage = document.createElement("img");
            productImage.src = product.image;
            productImage.alt = product.name;
            productImage.style.cssText = "width: 100%; height: 200px; object-fit: cover; border-radius: 12px;";

            const productName = document.createElement("div");
            productName.className = "product-name";
            productName.textContent = product.name;

            const productPrice = document.createElement("div");
            productPrice.className = "product-price";
            productPrice.textContent = "$" + product.price;

            const actionsContainer = document.createElement("div");
            actionsContainer.className = "product-actions";

            const cartButton = document.createElement("button");
            cartButton.className = "add-to-cart-btn";
            cartButton.textContent = "Add to Cart";

            const buyButton = document.createElement("button");
            buyButton.className = "buy-now-btn";
            buyButton.textContent = "Buy Now";

            actionsContainer.appendChild(cartButton);
            actionsContainer.appendChild(buyButton);

            card.appendChild(productImage);
            card.appendChild(productName);
            card.appendChild(productPrice);
            card.appendChild(actionsContainer);

            productPage.appendChild(card);

            // check if item is already in cart
            const alreadyOnCart = cartProducts.some(item => item.id === product.id);
            if (alreadyOnCart) {
                cartButton.textContent = "Already in Cart";
                cartButton.disabled = true;
                cartButton.style.backgroundColor = '#6c757d';
            }

            // add to cart button
            cartButton.addEventListener("click", function () {
                product.quantity = 1;
                cartProducts.push(product);
                updateAndSaveCart();

                cartButton.textContent = "Already in Cart";
                cartButton.disabled = true;
                cartButton.style.backgroundColor = '#6c757d';
            });

            // buy now button
            buyButton.addEventListener("click", function () {
                const alreadyOnCart = cartProducts.some(item => item.id === product.id);
                if (!alreadyOnCart) {
                    product.quantity = 1;
                    cartProducts.push(product);
                    updateAndSaveCart();
                }
                // go to cart page
                window.location.href = 'cart.html';
            });
        }
    }

    // shows all the items in the cart
    function renderCart() {
        const cartPage = document.getElementById("cart-items");
        const summaryPage = document.querySelector(".cart-summary");
        if (!cartPage) return;

        cartPage.innerHTML = "";
        summaryPage.innerHTML = "";

        if (cartProducts.length === 0) {
            cartPage.innerHTML = `
                <div class="empty-cart">
                    <div class="empty-cart-icon">🛒</div>
                    <h2>Your cart is empty</h2>
                </div>`;
            summaryPage.style.display = 'none';
            return;
        }

        summaryPage.style.display = 'block';
        let subtotal = 0;
        let totalQuantity = 0;

        for (let i = 0; i < cartProducts.length; i++) {
            const item = cartProducts[i];
            subtotal += item.price * item.quantity;
            totalQuantity += item.quantity;

            const card = document.createElement("div");
            card.className = "cart-item";

            const itemInfo = document.createElement('div');
            itemInfo.className = 'item-info';
            // show price calculation for each item
            const totalPrice = item.price * item.quantity;
            itemInfo.innerHTML = `<div class="item-name">${item.name}</div><div class="item-price">$${item.price} × ${item.quantity} = $${totalPrice.toFixed(2)}</div>`;

            const controls = document.createElement('div');
            controls.className = 'quantity-controls';

            const subtractBtn = document.createElement('button');
            subtractBtn.className = 'quantity-btn';
            subtractBtn.textContent = '-';

            const quantitySpan = document.createElement('span');
            quantitySpan.className = 'quantity';
            quantitySpan.textContent = item.quantity;

            const addBtn = document.createElement('button');
            addBtn.className = 'quantity-btn';
            addBtn.textContent = '+';

            controls.appendChild(subtractBtn);
            controls.appendChild(quantitySpan);
            controls.appendChild(addBtn);

            const removeBtn = document.createElement('button');
            removeBtn.textContent = 'Remove';
            removeBtn.style.cssText = 'background: #dc3545; color: white; border: none; padding: 8px 12px; border-radius: 20px; cursor: pointer;';

            card.appendChild(itemInfo);
            card.appendChild(controls);
            card.appendChild(removeBtn);
            cartPage.appendChild(card);

            // buttons in the cart
            addBtn.addEventListener('click', function () {
                item.quantity++;
                updateAndSaveCart();
            });

            subtractBtn.addEventListener('click', function () {
                if (item.quantity > 1) {
                    item.quantity--;
                } else {
                    // remove item if quantity is 0
                    cartProducts.splice(i, 1);
                }
                updateAndSaveCart();
            });

            removeBtn.addEventListener('click', function () {
                cartProducts.splice(i, 1); // remove item from array
                updateAndSaveCart();
            });
        }

        // calcalates the final price with tax and shipping
        const tax = subtotal * GST_RATE;
        const finalTotal = subtotal + SHIPPING_FEE + tax;

        summaryPage.innerHTML = `
            <div class="summary-row">
                <span>Subtotal (${totalQuantity} items):</span>
                <span>$${subtotal.toFixed(2)}</span>
            </div>
            <div class="summary-row shipping-row">
                <span>Shipping:</span>
                <span>$${SHIPPING_FEE.toFixed(2)}</span>
            </div>
            <div class="summary-row shipping-row">
                <span>GST (45%):</span>
                <span>$${tax.toFixed(2)}</span>
            </div>
            <div class="summary-row total-row">
                <span>Total:</span>
                <span>$${finalTotal.toFixed(2)}</span>
            </div>
            <button class="checkout-btn">Proceed to Checkout</button>
        `;

        summaryPage.querySelector('.checkout-btn').addEventListener('click', function () {
            alert(`Thank you for your purchase!\nTotal: $${finalTotal.toFixed(2)}`);
            cartProducts = []; // clear the cart
            updateAndSaveCart();
        });
    }
});

// neccesary navigation functions
function goToCart() {
    window.location.href = 'cart.html';
}

function goToProducts() {
    window.location.href = 'index.html';
}

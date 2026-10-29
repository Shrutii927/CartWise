const products = [
    { id: 1, title: "Wireless Headphones", price: 89.99, category: "Electronics", img: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=300" },
    { id: 2, title: "Smart Watch", price: 129.99, category: "Electronics", img: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=300" },
    { id: 3, title: "Classic Denim Jacket", price: 59.99, category: "Fashion", img: "https://images.unsplash.com/photo-1576995853123-5a10305d93c0?w=300" },
    { id: 4, title: "Running Sneakers", price: 74.50, category: "Fashion", img: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=300" },
    { id: 5, title: "Modern Coffee Table", price: 149.00, category: "Home", img: "https://images.unsplash.com/photo-1533090161767-e6ffed986c88?w=300" },
    { id: 6, title: "Ceramic Mug Set", price: 24.99, category: "Home", img: "https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?w=300" }
];

let cart = [];
let selectedCategory = "All";

document.addEventListener("DOMContentLoaded", () => {
    renderProducts(products);
    renderOrders();
    setupEventListeners();
});

function setupEventListeners() {
    document.getElementById("cartBtn").addEventListener("click", toggleCart);
    document.getElementById("closeCartBtn").addEventListener("click", toggleCart);
    document.getElementById("cartOverlay").addEventListener("click", toggleCart);
    document.getElementById("checkoutBtn").addEventListener("click", openCheckout);
    document.getElementById("closeModalBtn").addEventListener("click", closeCheckout);
    document.getElementById("checkoutForm").addEventListener("submit", handleCheckout);
    document.getElementById("continueBtn").addEventListener("click", hideConfirmation);
}

function renderProducts(items) {
    const grid = document.getElementById("productGrid");
    grid.innerHTML = items.map(p => `
        <div class="product-card">
            <img src="${p.img}" alt="${p.title}">
            <div class="product-title">${p.title}</div>
            <div class="product-price">$${p.price.toFixed(2)}</div>
            <button class="btn-primary" onclick="addToCart(${p.id})">Add to Cart</button>
        </div>
    `).join('');
}

function filterCategory(cat, e) {
    selectedCategory = cat;
    document.querySelectorAll(".filter-btn").forEach(btn => btn.classList.remove("active"));
    if (e && e.target) e.target.classList.add("active");
    filterProducts();
}

function filterProducts() {
    const query = document.getElementById("searchInput").value.toLowerCase();
    const filtered = products.filter(p => {
        const matchesCategory = selectedCategory === "All" || p.category === selectedCategory;
        const matchesSearch = p.title.toLowerCase().includes(query);
        return matchesCategory && matchesSearch;
    });
    renderProducts(filtered);
}

function addToCart(productId) {
    const product = products.find(p => p.id === productId);
    const existing = cart.find(item => item.id === productId);
    
    if (existing) {
        existing.qty++;
    } else {
        cart.push({ ...product, qty: 1 });
    }
    
    updateCartUI();
    document.getElementById("cartDrawer").classList.add("open");
    document.getElementById("cartOverlay").classList.add("show");
}

function toggleCart() {
    document.getElementById("cartDrawer").classList.toggle("open");
    document.getElementById("cartOverlay").classList.toggle("show");
}

function updateCartUI() {
    const cartItems = document.getElementById("cartItems");
    const cartCount = document.getElementById("cartCount");
    
    cartCount.innerText = cart.reduce((acc, item) => acc + item.qty, 0);
    
    if (cart.length === 0) {
        cartItems.innerHTML = "<p>Your cart is empty.</p>";
    } else {
        cartItems.innerHTML = cart.map(item => `
            <div class="cart-item">
                <div>
                    <strong>${item.title}</strong>
                    <div>$${item.price.toFixed(2)} x ${item.qty}</div>
                </div>
                <button class="btn-secondary" onclick="removeFromCart(${item.id})">Remove</button>
            </div>
        `).join('');
    }

    const subtotal = cart.reduce((acc, item) => acc + (item.price * item.qty), 0);
    const tax = subtotal * 0.05;
    const total = subtotal + tax;

    document.getElementById("cartSubtotal").innerText = `$${subtotal.toFixed(2)}`;
    document.getElementById("cartTax").innerText = `$${tax.toFixed(2)}`;
    document.getElementById("cartTotal").innerText = `$${total.toFixed(2)}`;
}

function removeFromCart(id) {
    cart = cart.filter(item => item.id !== id);
    updateCartUI();
}

function openCheckout() {
    if (cart.length === 0) return alert("Your cart is empty!");
    toggleCart();
    document.getElementById("checkoutModal").classList.add("show");
}

function closeCheckout() {
    document.getElementById("checkoutModal").classList.remove("show");
}

function handleCheckout(e) {
    e.preventDefault();
    
    const name = document.getElementById("custName").value;
    const email = document.getElementById("custEmail").value;
    const phone = document.getElementById("custPhone").value;
    const address = document.getElementById("custAddress").value;
    
    const subtotal = cart.reduce((acc, item) => acc + (item.price * item.qty), 0);
    const total = (subtotal * 1.05).toFixed(2);
    const orderID = "CW" + Math.floor(1000 + Math.random() * 9000);

    const newOrder = { id: orderID, name, email, phone, address, total, date: new Date().toLocaleDateString() };

    const savedOrders = JSON.parse(localStorage.getItem("cartwise_orders") || "[]");
    savedOrders.push(newOrder);
    localStorage.setItem("cartwise_orders", JSON.stringify(savedOrders));

    closeCheckout();
    cart = [];
    updateCartUI();

    document.getElementById("confirmOrderID").innerText = `#${orderID}`;
    document.getElementById("confirmName").innerText = name;
    document.getElementById("confirmTotal").innerText = `$${total}`;
    document.getElementById("confirmation").classList.remove("hidden");

    renderOrders();
}

function hideConfirmation() {
    document.getElementById("confirmation").classList.add("hidden");
}

function renderOrders() {
    const list = document.getElementById("ordersList");
    const savedOrders = JSON.parse(localStorage.getItem("cartwise_orders") || "[]");

    if (savedOrders.length === 0) {
        list.innerHTML = "<p>No orders placed yet.</p>";
        return;
    }

    list.innerHTML = savedOrders.map(o => `
        <div class="order-card">
            <h4>Order #${o.id} — <small>${o.date}</small></h4>
            <p><strong>Customer:</strong> ${o.name} (${o.phone})</p>
            <p><strong>Total Paid:</strong> $${o.total}</p>
            <button class="btn-secondary" style="margin-top:0.5rem;" onclick="cancelOrder('${o.id}')">Cancel Order</button>
        </div>
    `).join('');
}

function cancelOrder(id) {
    let savedOrders = JSON.parse(localStorage.getItem("cartwise_orders") || "[]");
    savedOrders = savedOrders.filter(o => o.id !== id);
    localStorage.setItem("cartwise_orders", JSON.stringify(savedOrders));
    renderOrders();
}
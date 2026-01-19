const menuItems = [
  {
    id: "jollof",
    name: "Jollof Rice Bowl",
    description: "Smoky tomato rice with grilled chicken and fried plantain.",
    price: 14.5,
  },
  {
    id: "suya",
    name: "Beef Suya Wrap",
    description: "Spiced skewered beef, onions, and zesty suya mayo.",
    price: 12,
  },
  {
    id: "egusi",
    name: "Egusi Soup",
    description: "Melon seed soup with spinach and pounded yam.",
    price: 16,
  },
  {
    id: "puff",
    name: "Puff Puff Pack",
    description: "Golden fried dough balls with cinnamon sugar.",
    price: 8,
  },
];

const cart = new Map();

const menuGrid = document.getElementById("menu-grid");
const cartItems = document.getElementById("cart-items");
const cartCount = document.getElementById("cart-count");
const cartTotal = document.getElementById("cart-total");
const checkoutBtn = document.getElementById("checkout-btn");
const checkoutNote = document.getElementById("checkout-note");
const clearCartBtn = document.getElementById("clear-cart");
const checkoutForm = document.getElementById("checkout-form");
const toast = document.getElementById("toast");

function formatPrice(value) {
  return `$${value.toFixed(2)}`;
}

function renderMenu() {
  menuGrid.innerHTML = "";
  menuItems.forEach((item) => {
    const quantity = cart.get(item.id)?.quantity ?? 0;
    const card = document.createElement("article");
    card.className = "menu-card";
    card.innerHTML = `
      <h3>${item.name}</h3>
      <p>${item.description}</p>
      <div class="price">${formatPrice(item.price)}</div>
      <div class="menu-actions">
        <button class="ghost" data-action="minus" data-id="${item.id}" ${
          quantity === 0 ? "disabled" : ""
        }>-</button>
        <span class="menu-qty" data-id="${item.id}">${quantity}</span>
        <button class="ghost" data-action="plus" data-id="${item.id}">+</button>
      </div>
      <button class="primary" data-action="add" data-id="${item.id}">Add to cart</button>
    `;
    card.querySelector("[data-action='add']").addEventListener("click", () => addToCart(item));
    card
      .querySelector("[data-action='minus']")
      .addEventListener("click", () => updateQuantity(item.id, -1));
    card
      .querySelector("[data-action='plus']")
      .addEventListener("click", () => updateQuantity(item.id, 1));
    menuGrid.appendChild(card);
  });
}

function addToCart(item) {
  const current = cart.get(item.id) || { ...item, quantity: 0 };
  current.quantity += 1;
  cart.set(item.id, current);
  renderCart();
  showToast(`${item.name} added to cart`);
}

function updateQuantity(id, delta) {
  const current = cart.get(id);
  if (!current) return;
  current.quantity += delta;
  if (current.quantity <= 0) {
    cart.delete(id);
  } else {
    cart.set(id, current);
  }
  renderCart();
}

function renderCart() {
  cartItems.innerHTML = "";
  let count = 0;
  let total = 0;

  cart.forEach((item) => {
    count += item.quantity;
    total += item.quantity * item.price;

    const row = document.createElement("div");
    row.className = "cart-item";
    row.innerHTML = `
      <div>
        <span>${item.name}</span>
        <div class="note">${formatPrice(item.price)} each</div>
      </div>
      <div class="cart-controls">
        <button type="button" aria-label="Decrease ${item.name}">-</button>
        <strong>${item.quantity}</strong>
        <button type="button" aria-label="Increase ${item.name}">+</button>
      </div>
    `;
    const [minusBtn, plusBtn] = row.querySelectorAll("button");
    minusBtn.addEventListener("click", () => updateQuantity(item.id, -1));
    plusBtn.addEventListener("click", () => updateQuantity(item.id, 1));
    cartItems.appendChild(row);
  });

  if (count === 0) {
    cartItems.innerHTML = "<p class=\"note\">Your cart is empty. Add a dish to get started.</p>";
  }

  cartCount.textContent = String(count);
  cartTotal.textContent = formatPrice(total);
  checkoutBtn.disabled = count === 0;
  checkoutNote.textContent =
    count === 0 ? "Add items to unlock checkout." : "Ready when you are. No signup needed.";
  clearCartBtn.disabled = count === 0;
  updateMenuQuantities();
}

function updateMenuQuantities() {
  menuItems.forEach((item) => {
    const quantity = cart.get(item.id)?.quantity ?? 0;
    const qtyEl = menuGrid.querySelector(`.menu-qty[data-id="${item.id}"]`);
    const minusBtn = menuGrid.querySelector(`button[data-action="minus"][data-id="${item.id}"]`);
    if (qtyEl) {
      qtyEl.textContent = String(quantity);
    }
    if (minusBtn) {
      minusBtn.disabled = quantity === 0;
    }
  });
}

function showToast(message) {
  toast.textContent = message;
  toast.classList.add("show");
  window.setTimeout(() => toast.classList.remove("show"), 2000);
}

checkoutBtn.addEventListener("click", () => {
  document.getElementById("checkout-heading").scrollIntoView({ behavior: "smooth" });
});

clearCartBtn.addEventListener("click", () => {
  cart.clear();
  renderCart();
  showToast("Cart cleared");
});

checkoutForm.addEventListener("submit", (event) => {
  event.preventDefault();
  if (cart.size === 0) {
    showToast("Add items before checkout.");
    return;
  }
  const formData = new FormData(checkoutForm);
  const name = formData.get("name");
  showToast(`Thanks ${name}! Your order is on the way.`);
  checkoutForm.reset();
  cart.clear();
  renderCart();
});

renderMenu();
renderCart();

/* =====================================================
   NAVIGATION SYSTEM
===================================================== */

document.addEventListener("DOMContentLoaded", function () {

const hamburger = document.querySelector(".hamburger");
const navLinks = document.querySelector(".nav-links");
const navbar = document.querySelector(".navbar");

/* MOBILE MENU */

if (hamburger && navLinks) {
hamburger.addEventListener("click", () => {
hamburger.classList.toggle("active");
navLinks.classList.toggle("active");
});
}

/* SCROLL EFFECT */

window.addEventListener("scroll", () => {
if (!navbar) return;

if (window.scrollY > 50) {
navbar.classList.add("active");
} else {
navbar.classList.remove("active");
}
});

/* ACTIVE PAGE */

const currentPage = document.body.getAttribute("data-page");

document.querySelectorAll(".nav-links a").forEach(link => {
const linkPage = link.getAttribute("data-link");

if (linkPage === currentPage) {
link.classList.add("active");
}
});

});



/* =====================================================
   CAROUSEL SLIDER
===================================================== */

const nextButton = document.getElementById("next");
const prevButton = document.getElementById("prev");
const carousel = document.querySelector(".carousel");
const listHTML = document.querySelector(".carousel .list");

let autoScroll;

function showSlider(type){

if(!carousel || !listHTML) return;

const items = listHTML.querySelectorAll(".item");

carousel.classList.remove("next","prev");

if(type === "next"){
listHTML.appendChild(items[0]);
carousel.classList.add("next");
}else{
listHTML.prepend(items[items.length-1]);
carousel.classList.add("prev");
}

}

/* BUTTON EVENTS */

if(nextButton){
nextButton.addEventListener("click",()=>{
showSlider("next");
resetAutoSlide();
});
}

if(prevButton){
prevButton.addEventListener("click",()=>{
showSlider("prev");
resetAutoSlide();
});
}

/* AUTO SLIDE */

function startAutoSlide(){
if(!carousel) return;

autoScroll = setInterval(()=>{
showSlider("next");
},4000);
}

function stopAutoSlide(){
clearInterval(autoScroll);
}

function resetAutoSlide(){
stopAutoSlide();
startAutoSlide();
}

/* HOVER PAUSE */

if(carousel){
carousel.addEventListener("mouseenter",stopAutoSlide);
carousel.addEventListener("mouseleave",startAutoSlide);
}

startAutoSlide();



/* =====================================================
   PRODUCTS SYSTEM
===================================================== */

const productsGrid = document.getElementById("productsGrid");
const clearBtn = document.getElementById("clearFilters");
const productCount = document.getElementById("productCount");
const cartCountEl = document.getElementById("cartCount");

let cartCount = 0;
let products = [];


/* RENDER PRODUCTS */

function renderProducts(productArray){

if(!productsGrid) return;

productsGrid.innerHTML = "";

productArray.forEach(product => {

const card = document.createElement("div");
card.classList.add("product-card");

card.innerHTML = `
<img src="${product.image_url}" alt="${product.product_name}">
<h4>${product.product_name}</h4>
<p>₹${product.price}</p>
<button class="addCartBtn">Add to Cart</button>
`;

card.addEventListener("click",()=>{
openProduct(product);
});

card.querySelector(".addCartBtn").addEventListener("click",(e)=>{
e.stopPropagation();

cartCount++;

if(cartCountEl){
cartCountEl.textContent = cartCount;
}

});

productsGrid.appendChild(card);

});

if(productCount){
productCount.textContent = productArray.length + " Products";
}

}



/* =====================================================
   PRODUCT DETAIL PAGE
===================================================== */

let qty = 1;
let currentProduct = null;

function initProductControls(){

const plusBtn = document.getElementById("plusBtn");
const minusBtn = document.getElementById("minusBtn");
const qtyEl = document.getElementById("qtyValue");

if(!plusBtn || !minusBtn || !qtyEl) return;

plusBtn.onclick = ()=>{
qty++;
qtyEl.innerText = qty;
};

minusBtn.onclick = ()=>{
if(qty>1){
qty--;
qtyEl.innerText = qty;
}
};

}



/* ADD TO CART */

function initAddToCart(){

const addCartBtn = document.getElementById("addCartBtn");
const cartCounter = document.getElementById("cartCount");
const toast = document.getElementById("toastCart");

if(!addCartBtn) return;

addCartBtn.onclick = ()=>{

if(!currentProduct) return;

cartCount += qty;

if(cartCounter){
cartCounter.innerText = cartCount;
}

if(toast){
toast.style.opacity = "1";
toast.style.bottom = "40px";

setTimeout(()=>{
toast.style.opacity="0";
},2000);
}

};

}



/* OPEN PRODUCT */

function openProduct(product){

const shopContainer = document.querySelector(".shop-container");
const detailPage = document.getElementById("productDetailPage");

if(shopContainer) shopContainer.style.display="none";
if(detailPage) detailPage.style.display="block";

document.getElementById("detailImage").src = product.image_url;
document.getElementById("detailName").innerText = product.product_name;
document.getElementById("detailPrice").innerText = "₹"+product.price;

currentProduct = product;
window.currentProduct = product; /* exposed for cart.js */

qty = 1;
document.getElementById("qtyValue").innerText = qty;

initProductControls();
initAddToCart();

}



/* BACK BUTTON */

const backBtn = document.getElementById("backBtn");

if(backBtn){
backBtn.onclick = ()=>{

document.querySelector(".shop-container").style.display="flex";
document.getElementById("productDetailPage").style.display="none";

};
}



/* =====================================================
   FILTER SYSTEM
===================================================== */

function applyFilters(){

const selectedConditions =
[...document.querySelectorAll(".condition:checked")]
.map(el => el.value);

let filteredProducts = products;

if(selectedConditions.length>0){

filteredProducts = products.filter(product =>
selectedConditions.includes(product.condition)
);

}

renderProducts(filteredProducts);

}

document.querySelectorAll(".condition").forEach(filter=>{
filter.addEventListener("change",applyFilters);
});

if(clearBtn){
clearBtn.addEventListener("click",()=>{
document.querySelectorAll(".condition")
.forEach(c=>c.checked=false);

renderProducts(products);
});
}



/* =====================================================
   LOAD PRODUCTS
===================================================== */

fetch("products.json")
.then(res=>res.json())
.then(data=>{
products=data;
renderProducts(products);
});



/* =====================================================
   SEARCH SYSTEM
===================================================== */

const searchIcon = document.getElementById("searchIcon");
const searchInput = document.getElementById("searchInput");

if(searchIcon && searchInput){

searchIcon.addEventListener("click",()=>{
searchInput.classList.toggle("active");
searchInput.focus();
});

searchInput.addEventListener("keyup",()=>{

const searchValue = searchInput.value.toLowerCase();

const filtered = products.filter(product =>
product.product_name.toLowerCase().includes(searchValue)
);

renderProducts(filtered);

});

}



/* CLEAR SEARCH */

const clearSearchBtn = document.getElementById("clearSearch");

if(clearSearchBtn && searchInput){

searchInput.addEventListener("input",()=>{
clearSearchBtn.style.display =
searchInput.value.length>0 ? "flex":"none";
});

clearSearchBtn.addEventListener("click",()=>{
searchInput.value="";
clearSearchBtn.style.display="none";
renderProducts(products);
});

}



/* =====================================================
   ICON ANIMATIONS
===================================================== */

const wishlistIcon = document.querySelector(".wishlist-wrapper");
const cartIcon = document.querySelector(".cart-wrapper");

if(wishlistIcon){
wishlistIcon.addEventListener("click",()=>{
wishlistIcon.classList.add("active");
setTimeout(()=>wishlistIcon.classList.remove("active"),600);
});
}

if(cartIcon){
cartIcon.addEventListener("click",()=>{
cartIcon.classList.add("active");
setTimeout(()=>cartIcon.classList.remove("active"),600);
});
}



/* =====================================================
   MOBILE FILTER
===================================================== */

const filterToggleMobile = document.getElementById("filterToggleMobile");
const filtersAside = document.querySelector(".filters");

if(filterToggleMobile && filtersAside){

filterToggleMobile.addEventListener("click",()=>{
filtersAside.classList.toggle("mobile-open");
filterToggleMobile.classList.toggle("active");
});

}



/* =====================================================
   SUBSCRIBE BUTTON
===================================================== */

const subscribeBtn = document.querySelector(".subscribe-box button");

if(subscribeBtn){

subscribeBtn.addEventListener("click",()=>{
subscribeBtn.innerText="Subscribed ✓";
subscribeBtn.style.background="#28a745";
});

}
/* ================= LOAD PRODUCTS ================= */

let products = [];

fetch("products.json")
.then(res => res.json())
.then(data => {
    products = data;
    renderProducts(products);
});


/* ================= SELECT ELEMENTS ================= */

const productsGrid = document.getElementById("productsGrid");
const productCount = document.getElementById("productCount");
const clearBtn = document.getElementById("clearFilters");

const searchInput = document.getElementById("searchInput");
const searchIcon = document.getElementById("searchIcon");

let cartCount = 0;
const cartCountEl = document.getElementById("cartCount");


/* ================= RENDER PRODUCTS ================= */

function renderProducts(productArray){

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

card.querySelector(".addCartBtn").addEventListener("click", (e)=>{
e.stopPropagation();
cartCount++;
cartCountEl.textContent = cartCount;
});

card.addEventListener("click", ()=>{
openProduct(product);
});

productsGrid.appendChild(card);

});

productCount.textContent = productArray.length + " Products";

}


/* ================= PRODUCT DETAIL ================= */

let currentProduct = null;

function openProduct(product){

document.querySelector(".shop-container").style.display="none";
document.getElementById("productDetailPage").style.display="block";

document.getElementById("detailImage").src = product.image_url;
document.getElementById("detailName").innerText = product.product_name;
document.getElementById("detailPrice").innerText = "₹" + product.price;

currentProduct = product;

}

document.getElementById("backBtn").onclick = ()=>{
document.querySelector(".shop-container").style.display="flex";
document.getElementById("productDetailPage").style.display="none";
};


/* ================= FILTER BY CONDITION ================= */

function applyFilters(){

const selectedConditions = [...document.querySelectorAll(".condition:checked")]
.map(el => el.value);

if(selectedConditions.length === 0){
renderProducts(products);
return;
}

const filtered = products.filter(product =>
selectedConditions.includes(product.condition)
);

renderProducts(filtered);

}

document.querySelectorAll(".condition").forEach(filter=>{
filter.addEventListener("change",applyFilters);
});


/* ================= CLEAR FILTER ================= */

clearBtn.addEventListener("click",()=>{
document.querySelectorAll(".condition").forEach(c=>c.checked=false);
renderProducts(products);
});


/* ================= SEARCH ================= */

searchIcon.addEventListener("click",()=>{
searchInput.classList.toggle("active");
searchInput.focus();
});

searchInput.addEventListener("keyup",()=>{

const value = searchInput.value.toLowerCase();

const filtered = products.filter(product =>
product.product_name.toLowerCase().includes(value)
);

renderProducts(filtered);

});
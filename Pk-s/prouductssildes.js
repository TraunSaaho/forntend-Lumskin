/* ===== Navigation System ===== */

document.addEventListener("DOMContentLoaded", function () {

    const hamburger = document.querySelector(".hamburger");
    const navLinks = document.querySelector(".nav-links");
    const navbar = document.querySelector(".navbar");

    /* ================= MOBILE MENU ================= */

    if (hamburger) {
        hamburger.addEventListener("click", () => {
            hamburger.classList.toggle("active");
            navLinks.classList.toggle("active");
        });
    }

    /* ================= SCROLL EFFECT ================= */

    window.addEventListener("scroll", () => {
        if (window.scrollY > 50) {
            navbar.classList.add("active");
        } else {
            navbar.classList.remove("active");
        }
    });

    /* ================= ACTIVE PAGE HIGHLIGHT ================= */

    const currentPage = document.body.getAttribute("data-page");

    document.querySelectorAll(".nav-links a").forEach(link => {
        const linkPage = link.getAttribute("data-link");

        if (linkPage === currentPage) {
            link.classList.add("active");
        }
    });

});

   /* ================= SLIDER ================= */

let nextButton = document.getElementById('next');
let prevButton = document.getElementById('prev');
let carousel = document.querySelector('.carousel');
let listHTML = document.querySelector('.carousel .list');

let unAcceppClick;

const showSlider = (type) => {
    nextButton.style.pointerEvents = 'none';
    prevButton.style.pointerEvents = 'none';

    carousel.classList.remove('next', 'prev');
    let items = listHTML.querySelectorAll('.item');

    if(type === 'next'){
        listHTML.appendChild(items[0]);
        carousel.classList.add('next');
    }else{
        listHTML.prepend(items[items.length - 1]);
        carousel.classList.add('prev');
    }

    clearTimeout(unAcceppClick);
    unAcceppClick = setTimeout(()=>{
        nextButton.style.pointerEvents = 'auto';
        prevButton.style.pointerEvents = 'auto';
    }, 1200);
};

nextButton.onclick = function(){
    showSlider('next');
};

prevButton.onclick = function(){
    showSlider('prev');
};


/* ================= AUTO SCROLL ================= */

let autoScroll = setInterval(() => {
    showSlider('next');
}, 3500);


/* ================= SLIDER End  ================= */
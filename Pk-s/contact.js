/*  Navigation bar starts */

/* ===== Navigation ===== */

const hamburger = document.querySelector(".hamburger");
const navLinks = document.querySelector(".nav-links");
const navbar = document.querySelector(".navbar");

/* Mobile Menu Toggle */
hamburger.addEventListener("click", () => {
    hamburger.classList.toggle("active");
    navLinks.classList.toggle("active");
});

/* Hover Black Strip */
navbar.addEventListener("mouseenter", () => {
    navbar.classList.add("active");
});

navbar.addEventListener("mouseleave", () => {
    if (window.scrollY < 50) {
        navbar.classList.remove("active");
    }
});

/* Scroll Effect */
window.addEventListener("scroll", () => {
    if (window.scrollY > 50) {
        navbar.classList.add("active");
    } else {
        navbar.classList.remove("active");
    }
});

/* Active Page Highlight */
const currentPage = document.body.getAttribute("data-page");

document.querySelectorAll(".nav-links a").forEach(link => {
    if (link.dataset.link === currentPage) {
        link.classList.add("active");
    }
});


/* Nava bar end  */


/* Senode   silde  */

const cards = document.querySelectorAll(".contact-card");

cards.forEach(card => {

  /* Bring clicked card to front */
  card.addEventListener("mouseenter", () => {
    cards.forEach(c => c.style.zIndex = "1");
    card.style.zIndex = "20";
  });

  /* Press effect */
  card.addEventListener("mousedown", () => {
    card.style.transform = "scale(1.08)";
  });

  card.addEventListener("mouseup", () => {
    card.style.transform = "scale(1.05)";
  });

  card.addEventListener("mouseleave", () => {
    card.style.transform = "scale(1)";
  });

});


/* Senode   silde  End  */



/* Thrid   silde  stareds*/

document.addEventListener("DOMContentLoaded", function () {

  const counters = document.querySelectorAll(".counter");

  counters.forEach(counter => {
    const target = +counter.getAttribute("data-target");
    let count = 0;
    const speed = target / 100;

    function updateCounter() {
      if (count < target) {
        count += speed;
        counter.innerText = Math.floor(count);
        setTimeout(updateCounter, 20);
      } else {
        if (target === 1000000) {
          counter.innerText = "1M+";
        } else {
          counter.innerText = "50K+";
        }
      }
    }

    updateCounter();
  });

});







/*  sixth silde 6th stared   */
// Subscribe Button Click Effect
const subscribeBtn = document.querySelector(".subscribe-box button");

subscribeBtn.addEventListener("click", () => {
    subscribeBtn.innerText = "Subscribed ✓";
    subscribeBtn.style.background = "#28a745";
});


// Subscribe Button Click Effect + Email Validation

const form = document.getElementById("subscribeForm");
const emailInput = document.getElementById("emailInput");
const message = document.getElementById("emailMessage");
const subscribeBtn = form.querySelector("button");

form.addEventListener("submit", function(e) {
    e.preventDefault();

    const emailValue = emailInput.value.trim();

    if (emailValue === "") {
        message.style.color = "red";
        message.innerText = "Please enter a valid email address.";
        return;
    }

    // Basic email pattern check
    const emailPattern = /^[^ ]+@[^ ]+\.[a-z]{2,3}$/;

    if (!emailValue.match(emailPattern)) {
        message.style.color = "red";
        message.innerText = "Invalid email format.";
        return;
    }

    // Success state
    subscribeBtn.innerText = "Subscribed ✓";
    subscribeBtn.style.background = "#28a745";
    message.style.color = "#28a745";
    message.innerText = "Thank you for subscribing!";
    
    emailInput.value = "";
});

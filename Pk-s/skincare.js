document.addEventListener("DOMContentLoaded", function () {

  /* ================= NAVIGATION ================= */

  const hamburger = document.querySelector(".hamburger");
  const navLinks = document.querySelector(".nav-links");
  const navbar = document.querySelector(".navbar");

  if (hamburger && navLinks) {
    hamburger.addEventListener("click", () => {
      hamburger.classList.toggle("active");
      navLinks.classList.toggle("active");
    });
  }

  window.addEventListener("scroll", () => {
    if (navbar) {
      navbar.classList.toggle("active", window.scrollY > 50);
    }
  });

  /* ================= PRODUCT CARDS ANIMATION ================= */

  const cards = document.querySelectorAll(".product-card");

  if (cards.length > 0 && "IntersectionObserver" in window) {

    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.style.opacity = "1";
          entry.target.style.transform = "translateY(0)";
        }
      });
    }, { threshold: 0.3 });

    cards.forEach(card => {
      observer.observe(card);

      card.addEventListener("mousemove", (e) => {
        const rect = card.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;

        const rotateX = (y - rect.height / 2) / 15;
        const rotateY = (rect.width / 2 - x) / 15;

        card.style.transform =
          `rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale(1.05)`;
      });

      card.addEventListener("mouseleave", () => {
        card.style.transform = "translateY(0) scale(1)";
      });
    });
  }

  /* ================= TESTIMONIAL SLIDER ================= */

  const textEl = document.getElementById("testimonialText");

  if (textEl) {

    const testimonials = [
      {
        text: "I've tried countless moisturizers, but this one is a game-changer!",
        name: "Emilia Murray",
        image: "deppit.png"
      },
      {
        text: "Absolutely love the texture! It absorbs quickly.",
        name: "Ram",
        image: ""
      },
      {
        text: "The facial detox kit made a huge difference.",
        name: "Hasini",
        image: "haishi.png"
      }
    ];

    let current = 0;

    const nameEl = document.getElementById("userName");
    const imageEl = document.getElementById("userImage");
    const dotsContainer = document.getElementById("dotsContainer");
    const nextBtn = document.getElementById("nextBtn");
    const prevBtn = document.getElementById("prevBtn");

    function updateTestimonial(index) {
      if (!nameEl || !imageEl) return;
      textEl.textContent = testimonials[index].text;
      nameEl.textContent = testimonials[index].name;
      imageEl.src = testimonials[index].image;
      updateDots(index);
    }

    function createDots() {
      if (!dotsContainer) return;
      testimonials.forEach((_, index) => {
        const dot = document.createElement("span");
        dot.addEventListener("click", () => {
          current = index;
          updateTestimonial(current);
        });
        dotsContainer.appendChild(dot);
      });
    }

    function updateDots(index) {
      if (!dotsContainer) return;
      const dots = dotsContainer.querySelectorAll("span");
      dots.forEach(dot => dot.classList.remove("active"));
      if (dots[index]) dots[index].classList.add("active");
    }

    if (nextBtn) {
      nextBtn.addEventListener("click", () => {
        current = (current + 1) % testimonials.length;
        updateTestimonial(current);
      });
    }

    if (prevBtn) {
      prevBtn.addEventListener("click", () => {
        current = (current - 1 + testimonials.length) % testimonials.length;
        updateTestimonial(current);
      });
    }

    createDots();
    updateTestimonial(current);
  }

  /* ================= BEFORE / AFTER ================= */

  const compare = document.getElementById("compare");
  const beforeImg = document.getElementById("beforeImg");
  const afterImg = document.getElementById("afterImg");

  if (compare && beforeImg && afterImg) {
    compare.addEventListener("mousemove", (e) => {
      const rect = compare.getBoundingClientRect();
      const position = e.clientX - rect.left;
      const middle = rect.width / 2;

      beforeImg.style.opacity = position < middle ? "1" : "0";
      afterImg.style.opacity = position < middle ? "0" : "1";
    });
  }

  /* ================= SUBSCRIBE FORM ================= */

  const form = document.getElementById("subscribeForm");

  if (form) {

    const emailInput = document.getElementById("emailInput");
    const message = document.getElementById("emailMessage");
    const button = form.querySelector("button");

    form.addEventListener("submit", function(e) {
      e.preventDefault();

      if (!emailInput) return;

      const emailValue = emailInput.value.trim();

      const emailPattern = /^[^ ]+@[^ ]+\.[a-z]{2,3}$/;

      if (!emailPattern.test(emailValue)) {
        if (message) {
          message.style.color = "red";
          message.innerText = "Invalid email format.";
        }
        return;
      }

      if (button) {
        button.innerText = "Subscribed ✓";
        button.style.background = "#28a745";
      }

      if (message) {
        message.style.color = "#28a745";
        message.innerText = "Thank you for subscribing!";
      }

      emailInput.value = "";
    });
  }

});
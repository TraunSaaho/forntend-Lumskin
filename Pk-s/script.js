/* ======================================================
   LUMISKIN MAIN JAVASCRIPT
   Clean • Error Safe • Production Ready
====================================================== */


document.addEventListener("DOMContentLoaded", function () {

    /* ======================================================
       NAVIGATION SYSTEM
    ====================================================== */

    const hamburger = document.querySelector(".hamburger");
    const navLinks = document.querySelector(".nav-links");
    const navbar = document.querySelector(".navbar");

    // ===== MOBILE MENU =====
    if (hamburger && navLinks) {
        hamburger.addEventListener("click", () => {
            hamburger.classList.toggle("active");
            navLinks.classList.toggle("active");
        });
    }

    // ===== SCROLL EFFECT =====
    if (navbar) {
        window.addEventListener("scroll", () => {
            if (window.scrollY > 50) {
                navbar.classList.add("active");
            } else {
                navbar.classList.remove("active");
            }
        });
    }

    const searchInput = document.querySelector(".search-input");

searchInput.addEventListener("keyup", function(e){

    if(e.key === "Enter"){

        const query = searchInput.value;

        alert("Searching for: " + query);

    }

});


const profileIcon = document.getElementById("profileIcon");
const profileMenu = document.getElementById("profileMenu");
const logoutBtn = document.getElementById("logoutBtn");

/* open dropdown */

profileIcon.onclick = function(){

if(profileMenu.style.display === "block"){
profileMenu.style.display = "none";
}else{
profileMenu.style.display = "block";
}

};

/* logout */

logoutBtn.onclick = function(){
    window.firebaseSignOut().then(() => {
        window.location.href = "Login/login.html";
    }).catch((error) => {
        console.error("Sign out error:", error);
        // Fallback: clear session and redirect
        sessionStorage.removeItem('lumiskinUser');
        localStorage.removeItem('lumiskinUserEmail');
        window.location.href = "Login/login.html";
    });
};

/* CLOSE DROPDOWN WHEN CLICKING OUTSIDE */

document.addEventListener("click", function(event){

const profileBox = document.querySelector(".profile-box");

if(!profileBox.contains(event.target)){
profileMenu.style.display = "none";
}

});

    // ===== ACTIVE PAGE HIGHLIGHT =====
    const currentPage = document.body.getAttribute("data-page");

    if (currentPage) {
        document.querySelectorAll(".nav-links a").forEach(link => {
            const linkPage = link.getAttribute("data-link");

            if (linkPage === currentPage) {
                link.classList.add("active");
            }
        });
    }

    /* ======================================================
       AI SECTION FADE ANIMATION
    ====================================================== */

    const aiSection = document.querySelector(".ai-section");

    if (aiSection) {
        window.addEventListener("scroll", () => {
            const position = aiSection.getBoundingClientRect().top;
            const screenPosition = window.innerHeight / 1.3;

            if (position < screenPosition) {
                aiSection.style.opacity = "1";
                aiSection.style.transform = "translateY(0)";
            }
        });
    }

    /* ======================================================
       TAG IMAGE AUTO SLIDER
    ====================================================== */

    const tags = document.querySelectorAll(".tag");
    const skinImage = document.getElementById("skinImage");

    if (tags.length > 0 && skinImage) {

        let currentIndex = 0;
        const autoChangeTime = 3000;

        function changeTag(index) {
            tags.forEach(tag => tag.classList.remove("active"));
            tags[index].classList.add("active");

            const newImage = tags[index].getAttribute("data-image");

            skinImage.style.opacity = 0;

            setTimeout(() => {
                skinImage.src = newImage;
                skinImage.style.opacity = 1;
            }, 300);
        }

        tags.forEach((tag, index) => {
            tag.addEventListener("click", () => {
                currentIndex = index;
                changeTag(currentIndex);
            });
        });

        setInterval(() => {
            currentIndex++;
            if (currentIndex >= tags.length) {
                currentIndex = 0;
            }
            changeTag(currentIndex);
        }, autoChangeTime);
    }

    /* ======================================================
       DESCRIPTION TOGGLE
    ====================================================== */

    const descToggle = document.getElementById("descToggle");
    const descContent = document.getElementById("descContent");

    if (descToggle && descContent) {
        descToggle.addEventListener("click", () => {
            descContent.classList.toggle("active");
        });
    }

    const descriptionTab = document.getElementById("descriptionTab");
    const descriptionPanel = document.getElementById("descriptionPanel");

    if (descriptionTab && descriptionPanel) {
        descriptionTab.addEventListener("click", () => {
            descriptionPanel.classList.toggle("active");
        });
    }

    /* ======================================================
       NEWSLETTER SUBSCRIBE (Validation + Success)
    ====================================================== */

    const form = document.getElementById("subscribeForm");

    if (form) {

        const emailInput = form.querySelector("input[type='email']");
        const message = document.getElementById("emailMessage");
        const subscribeBtn = form.querySelector("button");

        form.addEventListener("submit", function (e) {
            e.preventDefault();

            const emailValue = emailInput.value.trim();

            if (emailValue === "") {
                if (message) {
                    message.style.color = "red";
                    message.innerText = "Please enter a valid email address.";
                }
                return;
            }

            const emailPattern = /^[^ ]+@[^ ]+\.[a-z]{2,}$/;

            if (!emailValue.match(emailPattern)) {
                if (message) {
                    message.style.color = "red";
                    message.innerText = "Invalid email format.";
                }
                return;
            }

            // Success
            subscribeBtn.innerText = "Subscribed ✓";
            subscribeBtn.style.background = "#28a745";

            if (message) {
                message.style.color = "#28a745";
                message.innerText = "Thank you for subscribing!";
            }

            emailInput.value = "";
        });
    }

});



// Highlight Active Navbar Link Automatically

const currentPage = window.location.pathname.split("/").pop();
const navLinks = document.querySelectorAll(".nav-links a");

navLinks.forEach(link => {
    const linkPage = link.getAttribute("href");

    if (linkPage === currentPage) {
        link.classList.add("active");
    }
});

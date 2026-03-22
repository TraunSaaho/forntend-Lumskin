/* Reveal animation for Aspiration section */

const aspirationSection = document.querySelector(".aspiration-section");

const aspirationObserver = new IntersectionObserver(entries => {
    entries.forEach(entry => {
        if(entry.isIntersecting){
            entry.target.classList.add("visible");
        }
    });
}, { threshold: 0.3 });

aspirationObserver.observe(aspirationSection);


/* 3rd silde stres  */


const counters = document.querySelectorAll('.stat-number');
let activated = false;

window.addEventListener("scroll", () => {

    const section = document.querySelector(".stats-section");
    const sectionTop = section.getBoundingClientRect().top;
    const screenHeight = window.innerHeight;

    if(sectionTop < screenHeight - 100 && !activated){
        counters.forEach(counter => {

            const target = +counter.getAttribute("data-target");
            const increment = target / 100;

            let count = 0;

            const updateCount = () => {
                if(count < target){
                    count += increment;
                    counter.innerText = Math.ceil(count);
                    setTimeout(updateCount, 15);
                } else {
                    counter.innerText = counter.innerText.includes('%')
                        ? target + "%"
                        : counter.innerText.includes('M')
                        ? "2M+"
                        : counter.innerText.includes('K')
                        ? "150K+"
                        : target + "+";
                }
            };

            updateCount();
        });

        activated = true;
    }
});


/* 3rd silde end   */



/* 4th silde stared  */


/* 5th silde stared  desition  */



const descriptionTab = document.getElementById("descriptionTab");
const descriptionPanel = document.getElementById("descriptionPanel");

descriptionTab.addEventListener("click", () => {
    descriptionPanel.classList.toggle("active");
});



/* 5th silde End desition   */



/* 6th silde stared  jounety  stared  */


document.querySelectorAll(".timeline-card").forEach(card => {

  card.addEventListener("mousedown", () => {
    card.style.transform = "scale(1.08)";
    card.style.boxShadow = "0 30px 70px rgba(0,0,0,0.2)";
  });

  card.addEventListener("mouseup", () => {
    card.style.transform = "scale(1.05)";
    card.style.boxShadow = "0 25px 60px rgba(0,0,0,0.15)";
  });

  card.addEventListener("mouseleave", () => {
    card.style.transform = "scale(1)";
    card.style.boxShadow = "0 15px 35px rgba(0,0,0,0.08)";
  });

});



/* lighting  */


.timeline-card {
  background: 
    linear-gradient(rgba(255,255,255,0.85), rgba(255,255,255,0.9)),
    url("images/card-texture.jpg") center/cover no-repeat;

  padding: 28px 35px;
  border-radius: 20px;
  backdrop-filter: blur(8px);
  box-shadow: 0 15px 35px rgba(0, 0, 0, 0.08);
  transition: all 0.4s ease;
  cursor: pointer;
}


/* lighting  */


/* 6th silde  end */



/* 7th silde stared */


document.querySelectorAll(".team-card").forEach(card => {

  card.addEventListener("mousedown", () => {
    card.style.transform = "scale(1.08)";
    card.style.boxShadow = "0 35px 80px rgba(0,0,0,0.2)";
  });

  card.addEventListener("mouseup", () => {
    card.style.transform = "scale(1.05)";
    card.style.boxShadow = "0 30px 60px rgba(0,0,0,0.15)";
  });

  card.addEventListener("mouseleave", () => {
    card.style.transform = "scale(1)";
    card.style.boxShadow = "0 20px 40px rgba(0,0,0,0.08)";
  });

});


/* 7th silde End  */

/* 8th silde satred */

const ctaCard = document.querySelector(".cta-card");
const ctaBtn = document.querySelector(".cta-btn");

/* CARD PRESS */
ctaCard.addEventListener("mousedown", () => {
  ctaCard.style.transform = "scale(1.04)";
  ctaCard.style.boxShadow = "0 50px 100px rgba(0,0,0,0.2)";
});

ctaCard.addEventListener("mouseup", () => {
  ctaCard.style.transform = "scale(1.02)";
  ctaCard.style.boxShadow = "0 40px 80px rgba(0,0,0,0.12)";
});

ctaCard.addEventListener("mouseleave", () => {
  ctaCard.style.transform = "scale(1)";
  ctaCard.style.boxShadow = "0 30px 60px rgba(0,0,0,0.08)";
});

/* BUTTON PRESS */
ctaBtn.addEventListener("mousedown", () => {
  ctaBtn.style.transform = "scale(0.95)";
  ctaBtn.style.boxShadow = "0 10px 20px rgba(165, 180, 252, 0.5)";
});

ctaBtn.addEventListener("mouseup", () => {
  ctaBtn.style.transform = "scale(1.05)";
});

ctaBtn.addEventListener("mouseleave", () => {
  ctaBtn.style.transform = "scale(1)";
});


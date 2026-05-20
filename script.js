(function () {
  const body = document.body;
  const siteHeader = document.querySelector(".site-header");
  const menuToggle = document.getElementById("menuToggle");
  const navPanel = document.getElementById("navPanel");
  const themeToggle = document.getElementById("themeToggle");
  const themeIcon = themeToggle ? themeToggle.querySelector("i") : null;

  function setTheme(theme) {
    if (theme === "dark") {
      body.classList.add("dark-theme");
      if (themeIcon) {
        themeIcon.classList.remove("fa-moon");
        themeIcon.classList.add("fa-sun");
      }
    } else {
      body.classList.remove("dark-theme");
      if (themeIcon) {
        themeIcon.classList.remove("fa-sun");
        themeIcon.classList.add("fa-moon");
      }
    }
    localStorage.setItem("mkay-theme", theme);
  }

  const savedTheme = localStorage.getItem("mkay-theme");
  setTheme(savedTheme === "dark" ? "dark" : "light");

  if (themeToggle) {
    themeToggle.addEventListener("click", function () {
      const nextTheme = body.classList.contains("dark-theme") ? "light" : "dark";
      setTheme(nextTheme);
    });
  }

  if (menuToggle && navPanel) {
    menuToggle.addEventListener("click", function () {
      const isOpen = navPanel.classList.toggle("open");
      menuToggle.setAttribute("aria-expanded", String(isOpen));
    });

    navPanel.querySelectorAll("a").forEach(function (link) {
      link.addEventListener("click", function () {
        navPanel.classList.remove("open");
        menuToggle.setAttribute("aria-expanded", "false");
      });
    });
  }

  window.addEventListener("scroll", function () {
    if (window.scrollY > 40) {
      siteHeader.classList.add("scrolled");
    } else {
      siteHeader.classList.remove("scrolled");
    }
  });

  const revealElements = document.querySelectorAll(".reveal");
  const revealObserver = new IntersectionObserver(
    function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add("active");
          revealObserver.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.16 }
  );

  revealElements.forEach(function (el) {
    revealObserver.observe(el);
  });

  function initApartmentSliders() {
    const sliders = document.querySelectorAll("[data-slider]");
    sliders.forEach(function (slider) {
      const track = slider.querySelector(".slider-track");
      const slides = Array.from(track.querySelectorAll("img"));
      const prevBtn = slider.querySelector("[data-prev]");
      const nextBtn = slider.querySelector("[data-next]");
      let index = 0;

      function updateSlidePosition() {
        track.style.transform = "translateX(-" + index * 100 + "%)";
      }

      if (prevBtn) {
        prevBtn.addEventListener("click", function () {
          index = (index - 1 + slides.length) % slides.length;
          updateSlidePosition();
        });
      }

      if (nextBtn) {
        nextBtn.addEventListener("click", function () {
          index = (index + 1) % slides.length;
          updateSlidePosition();
        });
      }

      setInterval(function () {
        index = (index + 1) % slides.length;
        updateSlidePosition();
      }, 5500);
    });
  }

  function initCounters() {
    const counters = document.querySelectorAll(".counter");
    let hasRun = false;
    const counterObserver = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting && !hasRun) {
            counters.forEach(function (counter) {
              const target = Number(counter.dataset.target || 0);
              const increment = Math.max(1, Math.ceil(target / 70));
              let value = 0;
              const timer = setInterval(function () {
                value += increment;
                if (value >= target) {
                  counter.textContent = String(target);
                  clearInterval(timer);
                  return;
                }
                counter.textContent = String(value);
              }, 24);
            });
            hasRun = true;
            counterObserver.disconnect();
          }
        });
      },
      { threshold: 0.3 }
    );

    if (counters.length > 0) {
      counterObserver.observe(counters[0]);
    }
  }

  function initTestimonials() {
    const track = document.getElementById("testimonialTrack");
    const prev = document.getElementById("testimonialPrev");
    const next = document.getElementById("testimonialNext");
    if (!track) return;

    const cards = Array.from(track.children);
    let index = 0;

    function render() {
      track.style.transform = "translateX(-" + index * 100 + "%)";
    }

    if (prev) {
      prev.addEventListener("click", function () {
        index = (index - 1 + cards.length) % cards.length;
        render();
      });
    }

    if (next) {
      next.addEventListener("click", function () {
        index = (index + 1) % cards.length;
        render();
      });
    }

    setInterval(function () {
      index = (index + 1) % cards.length;
      render();
    }, 7000);
  }

  function initFaqAccordion() {
    const items = document.querySelectorAll(".faq-item");
    items.forEach(function (item) {
      const question = item.querySelector(".faq-question");
      const answer = item.querySelector(".faq-answer");
      if (!question || !answer) return;

      question.addEventListener("click", function () {
        const isActive = item.classList.contains("active");

        items.forEach(function (it) {
          it.classList.remove("active");
          const panel = it.querySelector(".faq-answer");
          if (panel) panel.style.maxHeight = null;
        });

        if (!isActive) {
          item.classList.add("active");
          answer.style.maxHeight = answer.scrollHeight + "px";
        }
      });
    });
  }

  function initLightbox() {
    const lightbox = document.getElementById("lightbox");
    const lightboxImage = document.getElementById("lightboxImage");
    const lightboxCaption = document.getElementById("lightboxCaption");
    const closeBtn = document.getElementById("lightboxClose");
    const prevBtn = document.getElementById("lightboxPrev");
    const nextBtn = document.getElementById("lightboxNext");
    const items = Array.from(document.querySelectorAll(".gallery-item"));

    if (!lightbox || !lightboxImage || !lightboxCaption || items.length === 0) return;
    let currentIndex = 0;

    function openAt(index) {
      const item = items[index];
      const img = item.querySelector("img");
      const caption = item.querySelector("figcaption");
      if (!img) return;
      currentIndex = index;
      lightboxImage.src = img.src;
      lightboxImage.alt = img.alt;
      lightboxCaption.textContent = caption ? caption.textContent : "";
      lightbox.classList.add("active");
      lightbox.setAttribute("aria-hidden", "false");
      body.style.overflow = "hidden";
    }

    function close() {
      lightbox.classList.remove("active");
      lightbox.setAttribute("aria-hidden", "true");
      body.style.overflow = "";
    }

    items.forEach(function (item, index) {
      item.addEventListener("click", function () {
        openAt(index);
      });
    });

    if (closeBtn) closeBtn.addEventListener("click", close);

    if (prevBtn) {
      prevBtn.addEventListener("click", function () {
        openAt((currentIndex - 1 + items.length) % items.length);
      });
    }

    if (nextBtn) {
      nextBtn.addEventListener("click", function () {
        openAt((currentIndex + 1) % items.length);
      });
    }

    lightbox.addEventListener("click", function (event) {
      if (event.target === lightbox) {
        close();
      }
    });

    document.addEventListener("keydown", function (event) {
      if (!lightbox.classList.contains("active")) return;
      if (event.key === "Escape") close();
      if (event.key === "ArrowLeft") openAt((currentIndex - 1 + items.length) % items.length);
      if (event.key === "ArrowRight") openAt((currentIndex + 1) % items.length);
    });
  }

  function setDateMinValues() {
    const checkIn = document.getElementById("checkin");
    const checkOut = document.getElementById("checkout");
    if (!checkIn || !checkOut) return;

    const now = new Date();
    const isoToday = now.toISOString().split("T")[0];
    checkIn.min = isoToday;
    checkOut.min = isoToday;

    checkIn.addEventListener("change", function () {
      checkOut.min = checkIn.value || isoToday;
      if (checkOut.value && checkOut.value < checkIn.value) {
        checkOut.value = checkIn.value;
      }
    });
  }

  function initBookingForms() {
    const bookingForm = document.getElementById("bookingForm");
    const contactForm = document.getElementById("contactForm");
    const whatsappBase = "https://wa.me/260764336304?text=";

    if (bookingForm) {
      bookingForm.addEventListener("submit", function (event) {
        event.preventDefault();
        const data = new FormData(bookingForm);
        const message = [
          "Hello M KAY APARTMENTS LTD, I would like to reserve an apartment.",
          "Name: " + (data.get("name") || ""),
          "Phone: " + (data.get("phone") || ""),
          "Email: " + (data.get("email") || "Not provided"),
          "Apartment: " + (data.get("apartment") || ""),
          "Guests: " + (data.get("guests") || ""),
          "Check-in: " + (data.get("checkin") || ""),
          "Check-out: " + (data.get("checkout") || ""),
          "Special Request: " + (data.get("request") || "None")
        ].join("\n");

        window.open(whatsappBase + encodeURIComponent(message), "_blank", "noopener");
      });
    }

    if (contactForm) {
      contactForm.addEventListener("submit", function (event) {
        event.preventDefault();
        const data = new FormData(contactForm);
        const message = [
          "Hello M KAY APARTMENTS LTD, I have an inquiry.",
          "Name: " + (data.get("name") || ""),
          "Phone: " + (data.get("phone") || ""),
          "Message: " + (data.get("message") || "")
        ].join("\n");

        window.open(whatsappBase + encodeURIComponent(message), "_blank", "noopener");
      });
    }
  }

  function setFooterYear() {
    const yearNode = document.getElementById("year");
    if (yearNode) {
      yearNode.textContent = String(new Date().getFullYear());
    }
  }

  initApartmentSliders();
  initCounters();
  initTestimonials();
  initFaqAccordion();
  initLightbox();
  setDateMinValues();
  initBookingForms();
  setFooterYear();
})();

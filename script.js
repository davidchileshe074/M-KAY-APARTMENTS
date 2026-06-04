(function () {
  // Prevent browser from restoring previous scroll position on reload
  if ('scrollRestoration' in history) {
    history.scrollRestoration = 'manual';
  }

  const body = document.body;
  const siteHeader = document.querySelector(".site-header");
  const menuToggle = document.getElementById("menuToggle");
  const navPanel = document.getElementById("navPanel");
  const themeToggle = document.getElementById("themeToggle");
  const themeIcon = themeToggle ? themeToggle.querySelector("i") : null;

  function setTheme(theme) {
    const isDark = theme === "dark";
    body.classList.toggle("dark-theme", isDark);
    if (themeIcon) {
      themeIcon.classList.toggle("fa-moon", !isDark);
      themeIcon.classList.toggle("fa-sun", isDark);
    }
    localStorage.setItem("mkay-theme", isDark ? "dark" : "light");
  }

  setTheme(localStorage.getItem("mkay-theme") === "dark" ? "dark" : "light");

  if (themeToggle) {
    themeToggle.addEventListener("click", function () {
      setTheme(body.classList.contains("dark-theme") ? "light" : "dark");
    });
  }

  if (menuToggle && navPanel) {
    const setNavOpen = (open) => {
      navPanel.classList.toggle("open", open);
      menuToggle.classList.toggle("open", open);
      menuToggle.setAttribute("aria-expanded", String(Boolean(open)));
      navPanel.setAttribute("aria-hidden", String(!open));
    };

    const toggleNav = (ev) => {
      if (ev) {
        if (ev.stopPropagation) ev.stopPropagation();
        if (ev.preventDefault && ev.cancelable) ev.preventDefault();
      }
      const isOpen = navPanel.classList.contains("open");
      setNavOpen(!isOpen);
    };

    menuToggle.addEventListener("click", toggleNav);
    menuToggle.addEventListener("keydown", (e) => {
      if (e.key === "Enter" || e.key === " ") toggleNav(e);
    });

    // Close when a nav link is clicked
    navPanel.querySelectorAll("a").forEach(function (link) {
      link.addEventListener("click", function () {
        setNavOpen(false);
      });
    });

    // Close when clicking outside the panel
    document.addEventListener("click", function (e) {
      if (!navPanel.classList.contains("open")) return;
      if (!navPanel.contains(e.target) && !menuToggle.contains(e.target)) {
        setNavOpen(false);
      }
    });

    // Close on Escape
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape" && navPanel.classList.contains("open")) {
        setNavOpen(false);
        menuToggle.focus();
      }
    });

    // Initialize accessibility state
    menuToggle.setAttribute("aria-expanded", menuToggle.getAttribute("aria-expanded") || "false");
    navPanel.setAttribute("aria-hidden", String(!navPanel.classList.contains("open")));
  }

  window.addEventListener("scroll", function () {
    if (siteHeader) {
      siteHeader.classList.toggle("scrolled", window.scrollY > 40);
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
    document.querySelectorAll("[data-slider]").forEach(function (slider) {
      const track = slider.querySelector(".slider-track");
      const slides = Array.from(track ? track.querySelectorAll("img") : []);
      const prevBtn = slider.querySelector("[data-prev]");
      const nextBtn = slider.querySelector("[data-next]");
      let index = 0;

      if (!track || slides.length === 0) return;

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
    if (!counters.length) return;

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

    counterObserver.observe(counters[0]);
  }

  function initTestimonials() {
    const track = document.getElementById("testimonialTrack");
    const prev = document.getElementById("testimonialPrev");
    const next = document.getElementById("testimonialNext");
    if (!track) return;

    let index = 0;

    function render() {
      const cards = Array.from(track.children);
      if (!cards.length) return;
      const safeIndex = ((index % cards.length) + cards.length) % cards.length;
      index = safeIndex;
      track.style.transform = "translateX(-" + safeIndex * 100 + "%)";
    }

    if (prev) {
      prev.addEventListener("click", function () {
        const cards = Array.from(track.children);
        if (!cards.length) return;
        index = (index - 1 + cards.length) % cards.length;
        render();
      });
    }

    if (next) {
      next.addEventListener("click", function () {
        const cards = Array.from(track.children);
        if (!cards.length) return;
        index = (index + 1) % cards.length;
        render();
      });
    }

    setInterval(function () {
      const cards = Array.from(track.children);
      if (!cards.length) return;
      index = (index + 1) % cards.length;
      render();
    }, 7000);
  }

  function initFaqAccordion() {
    const faqList = document.querySelector("#faq .faq-list");
    if (!faqList || document.body.dataset.faqBound === "true") return;
    document.body.dataset.faqBound = "true";

    faqList.addEventListener("click", function (event) {
      const question = event.target.closest(".faq-question");
      if (!question) return;
      const item = question.closest(".faq-item");
      const answer = item?.querySelector(".faq-answer");
      if (!item || !answer) return;
      const isActive = item.classList.contains("active");

      faqList.querySelectorAll(".faq-item.active").forEach(function (activeItem) {
        activeItem.classList.remove("active");
        const panel = activeItem.querySelector(".faq-answer");
        if (panel) panel.style.maxHeight = null;
      });

      if (!isActive) {
        item.classList.add("active");
        answer.style.maxHeight = answer.scrollHeight + "px";
      }
    });
  }

  function initLightbox() {
    const lightbox = document.getElementById("lightbox");
    const lightboxImage = document.getElementById("lightboxImage");
    const lightboxCaption = document.getElementById("lightboxCaption");
    const closeBtn = document.getElementById("lightboxClose");
    const prevBtn = document.getElementById("lightboxPrev");
    const nextBtn = document.getElementById("lightboxNext");
    const galleryGrid = document.querySelector("#gallery .gallery-grid");

    if (!lightbox || !lightboxImage || !lightboxCaption || !galleryGrid) return;
    if (document.body.dataset.lightboxBound === "true") return;
    document.body.dataset.lightboxBound = "true";

    let currentIndex = 0;

    function openAt(index) {
      const items = Array.from(galleryGrid.querySelectorAll(".gallery-item"));
      if (!items.length) return;
      const safeIndex = ((index % items.length) + items.length) % items.length;
      const item = items[safeIndex];
      const img = item.querySelector("img");
      const caption = item.querySelector("figcaption");
      if (!img) return;

      currentIndex = safeIndex;
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

    galleryGrid.addEventListener("click", function (event) {
      const item = event.target.closest(".gallery-item");
      if (!item || !galleryGrid.contains(item)) return;
      const items = Array.from(galleryGrid.querySelectorAll(".gallery-item"));
      const index = items.indexOf(item);
      if (index !== -1) openAt(index);
    });

    if (closeBtn) closeBtn.addEventListener("click", close);
    if (prevBtn) prevBtn.addEventListener("click", function () {
      const items = Array.from(galleryGrid.querySelectorAll(".gallery-item"));
      if (!items.length) return;
      openAt((currentIndex - 1 + items.length) % items.length);
    });
    if (nextBtn) nextBtn.addEventListener("click", function () {
      const items = Array.from(galleryGrid.querySelectorAll(".gallery-item"));
      if (!items.length) return;
      openAt((currentIndex + 1) % items.length);
    });

    lightbox.addEventListener("click", function (event) {
      if (event.target === lightbox) close();
    });

    document.addEventListener("keydown", function (event) {
      if (!lightbox.classList.contains("active")) return;
      const items = Array.from(galleryGrid.querySelectorAll(".gallery-item"));
      if (!items.length) return;
      if (event.key === "Escape") close();
      if (event.key === "ArrowLeft") openAt((currentIndex - 1 + items.length) % items.length);
      if (event.key === "ArrowRight") openAt((currentIndex + 1) % items.length);
    });
  }

  function setDateMinValues() {
    const checkIn = document.getElementById("checkin");
    const checkOut = document.getElementById("checkout");
    if (!checkIn || !checkOut) return;

    const today = new Date().toISOString().split("T")[0];
    checkIn.min = today;
    checkOut.min = today;

    checkIn.addEventListener("change", function () {
      checkOut.min = checkIn.value || today;
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
        const bookingPayload = {
          name: (data.get("name") || "").toString().trim(),
          phone: (data.get("phone") || "").toString().trim(),
          email: (data.get("email") || "").toString().trim(),
          apartment: (data.get("apartment") || "").toString().trim(),
          guests: (data.get("guests") || "").toString().trim(),
          checkin: (data.get("checkin") || "").toString().trim(),
          checkout: (data.get("checkout") || "").toString().trim(),
          request: (data.get("request") || "").toString().trim(),
          payment_method: (data.get("payment_method") || "").toString().trim(),
          status: "new"
        };
        const message = [
          "Hello M KAY APARTMENTS LTD, I would like to reserve an apartment.",
          "Name: " + (bookingPayload.name || ""),
          "Phone: " + (bookingPayload.phone || ""),
          "Email: " + (bookingPayload.email || "Not provided"),
          "Apartment: " + (bookingPayload.apartment || ""),
          "Guests: " + (bookingPayload.guests || ""),
          "Check-in: " + (bookingPayload.checkin || ""),
          "Check-out: " + (bookingPayload.checkout || ""),
          "Payment Method: " + (bookingPayload.payment_method || ""),
          "Special Request: " + (bookingPayload.request || "None")
        ].join("\n");

        getFirebaseApi().then(firebaseApi => {
          if (firebaseApi?.addBooking) {
            firebaseApi.addBooking(bookingPayload).catch(err => console.warn("Failed to save booking:", err));
          }
        });

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

  async function getFirebaseApi() {
    if (window.firebaseApi) return window.firebaseApi;
    if (window.firebaseApiReady) return await window.firebaseApiReady;
    return null;
  }

  async function updateFirebaseLoginState() {
    if (!hostEls.loginBtn) return;
    hostEls.loginBtn.disabled = true;
    hostEls.loginBtn.textContent = "Loading...";
    try {
      const firebaseApi = await getFirebaseApi();
      if (firebaseApi?.signInAdmin) {
        hostEls.loginBtn.disabled = false;
        hostEls.loginBtn.textContent = "Access";
        if (hostEls.loginError && hostEls.loginError.textContent === "Firebase Auth is not ready yet.") {
          showLoginError("");
        }
        return;
      }
      hostEls.loginBtn.textContent = "Access";
      if (window.firebaseInitStatus === "error") {
        showLoginError(window.firebaseInitError || "Firebase could not initialize. Check your config and refresh.");
      } else {
        showLoginError("");
      }
    } catch (err) {
      hostEls.loginBtn.textContent = "Access";
      showLoginError(window.firebaseInitError || err.message || "Firebase is still loading.");
    } finally {
      hostEls.loginBtn.disabled = false;
      if (!hostEls.loginBtn.textContent) hostEls.loginBtn.textContent = "Access";
    }
  }

  const yearNode = document.getElementById("year");
  if (yearNode) yearNode.textContent = String(new Date().getFullYear());

  initApartmentSliders();
  initCounters();
  initTestimonials();
  initFaqAccordion();
  initLightbox();
  setDateMinValues();
  initBookingForms();
  const DEFAULT_PAYMENT_METHODS = [
    {
      id: "mtn",
      name: "MTN Mobile Money",
      icon: "fa-solid fa-mobile-screen-button",
      image: "assets/payments-icons/mtn-new-logo.svg",
      enabled: true,
      details: "Send to MTN Mobile Money:\nMerchant Code / Number: +260 764336304\nName: M Kay Apartments Ltd"
    },
    {
      id: "airtel",
      name: "Airtel Money",
      icon: "fa-solid fa-mobile-screen-button",
      image: "assets/payments-icons/Airtel_logo-02.png",
      enabled: true,
      details: "Send to Airtel Money:\nNumber: +260 978176858\nName: Masozi Kamanga"
    },
    {
      id: "fnb",
      name: "FNB Bank Transfer",
      icon: "fa-solid fa-building-columns",
      image: "assets/payments-icons/FNB-Logo.png",
      enabled: true,
      details: "Bank: First National Bank (FNB)\nAccount: 62981726354\nBranch: Livingstone\nName: M KAY APARTMENTS LTD"
    },
    {
      id: "visa",
      name: "Visa",
      icon: "fa-brands fa-cc-visa",
      image: "assets/payments-icons/Visa_Inc-_idDUM8TcN7_1.png",
      enabled: true,
      details: "We will email/WhatsApp you a secure payment link to pay with your Visa card."
    },
    {
      id: "mastercard",
      name: "Mastercard",
      icon: "fa-brands fa-cc-mastercard",
      image: "assets/payments-icons/Mastercard_Symbol_0.svg",
      enabled: true,
      details: "We will email/WhatsApp you a secure payment link to pay with your Mastercard."
    },
    {
      id: "cash",
      name: "Cash on Arrival",
      icon: "fa-solid fa-money-bill-wave",
      enabled: true,
      details: "Pay cash in Zambian Kwacha (K) or USD upon arrival at check-in."
    }
  ];

  const PUBLIC_GALLERY_FALLBACK = Array.from(document.querySelectorAll("#gallery .gallery-item")).map(item => {
    const img = item.querySelector("img");
    const caption = item.querySelector("figcaption");
    return {
      src: img?.getAttribute("src") || "",
      alt: img?.getAttribute("alt") || "Gallery image",
      caption: caption?.textContent || ""
    };
  }).filter(photo => photo.src);

  const bookingCalendar = {
    year: new Date().getFullYear(),
    month: new Date().getMonth()
  };

  const bookingSelection = {
    start: null,
    end: null
  };

  const DEFAULT_APARTMENTS = [
    {
      name: "Executive Comfort Suite",
      priceLabel: "K2,000 / night",
      badge: "Available Tonight",
      features: [
        "Air-conditioned rooms",
        "Smart TV with Netflix",
        "Starlink high-speed internet",
        "Modern kitchen and clean bathroom"
      ],
      images: [
        "assets/630362444_122164141550841441_5390268530041289102_n.jpg",
        "assets/628303594_122164141568841441_8306337482201048236_n.jpg",
        "assets/629226266_122164141592841441_2117617871875713527_n.jpg"
      ]
    },
    {
      name: "Family Premium Apartment",
      priceLabel: "K2,000 / night",
      badge: "High Demand",
      features: [
        "Spacious family-friendly living area",
        "Comfortable beds and fresh interiors",
        "Backup power and hot water",
        "Secure and quiet environment"
      ],
      images: [
        "assets/628390692_122164141604841441_719272422453125891_n.jpg",
        "assets/628418418_122164141634841441_8295295334317346115_n.jpg",
        "assets/629222782_122164141676841441_4548154573022666384_n.jpg"
      ]
    },
    {
      name: "Signature Getaway Apartment",
      priceLabel: "K2,000 / night",
      badge: "Ready to Book",
      features: [
        "Luxury finishes and modern furniture",
        "Full kitchen and dining convenience",
        "Strong WiFi for remote work",
        "Ideal for couples and business travelers"
      ],
      images: [
        "assets/629248919_122164141658841441_2851255111157590005_n.jpg",
        "assets/629254608_122164141694841441_8967582750012875948_n.jpg",
        "assets/627265331_122164141766841441_3315502584912791369_n.jpg"
      ]
    }
  ];

  function cloneDefaultApartments() {
    return DEFAULT_APARTMENTS.map(apartment => ({
      ...apartment,
      features: [...(apartment.features || [])],
      images: [...(apartment.images || [])]
    }));
  }

  let publicCmsState = null;
  let availablePaymentMethods = [];
  let publicCmsUnsub = null;
  let publicGalleryUnsub = null;
  const CMS_CACHE_KEY = "mkay-cms-cache-v2";

  function escapeHtml(value) {
    return String(value ?? "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#39;");
  }

  function formatCurrency(amount) {
    return `K${Number(amount || 0).toLocaleString()}`;
  }

  function normalizePublicState(raw) {
    const state = raw || {};
    return {
      basePrice: Number(state.basePrice || 2000),
      seasonalRules: Array.isArray(state.seasonalRules) && state.seasonalRules.length ? state.seasonalRules : [{ month: 7, price: 2500, enabled: true }],
      blockedRanges: Array.isArray(state.blockedRanges) ? state.blockedRanges : [],
      paymentMethods: Array.isArray(state.paymentMethods) && state.paymentMethods.length ? state.paymentMethods : DEFAULT_PAYMENT_METHODS,
      customPhotos: Array.isArray(state.customPhotos) ? state.customPhotos : [],
      hero: state.hero || {},
      about: state.about || {},
      apartments: Array.isArray(state.apartments) && state.apartments.length ? state.apartments : cloneDefaultApartments(),
      amenities: Array.isArray(state.amenities) ? state.amenities : [],
      activities: Array.isArray(state.activities) ? state.activities : [],
      activitiesSection: state.activitiesSection || {
        kicker: "Livingstone Experiences",
        headline: "Adventure Starts Here",
        subtitle: "Turn your stay into a full travel story with unforgettable local activities."
      },
      testimonials: Array.isArray(state.testimonials) ? state.testimonials : [],
      faq: Array.isArray(state.faq) ? state.faq : [],
      contact: state.contact || {}
    };
  }

  function loadCachedCmsState() {
    try {
      const cached = localStorage.getItem(CMS_CACHE_KEY);
      if (!cached) return null;
      return JSON.parse(cached);
    } catch {
      return null;
    }
  }

  function saveCachedCmsState(state) {
    try {
      localStorage.setItem(CMS_CACHE_KEY, JSON.stringify(state));
    } catch {
      // Ignore cache write failures.
    }
  }

  function parseDateInput(value) {
    if (!value) return null;
    const parsed = new Date(`${value}T00:00:00`);
    return Number.isNaN(parsed.getTime()) ? null : parsed;
  }

  function toISODate(date) {
    return date.toISOString().slice(0, 10);
  }

  let publicBookings = [];
  let publicBlockedDates = [];
  let publicPricing = [];
  let publicGallery = [];
  let publicCalendarInstance = null;

  function getSeasonalRateForMonth(date, state) {
    if (!date) return Number(state?.basePrice || 2000);
    const month = date.getMonth() + 1;
    const year = date.getFullYear();
    const customRate = publicPricing.find(p => Number(p.month) === month && Number(p.year) === year);
    if (customRate) return Number(customRate.nightlyRate);

    // Fallback to legacy state.seasonalRules
    const rule = (state?.seasonalRules || []).find(item => Number(item.month) === date.getMonth() && item.enabled !== false);
    return Number(rule?.price || state?.basePrice || 2000);
  }

  function isDateBlocked(date, state) {
    const current = date.getTime();
    
    // Check legacy state blockedRanges
    const isBlockedInCms = (state.blockedRanges || []).some(range => {
      const start = parseDateInput(range.start);
      const end = parseDateInput(range.end);
      return start && end && current >= start.getTime() && current <= end.getTime();
    });
    if (isBlockedInCms) return true;

    // Check new Firestore blockedDates collection
    const checkDateStr = toISODate(date);
    const isBlockedInCollection = publicBlockedDates.some(range => {
      return checkDateStr >= range.startDate && checkDateStr <= range.endDate;
    });
    if (isBlockedInCollection) return true;

    // Check confirmed bookings
    const isBooked = publicBookings.some(booking => {
      if (booking.status !== 'confirmed' && booking.status !== 'new') return false;
      return checkDateStr >= booking.checkin && checkDateStr < booking.checkout; // Checkout is exclusive for guests leaving that morning
    });
    if (isBooked) return true;

    return false;
  }

  function intersectsBlockedRange(start, end, state) {
    if (!start || !end) return false;
    const day = new Date(start);
    while (day < end) {
      if (isDateBlocked(day, state)) return true;
      day.setDate(day.getDate() + 1);
    }
    return false;
  }

  function buildRateGroups(start, end, state) {
    const groups = [];
    const day = new Date(start);
    let currentGroup = null;

    while (day < end) {
      const rate = getSeasonalRateForMonth(day, state);
      const label = day.toLocaleString("en", { month: "short" });
      const key = `${rate}-${day.getMonth()}`;
      if (!currentGroup || currentGroup.key !== key) {
        currentGroup = {
          key,
          label,
          rate,
          nights: 0,
          subtotal: 0
        };
        groups.push(currentGroup);
      }
      currentGroup.nights += 1;
      currentGroup.subtotal += rate;
      day.setDate(day.getDate() + 1);
    }

    return groups;
  }

  function syncBookingCalendarFromInputs() {
    const checkIn = document.getElementById("checkin");
    const checkOut = document.getElementById("checkout");
    const start = parseDateInput(checkIn?.value);
    const end = parseDateInput(checkOut?.value);

    bookingSelection.start = start;
    bookingSelection.end = end && start && end > start ? end : null;

    if (start) {
      bookingCalendar.month = start.getMonth();
      bookingCalendar.year = start.getFullYear();
    }

    if (checkIn && bookingSelection.start) {
      checkIn.value = toISODate(bookingSelection.start);
    }
    if (checkOut && bookingSelection.end) {
      checkOut.value = toISODate(bookingSelection.end);
    }

    syncCalendarSelectionFromInputs();
  }

  function syncCalendarSelectionFromInputs() {
    if (!publicCalendarInstance) return;
    const checkIn = document.getElementById("checkin");
    const checkOut = document.getElementById("checkout");
    if (checkIn?.value && checkOut?.value) {
      publicCalendarInstance.select(checkIn.value, checkOut.value);
    } else {
      publicCalendarInstance.unselect();
    }
  }

  function renderBookingPriceBreakdown(state) {
    const card = document.getElementById("priceBreakdownCard");
    const details = document.getElementById("breakdownDetails");
    const total = document.getElementById("breakdownTotalPrice");
    if (!card || !details || !total) return;

    if (!bookingSelection.start || !bookingSelection.end) {
      card.style.display = "none";
      details.innerHTML = "";
      total.textContent = formatCurrency(0);
      return;
    }

    if (intersectsBlockedRange(bookingSelection.start, bookingSelection.end, state)) {
      card.style.display = "block";
      details.innerHTML = "<div><span>Selected dates include an unavailable date.</span><strong>Please choose different dates</strong></div>";
      total.textContent = "N/A";
      return;
    }

    const groups = buildRateGroups(bookingSelection.start, bookingSelection.end, state);
    const nights = groups.reduce((sum, group) => sum + group.nights, 0);
    const totalAmount = groups.reduce((sum, group) => sum + group.subtotal, 0);

    details.innerHTML = groups.map(group => `
      <div>
        <span>${escapeHtml(group.label)} - ${group.nights} night${group.nights > 1 ? "s" : ""} @ ${formatCurrency(group.rate)}</span>
        <strong>${formatCurrency(group.subtotal)}</strong>
      </div>
    `).join("");

    details.insertAdjacentHTML("afterbegin", `<div><span>Total nights</span><strong>${nights}</strong></div>`);
    total.textContent = formatCurrency(totalAmount);
    card.style.display = "block";
  }

  function renderCalendar(state) {
    const calendarEl = document.getElementById("bookingCalendar");
    if (!calendarEl || typeof FullCalendar === "undefined") return;

    // Map bookings + blocked dates to events
    const events = [];

    // Confirmed bookings (Red) and Pending bookings (Orange)
    publicBookings.forEach(b => {
      let color = '#e74c3c'; // Confirmed/Booked
      let title = 'Booked';
      if (b.status === 'new') {
        color = '#f39c12'; // Pending
        title = 'Pending Booking';
      } else if (b.status !== 'confirmed') {
        return; // Skip completed / cancelled
      }
      events.push({
        id: `b-${b.id}`,
        title: title,
        start: b.checkin,
        end: b.checkout,
        allDay: true,
        backgroundColor: color,
        borderColor: color,
        display: 'background' // Display as background highlights to prevent overlapping selections
      });
    });

    // Blocked dates (Grey)
    publicBlockedDates.forEach(d => {
      events.push({
        id: `blocked-${d.id}`,
        title: 'Unavailable',
        start: d.startDate,
        end: d.endDate,
        allDay: true,
        backgroundColor: '#666666',
        borderColor: '#555555',
        display: 'background'
      });
    });

    if (!publicCalendarInstance) {
      publicCalendarInstance = new FullCalendar.Calendar(calendarEl, {
        initialView: 'dayGridMonth',
        themeSystem: 'standard',
        headerToolbar: {
          left: 'prev,next today',
          center: 'title',
          right: 'dayGridMonth'
        },
        selectable: true,
        selectMirror: true,
        unselectAuto: false,
        selectOverlap: false, // Disallow selecting over booked/blocked dates
        events: events,
        selectAllow: function(selectInfo) {
          // Additional safety check to prevent booking past dates
          const today = new Date();
          today.setHours(0,0,0,0);
          return selectInfo.start >= today;
        },
        select: function(info) {
          const checkIn = document.getElementById("checkin");
          const checkOut = document.getElementById("checkout");
          if (checkIn && checkOut) {
            checkIn.value = info.startStr;
            // FullCalendar selection end is exclusive, which matches the checkout date exactly
            checkOut.value = info.endStr;
            
            bookingSelection.start = new Date(info.startStr + 'T00:00:00');
            bookingSelection.end = new Date(info.endStr + 'T00:00:00');
            
            renderBookingPriceBreakdown(state);
          }
        },
        dayCellContent: function(arg) {
          const date = arg.date;
          const rate = getSeasonalRateForMonth(date, state);
          return {
            html: `<div class="fc-daygrid-day-number">${arg.dayNumberText}</div>
                   <div class="calendar-day-price" style="font-size: 0.72rem; font-weight: 700; color: var(--accent); margin-top: 2px;">K${rate.toLocaleString()}</div>`
          };
        }
      });
      // Preserve scroll position — FullCalendar.render() can scroll the page
      const savedScrollY = window.scrollY;
      const htmlEl = document.documentElement;
      htmlEl.style.scrollBehavior = "auto";
      publicCalendarInstance.render();
      window.scrollTo(0, savedScrollY);
      htmlEl.style.scrollBehavior = "";
      syncCalendarSelectionFromInputs();
    } else {
      publicCalendarInstance.removeAllEventSources();
      publicCalendarInstance.addEventSource(events);
    }
  }

  function renderBookingPaymentMethods(state) {
    const grid = document.getElementById("paymentMethodsGrid");
    const instructions = document.getElementById("paymentInstructionsBox");
    const hidden = document.getElementById("selectedPaymentMethodInput");
    if (!grid || !instructions || !hidden) return;

    availablePaymentMethods = (state.paymentMethods || DEFAULT_PAYMENT_METHODS).filter(method => method.enabled !== false);

    // Sanitize image paths coming from CMS or external state:
    // - fix accidental folder name with a space like "payments icon" -> "payments-icons"
    // - ensure local asset paths are prefixed with "assets/" when they reference payments-icons
    availablePaymentMethods.forEach(method => {
      if (!method || !method.image) return;
      try {
        // Normalize URL-encoded and unencoded variants
        method.image = method.image.replace(/payments%20icon/gi, 'payments-icons');
        method.image = method.image.replace(/payments\s+icon/gi, 'payments-icons');
        // If image looks like a payments-icons filename without assets/ prefix, add it
        if (/^payments-icons\//i.test(method.image) || /^payments-icons/i.test(method.image)) {
          method.image = method.image.replace(/^payments-icons\/?/i, 'assets/payments-icons/');
        }
        // If image references the payments-icons folder but doesn't start with assets/, ensure prefix
        if (/payments-icons/i.test(method.image) && !/^assets\//i.test(method.image) && !/^(https?:|data:|\/)/i.test(method.image)) {
          method.image = 'assets/' + method.image.replace(/^\/+/, '');
        }
      } catch (e) {
        // ignore sanitization failures
      }
    });
    const currentMethod = hidden.value || availablePaymentMethods[0]?.id || "";

    grid.innerHTML = availablePaymentMethods.map(method => `
      <button type="button" class="payment-method-card ${method.id === currentMethod ? "active" : ""}" data-method="${escapeHtml(method.id)}">
        <span class="payment-method-media">
          ${method.image ? `
            <img class="payment-logo" src="${escapeHtml(encodeURI(method.image))}" alt="${escapeHtml(method.name)}" loading="eager" decoding="async">
          ` : ``}
          <i class="payment-icon ${escapeHtml(method.icon || "fa-solid fa-credit-card")}"></i>
          <i class="payment-fallback ${escapeHtml(method.icon || "fa-solid fa-credit-card")}"></i>
        </span>
        <span>${escapeHtml(method.name)}</span>
      </button>
    `).join("");

    // Replace SVG <img> tags with inline SVG markup when possible so they render reliably
    grid.querySelectorAll(".payment-logo").forEach(img => {
      const src = img.getAttribute("src") || "";
      const isSvg = src.trim().toLowerCase().endsWith(".svg");
      if (isSvg) {
        // Attempt to fetch the SVG and inline it. If fetch fails (file:// or CORS), leave the <img> in place.
        fetch(src).then(resp => {
          if (!resp.ok) throw new Error("SVG fetch failed");
          return resp.text();
        }).then(svgText => {
          try {
            const wrapper = document.createElement('span');
            wrapper.innerHTML = svgText;
            const svgEl = wrapper.querySelector('svg');
            if (svgEl) {
              svgEl.classList.add('payment-logo');
              svgEl.setAttribute('role', 'img');
              svgEl.setAttribute('aria-label', img.getAttribute('alt') || '');
              img.replaceWith(svgEl);
            }
          } catch (e) {
            // ignore and keep img
          }
        }).catch(() => {
          // ignore fetch errors and keep the <img>
        });
      }
      // continue with normal handling below for both svg/img (if left as img)
      const card = img.closest(".payment-method-card");
      const markLoaded = () => {
        card?.classList.add("image-loaded");
        img.style.display = "";
      };
      const markError = () => {
        card?.classList.remove("image-loaded");
        img.style.display = "none";
      };
      // If image already loaded from cache, check its naturalWidth.
      // SVGs often report naturalWidth=0 even when they render, so treat SVGs as loaded.
      const src2 = img.getAttribute("src") || "";
      const isSvg2 = src2.trim().toLowerCase().endsWith(".svg");
      if (img.complete && (img.naturalWidth > 0 || isSvg2)) {
        markLoaded();
      } else {
        img.addEventListener("load", markLoaded);
        img.addEventListener("error", markError);
      }
    });

    function activateMethod(methodId, shouldScroll) {
      const method = availablePaymentMethods.find(item => item.id === methodId) || availablePaymentMethods[0];
      if (!method) return;
      hidden.value = method.id;
      Array.from(grid.querySelectorAll(".payment-method-card")).forEach(card => {
        card.classList.toggle("active", card.dataset.method === method.id);
      });
      instructions.style.display = "block";
      instructions.innerHTML = `
        <div class="payment-detail-head">
          <span class="payment-detail-label">Selected payment</span>
          <strong>${escapeHtml(method.name)}</strong>
        </div>
        <div class="payment-detail-body">${escapeHtml(method.details).replace(/\n/g, "<br>")}</div>
      `;
      // Only scroll when the user explicitly clicks a payment method,
      // NOT during programmatic initialisation (which fires on every page load / Firebase update)
      if (shouldScroll) {
        instructions.scrollIntoView({ behavior: "smooth", block: "nearest" });
      }
    }

    if (!grid.dataset.bound) {
      grid.dataset.bound = "true";
      grid.addEventListener("click", function (event) {
        const card = event.target.closest(".payment-method-card");
        if (!card) return;
        activateMethod(card.dataset.method, true); // user click — allow scroll
      });
    }

    activateMethod(currentMethod, false); // programmatic init — no scroll
  }

  function renderPublicCms(state) {
    const heroBg = document.querySelector(".hero-bg");
    const heroKicker = document.querySelector(".hero-kicker");
    const heroTitle = document.querySelector(".hero h1");
    const heroSubtitle = document.querySelector(".hero-sub");
    const heroStats = document.querySelector(".hero-stats");
    const aboutTitle = document.querySelector("#about h2");
    const aboutParagraphs = document.querySelectorAll("#about .split-content p");
    const aboutFeatures = document.querySelector("#about .feature-points");
    const aboutImages = document.querySelectorAll("#about .image-stack img");
    const apartmentGrid = document.querySelector("#apartments .apartment-grid");
    const amenitiesGrid = document.querySelector("#amenities .amenities-grid");
    const activitiesGrid = document.querySelector("#activities .activities-grid");
    const activitiesKicker = document.querySelector("#activities .section-tag");
    const activitiesTitle = document.querySelector("#activities h2");
    const activitiesSubtitle = document.querySelector("#activities .section-heading p");
    const testimonialsTrack = document.getElementById("testimonialTrack");
    const faqList = document.querySelector("#faq .faq-list");
    const galleryGrid = document.querySelector("#gallery .gallery-grid");
    const contactCards = document.querySelector("#contact .contact-cards");
    const footerGrid = document.querySelector(".site-footer .footer-grid");
    const apartmentSelect = document.getElementById("apartmentSelect");

    const firstGalleryImage = (publicGallery || [])[0]?.imageUrl;
    const heroImage = firstGalleryImage || state.customPhotos[0]?.src || state.apartments[0]?.images?.[0] || state.about.images?.[0] || PUBLIC_GALLERY_FALLBACK[0]?.src;
    if (heroBg && heroImage) {
      heroBg.style.backgroundImage = `url("${heroImage}")`;
    }

    if (heroKicker) heroKicker.textContent = state.hero.kicker || heroKicker.textContent;
    if (heroTitle) heroTitle.textContent = state.hero.headline || heroTitle.textContent;
    if (heroSubtitle) heroSubtitle.textContent = state.hero.subtitle || heroSubtitle.textContent;
    if (heroStats && Array.isArray(state.hero.statPills) && state.hero.statPills.length) {
      heroStats.innerHTML = state.hero.statPills.map(stat => `
        <article class="stat-pill reveal active">
          <i class="${escapeHtml(stat.icon || "fa-solid fa-star")}"></i>
          <span>${escapeHtml(stat.text || "")}</span>
        </article>
      `).join("");
    }

    if (aboutTitle) aboutTitle.textContent = state.about.title || aboutTitle.textContent;
    if (aboutParagraphs[0]) aboutParagraphs[0].textContent = state.about.paragraphs?.[0] || aboutParagraphs[0].textContent;
    if (aboutParagraphs[1]) aboutParagraphs[1].textContent = state.about.paragraphs?.[1] || aboutParagraphs[1].textContent;
    if (aboutFeatures && Array.isArray(state.about.features) && state.about.features.length) {
      aboutFeatures.innerHTML = state.about.features.map(feature => `
        <div><i class="${escapeHtml(feature.icon || "fa-solid fa-check")}"></i>${escapeHtml(feature.text || "")}</div>
      `).join("");
    }
    if (aboutImages[0] && state.about.images?.[0]) aboutImages[0].src = state.about.images[0];
    if (aboutImages[1] && state.about.images?.[1]) aboutImages[1].src = state.about.images[1];
    if (aboutImages[2] && state.about.images?.[2]) aboutImages[2].src = state.about.images[2];

    if (apartmentGrid && Array.isArray(state.apartments) && state.apartments.length) {
      apartmentGrid.innerHTML = state.apartments.map(apartment => `
        <article class="apartment-card reveal active">
          <div class="availability available">${escapeHtml(apartment.badge || "Available")}</div>
          <div class="apartment-slider" data-slider>
            <div class="slider-track">
              ${(apartment.images || []).map(image => `<img src="${escapeHtml(image)}" alt="${escapeHtml(apartment.name)}" loading="lazy">`).join("")}
            </div>
            <button class="slider-btn prev" data-prev aria-label="Previous image"><i class="fa-solid fa-chevron-left"></i></button>
            <button class="slider-btn next" data-next aria-label="Next image"><i class="fa-solid fa-chevron-right"></i></button>
          </div>
          <div class="apartment-body">
            <h3>${escapeHtml(apartment.name || "")}</h3>
            <p class="price">${escapeHtml(apartment.priceLabel || `${formatCurrency(state.basePrice)} / night`)} <span></span></p>
            <ul>${(apartment.features || []).map(feature => `<li>${escapeHtml(feature)}</li>`).join("")}</ul>
            <a class="btn btn-sm" href="https://wa.me/${String(state.contact.whatsapp || "").replace(/\D/g, "")}?text=${encodeURIComponent(`Hello M KAY APARTMENTS, I want to book the ${apartment.name}.`)}" target="_blank" rel="noopener">Book Now</a>
          </div>
        </article>
      `).join("");
      initApartmentSliders();
    }

    if (apartmentSelect && Array.isArray(state.apartments) && state.apartments.length) {
      const currentValue = apartmentSelect.value;
      apartmentSelect.innerHTML = `<option value="">Select apartment</option>` + state.apartments.map(apartment => `
        <option value="${escapeHtml(apartment.name)}">${escapeHtml(apartment.name)}</option>
      `).join("");
      if (currentValue && [...apartmentSelect.options].some(o => o.value === currentValue)) {
        apartmentSelect.value = currentValue;
      }
    }

    if (amenitiesGrid && Array.isArray(state.amenities) && state.amenities.length) {
      amenitiesGrid.innerHTML = state.amenities.map(amenity => `
        <article class="amenity-card reveal active"><i class="${escapeHtml(amenity.icon || "fa-solid fa-star")}"></i><h3>${escapeHtml(amenity.name || "")}</h3></article>
      `).join("");
    }

    if (activitiesKicker) activitiesKicker.textContent = state.activitiesSection?.kicker || "Livingstone Experiences";
    if (activitiesTitle) activitiesTitle.textContent = state.activitiesSection?.headline || "Adventure Starts Here";
    if (activitiesSubtitle) activitiesSubtitle.textContent = state.activitiesSection?.subtitle || "Turn your stay into a full travel story with unforgettable local activities.";

    if (activitiesGrid && Array.isArray(state.activities)) {
      activitiesGrid.innerHTML = state.activities.map(activity => `
        <article class="activity-card reveal active">
          <img src="${escapeHtml(activity.image || "")}" alt="${escapeHtml(activity.title || "")}" loading="lazy">
          <div><h3>${escapeHtml(activity.title || "")}</h3><a href="https://wa.me/${String(state.contact.whatsapp || "").replace(/\D/g, "")}?text=${encodeURIComponent(`Hello, I would like to arrange ${activity.title}.`)}" target="_blank" rel="noopener">Arrange Activity</a></div>
        </article>
      `).join("");
    }

    if (testimonialsTrack && Array.isArray(state.testimonials) && state.testimonials.length) {
      testimonialsTrack.innerHTML = state.testimonials.map(review => `
        <article class="testimonial-card">
          <img src="${escapeHtml(review.image || "")}" alt="${escapeHtml(review.name || "Guest")}" loading="lazy">
          <h3>${escapeHtml(review.name || "")}</h3>
          <p class="stars">${"&#9733;".repeat(Math.max(1, Number(review.rating || 5)))}</p>
          <p>${escapeHtml(review.text || "")}</p>
        </article>
      `).join("");
    }

    if (faqList && Array.isArray(state.faq) && state.faq.length) {
      faqList.innerHTML = state.faq.map(item => `
        <article class="faq-item reveal active">
          <button class="faq-question">${escapeHtml(item.question || "")}<span>+</span></button>
          <div class="faq-answer"><p>${item.answer || ""}</p></div>
        </article>
      `).join("");
    }

    if (galleryGrid) {
      const uploadedPhotos = (publicGallery || []).map(img => ({
        src: img.imageUrl,
        alt: img.apartmentId && img.apartmentId !== 'global' ? img.apartmentId : 'Gallery Image',
        caption: img.apartmentId && img.apartmentId !== 'global' ? img.apartmentId : ''
      }));

      // Deduplicate by src
      const seen = new Set();
      const galleryPhotos = [];
      const allPhotos = [...uploadedPhotos, ...(state.customPhotos || []), ...PUBLIC_GALLERY_FALLBACK];
      for (const photo of allPhotos) {
        if (photo.src && !seen.has(photo.src)) {
          seen.add(photo.src);
          galleryPhotos.push(photo);
        }
      }

      galleryGrid.innerHTML = galleryPhotos.map(photo => `
        <figure class="gallery-item reveal active">
          <img src="${escapeHtml(photo.src)}" alt="${escapeHtml(photo.alt || photo.caption || "Gallery image")}" loading="lazy">
          <figcaption>${escapeHtml(photo.caption || photo.alt || "")}</figcaption>
        </figure>
      `).join("");
    }

    if (contactCards) {
      contactCards.innerHTML = `
        <article>
          <i class="fa-solid fa-phone"></i>
          <h3>Reservations Phone</h3>
          <a href="tel:${escapeHtml(state.contact.phone || "")}">${escapeHtml(state.contact.phone || "")}</a>
        </article>
        <article>
          <i class="fa-brands fa-whatsapp"></i>
          <h3>WhatsApp</h3>
          <a href="https://wa.me/${String(state.contact.whatsapp || "").replace(/\D/g, "")}" target="_blank" rel="noopener">+${escapeHtml(String(state.contact.whatsapp || "").replace(/\D/g, ""))}</a>
        </article>
        <article>
          <i class="fa-solid fa-envelope"></i>
          <h3>Email</h3>
          <a href="mailto:${escapeHtml(state.contact.email || "")}">${escapeHtml(state.contact.email || "")}</a>
        </article>
        <article>
          <i class="fa-brands fa-facebook-f"></i>
          <h3>Facebook</h3>
          <a href="${escapeHtml(state.contact.facebook || "https://www.facebook.com/")}" target="_blank" rel="noopener">Visit Facebook Page</a>
        </article>
      `;
    }

    if (footerGrid) {
      footerGrid.innerHTML = `
        <div>
          <h3>M KAY APARTMENTS LTD</h3>
          <p>${escapeHtml(state.contact.footerDescription || "Luxury and comfort in Livingstone, Zambia for tourists, couples, families, and business travelers.")}</p>
        </div>
        <div>
          <h4>Address</h4>
          <p>${(state.contact.address || "Dambwa North Extension<br>Livingstone, Zambia, 60010")}</p>
        </div>
        <div>
          <h4>Contact Person</h4>
          <p>${escapeHtml(state.contact.contactPerson || "Masozi Kamanga")}</p>
          <p><a href="tel:${escapeHtml(state.contact.phone || "")}">${escapeHtml(state.contact.phone || "")}</a></p>
          <p style="margin-top: 1.2rem;"><a href="admin.html" id="hostPortalBtn" style="opacity: 0.6; font-size: 0.85rem;"><i class="fa-solid fa-lock"></i> Host Portal</a></p>
        </div>
      `;
    }

    if (apartmentSelect && Array.isArray(state.apartments) && state.apartments.length) {
      apartmentSelect.innerHTML = `<option value="">Select apartment</option>` + state.apartments.map(apartment => `
        <option value="${escapeHtml(apartment.name || "")}">${escapeHtml(apartment.name || "")} - ${escapeHtml(apartment.priceLabel || `${formatCurrency(state.basePrice)} / night`)}</option>
      `).join("");
    }

    renderBookingPaymentMethods(state);
    renderCalendar(state);
    renderBookingPriceBreakdown(state);
  }

  async function loadPublicCms() {
    try {
      const firebaseApi = await getFirebaseApi();
      const cachedState = loadCachedCmsState() || {};
      let data = null;
      if (firebaseApi?.getState) {
        data = await firebaseApi.getState();
      }
      publicCmsState = normalizePublicState(mergeCmsState(cachedState, data || {}));
      renderPublicCms(publicCmsState);
      if (!publicCmsUnsub && firebaseApi.subscribeToState) {
        publicCmsUnsub = firebaseApi.subscribeToState(nextState => {
          publicCmsState = normalizePublicState(mergeCmsState(loadCachedCmsState() || {}, nextState || {}));
          renderPublicCms(publicCmsState);
          saveCachedCmsState(publicCmsState);
        });
      }

      // Real-time Firestore subscriptions for booking collections
      if (firebaseApi?.subscribeBookings) {
        firebaseApi.subscribeBookings(bookings => {
          publicBookings = bookings;
          if (publicCmsState) renderCalendar(publicCmsState);
        });
      }
      if (firebaseApi?.subscribeBlockedDates) {
        firebaseApi.subscribeBlockedDates(blocked => {
          publicBlockedDates = blocked;
          if (publicCmsState) renderCalendar(publicCmsState);
        });
      }
      if (firebaseApi?.subscribePricing) {
        firebaseApi.subscribePricing(pricing => {
          publicPricing = pricing;
          if (publicCmsState) renderCalendar(publicCmsState);
        });
      }
      if (!publicGalleryUnsub && firebaseApi?.subscribeGallery) {
        publicGalleryUnsub = firebaseApi.subscribeGallery(gallery => {
          publicGallery = gallery;
          if (publicCmsState) renderPublicCms(publicCmsState);
        });
      }

      saveCachedCmsState(publicCmsState);
    } catch (err) {
      console.warn("Public CMS load skipped:", err.message);
    }
  }

  const checkInInput = document.getElementById("checkin");
  const checkOutInput = document.getElementById("checkout");
  if (checkInInput && !checkInInput.dataset.bound) {
    checkInInput.dataset.bound = "true";
    checkInInput.addEventListener("change", function () {
      syncBookingCalendarFromInputs();
      if (publicCmsState) {
        renderCalendar(publicCmsState);
        renderBookingPriceBreakdown(publicCmsState);
      }
    });
  }
  if (checkOutInput && !checkOutInput.dataset.bound) {
    checkOutInput.dataset.bound = "true";
    checkOutInput.addEventListener("change", function () {
      syncBookingCalendarFromInputs();
      if (publicCmsState) {
        renderCalendar(publicCmsState);
        renderBookingPriceBreakdown(publicCmsState);
      }
    });
  }

  const initialPublicState = normalizePublicState({});
  renderPublicCms(initialPublicState);
  loadPublicCms();

  // Always scroll to top on page load – history.scrollRestoration='manual' (set at top)
  // prevents the browser from restoring a previous scroll position.
  function goToHomepage() {
    history.replaceState(null, "", window.location.pathname + window.location.search + "#home");
    // Temporarily disable CSS scroll-behavior:smooth so the scroll is instant (not animated)
    const htmlEl = document.documentElement;
    const prevBehavior = htmlEl.style.scrollBehavior;
    htmlEl.style.scrollBehavior = "auto";
    window.scrollTo(0, 0);
    // Restore smooth scrolling after a short delay so anchor links stay smooth
    requestAnimationFrame(function () {
      requestAnimationFrame(function () {
        htmlEl.style.scrollBehavior = prevBehavior;
      });
    });
  }

  document.addEventListener("DOMContentLoaded", goToHomepage);
  window.addEventListener("load", goToHomepage);

  const hostPortal = {
    user: null,
    state: null
  };

  const hostEls = {
    modal: document.getElementById("hostDashboard"),
    openBtn: document.getElementById("hostPortalBtn"),
    closeBtn: document.getElementById("adminModalClose"),
    loginBox: document.getElementById("adminLoginBox"),
    dashboard: document.getElementById("adminDashboardContent"),
    emailInput: document.getElementById("adminEmail"),
    passwordInput: document.getElementById("adminPassword"),
    loginBtn: document.getElementById("adminLoginBtn"),
    loginError: document.getElementById("adminLoginError"),
    heroKicker: document.getElementById("heroKickerInput"),
    heroHeadline: document.getElementById("heroHeadlineInput"),
    heroSubtitle: document.getElementById("heroSubtitleInput"),
    heroStats: document.getElementById("heroStatsList"),
    aboutTitle: document.getElementById("aboutTitleInput"),
    aboutP1: document.getElementById("aboutP1Input"),
    aboutP2: document.getElementById("aboutP2Input"),
    aboutFeatures: document.getElementById("aboutFeaturesList"),
    aboutImg1: document.getElementById("aboutImg1Input"),
    aboutImg2: document.getElementById("aboutImg2Input"),
    aboutImg3: document.getElementById("aboutImg3Input"),
    apartments: document.getElementById("apartmentsList"),
    amenities: document.getElementById("amenitiesList"),
    activities: document.getElementById("activitiesList"),
    reviews: document.getElementById("reviewsList"),
    faq: document.getElementById("faqList"),
    contactPhone: document.getElementById("contactPhoneInput"),
    contactWhatsapp: document.getElementById("contactWhatsappInput"),
    contactEmail: document.getElementById("contactEmailInput"),
    contactFacebook: document.getElementById("contactFacebookInput"),
    contactAddress: document.getElementById("contactAddressInput"),
    contactPerson: document.getElementById("contactPersonInput"),
    contactFooter: document.getElementById("contactFooterInput"),
    basePrice: document.getElementById("adminBasePrice"),
    ruleMonth: document.getElementById("ruleMonth"),
    rulePrice: document.getElementById("rulePrice"),
    seasonsList: document.getElementById("seasonsList"),
    blockStart: document.getElementById("blockStart"),
    blockEnd: document.getElementById("blockEnd"),
    blockedList: document.getElementById("blockedRangesList"),
    galleryUploadInput: document.getElementById("galleryUploadInput"),
    triggerUploadBtn: document.getElementById("triggerUploadBtn"),
    uploadStatusText: document.getElementById("uploadStatusText"),
    customGalleryManager: document.getElementById("customGalleryManager"),
    paymentSettingsList: document.getElementById("paymentSettingsList"),
    bookingsTableWrapper: document.getElementById("bookingsTableWrapper"),
    authStatusMsg: document.getElementById("authStatusMsg"),
    refreshBookingsBtn: document.getElementById("refreshBookingsBtn"),
    saveHeroBtn: document.getElementById("saveHeroBtn"),
    saveAboutBtn: document.getElementById("saveAboutBtn"),
    saveApartmentsBtn: document.getElementById("saveApartmentsBtn"),
    saveAmenitiesBtn: document.getElementById("saveAmenitiesBtn"),
    saveActivitiesBtn: document.getElementById("saveActivitiesBtn"),
    saveReviewsBtn: document.getElementById("saveReviewsBtn"),
    saveFaqBtn: document.getElementById("saveFaqBtn"),
    saveContactBtn: document.getElementById("saveContactBtn"),
    saveBasePriceBtn: document.getElementById("saveBasePriceBtn"),
    savePaymentsBtn: document.getElementById("savePaymentsBtn"),
    addHeroStatBtn: document.getElementById("addHeroStatBtn"),
    addAboutFeatureBtn: document.getElementById("addAboutFeatureBtn"),
    addApartmentBtn: document.getElementById("addApartmentBtn"),
    addAmenityBtn: document.getElementById("addAmenityBtn"),
    addActivityBtn: document.getElementById("addActivityBtn"),
    addReviewBtn: document.getElementById("addReviewBtn"),
    addFaqBtn: document.getElementById("addFaqBtn"),
    addRuleBtn: document.getElementById("addRuleBtn"),
    addBlockBtn: document.getElementById("addBlockBtn"),
    signOutBtn: document.getElementById("signOutBtn")
  };

  updateFirebaseLoginState();

  const portalSchemas = {
    heroStats: [
      { key: "icon", label: "Icon", placeholder: "fa-solid fa-wifi" },
      { key: "text", label: "Text", placeholder: "Starlink WiFi" }
    ],
    aboutFeatures: [
      { key: "icon", label: "Icon", placeholder: "fa-solid fa-building" },
      { key: "text", label: "Text", placeholder: "Modern apartments" }
    ],
    apartments: [
      { key: "name", label: "Name", placeholder: "Apartment name" },
      { key: "priceLabel", label: "Price Label", placeholder: "K2,000 / night" },
      { key: "badge", label: "Badge", placeholder: "Available Tonight" },
      { key: "features", label: "Features", type: "csv", rows: 3, placeholder: "Feature 1, Feature 2" },
      { key: "images", label: "Images", type: "csv", rows: 3, placeholder: "assets/img1.jpg, assets/img2.jpg" }
    ],
    amenities: [
      { key: "icon", label: "Icon", placeholder: "fa-solid fa-wifi" },
      { key: "name", label: "Name", placeholder: "Amenity name" }
    ],
    activities: [
      { key: "title", label: "Title", placeholder: "Activity title" },
      { key: "image", label: "Image URL", placeholder: "assets/photo.jpg" }
    ],
    reviews: [
      { key: "name", label: "Guest Name", placeholder: "Guest name" },
      { key: "rating", label: "Rating", type: "number", placeholder: "5" },
      { key: "text", label: "Review Text", type: "textarea", rows: 3, placeholder: "Guest review" },
      { key: "image", label: "Profile Image", placeholder: "assets/profile.jpg" }
    ],
    faq: [
      { key: "question", label: "Question", placeholder: "FAQ question" },
      { key: "answer", label: "Answer HTML", type: "textarea", rows: 3, placeholder: "<p>Answer content</p>" }
    ],
    paymentMethods: [
      { key: "name", label: "Name", placeholder: "Payment name" },
      { key: "enabled", label: "Enabled", type: "checkbox" },
      { key: "icon", label: "Icon", placeholder: "fa-solid fa-mobile-screen-button" },
      { key: "image", label: "Image URL", placeholder: "assets/payments-icons/logo.png" },
      { key: "details", label: "Details", type: "textarea", rows: 3, placeholder: "Payment details" }
    ]
  };

  function escapeHtml(value) {
    return String(value ?? "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#39;");
  }

  function getValue(id) {
    const el = document.getElementById(id);
    return el ? el.value.trim() : "";
  }

  function setValue(id, value) {
    const el = document.getElementById(id);
    if (el) el.value = value ?? "";
  }

  async function uploadHostFiles(files) {
    const urls = [];
    const firebaseApi = await getFirebaseApi();
    if (!firebaseApi?.uploadMedia) {
      throw new Error("Firebase Storage is not ready yet.");
    }
    for (const file of files || []) {
      const payload = await firebaseApi.uploadMedia(file, "uploads");
      urls.push(payload.url);
    }
    return urls;
  }

  function updateRepeaterField(container, itemIndex, fieldKey, nextValue) {
    if (!container) return;
    const item = container.querySelector(`.repeater-item[data-index="${itemIndex}"]`);
    if (!item) return;
    const field = item.querySelector(`[data-key="${fieldKey}"]`);
    if (!field) return;
    field.value = nextValue;
    field.dispatchEvent(new Event("input", { bubbles: true }));
    field.dispatchEvent(new Event("change", { bubbles: true }));
  }

  function openMediaPicker({ multiple = false } = {}) {
    return new Promise(resolve => {
      const input = document.createElement("input");
      input.type = "file";
      input.accept = "image/*";
      input.multiple = multiple;
      input.style.display = "none";
      input.addEventListener("change", async function () {
        const files = Array.from(this.files || []);
        input.remove();
        if (!files.length) {
          resolve([]);
          return;
        }
        try {
          const urls = await uploadHostFiles(files);
          resolve(urls);
        } catch (err) {
          alert(err.message || "Upload failed");
          resolve([]);
        }
      });
      document.body.appendChild(input);
      input.click();
    });
  }

  function ensureHostState(data) {
    const source = data || {};
    return {
      ...source,
      basePrice: Number(source.basePrice || 2000),
      hero: {
        kicker: source.hero?.kicker || "",
        headline: source.hero?.headline || "",
        subtitle: source.hero?.subtitle || "",
        statPills: Array.isArray(source.hero?.statPills) ? source.hero.statPills : []
      },
      about: {
        title: source.about?.title || "",
        paragraphs: Array.isArray(source.about?.paragraphs) ? source.about.paragraphs : ["", ""],
        features: Array.isArray(source.about?.features) ? source.about.features : [],
        images: Array.isArray(source.about?.images) ? source.about.images : ["", "", ""]
      },
      apartments: Array.isArray(source.apartments) && source.apartments.length ? source.apartments : cloneDefaultApartments(),
      amenities: Array.isArray(source.amenities) ? source.amenities : [],
      activities: Array.isArray(source.activities) ? source.activities : [],
      testimonials: Array.isArray(source.testimonials) ? source.testimonials : [],
      faq: Array.isArray(source.faq) ? source.faq : [],
      contact: {
        phone: source.contact?.phone || "",
        whatsapp: source.contact?.whatsapp || "",
        email: source.contact?.email || "",
        facebook: source.contact?.facebook || "",
        address: source.contact?.address || "",
        contactPerson: source.contact?.contactPerson || "",
        footerDescription: source.contact?.footerDescription || ""
      },
      seasonalRules: Array.isArray(source.seasonalRules) && source.seasonalRules.length ? source.seasonalRules : [{ month: 7, price: 2500, enabled: true }],
      blockedRanges: Array.isArray(source.blockedRanges) ? source.blockedRanges : [],
      paymentMethods: Array.isArray(source.paymentMethods) ? source.paymentMethods : [],
      customPhotos: Array.isArray(source.customPhotos) ? source.customPhotos : []
    };
  }

  function renderRepeater(container, items, schema) {
    if (!container) return;
    container.innerHTML = (items || []).map((item, index) => {
      const fields = schema.map(field => {
        const value = item?.[field.key];
        if (field.type === "textarea") {
          return `<label>${escapeHtml(field.label)}<textarea data-key="${field.key}" rows="${field.rows || 2}" placeholder="${escapeHtml(field.placeholder || "")}">${escapeHtml(value ?? "")}</textarea></label>`;
        }
        if (field.type === "checkbox") {
          return `<label class="admin-checkbox-row"><input type="checkbox" data-key="${field.key}" ${value ? "checked" : ""}> ${escapeHtml(field.label)}</label>`;
        }
        if (field.type === "number") {
          return `<label>${escapeHtml(field.label)}<input type="number" data-key="${field.key}" value="${escapeHtml(value ?? "")}" placeholder="${escapeHtml(field.placeholder || "")}"></label>`;
        }
        if (field.type === "csv") {
          const textValue = Array.isArray(value) ? value.join(", ") : (value ?? "");
          const preview = Array.isArray(value) && value.length
            ? `<div class="media-preview-list">${value.map(src => `<a class="media-preview-item" href="${escapeHtml(src)}" target="_blank" rel="noopener"><img src="${escapeHtml(src)}" alt="${escapeHtml(field.label)}" loading="lazy"></a>`).join("")}</div>`
            : "";
          const upload = field.key === "images"
            ? `<div class="media-upload-actions"><button type="button" class="btn btn-sm btn-upload-media" data-upload-images="${index}"><i class="fa-solid fa-upload"></i> Upload Images</button></div>`
            : "";
          return `<label>${escapeHtml(field.label)}<textarea data-key="${field.key}" rows="${field.rows || 2}" placeholder="${escapeHtml(field.placeholder || "")}">${escapeHtml(textValue)}</textarea></label>${upload}${preview}`;
        }
        if (field.type === "select" && Array.isArray(field.options)) {
          return `<label>${escapeHtml(field.label)}<select data-key="${field.key}">${field.options.map(option => `<option value="${escapeHtml(option.value)}" ${String(value) === String(option.value) ? "selected" : ""}>${escapeHtml(option.label)}</option>`).join("")}</select></label>`;
        }
        const preview = field.key === "image" && value
          ? `<div class="media-preview-list"><a class="media-preview-item" href="${escapeHtml(value)}" target="_blank" rel="noopener"><img src="${escapeHtml(value)}" alt="${escapeHtml(field.label)}" loading="lazy"></a></div>`
          : "";
        const upload = field.key === "image"
          ? `<div class="media-upload-actions"><button type="button" class="btn btn-sm btn-upload-media" data-upload-image="${index}"><i class="fa-solid fa-upload"></i> Upload Image</button></div>`
          : "";
        return `<label>${escapeHtml(field.label)}<input type="text" data-key="${field.key}" value="${escapeHtml(value ?? "")}" placeholder="${escapeHtml(field.placeholder || "")}"></label>${upload}${preview}`;
      }).join("");

      return `<div class="repeater-item" data-index="${index}">${fields}<button type="button" class="remove-btn" data-remove="${index}" aria-label="Remove item"><i class="fa-solid fa-trash"></i></button></div>`;
    }).join("");
  }

  function collectRepeater(container, schema) {
    if (!container) return [];
    return Array.from(container.querySelectorAll(".repeater-item")).map(item => {
      const entry = {};
      schema.forEach(field => {
        const fieldEl = item.querySelector(`[data-key="${field.key}"]`);
        if (!fieldEl) return;
        if (field.type === "checkbox") {
          entry[field.key] = fieldEl.checked;
        } else if (field.type === "number") {
          entry[field.key] = Number(fieldEl.value || 0);
        } else if (field.type === "csv") {
          entry[field.key] = fieldEl.value.split(/[,;\n]/).map(part => part.trim()).filter(Boolean);
        } else if (field.type === "select") {
          entry[field.key] = fieldEl.value;
        } else {
          entry[field.key] = fieldEl.value.trim();
        }
      });
      return entry;
    }).filter(entry => Object.values(entry).some(value => Array.isArray(value) ? value.length > 0 : String(value ?? "").trim().length > 0));
  }

  function normalizeMonth(value) {
    const month = Number(value);
    return Number.isNaN(month) ? 0 : month;
  }

  function mergeCmsState(existing, updates) {
    if (Array.isArray(existing) || Array.isArray(updates)) {
      if (Array.isArray(updates) && updates.length > 0) return updates;
      return Array.isArray(existing) ? existing : [];
    }

    if (updates && typeof updates === "object") {
      const merged = { ...(existing && typeof existing === "object" ? existing : {}) };
      Object.keys(updates).forEach(key => {
        const nextValue = updates[key];
        const currentValue = merged[key];
        if (Array.isArray(nextValue) || Array.isArray(currentValue)) {
          merged[key] = mergeCmsState(currentValue, nextValue);
        } else if (nextValue && typeof nextValue === "object") {
          merged[key] = mergeCmsState(currentValue, nextValue);
        } else if (nextValue !== undefined) {
          merged[key] = nextValue;
        }
      });
      return merged;
    }

    return updates !== undefined ? updates : existing;
  }

  function renderHostState() {
    if (!hostPortal.state) return;

    setValue("heroKickerInput", hostPortal.state.hero.kicker);
    setValue("heroHeadlineInput", hostPortal.state.hero.headline);
    setValue("heroSubtitleInput", hostPortal.state.hero.subtitle);
    renderRepeater(hostEls.heroStats, hostPortal.state.hero.statPills, portalSchemas.heroStats);

    setValue("aboutTitleInput", hostPortal.state.about.title);
    setValue("aboutP1Input", hostPortal.state.about.paragraphs[0] || "");
    setValue("aboutP2Input", hostPortal.state.about.paragraphs[1] || "");
    renderRepeater(hostEls.aboutFeatures, hostPortal.state.about.features, portalSchemas.aboutFeatures);
    setValue("aboutImg1Input", hostPortal.state.about.images[0] || "");
    setValue("aboutImg2Input", hostPortal.state.about.images[1] || "");
    setValue("aboutImg3Input", hostPortal.state.about.images[2] || "");

    renderRepeater(hostEls.apartments, hostPortal.state.apartments, portalSchemas.apartments);
    renderRepeater(hostEls.amenities, hostPortal.state.amenities, portalSchemas.amenities);
    renderRepeater(hostEls.activities, hostPortal.state.activities, portalSchemas.activities);
    renderRepeater(hostEls.reviews, hostPortal.state.testimonials, portalSchemas.reviews);
    renderRepeater(hostEls.faq, hostPortal.state.faq, portalSchemas.faq);

    setValue("contactPhoneInput", hostPortal.state.contact.phone);
    setValue("contactWhatsappInput", hostPortal.state.contact.whatsapp);
    setValue("contactEmailInput", hostPortal.state.contact.email);
    setValue("contactFacebookInput", hostPortal.state.contact.facebook);
    setValue("contactAddressInput", hostPortal.state.contact.address);
    setValue("contactPersonInput", hostPortal.state.contact.contactPerson);
    setValue("contactFooterInput", hostPortal.state.contact.footerDescription);

    setValue("adminBasePrice", hostPortal.state.basePrice);
    renderSeasonRules();
    renderBlockedRanges();
    renderGalleryManager();
    renderHostPaymentMethods();
  }

  function renderSeasonRules() {
    if (!hostEls.seasonsList) return;
    hostEls.seasonsList.innerHTML = (hostPortal.state?.seasonalRules || []).map((rule, index) => `
      <div class="season-item" data-index="${index}">
        <label>Month
          <select data-key="month">
            ${Array.from({ length: 12 }, (_, i) => `<option value="${i}" ${String(normalizeMonth(rule.month)) === String(i) ? "selected" : ""}>${new Date(2020, i, 1).toLocaleString("en", { month: "long" })}</option>`).join("")}
          </select>
        </label>
        <label>Price
          <input type="number" data-key="price" value="${escapeHtml(rule.price ?? "")}">
        </label>
        <label class="admin-checkbox-row"><input type="checkbox" data-key="enabled" ${rule.enabled ? "checked" : ""}> Enabled</label>
        <button type="button" class="btn-delete-rule" data-remove-rule="${index}" aria-label="Delete rule"><i class="fa-solid fa-trash"></i></button>
      </div>
    `).join("");
  }

  function renderBlockedRanges() {
    if (!hostEls.blockedList) return;
    hostEls.blockedList.innerHTML = (hostPortal.state?.blockedRanges || []).map((range, index) => `
      <div class="blocked-item" data-index="${index}">
        <label>Start
          <input type="date" data-key="start" value="${escapeHtml(range.start || "")}">
        </label>
        <label>End
          <input type="date" data-key="end" value="${escapeHtml(range.end || "")}">
        </label>
        <button type="button" class="btn-delete-rule" data-remove-blocked="${index}" aria-label="Delete blocked range"><i class="fa-solid fa-trash"></i></button>
      </div>
    `).join("");
  }

  function renderGalleryManager() {
    if (!hostEls.customGalleryManager) return;
    const photos = hostPortal.state?.customPhotos || [];
    hostEls.customGalleryManager.innerHTML = photos.length ? photos.map((photo, index) => `
      <div class="custom-gallery-card" data-index="${index}">
        <img src="${escapeHtml(photo.src || "")}" alt="${escapeHtml(photo.caption || "Gallery image")}" loading="lazy">
        <div class="custom-gallery-card-body">
          <label>Caption
            <input type="text" class="custom-caption-input" data-key="caption" value="${escapeHtml(photo.caption || "")}" placeholder="Image caption">
          </label>
          <div class="custom-gallery-card-actions">
            <button type="button" class="btn btn-sm btn-save-caption" data-save-caption="${index}">Save Caption</button>
            <button type="button" class="btn btn-sm btn-delete-image" data-remove-photo="${index}">Delete</button>
          </div>
        </div>
      </div>
    `).join("") : `<p style="color: var(--muted); font-size: 0.92rem;">No custom gallery uploads yet.</p>`;
  }

  function renderHostPaymentMethods() {
    if (!hostEls.paymentSettingsList) return;
    hostEls.paymentSettingsList.innerHTML = (hostPortal.state?.paymentMethods || []).map((method, index) => `
      <div class="payment-settings-item" data-index="${index}">
        <div class="payment-settings-header">
          <span>
            ${method.image ? `<img src="${escapeHtml(method.image)}" alt="${escapeHtml(method.name || "Payment method")}" loading="lazy">` : `<i class="${escapeHtml(method.icon || "fa-solid fa-credit-card")}"></i>`}
            <input type="text" data-key="name" value="${escapeHtml(method.name || "")}" placeholder="Method name">
          </span>
          <label class="admin-checkbox-row"><input type="checkbox" data-key="enabled" ${method.enabled ? "checked" : ""}> Enabled</label>
        </div>
        <div class="admin-form-row" style="align-items: flex-start;">
          <label>Icon class
            <input type="text" data-key="icon" value="${escapeHtml(method.icon || "")}" placeholder="fa-solid fa-credit-card">
          </label>
          <label>Image URL
            <input type="text" data-key="image" value="${escapeHtml(method.image || "")}" placeholder="assets/payments-icons/logo.png">
          </label>
        </div>
        <label>Details
          <textarea data-key="details" rows="3" placeholder="Payment details">${escapeHtml(method.details || "")}</textarea>
        </label>
      </div>
    `).join("");
  }

  function showHostPortal() {
    if (!hostEls.modal) return;
    hostEls.modal.classList.add("active");
    hostEls.modal.setAttribute("aria-hidden", "false");
    document.body.style.overflow = "hidden";
    hostEls.modal.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  function hideHostPortal() {
    if (!hostEls.modal) return;
    hostEls.modal.classList.remove("active");
    hostEls.modal.setAttribute("aria-hidden", "true");
    document.body.style.overflow = "";
  }

  function showLoginError(message) {
    if (!hostEls.loginError) return;
    hostEls.loginError.textContent = message;
    hostEls.loginError.style.display = message ? "block" : "none";
  }

  async function loadPortalState() {
    const firebaseApi = await getFirebaseApi();
    if (!firebaseApi) throw new Error("Firebase is not ready yet.");
    const data = await firebaseApi.getState();
    hostPortal.state = ensureHostState(data);
    renderHostState();
  }

  function collectHostStateFromUI() {
    if (!hostPortal.state) hostPortal.state = ensureHostState({});

    hostPortal.state.hero = {
      kicker: getValue("heroKickerInput"),
      headline: getValue("heroHeadlineInput"),
      subtitle: getValue("heroSubtitleInput"),
      statPills: collectRepeater(hostEls.heroStats, portalSchemas.heroStats)
    };

    hostPortal.state.about = {
      title: getValue("aboutTitleInput"),
      paragraphs: [getValue("aboutP1Input"), getValue("aboutP2Input")],
      features: collectRepeater(hostEls.aboutFeatures, portalSchemas.aboutFeatures),
      images: [getValue("aboutImg1Input"), getValue("aboutImg2Input"), getValue("aboutImg3Input")]
    };

    hostPortal.state.apartments = collectRepeater(hostEls.apartments, portalSchemas.apartments);
    hostPortal.state.amenities = collectRepeater(hostEls.amenities, portalSchemas.amenities);
    hostPortal.state.activities = collectRepeater(hostEls.activities, portalSchemas.activities);
    hostPortal.state.testimonials = collectRepeater(hostEls.reviews, portalSchemas.reviews);
    hostPortal.state.faq = collectRepeater(hostEls.faq, portalSchemas.faq);

    hostPortal.state.contact = {
      phone: getValue("contactPhoneInput"),
      whatsapp: getValue("contactWhatsappInput"),
      email: getValue("contactEmailInput"),
      facebook: getValue("contactFacebookInput"),
      address: getValue("contactAddressInput"),
      contactPerson: getValue("contactPersonInput"),
      footerDescription: getValue("contactFooterInput")
    };

    hostPortal.state.basePrice = Number(getValue("adminBasePrice") || 2000);
    hostPortal.state.seasonalRules = Array.from(hostEls.seasonsList?.querySelectorAll(".season-item") || []).map(item => {
      const month = item.querySelector('[data-key="month"]');
      const price = item.querySelector('[data-key="price"]');
      const enabled = item.querySelector('[data-key="enabled"]');
      return {
        month: normalizeMonth(month?.value || 0),
        price: Number(price?.value || 0),
        enabled: Boolean(enabled?.checked)
      };
    });
    hostPortal.state.blockedRanges = Array.from(hostEls.blockedList?.querySelectorAll(".blocked-item") || []).map(item => ({
      start: item.querySelector('[data-key="start"]')?.value || "",
      end: item.querySelector('[data-key="end"]')?.value || ""
    })).filter(range => range.start || range.end);

    hostPortal.state.paymentMethods = collectRepeater(hostEls.paymentSettingsList, portalSchemas.paymentMethods);

    return hostPortal.state;
  }

  async function savePortalState(message = "Saved successfully") {
    const firebaseApi = await getFirebaseApi();
    if (!firebaseApi?.saveState) throw new Error("Firebase is not ready yet.");
    if (!hostPortal.user) throw new Error("You need to log in first.");
    const payload = collectHostStateFromUI();
    const mergedState = ensureHostState(mergeCmsState(hostPortal.state || {}, payload));
    await firebaseApi.saveState(mergedState);
    hostPortal.state = mergedState;
    publicCmsState = normalizePublicState(mergedState);
    renderPublicCms(publicCmsState);
    saveCachedCmsState(publicCmsState);
    renderHostState();
    return message;
  }

  async function loadBookings() {
    const firebaseApi = await getFirebaseApi();
    if (!firebaseApi || !hostEls.bookingsTableWrapper) return;
    if (!hostPortal.user) return;
    hostEls.bookingsTableWrapper.innerHTML = "<p style='color: var(--muted); font-size: 0.95rem;'>Loading bookings...</p>";
    const bookings = await firebaseApi.fetchBookings();
    if (!bookings.length) {
      hostEls.bookingsTableWrapper.innerHTML = "<p style='color: var(--muted); font-size: 0.95rem;'>No bookings yet.</p>";
      return;
    }

    hostEls.bookingsTableWrapper.innerHTML = `
      <table class="bookings-table">
        <thead>
          <tr>
            <th>Name</th>
            <th>Dates</th>
            <th>Apartment</th>
            <th>Contact</th>
            <th>Status</th>
          </tr>
        </thead>
        <tbody>
          ${bookings.map(booking => `
            <tr data-booking-id="${escapeHtml(booking.id)}">
              <td>
                <strong>${escapeHtml(booking.name || "")}</strong><br>
                <small>${escapeHtml(booking.email || "")}</small>
              </td>
              <td>${escapeHtml(booking.checkin || "")} to ${escapeHtml(booking.checkout || "")}</td>
              <td>${escapeHtml(booking.apartment || "")}<br><small>${escapeHtml(booking.guests || "")} guests</small></td>
              <td>${escapeHtml(booking.phone || "")}</td>
              <td>
                <select class="status-select" data-status-select="${escapeHtml(booking.id)}">
                  ${["new", "confirmed", "checked_in", "completed", "cancelled"].map(status => `<option value="${status}" ${booking.status === status ? "selected" : ""}>${status.replace(/_/g, " ")}</option>`).join("")}
                </select>
              </td>
            </tr>
          `).join("")}
        </tbody>
      </table>
    `;

    hostEls.bookingsTableWrapper.querySelectorAll("[data-status-select]").forEach(select => {
      select.addEventListener("change", async function () {
        const bookingId = this.dataset.statusSelect;
        await firebaseApi.updateBookingStatus(bookingId, this.value);
      });
    });
  }

  function bindPortalEvents() {
    if (!document.body.dataset.hostPortalBound) {
      document.body.dataset.hostPortalBound = "true";
      document.addEventListener("click", async function (event) {
        const portalLink = event.target.closest("#hostPortalBtn");
        if (!portalLink) return;
        if (portalLink.tagName.toLowerCase() === "a" && portalLink.getAttribute("href") === "admin.html") {
          return;
        }
        event.preventDefault();
        showHostPortal();
        const firebaseApi = await getFirebaseApi();
        hostPortal.user = firebaseApi?.getCurrentUser() || null;
        if (hostPortal.user) {
          try {
            await loadPortalState();
            if (hostEls.loginBox) hostEls.loginBox.style.display = "none";
            if (hostEls.dashboard) hostEls.dashboard.style.display = "flex";
            await loadBookings();
          } catch (err) {
            console.error(err);
          }
        } else {
          if (hostEls.loginBox) hostEls.loginBox.style.display = "block";
          if (hostEls.dashboard) hostEls.dashboard.style.display = "none";
        }
      });
    }

    if (hostEls.closeBtn) {
      hostEls.closeBtn.addEventListener("click", hideHostPortal);
    }

    if (hostEls.modal) {
      hostEls.modal.addEventListener("click", function (event) {
        if (event.target === hostEls.modal) hideHostPortal();
      });
    }

    if (hostEls.loginBtn) {
      hostEls.loginBtn.addEventListener("click", async function () {
        try {
          showLoginError("");
          const email = hostEls.emailInput?.value?.trim();
          const password = hostEls.passwordInput?.value || "";
          if (!email || !password) {
            showLoginError("Please enter your email and password.");
            return;
          }
          const firebaseApi = await getFirebaseApi();
          if (!firebaseApi?.signInAdmin) {
            if (window.firebaseInitStatus === "error") {
              showLoginError(window.firebaseInitError || "Firebase could not initialize. Check your config and refresh.");
            } else {
              showLoginError("Firebase is still loading. Please wait a moment and try again.");
            }
            return;
          }
          hostPortal.user = await firebaseApi.signInAdmin(email, password);
          if (hostEls.loginBox) hostEls.loginBox.style.display = "none";
          if (hostEls.dashboard) hostEls.dashboard.style.display = "flex";
        } catch (err) {
          if (hostEls.loginBox) hostEls.loginBox.style.display = "block";
          if (hostEls.dashboard) hostEls.dashboard.style.display = "none";
          showLoginError(err.message || "Login failed");
        }
      });
    }

    if (hostEls.passwordInput) {
      hostEls.passwordInput.addEventListener("keydown", function (event) {
        if (event.key === "Enter") {
          event.preventDefault();
          hostEls.loginBtn?.click();
        }
      });
    }

    document.querySelectorAll(".tab-btn").forEach(btn => {
      btn.addEventListener("click", function () {
        const target = this.dataset.tab;
        document.querySelectorAll(".tab-btn").forEach(button => button.classList.toggle("active", button === this));
        document.querySelectorAll(".admin-tab-panel").forEach(panel => panel.classList.toggle("active", panel.id === target));
      });
    });

    const createBlankItem = schema => schema.reduce((acc, field) => {
      if (field.type === "checkbox") acc[field.key] = false;
      else if (field.type === "number") acc[field.key] = 0;
      else if (field.type === "csv") acc[field.key] = [];
      else if (field.type === "select") acc[field.key] = field.options?.[0]?.value ?? "";
      else acc[field.key] = "";
      return acc;
    }, {});

    const addItemToPath = (path, schema, renderFn) => {
      const parts = path.split(".");
      let target = hostPortal.state;
      for (let i = 0; i < parts.length - 1; i += 1) {
        target = target?.[parts[i]];
      }
      const key = parts[parts.length - 1];
      if (!target || !Array.isArray(target[key])) return;
      target[key].push(createBlankItem(schema));
      renderFn();
    };

    hostEls.addHeroStatBtn?.addEventListener("click", function () {
      if (!hostPortal.state) return;
      collectHostStateFromUI();
      addItemToPath("hero.statPills", portalSchemas.heroStats, renderHostState);
    });

    hostEls.addAboutFeatureBtn?.addEventListener("click", function () {
      if (!hostPortal.state) return;
      collectHostStateFromUI();
      addItemToPath("about.features", portalSchemas.aboutFeatures, renderHostState);
    });

    hostEls.addApartmentBtn?.addEventListener("click", function () {
      if (!hostPortal.state) return;
      collectHostStateFromUI();
      hostPortal.state.apartments.unshift(createBlankItem(portalSchemas.apartments));
      renderHostState();
    });

    hostEls.addAmenityBtn?.addEventListener("click", function () {
      if (!hostPortal.state) return;
      collectHostStateFromUI();
      hostPortal.state.amenities.push(createBlankItem(portalSchemas.amenities));
      renderHostState();
    });

    hostEls.addActivityBtn?.addEventListener("click", function () {
      if (!hostPortal.state) return;
      collectHostStateFromUI();
      hostPortal.state.activities.unshift(createBlankItem(portalSchemas.activities));
      renderHostState();
    });

    hostEls.addReviewBtn?.addEventListener("click", function () {
      if (!hostPortal.state) return;
      collectHostStateFromUI();
      hostPortal.state.testimonials.unshift(createBlankItem(portalSchemas.reviews));
      renderHostState();
    });

    hostEls.addFaqBtn?.addEventListener("click", function () {
      if (!hostPortal.state) return;
      collectHostStateFromUI();
      hostPortal.state.faq.push(createBlankItem(portalSchemas.faq));
      renderHostState();
    });

    hostEls.addRuleBtn?.addEventListener("click", function () {
      if (!hostPortal.state) return;
      collectHostStateFromUI();
      hostPortal.state.seasonalRules.push({
        month: normalizeMonth(hostEls.ruleMonth?.value || 0),
        price: Number(hostEls.rulePrice?.value || 0),
        enabled: true
      });
      if (hostEls.rulePrice) hostEls.rulePrice.value = "";
      renderSeasonRules();
    });

    hostEls.addBlockBtn?.addEventListener("click", function () {
      if (!hostPortal.state) return;
      collectHostStateFromUI();
      const start = hostEls.blockStart?.value || "";
      const end = hostEls.blockEnd?.value || "";
      if (!start || !end) return;
      hostPortal.state.blockedRanges.push({ start, end });
      if (hostEls.blockStart) hostEls.blockStart.value = "";
      if (hostEls.blockEnd) hostEls.blockEnd.value = "";
      renderBlockedRanges();
    });

    hostEls.refreshBookingsBtn?.addEventListener("click", loadBookings);

    hostEls.triggerUploadBtn?.addEventListener("click", function () {
      hostEls.galleryUploadInput?.click();
    });

    hostEls.galleryUploadInput?.addEventListener("change", async function () {
      const files = Array.from(this.files || []);
      const firebaseApi = await getFirebaseApi();
      if (!files.length || !hostPortal.user || !firebaseApi?.uploadMedia) return;
      if (hostEls.uploadStatusText) hostEls.uploadStatusText.textContent = "Uploading...";
        try {
        for (const file of files) {
          const payload = await firebaseApi.uploadMedia(file, "gallery");
          hostPortal.state.customPhotos.unshift({ src: payload.url, caption: file.name.replace(/\.[^.]+$/, "") });
        }
        renderGalleryManager();
        await savePortalState("Gallery uploaded");
        if (hostEls.uploadStatusText) hostEls.uploadStatusText.textContent = "Upload complete.";
      } catch (err) {
        if (hostEls.uploadStatusText) hostEls.uploadStatusText.textContent = err.message || "Upload failed";
      } finally {
        this.value = "";
      }
    });

    hostEls.customGalleryManager?.addEventListener("click", async function (event) {
      const saveBtn = event.target.closest("[data-save-caption]");
      const deleteBtn = event.target.closest("[data-remove-photo]");

      if (saveBtn) {
        const index = Number(saveBtn.dataset.saveCaption);
        const card = saveBtn.closest(".custom-gallery-card");
        const captionInput = card?.querySelector('[data-key="caption"]');
        if (hostPortal.state?.customPhotos?.[index] && captionInput) {
          hostPortal.state.customPhotos[index].caption = captionInput.value.trim();
          await savePortalState("Caption saved");
          renderGalleryManager();
        }
      }

      if (deleteBtn) {
        const index = Number(deleteBtn.dataset.removePhoto);
        if (!Number.isNaN(index)) {
          hostPortal.state.customPhotos.splice(index, 1);
          renderGalleryManager();
          await savePortalState("Photo removed");
        }
      }
    });

    hostEls.saveHeroBtn?.addEventListener("click", async function () {
      try { await savePortalState("Hero saved"); alert("Hero section saved."); } catch (err) { alert(err.message); }
    });
    hostEls.saveAboutBtn?.addEventListener("click", async function () {
      try { await savePortalState("About saved"); alert("About section saved."); } catch (err) { alert(err.message); }
    });
    
    const handleAboutUpload = async (inputId) => {
      const urls = await openMediaPicker({ multiple: false });
      if (!urls.length) return;
      const input = document.getElementById(inputId);
      if (input) {
        input.value = urls[0];
        collectHostStateFromUI();
        renderHostState();
      }
    };
    document.getElementById("uploadAboutImg1Btn")?.addEventListener("click", () => handleAboutUpload("aboutImg1Input"));
    document.getElementById("uploadAboutImg2Btn")?.addEventListener("click", () => handleAboutUpload("aboutImg2Input"));
    document.getElementById("uploadAboutImg3Btn")?.addEventListener("click", () => handleAboutUpload("aboutImg3Input"));

    hostEls.saveApartmentsBtn?.addEventListener("click", async function () {
      try { await savePortalState("Apartments saved"); alert("Apartments saved."); } catch (err) { alert(err.message); }
    });
    hostEls.saveAmenitiesBtn?.addEventListener("click", async function () {
      try { await savePortalState("Amenities saved"); alert("Amenities saved."); } catch (err) { alert(err.message); }
    });
    hostEls.saveActivitiesBtn?.addEventListener("click", async function () {
      try { await savePortalState("Activities saved"); alert("Activities saved."); } catch (err) { alert(err.message); }
    });
    hostEls.saveReviewsBtn?.addEventListener("click", async function () {
      try { await savePortalState("Reviews saved"); alert("Reviews saved."); } catch (err) { alert(err.message); }
    });
    hostEls.saveFaqBtn?.addEventListener("click", async function () {
      try { await savePortalState("FAQ saved"); alert("FAQ saved."); } catch (err) { alert(err.message); }
    });
    hostEls.saveContactBtn?.addEventListener("click", async function () {
      try { await savePortalState("Contact saved"); alert("Contact details saved."); } catch (err) { alert(err.message); }
    });
    hostEls.saveBasePriceBtn?.addEventListener("click", async function () {
      try { await savePortalState("Pricing saved"); alert("Pricing saved."); } catch (err) { alert(err.message); }
    });
    hostEls.savePaymentsBtn?.addEventListener("click", async function () {
      try { await savePortalState("Payments saved"); alert("Payment settings saved."); } catch (err) { alert(err.message); }
    });

    hostEls.signOutBtn?.addEventListener("click", async function () {
      try {
        const firebaseApi = await getFirebaseApi();
        if (firebaseApi?.signOutAdmin) {
          await firebaseApi.signOutAdmin();
        }
        hostPortal.user = null;
        hostPortal.state = null;
        if (hostEls.loginBox) hostEls.loginBox.style.display = "block";
        if (hostEls.dashboard) hostEls.dashboard.style.display = "none";
        if (hostEls.authStatusMsg) hostEls.authStatusMsg.textContent = "Signed out successfully.";
      } catch (err) {
        if (hostEls.authStatusMsg) hostEls.authStatusMsg.textContent = err.message || "Could not sign out.";
      }
    });

    hostEls.heroStats?.addEventListener("click", function (event) {
      const removeBtn = event.target.closest("[data-remove]");
      if (!removeBtn || !hostPortal.state) return;
      collectHostStateFromUI();
      hostPortal.state.hero.statPills.splice(Number(removeBtn.dataset.remove), 1);
      renderHostState();
    });

    hostEls.aboutFeatures?.addEventListener("click", function (event) {
      const removeBtn = event.target.closest("[data-remove]");
      if (!removeBtn || !hostPortal.state) return;
      collectHostStateFromUI();
      hostPortal.state.about.features.splice(Number(removeBtn.dataset.remove), 1);
      renderHostState();
    });

    hostEls.apartments?.addEventListener("click", function (event) {
      const removeBtn = event.target.closest("[data-remove]");
      const uploadBtn = event.target.closest("[data-upload-images]");
      if (uploadBtn && hostPortal.state) {
        (async () => {
          const index = Number(uploadBtn.dataset.uploadImages);
          const urls = await openMediaPicker({ multiple: true });
          if (!urls.length) return;
          const item = hostEls.apartments?.querySelector(`.repeater-item[data-index="${index}"]`);
          const textarea = item?.querySelector('[data-key="images"]');
          if (!textarea) return;
          const current = textarea.value.trim();
          const next = [current, ...urls].filter(Boolean).join(", ");
          updateRepeaterField(hostEls.apartments, index, "images", next);
          collectHostStateFromUI();
          renderHostState();
        })();
        return;
      }
      if (!removeBtn || !hostPortal.state) return;
      collectHostStateFromUI();
      hostPortal.state.apartments.splice(Number(removeBtn.dataset.remove), 1);
      renderHostState();
    });

    hostEls.amenities?.addEventListener("click", function (event) {
      const removeBtn = event.target.closest("[data-remove]");
      if (!removeBtn || !hostPortal.state) return;
      collectHostStateFromUI();
      hostPortal.state.amenities.splice(Number(removeBtn.dataset.remove), 1);
      renderHostState();
    });

    hostEls.activities?.addEventListener("click", function (event) {
      const removeBtn = event.target.closest("[data-remove]");
      const uploadBtn = event.target.closest("[data-upload-image]");
      if (uploadBtn && hostPortal.state) {
        (async () => {
          const index = Number(uploadBtn.dataset.uploadImage);
          const urls = await openMediaPicker({ multiple: false });
          if (!urls.length) return;
          updateRepeaterField(hostEls.activities, index, "image", urls[0]);
          collectHostStateFromUI();
          renderHostState();
        })();
        return;
      }
      if (!removeBtn || !hostPortal.state) return;
      collectHostStateFromUI();
      hostPortal.state.activities.splice(Number(removeBtn.dataset.remove), 1);
      renderHostState();
    });

    hostEls.reviews?.addEventListener("click", function (event) {
      const removeBtn = event.target.closest("[data-remove]");
      const uploadBtn = event.target.closest("[data-upload-image]");
      if (uploadBtn && hostPortal.state) {
        (async () => {
          const index = Number(uploadBtn.dataset.uploadImage);
          const urls = await openMediaPicker({ multiple: false });
          if (!urls.length) return;
          updateRepeaterField(hostEls.reviews, index, "image", urls[0]);
          collectHostStateFromUI();
          renderHostState();
        })();
        return;
      }
      if (!removeBtn || !hostPortal.state) return;
      collectHostStateFromUI();
      hostPortal.state.testimonials.splice(Number(removeBtn.dataset.remove), 1);
      renderHostState();
    });

    hostEls.faq?.addEventListener("click", function (event) {
      const removeBtn = event.target.closest("[data-remove]");
      if (!removeBtn || !hostPortal.state) return;
      collectHostStateFromUI();
      hostPortal.state.faq.splice(Number(removeBtn.dataset.remove), 1);
      renderHostState();
    });

    hostEls.seasonsList?.addEventListener("click", function (event) {
      const removeBtn = event.target.closest("[data-remove-rule]");
      if (!removeBtn || !hostPortal.state) return;
      collectHostStateFromUI();
      hostPortal.state.seasonalRules.splice(Number(removeBtn.dataset.removeRule), 1);
      renderSeasonRules();
    });

    hostEls.blockedList?.addEventListener("click", function (event) {
      const removeBtn = event.target.closest("[data-remove-blocked]");
      if (!removeBtn || !hostPortal.state) return;
      collectHostStateFromUI();
      hostPortal.state.blockedRanges.splice(Number(removeBtn.dataset.removeBlocked), 1);
      renderBlockedRanges();
    });

  }

  bindPortalEvents();
  if (window.firebaseApiReady && typeof window.firebaseApiReady.then === "function") {
    window.firebaseApiReady.then(() => {
      updateFirebaseLoginState();
    }).catch(() => {
      updateFirebaseLoginState();
    });
  }
  getFirebaseApi().then(firebaseApi => {
    if (!firebaseApi?.onAuthChange) return;
    firebaseApi.onAuthChange(user => {
      hostPortal.user = user;
      if (!hostEls.modal?.classList.contains("active")) return;
      if (user) {
        if (hostEls.loginBox) hostEls.loginBox.style.display = "none";
        if (hostEls.dashboard) hostEls.dashboard.style.display = "flex";
        loadPortalState().then(loadBookings).catch(console.error);
      } else {
        if (hostEls.loginBox) hostEls.loginBox.style.display = "block";
        if (hostEls.dashboard) hostEls.dashboard.style.display = "none";
      }
    });
  });
})();

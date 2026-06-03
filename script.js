(async function () {
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

  let currentLightboxIndex = 0;
  function initLightbox() {
    const lightbox = document.getElementById("lightbox");
    const lightboxImage = document.getElementById("lightboxImage");
    const lightboxCaption = document.getElementById("lightboxCaption");
    const closeBtn = document.getElementById("lightboxClose");
    const prevBtn = document.getElementById("lightboxPrev");
    const nextBtn = document.getElementById("lightboxNext");

    if (!lightbox || !lightboxImage || !lightboxCaption) return;

    function getItems() {
      return Array.from(document.querySelectorAll(".gallery-item"));
    }

    function openAt(index) {
      const items = getItems();
      if (index < 0 || index >= items.length) return;
      const item = items[index];
      const img = item.querySelector("img");
      const caption = item.querySelector("figcaption");
      if (!img) return;
      currentLightboxIndex = index;
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

    // Event delegation on the gallery grid container
    const galleryGrid = document.querySelector(".gallery-grid");
    if (galleryGrid) {
      galleryGrid.addEventListener("click", function (event) {
        const item = event.target.closest(".gallery-item");
        if (item) {
          const items = getItems();
          const idx = items.indexOf(item);
          if (idx !== -1) {
            openAt(idx);
          }
        }
      });
    }

    if (closeBtn) closeBtn.addEventListener("click", close);

    if (prevBtn) {
      prevBtn.addEventListener("click", function () {
        const items = getItems();
        openAt((currentLightboxIndex - 1 + items.length) % items.length);
      });
    }

    if (nextBtn) {
      nextBtn.addEventListener("click", function () {
        const items = getItems();
        openAt((currentLightboxIndex + 1) % items.length);
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
      if (event.key === "ArrowLeft") {
        const items = getItems();
        openAt((currentLightboxIndex - 1 + items.length) % items.length);
      }
      if (event.key === "ArrowRight") {
        const items = getItems();
        openAt((currentLightboxIndex + 1) % items.length);
      }
    });
  }

  // -------------------------------------------------------------
  // STATE MANAGEMENT (LOCAL STORAGE)
  // -------------------------------------------------------------
  const STATE_KEY = "mkay_apartments_state_v1";
  const defaultState = {
    basePrice: 2000,
    seasonalRules: [
      { month: 7, price: 2500, label: "August Peak Season" } // August is index 7 (0-indexed)
    ],
    blockedRanges: [], // Array of { start: 'YYYY-MM-DD', end: 'YYYY-MM-DD' }
    paymentMethods: [
      { id: "mtn", name: "MTN Mobile Money", icon: "fa-solid fa-mobile-screen-button", image: "payments icon/mtn-new-logo.svg", enabled: true, details: "Send to MTN Mobile Money:\nMerchant Code / Number: +260 764336304\nName: M Kay Apartments Ltd" },
      { id: "airtel", name: "Airtel Money", icon: "fa-solid fa-mobile-screen-button", image: "payments icon/Airtel_logo-02.png", enabled: true, details: "Send to Airtel Money:\nNumber: +260 978176858\nName: Masozi Kamanga" },
      { id: "fnb", name: "FNB Bank Transfer", icon: "fa-solid fa-building-columns", image: "payments icon/FNB-Logo.png", enabled: true, details: "Bank: First National Bank (FNB)\nAccount: 62981726354\nBranch: Livingstone\nName: M KAY APARTMENTS LTD" },
      { id: "visa", name: "Visa", icon: "fa-brands fa-cc-visa", image: "payments icon/Visa_Inc-_idDUM8TcN7_1.png", enabled: true, details: "We will email/WhatsApp you a secure payment link to pay with your Visa card." },
      { id: "mastercard", name: "Mastercard", icon: "fa-brands fa-cc-mastercard", image: "payments icon/Mastercard_Symbol_1.png", enabled: true, details: "We will email/WhatsApp you a secure payment link to pay with your Mastercard." },
      { id: "cash", name: "Cash on Arrival", icon: "fa-solid fa-money-bill-wave", enabled: true, details: "Pay cash in Zambian Kwacha (K) or USD upon arrival at check-in." }
    ],
    customPhotos: [] // Array of { src: 'data:image/jpeg;base64...', caption: '...' }
  };

  let state = defaultState;

  async function loadState() {
    try {
      const response = await fetch('/api/state');
      if (response.ok) {
        const fetchedState = await response.json();
        state = fetchedState;
        
        // Merge defaults for any missing keys
        for (let key in defaultState) {
          if (state[key] === undefined) {
            state[key] = defaultState[key];
          }
        }
        
        // Migrate old "card" method to separate Visa and Mastercard
        if (state.paymentMethods && Array.isArray(state.paymentMethods)) {
          const cardIdx = state.paymentMethods.findIndex(m => m.id === "card");
          if (cardIdx !== -1) {
            const visaDef = defaultState.paymentMethods.find(m => m.id === "visa");
            const mcDef = defaultState.paymentMethods.find(m => m.id === "mastercard");
            state.paymentMethods.splice(cardIdx, 1, visaDef, mcDef);
          }

          // Ensure any new default methods are present
          defaultState.paymentMethods.forEach(defMethod => {
            if (!state.paymentMethods.find(m => m.id === defMethod.id)) {
              state.paymentMethods.push(defMethod);
            }
          });

          // Merge image and icon properties from defaults
          state.paymentMethods.forEach(method => {
            const defMethod = defaultState.paymentMethods.find(m => m.id === method.id);
            if (defMethod) {
              method.icon = defMethod.icon;
              method.image = defMethod.image;
            }
          });
        }
      } else {
        console.error("Failed to fetch state from server, using default");
        state = defaultState;
      }
      renderWebsiteContent();
    } catch (e) {
      console.error("Error fetching state:", e);
      state = defaultState;
    }
  }

  async function saveState() {
    try {
      const token = sessionStorage.getItem('adminToken');
      if (!token) return; // Only save if authenticated
      
      const response = await fetch('/api/state', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ token, state })
      });
      
      if (!response.ok) {
        console.error("Failed to save state to server");
      }
    } catch (e) {
      console.error("Error saving state:", e);
    }
  }

  // -------------------------------------------------------------
  // PRICING ENGINE
  // -------------------------------------------------------------
  function getNightlyRateForDate(dateStr) {
    const date = new Date(dateStr);
    const month = date.getMonth();
    const rule = state.seasonalRules.find(r => Number(r.month) === month);
    return rule ? Number(rule.price) : Number(state.basePrice);
  }

  function isHighSeasonDate(dateStr) {
    const date = new Date(dateStr);
    const month = date.getMonth();
    return state.seasonalRules.some(r => Number(r.month) === month);
  }

  function calculateStayBreakdown(checkInStr, checkOutStr) {
    if (!checkInStr || !checkOutStr) return null;
    const start = new Date(checkInStr);
    const end = new Date(checkOutStr);
    if (end <= start) return null;

    let totalNights = 0;
    let totalCost = 0;
    const breakdown = {};

    let current = new Date(start);
    while (current < end) {
      const dateString = current.toISOString().split("T")[0];
      const rate = getNightlyRateForDate(dateString);
      totalCost += rate;
      totalNights++;
      breakdown[rate] = (breakdown[rate] || 0) + 1;
      current.setDate(current.getDate() + 1);
    }

    return { totalNights, totalCost, breakdown };
  }

  function isDateBlocked(dateStr) {
    return state.blockedRanges.some(range => {
      return dateStr >= range.start && dateStr <= range.end;
    });
  }

  // -------------------------------------------------------------
  // VISITOR CALENDAR ENGINE
  // -------------------------------------------------------------
  let calendarYear = new Date().getFullYear();
  let calendarMonth = new Date().getMonth();
  let selectedCheckIn = null;
  let selectedCheckOut = null;

  function initCalendar() {
    const prevBtn = document.getElementById("prevMonthBtn");
    const nextBtn = document.getElementById("nextMonthBtn");

    if (prevBtn && nextBtn) {
      prevBtn.addEventListener("click", function () {
        calendarMonth--;
        if (calendarMonth < 0) {
          calendarMonth = 11;
          calendarYear--;
        }
        renderCalendarGrid();
      });

      nextBtn.addEventListener("click", function () {
        calendarMonth++;
        if (calendarMonth > 11) {
          calendarMonth = 0;
          calendarYear++;
        }
        renderCalendarGrid();
      });
    }

    // Sync input changes back to calendar
    const checkinInput = document.getElementById("checkin");
    const checkoutInput = document.getElementById("checkout");

    if (checkinInput && checkoutInput) {
      checkinInput.addEventListener("change", function () {
        selectedCheckIn = checkinInput.value;
        if (checkoutInput.value && checkoutInput.value < selectedCheckIn) {
          selectedCheckOut = selectedCheckIn;
          checkoutInput.value = selectedCheckIn;
        } else {
          selectedCheckOut = checkoutInput.value;
        }
        renderCalendarGrid();
        updatePriceBreakdown();
      });

      checkoutInput.addEventListener("change", function () {
        selectedCheckOut = checkoutInput.value;
        if (checkinInput.value && selectedCheckOut < checkinInput.value) {
          selectedCheckIn = selectedCheckOut;
          checkinInput.value = selectedCheckOut;
        }
        renderCalendarGrid();
        updatePriceBreakdown();
      });
    }

    renderCalendarGrid();
  }

  function renderCalendarGrid() {
    const months = [
      "January", "February", "March", "April", "May", "June",
      "July", "August", "September", "October", "November", "December"
    ];
    const currentMonthYear = document.getElementById("currentMonthYear");
    const grid = document.getElementById("calendarDaysGrid");
    if (!currentMonthYear || !grid) return;

    currentMonthYear.textContent = months[calendarMonth] + " " + calendarYear;
    grid.innerHTML = "";

    const firstDayIndexRaw = new Date(calendarYear, calendarMonth, 1).getDay();
    const firstDayIndex = firstDayIndexRaw === 0 ? 6 : firstDayIndexRaw - 1; // Mon-Sun layout
    const daysInMonth = new Date(calendarYear, calendarMonth + 1, 0).getDate();

    const todayStr = new Date().toISOString().split("T")[0];

    // Blank cells
    for (let i = 0; i < firstDayIndex; i++) {
      const cell = document.createElement("div");
      cell.className = "calendar-day empty";
      grid.appendChild(cell);
    }

    // Active days
    for (let d = 1; d <= daysInMonth; d++) {
      const cell = document.createElement("button");
      cell.type = "button";
      cell.className = "calendar-day";

      const cellDate = new Date(calendarYear, calendarMonth, d);
      const dateStr = cellDate.toISOString().split("T")[0];

      const numLabel = document.createElement("span");
      numLabel.textContent = String(d);
      cell.appendChild(numLabel);

      const rateVal = getNightlyRateForDate(dateStr);
      const priceLabel = document.createElement("span");
      priceLabel.className = "calendar-day-price";
      priceLabel.textContent = "K" + (rateVal / 1000).toFixed(1) + "k";
      cell.appendChild(priceLabel);

      const isPast = dateStr < todayStr;
      const isBlocked = isDateBlocked(dateStr);

      if (isPast || isBlocked) {
        cell.classList.add("blocked");
        cell.setAttribute("disabled", "true");
      } else {
        if (isHighSeasonDate(dateStr)) {
          cell.classList.add("holiday-season");
        }

        if (selectedCheckIn === dateStr) {
          cell.classList.add("range-start");
        } else if (selectedCheckOut === dateStr) {
          cell.classList.add("range-end");
        } else if (selectedCheckIn && selectedCheckOut && dateStr > selectedCheckIn && dateStr < selectedCheckOut) {
          cell.classList.add("range-mid");
        }

        cell.addEventListener("click", function () {
          handleCalendarDateClick(dateStr);
        });
      }

      grid.appendChild(cell);
    }
  }

  function handleCalendarDateClick(dateStr) {
    if (!selectedCheckIn || (selectedCheckIn && selectedCheckOut)) {
      selectedCheckIn = dateStr;
      selectedCheckOut = null;
    } else {
      if (dateStr < selectedCheckIn) {
        selectedCheckIn = dateStr;
      } else if (dateStr === selectedCheckIn) {
        selectedCheckIn = null;
      } else {
        // Validate no blocked dates inside selected range
        let hasBlocked = false;
        let start = new Date(selectedCheckIn);
        let end = new Date(dateStr);
        let current = new Date(start);
        while (current <= end) {
          const currentStr = current.toISOString().split("T")[0];
          if (isDateBlocked(currentStr)) {
            hasBlocked = true;
            break;
          }
          current.setDate(current.getDate() + 1);
        }

        if (hasBlocked) {
          alert("This range contains unavailable dates. Please try another range.");
          selectedCheckIn = dateStr;
        } else {
          selectedCheckOut = dateStr;
        }
      }
    }

    const checkinInput = document.getElementById("checkin");
    const checkoutInput = document.getElementById("checkout");
    if (checkinInput) checkinInput.value = selectedCheckIn || "";
    if (checkoutInput) checkoutInput.value = selectedCheckOut || "";

    renderCalendarGrid();
    updatePriceBreakdown();
  }

  function updatePriceBreakdown() {
    const checkinVal = document.getElementById("checkin").value;
    const checkoutVal = document.getElementById("checkout").value;
    const card = document.getElementById("priceBreakdownCard");
    const details = document.getElementById("breakdownDetails");
    const totalNode = document.getElementById("breakdownTotalPrice");

    if (!checkinVal || !checkoutVal || checkinVal === checkoutVal) {
      if (card) card.style.display = "none";
      return;
    }

    const res = calculateStayBreakdown(checkinVal, checkoutVal);
    if (!res || res.totalNights <= 0) {
      if (card) card.style.display = "none";
      return;
    }

    if (card && details && totalNode) {
      card.style.display = "block";
      details.innerHTML = "";
      for (let rate in res.breakdown) {
        const nights = res.breakdown[rate];
        const row = document.createElement("div");
        row.innerHTML = `<span>${nights} night${nights > 1 ? 's' : ''} @ K${Number(rate).toLocaleString()} / night</span><strong>K${(nights * rate).toLocaleString()}</strong>`;
        details.appendChild(row);
      }
      totalNode.textContent = "K" + res.totalCost.toLocaleString();
    }
  }

  // -------------------------------------------------------------
  // DYNAMIC GALLERY DISPLAY
  // -------------------------------------------------------------
  function renderCustomGallery() {
    const grid = document.querySelector(".gallery-grid");
    if (!grid) return;

    grid.querySelectorAll(".custom-uploaded-item").forEach(item => item.remove());

    state.customPhotos.forEach(photo => {
      const figure = document.createElement("figure");
      figure.className = "gallery-item custom-uploaded-item";
      figure.style.opacity = "1";
      figure.style.transform = "translateY(0)";
      
      const img = document.createElement("img");
      img.src = photo.src;
      img.alt = photo.caption || "Guest Uploaded Photo";
      img.loading = "lazy";

      const figcaption = document.createElement("figcaption");
      figcaption.textContent = photo.caption || "Customer Shared";

      figure.appendChild(img);
      figure.appendChild(figcaption);
      grid.appendChild(figure);
    });
  }

  function renderApartmentCards() {
    const grid = document.querySelector('.apartment-grid');
    if (!grid || !Array.isArray(state.apartments)) return;

    grid.innerHTML = state.apartments.map((apartment, index) => {
      const imageItems = Array.isArray(apartment.images) ? apartment.images.map(src => `<img src="${src}" alt="${apartment.name}" loading="lazy">`).join('') : '';
      const features = Array.isArray(apartment.features) ? apartment.features.map(feature => `<li>${feature}</li>`).join('') : '';
      return `
        <article class="apartment-card reveal">
          <div class="availability available">${apartment.badge || 'Available'}</div>
          <div class="apartment-slider" data-slider>
            <div class="slider-track">
              ${imageItems}
            </div>
            <button class="slider-btn prev" data-prev aria-label="Previous image"><i class="fa-solid fa-chevron-left"></i></button>
            <button class="slider-btn next" data-next aria-label="Next image"><i class="fa-solid fa-chevron-right"></i></button>
          </div>
          <div class="apartment-body">
            <h3>${apartment.name}</h3>
            <p class="price">${apartment.priceLabel || 'K' + (state.basePrice || 2000) + ' / night'}</p>
            <ul>${features}</ul>
            <a class="btn btn-sm" href="https://wa.me/${state.contact.whatsapp}?text=${encodeURIComponent(`Hello M KAY APARTMENTS, I want to book the ${apartment.name}.`)}" target="_blank" rel="noopener">Book Now</a>
          </div>
        </article>
      `;
    }).join('');
  }

  function renderApartmentOptions() {
    const select = document.getElementById('apartmentSelect');
    if (!select || !Array.isArray(state.apartments)) return;

    select.innerHTML = '<option value="">Select apartment</option>' + state.apartments.map(apartment => `
      <option value="${apartment.name}">${apartment.name} - ${apartment.priceLabel || 'Price on request'}</option>
    `).join('');
  }

  // -------------------------------------------------------------
  // PAYMENTS SELECTOR
  // -------------------------------------------------------------
  function renderPaymentSelector() {
    const grid = document.getElementById("paymentMethodsGrid");
    const detailsBox = document.getElementById("paymentInstructionsBox");
    const hiddenInput = document.getElementById("selectedPaymentMethodInput");
    if (!grid || !detailsBox) return;

    grid.innerHTML = "";
    detailsBox.style.display = "none";
    hiddenInput.value = "";

    const enabledMethods = state.paymentMethods.filter(m => m.enabled);
    enabledMethods.forEach(method => {
      const card = document.createElement("div");
      card.className = "payment-method-card";
      card.setAttribute("data-method", method.id);
      
      const iconHtml = method.image 
        ? `<img src="${method.image}" alt="${method.name}">`
        : `<i class="${method.icon}"></i>`;

      card.innerHTML = `
        ${iconHtml}
        <span>${method.name}</span>
      `;

      card.addEventListener("click", function () {
        document.querySelectorAll(".payment-method-card").forEach(c => c.classList.remove("active"));
        card.classList.add("active");
        
        hiddenInput.value = method.name;
        detailsBox.innerHTML = `
          <strong>${method.name} Transfer Instructions:</strong>
          <p style="white-space: pre-wrap; margin-top: 0.4rem; font-size: 0.85rem; font-family: sans-serif;">${method.details}</p>
        `;
        detailsBox.style.display = "block";
      });

      grid.appendChild(card);
    });
  }

  // -------------------------------------------------------------
  // ADMIN / HOST DASHBOARD CONTROLLER
  // -------------------------------------------------------------
  let isAdminAuthenticated = false;

  function initHostDashboard() {
    const portalBtn = document.getElementById("hostPortalBtn");
    const modal = document.getElementById("adminModal");
    const closeBtn = document.getElementById("adminModalClose");
    
    const loginBox = document.getElementById("adminLoginBox");
    const dashboardContent = document.getElementById("adminDashboardContent");
    const pinInput = document.getElementById("adminPin");
    const loginBtn = document.getElementById("adminLoginBtn");
    const loginError = document.getElementById("adminLoginError");

    if (!portalBtn || !modal) return;

    portalBtn.addEventListener("click", function (e) {
      e.preventDefault();
      modal.classList.add("active");
      modal.setAttribute("aria-hidden", "false");
      body.style.overflow = "hidden";

      if (!isAdminAuthenticated) {
        loginBox.style.display = "block";
        dashboardContent.style.display = "none";
        pinInput.value = "";
        loginError.style.display = "none";
      } else {
        loginBox.style.display = "none";
        dashboardContent.style.display = "block";
        renderDashboardPanels();
      }
    });

    function closeModal() {
      modal.classList.remove("active");
      modal.setAttribute("aria-hidden", "true");
      body.style.overflow = "";
    }

    if (closeBtn) closeBtn.addEventListener("click", closeModal);
    modal.addEventListener("click", function (e) {
      if (e.target === modal) closeModal();
    });

    if (loginBtn && pinInput) {
      loginBtn.addEventListener("click", submitPin);
      pinInput.addEventListener("keydown", function (e) {
        if (e.key === "Enter") submitPin();
      });
    }

    async function submitPin() {
      const pin = pinInput.value;
      loginBtn.disabled = true;
      loginBtn.textContent = "Verifying...";
      
      try {
        const response = await fetch('/api/auth', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ pin })
        });
        
        const data = await response.json();
        
        if (data.success) {
          isAdminAuthenticated = true;
          sessionStorage.setItem('adminToken', data.token);
          loginBox.style.display = "none";
          dashboardContent.style.display = "block";
          loginError.style.display = "none";
          renderDashboardPanels();
        } else {
          loginError.textContent = "Incorrect PIN code. Try again.";
          loginError.style.display = "block";
          pinInput.value = "";
        }
      } catch (err) {
        loginError.textContent = "Error connecting to server.";
        loginError.style.display = "block";
      } finally {
        loginBtn.disabled = false;
        loginBtn.textContent = "Login";
      }
    }

    const tabBtns = dashboardContent.querySelectorAll(".tab-btn");
    const tabPanels = dashboardContent.querySelectorAll(".admin-tab-panel");

    tabBtns.forEach(btn => {
      btn.addEventListener("click", function () {
        tabBtns.forEach(b => b.classList.remove("active"));
        tabPanels.forEach(p => p.classList.remove("active"));

        btn.classList.add("active");
        const targetTab = btn.getAttribute("data-tab");
        const panel = document.getElementById(targetTab);
        if (panel) panel.classList.add("active");
      });
    });

    setupPricingActions();
    setupBlockedDatesActions();
    setupGalleryUploadActions();
    setupPaymentsSettingsActions();
    setupSettingsActions();
    setupCmsActions();
  }

  function setupSettingsActions() {
    const changePinBtn = document.getElementById("changePinBtn");
    if (!changePinBtn) return;

    changePinBtn.addEventListener("click", async function () {
      const currentPin = document.getElementById("currentPinInput").value;
      const newPin = document.getElementById("newPinInput").value;
      const confirmPin = document.getElementById("confirmPinInput").value;
      const statusMsg = document.getElementById("pinStatusMsg");

      if (!currentPin || !newPin || !confirmPin) {
        statusMsg.style.color = "#ff5252";
        statusMsg.textContent = "Please fill in all fields.";
        return;
      }

      if (newPin !== confirmPin) {
        statusMsg.style.color = "#ff5252";
        statusMsg.textContent = "New PIN and confirm PIN do not match.";
        return;
      }

      if (newPin.length !== 4) {
        statusMsg.style.color = "#ff5252";
        statusMsg.textContent = "PIN must be exactly 4 characters.";
        return;
      }

      changePinBtn.disabled = true;
      changePinBtn.textContent = "Updating...";
      
      try {
        const token = sessionStorage.getItem('adminToken');
        const response = await fetch('/api/pin', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ token, oldPin: currentPin, newPin })
        });
        
        const data = await response.json();
        if (data.success) {
          statusMsg.style.color = "var(--success)";
          statusMsg.textContent = "PIN updated successfully!";
          document.getElementById("currentPinInput").value = "";
          document.getElementById("newPinInput").value = "";
          document.getElementById("confirmPinInput").value = "";
        } else {
          statusMsg.style.color = "#ff5252";
          statusMsg.textContent = data.message || "Failed to update PIN.";
        }
      } catch (err) {
        statusMsg.style.color = "#ff5252";
        statusMsg.textContent = "Error connecting to server.";
      } finally {
        changePinBtn.disabled = false;
        changePinBtn.textContent = "Change PIN";
      }
    });
  }

  function renderDashboardPanels() {
    renderSeasonsList();
    renderBlockedRangesList();
    renderCustomGalleryManager();
    renderPaymentsSettingsList();
    renderCmsPanels();

    const basePriceInput = document.getElementById("adminBasePrice");
    if (basePriceInput) basePriceInput.value = state.basePrice;
  }

  function setupPricingActions() {
    const saveBaseBtn = document.getElementById("saveBasePriceBtn");
    const addRuleBtn = document.getElementById("addRuleBtn");

    if (saveBaseBtn) {
      saveBaseBtn.addEventListener("click", function () {
        const val = Number(document.getElementById("adminBasePrice").value);
        if (val && val > 0) {
          state.basePrice = val;
          saveState();
          alert("Base price updated successfully!");
          renderCalendarGrid();
          updatePriceBreakdown();
        }
      });
    }

    if (addRuleBtn) {
      addRuleBtn.addEventListener("click", function () {
        const monthSelect = document.getElementById("ruleMonth");
        const priceInput = document.getElementById("rulePrice");
        
        const monthVal = Number(monthSelect.value);
        const priceVal = Number(priceInput.value);
        const monthLabel = monthSelect.options[monthSelect.selectedIndex].text;

        if (priceVal && priceVal > 0) {
          const existingIdx = state.seasonalRules.findIndex(r => Number(r.month) === monthVal);
          const newRule = { month: monthVal, price: priceVal, label: monthLabel + " Custom Price" };
          
          if (existingIdx !== -1) {
            state.seasonalRules[existingIdx] = newRule;
          } else {
            state.seasonalRules.push(newRule);
          }

          saveState();
          priceInput.value = "";
          renderSeasonsList();
          renderCalendarGrid();
          updatePriceBreakdown();
          alert("Seasonal rule added/updated successfully!");
        } else {
          alert("Please enter a valid price.");
        }
      });
    }
  }

  function renderSeasonsList() {
    const container = document.getElementById("seasonsList");
    if (!container) return;
    container.innerHTML = "";

    if (state.seasonalRules.length === 0) {
      container.innerHTML = `<p style="color: var(--muted); font-size: 0.9rem; font-style: italic;">No seasonal price rules set.</p>`;
      return;
    }

    const months = [
      "January", "February", "March", "April", "May", "June",
      "July", "August", "September", "October", "November", "December"
    ];

    state.seasonalRules.forEach((rule, idx) => {
      const div = document.createElement("div");
      div.className = "season-item";
      div.innerHTML = `
        <span>${months[rule.month]}</span>
        <span>K${Number(rule.price).toLocaleString()} / night
          <button class="btn-delete-rule" data-index="${idx}" aria-label="Delete rule"><i class="fa-solid fa-trash-can"></i></button>
        </span>
      `;

      div.querySelector(".btn-delete-rule").addEventListener("click", function () {
        state.seasonalRules.splice(idx, 1);
        saveState();
        renderSeasonsList();
        renderCalendarGrid();
        updatePriceBreakdown();
      });

      container.appendChild(div);
    });
  }

  function setupBlockedDatesActions() {
    const addBlockBtn = document.getElementById("addBlockBtn");
    if (!addBlockBtn) return;

    addBlockBtn.addEventListener("click", function () {
      const startInput = document.getElementById("blockStart");
      const endInput = document.getElementById("blockEnd");

      if (startInput.value && endInput.value) {
        if (endInput.value < startInput.value) {
          alert("End date cannot be before start date.");
          return;
        }

        state.blockedRanges.push({
          start: startInput.value,
          end: endInput.value
        });

        saveState();
        startInput.value = "";
        endInput.value = "";
        
        renderBlockedRangesList();
        renderCalendarGrid();
        updatePriceBreakdown();
        alert("Dates blocked successfully!");
      } else {
        alert("Please select both start and end dates.");
      }
    });
  }

  function renderBlockedRangesList() {
    const container = document.getElementById("blockedRangesList");
    if (!container) return;
    container.innerHTML = "";

    if (state.blockedRanges.length === 0) {
      container.innerHTML = `<p style="color: var(--muted); font-size: 0.9rem; font-style: italic;">No dates currently blocked.</p>`;
      return;
    }

    function formatDate(str) {
      const d = new Date(str);
      return d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
    }

    state.blockedRanges.forEach((range, idx) => {
      const div = document.createElement("div");
      div.className = "blocked-item";
      div.innerHTML = `
        <span>${formatDate(range.start)} &rarr; ${formatDate(range.end)}</span>
        <button class="btn-delete-rule" data-index="${idx}" aria-label="Delete block"><i class="fa-solid fa-trash-can"></i></button>
      `;

      div.querySelector(".btn-delete-rule").addEventListener("click", function () {
        state.blockedRanges.splice(idx, 1);
        saveState();
        renderBlockedRangesList();
        renderCalendarGrid();
        updatePriceBreakdown();
      });

      container.appendChild(div);
    });
  }

  function setupGalleryUploadActions() {
    const trigger = document.getElementById("triggerUploadBtn");
    const fileInput = document.getElementById("galleryUploadInput");
    const statusText = document.getElementById("uploadStatusText");

    if (!trigger || !fileInput) return;

    trigger.addEventListener("click", function () {
      fileInput.click();
    });

    fileInput.addEventListener("change", async function () {
      const files = Array.from(fileInput.files);
      if (files.length === 0) return;

      if (statusText) statusText.textContent = `Processing ${files.length} image(s)...`;
      let successCount = 0;

      for (let file of files) {
        try {
          const compressedBase64 = await compressAndStoreImage(file);
          const caption = prompt(`Enter a caption for this picture (Optional):`, file.name.split(".")[0]);
          
          state.customPhotos.push({
            src: compressedBase64,
            caption: caption || "Guest Shared"
          });
          successCount++;
        } catch (err) {
          console.error(err);
          alert(`Failed to upload ${file.name}. Size might be too large.`);
        }
      }

      if (successCount > 0) {
        saveState();
        renderCustomGallery();
        renderCustomGalleryManager();
        if (statusText) statusText.textContent = `Successfully uploaded ${successCount} image(s).`;
      } else {
        if (statusText) statusText.textContent = `Upload failed.`;
      }
      fileInput.value = "";
    });
  }

  function compressAndStoreImage(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = function (event) {
        const img = new Image();
        img.src = event.target.result;
        img.onload = function () {
          const maxW = 800; // Cap width at 800px
          let w = img.width;
          let h = img.height;

          if (w > maxW) {
            h = Math.round((h * maxW) / w);
            w = maxW;
          }

          const canvas = document.createElement("canvas");
          canvas.width = w;
          canvas.height = h;
          const ctx = canvas.getContext("2d");
          ctx.drawImage(img, 0, 0, w, h);

          const compressedDataUrl = canvas.toDataURL("image/jpeg", 0.7);
          resolve(compressedDataUrl);
        };
        img.onerror = reject;
      };
      reader.onerror = reject;
    });
  }

  function renderCustomGalleryManager() {
    const container = document.getElementById("customGalleryManager");
    if (!container) return;
    container.innerHTML = "";

    if (state.customPhotos.length === 0) {
      container.innerHTML = `<p style="color: var(--muted); font-size: 0.9rem; font-style: italic;">No custom images uploaded yet.</p>`;
      return;
    }

    state.customPhotos.forEach((photo, idx) => {
      const card = document.createElement("div");
      card.className = "custom-gallery-card";
      card.innerHTML = `
        <img src="${photo.src}" alt="${photo.caption || ''}">
        <button class="btn-delete-image" data-index="${idx}" title="Delete Image"><i class="fa-solid fa-trash"></i></button>
      `;

      card.querySelector(".btn-delete-image").addEventListener("click", function () {
        if (confirm("Are you sure you want to delete this custom photo?")) {
          state.customPhotos.splice(idx, 1);
          saveState();
          renderCustomGallery();
          renderCustomGalleryManager();
        }
      });

      container.appendChild(card);
    });
  }

  function setupPaymentsSettingsActions() {
    const saveBtn = document.getElementById("savePaymentsBtn");
    if (!saveBtn) return;

    saveBtn.addEventListener("click", function () {
      const items = document.querySelectorAll(".payment-settings-item");
      items.forEach(item => {
        const id = item.getAttribute("data-id");
        const enabled = item.querySelector(".payment-checkbox").checked;
        const details = item.querySelector(".payment-details-textarea").value;

        const method = state.paymentMethods.find(m => m.id === id);
        if (method) {
          method.enabled = enabled;
          method.details = details;
        }
      });

      saveState();
      renderPaymentSelector();
      alert("Payment settings saved successfully!");
    });
  }

  function renderPaymentsSettingsList() {
    const container = document.getElementById("paymentSettingsList");
    if (!container) return;
    container.innerHTML = "";

    state.paymentMethods.forEach(method => {
      const div = document.createElement("div");
      div.className = "payment-settings-item";
      div.setAttribute("data-id", method.id);

      const iconHtml = method.image 
        ? `<img src="${method.image}" alt="${method.name}">`
        : `<i class="${method.icon}"></i>`;

      div.innerHTML = `
        <div class="payment-settings-header">
          <span>${iconHtml} ${method.name}</span>
          <label class="switch">
            <input type="checkbox" class="payment-checkbox" ${method.enabled ? 'checked' : ''}>
            <span class="slider-switch"></span>
          </label>
        </div>
        <textarea class="payment-details-textarea" rows="3" style="font-size:0.85rem;" placeholder="Payment instructions...">${method.details}</textarea>
      `;
      container.appendChild(div);
    });
  }

  // -------------------------------------------------------------
  // FORM & INPUT SETUPS
  // -------------------------------------------------------------
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
        
        const checkin = data.get("checkin") || "";
        const checkout = data.get("checkout") || "";
        const breakdown = calculateStayBreakdown(checkin, checkout);
        const paymentMethod = data.get("payment_method") || "Not selected";

        let priceMessagePart = "";
        if (breakdown) {
          priceMessagePart = `\nPrice Details:\n - Total Nights: ${breakdown.totalNights}\n - Estimated Cost: K${breakdown.totalCost.toLocaleString()}`;
          let breakdownList = [];
          for (let rate in breakdown.breakdown) {
            breakdownList.push(`   (${breakdown.breakdown[rate]} night(s) @ K${Number(rate).toLocaleString()}/night)`);
          }
          priceMessagePart += "\n" + breakdownList.join("\n");
        }

        const message = [
          "Hello M KAY APARTMENTS LTD, I would like to reserve an apartment.",
          "Name: " + (data.get("name") || ""),
          "Phone: " + (data.get("phone") || ""),
          "Email: " + (data.get("email") || "Not provided"),
          "Apartment: " + (data.get("apartment") || ""),
          "Guests: " + (data.get("guests") || ""),
          "Check-in: " + checkin,
          "Check-out: " + checkout,
          priceMessagePart,
          "Preferred Payment: " + paymentMethod,
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

  // -------------------------------------------------------------
  // CMS DASHBOARD RENDER & SETUP
  // -------------------------------------------------------------
  function renderCmsPanels() {
    if (!state.hero) return; // Wait for state to be fully loaded

    // Hero
    document.getElementById("heroKickerInput").value = state.hero.kicker || "";
    document.getElementById("heroHeadlineInput").value = state.hero.headline || "";
    document.getElementById("heroSubtitleInput").value = state.hero.subtitle || "";
    renderRepeater("heroStatsList", state.hero.statPills || [], ["icon", "text"]);

    // About
    document.getElementById("aboutTitleInput").value = state.about.title || "";
    document.getElementById("aboutP1Input").value = state.about.paragraphs?.[0] || "";
    document.getElementById("aboutP2Input").value = state.about.paragraphs?.[1] || "";
    document.getElementById("aboutImg1Input").value = state.about.images?.[0] || "";
    document.getElementById("aboutImg2Input").value = state.about.images?.[1] || "";
    document.getElementById("aboutImg3Input").value = state.about.images?.[2] || "";
    renderRepeater("aboutFeaturesList", state.about.features || [], ["icon", "text"]);

    // Arrays
    renderRepeater("amenitiesList", state.amenities || [], ["icon", "name"]);
    renderRepeater("activitiesList", state.activities || [], ["image", "title"]);
    renderRepeater("reviewsList", state.testimonials || [], ["name", "rating", "text", "image"]);
    renderRepeater("faqList", state.faq || [], ["question", "answer"]);
    
    // Contact
    document.getElementById("contactPhoneInput").value = state.contact.phone || "";
    document.getElementById("contactWhatsappInput").value = state.contact.whatsapp || "";
    document.getElementById("contactEmailInput").value = state.contact.email || "";
    document.getElementById("contactFacebookInput").value = state.contact.facebook || "";
    document.getElementById("contactAddressInput").value = state.contact.address || "";
    document.getElementById("contactPersonInput").value = state.contact.contactPerson || "";
    document.getElementById("contactFooterInput").value = state.contact.footerDescription || "";
  }

  function renderRepeater(containerId, items, fields) {
    const container = document.getElementById(containerId);
    if (!container) return;
    container.innerHTML = "";
    items.forEach((item, index) => {
      const div = document.createElement("div");
      div.className = "repeater-item";
      let inputsHtml = "";
      fields.forEach(f => {
        inputsHtml += `<label style="width: 100%; text-transform: capitalize;">${f}
          <input type="${f === 'rating' ? 'number' : 'text'}" class="rep-input-${f}" value="${item[f] || ''}" style="width: 100%;">
        </label>`;
      });
      div.innerHTML = `
        ${inputsHtml}
        <button class="remove-btn" title="Remove" onclick="this.parentElement.remove()"><i class="fa-solid fa-trash"></i></button>
      `;
      container.appendChild(div);
    });
  }

  function getRepeaterItems(containerId, fields) {
    const container = document.getElementById(containerId);
    if (!container) return [];
    const items = [];
    container.querySelectorAll(".repeater-item").forEach(div => {
      const item = {};
      fields.forEach(f => {
        const input = div.querySelector(`.rep-input-${f}`);
        if (input) item[f] = f === 'rating' ? Number(input.value) : input.value;
      });
      items.push(item);
    });
    return items;
  }

  function renderWebsiteContent() {
    if (!state.hero) return;

    // Hero
    const heroKicker = document.querySelector(".hero-kicker");
    if (heroKicker) heroKicker.innerHTML = state.hero.kicker;
    const heroHeadline = document.querySelector(".hero-content h1");
    if (heroHeadline) heroHeadline.innerHTML = state.hero.headline;
    const heroSub = document.querySelector(".hero-sub");
    if (heroSub) heroSub.innerHTML = state.hero.subtitle;
    
    const heroStatsContainer = document.querySelector(".hero-stats");
    if (heroStatsContainer) {
      heroStatsContainer.innerHTML = state.hero.statPills.map(p => `
        <article class="stat-pill reveal active">
          <i class="${p.icon}"></i>
          <span>${p.text}</span>
        </article>
      `).join('');
    }

    // About
    const aboutTitle = document.querySelector("#about h2");
    if (aboutTitle) aboutTitle.innerHTML = state.about.title;
    const aboutContent = document.querySelector("#about .split-content");
    if (aboutContent) {
      const ps = aboutContent.querySelectorAll("p");
      if (ps[0]) ps[0].innerHTML = state.about.paragraphs[0] || "";
      if (ps[1]) ps[1].innerHTML = state.about.paragraphs[1] || "";
      
      const featuresBox = aboutContent.querySelector(".feature-points");
      if (featuresBox) {
        featuresBox.innerHTML = state.about.features.map(f => `<div><i class="${f.icon}"></i>${f.text}</div>`).join('');
      }
    }
    const aboutImages = document.querySelectorAll("#about .image-stack img");
    if (aboutImages.length >= 3) {
      aboutImages[0].src = state.about.images[0];
      aboutImages[1].src = state.about.images[1];
      aboutImages[2].src = state.about.images[2];
    }

    renderApartmentCards();
    renderApartmentOptions();

    // Amenities
    const amenitiesGrid = document.querySelector(".amenities-grid");
    if (amenitiesGrid) {
      amenitiesGrid.innerHTML = state.amenities.map(a => `
        <article class="amenity-card reveal active"><i class="${a.icon}"></i><h3>${a.name}</h3></article>
      `).join('');
    }

    // Activities
    const activitiesGrid = document.querySelector(".activities-grid");
    if (activitiesGrid) {
      activitiesGrid.innerHTML = state.activities.map(a => `
        <article class="activity-card reveal active">
          <img src="${a.image}" alt="${a.title}" loading="lazy">
          <div><h3>${a.title}</h3><a href="https://wa.me/${state.contact.whatsapp}?text=Hello%2C%20I%20would%20like%20to%20arrange%20${encodeURIComponent(a.title)}." target="_blank" rel="noopener">Arrange Activity</a></div>
        </article>
      `).join('');
    }

    // Reviews
    const reviewsTrack = document.getElementById("testimonialTrack");
    if (reviewsTrack) {
      reviewsTrack.innerHTML = state.testimonials.map(t => `
        <article class="testimonial-card">
          <img src="${t.image}" alt="Guest" loading="lazy">
          <h3>${t.name}</h3>
          <p class="stars">${'&#9733;'.repeat(t.rating)}</p>
          <p>${t.text}</p>
        </article>
      `).join('');
    }

    // FAQ
    const faqList = document.querySelector(".faq-list");
    if (faqList) {
      faqList.innerHTML = state.faq.map(f => `
        <article class="faq-item reveal active">
          <button class="faq-question">${f.question}<span>+</span></button>
          <div class="faq-answer">${f.answer}</div>
        </article>
      `).join('');
      initFaqAccordion(); // Re-bind events
    }

    // Contact & Footer
    const contactCards = document.querySelector(".contact-cards");
    if (contactCards) {
      contactCards.innerHTML = `
        <article><i class="fa-solid fa-phone"></i><h3>Reservations Phone</h3><a href="tel:${state.contact.phone}">${state.contact.phone}</a></article>
        <article><i class="fa-brands fa-whatsapp"></i><h3>WhatsApp</h3><a href="https://wa.me/${state.contact.whatsapp}" target="_blank" rel="noopener">+${state.contact.whatsapp}</a></article>
        <article><i class="fa-solid fa-envelope"></i><h3>Email</h3><a href="mailto:${state.contact.email}">${state.contact.email}</a></article>
        <article><i class="fa-brands fa-facebook-f"></i><h3>Facebook</h3><a href="${state.contact.facebook}" target="_blank" rel="noopener">Visit Facebook Page</a></article>
      `;
    }
    
    const footerBlocks = document.querySelectorAll(".footer-grid > div");
    if (footerBlocks.length >= 3) {
      footerBlocks[0].querySelector("p").innerHTML = state.contact.footerDescription;
      footerBlocks[1].querySelector("p").innerHTML = state.contact.address;
      
      const pElements = footerBlocks[2].querySelectorAll("p");
      if (pElements.length >= 2) {
        pElements[0].innerHTML = state.contact.contactPerson;
        pElements[1].innerHTML = `<a href="tel:${state.contact.phone}">${state.contact.phone}</a>`;
      }
    }
  }

  function setupCmsActions() {
    // Add Buttons
    document.getElementById("addHeroStatBtn")?.addEventListener("click", () => {
      state.hero.statPills.push({ icon: "", text: "" });
      renderCmsPanels();
    });
    document.getElementById("addAboutFeatureBtn")?.addEventListener("click", () => {
      state.about.features.push({ icon: "", text: "" });
      renderCmsPanels();
    });
    document.getElementById("addAmenityBtn")?.addEventListener("click", () => {
      state.amenities.push({ icon: "", name: "" });
      renderCmsPanels();
    });
    document.getElementById("addActivityBtn")?.addEventListener("click", () => {
      state.activities.push({ image: "", title: "" });
      renderCmsPanels();
    });
    document.getElementById("addReviewBtn")?.addEventListener("click", () => {
      state.testimonials.push({ name: "", rating: 5, text: "", image: "" });
      renderCmsPanels();
    });
    document.getElementById("addFaqBtn")?.addEventListener("click", () => {
      state.faq.push({ question: "", answer: "" });
      renderCmsPanels();
    });

    // Save Buttons
    document.getElementById("saveHeroBtn")?.addEventListener("click", () => {
      state.hero.kicker = document.getElementById("heroKickerInput").value;
      state.hero.headline = document.getElementById("heroHeadlineInput").value;
      state.hero.subtitle = document.getElementById("heroSubtitleInput").value;
      state.hero.statPills = getRepeaterItems("heroStatsList", ["icon", "text"]);
      saveState();
      alert("Hero saved!");
      renderWebsiteContent(); // Refresh frontend
    });

    document.getElementById("saveAboutBtn")?.addEventListener("click", () => {
      state.about.title = document.getElementById("aboutTitleInput").value;
      state.about.paragraphs = [
        document.getElementById("aboutP1Input").value,
        document.getElementById("aboutP2Input").value
      ];
      state.about.images = [
        document.getElementById("aboutImg1Input").value,
        document.getElementById("aboutImg2Input").value,
        document.getElementById("aboutImg3Input").value
      ];
      state.about.features = getRepeaterItems("aboutFeaturesList", ["icon", "text"]);
      saveState();
      alert("About saved!");
      renderWebsiteContent();
    });

    document.getElementById("saveAmenitiesBtn")?.addEventListener("click", () => {
      state.amenities = getRepeaterItems("amenitiesList", ["icon", "name"]);
      saveState();
      alert("Amenities saved!");
      renderWebsiteContent();
    });

    document.getElementById("saveActivitiesBtn")?.addEventListener("click", () => {
      state.activities = getRepeaterItems("activitiesList", ["image", "title"]);
      saveState();
      alert("Activities saved!");
      renderWebsiteContent();
    });

    document.getElementById("saveReviewsBtn")?.addEventListener("click", () => {
      state.testimonials = getRepeaterItems("reviewsList", ["name", "rating", "text", "image"]);
      saveState();
      alert("Reviews saved!");
      renderWebsiteContent();
    });

    document.getElementById("saveFaqBtn")?.addEventListener("click", () => {
      state.faq = getRepeaterItems("faqList", ["question", "answer"]);
      saveState();
      alert("FAQ saved!");
      renderWebsiteContent();
    });

    document.getElementById("saveContactBtn")?.addEventListener("click", () => {
      state.contact.phone = document.getElementById("contactPhoneInput").value;
      state.contact.whatsapp = document.getElementById("contactWhatsappInput").value;
      state.contact.email = document.getElementById("contactEmailInput").value;
      state.contact.facebook = document.getElementById("contactFacebookInput").value;
      state.contact.address = document.getElementById("contactAddressInput").value;
      state.contact.contactPerson = document.getElementById("contactPersonInput").value;
      state.contact.footerDescription = document.getElementById("contactFooterInput").value;
      saveState();
      alert("Contact info saved!");
      renderWebsiteContent();
    });
  }

  // -------------------------------------------------------------
  // SYSTEM STARTUP INITS
  // -------------------------------------------------------------
  await loadState();
  renderCustomGallery();
  renderPaymentSelector();
  setDateMinValues();
  initCalendar();
  initBookingForms();
  initHostDashboard();
  initApartmentSliders();
  initCounters();
  initTestimonials();
  initFaqAccordion();
  setFooterYear();
})();


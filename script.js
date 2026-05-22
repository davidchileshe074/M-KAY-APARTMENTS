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
      { id: "mtn", name: "MTN Mobile Money", icon: "fa-solid fa-mobile-screen-button", enabled: true, details: "Send to MTN Mobile Money:\nMerchant Code / Number: +260 764336304\nName: M Kay Apartments Ltd" },
      { id: "airtel", name: "Airtel Money", icon: "fa-solid fa-mobile-screen-button", enabled: true, details: "Send to Airtel Money:\nNumber: +260 978176858\nName: Masozi Kamanga" },
      { id: "fnb", name: "FNB Bank Transfer", icon: "fa-solid fa-building-columns", enabled: true, details: "Bank: First National Bank (FNB)\nAccount: 62981726354\nBranch: Livingstone\nName: M KAY APARTMENTS LTD" },
      { id: "card", name: "Credit/Debit Card", icon: "fa-solid fa-credit-card", enabled: true, details: "We will email/WhatsApp you a secure payment link to pay with your card." },
      { id: "cash", name: "Cash on Arrival", icon: "fa-solid fa-money-bill-wave", enabled: true, details: "Pay cash in Zambian Kwacha (K) or USD upon arrival at check-in." }
    ],
    customPhotos: [] // Array of { src: 'data:image/jpeg;base64...', caption: '...' }
  };

  let state = defaultState;

  function loadState() {
    const stored = localStorage.getItem(STATE_KEY);
    if (stored) {
      try {
        state = JSON.parse(stored);
        for (let key in defaultState) {
          if (state[key] === undefined) {
            state[key] = defaultState[key];
          }
        }
      } catch (e) {
        state = defaultState;
      }
    } else {
      state = defaultState;
      saveState();
    }
  }

  function saveState() {
    localStorage.setItem(STATE_KEY, JSON.stringify(state));
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
      card.innerHTML = `
        <i class="${method.icon}"></i>
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

    function submitPin() {
      if (pinInput.value === "1234") {
        isAdminAuthenticated = true;
        loginBox.style.display = "none";
        dashboardContent.style.display = "block";
        loginError.style.display = "none";
        renderDashboardPanels();
      } else {
        loginError.textContent = "Incorrect PIN code. Try again.";
        loginError.style.display = "block";
        pinInput.value = "";
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
  }

  function renderDashboardPanels() {
    renderSeasonsList();
    renderBlockedRangesList();
    renderCustomGalleryManager();
    renderPaymentsSettingsList();

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
      div.innerHTML = `
        <div class="payment-settings-header">
          <span><i class="${method.icon}"></i> ${method.name}</span>
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
  // SYSTEM STARTUP INITS
  // -------------------------------------------------------------
  loadState();
  initApartmentSliders();
  initCounters();
  initTestimonials();
  initFaqAccordion();
  initLightbox();
  renderCustomGallery();
  setDateMinValues();
  initCalendar();
  renderPaymentSelector();
  initBookingForms();
  initHostDashboard();
  setFooterYear();
})();


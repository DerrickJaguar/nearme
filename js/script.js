/* ==========================================================================
   NearMe Africa — Landing Page Interactions
   ========================================================================== */
(function () {
  "use strict";

  document.getElementById("year").textContent = new Date().getFullYear();

  /* ---------- Sticky header shadow on scroll ---------- */
  const header = document.getElementById("siteHeader");
  const backToTop = document.getElementById("backToTop");
  window.addEventListener("scroll", () => {
    const scrolled = window.scrollY > 12;
    header.classList.toggle("scrolled", scrolled);
    backToTop.classList.toggle("visible", window.scrollY > 500);
  });
  backToTop.addEventListener("click", () => window.scrollTo({ top: 0, behavior: "smooth" }));

  /* ---------- Mobile nav toggle ---------- */
  const navToggle = document.getElementById("navToggle");
  const mainNav = document.getElementById("mainNav");
  navToggle.addEventListener("click", () => {
    const open = mainNav.classList.toggle("open");
    navToggle.classList.toggle("open", open);
    navToggle.setAttribute("aria-expanded", String(open));
  });
  mainNav.querySelectorAll("a").forEach((link) =>
    link.addEventListener("click", () => {
      mainNav.classList.remove("open");
      navToggle.classList.remove("open");
    })
  );

  /* ---------- Toast helper ---------- */
  const toastEl = document.getElementById("toast");
  let toastTimer;
  function showToast(message) {
    toastEl.textContent = message;
    toastEl.classList.add("show");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => toastEl.classList.remove("show"), 3200);
  }

  /* ---------- Country / currency switch (header + footer) ---------- */
  const LOCALES = {
    Uganda: { flag: "🇺🇬", currency: "UGX", cpm: "1,000 UGX" },
    Rwanda: { flag: "🇷🇼", currency: "RWF", cpm: "13,000 RWF" },
    "South Sudan": { flag: "🇸🇸", currency: "SSP", cpm: "1,800 SSP" },
  };

  function applyLocale(country) {
    const data = LOCALES[country];
    if (!data) return;
    document.getElementById("localeFlag").textContent = data.flag;
    document.getElementById("localeLabel").textContent = country;
    document.querySelectorAll(".cpm-price").forEach((el) => (el.textContent = data.cpm));
    const footerSelect = document.getElementById("footerCountry");
    if (footerSelect.value !== country) footerSelect.value = country;
  }

  const localeBtn = document.getElementById("localeBtn");
  const localeMenu = document.getElementById("localeMenu");
  localeBtn.addEventListener("click", () => {
    const open = localeMenu.classList.toggle("open");
    localeBtn.setAttribute("aria-expanded", String(open));
  });
  document.addEventListener("click", (e) => {
    if (!e.target.closest("#localeSwitch")) {
      localeMenu.classList.remove("open");
      localeBtn.setAttribute("aria-expanded", "false");
    }
  });
  localeMenu.querySelectorAll("li").forEach((li) =>
    li.addEventListener("click", () => {
      applyLocale(li.dataset.country);
      localeMenu.classList.remove("open");
      showToast(`Switched to ${li.dataset.country}`);
    })
  );

  const footerCountry = document.getElementById("footerCountry");
  footerCountry.addEventListener("change", (e) => applyLocale(e.target.value));

  /* ---------- Geolocation detect ---------- */
  const detectBtn = document.getElementById("detectLocation");
  const locBtnText = document.getElementById("locBtnText");
  const locStatus = document.getElementById("locStatus");
  const nearbyLocLabel = document.getElementById("nearbyLocLabel");

  detectBtn.addEventListener("click", () => {
    if (!navigator.geolocation) {
      locStatus.textContent = "Geolocation isn't supported on this device — enter your ward manually below.";
      return;
    }
    detectBtn.classList.add("active");
    locBtnText.textContent = "Locating…";
    locStatus.textContent = "Requesting your location…";

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const { latitude, longitude } = pos.coords;
        locBtnText.textContent = "Location set";
        locStatus.textContent = `Location detected (${latitude.toFixed(3)}, ${longitude.toFixed(3)}) — showing businesses within 5km.`;
        nearbyLocLabel.textContent = "Showing results within 5km of your current location";
      },
      () => {
        detectBtn.classList.remove("active");
        locBtnText.textContent = "Use my location";
        locStatus.textContent = "Couldn't access your location — try a manual area search instead.";
      },
      { timeout: 8000 }
    );
  });

  /* ---------- Search autocomplete ---------- */
  const SUGGESTIONS = [
    "Pharmacy", "Pharmacy open now", "Boda spare parts", "Rolex stand", "Grocery store",
    "Beauty salon", "Auto garage", "Legal services", "Restaurant nearby", "Butchery",
    "Home cleaning services", "Electronics repair", "Hardware shop", "Water delivery",
  ];
  const searchInput = document.getElementById("searchInput");
  const autocomplete = document.getElementById("autocomplete");

  function renderSuggestions(query) {
    const q = query.trim().toLowerCase();
    if (!q) {
      autocomplete.hidden = true;
      autocomplete.innerHTML = "";
      return;
    }
    const matches = SUGGESTIONS.filter((s) => s.toLowerCase().includes(q)).slice(0, 6);
    if (!matches.length) {
      autocomplete.hidden = true;
      autocomplete.innerHTML = "";
      return;
    }
    autocomplete.innerHTML = matches
      .map((s) => {
        const idx = s.toLowerCase().indexOf(q);
        const highlighted = idx === -1 ? s : `${s.slice(0, idx)}<b>${s.slice(idx, idx + q.length)}</b>${s.slice(idx + q.length)}`;
        return `<li role="option">${highlighted}</li>`;
      })
      .join("");
    autocomplete.hidden = false;
  }

  searchInput.addEventListener("input", (e) => renderSuggestions(e.target.value));
  searchInput.addEventListener("focus", (e) => renderSuggestions(e.target.value));
  autocomplete.addEventListener("click", (e) => {
    const li = e.target.closest("li");
    if (!li) return;
    searchInput.value = li.textContent;
    autocomplete.hidden = true;
    searchInput.focus();
  });
  document.addEventListener("click", (e) => {
    if (!e.target.closest(".search-field")) autocomplete.hidden = true;
  });

  document.getElementById("searchForm").addEventListener("submit", (e) => {
    e.preventDefault();
    autocomplete.hidden = true;
    const q = searchInput.value.trim();
    document.getElementById("nearby").scrollIntoView({ behavior: "smooth" });
    showToast(q ? `Searching “${q}” near you…` : "Showing everything nearby…");
  });

  /* ---------- Quick category chips + category grid → filter demo ---------- */
  const quickChips = document.querySelectorAll(".chip");
  const categoryCards = document.querySelectorAll(".category-card");
  const bizCards = document.querySelectorAll(".biz-card");

  function filterByCategory(cat) {
    quickChips.forEach((c) => c.classList.toggle("active", c.dataset.cat === cat));
    categoryCards.forEach((c) => c.classList.toggle("selected", c.dataset.cat === cat));
    bizCards.forEach((card) => {
      const match = !cat || cat === "More" || card.dataset.cat === cat;
      card.style.display = match ? "" : "none";
    });
    document.getElementById("nearby").scrollIntoView({ behavior: "smooth" });
  }

  quickChips.forEach((chip) =>
    chip.addEventListener("click", () => {
      const isActive = chip.classList.contains("active");
      filterByCategory(isActive ? null : chip.dataset.cat);
      if (isActive) chip.classList.remove("active");
    })
  );
  categoryCards.forEach((card) =>
    card.addEventListener("click", () => {
      const isSelected = card.classList.contains("selected");
      filterByCategory(isSelected ? null : card.dataset.cat);
    })
  );

  /* ---------- Nearby carousel controls ---------- */
  const nearbyCarousel = document.getElementById("nearbyCarousel");
  document.getElementById("nearbyPrev").addEventListener("click", () =>
    nearbyCarousel.scrollBy({ left: -280, behavior: "smooth" })
  );
  document.getElementById("nearbyNext").addEventListener("click", () =>
    nearbyCarousel.scrollBy({ left: 280, behavior: "smooth" })
  );

  /* ---------- Sponsored impression tracking (Tangaza) ---------- */
  const impressed = new WeakSet();
  const impressionObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting && !impressed.has(entry.target)) {
          impressed.add(entry.target);
          const counterEl = entry.target.querySelector(".imp-counter");
          const current = parseInt(entry.target.dataset.imp, 10) + 1;
          entry.target.dataset.imp = String(current);
          counterEl.textContent = `${current * 137 + 40} people saw this today`;
          // Simulated Tangaza impression pixel fire — one event per card per session.
          console.log(`[Tangaza] impression recorded for "${entry.target.querySelector("h3").textContent}"`);
        }
      });
    },
    { threshold: 0.5 }
  );
  document.querySelectorAll(".sponsored-card").forEach((card) => impressionObserver.observe(card));

  /* ---------- Scroll reveal for cards/sections ---------- */
  const revealTargets = document.querySelectorAll(
    ".category-card, .biz-card, .sponsored-card, .storefront-card, .step"
  );
  revealTargets.forEach((el) => el.classList.add("reveal"));
  const revealObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("in-view");
          revealObserver.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.15 }
  );
  revealTargets.forEach((el) => revealObserver.observe(el));

  /* ---------- Animated stat counters ---------- */
  const statEls = document.querySelectorAll(".stat strong");
  function animateCount(el) {
    const target = parseFloat(el.dataset.count);
    const decimals = parseInt(el.dataset.decimal || "0", 10);
    const suffix = el.dataset.suffix || "";
    const duration = 1400;
    const start = performance.now();

    function tick(now) {
      const progress = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      const value = target * eased;
      el.textContent = (decimals ? value.toFixed(decimals) : Math.round(value)) + suffix;
      if (progress < 1) requestAnimationFrame(tick);
    }
    requestAnimationFrame(tick);
  }
  const statsObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          animateCount(entry.target);
          statsObserver.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.6 }
  );
  statEls.forEach((el) => statsObserver.observe(el));

  /* ---------- Testimonial slider ---------- */
  const testimonials = document.querySelectorAll(".testimonial");
  const dotsWrap = document.getElementById("testimonialDots");
  let activeTestimonial = 0;
  let testimonialTimer;

  testimonials.forEach((_, i) => {
    const dot = document.createElement("button");
    if (i === 0) dot.classList.add("active");
    dot.setAttribute("aria-label", `Show testimonial ${i + 1}`);
    dot.addEventListener("click", () => setTestimonial(i));
    dotsWrap.appendChild(dot);
  });

  function setTestimonial(i) {
    testimonials[activeTestimonial].classList.remove("active");
    dotsWrap.children[activeTestimonial].classList.remove("active");
    activeTestimonial = i;
    testimonials[activeTestimonial].classList.add("active");
    dotsWrap.children[activeTestimonial].classList.add("active");
  }

  function nextTestimonial() {
    setTestimonial((activeTestimonial + 1) % testimonials.length);
  }

  function startTestimonialTimer() {
    clearInterval(testimonialTimer);
    testimonialTimer = setInterval(nextTestimonial, 5500);
  }
  startTestimonialTimer();
  dotsWrap.addEventListener("click", startTestimonialTimer);

  /* ---------- How it works tabs ---------- */
  const tabButtons = document.querySelectorAll(".tab-btn");
  const tabPanels = document.querySelectorAll(".tab-panel");
  tabButtons.forEach((btn) =>
    btn.addEventListener("click", () => {
      tabButtons.forEach((b) => {
        b.classList.remove("active");
        b.setAttribute("aria-selected", "false");
      });
      tabPanels.forEach((p) => p.classList.remove("active"));
      btn.classList.add("active");
      btn.setAttribute("aria-selected", "true");
      document.getElementById(`tab-${btn.dataset.tab}`).classList.add("active");
    })
  );

  /* ---------- Business signup form ---------- */
  const businessForm = document.getElementById("businessForm");
  const formSuccess = document.getElementById("formSuccess");

  businessForm.addEventListener("submit", (e) => {
    e.preventDefault();
    const fields = businessForm.querySelectorAll("input, select");
    let valid = true;
    fields.forEach((field) => {
      field.classList.add("touched");
      if (!field.checkValidity()) valid = false;
    });

    if (!valid) {
      showToast("Please fill in every field to create your listing.");
      return;
    }

    const name = document.getElementById("bizName").value.trim();
    formSuccess.hidden = false;
    formSuccess.textContent = `✓ Thanks, ${name}! Your listing request is in — our onboarding team will reach out shortly.`;
    businessForm.reset();
    fields.forEach((field) => field.classList.remove("touched"));
    showToast("Listing request submitted!");
  });
})();

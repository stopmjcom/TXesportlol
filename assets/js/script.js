const langButton = document.querySelector(".lang-switch");
const menuButton = document.querySelector(".menu-toggle");
const nav = document.querySelector(".site-nav");
const yearEl = document.getElementById("year");
const toastWrap = document.createElement("div");

toastWrap.className = "toast-wrap";
document.body.appendChild(toastWrap);

if (yearEl) {
  yearEl.textContent = new Date().getFullYear();
}

const storedLang = localStorage.getItem("tx_lang") || "en";

function currentLang() {
  return localStorage.getItem("tx_lang") || "en";
}

function showToast(type, enText, faText) {
  const toast = document.createElement("div");
  const icon = type === "success" ? "✓" : "!";
  const text = currentLang() === "fa" ? faText : enText;

  toast.className = `toast ${type}`;
  toast.innerHTML = `<span class="icon">${icon}</span><span class="text">${text}</span>`;
  toastWrap.appendChild(toast);

  requestAnimationFrame(() => toast.classList.add("show"));
  setTimeout(() => {
    toast.classList.remove("show");
    setTimeout(() => toast.remove(), 260);
  }, 3200);
}

function applyLanguage(lang) {
  document.documentElement.lang = lang;
  document.documentElement.dir = lang === "fa" ? "rtl" : "ltr";
  document.body.dir = lang === "fa" ? "rtl" : "ltr";

  document.querySelectorAll("[data-en][data-fa]").forEach((el) => {
    el.textContent = el.dataset[lang];
  });

  document.querySelectorAll("[data-en-placeholder][data-fa-placeholder]").forEach((el) => {
    el.placeholder = lang === "fa" ? el.dataset.faPlaceholder : el.dataset.enPlaceholder;
  });

  if (langButton) {
    langButton.textContent = lang === "fa" ? langButton.dataset.fa : langButton.dataset.en;
  }

  localStorage.setItem("tx_lang", lang);
}

if (langButton) {
  langButton.addEventListener("click", () => {
    const current = localStorage.getItem("tx_lang") || "en";
    applyLanguage(current === "en" ? "fa" : "en");
  });
}

if (menuButton && nav) {
  menuButton.addEventListener("click", () => {
    nav.classList.toggle("open");
  });

  nav.querySelectorAll("a").forEach((link) => {
    link.addEventListener("click", () => nav.classList.remove("open"));
  });
}

const observer = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("visible");
      }
    });
  },
  { threshold: 0.14 }
);

document.querySelectorAll(".reveal").forEach((el) => observer.observe(el));

async function submitFormAjax(form) {
  const action = form.getAttribute("action") || "";
  if (!action.includes("formsubmit.co/")) {
    showToast(
      "error",
      "Form destination is not configured.",
      "آدرس ارسال فرم تنظیم نشده است."
    );
    return;
  }

  const ajaxUrl = action.replace("formsubmit.co/", "formsubmit.co/ajax/");
  const formData = new FormData(form);
  const submitButton = form.querySelector("button[type='submit']");

  if (submitButton) {
    submitButton.disabled = true;
    submitButton.style.opacity = "0.82";
  }

  try {
    const response = await fetch(ajaxUrl, {
      method: "POST",
      body: formData,
      headers: { Accept: "application/json" },
    });

    if (!response.ok) {
      throw new Error("submit-failed");
    }

    form.reset();
    showToast(
      "success",
      "Submitted successfully. Check your inbox soon.",
      "با موفقیت ارسال شد. به زودی ایمیل را بررسی کن."
    );
  } catch (_err) {
    showToast(
      "error",
      "Submission failed. Try again in a moment.",
      "ارسال انجام نشد. لطفا کمی بعد دوباره تلاش کن."
    );
  } finally {
    if (submitButton) {
      submitButton.disabled = false;
      submitButton.style.opacity = "1";
    }
  }
}

document.querySelectorAll("form[action*='formsubmit.co']").forEach((form) => {
  form.addEventListener("submit", async (event) => {
    event.preventDefault();
    await submitFormAjax(form);
  });
});

applyLanguage(storedLang);

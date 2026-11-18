"use strict";

const routeNames = new Set([
  "home", "login", "signup", "dashboard", "player", "vocabulary",
  "add-video", "flashcards", "settings", "pricing", "completed",
]);
const views = [...document.querySelectorAll("[data-view]")];
const chatPanel = document.querySelector("#chat-panel");
const chatLauncher = document.querySelector("#chat-launcher");
const chatMessages = document.querySelector("#chat-messages");
const chatFace = document.querySelector("#chat-face");
const launcherFace = document.querySelector("#launcher-face");
const chatStatus = document.querySelector("#chat-status");
const toastRegion = document.querySelector("#toast-region");
const savedWords = [];
let currentCard = 0;
let toastTimeout;
let chatCloseTimeout;
let lastChatQuestion = "";
let chatBusy = false;

function currentRoute() {
  const fragment = window.location.hash.slice(1).split("#")[0];
  return routeNames.has(fragment) ? fragment : "home";
}

function navigate(route) {
  if (!routeNames.has(route)) return;
  if (window.location.hash === `#${route}`) {
    renderRoute();
  } else {
    window.location.hash = route;
  }
}

function renderRoute() {
  const route = currentRoute();
  views.forEach((view) => {
    view.hidden = view.dataset.view !== route;
  });
  document.body.classList.toggle("is-app-route", ["dashboard", "player", "vocabulary", "add-video", "flashcards", "settings"].includes(route));
  document.body.classList.toggle("is-home-route", route === "home");
  document.querySelector(".primary-nav")?.classList.remove("is-open");
  document.querySelector(".menu-toggle")?.setAttribute("aria-expanded", "false");
  window.scrollTo({ top: 0, behavior: "auto" });
}

function showToast(message) {
  toastRegion.textContent = message;
  toastRegion.classList.add("is-visible");
  window.clearTimeout(toastTimeout);
  toastTimeout = window.setTimeout(() => toastRegion.classList.remove("is-visible"), 3200);
}

function openChat() {
  window.clearTimeout(chatCloseTimeout);
  chatPanel.hidden = false;
  chatPanel.classList.remove("is-closing");
  chatLauncher.setAttribute("aria-expanded", "true");
  chatLauncher.setAttribute("aria-label", "Tutup chat Mersi");
  window.requestAnimationFrame(() => {
    chatPanel.classList.add("is-open");
    chatMessages.querySelector(".chat-greeting")?.classList.add("is-visible");
  });
  chatFace.src = "./assets/mersi/surprise.webp";
  launcherFace.src = "./assets/mersi/surprise.webp";
  document.querySelector("#chat-input").focus();
}

function closeChat() {
  chatPanel.classList.remove("is-open");
  chatPanel.classList.add("is-closing");
  window.clearTimeout(chatCloseTimeout);
  chatCloseTimeout = window.setTimeout(() => {
    chatPanel.hidden = true;
    chatPanel.classList.remove("is-closing");
  }, 180);
  chatLauncher.setAttribute("aria-expanded", "false");
  chatLauncher.setAttribute("aria-label", "Buka chat Mersi");
  chatFace.src = "./assets/mersi/happy.webp";
  launcherFace.src = "./assets/mersi/happy.webp";
  chatLauncher.focus();
}

function appendMessage(message, type, reveal = false, emotion = "happy") {
  const row = document.createElement("div");
  row.className = `chat-message chat-message-${type}`;
  if (type === "mersi") {
    const avatar = document.createElement("img");
    avatar.className = "chat-avatar";
    avatar.src = `./assets/mersi/${emotion}.webp`;
    avatar.alt = "";
    row.append(avatar);
  }

  const bubble = document.createElement("p");
  bubble.className = `chat-bubble chat-bubble-${type}`;
  if (reveal === true) {
    bubble.classList.add("chat-answer");
    bubble.setAttribute("aria-label", message);
    bubble.setAttribute("aria-live", "off");
    message.split(/\s+/).forEach((word, index) => {
      const part = document.createElement("span");
      part.className = "answer-word";
      part.style.setProperty("--word-delay", `${index * 25}ms`);
      part.textContent = word;
      bubble.append(part, document.createTextNode(" "));
    });
    window.requestAnimationFrame(() => bubble.classList.add("is-visible"));
  } else {
    bubble.textContent = message;
  }
  row.append(bubble);
  chatMessages.append(row);
  chatMessages.scrollTop = chatMessages.scrollHeight;
  return row;
}

function appendThinkingMessage() {
  const row = document.createElement("div");
  row.className = "chat-message chat-message-mersi";
  const avatar = document.createElement("img");
  avatar.className = "chat-avatar thinking-head";
  avatar.src = "./assets/mersi/happy.webp";
  avatar.alt = "";
  const bubble = document.createElement("p");
  bubble.className = "chat-bubble chat-bubble-mersi chat-thinking";
  const label = document.createElement("span");
  label.className = "chat-thinking-copy";
  label.textContent = "Sedang berpikir…";
  const dots = document.createElement("span");
  dots.className = "thinking-dots";
  dots.setAttribute("aria-hidden", "true");
  for (let index = 0; index < 3; index += 1) dots.append(document.createElement("i"));
  bubble.append(label, dots);
  row.append(avatar, bubble);
  chatMessages.append(row);
  window.requestAnimationFrame(() => row.querySelector(".chat-thinking").classList.add("is-visible"));
  chatMessages.scrollTop = chatMessages.scrollHeight;
  return row;
}

function setChatBusy(isBusy) {
  chatBusy = isBusy;
  const form = document.querySelector("#chat-form");
  form.classList.toggle("is-thinking", isBusy);
  form.setAttribute("aria-busy", String(isBusy));
  form.querySelector("input").disabled = isBusy;
  form.querySelector('button[type="submit"]').disabled = isBusy;
  form.querySelector('button[type="submit"]').setAttribute("aria-label", isBusy ? "Mersi sedang berpikir" : "Kirim pertanyaan");
  document.querySelectorAll(".chat-quick-replies button").forEach((button) => {
    button.disabled = isBusy;
  });
}

function answerFromGuide(message) {
  const normalized = message.toLocaleLowerCase("id");
  if (normalized.includes("video") || normalized.includes("tautan")) {
    return {
      text: "Buka Tambahkan video, tempel tautannya, lalu pilih Lanjut ke ruang belajar. Demo ini belum memproses video.",
      expression: "happy",
    };
  }
  if (normalized.includes("kata") || normalized.includes("kosakata")) {
    return {
      text: "Kata tersimpan ada di menu Kosakata saya. Di prototipe ini, daftar kata belum tersambung ke akun atau server.",
      expression: "happy",
    };
  }
  if (normalized.includes("kontak") || normalized.includes("tim") || normalized.includes("lain")) {
    return {
      text: "Aku belum punya informasi untuk itu. Kamu bisa menghubungi tim IMMERSE lewat halo@immerse.id.",
      expression: "sad",
    };
  }
  return {
    text: "Aku belum punya jawaban yang bisa kupastikan. Untuk bantuan lebih lanjut, hubungi tim IMMERSE lewat halo@immerse.id.",
    expression: "sad",
  };
}

async function submitQuestion(question, isRetry = false) {
  if (chatBusy) return;
  lastChatQuestion = question;
  document.querySelector(".chat-retry")?.remove();
  if (!isRetry) appendMessage(question, "user");
  chatFace.src = "./assets/mersi/surprise.webp";
  launcherFace.src = "./assets/mersi/surprise.webp";
  setChatBusy(true);
  const thinkingRow = appendThinkingMessage();
  const statuses = ["Membaca pertanyaanmu", "Mencari jawabannya", "Hampir selesai"];
  let statusIndex = 0;
  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  chatStatus.textContent = reducedMotion ? "Sedang berpikir…" : statuses[statusIndex];
  const statusTimer = reducedMotion ? 0 : window.setInterval(() => {
    statusIndex = (statusIndex + 1) % statuses.length;
    chatStatus.textContent = statuses[statusIndex];
  }, 1500);

  try {
    // API placeholder: replace the local guide with an approved endpoint and sourced answers.
    // Do not send user messages to a service until its privacy and answer sources are configured.
    const response = answerFromGuide(question);
    await new Promise((resolve) => window.setTimeout(resolve, 300));
    thinkingRow.remove();
    const expression = response.expression === "happy" ? "happy" : "sad";
    appendMessage(response.text, "mersi", true, expression);
    chatFace.src = `./assets/mersi/${expression}.webp`;
    launcherFace.src = `./assets/mersi/${expression}.webp`;
    chatStatus.textContent = response.expression === "happy"
      ? "Siap bantu cari yang kamu butuhkan."
      : "Kalau belum tahu, aku tunjukkan jalan lain.";
  } catch (error) {
    console.error("Mersi chat request failed:", error);
    thinkingRow.remove();
    const errorRow = appendMessage("Aku belum bisa memproses pertanyaanmu. Coba lagi, atau hubungi tim IMMERSE di halo@immerse.id.", "mersi", true, "sad");
    const retry = document.createElement("button");
    retry.type = "button";
    retry.className = "chat-retry";
    retry.dataset.action = "retry-chat";
    retry.textContent = "Coba lagi";
    errorRow.after(retry);
    chatFace.src = "./assets/mersi/sad.webp";
    launcherFace.src = "./assets/mersi/sad.webp";
    chatStatus.textContent = "Ada kendala. Kamu bisa coba lagi.";
  } finally {
    window.clearInterval(statusTimer);
    setChatBusy(false);
  }
}

function renderVocabulary() {
  const tbody = document.querySelector("#vocabulary-rows");
  const query = document.querySelector("#word-search").value.trim().toLocaleLowerCase("id");
  const filter = document.querySelector("#word-filter").value;
  const items = savedWords.filter((word) => {
    const matchesText = `${word.term} ${word.meaning}`.toLocaleLowerCase("id").includes(query);
    return matchesText && (filter === "all" || word.saved);
  });
  tbody.replaceChildren();
  if (items.length === 0) {
    const row = document.createElement("tr");
    row.className = "empty-table-row";
    const cell = document.createElement("td");
    cell.colSpan = 5;
    const mark = document.createElement("span");
    mark.className = "word-empty-mark";
    mark.setAttribute("aria-hidden", "true");
    mark.textContent = "Aa";
    const text = document.createElement("p");
    text.textContent = savedWords.length === 0 ? "Belum ada kata tersimpan." : "Tidak ada kata yang cocok.";
    const link = document.createElement("a");
    link.href = "#player";
    link.textContent = "Mulai dari video demo ↗";
    cell.append(mark, text, link);
    row.append(cell);
    tbody.append(row);
  } else {
    items.forEach((word) => {
      const row = document.createElement("tr");
      const labels = ["Kata", "Arti / catatan", "Dari video", "Status"];
      [word.term, word.meaning, word.source, word.saved ? "Tersimpan" : "Belum disimpan"].forEach((value, index) => {
        const cell = document.createElement("td");
        cell.dataset.label = labels[index];
        cell.textContent = value;
        row.append(cell);
      });
      const actionCell = document.createElement("td");
      const removeButton = document.createElement("button");
      removeButton.type = "button";
      removeButton.className = "word-action";
      removeButton.textContent = "Hapus";
      actionCell.dataset.label = "Aksi";
      removeButton.setAttribute("aria-label", `Hapus kata ${word.term}`);
      removeButton.addEventListener("click", () => {
        savedWords.splice(savedWords.indexOf(word), 1);
        renderVocabulary();
        renderFlashcard();
      });
      actionCell.append(removeButton);
      row.append(actionCell);
      tbody.append(row);
    });
  }
  document.querySelector("#word-count").textContent = `${savedWords.length} kata`;
}

function renderFlashcard() {
  const word = savedWords[currentCard];
  const card = document.querySelector("#flashcard");
  document.querySelector("#flashcard-counter").textContent = savedWords.length
    ? `${currentCard + 1} / ${savedWords.length}`
    : "0 / 0";
  card.classList.remove("is-flipped");
  card.querySelector(".flashcard-word").textContent = word?.term ?? "Belum ada kata";
  card.querySelector(".flashcard-hint").textContent = word
    ? "Coba ingat artinya, lalu balik kartu."
    : "Simpan kata dari video untuk mulai.";
  card.querySelector(".flashcard-back").textContent = word?.meaning ?? "";
  card.querySelector(".flashcard-back").hidden = !word;
  card.querySelector(".flashcard-turn").textContent = word ? "KLIK UNTUK MEMBALIK" : "KOSAKATA TERSIMPAN AKAN MUNCUL DI SINI";
}

function restoreSettings() {
  const rawSettings = localStorage.getItem("immerse-settings");
  if (!rawSettings) return;

  let settings;
  try {
    settings = JSON.parse(rawSettings);
  } catch {
    showToast("Pengaturan tersimpan tidak dapat dibaca. Silakan pilih kembali.");
    return;
  }

  if (settings?.uiLanguage === "id" || settings?.uiLanguage === "en") {
    const languageOption = document.querySelector(`[name="ui-language"][value="${settings.uiLanguage}"]`);
    if (languageOption) languageOption.checked = true;
  }
  if (["en", "ja", "ko"].includes(settings?.learningLanguage)) {
    const learningLanguage = document.querySelector('[name="learning-language"]');
    if (learningLanguage) learningLanguage.value = settings.learningLanguage;
  }
}

document.addEventListener("click", (event) => {
  const routeLink = event.target.closest("[data-route]");
  if (routeLink) navigate(routeLink.dataset.route);

  const routeAnchor = event.target.closest('a[href^="#"]');
  if (routeAnchor?.hash.startsWith("#home#")) {
    event.preventDefault();
    const section = routeAnchor.hash.split("#")[2];
    navigate("home");
    window.setTimeout(() => document.getElementById(section)?.scrollIntoView({ behavior: "smooth" }), 40);
  }

  const action = event.target.closest("[data-action]")?.dataset.action;
  if (action === "open-chat") openChat();
  if (action === "close-chat") closeChat();
  if (action === "retry-chat" && lastChatQuestion) submitQuestion(lastChatQuestion, true);
  if (action === "play-preview") {
    const status = document.querySelector("#preview-status");
    if (status) status.textContent = status.textContent === "Satu adegan, satu hal baru." ? "Cuplikan demo sedang diputar." : "Satu adegan, satu hal baru.";
    document.querySelector(".video-player-caption")?.classList.toggle("is-playing");
  }
  if (action === "toggle-save") {
    const word = { term: "serendipity", meaning: "Temuan berharga yang datang tanpa diduga (contoh)", source: "Video demo", saved: true };
    const existing = savedWords.find((entry) => entry.term === word.term);
    if (existing) {
      savedWords.splice(savedWords.indexOf(existing), 1);
      showToast("Kata contoh dihapus dari daftar sesi ini.");
    } else {
      savedWords.push(word);
      showToast("Kata contoh ditambahkan ke daftar sesi ini.");
    }
    renderVocabulary();
    renderFlashcard();
  }
  if (action === "toggle-translation") showToast("Transkrip otomatis belum tersambung di demo ini.");
  if (action === "captions") showToast("Teks takarir belum tersedia untuk demo ini.");
  if (action === "paste-url") {
    navigator.clipboard?.readText().then((text) => {
      if (text) document.querySelector("#video-url").value = text;
      else showToast("Clipboard kosong.");
    }).catch(() => showToast("Izinkan akses clipboard, atau tempel tautan secara manual."));
  }
  if (action === "export-words") {
    if (!savedWords.length) return showToast("Belum ada kata untuk diekspor.");
    const csv = ["Kata,Arti,Video", ...savedWords.map((word) => [word.term, word.meaning, word.source].map((value) => `"${value.replaceAll('"', '""')}"`).join(","))].join("\r\n");
    const link = document.createElement("a");
    link.href = URL.createObjectURL(new Blob([csv], { type: "text/csv;charset=utf-8" }));
    link.download = "kosakata-immerse.csv";
    link.click();
    window.setTimeout(() => URL.revokeObjectURL(link.href), 1000);
  }
  if (action === "next-card" && savedWords.length) {
    currentCard = (currentCard + 1) % savedWords.length;
    renderFlashcard();
  }
  if (action === "previous-card" && savedWords.length) {
    currentCard = (currentCard - 1 + savedWords.length) % savedWords.length;
    renderFlashcard();
  }
  if (action === "forgot-password") showToast("Pemulihan kata sandi belum tersedia di demo ini.");
  if (action === "demo-login") navigate("dashboard");
  if (action === "profile") showToast("Profil dan akun belum terhubung pada demo lokal.");
  if (action === "plan-choice") showToast("Pilihan paket dan harga belum tersedia untuk pembelian.");
});

document.querySelector(".menu-toggle").addEventListener("click", (event) => {
  const nav = document.querySelector(".primary-nav");
  const isOpen = nav.classList.toggle("is-open");
  event.currentTarget.setAttribute("aria-expanded", String(isOpen));
});

document.querySelector("#hero-form").addEventListener("submit", (event) => {
  event.preventDefault();
  document.querySelector('[data-view="signup"] input[name="email"]').value = event.currentTarget.elements.email.value;
  navigate("signup");
});

document.querySelectorAll("[data-auth-form]").forEach((form) => {
  form.addEventListener("submit", (event) => {
    event.preventDefault();
    form.querySelector(".inline-message").textContent = "Akun demo siap dijelajahi. Tidak ada data yang dikirim.";
    window.setTimeout(() => navigate("dashboard"), 650);
  });
});

document.querySelector("#add-video-form").addEventListener("submit", (event) => {
  event.preventDefault();
  event.currentTarget.querySelector(".inline-message").textContent = "Tampilan ruang belajar siap dilihat. Tautan belum diproses atau disimpan.";
  window.setTimeout(() => navigate("player"), 500);
});

document.querySelector("#settings-form").addEventListener("submit", (event) => {
  event.preventDefault();
  const settings = new FormData(event.currentTarget);
  localStorage.setItem("immerse-settings", JSON.stringify({
    uiLanguage: settings.get("ui-language"),
    learningLanguage: settings.get("learning-language"),
  }));
  event.currentTarget.querySelector(".inline-message").textContent = "Pilihan disimpan di browser ini.";
});

document.querySelector("#vocabulary-search").addEventListener("submit", (event) => event.preventDefault());
document.querySelector("#word-search").addEventListener("input", renderVocabulary);
document.querySelector("#word-filter").addEventListener("change", renderVocabulary);
document.querySelector("#flashcard").addEventListener("click", (event) => {
  const card = event.currentTarget;
  if (!savedWords.length) return;
  card.classList.toggle("is-flipped");
  card.querySelector(".flashcard-hint").hidden = card.classList.contains("is-flipped");
  card.querySelector(".flashcard-back").hidden = !card.classList.contains("is-flipped");
});
document.querySelector("#chat-form").addEventListener("submit", async (event) => {
  event.preventDefault();
  const input = event.currentTarget.elements.message;
  const question = input.value.trim();
  if (!question) return;
  input.value = "";
  await submitQuestion(question);
});
document.querySelectorAll("[data-quick]").forEach((button) => {
  button.addEventListener("click", () => submitQuestion(button.dataset.quick));
});
window.addEventListener("hashchange", renderRoute);
window.addEventListener("keydown", (event) => {
  if (event.key === "Escape" && !chatPanel.hidden) closeChat();
});
chatLauncher.addEventListener("click", () => {
  if (chatLauncher.getAttribute("aria-expanded") !== "true") openChat();
  else closeChat();
});
chatLauncher.addEventListener("pointerenter", () => {
  if (chatPanel.hidden) launcherFace.src = "./assets/mersi/wink.webp";
});
chatLauncher.addEventListener("pointerleave", () => {
  if (chatPanel.hidden) launcherFace.src = "./assets/mersi/happy.webp";
});
chatLauncher.addEventListener("focus", () => {
  if (chatPanel.hidden) launcherFace.src = "./assets/mersi/wink.webp";
});
chatLauncher.addEventListener("blur", () => {
  if (chatPanel.hidden) launcherFace.src = "./assets/mersi/happy.webp";
});

restoreSettings();
renderRoute();
renderVocabulary();
renderFlashcard();
window.requestAnimationFrame(() => document.body.classList.add("is-ready"));

const jumpMascot = document.querySelector(".mersi-jump");
if ("IntersectionObserver" in window) {
  const mascotObserver = new IntersectionObserver((entries) => {
    if (entries.some((entry) => entry.isIntersecting)) {
      jumpMascot.classList.add("is-visible");
      mascotObserver.disconnect();
    }
  }, { threshold: 0.15 });
  mascotObserver.observe(jumpMascot);
} else {
  jumpMascot.classList.add("is-visible");
}

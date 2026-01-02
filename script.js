console.log("🔥 hero swap js loaded");

document.addEventListener("DOMContentLoaded", () => {
  /* =========================
    HERO：人物画像スワップ（SP/PC）
    - B画像のときだけ少し小さくする
  ========================= */

  const img = document.querySelector(".hero-visual .hero-image");
  if (!img) return;

  const mqPc = window.matchMedia("(min-width: 768px)");

  const spImages = [img.dataset.spA, img.dataset.spB].filter(Boolean);
  const pcImages = [img.dataset.pcA, img.dataset.pcB].filter(Boolean);

  const getActiveList = () => (mqPc.matches ? pcImages : spImages);

  /* 先読み（チラつき防止） */
  [...spImages, ...pcImages].forEach((src) => {
    const i = new Image();
    i.src = src;
  });

  let index = 0;
  let timerId = null;

  const intervalMs = 7000; // 7秒に1回
  const fadeMs = 800;      // フェード時間

  /* 初期表示（A画像） */
  const setInitial = () => {
    const list = getActiveList();
    if (!list.length) return;

    index = 0;
    img.src = list[0];

    // ✅ 初期はAなので小さくしない
    img.classList.remove("is-b");
  };

  /* スタート */
  const start = () => {
    if (timerId) clearInterval(timerId);

    const list = getActiveList();
    if (list.length < 2) return;

    timerId = setInterval(() => {
      img.classList.add("is-fading");

      setTimeout(() => {
        const active = getActiveList();
        index = (index + 1) % active.length;

        img.src = active[index];

        // ✅ index === 1（B画像）のときだけ小さくする
        img.classList.toggle("is-b", index === 1);

        img.classList.remove("is-fading");
      }, fadeMs);

    }, intervalMs);
  };

  /* 実行 */
  setInitial();
  setTimeout(start, 2500); // 2.5秒後に開始

  /* SP / PC 切り替え時 */
  const onChange = () => {
    setInitial();
    start();
  };

  if (mqPc.addEventListener) {
    mqPc.addEventListener("change", onChange);
  } else {
    // 古いSafari対策
    mqPc.addListener(onChange);
  }



  /* =========================
     COUNTDOWN TIMER
  ========================= */
  const elDays = document.getElementById("cd-days");
  const elHours = document.getElementById("cd-hours");
  const elMinutes = document.getElementById("cd-minutes");
  const elSeconds = document.getElementById("cd-seconds");

  // タイマー要素が無いページでも落ちないように（returnで全体を止めない）
  if (!elDays || !elHours || !elMinutes || !elSeconds) return;

  const target = new Date("2025-12-31T19:00:00+09:00").getTime();
  const pad2 = (n) => String(n).padStart(2, "0");

  let countTimer = null;

  const updateCountdown = () => {
    const now = Date.now();
    const diff = target - now;

    if (diff <= 0) {
      elDays.textContent = "00";
      elHours.textContent = "00";
      elMinutes.textContent = "00";
      elSeconds.textContent = "00";
      if (countTimer) clearInterval(countTimer);
      return;
    }

    const totalSeconds = Math.floor(diff / 1000);
    const days = Math.floor(totalSeconds / (60 * 60 * 24));
    const hours = Math.floor((totalSeconds / (60 * 60)) % 24);
    const minutes = Math.floor((totalSeconds / 60) % 60);
    const seconds = Math.floor(totalSeconds % 60);

    elDays.textContent = String(days);
    elHours.textContent = pad2(hours);
    elMinutes.textContent = pad2(minutes);
    elSeconds.textContent = pad2(seconds);
  };

  updateCountdown();
  countTimer = setInterval(updateCountdown, 1000);
});

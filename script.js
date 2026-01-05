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
    COUNTDOWN TIMER（returnで止めない版）
 ========================= */
  const elDays = document.getElementById("cd-days");
  const elHours = document.getElementById("cd-hours");
  const elMinutes = document.getElementById("cd-minutes");
  const elSeconds = document.getElementById("cd-seconds");

  const hasCountdown = elDays && elHours && elMinutes && elSeconds;

  if (hasCountdown) {
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
  }

  /* =========================
  CTA：FV中は中央、スクロール開始で右下（PCのみ）
  - IntersectionObserver版（最終・確実）
  - 上に戻ったら中央に戻る
  - TRIGGER_PX を 1〜30で調整
========================= */
(() => {
  console.log("✅ CTA IO trigger reached");

  const cta = document.querySelector(".cta-fixed");
  const hero = document.querySelector("#hero");
  if (!cta || !hero) return;

  const mqPc = window.matchMedia("(min-width: 768px)");

  // ✅ ここだけ好みで（1=ほぼ即右 / 10=自然 / 30=少し遅め）
  const TRIGGER_PX = 1;

  // 既にあれば作り直さない（リロード/再実行対策）
  let trigger = hero.querySelector("[data-cta-trigger]");
  if (!trigger) {
    trigger = document.createElement("div");
    trigger.setAttribute("data-cta-trigger", "");
    hero.appendChild(trigger);
  }

  // hero内の上からTRIGGER_PXの位置に「判定ライン」を置く
  Object.assign(trigger.style, {
    position: "absolute",
    top: `${TRIGGER_PX}px`,
    left: "0",
    width: "1px",
    height: "1px",
    pointerEvents: "none",
    opacity: "0"
  });

  const applyState = (passed) => {
    cta.classList.toggle("is-center", !passed);
    cta.classList.toggle("is-right", passed);
  };

  const updateByTrigger = (entry) => {
    if (!mqPc.matches) {
      cta.classList.remove("is-center", "is-right");
      return;
    }

    // triggerが画面内に見えている = まだFVトップ付近 = 中央
    // triggerが上に抜けた = 少しスクロールした = 右下
    const passed = entry.boundingClientRect.top <= 0 && !entry.isIntersecting;
    applyState(passed);
  };

  // 初期状態も反映（ロード直後）
  const init = () => {
    if (!mqPc.matches) {
      cta.classList.remove("is-center", "is-right");
      return;
    }
    const top = trigger.getBoundingClientRect().top;
    const passed = top <= 0;
    applyState(passed);
  };

  const io = new IntersectionObserver(
    ([entry]) => updateByTrigger(entry),
    { threshold: [0] }
  );

  io.observe(trigger);
  init();

  if (mqPc.addEventListener) mqPc.addEventListener("change", init);
  else mqPc.addListener(init);
})();



});

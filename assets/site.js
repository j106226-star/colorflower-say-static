/* 說說花 static preview interactions: menu, cart, quiz, LINE checkout, share card. */
(function () {
  const root = document.documentElement.dataset.root || "";
  const LINE_URL = "https://line.me/R/ti/p/@917voqon";
  const LINE_ID = "@917voqon";
  const STORAGE_KEY = "colorflower-say-cart";

  const PRODUCTS = {
    "indigo-bell-jar": {
      id: "indigo-bell-jar",
      name: "夜知・靛色鐘罩花",
      size: "9 × 12 公分",
      price: 1280,
      image: "images/flowers/indigo-bell-jar.webp",
      imageAlt: "夜知・靛色鐘罩花 寶藍色永生花鐘罩作品，玻璃罩與木質底座",
      imageWidth: 800,
      imageHeight: 1067,
    },
    "orange-pot": {
      id: "orange-pot",
      name: "日橙・永生盆花",
      size: "約 20 × 13 公分",
      price: 880,
      image: "images/flowers/orange-pot.webp",
      imageAlt: "日橙・永生盆花：白色陶盆裡的橘色與粉色永生花作品",
      imageWidth: 800,
      imageHeight: 800,
    },
    "blue-perfume-bottle": {
      id: "blue-perfume-bottle",
      name: "藍色香水瓶",
      size: "約 寬 11 × 高 15 × 厚 6 公分",
      price: 880,
      image: "images/flowers/blue-perfume-bottle.webp",
      imageAlt: "藍色香水瓶：圓形玻璃瓶裡的藍色與白色永生花，瓶口繫著藍色絲帶",
      imageWidth: 800,
      imageHeight: 1066,
    },
  };

  const formatTwd = (amount) => `NT$${Number(amount).toLocaleString("en-US")}`;

  const readCart = () => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      const parsed = raw ? JSON.parse(raw) : [];
      if (!Array.isArray(parsed)) return [];
      return parsed.filter(
        (line) =>
          line &&
          PRODUCTS[line.productId] &&
          Number.isInteger(line.quantity) &&
          line.quantity > 0,
      );
    } catch {
      return [];
    }
  };

  let lines = readCart();

  const save = () => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(lines));
    renderCartChrome();
    renderCartPage();
  };

  const add = (productId) => {
    if (!PRODUCTS[productId]) return;
    const existing = lines.find((line) => line.productId === productId);
    lines = existing
      ? lines.map((line) =>
          line.productId === productId ? { ...line, quantity: line.quantity + 1 } : line,
        )
      : [...lines, { productId, quantity: 1 }];
    save();
  };

  const setQuantity = (productId, quantity) => {
    if (quantity < 1) {
      lines = lines.filter((line) => line.productId !== productId);
    } else {
      lines = lines.map((line) => (line.productId === productId ? { ...line, quantity } : line));
    }
    save();
  };

  const items = () =>
    lines.map((line) => {
      const product = PRODUCTS[line.productId];
      return { ...product, quantity: line.quantity, lineTotal: product.price * line.quantity };
    });

  const count = () => lines.reduce((sum, line) => sum + line.quantity, 0);
  const subtotal = () => items().reduce((sum, item) => sum + item.lineTotal, 0);

  const orderMessage = () => {
    const list = items();
    return [
      "你好，我想訂購：",
      ...list.map((item) => `・${item.name}（${item.size}）× ${item.quantity}，${formatTwd(item.lineTotal)}`),
      `小計：${formatTwd(subtotal())}（運費另計）`,
      "稱呼：",
      "手機：",
      "取貨方式／門市：",
      "（來自：官網購物車）",
      "麻煩幫我確認訂單與付款方式，謝謝！",
    ].join("\n");
  };

  const lineMessageUrl = (message) =>
    `https://line.me/R/oaMessage/${LINE_ID}/?${encodeURIComponent(message)}`;

  function renderCartChrome() {
    const n = count();
    document.querySelectorAll("[data-cart-link]").forEach((link) => {
      link.setAttribute("aria-label", n > 0 ? `購物車，${n} 件` : "購物車");
      const badge = link.querySelector("[data-cart-badge]");
      if (!badge) return;
      badge.hidden = n < 1;
      badge.textContent = String(n);
    });
    const floating = document.getElementById("floating-cart");
    if (floating) {
      const onCart = document.body.dataset.page === "cart";
      floating.hidden = n < 1 || onCart;
      floating.setAttribute("aria-label", `前往購物車，${n} 件`);
      const badge = floating.querySelector("[data-floating-count]");
      if (badge) badge.textContent = String(n);
    }
    const mobileLink = document.getElementById("line-order-mobile");
    if (mobileLink) mobileLink.href = lineMessageUrl(orderMessage());
  }

  function renderCartPage() {
    const list = document.getElementById("cart-lines");
    if (!list) return;
    const empty = document.getElementById("cart-empty");
    const filled = document.getElementById("cart-filled");
    const cartItems = items();
    if (cartItems.length === 0) {
      empty.hidden = false;
      filled.hidden = true;
      list.innerHTML = "";
      return;
    }
    empty.hidden = true;
    filled.hidden = false;
    list.innerHTML = cartItems
      .map(
        (item) => `
      <li class="cart-line">
        <img src="${root}${item.image}" alt="${item.imageAlt}" width="${item.imageWidth}" height="${item.imageHeight}">
        <div>
          <p class="font-heading" style="font-family:var(--font-heading);font-weight:600;margin:0">${item.name}</p>
          <p class="muted" style="margin-top:0.25rem;font-size:0.875rem">尺寸 ${item.size}</p>
          <p style="margin-top:0.25rem">${formatTwd(item.price)}</p>
          <div class="qty">
            <button type="button" class="btn btn-outline btn-sm" data-qty="${item.id}" data-delta="-1" aria-label="減少${item.name}的數量" ${item.quantity <= 1 ? "disabled" : ""}>－</button>
            <span aria-label="${item.name}數量">${item.quantity}</span>
            <button type="button" class="btn btn-outline btn-sm" data-qty="${item.id}" data-delta="1" aria-label="增加${item.name}的數量">＋</button>
            <button type="button" class="btn btn-ghost btn-sm" data-remove="${item.id}" aria-label="移除${item.name}">移除</button>
          </div>
        </div>
      </li>`,
      )
      .join("");
    const sub = document.getElementById("cart-subtotal");
    if (sub) sub.textContent = `小計 ${formatTwd(subtotal())}`;
    const box = document.getElementById("order-fallback");
    if (box) box.value = orderMessage();
  }

  document.addEventListener("click", (event) => {
    const addBtn = event.target.closest("[data-add]");
    if (addBtn) {
      add(addBtn.dataset.add);
      const original = addBtn.dataset.label || "加入購物車 ＋";
      addBtn.textContent = "已加入 ✓";
      window.setTimeout(() => {
        addBtn.textContent = original;
      }, 1500);
      return;
    }
    const qtyBtn = event.target.closest("[data-qty]");
    if (qtyBtn) {
      const id = qtyBtn.dataset.qty;
      const current = lines.find((line) => line.productId === id);
      if (!current) return;
      setQuantity(id, current.quantity + Number(qtyBtn.dataset.delta));
      return;
    }
    const removeBtn = event.target.closest("[data-remove]");
    if (removeBtn) setQuantity(removeBtn.dataset.remove, 0);
  });

  const copyBtn = document.getElementById("copy-order");
  if (copyBtn) {
    copyBtn.addEventListener("click", async () => {
      const status = document.getElementById("copy-status");
      const message = orderMessage();
      try {
        if (navigator.clipboard && window.isSecureContext) {
          await navigator.clipboard.writeText(message);
        } else {
          const area = document.createElement("textarea");
          area.value = message;
          area.setAttribute("readonly", "");
          area.style.position = "fixed";
          area.style.top = "-1000px";
          document.body.appendChild(area);
          area.select();
          const ok = document.execCommand("copy");
          area.remove();
          if (!ok) throw new Error("copy failed");
        }
        if (status) status.textContent = "已複製，請貼到 LINE 對話";
      } catch {
        if (status) status.textContent = "這個瀏覽器無法自動複製，請選取下面的文字複製後，貼到 LINE 對話。";
        const box = document.getElementById("order-fallback");
        if (box) {
          box.hidden = false;
          box.value = message;
          box.focus();
          box.select();
        }
      }
    });
  }

  function initNav() {
    const nav = document.getElementById("home-nav");
    const toggle = document.getElementById("menu-toggle");
    const menu = document.getElementById("mobile-menu");
    const setScrolled = () => {
      if (nav) nav.classList.toggle("is-scrolled", window.scrollY > 20);
    };
    setScrolled();
    window.addEventListener("scroll", setScrolled, { passive: true });

    const closeMenu = () => {
      if (!menu || !toggle) return;
      menu.classList.remove("is-open");
      toggle.setAttribute("aria-expanded", "false");
      toggle.setAttribute("aria-label", "開啟選單");
      const openIcon = toggle.querySelector("[data-icon-open]");
      const closeIcon = toggle.querySelector("[data-icon-close]");
      if (openIcon) openIcon.hidden = false;
      if (closeIcon) closeIcon.hidden = true;
    };
    const openMenu = () => {
      menu.classList.add("is-open");
      toggle.setAttribute("aria-expanded", "true");
      toggle.setAttribute("aria-label", "關閉選單");
      const openIcon = toggle.querySelector("[data-icon-open]");
      const closeIcon = toggle.querySelector("[data-icon-close]");
      if (openIcon) openIcon.hidden = true;
      if (closeIcon) closeIcon.hidden = false;
    };

    if (toggle && menu) {
      toggle.addEventListener("click", () => {
        if (menu.classList.contains("is-open")) closeMenu();
        else openMenu();
      });
      menu.querySelectorAll("a, button").forEach((el) => {
        el.addEventListener("click", () => closeMenu());
      });
    }

    document.querySelectorAll("[data-scroll]").forEach((el) => {
      el.addEventListener("click", (event) => {
        const id = el.getAttribute("href") || el.dataset.scroll;
        if (!id || !id.startsWith("#")) return;
        const target = id === "#hero" ? document.getElementById("hero") : document.querySelector(id);
        if (!target) return;
        event.preventDefault();
        if (id === "#hero") window.scrollTo({ top: 0, behavior: "smooth" });
        else target.scrollIntoView({ behavior: "smooth" });
        closeMenu();
      });
    });

    document.querySelectorAll("[data-top]").forEach((el) => {
      el.addEventListener("click", (event) => {
        event.preventDefault();
        window.scrollTo({ top: 0, behavior: "smooth" });
      });
    });
  }

  function initQuiz() {
    const grid = document.getElementById("color-grid");
    if (!grid) return;
    const show = (id, shouldScroll) => {
      grid.querySelectorAll("[data-color-pick]").forEach((btn) => {
        const on = btn.dataset.colorPick === id;
        btn.setAttribute("aria-pressed", on ? "true" : "false");
        btn.classList.toggle("is-active", on);
        btn.style.backgroundColor = on ? btn.dataset.soft || "" : "";
      });
      document.querySelectorAll("[data-result]").forEach((el) => {
        el.hidden = el.dataset.result !== id;
      });
      const prompt = document.getElementById("quiz-prompt");
      const idle = document.getElementById("quiz-idle-cta");
      if (prompt) prompt.hidden = Boolean(id);
      if (idle) idle.hidden = Boolean(id);
      if (!id) return;
      const url = new URL(location.href);
      url.searchParams.set("color", id);
      history.replaceState(null, "", url);
      if (shouldScroll) {
        document.getElementById("quiz-result")?.scrollIntoView({ behavior: "smooth", block: "start" });
      }
    };

    grid.addEventListener("click", (event) => {
      const btn = event.target.closest("[data-color-pick]");
      if (!btn) return;
      show(btn.dataset.colorPick, true);
    });

    const initial = new URL(location.href).searchParams.get("color");
    if (initial && document.querySelector(`[data-result="${initial}"]`)) show(initial, false);
  }

  const wrapText = (ctx, text, maxWidth) => {
    const linesOut = [];
    let line = "";
    for (const ch of text) {
      if (ctx.measureText(line + ch).width > maxWidth && line) {
        linesOut.push(line);
        line = ch;
      } else line += ch;
    }
    if (line) linesOut.push(line);
    return linesOut;
  };

  const roundRect = (ctx, x, y, w, h, r) => {
    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.arcTo(x + w, y, x + w, y + h, r);
    ctx.arcTo(x + w, y + h, x, y + h, r);
    ctx.arcTo(x, y + h, x, y, r);
    ctx.arcTo(x, y, x + w, y, r);
    ctx.closePath();
  };

  const loadImage = (src) =>
    new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => resolve(img);
      img.onerror = reject;
      img.src = src;
    });

  async function shareCardBlob(article) {
    const W = 1080;
    const H = 1350;
    const font = "'Noto Sans TC', 'PingFang TC', 'Microsoft JhengHei', 'WenQuanYi Micro Hei', sans-serif";
    if (document.fonts?.load) {
      await Promise.all(
        ["30px", "26px", "72px", "40px", "28px", "24px"].map((size) =>
          document.fonts.load(`600 ${size} ${font}`).catch(() => {}),
        ),
      );
    }
    const canvas = document.createElement("canvas");
    canvas.width = W;
    canvas.height = H;
    const ctx = canvas.getContext("2d");
    if (!ctx) throw new Error("Canvas not supported");
    const soft = article.dataset.soft;
    const dark = article.dataset.dark;
    const code = article.dataset.code;
    ctx.fillStyle = soft;
    ctx.fillRect(0, 0, W, H);
    const glow = ctx.createRadialGradient(W / 2, 420, 80, W / 2, 420, 640);
    glow.addColorStop(0, code + "55");
    glow.addColorStop(1, code + "00");
    ctx.fillStyle = glow;
    ctx.fillRect(0, 0, W, H);
    ctx.textAlign = "center";
    ctx.fillStyle = dark;
    ctx.font = `500 30px ${font}`;
    ctx.fillText("說說花 COLORFLOWER SAY", W / 2, 96);
    ctx.font = `600 26px ${font}`;
    ctx.globalAlpha = 0.75;
    ctx.fillText(`${article.dataset.roman} · YOUR COLOR, TODAY`, W / 2, 150);
    ctx.globalAlpha = 1;
    try {
      const img = await loadImage(article.dataset.bottle);
      const imgH = 380;
      const imgW = (img.width / img.height) * imgH;
      ctx.save();
      ctx.shadowColor = "rgba(0,0,0,0.18)";
      ctx.shadowBlur = 30;
      ctx.shadowOffsetY = 12;
      ctx.drawImage(img, W / 2 - imgW / 2, 200, imgW, imgH);
      ctx.restore();
    } catch {
      /* image optional */
    }
    ctx.fillStyle = "#3D3D3D";
    ctx.font = `600 72px ${font}`;
    ctx.fillText(`${article.dataset.display}｜${article.dataset.chakra}`, W / 2, 700);
    ctx.font = `400 30px ${font}`;
    ctx.globalAlpha = 0.8;
    ctx.fillText(article.dataset.bottleLabel, W / 2, 756);
    ctx.globalAlpha = 1;
    ctx.fillStyle = dark;
    ctx.font = `500 26px ${font}`;
    ctx.fillText("🌱 給自己的提醒", W / 2, 838);
    ctx.fillStyle = "#3D3D3D";
    ctx.font = `600 40px ${font}`;
    wrapText(ctx, article.dataset.reminder, W - 220).forEach((line, i) => {
      ctx.fillText(line, W / 2, 900 + i * 56);
    });
    const keywords = (article.dataset.keywords || "").split("|").filter(Boolean);
    ctx.font = `500 28px ${font}`;
    const chips = keywords.map((word) => ({ word, w: ctx.measureText(word).width + 56 }));
    const gap = 24;
    const total = chips.reduce((s, c) => s + c.w, 0) + gap * Math.max(chips.length - 1, 0);
    let x = W / 2 - total / 2;
    const chipY = 1010;
    chips.forEach(({ word, w }) => {
      ctx.fillStyle = "#FFFFFFCC";
      roundRect(ctx, x, chipY, w, 64, 32);
      ctx.fill();
      ctx.strokeStyle = dark + "44";
      ctx.lineWidth = 2;
      ctx.stroke();
      ctx.fillStyle = "#3D3D3D";
      ctx.fillText(word, x + w / 2, chipY + 42);
      x += w + gap;
    });
    ctx.fillStyle = dark;
    roundRect(ctx, 0, H - 120, W, 120, 0);
    ctx.fill();
    ctx.fillStyle = "#FFFFFF";
    ctx.font = `600 30px ${font}`;
    ctx.fillText("色彩脈輪測驗", W / 2, H - 66);
    ctx.font = `400 24px ${font}`;
    ctx.globalAlpha = 0.85;
    ctx.fillText("j106226-star.github.io/colorflower-say-static/chakra-quiz", W / 2, H - 26);
    ctx.globalAlpha = 1;
    return new Promise((resolve, reject) => {
      canvas.toBlob((blob) => (blob ? resolve(blob) : reject(new Error("toBlob failed"))), "image/png");
    });
  }

  function visibleResult() {
    return [...document.querySelectorAll("[data-result]")].find((el) => !el.hidden);
  }

  document.addEventListener("click", async (event) => {
    const download = event.target.closest("[data-share-download]");
    const share = event.target.closest("[data-share-send]");
    if (!download && !share) return;
    const article = visibleResult();
    const box = (download || share).closest("[data-share-box]");
    const status = box?.querySelector("[data-share-status]");
    const buttons = box ? [...box.querySelectorAll("button")] : [];
    buttons.forEach((btn) => (btn.disabled = true));
    const trigger = download || share;
    const originalHtml = trigger.innerHTML;
    trigger.textContent = "製作中…";
    try {
      const blob = await shareCardBlob(article);
      if (download) {
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `chakra-quiz-${article.dataset.result}.png`;
        a.click();
        URL.revokeObjectURL(url);
      } else {
        const pageUrl = `${location.origin}${location.pathname}?color=${article.dataset.result}`;
        const text = `我的色彩脈輪測驗結果是「${article.dataset.display}｜${article.dataset.chakra}」——${article.dataset.reminder}`;
        const file = new File([blob], `chakra-quiz-${article.dataset.result}.png`, { type: "image/png" });
        try {
          if (navigator.canShare?.({ files: [file] })) {
            await navigator.share({ files: [file], title: "色彩脈輪測驗結果", text, url: pageUrl });
            if (status) status.textContent = "";
          } else if (navigator.share) {
            await navigator.share({ title: "色彩脈輪測驗結果", text, url: pageUrl });
            if (status) status.textContent = "";
          } else {
            await navigator.clipboard.writeText(`${text}\n${pageUrl}`);
            if (status) status.textContent = "已複製結果連結，可以貼給朋友了。";
          }
        } catch (err) {
          if (err && err.name === "AbortError") {
            if (status) status.textContent = "";
          } else if (status) status.textContent = "分享失敗，請改用下載分享卡。";
        }
      }
    } catch {
      if (status) status.textContent = "產生分享卡失敗，請稍後再試。";
    } finally {
      buttons.forEach((btn) => (btn.disabled = false));
      trigger.innerHTML = originalHtml;
    }
  });

  initNav();
  initQuiz();
  renderCartChrome();
  renderCartPage();
})();

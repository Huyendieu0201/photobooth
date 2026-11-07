(() => {
  const $ = (id) => document.getElementById(id);
  const video = $('video'), canvas = $('captureCanvas'), ctx = canvas.getContext('2d');
  const startBtn = $('startCamera'), captureBtn = $('captureBtn');
  const placeholder = $('cameraPlaceholder'), countdown = $('countdown');
  const status = $('sessionStatus'), finalStrip = $('finalStrip');
  const emptyResult = $('emptyResult'), downloadBtn = $('downloadBtn'), retakeBtn = $('retakeBtn');

  let stream = null, facing = 'user', photoCount = 4, filter = 'normal', frame = 'cream', decor = 'none', timerOn = true;
  let shots = [], finalBlobUrl = null, busy = false;

  // ============================================================
  //  FILTERS — 20 bộ lọc
  // ============================================================
  const FILTERS = [
    ['normal','Original','none','#d9a68f','#edd6c1'],
    ['soft','Soft','brightness(1.07) contrast(.92) saturate(.82)','#e8c9bf','#f4e7d9'],
    ['film','Film','sepia(.28) contrast(.92) saturate(.82)','#a98b6b','#e2c7a0'],
    ['mono','B&W','grayscale(1) contrast(1.08)','#444','#ddd'],
    ['warm','Warm','sepia(.2) saturate(1.25) brightness(1.04)','#bd7149','#f0c17f'],
    ['dreamy','Dreamy','brightness(1.12) contrast(.86) saturate(.78) hue-rotate(8deg)','#b5a3c7','#e9d5e1'],
    ['sakura','Sakura','brightness(1.08) saturate(1.2) hue-rotate(-12deg) contrast(.93)','#f2a7bd','#fde3ea'],
    ['peach','Peach','sepia(.15) saturate(1.3) brightness(1.08) hue-rotate(-6deg)','#f4a582','#ffd9b8'],
    ['matcha','Matcha','sepia(.2) saturate(1.1) hue-rotate(35deg) brightness(1.04)','#9bb77c','#dfeccb'],
    ['ice','Ice','saturate(.9) hue-rotate(15deg) brightness(1.1) contrast(.95)','#9cc3e6','#e3f1fb'],
    ['sunset','Sunset','sepia(.3) saturate(1.5) hue-rotate(-18deg) contrast(1.02)','#e8734a','#f7c46c'],
    ['vintage','Vintage','sepia(.45) contrast(1.05) saturate(.9) hue-rotate(-8deg)','#8d6e4f','#d8c3a0'],
    ['pop','Pop','saturate(1.6) contrast(1.1) brightness(1.03)','#ff6b9a','#ffd23f'],
    ['noir','Noir','grayscale(1) contrast(1.3) brightness(.92)','#111','#999'],
    ['blossom','Blossom','brightness(1.1) saturate(1.15) sepia(.1) hue-rotate(-10deg)','#f5b0c6','#fde8f0'],
    ['caramel','Caramel','sepia(.3) saturate(1.1) brightness(1.06) hue-rotate(10deg)','#c98a5c','#f5dcc0'],
    ['ocean','Ocean','saturate(1.2) hue-rotate(170deg) brightness(1.02) contrast(.95)','#5fa8c9','#c2e4f2'],
    ['lilac','Lilac','brightness(1.05) saturate(.9) hue-rotate(-25deg) sepia(.08)','#c3b1e0','#f0e8fc'],
    ['citrus','Citrus','saturate(1.3) brightness(1.06) hue-rotate(20deg)','#e8b84a','#fff0b3'],
    ['fairy','Fairy','brightness(1.12) contrast(.9) saturate(.85) hue-rotate(-5deg) sepia(.05)','#e8c0e0','#fce4f4']
  ];

  // ============================================================
  //  FRAMES — 24 khung ảnh
  // ============================================================
  const FRAMES = [
    ['cream','Vanilla','#f2e7d8','#806e60','','#f2e7d8'],
    ['pink','Blush','#f7cfd6','#a8586f','','#f7cfd6'],
    ['black','Classic','#302b29','#f2e7d8','','#302b29'],
    ['lavender','Lavender','#dcd4e9','#766b8a','','#dcd4e9'],
    ['mint','Mint','#cfe9da','#4f7a63','','#cfe9da'],
    ['sky','Sky','#cfe2f5','#4f6f94','','#cfe2f5'],
    ['butter','Butter','#fbeaa6','#8a7430','','#fbeaa6'],
    ['gingham','Gingham','#f6c6d0','#a8586f','gingham','repeating-linear-gradient(0deg,#fff6 0 3px,transparent 3px 6px),repeating-linear-gradient(90deg,#fff6 0 3px,transparent 3px 6px),#f6c6d0'],
    ['dots','Polka','#fad7c4','#a0624a','dots','radial-gradient(#fffa 1.5px,transparent 2px) 0 0/7px 7px,#fad7c4'],
    ['hearts','Lovely','#f8c8d8','#b04a70','hearts','#f8c8d8'],
    ['stripes','Candy','#d3e6f7','#4f6f94','stripes','repeating-linear-gradient(90deg,#fffa 0 4px,transparent 4px 8px),#d3e6f7'],
    ['film','Film','#1e1a19','#f2e7d8','film','#1e1a19'],
    ['rose','Rose','#f0c8d8','#8a3a5a','','#f0c8d8'],
    ['sage','Sage','#d5e8d0','#4a6b52','','#d5e8d0'],
    ['lilac','Lilac','#e8dcf4','#7a5a9a','','#e8dcf4'],
    ['lemon','Lemon','#fef4c8','#9a8a30','','#fef4c8'],
    ['coral','Coral','#ffd8cc','#a8584a','','#ffd8cc'],
    ['cloud','Cloud','#e8f0f8','#6a8aaa','','#e8f0f8'],
    ['checker','Checker','#f0e8e8','#807070','checker','repeating-conic-gradient(#fff6 0 25%,transparent 0 50%) 0 0/12px 12px,#f0e8e8'],
    ['confetti','Confetti','#fce4ec','#a05070','confetti','#fce4ec'],
    ['stars','Stars','#e8e0f0','#6050a0','stars','#e8e0f0'],
    ['washi','Washi','#f4e8e0','#806858','washi','repeating-linear-gradient(45deg,transparent 0 8px,#0001 8px 10px),#f4e8e0'],
    ['bubble','Bubble','#e0f0f0','#508080','bubble','#e0f0f0'],
    ['plain','Plain','#ffffff','#888888','','#ffffff']
  ];

  // ============================================================
  //  DECOR — Stickers (Twemoji free CC-BY 4.0)
  // ============================================================
  const DECOR = [
    ['none','No sticker',[]],
    ['hearts','💗 Hearts',['1f497','1f495','1f496','1f49d']],
    ['stars','✨ Stars',['2b50','2728','1f31f','1f4ab']],
    ['bows','🎀 Bows',['1f380','1f9f8','1f48c','1f380']],
    ['bunny','🐰 Bunny',['1f430','1f338','1f955','1f33c']],
    ['kitty','🐱 Kitty',['1f431','1f43e','1f41f','1f499']],
    ['sweets','🍓 Sweets',['1f353','1f370','1f36d','1f352']],
    ['dream','🌈 Dreamy',['1f308','2601','1f98b','1f319']],
    ['flowers','🌸 Flowers',['1f338','1f33c','1f337','1f33b']],
    ['sparkle','💫 Sparkle',['1f4ab','2728','2b50','1f31f']],
    ['cute','🧸 Cute',['1f9f8','1f43b','1f9f8','1f380']],
    ['love','💕 Love',['1f495','1f49e','1f497','1f49d']],
    ['sky','☁️ Sky',['2601','1f319','2b50','1f31f']],
    ['nature','🌿 Nature',['1f343','1f33f','1f340','1f331']],
    ['party','🎉 Party',['1f389','1f38a','1f388','1f38b']],
    ['kawaii','🍡 Kawaii',['1f361','1f36c','1f9f8','1f380']]
  ];

  const F = Object.fromEntries(FILTERS.map(f => [f[0], f[2]]));
  const TW = 'https://cdn.jsdelivr.net/gh/twitter/twemoji@14.0.2/assets/svg/';
  const cache = {};
  const sticker = (code) => cache[code] || (cache[code] = new Promise(res => {
    const i = new Image();
    i.crossOrigin = 'anonymous';
    i.onload = () => res(i);
    i.onerror = () => res(null);
    i.src = TW + code + '.svg';
  }));

  // render UI lựa chọn
  $('filterChoices').innerHTML = FILTERS.map(f =>
    `<button class="filter-choice${f[0]===filter?' active':''}" data-filter="${f[0]}">
      <span class="filter-swatch" style="background:linear-gradient(135deg,${f[3]},${f[4]})"></span>
      <b>${f[1]}</b>
    </button>`
  ).join('');

  $('frameChoices').innerHTML = FRAMES.map(f =>
    `<button class="frame-choice${f[0]===frame?' active':''}" data-frame="${f[0]}">
      <span class="frame-preview" style="background:${f[5]}"><i></i><i></i><i></i></span>
      <b>${f[1]}</b>
    </button>`
  ).join('');

  $('decorChoices').innerHTML = DECOR.map(d =>
    `<button class="decor-choice${d[0]===decor?' active':''}" data-decor="${d[0]}">${d[1]}</button>`
  ).join('');

  $('filterCount').textContent = FILTERS.length + ' FILTERS';
  $('frameCount').textContent = FRAMES.length + ' FRAMES';

  // ============================================================
  //  TOAST
  // ============================================================
  function toast(message) {
    const el = $('toast');
    el.textContent = message;
    el.classList.add('show');
    clearTimeout(toast.timeout);
    toast.timeout = setTimeout(() => el.classList.remove('show'), 2800);
  }

  // ============================================================
  //  CAMERA
  // ============================================================
  async function startCamera() {
    if (!navigator.mediaDevices?.getUserMedia) {
      toast('Trình duyệt không hỗ trợ camera. Hãy dùng Chrome/Edge và HTTPS hoặc localhost.');
      return;
    }
    try {
      if (stream) stream.getTracks().forEach(t => t.stop());
      stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: facing, width: { ideal: 1280 }, height: { ideal: 960 } },
        audio: false
      });
      video.srcObject = stream;
      await video.play();
      video.classList.add('active');
      // Lật preview nếu là camera trước (giống gương selfie)
      video.classList.toggle('mirrored', facing === 'user');
      placeholder.hidden = true;
      status.innerHTML = '<span class="status-dot"></span> Camera đã sẵn sàng';
      status.classList.add('connected');
      captureBtn.disabled = false;
      $('flipCamera').disabled = false;
      startBtn.textContent = 'Camera đã bật';
      toast('Camera đã sẵn sàng. Let\'s take some photos! ♡');
    } catch (err) {
      toast(
        err.name === 'NotAllowedError'
          ? 'Bạn chưa cấp quyền camera. Hãy cho phép camera trong trình duyệt.'
          : err.name === 'NotFoundError'
            ? 'Không tìm thấy camera trên thiết bị.'
            : 'Không thể mở camera. Hãy kiểm tra quyền truy cập.'
      );
    }
  }

  // FIX: cập nhật cả filter và class mirrored mỗi khi đổi camera/filter
  const setCameraPreviewFilter = () => {
    video.style.filter = F[filter];
    video.classList.toggle('mirrored', facing === 'user');
  };

  const setActive = (sel, attr, value) =>
    document.querySelectorAll(sel).forEach(el =>
      el.classList.toggle('active', el.dataset[attr] === value)
    );

  const wait = (ms) => new Promise(r => setTimeout(r, ms));

  const hint = () => {
    $('captureHint').textContent = timerOn
      ? `${photoCount} tấm ảnh · 3 giây đếm ngược`
      : `${photoCount} tấm ảnh · không đếm ngược`;
  };

  async function runCountdown() {
    if (!timerOn) return;
    for (let n = 3; n >= 1; n--) {
      countdown.textContent = n;
      countdown.classList.remove('show');
      void countdown.offsetWidth;
      countdown.classList.add('show');
      await wait(850);
    }
    countdown.classList.remove('show');
  }

  async function takeShot() {
    if (!stream || busy) return;
    busy = true;
    captureBtn.disabled = true;
    shots = [];
    try {
      for (let i = 0; i < photoCount; i++) {
        $('captureHint').textContent = `Đang chụp ảnh ${i+1}/${photoCount}…`;
        if (i > 0) await wait(900);
        await runCountdown();
        const w = video.videoWidth, h = video.videoHeight;
        if (!w || !h) throw new Error('Camera chưa sẵn sàng.');
        canvas.width = w;
        canvas.height = h;
        ctx.save();
        // FIX: camera trước lật gương → ảnh chụp đúng chiều
        // Camera sau không lật
        if (facing === 'user') {
          ctx.translate(w, 0);
          ctx.scale(-1, 1);
        }
        ctx.drawImage(video, 0, 0, w, h);
        ctx.restore();
        $('flash').classList.remove('on');
        void $('flash').offsetWidth;
        $('flash').classList.add('on');
        shots.push(canvas.toDataURL('image/jpeg', .94));
      }
      await renderStrip();
      toast('Xong rồi! Dải ảnh của bạn đã sẵn sàng ♡');
      $('resultSection').scrollIntoView({ behavior: 'smooth', block: 'start' });
    } catch (e) {
      toast(e.message || 'Có lỗi khi chụp ảnh.');
    } finally {
      busy = false;
      captureBtn.disabled = !stream;
      hint();
    }
  }

  const loadImage = (src) => new Promise((res, rej) => {
    const img = new Image();
    img.onload = () => res(img);
    img.onerror = rej;
    img.src = src;
  });

  function rr(c, x, y, w, h, r) {
    c.beginPath();
    if (c.roundRect) c.roundRect(x, y, w, h, r);
    else c.rect(x, y, w, h);
  }

  // ============================================================
  //  PAINT BACKGROUND
  // ============================================================
  function paintBg(c, fr, w, h) {
    c.fillStyle = fr[2];
    c.fillRect(0, 0, w, h);
    const p = fr[4];
    if (p === 'gingham') {
      c.fillStyle = 'rgba(255,255,255,.38)';
      for (let x = 0; x < w; x += 26) c.fillRect(x, 0, 13, h);
      for (let y = 0; y < h; y += 26) c.fillRect(0, y, w, 13);
    } else if (p === 'dots') {
      c.fillStyle = 'rgba(255,255,255,.75)';
      for (let y = 14; y < h; y += 28)
        for (let x = (y/28|0)%2 ? 28 : 14; x < w; x += 28) {
          c.beginPath(); c.arc(x, y, 4, 0, 7); c.fill();
        }
    } else if (p === 'hearts') {
      c.fillStyle = 'rgba(255,255,255,.55)';
      c.font = '20px serif';
      c.textAlign = 'center';
      for (let y = 24; y < h; y += 36)
        for (let x = (y/36|0)%2 ? 36 : 18; x < w; x += 36) c.fillText('♥', x, y);
    } else if (p === 'stripes') {
      c.fillStyle = 'rgba(255,255,255,.55)';
      for (let x = 0; x < w; x += 24) c.fillRect(x, 0, 12, h);
    } else if (p === 'film') {
      c.fillStyle = '#f2e7d8';
      for (let y = 12; y < h - 10; y += 28) {
        rr(c, 9, y, 12, 17, 3); c.fill();
        rr(c, w - 21, y, 12, 17, 3); c.fill();
      }
    } else if (p === 'checker') {
      c.fillStyle = 'rgba(255,255,255,.35)';
      for (let y = 0; y < h; y += 16)
        for (let x = (y/16|0)%2 ? 16 : 0; x < w; x += 32) {
          c.fillRect(x, y, 16, 16);
        }
    } else if (p === 'stars') {
      c.fillStyle = 'rgba(255,255,255,.6)';
      c.font = '18px serif';
      c.textAlign = 'center';
      for (let y = 22; y < h; y += 34)
        for (let x = (y/34|0)%2 ? 34 : 17; x < w; x += 34) c.fillText('✦', x, y);
    } else if (p === 'washi') {
      c.fillStyle = 'rgba(255,255,255,.2)';
      for (let x = 0; x < w; x += 18) c.fillRect(x, 0, 8, h);
    } else if (p === 'bubble') {
      c.fillStyle = 'rgba(255,255,255,.45)';
      for (let y = 20; y < h; y += 30)
        for (let x = (y/30|0)%2 ? 30 : 15; x < w; x += 30) {
          c.beginPath(); c.arc(x, y, 6, 0, 7); c.fill();
        }
    } else if (p === 'confetti') {
      const cols = ['#ff9ec2','#c9b6f0','#a8e6cf','#ffe9a8','#ffc9a8'];
      for (let i = 0; i < 80; i++) {
        c.fillStyle = cols[i % cols.length] + 'aa';
        c.fillRect(Math.random()*w, Math.random()*h, 4, 8);
      }
    }
  }

  // ============================================================
  //  RENDER STRIP
  // ============================================================
  async function renderStrip() {
    if (!shots.length) return;
    const images = await Promise.all(shots.map(loadImage));
    const fr = FRAMES.find(f => f[0] === frame);
    const set = DECOR.find(d => d[0] === decor);
    const stk = set[2].length ? await Promise.all(set[2].map(sticker)) : [];

    const width = 600;
    const pad = fr[4] === 'film' ? 44 : 36;
    const gap = 26;
    const photoW = width - pad*2;
    const photoH = Math.round(photoW * 3/4);
    const note = $('captionInput').value.trim();
    const footerH = note ? 92 : 70;
    const height = pad + images.length*photoH + (images.length-1)*gap + footerH;

    const out = document.createElement('canvas');
    out.width = width;
    out.height = height;
    const c = out.getContext('2d');
    paintBg(c, fr, width, height);

    images.forEach((img, i) => {
      const y = pad + i*(photoH + gap);
      c.save();
      c.shadowColor = 'rgba(0,0,0,.18)';
      c.shadowBlur = 12;
      c.shadowOffsetY = 3;
      c.fillStyle = '#fff';
      rr(c, pad-6, y-6, photoW+12, photoH+12, 16);
      c.fill();
      c.restore();

      c.save();
      rr(c, pad, y, photoW, photoH, 11);
      c.clip();
      const s = Math.max(photoW/img.width, photoH/img.height);
      const sw = photoW/s, sh = photoH/s;
      c.filter = F[filter];
      c.drawImage(img, (img.width-sw)/2, (img.height-sh)/2, sw, sh, pad, y, photoW, photoH);
      c.restore();
      c.filter = 'none';

      if (stk.length) {
        [[pad-14, y-14, -.25, 0], [pad+photoW-52, y+photoH-52, .22, 1]].forEach(([sx, sy, rot, k]) => {
          const st = stk[(i + k) % stk.length];
          if (!st) return;
          c.save();
          c.translate(sx+33, sy+33);
          c.rotate(rot);
          c.drawImage(st, -33, -33, 66, 66);
          c.restore();
        });
      }
    });

    c.fillStyle = fr[3];
    c.textAlign = 'center';
    if (note) {
      c.font = 'italic 27px Georgia,serif';
      c.fillText(note, width/2, height - footerH + 36);
    }
    c.font = 'bold 12px Arial,sans-serif';
    c.letterSpacing = '3px';
    c.fillText('LITTLE MOMENTS  ✳  PHOTOBOOTH', width/2, height - 24);

    const blob = await new Promise(r => out.toBlob(r, 'image/png'));
    if (finalBlobUrl) URL.revokeObjectURL(finalBlobUrl);
    finalBlobUrl = URL.createObjectURL(blob);
    finalStrip.src = finalBlobUrl;
    finalStrip.hidden = false;
    emptyResult.hidden = true;
    downloadBtn.disabled = false;
    retakeBtn.disabled = false;
    $('resultCount').textContent = `${images.length} PHOTOS · READY TO SAVE`;
  }

  // ============================================================
  //  EVENTS
  // ============================================================
  const bind = (attr, fn) => document.querySelectorAll(`[data-${attr}]`).forEach(b =>
    b.addEventListener('click', () => {
      fn(b.dataset[attr]);
      if (shots.length && !busy) renderStrip();
    })
  );

  startBtn.addEventListener('click', startCamera);
  captureBtn.addEventListener('click', takeShot);

  $('flipCamera').addEventListener('click', async () => {
    facing = facing === 'user' ? 'environment' : 'user';
    await startCamera();
  });

  $('timerToggle').addEventListener('click', () => {
    timerOn = !timerOn;
    $('timerToggle').style.background = timerOn ? '#ffe6ee' : '#fff';
    hint();
    toast(timerOn ? 'Đã bật đếm ngược' : 'Đã tắt đếm ngược');
  });

  $('captionInput').addEventListener('input', () => {
    if (shots.length && !busy) renderStrip();
  });

  bind('count', v => {
    photoCount = Number(v);
    setActive('.choice', 'count', v);
    $('layoutLabel').textContent = `${photoCount} PHOTOS`;
    hint();
  });

  bind('filter', v => {
    filter = v;
    setActive('.filter-choice', 'filter', v);
    setCameraPreviewFilter();
  });

  bind('frame', v => {
    frame = v;
    setActive('.frame-choice', 'frame', v);
  });

  bind('decor', v => {
    decor = v;
    setActive('.decor-choice', 'decor', v);
  });

  downloadBtn.addEventListener('click', () => {
    if (!finalBlobUrl) return;
    const a = document.createElement('a');
    a.href = finalBlobUrl;
    a.download = `little-moments-${new Date().toISOString().slice(0,10)}.png`;
    document.body.appendChild(a);
    a.click();
    a.remove();
  });

  retakeBtn.addEventListener('click', () => {
    shots = [];
    finalStrip.hidden = true;
    emptyResult.hidden = false;
    downloadBtn.disabled = true;
    retakeBtn.disabled = true;
    $('resultCount').textContent = 'NO PHOTOS YET';
    $('studio').scrollIntoView({ behavior: 'smooth' });
  });

  $('flipCamera').disabled = true;
  window.addEventListener('beforeunload', () => {
    if (stream) stream.getTracks().forEach(t => t.stop());
    if (finalBlobUrl) URL.revokeObjectURL(finalBlobUrl);
  });

  setCameraPreviewFilter();
})();
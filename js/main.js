(() => {
  const finePointer = matchMedia('(hover: hover) and (pointer: fine)').matches;

  /* ---------- mobile menu ---------- */
  const burger = document.querySelector('.nav__burger');
  const menu = document.querySelector('.menu');
  const setMenu = (open) => {
    burger.setAttribute('aria-expanded', open);
    menu.classList.toggle('is-open', open);
    menu.setAttribute('aria-hidden', !open);
    document.body.style.overflow = open ? 'hidden' : '';
  };
  burger.addEventListener('click', () => setMenu(burger.getAttribute('aria-expanded') !== 'true'));
  menu.querySelectorAll('a').forEach((a) => a.addEventListener('click', () => setMenu(false)));

  /* ---------- scroll reveal ---------- */
  const io = new IntersectionObserver((entries) => {
    entries.forEach((e) => {
      if (e.isIntersecting) { e.target.classList.add('is-in'); io.unobserve(e.target); }
    });
  }, { threshold: 0.15 });
  document.querySelectorAll('.reveal').forEach((el) => io.observe(el));

  /* ---------- lazy load card videos & autoplay previews when visible ---------- */
  const cards = document.querySelectorAll('.card');
  const vio = new IntersectionObserver((entries) => {
    entries.forEach((e) => {
      const v = e.target.querySelector('video');
      if (e.isIntersecting) {
        if (!v.src) { v.src = v.dataset.src; }
        v.play().catch(() => {});
      } else if (v.src) {
        v.pause();
      }
    });
  }, { rootMargin: '150px 0px', threshold: 0.25 });
  cards.forEach((c) => vio.observe(c));

  /* ---------- modal player ---------- */
  const player = document.querySelector('.player');
  const pVideo = player.querySelector('.player__video');
  const pTitle = player.querySelector('.player__title');
  const closeBtn = player.querySelector('.player__close');
  let lastFocus = null;

  const open = (card) => {
    lastFocus = card;
    pVideo.src = card.dataset.video;
    pTitle.textContent = card.dataset.title || '';
    player.hidden = false;
    document.body.style.overflow = 'hidden';
    pVideo.play().catch(() => {});
    closeBtn.focus();
  };
  const close = () => {
    pVideo.pause();
    pVideo.removeAttribute('src');
    pVideo.load();
    player.hidden = true;
    document.body.style.overflow = '';
    if (lastFocus) lastFocus.focus();
  };
  cards.forEach((c) => {
    c.tabIndex = 0;
    c.setAttribute('role', 'button');
    c.setAttribute('aria-label', `${c.dataset.title} を再生`);
    c.addEventListener('click', () => open(c));
    c.addEventListener('keydown', (e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); open(c); } });
  });
  closeBtn.addEventListener('click', close);
  player.addEventListener('click', (e) => { if (e.target === player) close(); });
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape' && !player.hidden) close(); });

  /* ---------- custom cursor ---------- */
  if (finePointer) {
    const cursor = document.querySelector('.cursor');
    let x = innerWidth / 2, y = innerHeight / 2, cx = x, cy = y;
    addEventListener('mousemove', (e) => { x = e.clientX; y = e.clientY; });
    const loop = () => {
      cx += (x - cx) * 0.2; cy += (y - cy) * 0.2;
      cursor.style.transform = `translate(${cx}px, ${cy}px) translate(-50%, -50%)`;
      requestAnimationFrame(loop);
    };
    loop();
    document.querySelectorAll('.card').forEach((el) => {
      el.addEventListener('mouseenter', () => cursor.classList.add('is-play'));
      el.addEventListener('mouseleave', () => cursor.classList.remove('is-play'));
    });
    document.querySelectorAll('a, button').forEach((el) => {
      el.addEventListener('mouseenter', () => cursor.classList.add('is-link'));
      el.addEventListener('mouseleave', () => cursor.classList.remove('is-link'));
    });
  }

  /* ---------- hero photo tilt (desktop) ---------- */
  const photo = document.querySelector('.hero__photo');
  if (finePointer && photo) {
    photo.addEventListener('mousemove', (e) => {
      const r = photo.getBoundingClientRect();
      const px = (e.clientX - r.left) / r.width - 0.5;
      const py = (e.clientY - r.top) / r.height - 0.5;
      photo.style.transform = `perspective(900px) rotateY(${px * 8}deg) rotateX(${-py * 8}deg)`;
    });
    photo.addEventListener('mouseleave', () => { photo.style.transform = ''; });
    photo.style.transition = 'transform .4s cubic-bezier(.2,.8,.2,1)';
  }
  /* ---------- contact form ----------
     送信先: Formspree などのフォームサービスのURLを入れると、フォームの内容がメールで届きます。
     例) const FORM_ENDPOINT = 'https://formspree.io/f/xxxxxxx';
  */
  const FORM_ENDPOINT = 'https://formspree.io/f/xqpqyzql';
  const form = document.getElementById('contact-form');
  if (form) {
    const status = form.querySelector('.form__status');
    const submit = form.querySelector('.form__submit');
    const setStatus = (msg, type) => { status.textContent = msg; status.className = 'form__status' + (type ? ' is-' + type : ''); };

    form.addEventListener('input', (e) => { if (e.target.checkValidity()) e.target.removeAttribute('aria-invalid'); });
    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      if (form._gotcha.value) return; // bot
      let firstBad = null;
      form.querySelectorAll('input:not(.form__hp), select, textarea').forEach((el) => {
        const bad = !el.checkValidity();
        if (el.type === 'radio') return;
        el.toggleAttribute('aria-invalid', bad);
        if (bad && el.type !== 'radio') el.setAttribute('aria-invalid', 'true');
        if (bad && !firstBad) firstBad = el;
      });
      if (!form.querySelector('input[name="type"]:checked')) {
        setStatus('ご依頼内容を選んでください。', 'err');
        form.querySelector('input[name="type"]').focus();
        return;
      }
      if (firstBad) {
        setStatus(firstBad.type === 'email' && firstBad.value ? 'メールアドレスの形式を確認してください。' : '必須項目を入力してください。', 'err');
        firstBad.focus();
        return;
      }
      if (!FORM_ENDPOINT) {
        setStatus('（準備中）送信先がまだ設定されていません。お手数ですがInstagramのDMからご連絡ください。', 'err');
        return;
      }
      submit.disabled = true;
      setStatus('送信中…');
      try {
        const res = await fetch(FORM_ENDPOINT, { method: 'POST', body: new FormData(form), headers: { Accept: 'application/json' } });
        if (!res.ok) throw new Error(res.status);
        form.reset();
        setStatus('送信しました！内容を確認してご連絡します。ありがとうございます🔥', 'ok');
      } catch (err) {
        setStatus('送信に失敗しました。時間をおいて再度お試しいただくか、InstagramのDMからご連絡ください。', 'err');
      } finally {
        submit.disabled = false;
      }
    });
  }
})();

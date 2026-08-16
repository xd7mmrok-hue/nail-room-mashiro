document.addEventListener('DOMContentLoaded', () => {
  const noticeBanner = document.querySelector('.notice-banner');
  const siteHeader = document.querySelector('.site-header');

  if (noticeBanner && siteHeader) {
    const syncNoticeHeight = () => {
      document.documentElement.style.setProperty('--notice-height', `${noticeBanner.getBoundingClientRect().height}px`);
      document.documentElement.style.setProperty('--header-height', `${siteHeader.getBoundingClientRect().height}px`);
    };
    syncNoticeHeight();
    window.addEventListener('resize', syncNoticeHeight);
  }

  const revealEls = document.querySelectorAll('.reveal');

  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-visible');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.15, rootMargin: '0px 0px -60px 0px' });

  revealEls.forEach((el) => observer.observe(el));

  const navToggle = document.getElementById('navToggle');
  const nav = document.getElementById('nav');

  if (navToggle && nav) {
    navToggle.addEventListener('click', () => {
      const isOpen = nav.classList.toggle('is-open');
      navToggle.setAttribute('aria-expanded', String(isOpen));
    });

    nav.querySelectorAll('a').forEach((link) => {
      link.addEventListener('click', () => {
        nav.classList.remove('is-open');
        navToggle.setAttribute('aria-expanded', 'false');
      });
    });
  }

  // リンク先が未設定（href="#"）の間は、クリックしてもページ移動・スクロールしないようにする
  // （Instagramギャラリー、ヘッダー／フッター／メニュー欄のSNSアイコンなど、実URL未定のダミーリンク共通）
  document.querySelectorAll('a[href="#"]').forEach((link) => {
    link.addEventListener('click', (e) => {
      e.preventDefault();
    });
  });

  // パソコン版：ナビをタブのように切り替えて、選んだグループのセクションだけを表示する
  const TAB_GROUPS = ['about', 'features', 'menu', 'interior', 'nailist', 'access', 'reservation'];
  const isDesktop = () => window.matchMedia('(min-width: 901px)').matches;
  const body = document.body;

  // body[data-tab] を1回書き換えるだけで表示が切り替わるようにし、
  // セクションを1つずつ表示/非表示にする途中経過が見えてしまう（チラつく）のを防ぐ
  const activateGroup = (group) => {
    body.dataset.tab = group;

    // 表示された直後の状態のままだと display:none → 表示 の間に
    // 「フェード開始前(opacity:0)」の状態が描画されず、スクロール演出が一瞬でスキップされてしまう。
    // 一度 is-visible を外して非表示状態を確定させてから、次のフレームで付け直して演出を発火させる。
    const targets = document.querySelectorAll(`.tab-section[data-group="${group}"] .reveal`);
    targets.forEach((el) => el.classList.remove('is-visible'));
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        targets.forEach((el) => el.classList.add('is-visible'));
      });
    });

    document.querySelectorAll('a[href^="#"]').forEach((link) => {
      const key = link.getAttribute('href').slice(1);
      if (TAB_GROUPS.includes(key)) {
        link.classList.toggle('is-active', key === group);
      }
    });
  };

  document.querySelectorAll('a[href^="#"]').forEach((link) => {
    const key = link.getAttribute('href').slice(1);
    if (!TAB_GROUPS.includes(key)) return;

    link.addEventListener('click', (e) => {
      if (isDesktop()) {
        e.preventDefault();
        activateGroup(key);
        window.scrollTo({ top: 0, behavior: 'auto' });
      }
    });
  });

  // ロゴ（#hero へのリンク）：パソコン版はFV・お知らせを含む「当サロンについて」グループに切り替える。
  // スマホ版は従来通りFVへアンカー移動するだけなので、ここでは手を加えない。
  const logo = document.querySelector('.logo');
  if (logo) {
    logo.addEventListener('click', (e) => {
      if (isDesktop()) {
        e.preventDefault();
        activateGroup('about');
        window.scrollTo({ top: 0, behavior: 'auto' });
      }
    });
  }
});

(() => {
  'use strict';
  const c = window.FIALHO_CONFIG || {};
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)');
  const header = document.querySelector('.header');
  const menu = document.querySelector('.menu-toggle');
  const nav = document.querySelector('#navigation');
  document.documentElement.classList.add('js');
  let refreshLogo = () => {};
  const closeMenu = () => { header.classList.remove('menu-open'); menu.setAttribute('aria-expanded', 'false'); document.documentElement.classList.remove('menu-is-open'); refreshLogo(); };
  menu.addEventListener('click', () => { const open = menu.getAttribute('aria-expanded') !== 'true'; header.classList.toggle('menu-open', open); menu.setAttribute('aria-expanded', String(open)); document.documentElement.classList.toggle('menu-is-open',open); refreshLogo(); });
  nav.addEventListener('click', e => { if (e.target.closest('a')) closeMenu(); });
  document.addEventListener('keydown', e => { if (e.key === 'Escape' && header.classList.contains('menu-open')) { closeMenu(); menu.focus(); } });
  window.addEventListener('resize', () => { if (innerWidth > 1024) closeMenu(); });
  document.querySelectorAll('[data-year]').forEach(el => el.textContent = new Date().getFullYear());
  const email = document.querySelector('#contact-email');
  if (email && c.email) { email.textContent = c.email; email.href = 'mailto:' + c.email; }
  const address = document.querySelector('#contact-address');
  if (address && c.address) { address.textContent = c.address; address.hidden = false; }
  const messages = {geral: 'Olá! Gostaria de conhecer a Fialho Odontologia.', ortodontia: 'Olá! Gostaria de conversar sobre uma avaliação em ortodontia.', mentoria: 'Olá! Gostaria de saber mais sobre mentoria acadêmica e consultoria.'};
  document.querySelectorAll('[data-whatsapp]').forEach(a => {
    let topic = a.dataset.whatsapp;
    if (a.classList.contains('whatsapp')) topic = location.pathname.includes('mentoria') ? 'mentoria' : location.pathname.includes('ortodontia') ? 'ortodontia' : topic;
    const number = String(c.whatsapp || '').replace(/\D/g, '');
    if (/^\d{10,15}$/.test(number)) { a.href = 'https://wa.me/' + number + '?text=' + encodeURIComponent(messages[topic]); a.target = '_blank'; a.rel = 'noopener noreferrer'; a.setAttribute('aria-label', 'Conversar pelo WhatsApp'); }
    else { if (a.classList.contains('whatsapp')) { a.hidden = true; } else if (c.email) a.href = 'mailto:' + c.email + '?subject=' + encodeURIComponent(topic === 'mentoria' ? 'Mentoria e consultoria' : 'Atendimento em ortodontia'); }
  });
  const reveals = document.querySelectorAll('.reveal');
  if ('IntersectionObserver' in window) { const observer = new IntersectionObserver(entries => entries.forEach(e => { if (e.isIntersecting) { e.target.classList.add('in'); observer.unobserve(e.target); } }), {threshold: .08}); reveals.forEach(el => observer.observe(el)); }
  else reveals.forEach(el => el.classList.add('in'));
  // Um único logo se move; o logo no destino permanece invisível na home.
  const hero = document.querySelector('.hero');
  const logo = document.querySelector('.morph-logo');
  if (hero && logo) {
    const target = document.querySelector('.logo-destination');
    const copy = document.querySelector('.hero-copy');
    const cue = document.querySelector('.scroll-cue');
    const origin = document.querySelector('.hero-logo-slot');
    let geometry, pending = false;
    const update = () => {
      if (!geometry) return;
      const progress = Math.min(1, Math.max(0, scrollY / geometry.length));
      const ease = progress * progress * (3 - 2 * progress);
      const menuOpen = header.classList.contains('menu-open');
      const t = menuOpen ? 1 : reduced.matches ? (progress > .15 ? 1 : 0) : ease;
      const x = geometry.startX + (geometry.endX - geometry.startX) * t;
      const y = geometry.startY + (geometry.endY - geometry.startY) * t;
      const width = geometry.startW + (geometry.endW - geometry.startW) * t;
      logo.style.width = geometry.startW + 'px';
      logo.style.transform = `translate3d(${x}px,${y}px,0) scale(${width / geometry.startW})`;
      logo.style.opacity = '1';
      copy.style.opacity = String(menuOpen ? 0 : Math.max(0, 1 - progress * 2.5));
      cue.style.opacity = String(menuOpen ? 0 : Math.max(0, 1 - progress * 4));
      copy.style.visibility = progress > .5 || menuOpen ? 'hidden' : 'visible';
      cue.style.visibility = progress > .25 || menuOpen ? 'hidden' : 'visible';
      header.classList.toggle('solid', progress > .25);
      pending = false;
    };
    const measure = () => {
      const start = origin.getBoundingClientRect(), end = target.getBoundingClientRect();
      geometry = {startX:start.left, startY:start.top+scrollY, startW:start.width,
        endX:end.left,endY:end.top,endW:end.width,length:Math.max(220,hero.offsetHeight*.64)};
      update();
    };
    refreshLogo = update;
    window.addEventListener('scroll', () => { if (!pending) { requestAnimationFrame(update); pending = true; } }, {passive:true});
    window.addEventListener('resize', measure);
    if (window.visualViewport) window.visualViewport.addEventListener('resize',measure);
    reduced.addEventListener('change',measure);
    document.fonts.ready.then(measure); measure();
    document.documentElement.style.setProperty('--wash', String(Math.min(.7,Math.max(.15,Number(c.videoOverlay) || .38))));
    const players = [...document.querySelectorAll('.hero-video')];
    const files = (c.videos || []).filter(Boolean); const toggle = document.querySelector('.video-toggle');

    let current = 0, slot = 0, changing = false, userPaused = false, failed = new Set(), outside = false;
    const load = (player, i) => { player.src = files[i]; player.dataset.index = String(i); player.load(); player.playbackRate = c.videoSpeed || .8; };
    const play = player => player.play().catch(() => { toggle.textContent = '▶'; toggle.setAttribute('aria-label', 'Reproduzir vídeos'); });

    const prepareNext = () => { if (files.length < 2) return; const next = (current+1)%files.length; if (players[1-slot].dataset.index !== String(next)) load(players[1-slot], next); };
    const advance = () => {
      if (changing || userPaused || outside || reduced.matches || files.length < 2 || failed.size >= files.length) return;
      changing = true;
      const previous = players[slot], nextSlot = 1-slot, next = players[nextSlot];
      const nextIndex = (current+1)%files.length;
      if (next.dataset.index !== String(nextIndex)) load(next,nextIndex);
      const begin = () => {
        next.currentTime = 0; next.playbackRate = c.videoSpeed || .8;
        next.play().then(() => {
          next.classList.add('visible'); previous.classList.remove('visible');
          slot = nextSlot; current = nextIndex;
          setTimeout(() => { previous.pause(); changing = false; prepareNext(); }, 1250);
        }).catch(() => { changing = false; toggle.textContent = '▶'; toggle.setAttribute('aria-label','Reproduzir vídeos'); });
      };
      if (next.readyState >= 2) begin(); else next.addEventListener('canplay', begin, {once:true});
    };
    players.forEach(player => {
      player.addEventListener('loadeddata', () => { player.playbackRate = c.videoSpeed || .8; });
      player.addEventListener('timeupdate', () => {
        if (player !== players[slot]) return;
        if (player.currentTime > .5) prepareNext();
        if (Number.isFinite(player.duration) && player.duration - player.currentTime < 1.1) advance();
      });
      player.addEventListener('ended', () => { if (files.length === 1) {player.currentTime=0;if(!userPaused&&!outside) play(player);} else advance(); });
      player.addEventListener('error', () => {
        failed.add(player.dataset.index); changing = false;
        if (failed.size >= files.length) { players.forEach(p => p.classList.remove('visible')); toggle.hidden = true; return; }
        if (player === players[slot]) { current = (current+1)%files.length; load(player,current); if(!userPaused&&!outside&&!reduced.matches) play(player); }
      });
    });
    if (files.length && !reduced.matches) { load(players[0],0); play(players[0]); }
    else { players.forEach(p=>p.hidden=true); toggle.hidden=true; }
    toggle.addEventListener('click', () => {
      const player = players[slot]; userPaused = !player.paused;
      if (userPaused) player.pause(); else { userPaused=false; play(player); }
      toggle.textContent = userPaused ? '▶' : 'Ⅱ'; toggle.setAttribute('aria-label',userPaused?'Reproduzir vídeos':'Pausar vídeos');
    });
    if ('IntersectionObserver' in window) new IntersectionObserver(entries => { outside = !entries[0].isIntersecting; if(outside) players.forEach(p=>p.pause()); else if(!userPaused&&!reduced.matches&&files.length) play(players[slot]); },{threshold:0}).observe(hero);
    document.addEventListener('visibilitychange', () => { if(document.hidden) players.forEach(p=>p.pause()); else if(!outside&&!userPaused&&!reduced.matches&&files.length) play(players[slot]); });
    reduced.addEventListener('change', () => { players.forEach(p=>p.pause()); if(reduced.matches){players.forEach(p=>p.hidden=true);toggle.hidden=true;}else{players.forEach(p=>p.hidden=false);toggle.hidden=false;if(!players[slot].src)load(players[slot],current);if(!outside&&!userPaused)play(players[slot]);} });
  } else window.addEventListener('scroll', () => header.classList.toggle('solid', scrollY > 10), {passive:true});
  const safeUrl = value => { try { const u=new URL(value,location.href); return ['https:','http:','file:'].includes(u.protocol) ? u.href : ''; } catch { return ''; } };
  const space = document.querySelector('#space-gallery');
  if (space && c.spacePhotos?.length) {
    space.replaceChildren(); space.classList.add('has-images');
    c.spacePhotos.forEach(photo => { const src=safeUrl(photo.image);if(!src)return;const fig=document.createElement('figure'),im=document.createElement('img');im.src=src;im.alt=photo.alt||'Espaço atual de atendimento';im.loading='lazy';fig.append(im);space.append(fig); });
  }
  const certs = document.querySelector('#certificates');
  if (certs && c.certificates?.length) {
    c.certificates.forEach(cert=>{const src=safeUrl(cert.image);if(!src)return;const a=document.createElement('a'),im=document.createElement('img'),h=document.createElement('h3'),p=document.createElement('p');a.href=src;a.target='_blank';a.rel='noopener noreferrer';im.src=src;im.alt=cert.title||'Certificado';im.loading='lazy';h.textContent=cert.title||'Certificado';p.textContent=cert.description||'';a.append(im,h,p);certs.append(a);});
    if(certs.children.length){certs.hidden=false;document.querySelector('#certificate-note').hidden=true;}
  }
  const grid = document.querySelector('#instagram-posts');
  const renderPosts = posts => {
    if(!grid || !Array.isArray(posts))return;
    const selected=posts.filter(p=>safeUrl(p.image)&& /^https:\/\/(www\.)?instagram\.com\//i.test(p.url||'')).sort((a,b)=>(Date.parse(b.date)||0)-(Date.parse(a.date)||0)).slice(0,3);
    if(!selected.length)return;
    grid.replaceChildren();
    selected.forEach(post=>{const a=document.createElement('a'),im=document.createElement('img');a.className='instagram-post';a.href=post.url;a.target='_blank';a.rel='noopener noreferrer';im.src=safeUrl(post.image);im.alt=post.alt||'Publicação da Fialho no Instagram';im.loading='lazy';a.append(im);if(post.type==='video'||post.type==='carousel'){const badge=document.createElement('span');badge.textContent=post.type==='video'?'▶':'▣';a.append(badge);}grid.append(a);});
    document.querySelector('#instagram-note').hidden=true;
  };
  renderPosts(c.instagram?.posts);
  // Ponto de extensão. Sem endpoint, NÃO há chamadas ao Instagram ou a terceiros.
  if(grid && c.instagram?.endpoint) {
    const endpoint=new URL(c.instagram.endpoint,location.href);
    if(endpoint.origin===location.origin && ['https:','http:'].includes(endpoint.protocol)) fetch(endpoint.href,{signal:AbortSignal.timeout(8000)}).then(r=>{if(!r.ok)throw new Error('Feed indisponível');return r.json();}).then(data=>renderPosts(data.posts)).catch(()=>{});
  }
})();

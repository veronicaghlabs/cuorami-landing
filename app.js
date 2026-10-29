(() => {
  'use strict';
  const menuButton = document.querySelector('.menu-toggle');
  const mobileMenu = document.querySelector('#mobile-menu');
  const closeMenu = () => { mobileMenu.hidden = true; menuButton.setAttribute('aria-expanded', 'false'); menuButton.setAttribute('aria-label', 'Abrir menú'); };
  menuButton.addEventListener('click', () => {
    const opening = mobileMenu.hidden;
    mobileMenu.hidden = !opening;
    menuButton.setAttribute('aria-expanded', String(opening));
    menuButton.setAttribute('aria-label', opening ? 'Cerrar menú' : 'Abrir menú');
  });
  mobileMenu.querySelectorAll('a').forEach(link => link.addEventListener('click', closeMenu));
  document.addEventListener('keydown', event => { if (event.key === 'Escape' && !mobileMenu.hidden) { closeMenu(); menuButton.focus(); } });
  window.matchMedia('(min-width:901px)').addEventListener('change', event => { if (event.matches) closeMenu(); });

  const heroImage = document.querySelector('#hero-chat-animation');
  const motionButton = document.querySelector('#hero-motion-toggle');
  if (heroImage && motionButton) {
    const stillImage = heroImage.getAttribute('src');
    const animatedImage = JSON.parse(document.querySelector('#hero-animation-data').textContent);
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
    let isPaused = reducedMotion.matches;
    const renderMotion = () => {
      heroImage.src = isPaused ? stillImage : animatedImage;
      motionButton.setAttribute('aria-pressed', String(isPaused));
      motionButton.setAttribute('aria-label', isPaused ? 'Reproducir animación de la APP' : 'Pausar animación de la APP');
      motionButton.querySelector('.motion-text').textContent = isPaused ? 'Reproducir' : 'Pausar';
      motionButton.querySelector('.motion-glyph').textContent = isPaused ? '▷' : 'Ⅱ';
      motionButton.dataset.state = isPaused ? 'paused' : 'playing';
    };
    motionButton.addEventListener('click', () => { isPaused = !isPaused; renderMotion(); });
    reducedMotion.addEventListener('change', event => { isPaused = event.matches; renderMotion(); });
    renderMotion();
  }

  const steps = [...document.querySelectorAll('.step')];
  const scenes = [...document.querySelectorAll('.step-scene')];
  let activeStep = 0;
  const stepNames = ['Descarga la APP', 'Cuéntale cómo estás', 'Selecciona tu Cuorami', 'Habla de lo que te preocupa', 'Da tu primer paso', 'Algo empieza a moverse'];
  const setStep = index => {
    activeStep = index;
    scenes.forEach((scene, sceneIndex) => { scene.hidden = sceneIndex !== index; });
    document.querySelector('#step-indicator').textContent = `${String(index + 1).padStart(2, '0')} / 06`;
    document.querySelector('#step-visual-caption').textContent = stepNames[index];
    document.querySelector('#step-status').textContent = `Paso ${index + 1}: ${stepNames[index]}`;
  };
  steps.forEach((step, index) => {
    step.addEventListener('toggle', () => {
      if (step.open) {
        steps.forEach(other => { if (other !== step && other.open) other.open = false; });
        if (activeStep !== index) setStep(index);
      }
    });
  });

  const track = document.querySelector('.review-track');
  const windowEl = document.querySelector('.reviews-window');
  const cards = [...document.querySelectorAll('.review-card')];
  const dots = [...document.querySelectorAll('.carousel-dot')];
  let reviewIndex = 0;
  const visibleCount = () => innerWidth <= 700 ? 1 : innerWidth <= 900 ? 2 : 3;
  const maxIndex = () => Math.max(0, cards.length - visibleCount());
  const renderReviews = () => {
    reviewIndex = Math.min(reviewIndex, maxIndex());
    const gap = parseFloat(getComputedStyle(track).gap) || 0;
    const cardWidth = cards[0].getBoundingClientRect().width;
    track.style.transform = `translateX(-${reviewIndex * (cardWidth + gap)}px)`;
    cards.forEach((card, i) => { card.setAttribute('aria-hidden', String(i < reviewIndex || i >= reviewIndex + visibleCount())); });
    dots.forEach((dot, i) => {
      dot.hidden = i > maxIndex();
      dot.setAttribute('aria-current', String(i === reviewIndex));
    });
    document.querySelector('#review-status').textContent = `Mostrando historias ${reviewIndex + 1} a ${Math.min(cards.length, reviewIndex + visibleCount())} de ${cards.length}`;
  };
  const moveReview = direction => {
    const count = maxIndex() + 1;
    reviewIndex = (reviewIndex + direction + count) % count;
    renderReviews();
  };
  document.querySelector('[data-review-prev]').addEventListener('click', () => moveReview(-1));
  document.querySelector('[data-review-next]').addEventListener('click', () => moveReview(1));
  dots.forEach((dot, index) => dot.addEventListener('click', () => { reviewIndex = index; renderReviews(); }));
  windowEl.addEventListener('keydown', event => {
    if (event.key === 'ArrowRight') { event.preventDefault(); moveReview(1); }
    if (event.key === 'ArrowLeft') { event.preventDefault(); moveReview(-1); }
    if (event.key === 'Home') { event.preventDefault(); reviewIndex = 0; renderReviews(); }
    if (event.key === 'End') { event.preventDefault(); reviewIndex = maxIndex(); renderReviews(); }
  });
  let startX = null, startY = null;
  windowEl.addEventListener('touchstart', event => { startX = event.touches[0].clientX; startY = event.touches[0].clientY; }, {passive:true});
  windowEl.addEventListener('touchend', event => {
    if (startX === null) return;
    const deltaX = event.changedTouches[0].clientX - startX;
    const deltaY = event.changedTouches[0].clientY - startY;
    if (Math.abs(deltaX) > 45 && Math.abs(deltaX) > Math.abs(deltaY)) moveReview(deltaX < 0 ? 1 : -1);
    startX = startY = null;
  }, {passive:true});
  new ResizeObserver(renderReviews).observe(windowEl);
  document.fonts.ready.then(renderReviews);
  renderReviews();

  document.querySelectorAll('[data-interest]').forEach(link => {
    link.addEventListener('click', () => {
      document.querySelector('#interest').value = link.dataset.interest;
    });
  });
  const form = document.querySelector('#contact-form');
  form.addEventListener('submit', event => {
    event.preventDefault();
    if (!form.reportValidity()) return;
    const status = document.querySelector('#form-status');
    status.textContent = 'El formulario se ha completado correctamente. Esta versión es una demostración: tus datos no se han enviado ni guardado.';
    status.hidden = false;
    status.focus();
  });
})();

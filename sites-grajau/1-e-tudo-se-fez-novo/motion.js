/* Barra de progresso, parallax de fotos e fundos, e cartões que inclinam com o mouse. */
(function(){
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  var bar = document.createElement('div'); bar.className = 'progress'; bar.setAttribute('aria-hidden','true');
  document.body.appendChild(bar);

  var px = [].slice.call(document.querySelectorAll('[data-px]'));
  var bgs = [].slice.call(document.querySelectorAll('[data-px-bg]'));
  var ticking = false;
  function frame(){
    ticking = false;
    var vh = innerHeight, max = document.documentElement.scrollHeight - vh;
    bar.style.transform = 'scaleX(' + (max > 0 ? scrollY / max : 0) + ')';
    px.forEach(function(el){
      var r = el.parentElement.getBoundingClientRect();
      if (r.bottom < -100 || r.top > vh + 100) return;
      var k = parseFloat(el.dataset.px) || 0.12;
      var off = (r.top + r.height/2 - vh/2) * -k;
      el.style.translate = '0 ' + off.toFixed(1) + 'px';
    });
    bgs.forEach(function(el){
      var r = el.getBoundingClientRect(); if (r.bottom < 0) return;
      el.style.backgroundPositionY = 'calc(50% + ' + (-r.top * (parseFloat(el.dataset.pxBg) || 0.3)).toFixed(1) + 'px)';
    });
  }
  function onScroll(){ if (!ticking){ ticking = true; requestAnimationFrame(frame); } }
  addEventListener('scroll', onScroll, {passive:true}); addEventListener('resize', onScroll); frame();

  if (!matchMedia('(hover: hover) and (pointer: fine)').matches) return;
  document.querySelectorAll('[data-tilt]').forEach(function(el){
    el.addEventListener('mousemove', function(e){
      var r = el.getBoundingClientRect(), x = (e.clientX - r.left) / r.width - .5, y = (e.clientY - r.top) / r.height - .5;
      el.style.transition = 'transform .08s';
      el.style.transform = 'perspective(800px) rotateX(' + (-y*7).toFixed(2) + 'deg) rotateY(' + (x*9).toFixed(2) + 'deg) translateY(-4px)';
    });
    el.addEventListener('mouseleave', function(){ el.style.transition = 'transform .5s cubic-bezier(.2,.7,.2,1)'; el.style.transform = ''; });
  });
})();

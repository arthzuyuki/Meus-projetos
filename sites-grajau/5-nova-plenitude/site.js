/* Menu do celular, animações de entrada e título com palavras animadas. */
(function(){
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (!reduce) document.documentElement.classList.add('anim');

  // Menu do celular: copia os links do <ul> indicado em data-menu
  document.querySelectorAll('.menu-btn[data-menu]').forEach(function(btn){
    var src = document.querySelector(btn.dataset.menu); if (!src) return;
    var d = document.createElement('div');
    d.className = 'drawer'; d.id = 'menu-celular'; d.setAttribute('role','dialog'); d.setAttribute('aria-modal','true'); d.setAttribute('aria-label','Menu');
    var ul = document.createElement('ul');
    src.querySelectorAll('a').forEach(function(a){
      if (a.querySelector('img')) return;
      var li = document.createElement('li'), c = document.createElement('a');
      c.href = a.getAttribute('href'); c.textContent = a.textContent.trim(); li.appendChild(c); ul.appendChild(li);
    });
    d.innerHTML = '<button class="close" type="button" aria-label="Fechar menu">✕</button>';
    d.appendChild(ul); document.body.appendChild(d);
    btn.setAttribute('aria-controls','menu-celular'); btn.setAttribute('aria-expanded','false');
    function open(){ d.classList.add('open'); document.body.classList.add('menu-open'); btn.setAttribute('aria-expanded','true'); d.querySelector('.close').focus(); }
    function close(back){ d.classList.remove('open'); document.body.classList.remove('menu-open'); btn.setAttribute('aria-expanded','false'); if (back) btn.focus(); }
    btn.addEventListener('click', open);
    d.querySelector('.close').addEventListener('click', function(){ close(true); });
    ul.addEventListener('click', function(e){ if (e.target.tagName === 'A') close(false); });
    d.addEventListener('keydown', function(e){
      if (e.key === 'Escape') close(true);
      if (e.key === 'Tab'){ // mantém o foco dentro do menu
        var f = d.querySelectorAll('button, a'), first = f[0], last = f[f.length-1];
        if (e.shiftKey && document.activeElement === first){ e.preventDefault(); last.focus(); }
        else if (!e.shiftKey && document.activeElement === last){ e.preventDefault(); first.focus(); }
      }
    });
  });

  // Título dividido em palavras (data-split). Leitores de tela leem o texto original.
  document.querySelectorAll('[data-split]').forEach(function(el){
    el.setAttribute('aria-label', el.textContent.replace(/\s+/g,' ').trim());
    var i = 0, base = parseFloat(el.dataset.split) || 0;
    (function walk(node){
      Array.prototype.slice.call(node.childNodes).forEach(function(n){
        if (n.nodeType === 3){
          var frag = document.createDocumentFragment();
          n.textContent.split(/(\s+)/).forEach(function(w){
            if (!w) return;
            if (/^\s+$/.test(w)){ frag.appendChild(document.createTextNode(' ')); return; }
            var o = document.createElement('span'), s = document.createElement('span');
            o.className = 'split-w'; o.setAttribute('aria-hidden','true');
            s.textContent = w; s.style.setProperty('--d', (base + i++ * 0.07) + 's');
            o.appendChild(s); frag.appendChild(o);
          });
          n.replaceWith(frag);
        } else if (n.nodeType === 1 && n.tagName !== 'BR'){ n.setAttribute('aria-hidden','true'); walk(n); }
      });
    })(el);
    requestAnimationFrame(function(){ requestAnimationFrame(function(){ el.classList.add('split-on'); }); });
  });

  // Entrada ao rolar; data-stagger nos pais escalona os filhos
  document.querySelectorAll('[data-stagger]').forEach(function(p){
    var step = parseFloat(p.dataset.stagger) || 0.08;
    Array.prototype.forEach.call(p.children, function(c, i){
      if (!c.hasAttribute('data-reveal')) c.setAttribute('data-reveal','');
      c.style.setProperty('--d', (i * step) + 's');
    });
  });
  var items = document.querySelectorAll('[data-reveal]');
  if (!('IntersectionObserver' in window) || reduce){ items.forEach(function(e){ e.classList.add('in'); }); return; }
  var io = new IntersectionObserver(function(es){
    es.forEach(function(e){ if (e.isIntersecting){ e.target.classList.add('in'); io.unobserve(e.target); } });
  }, {rootMargin:'0px 0px -8% 0px', threshold:0.12});
  items.forEach(function(e){ io.observe(e); });
})();

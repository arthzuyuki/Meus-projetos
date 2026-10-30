(function () {
  document.documentElement.classList.add('js');

  var toggle = document.querySelector('.nav-toggle');
  var nav = document.getElementById('site-nav');
  if (toggle && nav) {
    toggle.addEventListener('click', function () {
      var open = nav.classList.toggle('open');
      toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
    });
  }

  // Fotos opcionais: se o arquivo não existir, o espaço reservado continua visível.
  document.querySelectorAll('img[data-optional]').forEach(function (img) {
    function remove() { img.remove(); }
    if (img.complete && img.naturalWidth === 0) { remove(); }
    else { img.addEventListener('error', remove); }
  });

  // Abas da página inicial
  var tabs = document.querySelectorAll('[role="tab"]');
  if (tabs.length) {
    var escolher = function (tab, foco) {
      tabs.forEach(function (t) {
        var ativo = t === tab;
        t.setAttribute('aria-selected', ativo ? 'true' : 'false');
        t.tabIndex = ativo ? 0 : -1;
        document.getElementById(t.getAttribute('aria-controls')).hidden = !ativo;
      });
      if (foco) { tab.focus(); }
    };
    tabs.forEach(function (t, i) {
      t.addEventListener('click', function () { escolher(t); });
      t.addEventListener('keydown', function (ev) {
        var n = tabs.length, alvo = null;
        if (ev.key === 'ArrowRight') { alvo = tabs[(i + 1) % n]; }
        else if (ev.key === 'ArrowLeft') { alvo = tabs[(i - 1 + n) % n]; }
        else if (ev.key === 'Home') { alvo = tabs[0]; }
        else if (ev.key === 'End') { alvo = tabs[n - 1]; }
        if (alvo) { ev.preventDefault(); escolher(alvo, true); }
      });
    });
  }

  // Simulador de irrigação automática
  var sim = document.getElementById('sim');
  if (sim) {
    var umid = document.getElementById('umid');
    var limite = document.getElementById('limite');
    var temp = document.getElementById('temp');
    var umidOut = document.getElementById('umidOut');
    var limOut = document.getElementById('limOut');
    var tempOut = document.getElementById('tempOut');
    var fill = document.getElementById('fill');
    var mark = document.getElementById('mark');
    var pump = document.getElementById('pump');
    var msg = document.getElementById('simMsg');
    var avancar = document.getElementById('avancar');
    var ligada = false;

    var render = function () {
      var h = +umid.value, lim = +limite.value, graus = +temp.value;
      var desliga = Math.min(100, lim + 10);
      if (h < lim) { ligada = true; }
      else if (h >= desliga) { ligada = false; }
      umidOut.textContent = h; limOut.textContent = lim; tempOut.textContent = graus;
      fill.style.width = h + '%';
      mark.style.left = lim + '%';
      pump.textContent = t(ligada ? 'Bomba ligada' : 'Bomba desligada');
      pump.className = 'pump ' + (ligada ? 'on' : 'off');
      var m = ligada
        ? t('A umidade está abaixo de {lim}%. A bomba liga e só desliga quando passar de {des}%.', { lim: lim, des: desliga })
        : t('O solo tem água suficiente. A bomba fica desligada até a umidade cair abaixo de {lim}%.', { lim: lim });
      if (graus >= 35) { m += ' ' + t('Temperatura alta: o ideal é regar de manhã cedo ou no fim da tarde.'); }
      else if (graus <= 10) { m += ' ' + t('Temperatura baixa: a planta usa menos água.'); }
      msg.textContent = m;
    };
    [umid, limite, temp].forEach(function (el) { el.addEventListener('input', render); });
    avancar.addEventListener('click', function () {
      var h = +umid.value + (ligada ? 8 : -6);
      umid.value = Math.max(0, Math.min(100, h));
      render();
    });
    document.addEventListener('langchange', render);
    render();
  }

  // Diário da horta (salvo só neste navegador)
  var form = document.getElementById('diario-form');
  if (form) {
    var lista = document.getElementById('diario-lista');
    var KEY = 'portal-da-horta-diario';
    var itens = [];
    try { itens = JSON.parse(localStorage.getItem(KEY) || '[]'); } catch (e) { itens = []; }
    if (!Array.isArray(itens)) { itens = []; }
    var dataEl = document.getElementById('d-data');
    dataEl.value = new Date().toLocaleDateString('sv-SE');

    var salvar = function () { try { localStorage.setItem(KEY, JSON.stringify(itens)); } catch (e) {} };
    var fmt = function (iso) { var p = String(iso).split('-'); return p.length === 3 ? p[2] + '/' + p[1] + '/' + p[0] : iso; };

    var desenhar = function () {
      lista.textContent = '';
      if (!itens.length) {
        var vazio = document.createElement('p');
        vazio.className = 'muted';
        vazio.textContent = t('Nenhum registro ainda. Escreva o primeiro acima.');
        lista.appendChild(vazio);
        return;
      }
      itens.map(function (it, i) { return { it: it, i: i }; })
        .sort(function (a, b) { return b.it.data.localeCompare(a.it.data) || b.i - a.i; })
        .forEach(function (o) {
          var art = document.createElement('article');
          art.className = 'entry';
          var h = document.createElement('h3'); h.textContent = fmt(o.it.data);
          var p = document.createElement('p'); p.textContent = o.it.texto;
          art.appendChild(h); art.appendChild(p);
          if (o.it.quem) {
            var q = document.createElement('p'); q.className = 'who'; q.textContent = t('Registrado por {quem}', { quem: o.it.quem });
            art.appendChild(q);
          }
          var b = document.createElement('button');
          b.type = 'button'; b.textContent = t('Apagar registro');
          b.addEventListener('click', function () { itens.splice(o.i, 1); salvar(); desenhar(); });
          art.appendChild(b);
          lista.appendChild(art);
        });
    };

    form.addEventListener('submit', function (ev) {
      ev.preventDefault();
      var texto = document.getElementById('d-texto').value.trim();
      if (!texto) { document.getElementById('d-texto').focus(); return; }
      itens.push({ data: dataEl.value, texto: texto, quem: document.getElementById('d-quem').value.trim() });
      salvar();
      document.getElementById('d-texto').value = '';
      desenhar();
    });
    document.addEventListener('langchange', desenhar);
    desenhar();
  }
})();

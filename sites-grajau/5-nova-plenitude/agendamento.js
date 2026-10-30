/* Monta a mensagem do formulário e abre o WhatsApp da empresa com o texto pronto.
   No <form>: data-whats="55DDDNUMERO", data-titulo="Cabeçalho da mensagem".
   data-demo="true" só mostra a prévia da mensagem, sem abrir o WhatsApp.
   Campos: name + data-label. Campo condicional: data-show-if="campo=valor". */
(function(){
  function val(form, name){
    var els = form.querySelectorAll('[name="'+name+'"]');
    var out = [];
    els.forEach(function(el){
      if ((el.type === 'radio' || el.type === 'checkbox') && !el.checked) return;
      if (el.closest('[hidden]')) return;
      if (el.value.trim()) out.push(el.value.trim());
    });
    return out.join(', ');
  }
  function fmtDate(v){ var p = v.split('-'); return p.length === 3 ? p[2]+'/'+p[1]+'/'+p[0] : v; }

  function esc(s){ return s.replace(/[&<>"]/g, function(c){ return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]; }); }
  function waFormat(s){ return esc(s).replace(/\*([^*\n]+)\*/g, '<b>$1</b>').replace(/\n/g, '<br>'); }
  function initials(n){ return n.split(/\s+/).filter(Boolean).slice(0,2).map(function(w){ return w[0]; }).join('').toUpperCase(); }

  /* Prévia em formato de conversa do WhatsApp (modo demonstração). */
  function showChat(form, text){
    var old = document.querySelector('.ag-chat-wrap'); if (old) old.remove();
    var nome = form.dataset.empresa || 'Empresa', logo = form.dataset.logo;
    var now = new Date(), hh = ('0'+now.getHours()).slice(-2)+':'+('0'+now.getMinutes()).slice(-2);
    var avatar = logo ? '<img src="'+esc(logo)+'" alt="">' : '<span>'+esc(initials(nome))+'</span>';
    var w = document.createElement('div');
    w.className = 'ag-chat-wrap'; w.setAttribute('role','dialog'); w.setAttribute('aria-modal','true'); w.setAttribute('aria-label','Prévia da mensagem no WhatsApp');
    w.innerHTML =
      '<div class="ag-phone">'+
        '<div class="ag-wa-head"><button type="button" class="ag-x" aria-label="Fechar prévia">&#8592;</button>'+
          '<div class="ag-av">'+avatar+'</div><div class="ag-who"><b>'+esc(nome)+'</b><small>online</small></div>'+
          '<span class="ag-icons" aria-hidden="true">&#9742;&nbsp;&nbsp;&#8942;</span></div>'+
        '<div class="ag-wa-body">'+
          '<div class="ag-day">HOJE</div>'+
          '<div class="ag-sys">Prévia de demonstração: no site publicado, a mensagem abre assim no WhatsApp da empresa e o cliente só toca em enviar.</div>'+
          '<div class="ag-bubble">'+waFormat(text)+'<span class="ag-meta">'+hh+' <i>&#10003;&#10003;</i></span></div>'+
        '</div>'+
        '<div class="ag-wa-foot"><div class="ag-fake-input">Mensagem</div><button type="button" class="ag-copy">Copiar</button></div>'+
      '</div>';
    document.body.appendChild(w);
    function close(){ w.remove(); document.removeEventListener('keydown', onKey); form.querySelector('.ag-btn').focus(); }
    function onKey(e){ if (e.key === 'Escape') close(); }
    w.addEventListener('click', function(e){ if (e.target === w) close(); });
    w.querySelector('.ag-x').onclick = close;
    w.querySelector('.ag-copy').onclick = function(){ navigator.clipboard && navigator.clipboard.writeText(text); this.textContent = 'Copiada'; };
    document.addEventListener('keydown', onKey);
    w.querySelector('.ag-x').focus();
  }

  document.querySelectorAll('form[data-whats]').forEach(function(form){
    var today = new Date(); today.setMinutes(today.getMinutes() - today.getTimezoneOffset());
    form.querySelectorAll('input[type=date]').forEach(function(d){ d.min = today.toISOString().slice(0,10); });

    function toggle(){
      form.querySelectorAll('[data-show-if]').forEach(function(box){
        var c = box.dataset.showIf.split('='), show = val(form, c[0]).split(', ').indexOf(c[1]) > -1;
        box.hidden = !show;
        box.querySelectorAll('[data-req]').forEach(function(f){ f.required = show; });
      });
    }
    form.addEventListener('change', toggle); toggle();

    form.addEventListener('submit', function(e){
      e.preventDefault();
      if (!form.checkValidity()){ form.reportValidity(); return; }
      var lines = ['*' + (form.dataset.titulo || 'Novo pedido') + '*', ''], seen = {};
      form.querySelectorAll('[name][data-label]').forEach(function(el){
        if (seen[el.name]) return; seen[el.name] = 1;
        var v = val(form, el.name); if (!v) return;
        if (el.type === 'date') v = fmtDate(v);
        lines.push('*' + el.dataset.label + ':* ' + v);
      });
      lines.push('', 'Enviado pelo site');
      var text = lines.join('\n');
      var num = (form.dataset.whats || '').replace(/\D/g, '');

      if (form.dataset.demo === 'true' || !num){
        showChat(form, text);
        return;
      }
      window.open('https://wa.me/' + num + '?text=' + encodeURIComponent(text), '_blank', 'noopener');
    });
  });
})();

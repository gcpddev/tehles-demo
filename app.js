// Техлес — демо. Небольшая интерактивность без сервера: вкладки, фильтры, вид каталога, заявка.
(function () {
  'use strict';
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };

  // Счётчик заявки (живёт в рамках вкладки браузера)
  var KEY = 'tehles-demo-order';
  function getCount() { try { return parseInt(sessionStorage.getItem(KEY) || '2', 10); } catch (e) { return 2; } }
  function setCount(n) { try { sessionStorage.setItem(KEY, String(n)); } catch (e) {} paintCount(); }
  function paintCount() { $$('[data-order-count]').forEach(function (el) { el.textContent = getCount(); }); }
  paintCount();

  // Кнопки «В заявку»
  $$('.add').forEach(function (b) {
    b.addEventListener('click', function () {
      if (b.classList.contains('added')) return;
      b.classList.add('added');
      b.textContent = 'В заявке ✓';
      setCount(getCount() + 1);
    });
  });

  // Вкладки магазинов на главной
  $$('[data-tabs]').forEach(function (bar) {
    var target = $(bar.getAttribute('data-tabs'));
    $$('.tab', bar).forEach(function (t) {
      t.addEventListener('click', function () {
        var s = t.getAttribute('data-store');
        $$('.tab', bar).forEach(function (x) { x.setAttribute('aria-selected', x === t ? 'true' : 'false'); });
        $$('[data-store]', target).forEach(function (c) { c.hidden = !(s === 'all' || c.getAttribute('data-store') === s); });
      });
    });
  });

  // Каталог: вид, магазин, наличие, поиск
  var cat = $('#catalog');
  if (cat) {
    var state = { store: 'all', stock: false, q: '' };
    var params = new URLSearchParams(location.search);
    if (params.get('store')) state.store = params.get('store');
    if (params.get('q')) { state.q = params.get('q').toLowerCase(); var qi = $('#q'); if (qi) qi.value = params.get('q'); }

    function match(el) {
      var okStore = state.store === 'all' || el.getAttribute('data-store') === state.store;
      var okStock = !state.stock || el.getAttribute('data-ok') === '1';
      var okQ = !state.q || (el.getAttribute('data-text') || '').indexOf(state.q) !== -1;
      return okStore && okStock && okQ;
    }
    function apply() {
      var n = 0;
      $$('.card[data-store]', cat).forEach(function (c) { var m = match(c); c.hidden = !m; if (m) n++; });
      $$('.pl-row[data-store]', cat).forEach(function (r) { r.hidden = !match(r); });
      $$('.pl-group', cat).forEach(function (g) {
        var s = g.getAttribute('data-group');
        g.hidden = !$$('.pl-row[data-store="' + s + '"]', cat).some(function (r) { return !r.hidden; });
      });
      $('#count').textContent = n;
      $('#empty').hidden = n !== 0;
      $$('.fbtn').forEach(function (b) {
        b.setAttribute('aria-pressed', b.getAttribute('data-store') === state.store ? 'true' : 'false');
        var s = b.getAttribute('data-store');
        var cnt = $$('.card[data-store]', cat).filter(function (c) {
          var keep = state.store; state.store = s; var m = match(c); state.store = keep; return m;
        }).length;
        $('.n', b).textContent = cnt;
      });
    }
    $$('.fbtn').forEach(function (b) { b.addEventListener('click', function () { state.store = b.getAttribute('data-store'); apply(); }); });
    var st = $('#only-stock'); if (st) st.addEventListener('change', function () { state.stock = st.checked; apply(); });
    var q = $('#q'); if (q) q.addEventListener('input', function () { state.q = q.value.trim().toLowerCase(); apply(); });
    var form = $('#search-form'); if (form) form.addEventListener('submit', function (e) { e.preventDefault(); });

    function view(v) {
      $('#view-cards').hidden = v !== 'cards';
      $('#view-list').hidden = v !== 'list';
      $$('[data-view]').forEach(function (b) { b.setAttribute('aria-pressed', b.getAttribute('data-view') === v ? 'true' : 'false'); });
    }
    $$('[data-view]').forEach(function (b) { b.addEventListener('click', function () { view(b.getAttribute('data-view')); }); });
    view(params.get('view') === 'list' ? 'list' : 'cards');
    apply();
  }

  // Количество (+/−)
  $$('.qty').forEach(function (q) {
    var out = $('output', q);
    var unit = q.getAttribute('data-unit') || '';
    $$('button', q).forEach(function (b) {
      b.addEventListener('click', function () {
        var v = parseInt(out.textContent, 10) + parseInt(b.getAttribute('data-d'), 10);
        out.textContent = Math.max(1, v) + unit;
      });
    });
  });

  // Карточка товара: добавить
  var addBig = $('#add-big');
  if (addBig) addBig.addEventListener('click', function () {
    if (addBig.classList.contains('added')) return;
    addBig.classList.add('added'); addBig.textContent = 'В заявке ✓'; setCount(getCount() + 1);
  });

  // Заявка: удалить позицию, тип покупателя, отправка
  $$('.del').forEach(function (b) {
    b.addEventListener('click', function () {
      var item = b.closest('.item'); var group = b.closest('.group');
      item.remove();
      if (!$('.item', group)) group.remove();
      setCount(Math.max(0, getCount() - 1));
    });
  });
  $$('[data-buyer]').forEach(function (b) {
    b.addEventListener('click', function () {
      var org = b.getAttribute('data-buyer') === 'org';
      $$('[data-buyer]').forEach(function (x) { x.setAttribute('aria-pressed', x === b ? 'true' : 'false'); });
      $$('.only-org').forEach(function (x) { x.hidden = !org; });
      var s = $('#submit'); if (s) s.textContent = org ? 'Запросить счёт' : 'Отправить заявку';
    });
  });
  var order = $('#order-form');
  if (order) order.addEventListener('submit', function (e) {
    e.preventDefault();
    $('#order-page').hidden = true;
    $('#order-done').hidden = false;
    setCount(0);
    window.scrollTo(0, 0);
  });
})();

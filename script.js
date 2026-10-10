// 연락 수단을 채우면 내비의 '문의' 버튼과 연락 섹션이 자동으로 나타납니다.
// 예) { label: '이메일', value: 'name@example.com', href: 'mailto:name@example.com' }
const CONTACTS = [];

const btn = document.querySelector('.menu-btn');
const menu = document.getElementById('menu');
btn.addEventListener('click', () => {
  const open = menu.classList.toggle('open');
  btn.setAttribute('aria-expanded', String(open));
});
menu.addEventListener('click', e => {
  if (e.target.tagName === 'A') {
    menu.classList.remove('open');
    btn.setAttribute('aria-expanded', 'false');
  }
});

if (CONTACTS.length) {
  const list = document.getElementById('contact-list');
  CONTACTS.forEach(c => {
    const li = document.createElement('li');
    const s = document.createElement('span');
    s.textContent = c.label;
    const a = document.createElement('a');
    a.textContent = c.value;
    a.href = c.href;
    li.append(s, a);
    list.append(li);
  });
  document.querySelectorAll('[data-contact]').forEach(el => el.hidden = false);
}

/* ---------- 문의 폼 ---------- */
// Apps Script 웹 앱 주소(…/exec). 비어 있으면 전송하지 않고 안내만 보여 줍니다.
const FORM_ENDPOINT = 'https://script.google.com/macros/s/AKfycby2JOf96lgkHiKjUaG5ffqK2J_e63ykoH2xrS6mD6ICMyxihGRdwVuf_n_-IsrKYLkdPg/exec';

const form = document.getElementById('inquiry-form');
const statusEl = document.getElementById('form-status');
const submitBtn = document.getElementById('submit-btn');
let sending = false;

function setError(name, msg) {
  const el = form.querySelector('.field-err[data-for="' + name + '"]');
  const input = form.elements[name];
  if (el) el.textContent = msg || '';
  if (input) input.setAttribute('aria-invalid', msg ? 'true' : 'false');
}

function validate(data) {
  const errors = {};
  if (!data.name) errors.name = '이름을 입력해 주세요.';
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) errors.email = '이메일 형식이 올바르지 않습니다.';
  if (!data.message) errors.message = '문의 내용을 입력해 주세요.';
  if (!form.elements.consent.checked) errors.consent = '개인정보 수집·이용에 동의해 주세요.';
  return errors;
}

function showStatus(text, kind) {
  statusEl.textContent = text;
  statusEl.className = 'form-status' + (kind ? ' ' + kind : '');
}

form.addEventListener('submit', async e => {
  e.preventDefault();
  if (sending) return;           // 전송 중에 Enter/클릭이 또 들어와도 무시
  const fd = new FormData(form);
  const data = {};
  ['name', 'email', 'phone', 'company', 'message', 'website'].forEach(k => {
    data[k] = String(fd.get(k) || '').trim();
  });

  ['name', 'email', 'message', 'consent'].forEach(k => setError(k, ''));
  showStatus('', '');
  const errors = validate(data);
  const keys = Object.keys(errors);
  if (keys.length) {
    keys.forEach(k => setError(k, errors[k]));
    form.elements[keys[0]].focus();
    return;
  }

  if (!FORM_ENDPOINT) {
    showStatus('문의 접수 기능이 아직 연결되지 않았습니다. 설정이 끝나면 이용할 수 있습니다.', 'err');
    return;
  }

  sending = true;
  submitBtn.disabled = true;
  submitBtn.textContent = '보내는 중…';
  try {
    // text/plain 으로 보내야 브라우저가 사전 요청(CORS preflight) 없이 Apps Script로 전달합니다.
    const res = await fetch(FORM_ENDPOINT, {
      method: 'POST',
      headers: { 'Content-Type': 'text/plain;charset=utf-8' },
      body: JSON.stringify(data),
    });
    const result = await res.json();
    if (!result.ok) throw new Error(result.error || '전송에 실패했습니다.');
    form.reset();
    showStatus('문의가 접수되었습니다. 입력하신 이메일로 확인 메일을 보냈습니다.', 'ok');
    statusEl.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
  } catch (err) {
    showStatus(
      (err && err.message && err.message !== 'Failed to fetch' ? err.message : '전송 중 문제가 생겼습니다. 잠시 후 다시 시도해 주세요.'),
      'err'
    );
  } finally {
    sending = false;
    submitBtn.disabled = false;
    submitBtn.textContent = '문의 보내기';
  }
});

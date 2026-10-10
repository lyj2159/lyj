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

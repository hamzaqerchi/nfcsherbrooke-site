// Script commun à toutes les pages : menu, calculateur de prix, formulaire de commande, liens Square, agrandissement des photos.
const $ = id => document.getElementById(id);

// Anciens liens vers l'accueil en une seule page (ex. index.html#commander) : on renvoie vers la bonne page.
const ANCIENS = {'#commander': 'prix.html#commander', '#prix': 'prix.html', '#galerie': 'produit.html', '#fonctionnement': 'plaques.html#fonctionnement', '#produit': 'produit.html', '#questions': 'questions.html', '#ecrire': 'contact.html'};
if (/(^\/$|index\.html$)/.test(location.pathname) && ANCIENS[location.hash]) location.replace(ANCIENS[location.hash]);

if ($('year')) $('year').textContent = new Date().getFullYear();

const hamburger = $('hamburger'), mainNav = $('mainNav');
hamburger.addEventListener('click', () => {
  const open = mainNav.classList.toggle('mobile-open');
  hamburger.classList.toggle('open', open);
  hamburger.setAttribute('aria-expanded', open);
});
mainNav.querySelectorAll('a').forEach(a => a.addEventListener('click', () => {
  mainNav.classList.remove('mobile-open'); hamburger.classList.remove('open'); hamburger.setAttribute('aria-expanded', false);
}));

// Grille de prix : 1 = 50 $, 2 = 80 $, 3 à 9 = 40 $/u, 10 et + = 30 $/u
function prix(n){
  n = Math.max(1, Math.floor(n) || 1);
  if (n === 1) return {total:50, unit:50};
  if (n === 2) return {total:80, unit:40};
  if (n < 10)  return {total:n*40, unit:40};
  return {total:n*30, unit:30};
}
const fmt = v => v.toLocaleString('fr-CA') + ' $';

const qty = $('calc-qty');
if (qty) {
  const render = () => {
    const n = Math.max(1, Math.floor(+qty.value) || 1), p = prix(n), eco = n*50 - p.total;
    $('calc-total').textContent = fmt(p.total);
    let d = n === 1 ? '1 plaque' : n + ' × ' + fmt(p.unit);
    if (eco > 0) d += ' · vous économisez ' + fmt(eco);
    if (n >= 7 && n < 10) d += ' · à 10, c\'est 30 $ chacune';
    $('calc-detail').textContent = d;
  };
  $('calc-minus').onclick = () => { qty.value = Math.max(1, (+qty.value||1) - 1); render(); };
  $('calc-plus').onclick = () => { qty.value = (+qty.value||0) + 1; render(); };
  qty.addEventListener('input', render);
  render();
}

// Formulaire de commande : total estimé selon la même grille
const oq = $('orderQty');
if (oq) {
  const renderOrder = () => {
    const n = Math.max(1, Math.floor(+oq.value) || 1), p = prix(n);
    $('orderTotal').textContent = fmt(p.total);
    $('orderDetail').textContent = n === 1 ? '1 plaque' : n + ' plaques · ' + fmt(p.unit) + ' chacune';
  };
  oq.addEventListener('input', renderOrder);
  renderOrder();
}

// Liens de paiement Square : coller chaque lien créé dans Square (Paiements en ligne > Liens de paiement).
// Un forfait sans lien n'est pas affiché ; sans aucun lien, la boîte reste cachée.
const SQUARE = [
  {label:'1 plaque', total:50, url:''},
  {label:'2 plaques', total:80, url:''},
  {label:'5 plaques', total:200, url:''},
  {label:'10 plaques', total:300, url:''},
];
const live = SQUARE.filter(l => /^https:\/\/(square\.link|checkout\.square\.site)\//.test(l.url));
if (live.length && $('payLinks')) {
  $('payLinks').innerHTML = live.map(l => `<a href="${l.url}" target="_blank" rel="noopener">${l.label}<b>${fmt(l.total)}</b></a>`).join('');
  $('payBox').hidden = false;
}

const lb = $('lightbox');
if (lb) {
  const lbImg = $('lightboxImg');
  document.querySelectorAll('.gallery-item[data-full]').forEach(item => item.addEventListener('click', () => {
    lbImg.src = item.dataset.full; lbImg.alt = item.querySelector('img').alt; lb.classList.add('open'); document.body.style.overflow = 'hidden';
  }));
  const closeLb = () => { lb.classList.remove('open'); lbImg.src = ''; document.body.style.overflow = ''; };
  $('lightboxClose').onclick = closeLb;
  lb.addEventListener('click', e => { if (e.target === lb) closeLb(); });
  document.addEventListener('keydown', e => { if (e.key === 'Escape') closeLb(); });
}

// Moins d'animations demandé : la vidéo de démonstration ne joue pas en boucle toute seule
if (matchMedia('(prefers-reduced-motion: reduce)').matches) document.querySelectorAll('video[autoplay]').forEach(v => { v.pause(); v.removeAttribute('autoplay'); v.controls = true; });

// Formulaire de message : il faut au moins un téléphone ou un courriel pour pouvoir répondre
const fc = document.querySelector('form[name="contact"]');
if (fc) fc.addEventListener('submit', e => {
  const tel = fc.telephone.value.trim(), mail = fc.courriel.value.trim();
  const veutCourriel = fc.querySelector('input[name="reponse"]:checked').value.startsWith('Répondez');
  let msg = '';
  if (!tel && !mail) msg = 'Indiquez un téléphone ou un courriel pour que je puisse vous répondre.';
  else if (veutCourriel && !mail) msg = 'Indiquez votre courriel pour recevoir la réponse par courriel.';
  else if (!veutCourriel && !tel) msg = 'Indiquez votre téléphone pour que je vous rappelle.';
  if (msg) { e.preventDefault(); (veutCourriel ? fc.courriel : fc.telephone).setCustomValidity(msg); (veutCourriel ? fc.courriel : fc.telephone).reportValidity(); }
});
if (fc) fc.addEventListener('input', () => { fc.telephone.setCustomValidity(''); fc.courriel.setCustomValidity(''); });


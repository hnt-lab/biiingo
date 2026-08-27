// Diffusion de l'écran public vers une TV, un navigateur ou un récepteur compatible.

function mcDisplayUrl() {
  return location.origin + location.pathname + '?display=' + encodeURIComponent(S.soiree.code);
}

let mcPresentation = null;

function mcCasterTV() {
  try {
    const request = new PresentationRequest([mcDisplayUrl()]);
    request.start().then(connection => {
      mcPresentation = connection;
      toast('Tableau envoyé sur la TV 📺');
    }).catch(() => {
      modal(`
        <h3>📡 Le cast n'a pas abouti</h3>
        <p class="modal-msg muted small">Soit la fenêtre a été annulée, soit aucun <b>Chromecast</b> n'est
        joignable sur ce réseau. ⚠️ Les TV en simple « miroir d'écran » n'apparaissent pas ici — pour
        elles, utilise la méthode universelle (navigateur de la TV + code), qui marche partout.</p>
        <p class="muted small">🔎 Diagnostic — récepteur Google Cast vu par Chrome : <b id="castDiag">détection…</b></p>
        <div class="modal-btns">
          <button class="btn ghost" onclick="closeModal()">Fermer</button>
          <button class="btn primary" onclick="closeModal();mcEcranModal()">📺 Méthode universelle</button>
        </div>`);
      try {
        new PresentationRequest([mcDisplayUrl()]).getAvailability().then(availability => {
          const update = () => {
            const element = $('#castDiag');
            if (element) element.textContent = availability.value
              ? 'OUI ✅ (réessaie 📡)'
              : 'NON ❌ (miroir seul ou autre réseau)';
          };
          update();
          availability.onchange = update;
        }).catch(() => {
          const element = $('#castDiag');
          if (element) element.textContent = 'indisponible';
        });
      } catch (error) {}
    });
  } catch (error) {
    mcEcranModal();
  }
}

function mcEcranModal() {
  const url = mcDisplayUrl();
  const code = S.soiree.code;
  modal(`
    <h3>📺 Afficher la soirée sur une TV / un écran</h3>
    <div class="tv-etapes">
      <p><b>Sur une Smart TV</b> (avec sa télécommande) :</p>
      <p class="tv-etape">1️⃣ Ouvre le navigateur de la TV et va sur<br><span class="tv-url">hnt-lab.github.io</span></p>
      <p class="tv-etape">2️⃣ Choisis « 📺 Afficher une soirée sur cet écran »</p>
      <p class="tv-etape">3️⃣ Tape le code : <span class="code-mini">${esc(code)}</span></p>
    </div>
    <hr class="ed-sep">
    <p class="muted small">Tablette ou PC : scanne ce QR ou colle le lien direct — le tableau s'ouvre sans compte.</p>
    <div class="ecran-qr"><div id="ecranQrBox"></div></div>
    <label class="field"><span>Lien direct</span>
      <input id="ecranUrl" type="text" readonly value="${escAttr(url)}" onclick="this.select()"></label>
    <div class="modal-btns">
      <button class="btn" onclick="mcCopieUrl()">📋 Copier le lien</button>
      <button class="btn primary" onclick="closeModal()">Fermer</button>
    </div>`);
  try {
    new QRCode($('#ecranQrBox'), {
      text: url,
      width: 150,
      height: 150,
      colorDark: '#1a1426',
      colorLight: '#ffffff'
    });
  } catch (error) {}
}

function mcCopieUrl() {
  const element = $('#ecranUrl');
  element.select();
  try { navigator.clipboard.writeText(element.value).then(() => toast('Lien copié 📋')); }
  catch (error) { document.execCommand('copy'); toast('Lien copié 📋'); }
}

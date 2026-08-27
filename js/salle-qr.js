// Liens et QR codes affichés sur l'écran de salle.

let salleQrUrl = null;

function salleQrReset() {
  salleQrUrl = null;
}

function salleJoinUrl(soiree) {
  return location.origin + location.pathname + '?join=' + encodeURIComponent(soiree.code);
}

function salleMakeQrJoin(soiree) {
  const box = $('#qrAccueil');
  if (!box || !window.QRCode || box.childNodes.length) return;
  try {
    new QRCode(box, {
      text: salleJoinUrl(soiree),
      width: 150,
      height: 150,
      colorDark: '#1a1426',
      colorLight: '#ffffff'
    });
  } catch (error) {}
}

function renderQrPopup(soiree) {
  const element = $('#salleQrPopup');
  const visible = !!soiree.qrPopup && soiree.joueursActif !== false;
  element.classList.toggle('show', visible);
  if (visible && !element.dataset.code) {
    element.dataset.code = soiree.code;
    element.innerHTML = `<div class="qr-popup-carte">
      <div id="qrPopupBox"></div>
      <div class="qr-popup-txt">📱 Rejoins la partie !<br><b>${esc(soiree.code)}</b></div>
    </div>`;
    try {
      new QRCode($('#qrPopupBox'), {
        text: salleJoinUrl(soiree),
        width: 220,
        height: 220,
        colorDark: '#1a1426',
        colorLight: '#ffffff'
      });
    } catch (error) {}
  }
  if (!visible) {
    element.dataset.code = '';
    element.innerHTML = '';
  }
}

function salleMakeQr(soiree) {
  const endScreen = (soiree.ecrans && soiree.ecrans.fin) || {};
  if (!endScreen.qrUrl || !window.QRCode) return;
  const box = $('#qrBox');
  if (!box) return;
  if (salleQrUrl === endScreen.qrUrl && box.childNodes.length) return;
  salleQrUrl = endScreen.qrUrl;
  box.innerHTML = '';
  try {
    new QRCode(box, {
      text: endScreen.qrUrl,
      width: 140,
      height: 140,
      colorDark: '#1a1426',
      colorLight: '#ffffff'
    });
  } catch (error) {}
}

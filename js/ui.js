// Outils d'interface partagés par tous les écrans.

function $(selector) { return document.querySelector(selector); }

function esc(value) {
  return String(value == null ? '' : value)
    .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;').replace(/'/g, '&#39;');
}

function escAttr(value) { return esc(value); }

let EMOJI_RE = null;
try { EMOJI_RE = new RegExp('(\\p{Extended_Pictographic}(\\uFE0F|\\u200D\\p{Extended_Pictographic})*)', 'gu'); }
catch (error) { EMOJI_RE = null; }

function gradTxt(value) {
  const escaped = esc(value);
  if (!EMOJI_RE) return escaped;
  return escaped.replace(EMOJI_RE, '<span class="emo">$1</span>');
}

function toast(message) {
  const element = $('#toast');
  element.textContent = message;
  element.classList.add('show');
  clearTimeout(toast._timer);
  toast._timer = setTimeout(() => element.classList.remove('show'), 2200);
}

function modal(html) {
  $('#modalContent').innerHTML = html;
  $('#modalBack').classList.add('show');
}

function closeModal() { $('#modalBack').classList.remove('show'); }

function confirmAction(message, yesLabel, action) {
  modal(`
    <p class="modal-msg">${message}</p>
    <div class="modal-btns">
      <button class="btn ghost" onclick="closeModal()">Annuler</button>
      <button class="btn primary" onclick="closeModal();${action}">${esc(yesLabel)}</button>
    </div>`);
}

function showScreen(id) {
  document.querySelectorAll('.screen').forEach(screen => screen.classList.remove('active'));
  $('#' + id).classList.add('active');
}

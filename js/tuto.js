// Tutoriel : affiché automatiquement à la première visite, puis disponible via le bouton ❓ de l'accueil.

function maybeShowTuto() {
  let vu = false;
  try { vu = !!localStorage.getItem('biiingo_tuto_vu'); } catch (e) {}
  if (!vu) tutoModal();
}

function tutoModal() {
  try { localStorage.setItem('biiingo_tuto_vu', '1'); } catch (e) {}
  modal(`
    <h3>✨ Bienvenue sur Biiingo !</h3>
    <div class="tuto">
      <div class="tuto-bloc">
        <b>🖥 + 📱 Le principe</b>
        <p>L'ordinateur de la salle <b>affiche</b>, vos téléphones <b>pilotent</b>. Tout est synchronisé
        en direct : ce que vous tapez sur le téléphone apparaît à l'écran en une seconde.</p>
      </div>
      <div class="tuto-bloc">
        <b>🚀 Démarrer une soirée</b>
        <p>Sur le téléphone : « ➕ Nouvelle soirée ». Sur le PC : la même soirée → « 🖥 Afficher ».
        Le <b>code 4 lettres</b> (en haut à droite de la télécommande) permet aux autres MC de rejoindre
        avec leur propre compte — tout le monde peut taper en même temps.</p>
      </div>
      <div class="tuto-bloc">
        <b>🎲 Pendant la partie</b>
        <p>Un tap sur un numéro = il s'affiche en salle. Re-tap = annulation (avec confirmation).
        « 🎯 Objectif » pour changer librement, « ➡️ Manche suiv. » pour repartir sur une grille vierge.</p>
      </div>
      <div class="tuto-bloc">
        <b>🔍 Quelqu'un crie « Quine ! »</b>
        <p>Onglet Vérif → lancez la vérification (avec ou sans suspense) → appuyez sur les numéros
        du carton du joueur : vert = sorti, rouge = pas sorti… verdict « ✨ GAGNÉ » ou « 💋 Faux bingo ».
        Après un gagné, l'objectif passe tout seul au suivant et vous revenez au tirage.</p>
      </div>
      <div class="tuto-bloc">
        <b>🎭 Entractes & personnalisation</b>
        <p>Onglet Entracte pour lancer un numéro de spectacle. Onglet ✏️ Édition pour vos artistes
        (avec photos), le bandeau défilant, les écrans d'accueil et de fin (hall of fame, QR code),
        la décoration… et sauvez le tout en <b>préset</b> pour la prochaine soirée.</p>
      </div>
      <div class="tuto-bloc">
        <b>🔊 Le son</b>
        <p>Les sons sortent de l'écran de salle (le PC branché à la sono). Si un bouton
        « 🔊 Plein écran & son » apparaît en bas de l'écran, cliquez-le une fois.</p>
      </div>
    </div>
    <div class="modal-btns">
      <button class="btn primary big" onclick="closeModal()">C'est parti ! ✨</button>
    </div>`);
}

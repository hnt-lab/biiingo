// État partagé entre les interfaces MC, salle et joueur.

const S = window.S = {
  user: null,
  profile: null,
  mode: null,
  soireeId: null,
  soiree: null,
  prev: null,
  unsub: null,
  unsubMedias: null,
  unsubJoueurs: null,
  registre: {},
  medias: {},
  sonsCustom: {},
  joueurs: [],
  nbJoueurs: 0,
  displayMode: false,
  mcTab: 'tirage'
};

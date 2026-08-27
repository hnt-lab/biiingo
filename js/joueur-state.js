// État partagé du mode joueur, accessible aux modules de navigation et de jetons.

const J = window.J = {
  code: null,
  soireeId: null,
  soiree: null,
  prev: null,
  unsub: null,
  uid: null,
  nom: '',
  invite: true,
  cartons: [],
  actif: 0,
  marques: [],
  alertes: {},
  elimine: false,
  etatAffiche: null
};

import { readFile } from 'node:fs/promises';
import { after, before, beforeEach, test } from 'node:test';
import {
  assertFails,
  assertSucceeds,
  initializeTestEnvironment
} from '@firebase/rules-unit-testing';
import {
  arrayUnion,
  deleteDoc,
  doc,
  getDoc,
  setDoc,
  updateDoc
} from 'firebase/firestore';

const projectId = 'demo-biiingo';
const ids = {
  owner: 'owner',
  mc: 'mc',
  player: 'player',
  otherPlayer: 'other-player',
  attacker: 'attacker',
  display: 'display'
};

let environment;

function firestoreAs(uid) {
  return environment.authenticatedContext(uid).firestore();
}

async function seed() {
  await environment.withSecurityRulesDisabled(async context => {
    const db = context.firestore();
    await setDoc(doc(db, 'users', ids.owner), { pseudo: 'Organisateur' });
    await setDoc(doc(db, 'soirees', 'party'), {
      code: 'ABCD',
      ownerUid: ids.owner,
      mcUids: [ids.owner, ids.mc],
      statut: 'active',
      titre: 'Soirée de test'
    });
    await setDoc(doc(db, 'soirees', 'party', 'joueurs', ids.player), { nom: 'Alice' });
    await setDoc(doc(db, 'soirees', 'party', 'joueurs', ids.otherPlayer), { nom: 'Bob' });
    await setDoc(doc(db, 'registres', ids.owner), {
      memberUids: [ids.owner, ids.mc],
      accessSoireeId: 'party',
      noms: {}
    });
    await setDoc(doc(db, 'sons', `${ids.owner}_tirage`), {
      uid: ids.owner,
      name: 'tirage',
      data: 'data:audio/mpeg;base64,AA=='
    });
    await setDoc(doc(db, 'medias', 'party__accueil'), {
      soireeId: 'party',
      key: 'accueil',
      data: 'data:image/jpeg;base64,AA=='
    });
  });
}

before(async () => {
  environment = await initializeTestEnvironment({
    projectId,
    firestore: {
      rules: await readFile(new URL('../_setup/firestore.rules', import.meta.url), 'utf8')
    }
  });
});

beforeEach(async () => {
  await environment.clearFirestore();
  await seed();
});

after(async () => {
  await environment.cleanup();
});

test('protège les profils par propriétaire', async () => {
  await assertSucceeds(getDoc(doc(firestoreAs(ids.owner), 'users', ids.owner)));
  await assertFails(getDoc(doc(firestoreAs(ids.attacker), 'users', ids.owner)));
});

test('autorise l’affichage authentifié mais refuse une lecture anonyme', async () => {
  await assertSucceeds(getDoc(doc(firestoreAs(ids.display), 'soirees', 'party')));
  const anonymousDb = environment.unauthenticatedContext().firestore();
  await assertFails(getDoc(doc(anonymousDb, 'soirees', 'party')));
});

test('réserve les changements de soirée aux MC', async () => {
  await assertSucceeds(updateDoc(doc(firestoreAs(ids.mc), 'soirees', 'party'), { titre: 'Nouveau titre' }));
  await assertFails(updateDoc(doc(firestoreAs(ids.attacker), 'soirees', 'party'), { titre: 'Piratée' }));
});

test('permet de rejoindre comme MC sans modifier autre chose', async () => {
  await assertSucceeds(updateDoc(doc(firestoreAs(ids.attacker), 'soirees', 'party'), {
    mcUids: arrayUnion(ids.attacker)
  }));

  await environment.clearFirestore();
  await seed();
  await assertFails(updateDoc(doc(firestoreAs(ids.attacker), 'soirees', 'party'), {
    mcUids: arrayUnion(ids.attacker),
    titre: 'Piratée'
  }));
});

test('isole chaque document joueur et laisse les MC modérer', async () => {
  await assertSucceeds(getDoc(doc(firestoreAs(ids.player), 'soirees', 'party', 'joueurs', ids.player)));
  await assertFails(getDoc(doc(firestoreAs(ids.player), 'soirees', 'party', 'joueurs', ids.otherPlayer)));
  await assertSucceeds(getDoc(doc(firestoreAs(ids.mc), 'soirees', 'party', 'joueurs', ids.player)));
  await assertFails(deleteDoc(doc(firestoreAs(ids.attacker), 'soirees', 'party', 'joueurs', ids.player)));
  await assertSucceeds(deleteDoc(doc(firestoreAs(ids.mc), 'soirees', 'party', 'joueurs', ids.player)));
});

test('réserve le registre à la troupe', async () => {
  await assertSucceeds(getDoc(doc(firestoreAs(ids.mc), 'registres', ids.owner)));
  await assertSucceeds(updateDoc(doc(firestoreAs(ids.mc), 'registres', ids.owner), {
    noms: { alice: { nom: 'Alice' } }
  }));
  await assertFails(getDoc(doc(firestoreAs(ids.attacker), 'registres', ids.owner)));
  await assertFails(updateDoc(doc(firestoreAs(ids.attacker), 'registres', ids.owner), { noms: {} }));
});

test('permet à un nouveau MC de rejoindre le registre sans s’octroyer d’autres droits', async () => {
  await assertSucceeds(updateDoc(doc(firestoreAs(ids.attacker), 'soirees', 'party'), {
    mcUids: arrayUnion(ids.attacker)
  }));
  await assertSucceeds(updateDoc(doc(firestoreAs(ids.attacker), 'registres', ids.owner), {
    memberUids: arrayUnion(ids.attacker),
    accessSoireeId: 'party'
  }));

  await environment.clearFirestore();
  await seed();
  await assertFails(updateDoc(doc(firestoreAs(ids.attacker), 'registres', ids.owner), {
    memberUids: arrayUnion(ids.attacker),
    accessSoireeId: 'unknown'
  }));
});

test('migre un ancien registre sans liste de membres', async () => {
  await environment.withSecurityRulesDisabled(async context => {
    await setDoc(doc(context.firestore(), 'registres', ids.owner), { noms: {} });
  });

  const register = doc(firestoreAs(ids.mc), 'registres', ids.owner);
  await assertSucceeds(updateDoc(register, {
    memberUids: arrayUnion(ids.mc),
    accessSoireeId: 'party'
  }));
  await assertSucceeds(getDoc(register));
});

test('limite l’écriture des sons à la troupe propriétaire', async () => {
  const path = ['sons', `${ids.owner}_tirage`];
  await assertSucceeds(getDoc(doc(firestoreAs(ids.display), ...path)));
  await assertSucceeds(updateDoc(doc(firestoreAs(ids.mc), ...path), { data: 'updated' }));
  await assertFails(updateDoc(doc(firestoreAs(ids.attacker), ...path), { data: 'attacked' }));
});

test('limite l’écriture des médias aux MC de la soirée', async () => {
  const path = ['medias', 'party__accueil'];
  await assertSucceeds(getDoc(doc(firestoreAs(ids.display), ...path)));
  await assertSucceeds(updateDoc(doc(firestoreAs(ids.mc), ...path), { data: 'updated' }));
  await assertFails(updateDoc(doc(firestoreAs(ids.attacker), ...path), { data: 'attacked' }));
});

test('valide strictement les retours envoyés', async () => {
  const valid = doc(firestoreAs(ids.player), 'feedback', 'valid');
  await assertSucceeds(setDoc(valid, {
    texte: 'Très bonne soirée',
    contact: '',
    origine: 'joueur',
    nom: 'Alice',
    uid: ids.player,
    version: '1.5.1',
    ts: new Date()
  }));
  await assertFails(setDoc(doc(firestoreAs(ids.player), 'feedback', 'invalid'), {
    texte: '',
    contact: '',
    origine: 'joueur',
    nom: 'Alice',
    uid: ids.attacker,
    version: '1.5.1',
    ts: new Date(),
    role: 'admin'
  }));
  await assertSucceeds(getDoc(valid));
  await assertFails(getDoc(doc(firestoreAs(ids.attacker), 'feedback', 'valid')));
  await assertSucceeds(deleteDoc(valid));
});

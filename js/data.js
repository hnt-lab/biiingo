// Opérations Firestore partagées qui doivent rester cohérentes entre les écrans.

const FIRESTORE_BATCH_LIMIT = 400;

async function deleteQueryDocs(query) {
  let deleted = 0;

  while (true) {
    const snapshot = await query.limit(FIRESTORE_BATCH_LIMIT).get();
    if (snapshot.empty) return deleted;

    const batch = db.batch();
    snapshot.docs.forEach(document => batch.delete(document.ref));
    await batch.commit();
    deleted += snapshot.size;

    if (snapshot.size < FIRESTORE_BATCH_LIMIT) return deleted;
  }
}

async function deleteSoireeData(soireeId) {
  const soireeRef = db.collection('soirees').doc(soireeId);
  await deleteQueryDocs(soireeRef.collection('joueurs'));
  await deleteQueryDocs(db.collection('medias').where('soireeId', '==', soireeId));
  await soireeRef.delete();
}

async function deleteUserData(uid) {
  const soirees = await db.collection('soirees').where('ownerUid', '==', uid).get();
  for (const soiree of soirees.docs) await deleteSoireeData(soiree.id);

  await deleteQueryDocs(db.collection('sons').where('uid', '==', uid));
  await deleteQueryDocs(db.collection('feedback').where('uid', '==', uid));
  await deleteQueryDocs(db.collection('users').doc(uid).collection('presets'));
  await db.collection('registres').doc(uid).delete().catch(() => {});
  await db.collection('users').doc(uid).delete();
}

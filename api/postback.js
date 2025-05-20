import { initializeApp, cert } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';

const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_KEY);

if (!getFirestore.apps?.length) {
  initializeApp({
    credential: cert(serviceAccount),
  });
}

const db = getFirestore();

export default async function handler(req, res) {
  const { subid } = req.query;

  if (!subid) {
    return res.status(400).send('Missing subid');
  }

  try {
    const userRef = db.collection('users').doc(subid);
    const userDoc = await userRef.get();

    if (!userDoc.exists) {
      return res.status(404).send('User not found');
    }

    const currentPoints = userDoc.data().points || 0;
    await userRef.update({
      points: currentPoints + 50,
      lastOfferComplete: new Date().toISOString(),
    });

    return res.status(200).send('Postback processed');
  } catch (error) {
    console.error('Postback Error:', error);
    return res.status(500).send('Server Error');
  }
}

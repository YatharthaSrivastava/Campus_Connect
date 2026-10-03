const admin = require('firebase-admin');

let app;

const initFirebase = () => {
  if (app) return app;

  // In MOCK_AUTH mode, skip real Firebase initialization
  if (process.env.MOCK_AUTH === 'true') {
    console.log('🔧 Running in MOCK_AUTH mode — Firebase Admin SDK skipped');
    return null;
  }

  const serviceAccount = {
    projectId: process.env.FIREBASE_PROJECT_ID,
    clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
    privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
  };

  app = admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
  });

  console.log('✅ Firebase Admin SDK Initialized');
  return app;
};

module.exports = { initFirebase, admin };

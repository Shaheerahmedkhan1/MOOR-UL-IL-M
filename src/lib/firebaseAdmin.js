import { getApps, cert, initializeApp } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";
import { getFirestore } from "firebase-admin/firestore";

const projectId = process.env.FIREBASE_ADMIN_PROJECT_ID;
const clientEmail = process.env.FIREBASE_ADMIN_CLIENT_EMAIL;

const base64Key = process.env.FIREBASE_ADMIN_PRIVATE_KEY_BASE64;

if (!projectId || !clientEmail || !base64Key) {
  throw new Error(
    "Firebase Admin environment variables are missing."
  );
}

let privateKey;

try {
  privateKey = Buffer.from(base64Key, "base64")
    .toString("utf8")
    .replace(/\\n/g, "\n")
    .trim();

  if (!privateKey.includes("-----BEGIN PRIVATE KEY-----")) {
    throw new Error("Decoded private key is not a valid PEM key.");
  }
} catch (error) {
  throw new Error(
    `Firebase Admin private key could not be decoded: ${error.message}`
  );
}

const adminApp =
  getApps().length > 0
    ? getApps()[0]
    : initializeApp({
        credential: cert({
          projectId,
          clientEmail,
          privateKey,
        }),
      });

export const adminAuth = getAuth(adminApp);
export const adminDb = getFirestore(adminApp);

export default adminApp;
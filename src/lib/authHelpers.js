import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signInWithPopup,
  signOut,
} from "firebase/auth";

import {
  doc,
  setDoc,
  getDoc,
  collection,
  query,
  where,
  getDocs,
} from "firebase/firestore";

import { auth, db, googleProvider } from "./firebase";

const ADMIN_EMAIL = "hafizshaheerahmedkhan@gmail.com";

// ========================================
// CREATE / ENSURE USER DOCUMENT
// ========================================

async function ensureUserDoc(user, role = "student") {
  const ref = doc(db, "users", user.uid);
  const snap = await getDoc(ref);

  if (!snap.exists()) {
    const isAdmin =
      user.email &&
      user.email.toLowerCase() === ADMIN_EMAIL.toLowerCase();

    let finalRole = role || "student";
    let status = "approved";

    // ADMIN
    if (isAdmin) {
      finalRole = "admin";
      status = "approved";
    }

    // TEACHER
    if (finalRole === "teacher" && !isAdmin) {
      status = "pending";
    }

    await setDoc(ref, {
      uid: user.uid,
      name: user.displayName || "",
      nameLower: (user.displayName || "").toLowerCase(),
      email: user.email || "",
      role: finalRole,
      status,
      createdAt: new Date().toISOString(),
    });
  }

  return ref;
}

// ========================================
// EMAIL SIGNUP
// ========================================

export async function signUpWithEmail(
  name,
  email,
  password,
  role = "student"
) {
  const cleanName = name.trim();
  const cleanEmail = email.trim().toLowerCase();

  if (!cleanName) {
    throw new Error("Please enter your name.");
  }

  if (!cleanEmail) {
    throw new Error("Please enter your email.");
  }

  if (!password) {
    throw new Error("Please enter your password.");
  }

  // ----------------------------------------
  // CHECK DUPLICATE NAME
  // ----------------------------------------

  const usersRef = collection(db, "users");

  const nameQuery = query(
    usersRef,
    where(
      "nameLower",
      "==",
      cleanName.toLowerCase()
    )
  );

  const nameSnap = await getDocs(nameQuery);

  if (!nameSnap.empty) {
    throw new Error(
      "This name is already registered. Please use another name."
    );
  }

  // ----------------------------------------
  // CREATE FIREBASE ACCOUNT
  // ----------------------------------------

  const cred =
    await createUserWithEmailAndPassword(
      auth,
      cleanEmail,
      password
    );

  // ----------------------------------------
  // DETERMINE ROLE
  // ----------------------------------------

  const isAdmin =
    cleanEmail === ADMIN_EMAIL.toLowerCase();

  let finalRole = role || "student";
  let status = "approved";

  // ADMIN
  if (isAdmin) {
    finalRole = "admin";
    status = "approved";
  }

  // TEACHER
  else if (finalRole === "teacher") {
    status = "pending";
  }

  // ----------------------------------------
  // SAVE USER
  // ----------------------------------------

  await setDoc(
    doc(db, "users", cred.user.uid),
    {
      uid: cred.user.uid,

      name: cleanName,

      nameLower:
        cleanName.toLowerCase(),

      email: cleanEmail,

      role: finalRole,

      status,

      createdAt:
        new Date().toISOString(),
    }
  );

  return cred.user;
}

// ========================================
// EMAIL LOGIN
// ========================================

export async function logInWithEmail(
  email,
  password
) {
  const cleanEmail = email.trim().toLowerCase();

  const cred =
    await signInWithEmailAndPassword(
      auth,
      cleanEmail,
      password
    );

  return cred.user;
}

// ========================================
// NAME + PASSWORD LOGIN
// ========================================

export async function logInWithName(
  name,
  password
) {
  const cleanName = name.trim();

  if (!cleanName) {
    throw new Error(
      "Please enter your name."
    );
  }

  if (!password) {
    throw new Error(
      "Please enter your password."
    );
  }

  // ----------------------------------------
  // FIND USER BY NAME
  // ----------------------------------------

  const usersRef = collection(db, "users");

  const q = query(
    usersRef,
    where(
      "nameLower",
      "==",
      cleanName.toLowerCase()
    )
  );

  const snap = await getDocs(q);

  if (snap.empty) {
    throw new Error(
      "User name not found."
    );
  }

  // ----------------------------------------
  // DUPLICATE NAME CHECK
  // ----------------------------------------

  if (snap.docs.length > 1) {
    throw new Error(
      "Multiple accounts have this name. Please contact the administrator."
    );
  }

  const userData =
    snap.docs[0].data();

  if (!userData.email) {
    throw new Error(
      "This account does not have an email."
    );
  }

  // ----------------------------------------
  // LOGIN USING EMAIL + PASSWORD
  // ----------------------------------------

  const user =
    await logInWithEmail(
      userData.email,
      password
    );

  return user;
}

// ========================================
// GOOGLE LOGIN
// ========================================

export async function logInWithGoogle(
  role = "student"
) {
  const cred =
    await signInWithPopup(
      auth,
      googleProvider
    );

  await ensureUserDoc(
    cred.user,
    role
  );

  return cred.user;
}

// ========================================
// LOGOUT
// ========================================

export async function logOut() {
  await signOut(auth);
}

// ========================================
// GET USER ROLE
// ========================================

export async function getUserRole(uid) {
  const snap =
    await getDoc(
      doc(db, "users", uid)
    );

  if (!snap.exists()) {
    return null;
  }

  return snap.data().role || null;
}

// ========================================
// GET USER DATA
// ========================================

export async function getUserData(uid) {
  const snap =
    await getDoc(
      doc(db, "users", uid)
    );

  if (!snap.exists()) {
    return null;
  }

  return snap.data();
}

// ========================================
// SAVE USER FIELD + CLASS + BOARD
// ========================================

export async function saveUserField(
  uid,
  board,
  field,
  subField
) {
  if (!uid) {
    throw new Error(
      "User ID missing."
    );
  }

  if (!board) {
    throw new Error(
      "Please select your board."
    );
  }

  if (!field) {
    throw new Error(
      "Please select your field."
    );
  }

  if (!subField) {
    throw new Error(
      "Please select your class."
    );
  }

  await setDoc(
    doc(db, "users", uid),
    {
      board,
      field,
      subField,
    },
    {
      merge: true,
    }
  );
}
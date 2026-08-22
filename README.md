# Matric & Intermediate platform — starter

Ye Step 1-3 ka kaam hai: project setup, login/signup (student + teacher), aur course list
(Firestore se). Isay apne computer par chalane ke liye:

## 1. Firebase project banao
1. https://console.firebase.google.com par jao, "Add project" karo.
2. Left menu se **Authentication** > Sign-in method > Email/Password aur Google enable karo.
3. **Firestore Database** > Create database (test mode se shuru karo).
4. Project settings (gear icon) > General > "Your apps" > Web app (</>) add karo.
5. Wahan se milne wali config values `.env.local.example` file mein copy karke
   file ka naam `.env.local` rakho.

## 2. Code chalao
```bash
npm install
npm run dev
```
Browser mein http://localhost:3000 khol lo.

## 3. Test karo
- `/signup` par jao, "I'm a teacher" select karke ek account banao.
- Firebase console > Firestore mein "users" collection mein wo document dikhega.
- `subjects` collection manually banao Firestore console mein, e.g.:
  ```
  subjects/physics-matric
    name: "Physics"
    level: "Matric"
  ```
- `/courses` page par jao, ye dikhega.

## Agla step (Step 4 — abhi nahi banaya)
Teacher upload panel: lecture upload karna (video file + title + subject + chapter).
Jab ye teyar ho jaye to bologe, main wo banata hun.

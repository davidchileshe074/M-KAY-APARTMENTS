// Firebase client initializer for the browser.
// Uses the provided config directly, but still allows a window override.

import { initializeApp } from "https://www.gstatic.com/firebasejs/12.14.0/firebase-app.js";
import {
  getFirestore,
  doc,
  getDoc,
  setDoc,
  onSnapshot,
  collection,
  addDoc,
  query,
  orderBy,
  getDocs,
  updateDoc,
  deleteDoc,
  where
} from "https://www.gstatic.com/firebasejs/12.14.0/firebase-firestore.js";
import {
  getAuth,
  setPersistence,
  browserLocalPersistence,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/12.14.0/firebase-auth.js";
import {
  Client as AppwriteClient,
  Storage as AppwriteStorage,
  ID as AppwriteID,
  Permission as AppwritePermission,
  Role as AppwriteRole
} from "https://cdn.jsdelivr.net/npm/appwrite/+esm";

const defaultFirebaseConfig = {
  apiKey: "AIzaSyByQe6-IezB79mWVet-EuQM3V2AXDPsSeE",
  authDomain: "mk-properties-dfd7d.firebaseapp.com",
  projectId: "mk-properties-dfd7d",
  storageBucket: "mk-properties-dfd7d.firebasestorage.app",
  messagingSenderId: "936137337312",
  appId: "1:936137337312:web:10df57a5134737190ee385"
};

const defaultAppwriteConfig = {
  endpoint: "https://fra.cloud.appwrite.io/v1",
  projectId: "6a20cda300168b3b27d8",
  bucketId: "6a20ce370028248840f7"
};

async function initFirebase() {
  const firebaseConfig = window.FIREBASE_CONFIG || defaultFirebaseConfig;
  const appwriteConfig = window.APPWRITE_CONFIG || defaultAppwriteConfig;
  window.FIREBASE_CONFIG = firebaseConfig;
  window.APPWRITE_CONFIG = appwriteConfig;
  window.firebaseInitStatus = "initializing";
  window.firebaseInitError = "";
  window.appwriteStorageStatus = "initializing";
  window.appwriteStorageError = "";

  try {
    const app = initializeApp(firebaseConfig);
    const db = getFirestore(app);
    const auth = getAuth(app);
    let appwriteStorage = null;

    function buildAppwriteFileUrl(kind, fileId) {
      const endpoint = String(appwriteConfig.endpoint || "").replace(/\/+$/, "");
      const bucketId = String(appwriteConfig.bucketId || "");
      const action = kind === "preview" ? "preview" : "view";
      return `${endpoint}/storage/buckets/${encodeURIComponent(bucketId)}/files/${encodeURIComponent(fileId)}/${action}?project=${encodeURIComponent(appwriteConfig.projectId)}`;
    }

    try {
      const appwriteClient = new AppwriteClient()
        .setEndpoint(appwriteConfig.endpoint)
        .setProject(appwriteConfig.projectId);
      appwriteStorage = new AppwriteStorage(appwriteClient);
      window.appwriteStorageStatus = "ready";
    } catch (appwriteErr) {
      console.error("firebase-init: Appwrite initialization error", appwriteErr);
      window.appwriteStorageStatus = "error";
      window.appwriteStorageError = appwriteErr?.message || "Appwrite storage initialization failed.";
    }

    await setPersistence(auth, browserLocalPersistence);

    const stateDoc = doc(db, "cms", "state");
    const bookingsCol = collection(db, "bookings");
    const pricingCol = collection(db, "pricing");
    const blockedDatesCol = collection(db, "blockedDates");
    const galleryCol = collection(db, "gallery");

    const firebaseApi = {
      auth,
      db,

      // ── CMS STATE ──────────────────────────────────────────────────────────
      subscribeToState(callback) {
        return onSnapshot(stateDoc, snap => {
          callback(snap.exists() ? snap.data() : null);
        });
      },
      async getState() {
        const snap = await getDoc(stateDoc);
        return snap.exists() ? snap.data() : null;
      },
      async saveState(state) {
        await setDoc(stateDoc, state, { merge: true });
      },

      // ── BOOKINGS ────────────────────────────────────────────────────────────
      async addBooking(booking) {
        const payload = { ...booking, createdAt: new Date().toISOString(), status: booking.status || "new" };
        const refDoc = await addDoc(bookingsCol, payload);
        return { id: refDoc.id, ...payload };
      },
      async fetchBookings() {
        const q = query(bookingsCol, orderBy("createdAt", "desc"));
        const snap = await getDocs(q);
        return snap.docs.map(d => ({ id: d.id, ...d.data() }));
      },
      subscribeBookings(callback) {
        const q = query(bookingsCol, orderBy("createdAt", "desc"));
        return onSnapshot(q, snap => {
          callback(snap.docs.map(d => ({ id: d.id, ...d.data() })));
        });
      },
      async updateBookingStatus(id, status) {
        const bookingRef = doc(db, "bookings", id);
        await updateDoc(bookingRef, { status, updatedAt: new Date().toISOString() });
        return true;
      },

      // ── PRICING ─────────────────────────────────────────────────────────────
      async getPricing() {
        const q = query(pricingCol, orderBy("year", "asc"));
        const snap = await getDocs(q);
        return snap.docs.map(d => ({ id: d.id, ...d.data() }));
      },
      async savePricingRecord(record) {
        if (record.id) {
          const ref = doc(db, "pricing", record.id);
          const { id, ...data } = record;
          await setDoc(ref, { ...data, updatedAt: new Date().toISOString() }, { merge: true });
          return record.id;
        } else {
          const ref = await addDoc(pricingCol, { ...record, createdAt: new Date().toISOString() });
          return ref.id;
        }
      },
      async deletePricingRecord(id) {
        await deleteDoc(doc(db, "pricing", id));
      },
      subscribePricing(callback) {
        const q = query(pricingCol, orderBy("year", "asc"));
        return onSnapshot(q, snap => {
          callback(snap.docs.map(d => ({ id: d.id, ...d.data() })));
        });
      },

      // ── BLOCKED DATES ───────────────────────────────────────────────────────
      async getBlockedDates(apartmentId) {
        let q;
        if (apartmentId) {
          q = query(blockedDatesCol, where("apartmentId", "==", apartmentId));
        } else {
          q = query(blockedDatesCol);
        }
        const snap = await getDocs(q);
        return snap.docs.map(d => ({ id: d.id, ...d.data() }));
      },
      async addBlockedDate(data) {
        const ref = await addDoc(blockedDatesCol, { ...data, createdAt: new Date().toISOString() });
        return { id: ref.id, ...data };
      },
      async deleteBlockedDate(id) {
        await deleteDoc(doc(db, "blockedDates", id));
      },
      subscribeBlockedDates(callback) {
        return onSnapshot(blockedDatesCol, snap => {
          callback(snap.docs.map(d => ({ id: d.id, ...d.data() })));
        });
      },

      // ── GALLERY ──────────────────────────────────────────────────────────────
      async getGallery(apartmentId) {
        let q;
        if (apartmentId) {
          q = query(galleryCol, where("apartmentId", "==", apartmentId), orderBy("uploadedAt", "desc"));
        } else {
          q = query(galleryCol, orderBy("uploadedAt", "desc"));
        }
        const snap = await getDocs(q);
        return snap.docs.map(d => ({ id: d.id, ...d.data() }));
      },
      async addGalleryImage(data) {
        const payload = { ...data, uploadedAt: new Date().toISOString(), featured: data.featured || false };
        const ref = await addDoc(galleryCol, payload);
        return { id: ref.id, ...payload };
      },
      async updateGalleryImage(id, data) {
        await updateDoc(doc(db, "gallery", id), { ...data, updatedAt: new Date().toISOString() });
      },
      async deleteGalleryImage(id) {
        await deleteDoc(doc(db, "gallery", id));
      },
      async setFeaturedImage(apartmentId, imageId) {
        // Unset all featured for this apartment, then set the chosen one
        const all = await this.getGallery(apartmentId);
        const updates = all.map(img => updateDoc(doc(db, "gallery", img.id), { featured: img.id === imageId }));
        await Promise.all(updates);
      },
      subscribeGallery(callback) {
        const q = query(galleryCol, orderBy("uploadedAt", "desc"));
        return onSnapshot(q, snap => {
          callback(snap.docs.map(d => ({ id: d.id, ...d.data() })));
        });
      },

      // ── AUTH ─────────────────────────────────────────────────────────────────
      async signInAdmin(email, password) {
        const credentials = await signInWithEmailAndPassword(auth, email, password);
        return credentials.user;
      },
      async signOutAdmin() {
        await signOut(auth);
      },
      onAuthChange(callback) {
        return onAuthStateChanged(auth, user => callback(user || null));
      },
      getCurrentUser() {
        return auth.currentUser;
      },

      // ── MEDIA UPLOAD (Appwrite) ───────────────────────────────────────────────
      async uploadMedia(file, folder = "uploads") {
        if (!appwriteStorage || !appwriteConfig.bucketId) {
          throw new Error(window.appwriteStorageError || "Appwrite storage is not ready.");
        }
        const safeName = String(file?.name || "image").replace(/[^a-zA-Z0-9._-]/g, "_");
        const created = await appwriteStorage.createFile({
          bucketId: appwriteConfig.bucketId,
          fileId: AppwriteID.unique(),
          file,
          permissions: [AppwritePermission.read(AppwriteRole.any())]
        });
        const url = buildAppwriteFileUrl(file?.type?.startsWith("image/") ? "preview" : "view", created.$id);
        return {
          url,
          path: `${folder}/${safeName}`,
          fileId: created.$id
        };
      }
    };

    window.firebaseApi = firebaseApi;
    window.firebaseInitStatus = "ready";
    console.log("firebase-init: Firestore, Auth, and Storage initialized");
    return firebaseApi;
  } catch (err) {
    console.error("firebase-init: Error initializing Firebase", err);
    window.firebaseInitStatus = "error";
    window.firebaseInitError = err?.message || "Firebase initialization failed.";
    window.firebaseApi = null;
    return null;
  }
}

window.firebaseApiReady = initFirebase().catch(err => {
  window.firebaseInitStatus = "error";
  window.firebaseInitError = err?.message || "Firebase initialization failed.";
  window.firebaseApi = null;
  return null;
});

// Import fungsi SDK Firebase secara modular dari CDN
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import { 
  getAuth, 
  signInWithEmailAndPassword, 
  signOut, 
  onAuthStateChanged,
  createUserWithEmailAndPassword 
} from "https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js";
import { 
  getFirestore, 
  doc, 
  getDoc, 
  setDoc, 
  updateDoc,
  deleteDoc,
  collection, 
  getDocs, 
  serverTimestamp 
} from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";

// ==========================================================================
// 1. KONFIGURASI FIREBASE PROJECT
// ==========================================================================
const firebaseConfig = {
  apiKey: "AIzaSyB9V_aLgULcZdUmbfnVUAeVPw5OHDtomMI",
  authDomain: "wargapotrobayan.firebaseapp.com",
  projectId: "wargapotrobayan",
  storageBucket: "wargapotrobayan.firebasestorage.app",
  messagingSenderId: "961626612898",
  appId: "1:961626612898:web:83963bcb842c5dfe6563fb",
  measurementId: "G-TESED2K6PJ"
};

// Inisialisasi Firebase App, Auth, dan Firestore
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);

// ==========================================================================
// 2. FUNGSI AUTENTIKASI (LOGIN & LOGOUT)
// ==========================================================================
export async function loginUser(email, password) {
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    return { success: true, user: userCredential.user };
  } catch (error) {
    console.error("Gagal Login:", error.message);
    return { success: false, error: error.message };
  }
}

export async function logoutUser() {
  try {
    await signOut(auth);
    return { success: true };
  } catch (error) {
    console.error("Gagal Logout:", error.message);
    return { success: false, error: error.message };
  }
}

// ==========================================================================
// 3. FUNGSI FIRESTORE (USER & ROLE)
// ==========================================================================
export async function getUserData(uid) {
  try {
    const userDocRef = doc(db, "users", uid);
    const userDoc = await getDoc(userDocRef);
    if (userDoc.exists()) {
      return userDoc.data();
    }
    return null;
  } catch (error) {
    console.error("Gagal mengambil data user:", error);
    return null;
  }
}

export async function getAllUsers() {
  try {
    const querySnapshot = await getDocs(collection(db, "users"));
    const usersList = [];
    querySnapshot.forEach((docSnap) => {
      usersList.push({ id: docSnap.id, ...docSnap.data() });
    });
    return { success: true, data: usersList };
  } catch (error) {
    console.error("Gagal mengambil daftar warga:", error);
    return { success: false, error: error.message };
  }
}

// FUNGSI BUAT AKUN LOGIN BARU OLEH ADMIN
export async function createUserByAdmin(userData) {
  try {
    const secondaryApp = initializeApp(firebaseConfig, "SecondaryAppInstance");
    const secondaryAuth = getAuth(secondaryApp);

    const userCredential = await createUserWithEmailAndPassword(
      secondaryAuth, 
      userData.email, 
      userData.password
    );
    const newUid = userCredential.user.uid;

    await setDoc(doc(db, "users", newUid), {
      nama: userData.nama,
      email: userData.email,
      role: userData.role || "warga",
      createdAt: serverTimestamp()
    });

    await signOut(secondaryAuth);
    return { success: true };
  } catch (error) {
    console.error("Gagal membuat user:", error);
    let errorMsg = "Gagal membuat akun.";
    if (error.code === 'auth/email-already-in-use') {
      errorMsg = "Email ini sudah terdaftar.";
    } else if (error.code === 'auth/weak-password') {
      errorMsg = "Kata sandi terlalu lemah (min. 6 karakter).";
    }
    return { success: false, error: errorMsg };
  }
}

// FUNGSI UPDATE DATA USER OLEH ADMIN
export async function updateUserByAdmin(uid, updateData) {
  try {
    const userRef = doc(db, "users", uid);
    await updateDoc(userRef, {
      nama: updateData.nama,
      role: updateData.role,
      updatedAt: serverTimestamp()
    });
    return { success: true };
  } catch (error) {
    console.error("Gagal memperbarui user:", error);
    return { success: false, error: error.message };
  }
}

// FUNGSI HAPUS USER DARI FIRESTORE OLEH ADMIN
export async function deleteUserByAdmin(uid) {
  try {
    await deleteDoc(doc(db, "users", uid));
    return { success: true };
  } catch (error) {
    console.error("Gagal menghapus user:", error);
    return { success: false, error: error.message };
  }
}

// ==========================================================================
// 4. PEMANTAU STATUS AUTENTIKASI (AUTO-CREATE PROFIL JIKA BELUM TERDAFTAR)
// ==========================================================================
export function monitorAuthState(callback) {
  onAuthStateChanged(auth, async (user) => {
    if (user) {
      let userData = await getUserData(user.uid);
      
      // Jika user terdaftar di Firebase Auth tapi belum punya dokumen profil di Firestore
      if (!userData) {
        const defaultData = {
          nama: user.displayName || user.email.split('@')[0],
          email: user.email,
          role: "admin", // Otomatis dijadikan admin agar tidak terkunci
          createdAt: serverTimestamp()
        };
        
        await setDoc(doc(db, "users", user.uid), defaultData);
        userData = defaultData;
      }

      const userRole = (userData && userData.role) ? userData.role.toLowerCase() : 'warga';
      const isAdmin = userRole === 'admin' || userRole === 'pengurus';
      
      callback(user, isAdmin, userData);
    } else {
      callback(null, false, null);
    }
  });
}
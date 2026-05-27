import { initializeApp } from 'firebase/app';
import { 
  getAuth, 
  GoogleAuthProvider, 
  signInWithPopup, 
  signInWithRedirect,
  getRedirectResult,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut as firebaseSignOut,
  onAuthStateChanged,
  updateProfile,
  User 
} from 'firebase/auth';
import { getFirestore, doc, getDocFromServer, collection, addDoc, updateDoc, deleteDoc, getDoc, setDoc, getDocs, onSnapshot, query, where, orderBy, limit, serverTimestamp, Timestamp } from 'firebase/firestore';
import firebaseConfig from '../../firebase-applet-config.json';

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app, firebaseConfig.firestoreDatabaseId); 
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();

export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

export interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
    tenantId?: string | null;
    providerInfo?: {
      providerId?: string | null;
      email?: string | null;
    }[];
  }
}

export function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous,
      tenantId: auth.currentUser?.tenantId,
      providerInfo: auth.currentUser?.providerData?.map(provider => ({
        providerId: provider.providerId,
        email: provider.email,
      })) || []
    },
    operationType,
    path
  }
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

let isSigningIn = false;

export async function handleRedirectResult() {
  try {
    const result = await getRedirectResult(auth);
    if (result) {
      await ensureUserStats(result.user);
      return result.user;
    }
  } catch (error) {
    console.error("Redirect Auth Error:", error);
  }
  return null;
}

export async function signIn(useRedirect = false) {
  if (isSigningIn) return;
  isSigningIn = true;
  try {
    if (useRedirect) {
      await signInWithRedirect(auth, googleProvider);
      return; 
    }
    const result = await signInWithPopup(auth, googleProvider);
    // Ensure user record exists
    await ensureUserStats(result.user);
    return result.user;
  } catch (error: any) {
    console.error("Authentication Error:", error);
    const isPopupBlocked = error?.code === 'auth/popup-blocked' || 
                          error?.message?.includes('popup-blocked') ||
                          error?.code === 'auth/cancelled-popup-request';

    if (isPopupBlocked) {
      throw new Error('SIGN_IN_POPUP_BLOCKED');
    }
    
    if (error?.code === 'auth/unauthorized-domain') {
      throw new Error('This domain is not authorized for Google Sign-In. Please check your Firebase project settings.');
    }
    
    if (error?.message?.includes('Pending promise')) {
      // Ignore these internal/redundant errors
      return;
    }
    throw error;
  } finally {
    isSigningIn = false;
  }
}

export async function ensureUserStats(user: User) {
  const userDocRef = doc(db, 'users', user.uid);
  try {
    const userDoc = await getDoc(userDocRef);
    if (!userDoc.exists()) {
      await setDoc(userDocRef, {
        userId: user.uid,
        totalSessions: 0,
        averageScore: 0,
        streak: 1,
        maxStreak: 1,
        xp: 0,
        questionsSolved: 0,
        lastActive: serverTimestamp()
      });
    }
  } catch (error) {
    console.warn("Failed to ensure user stats record:", error);
  }
}

export const signOut = async () => {
  try {
    const { scopedStorage } = await import('./storageUtils');
    scopedStorage.clearGuestData();
  } catch (error) {
    console.warn("Failed to clear guest storage data on sign out:", error);
  }
  
  // Clear any legacy/general cookies to avoid leakage
  try {
    const { eraseCookie } = await import('./cookieUtils');
    const cookiesToErase = [
      'pz_target_company',
      'pz_target_role',
      'pz_rb_phase',
      'pz_rb_company',
      'pz_rb_role',
      'pz_rb_filename',
      'pz_cp_company',
      'pz_cp_role'
    ];
    cookiesToErase.forEach(name => eraseCookie(name));
  } catch (error) {
    console.warn("Failed to clear cookies on sign out:", error);
  }

  return firebaseSignOut(auth);
};

export async function updateXp(points: number, solveCount: number = 0) {
  // Re-exporting from dbService logic or keeping it here as a wrapper
  if (!auth.currentUser) return;
  const { dbService } = await import('../services/dbService');
  return dbService.incrementStats(auth.currentUser.uid, points, solveCount);
}

export const signUpWithEmail = (email: string, pass: string) => createUserWithEmailAndPassword(auth, email, pass);
export const signInWithEmail = (email: string, pass: string) => signInWithEmailAndPassword(auth, email, pass);

export const updateUserProfile = (name: string) => {
  if (auth.currentUser) {
    return updateProfile(auth.currentUser, { displayName: name });
  }
  return Promise.reject('No user logged in');
};

export { onAuthStateChanged };

async function testConnection() {
  try {
    // Basic connectivity check - use a dummy doc that doesn't need to exist
    // but tests if we can reach the server.
    await getDocFromServer(doc(db, 'system', 'ping'));
  } catch (error: any) {
    // If it's permission denied, it's actually "connected" but rules blocked it (expected if not logged in)
    // If it's truly offline or config is wrong, it will say "the client is offline" or similar
    if (error?.message?.includes('the client is offline')) {
      console.warn("Firestore: Client appears to be offline or config is invalid.");
    }
    // We swallow other errors to avoid distracting the user with "permission denied" on a ping test
  }
}

testConnection();

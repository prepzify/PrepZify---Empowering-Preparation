import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore, doc, getDocFromServer, runTransaction, increment, serverTimestamp } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';
import firebaseConfig from '../../firebase-applet-config.json';

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app, firebaseConfig.firestoreDatabaseId);
export const storage = getStorage(app);

export async function updateUserStats(userId: string, pointsEarned: number, solvedNewProblem?: boolean) {
  const userRef = doc(db, 'users', userId);
  try {
    await runTransaction(db, async (transaction) => {
      const userDoc = await transaction.get(userRef);
      if (!userDoc.exists()) return;

      const updates: any = {
        'stats.points': increment(pointsEarned),
        'updatedAt': serverTimestamp()
      };

      if (solvedNewProblem) {
        updates['stats.problemsSolved'] = increment(1);
      }

      transaction.update(userRef, updates);
    });
  } catch (error) {
    console.error("Failed to update user stats:", error);
  }
}

async function testConnection() {
  console.log("Starting Firebase connection test with project:", firebaseConfig.projectId);
  console.log("Database ID:", firebaseConfig.firestoreDatabaseId);
  try {
    // Attempt a simple read to check connectivity
    await getDocFromServer(doc(db, 'test', 'connection'));
    console.log("Firebase connection reachable (test doc read attempted)");
  } catch (error: any) {
    if (error.code === 'permission-denied') {
      console.log("Firebase connected successfully (received Permission Denied, which is expected for test doc)");
    } else if (error.code === 'unavailable') {
       console.error("Firebase is UNAVAILABLE. This often means the project ID or Database ID is incorrect, or network is blocked.");
       console.error("Details:", error.message);
    } else {
      console.error("Firebase connection test failed with unexpected error:", error);
    }
  }
}
testConnection();

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

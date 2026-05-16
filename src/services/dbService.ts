import { db, auth, handleFirestoreError, OperationType } from '../lib/firebase';
import { 
  doc, 
  setDoc, 
  getDoc, 
  getDocFromServer,
  getDocsFromServer,
  collection, 
  query, 
  where, 
  getDocs, 
  orderBy, 
  limit, 
  serverTimestamp,
  updateDoc,
  onSnapshot
} from 'firebase/firestore';

const tryGetDoc = async (docRef: any) => {
  try {
    return await getDoc(docRef);
  } catch (error: any) {
    if (error?.message?.includes('the client is offline')) {
      console.warn("Firestore offline, attempting to force server fetch...");
      return await getDocFromServer(docRef);
    }
    throw error;
  }
};

const tryGetDocs = async (q: any) => {
  try {
    return await getDocs(q);
  } catch (error: any) {
    if (error?.message?.includes('the client is offline')) {
      console.warn("Firestore offline, attempting to force server query...");
      return await getDocsFromServer(q);
    }
    throw error;
  }
};

export const dbService = {
  // Resume Analysis
  async saveResumeAnalysis(userId: string, data: any) {
    const path = `users/${userId}/resumes/current`;
    try {
      await setDoc(doc(db, path), {
        ...data,
        timestamp: serverTimestamp()
      });
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, path);
    }
  },

  async getResumeAnalysis(userId: string) {
    const path = `users/${userId}/resumes/current`;
    try {
      const snap = await tryGetDoc(doc(db, path));
      return snap.exists() ? snap.data() as any : null;
    } catch (error) {
      handleFirestoreError(error, OperationType.GET, path);
    }
  },

  // Study Paths
  async saveStudyPath(userId: string, pathData: any) {
    const path = `users/${userId}/studyPaths/${pathData.id || 'current'}`;
    try {
      await setDoc(doc(db, path), {
        ...pathData,
        timestamp: serverTimestamp()
      });
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, path);
    }
  },

  async getStudyPaths(userId: string) {
    const path = `users/${userId}/studyPaths`;
    try {
      const q = query(collection(db, path), orderBy('timestamp', 'desc'));
      const snap = await tryGetDocs(q);
      return snap.docs.map(doc => ({ id: doc.id, ...doc.data() as any }));
    } catch (error) {
      handleFirestoreError(error, OperationType.LIST, path);
    }
  },

  // User Stats (Progress, XP, Questions Solved)
  async updateUserStats(userId: string, stats: any) {
    const path = `users/${userId}`;
    try {
      await updateDoc(doc(db, path), {
        ...stats,
        lastActive: serverTimestamp()
      });
    } catch (error) {
       // If update fails because doc doesn't exist, use setDoc
       try {
         await setDoc(doc(db, path), {
           ...stats,
           userId,
           lastActive: serverTimestamp()
         }, { merge: true });
       } catch (innerError) {
         handleFirestoreError(innerError, OperationType.WRITE, path);
       }
    }
  },

  async getUserStats(userId: string) {
    const path = `users/${userId}`;
    try {
      const snap = await tryGetDoc(doc(db, path));
      return snap.exists() ? snap.data() as any : null;
    } catch (error) {
      handleFirestoreError(error, OperationType.GET, path);
    }
  },

  async incrementStats(userId: string, points: number, solveCount: number = 0) {
    const path = `users/${userId}`;
    const userRef = doc(db, path);
    try {
      const snap = await tryGetDoc(userRef);
      if (snap.exists()) {
        const data: any = snap.data();
        await updateDoc(userRef, {
          xp: (data.xp || 0) + points,
          questionsSolved: (data.questionsSolved || 0) + solveCount,
          lastActive: serverTimestamp()
        });
      } else {
        await setDoc(userRef, {
          userId,
          xp: points,
          questionsSolved: solveCount,
          totalSessions: 1,
          streak: 1,
          lastActive: serverTimestamp()
        });
      }
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, path);
    }
  },

  async getGlobalRanking(userId: string) {
    const path = 'users';
    try {
      const q = query(collection(db, path), orderBy('xp', 'desc'));
      const snap = await tryGetDocs(q);
      const allUsers = snap.docs.map(d => ({ id: d.id, ...d.data() as any }));
      const rankIndex = allUsers.findIndex(u => u.id === userId);
      return {
        rank: rankIndex >= 0 ? rankIndex + 1 : allUsers.length + 1,
        total: Math.max(allUsers.length, 1)
      };
    } catch (error) {
      handleFirestoreError(error, OperationType.LIST, path);
    }
  },

  onStatsUpdate(userId: string, callback: (stats: any) => void) {
    const path = `users/${userId}`;
    return onSnapshot(doc(db, path), (doc) => {
      if (doc.exists()) {
        callback(doc.data());
      }
    }, (error) => {
      console.error("Stats listener error:", error);
    });
  },

  // Applied Jobs
  async applyToJob(userId: string, job: any) {
    const path = `users/${userId}/appliedJobs/${job.id}`;
    try {
      await setDoc(doc(db, path), {
        ...job,
        status: 'applied',
        appliedAt: serverTimestamp()
      });
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, path);
    }
  },

  async getAppliedJobs(userId: string) {
    const path = `users/${userId}/appliedJobs`;
    try {
      const q = query(collection(db, path), orderBy('appliedAt', 'desc'));
      const snap = await tryGetDocs(q);
      return snap.docs.map(doc => ({ id: doc.id, ...doc.data() as any }));
    } catch (error) {
      handleFirestoreError(error, OperationType.LIST, path);
    }
  },

  async getInterviewCount(userId: string) {
    const path = 'interviews';
    try {
      const q = query(collection(db, path), where('userId', '==', userId));
      const snap = await tryGetDocs(q);
      return snap.size;
    } catch (error) {
      handleFirestoreError(error, OperationType.LIST, path);
    }
  }
};

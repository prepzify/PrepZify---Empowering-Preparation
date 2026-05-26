import { db, handleFirestoreError, OperationType } from '../lib/firebase';
import { collection, getDocs, limit, query, writeBatch, doc } from 'firebase/firestore';
import { SEED_QUESTIONS } from '../data/questionsSeed';

export interface Question {
  id?: string;
  type: 'aptitude' | 'coding';
  question: string;
  options: string[];
  correctAnswer: number;
  explanation: string;
}

export const questionsService = {
  async getQuestions(count: number = 20): Promise<Question[]> {
    try {
      const q = query(collection(db, 'questions'), limit(500));
      const snapshot = await getDocs(q);
      
      let allQuestions: Question[] = snapshot.docs.map(snap => ({
        id: snap.id,
        ...snap.data()
      })) as Question[];

      // If empty or very low, return seed as fallback
      if (allQuestions.length < count) {
        return this.getRandomQuestions(SEED_QUESTIONS as Question[], count);
      }

      return this.getRandomQuestions(allQuestions, count);
    } catch (error) {
       // Falling back to seed if network fails or rules block (during dev)
       console.warn('Questions fetch failed, using fallback seed data', error);
       return this.getRandomQuestions(SEED_QUESTIONS as Question[], count);
    }
  },

  getRandomQuestions(questions: Question[], count: number): Question[] {
    // Fisher-Yates shuffle for better randomness
    const shuffled = [...questions];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled.slice(0, Math.min(count, shuffled.length));
  },

  async seedQuestions() {
    try {
       // Get existing questions to avoid duplicates
       const snapshot = await getDocs(query(collection(db, 'questions'), limit(1000)));
       const existingTexts = new Set(snapshot.docs.map(d => d.data().question));
       
       const questionsToSeed = SEED_QUESTIONS.filter(q => !existingTexts.has(q.question));
       
       if (questionsToSeed.length === 0) {
         console.log('Database already synchronized with seed data.');
         return;
       }

       console.log(`Seeding ${questionsToSeed.length} new questions...`);
       
       // Handle batch size limit (500)
       const chunks = [];
       for (let i = 0; i < questionsToSeed.length; i += 400) {
         chunks.push(questionsToSeed.slice(i, i + 400));
       }

       for (const chunk of chunks) {
         const batch = writeBatch(db);
         chunk.forEach((q) => {
           const newDocRef = doc(collection(db, 'questions'));
           batch.set(newDocRef, q);
         });
         await batch.commit();
       }
       
       console.log(`Successfully seeded ${questionsToSeed.length} new questions into Firestore`);
    } catch (error) {
       console.error('Seeding failed:', error);
    }
  }
};

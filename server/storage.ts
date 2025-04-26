import { 
  users, type User, type InsertUser, 
  userProgress, type InsertUser as InsertUserProgress,
  dictionaryEntries, type DictionaryEntry, type InsertDictionaryEntry, 
  learningSentences, type LearningSentence, type InsertLearningSentence,
  exercises, type Exercise, type InsertExercise,
  exerciseAttempts, type ExerciseAttempt, type InsertExerciseAttempt,
  importJobs, type ImportJob, type InsertImportJob, 
  systemLogs, type SystemLog,
  curriculumTracks, type CurriculumTrack, type InsertCurriculumTrack,
  lessons, type Lesson, type InsertLesson,
  lessonSentences, type LessonSentence, type InsertLessonSentence,
  userLessonProgress, type UserLessonProgress, type InsertUserLessonProgress
} from "@shared/schema";
import { db, logSystemEvent } from "./db";
import { eq, and, or, like, desc, sql, asc, inArray } from "drizzle-orm";

// Extending the interface with learning app methods
export interface IStorage {
  // User methods
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(id: number, updates: Partial<User>): Promise<User | undefined>;
  getUserProgress(userId: number): Promise<any>;
  updateUserProgress(userId: number, updates: any): Promise<any>;
  
  // Dictionary methods
  getDictionaryEntry(id: number): Promise<DictionaryEntry | undefined>;
  getDictionaryEntries(page: number, limit: number, filter?: string): Promise<{ entries: DictionaryEntry[], total: number }>;
  searchDictionary(term: string, sourceLang: string, targetLang: string): Promise<DictionaryEntry[]>;
  createDictionaryEntry(entry: InsertDictionaryEntry): Promise<DictionaryEntry>;
  createManyDictionaryEntries(entries: InsertDictionaryEntry[]): Promise<number>;
  updateDictionaryEntry(id: number, entry: Partial<InsertDictionaryEntry>): Promise<DictionaryEntry | undefined>;
  deleteDictionaryEntry(id: number): Promise<boolean>;
  deleteAllDictionaryEntries(): Promise<number>;
  countDictionaryEntries(): Promise<{ total: number, enToEs: number, esToEn: number }>;
  
  // Learning sentences methods
  createLearningSentence(sentence: InsertLearningSentence): Promise<LearningSentence>;
  getLearningSentence(id: number): Promise<LearningSentence | undefined>;
  getLearningSentences(
    page: number, 
    limit: number, 
    filter?: { difficulty?: string, topic?: string, grammarFocus?: string }
  ): Promise<{ sentences: LearningSentence[], total: number }>;
  updateLearningSentence(id: number, updates: Partial<LearningSentence>): Promise<LearningSentence | undefined>;
  deleteLearningSentence(id: number): Promise<boolean>;
  
  // Exercises methods
  createExercise(exercise: InsertExercise): Promise<Exercise>;
  getExercise(id: number): Promise<Exercise | undefined>;
  getExercises(
    page: number, 
    limit: number, 
    filter?: { type?: string, difficulty?: string, sentenceId?: number }
  ): Promise<{ exercises: Exercise[], total: number }>;
  updateExercise(id: number, updates: Partial<Exercise>): Promise<Exercise | undefined>;
  deleteExercise(id: number): Promise<boolean>;
  
  // Exercise attempts methods
  createExerciseAttempt(attempt: InsertExerciseAttempt): Promise<ExerciseAttempt>;
  getUserExerciseAttempts(userId: number, limit?: number): Promise<ExerciseAttempt[]>;
  
  // Import job methods
  createImportJob(job: InsertImportJob): Promise<ImportJob>;
  getImportJob(id: number): Promise<ImportJob | undefined>;
  updateImportJob(id: number, updates: Partial<ImportJob>): Promise<ImportJob | undefined>;
  getLatestImportJob(): Promise<ImportJob | undefined>;
  
  // System log methods
  getSystemLogs(limit: number): Promise<SystemLog[]>;
  
  // Curriculum track methods
  getCurriculumTracks(): Promise<CurriculumTrack[]>;
  getCurriculumTrack(id: number): Promise<CurriculumTrack | undefined>;
  getCurriculumTrackByCode(code: string): Promise<CurriculumTrack | undefined>;
  createCurriculumTrack(track: InsertCurriculumTrack): Promise<CurriculumTrack>;
  updateCurriculumTrack(id: number, updates: Partial<CurriculumTrack>): Promise<CurriculumTrack | undefined>;
  
  // Lesson methods
  getLessons(trackId: number): Promise<Lesson[]>;
  getLesson(id: number): Promise<Lesson | undefined>;
  getLessonByTrackAndNumber(trackId: number, lessonNumber: number): Promise<Lesson | undefined>;
  createLesson(lesson: InsertLesson): Promise<Lesson>;
  updateLesson(id: number, updates: Partial<Lesson>): Promise<Lesson | undefined>;
  
  // Lesson sentences methods
  addSentenceToLesson(lessonId: number, sentenceId: number, orderIndex: number): Promise<LessonSentence>;
  getLessonSentences(lessonId: number): Promise<{ sentence: LearningSentence, order: number }[]>;
  reorderLessonSentence(id: number, newOrderIndex: number): Promise<LessonSentence | undefined>;
  removeSentenceFromLesson(lessonId: number, sentenceId: number): Promise<boolean>;
  
  // User lesson progress methods
  getUserLessonProgress(userId: number, lessonId: number): Promise<UserLessonProgress | undefined>;
  updateUserLessonProgress(userId: number, lessonId: number, progress: number, completed?: boolean): Promise<UserLessonProgress>;
  getUserCompletedLessons(userId: number, trackId?: number): Promise<number[]>;
}

export class DatabaseStorage implements IStorage {
  // User methods
  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user || undefined;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user || undefined;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(insertUser)
      .returning();
    
    await logSystemEvent('info', `User created: ${insertUser.username}`);
    return user;
  }
  
  async updateUser(id: number, updates: Partial<User>): Promise<User | undefined> {
    const [updatedUser] = await db
      .update(users)
      .set(updates)
      .where(eq(users.id, id))
      .returning();
      
    return updatedUser;
  }
  
  async getUserProgress(userId: number): Promise<any> {
    const [progress] = await db
      .select()
      .from(userProgress)
      .where(eq(userProgress.userId, userId));
      
    if (!progress) {
      // Create initial progress record if not exists
      return this.updateUserProgress(userId, {
        wordsLearned: 0,
        lessonsCompleted: 0,
        averageScore: 0,
        strengths: [],
        weaknesses: []
      });
    }
    
    return progress;
  }
  
  async updateUserProgress(userId: number, updates: any): Promise<any> {
    // Check if progress record exists
    const [existingProgress] = await db
      .select()
      .from(userProgress)
      .where(eq(userProgress.userId, userId));
      
    if (existingProgress) {
      // Update existing progress
      const [updated] = await db
        .update(userProgress)
        .set(updates)
        .where(eq(userProgress.userId, userId))
        .returning();
        
      return updated;
    } else {
      // Create new progress record
      const [created] = await db
        .insert(userProgress)
        .values({
          userId,
          ...updates,
          lastActive: new Date()
        })
        .returning();
        
      return created;
    }
  }

  // Dictionary methods
  async getDictionaryEntry(id: number): Promise<DictionaryEntry | undefined> {
    const [entry] = await db.select().from(dictionaryEntries).where(eq(dictionaryEntries.id, id));
    return entry || undefined;
  }

  async getDictionaryEntries(page: number = 1, limit: number = 10, filter?: string): Promise<{ entries: DictionaryEntry[], total: number }> {
    const offset = (page - 1) * limit;
    
    let query = db.select().from(dictionaryEntries);
    
    if (filter) {
      if (filter === 'en-es') {
        query = query.where(and(eq(dictionaryEntries.sourceLanguage, 'en'), eq(dictionaryEntries.targetLanguage, 'es')));
      } else if (filter === 'es-en') {
        query = query.where(and(eq(dictionaryEntries.sourceLanguage, 'es'), eq(dictionaryEntries.targetLanguage, 'en')));
      }
    }
    
    const entries = await query.limit(limit).offset(offset).orderBy(dictionaryEntries.id);
    
    const [{ count }] = await db
      .select({ count: sql<number>`count(*)` })
      .from(dictionaryEntries)
      .where(filter ? 
        filter === 'en-es' ? 
          and(eq(dictionaryEntries.sourceLanguage, 'en'), eq(dictionaryEntries.targetLanguage, 'es')) : 
          and(eq(dictionaryEntries.sourceLanguage, 'es'), eq(dictionaryEntries.targetLanguage, 'en')) 
        : sql`1=1`);
      
    return { entries, total: count };
  }

  async searchDictionary(term: string, sourceLang: string, targetLang: string): Promise<DictionaryEntry[]> {
    return await db
      .select()
      .from(dictionaryEntries)
      .where(
        and(
          eq(dictionaryEntries.sourceLanguage, sourceLang),
          eq(dictionaryEntries.targetLanguage, targetLang),
          like(dictionaryEntries.sourceWord, `%${term}%`)
        )
      )
      .limit(20);
  }

  async createDictionaryEntry(entry: InsertDictionaryEntry): Promise<DictionaryEntry> {
    const [result] = await db
      .insert(dictionaryEntries)
      .values(entry)
      .returning();
    return result;
  }

  async createManyDictionaryEntries(entries: InsertDictionaryEntry[]): Promise<number> {
    if (entries.length === 0) return 0;
    
    const result = await db
      .insert(dictionaryEntries)
      .values(entries)
      .returning();
    
    return result.length;
  }

  async updateDictionaryEntry(id: number, entry: Partial<InsertDictionaryEntry>): Promise<DictionaryEntry | undefined> {
    const [result] = await db
      .update(dictionaryEntries)
      .set(entry)
      .where(eq(dictionaryEntries.id, id))
      .returning();
    
    return result;
  }

  async deleteDictionaryEntry(id: number): Promise<boolean> {
    const result = await db
      .delete(dictionaryEntries)
      .where(eq(dictionaryEntries.id, id))
      .returning({ id: dictionaryEntries.id });
    
    return result.length > 0;
  }

  async deleteAllDictionaryEntries(): Promise<number> {
    const result = await db
      .delete(dictionaryEntries)
      .returning({ id: dictionaryEntries.id });
    
    await logSystemEvent('info', `Deleted all dictionary entries: ${result.length} entries removed`);
    return result.length;
  }

  async countDictionaryEntries(): Promise<{ total: number, enToEs: number, esToEn: number }> {
    const [totalResult] = await db
      .select({ count: sql<number>`count(*)` })
      .from(dictionaryEntries);
    
    const [enToEsResult] = await db
      .select({ count: sql<number>`count(*)` })
      .from(dictionaryEntries)
      .where(and(eq(dictionaryEntries.sourceLanguage, 'en'), eq(dictionaryEntries.targetLanguage, 'es')));
    
    const [esToEnResult] = await db
      .select({ count: sql<number>`count(*)` })
      .from(dictionaryEntries)
      .where(and(eq(dictionaryEntries.sourceLanguage, 'es'), eq(dictionaryEntries.targetLanguage, 'en')));
    
    return {
      total: totalResult.count,
      enToEs: enToEsResult.count,
      esToEn: esToEnResult.count
    };
  }

  // Import job methods
  async createImportJob(job: InsertImportJob): Promise<ImportJob> {
    const [result] = await db
      .insert(importJobs)
      .values(job)
      .returning();
    
    await logSystemEvent('info', `Import job created for source: ${job.source}`);
    return result;
  }

  async getImportJob(id: number): Promise<ImportJob | undefined> {
    const [job] = await db
      .select()
      .from(importJobs)
      .where(eq(importJobs.id, id));
    
    return job;
  }

  async updateImportJob(id: number, updates: Partial<ImportJob>): Promise<ImportJob | undefined> {
    const [result] = await db
      .update(importJobs)
      .set(updates)
      .where(eq(importJobs.id, id))
      .returning();
    
    return result;
  }

  async getLatestImportJob(): Promise<ImportJob | undefined> {
    const [job] = await db
      .select()
      .from(importJobs)
      .orderBy(desc(importJobs.id))
      .limit(1);
    
    return job;
  }

  // Learning sentences methods
  async createLearningSentence(sentence: InsertLearningSentence): Promise<LearningSentence> {
    const [result] = await db
      .insert(learningSentences)
      .values(sentence)
      .returning();
    
    await logSystemEvent('info', `Learning sentence created: "${sentence.spanishText}"`);
    return result;
  }
  
  async getLearningSentence(id: number): Promise<LearningSentence | undefined> {
    const [sentence] = await db
      .select()
      .from(learningSentences)
      .where(eq(learningSentences.id, id));
    
    return sentence;
  }
  
  async getLearningSentences(
    page: number = 1, 
    limit: number = 10, 
    filter?: { difficulty?: string, topic?: string, grammarFocus?: string }
  ): Promise<{ sentences: LearningSentence[], total: number }> {
    const offset = (page - 1) * limit;
    
    let query = db.select().from(learningSentences);
    
    if (filter) {
      if (filter.difficulty) {
        query = query.where(eq(learningSentences.difficulty, filter.difficulty));
      }
      if (filter.topic) {
        query = query.where(eq(learningSentences.topic, filter.topic));
      }
      if (filter.grammarFocus) {
        query = query.where(eq(learningSentences.grammarFocus, filter.grammarFocus));
      }
    }
    
    const sentences = await query.limit(limit).offset(offset).orderBy(desc(learningSentences.id));
    
    let countQuery = db.select({ count: sql<number>`count(*)` }).from(learningSentences);
    
    if (filter) {
      if (filter.difficulty) {
        countQuery = countQuery.where(eq(learningSentences.difficulty, filter.difficulty));
      }
      if (filter.topic) {
        countQuery = countQuery.where(eq(learningSentences.topic, filter.topic));
      }
      if (filter.grammarFocus) {
        countQuery = countQuery.where(eq(learningSentences.grammarFocus, filter.grammarFocus));
      }
    }
    
    const [{ count }] = await countQuery;
    
    return { sentences, total: count };
  }
  
  async updateLearningSentence(id: number, updates: Partial<LearningSentence>): Promise<LearningSentence | undefined> {
    const [result] = await db
      .update(learningSentences)
      .set(updates)
      .where(eq(learningSentences.id, id))
      .returning();
    
    return result;
  }
  
  async deleteLearningSentence(id: number): Promise<boolean> {
    const result = await db
      .delete(learningSentences)
      .where(eq(learningSentences.id, id))
      .returning({ id: learningSentences.id });
    
    return result.length > 0;
  }
  
  // Exercises methods
  async createExercise(exercise: InsertExercise): Promise<Exercise> {
    const [result] = await db
      .insert(exercises)
      .values(exercise)
      .returning();
    
    await logSystemEvent('info', `Exercise created: "${exercise.type}" for difficulty "${exercise.difficulty}"`);
    return result;
  }
  
  async getExercise(id: number): Promise<Exercise | undefined> {
    const [exercise] = await db
      .select()
      .from(exercises)
      .where(eq(exercises.id, id));
    
    return exercise;
  }
  
  async getExercises(
    page: number = 1, 
    limit: number = 10, 
    filter?: { type?: string, difficulty?: string, sentenceId?: number }
  ): Promise<{ exercises: Exercise[], total: number }> {
    const offset = (page - 1) * limit;
    
    let query = db.select().from(exercises);
    
    if (filter) {
      if (filter.type) {
        query = query.where(eq(exercises.type, filter.type));
      }
      if (filter.difficulty) {
        query = query.where(eq(exercises.difficulty, filter.difficulty));
      }
      if (filter.sentenceId) {
        query = query.where(eq(exercises.sentenceId, filter.sentenceId));
      }
    }
    
    const exercisesList = await query.limit(limit).offset(offset).orderBy(desc(exercises.id));
    
    let countQuery = db.select({ count: sql<number>`count(*)` }).from(exercises);
    
    if (filter) {
      if (filter.type) {
        countQuery = countQuery.where(eq(exercises.type, filter.type));
      }
      if (filter.difficulty) {
        countQuery = countQuery.where(eq(exercises.difficulty, filter.difficulty));
      }
      if (filter.sentenceId) {
        countQuery = countQuery.where(eq(exercises.sentenceId, filter.sentenceId));
      }
    }
    
    const [{ count }] = await countQuery;
    
    return { exercises: exercisesList, total: count };
  }
  
  async updateExercise(id: number, updates: Partial<Exercise>): Promise<Exercise | undefined> {
    const [result] = await db
      .update(exercises)
      .set(updates)
      .where(eq(exercises.id, id))
      .returning();
    
    return result;
  }
  
  async deleteExercise(id: number): Promise<boolean> {
    const result = await db
      .delete(exercises)
      .where(eq(exercises.id, id))
      .returning({ id: exercises.id });
    
    return result.length > 0;
  }
  
  // Exercise attempts methods
  async createExerciseAttempt(attempt: InsertExerciseAttempt): Promise<ExerciseAttempt> {
    const [result] = await db
      .insert(exerciseAttempts)
      .values(attempt)
      .returning();
    
    // Update user progress stats
    await this.updateUserProgressAfterExerciseAttempt(attempt.userId, attempt.isCorrect);
    
    return result;
  }
  
  private async updateUserProgressAfterExerciseAttempt(userId: number, isCorrect: boolean): Promise<void> {
    // Get current user progress
    const progress = await this.getUserProgress(userId);
    
    // Calculate new average score
    const totalAttempts = await db
      .select({ count: sql<number>`count(*)` })
      .from(exerciseAttempts)
      .where(eq(exerciseAttempts.userId, userId));
    
    const correctAttempts = await db
      .select({ count: sql<number>`count(*)` })
      .from(exerciseAttempts)
      .where(and(
        eq(exerciseAttempts.userId, userId),
        eq(exerciseAttempts.isCorrect, true)
      ));
    
    const newAverageScore = Math.round((correctAttempts[0].count / totalAttempts[0].count) * 100);
    
    // Update progress
    await this.updateUserProgress(userId, {
      averageScore: newAverageScore,
      lastActive: new Date()
    });
  }
  
  async getUserExerciseAttempts(userId: number, limit: number = 50): Promise<ExerciseAttempt[]> {
    return await db
      .select()
      .from(exerciseAttempts)
      .where(eq(exerciseAttempts.userId, userId))
      .orderBy(desc(exerciseAttempts.attemptedAt))
      .limit(limit);
  }
  
  // System log methods
  async getSystemLogs(limit: number = 100): Promise<SystemLog[]> {
    return await db
      .select()
      .from(systemLogs)
      .orderBy(desc(systemLogs.timestamp))
      .limit(limit);
  }

  // Curriculum track methods - import these from the separate file
  async getCurriculumTracks(): Promise<CurriculumTrack[]> {
    return await import('./storage-curriculum').then(m => m.getCurriculumTracks());
  }

  async getCurriculumTrack(id: number): Promise<CurriculumTrack | undefined> {
    return await import('./storage-curriculum').then(m => m.getCurriculumTrack(id));
  }

  async getCurriculumTrackByCode(code: string): Promise<CurriculumTrack | undefined> {
    return await import('./storage-curriculum').then(m => m.getCurriculumTrackByCode(code));
  }

  async createCurriculumTrack(track: InsertCurriculumTrack): Promise<CurriculumTrack> {
    return await import('./storage-curriculum').then(m => m.createCurriculumTrack(track));
  }

  async updateCurriculumTrack(id: number, updates: Partial<CurriculumTrack>): Promise<CurriculumTrack | undefined> {
    return await import('./storage-curriculum').then(m => m.updateCurriculumTrack(id, updates));
  }

  // Lesson methods
  async getLessons(trackId: number): Promise<Lesson[]> {
    return await import('./storage-curriculum').then(m => m.getLessons(trackId));
  }

  async getLesson(id: number): Promise<Lesson | undefined> {
    return await import('./storage-curriculum').then(m => m.getLesson(id));
  }

  async getLessonByTrackAndNumber(trackId: number, lessonNumber: number): Promise<Lesson | undefined> {
    return await import('./storage-curriculum').then(m => m.getLessonByTrackAndNumber(trackId, lessonNumber));
  }

  async createLesson(lesson: InsertLesson): Promise<Lesson> {
    return await import('./storage-curriculum').then(m => m.createLesson(lesson));
  }

  async updateLesson(id: number, updates: Partial<Lesson>): Promise<Lesson | undefined> {
    return await import('./storage-curriculum').then(m => m.updateLesson(id, updates));
  }

  // Lesson sentences methods
  async addSentenceToLesson(lessonId: number, sentenceId: number, orderIndex: number): Promise<LessonSentence> {
    return await import('./storage-curriculum').then(m => m.addSentenceToLesson(lessonId, sentenceId, orderIndex));
  }

  async getLessonSentences(lessonId: number): Promise<{ sentence: LearningSentence, order: number }[]> {
    return await import('./storage-curriculum').then(m => m.getLessonSentences(lessonId));
  }

  async reorderLessonSentence(id: number, newOrderIndex: number): Promise<LessonSentence | undefined> {
    return await import('./storage-curriculum').then(m => m.reorderLessonSentence(id, newOrderIndex));
  }

  async removeSentenceFromLesson(lessonId: number, sentenceId: number): Promise<boolean> {
    return await import('./storage-curriculum').then(m => m.removeSentenceFromLesson(lessonId, sentenceId));
  }

  // User lesson progress methods
  async getUserLessonProgress(userId: number, lessonId: number): Promise<UserLessonProgress | undefined> {
    return await import('./storage-curriculum').then(m => m.getUserLessonProgress(userId, lessonId));
  }

  async updateUserLessonProgress(userId: number, lessonId: number, progress: number, completed?: boolean): Promise<UserLessonProgress> {
    return await import('./storage-curriculum').then(m => m.updateUserLessonProgress(userId, lessonId, progress, completed));
  }

  async getUserCompletedLessons(userId: number, trackId?: number): Promise<number[]> {
    return await import('./storage-curriculum').then(m => m.getUserCompletedLessons(userId, trackId));
  }
}

export const storage = new DatabaseStorage();

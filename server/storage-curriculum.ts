/**
 * Implementation of curriculum-related storage methods
 */

import { db, logSystemEvent } from './db';
import { 
  curriculumTracks, type CurriculumTrack, type InsertCurriculumTrack,
  lessons, type Lesson, type InsertLesson,
  lessonSentences, type LessonSentence, type InsertLessonSentence,
  learningSentences, type LearningSentence,
  userLessonProgress, type UserLessonProgress, type InsertUserLessonProgress
} from '@shared/schema';
import { eq, and, sql, asc, desc, inArray } from 'drizzle-orm';

/**
 * Curriculum track methods
 */
export async function getCurriculumTracks(): Promise<CurriculumTrack[]> {
  return await db.select().from(curriculumTracks).orderBy(asc(curriculumTracks.cefrLevel));
}

export async function getCurriculumTrack(id: number): Promise<CurriculumTrack | undefined> {
  const [track] = await db.select().from(curriculumTracks).where(eq(curriculumTracks.id, id));
  return track;
}

export async function getCurriculumTrackByCode(code: string): Promise<CurriculumTrack | undefined> {
  const [track] = await db.select().from(curriculumTracks).where(eq(curriculumTracks.code, code));
  return track;
}

export async function createCurriculumTrack(track: InsertCurriculumTrack): Promise<CurriculumTrack> {
  const [result] = await db.insert(curriculumTracks).values(track).returning();
  await logSystemEvent('info', `Created curriculum track: ${track.title} (${track.cefrLevel})`);
  return result;
}

export async function updateCurriculumTrack(id: number, updates: Partial<CurriculumTrack>): Promise<CurriculumTrack | undefined> {
  const [result] = await db
    .update(curriculumTracks)
    .set(updates)
    .where(eq(curriculumTracks.id, id))
    .returning();
  
  return result;
}

/**
 * Lesson methods
 */
export async function getLessons(trackId: number): Promise<Lesson[]> {
  return await db
    .select()
    .from(lessons)
    .where(eq(lessons.trackId, trackId))
    .orderBy(asc(lessons.lessonNumber));
}

export async function getLesson(id: number): Promise<Lesson | undefined> {
  const [lesson] = await db.select().from(lessons).where(eq(lessons.id, id));
  return lesson;
}

export async function getLessonByTrackAndNumber(trackId: number, lessonNumber: number): Promise<Lesson | undefined> {
  const [lesson] = await db
    .select()
    .from(lessons)
    .where(and(eq(lessons.trackId, trackId), eq(lessons.lessonNumber, lessonNumber)));
  
  return lesson;
}

export async function createLesson(lesson: InsertLesson): Promise<Lesson> {
  const [result] = await db.insert(lessons).values(lesson).returning();
  await logSystemEvent('info', `Created lesson: ${lesson.title} for track ID ${lesson.trackId}`);
  return result;
}

export async function updateLesson(id: number, updates: Partial<Lesson>): Promise<Lesson | undefined> {
  const [result] = await db
    .update(lessons)
    .set(updates)
    .where(eq(lessons.id, id))
    .returning();
  
  return result;
}

/**
 * Get the highest lesson number for a track
 * Used when creating new lessons
 */
export async function getMaxLessonNumber(trackId: number): Promise<number> {
  const [result] = await db
    .select({
      maxNumber: sql<number>`MAX(${lessons.lessonNumber})`
    })
    .from(lessons)
    .where(eq(lessons.trackId, trackId));
  
  return result?.maxNumber || 0;
}

/**
 * Count lessons for a track
 */
export async function countLessons(trackId: number): Promise<number> {
  const [result] = await db
    .select({
      count: sql<number>`COUNT(*)`
    })
    .from(lessons)
    .where(eq(lessons.trackId, trackId));
  
  return result?.count || 0;
}

/**
 * Lesson sentences methods
 */
export async function addSentenceToLesson(lessonId: number, sentenceId: number, orderIndex: number): Promise<LessonSentence> {
  const [result] = await db
    .insert(lessonSentences)
    .values({
      lessonId,
      sentenceId,
      orderIndex
    })
    .returning();
  
  await logSystemEvent('info', `Added sentence ID ${sentenceId} to lesson ID ${lessonId} at position ${orderIndex}`);
  return result;
}

export async function getLessonSentences(lessonId: number): Promise<{ sentence: LearningSentence, order: number }[]> {
  const results = await db
    .select({
      sentence: learningSentences,
      order: lessonSentences.orderIndex
    })
    .from(lessonSentences)
    .innerJoin(learningSentences, eq(lessonSentences.sentenceId, learningSentences.id))
    .where(eq(lessonSentences.lessonId, lessonId))
    .orderBy(asc(lessonSentences.orderIndex));
  
  return results;
}

export async function reorderLessonSentence(id: number, newOrderIndex: number): Promise<LessonSentence | undefined> {
  const [result] = await db
    .update(lessonSentences)
    .set({ orderIndex: newOrderIndex })
    .where(eq(lessonSentences.id, id))
    .returning();
  
  return result;
}

export async function removeSentenceFromLesson(lessonId: number, sentenceId: number): Promise<boolean> {
  const result = await db
    .delete(lessonSentences)
    .where(and(eq(lessonSentences.lessonId, lessonId), eq(lessonSentences.sentenceId, sentenceId)))
    .returning({ id: lessonSentences.id });
  
  return result.length > 0;
}

/**
 * User lesson progress methods
 */
export async function getUserLessonProgress(userId: number, lessonId: number): Promise<UserLessonProgress | undefined> {
  const [progress] = await db
    .select()
    .from(userLessonProgress)
    .where(and(eq(userLessonProgress.userId, userId), eq(userLessonProgress.lessonId, lessonId)));
  
  return progress;
}

export async function updateUserLessonProgress(
  userId: number,
  lessonId: number,
  progress: number,
  completed: boolean = false
): Promise<UserLessonProgress> {
  // Check if progress record exists
  const existingProgress = await getUserLessonProgress(userId, lessonId);
  
  if (existingProgress) {
    // Update existing progress
    const [updated] = await db
      .update(userLessonProgress)
      .set({
        progress,
        completed: completed || (progress >= 100),
        lastAccessedAt: new Date()
      })
      .where(eq(userLessonProgress.id, existingProgress.id))
      .returning();
    
    return updated;
  } else {
    // Create new progress record
    const [created] = await db
      .insert(userLessonProgress)
      .values({
        userId,
        lessonId,
        progress,
        completed: completed || (progress >= 100)
      })
      .returning();
    
    return created;
  }
}

export async function getUserCompletedLessons(userId: number, trackId?: number): Promise<number[]> {
  let query = db
    .select({
      lessonId: userLessonProgress.lessonId
    })
    .from(userLessonProgress)
    .where(and(eq(userLessonProgress.userId, userId), eq(userLessonProgress.completed, true)));
  
  if (trackId) {
    const trackLessonIds = await db
      .select({
        id: lessons.id
      })
      .from(lessons)
      .where(eq(lessons.trackId, trackId));
    
    const lessonIdList = trackLessonIds.map(l => l.id);
    
    query = query.where(inArray(userLessonProgress.lessonId, lessonIdList));
  }
  
  const completedLessons = await query;
  return completedLessons.map(l => l.lessonId);
}
/**
 * API routes for curriculum management and learning tracks
 */

import { Router, Request, Response } from 'express';
import { 
  getCurriculumTracks, 
  getCurriculumTrack, 
  getCurriculumTrackByCode,
  getLessons, 
  getLesson, 
  getLessonSentences,
  getUserLessonProgress,
  updateUserLessonProgress,
  getUserCompletedLessons
} from './storage-curriculum';
import { 
  initializeCurriculum, 
  generateSentenceForLesson,
  populateLesson,
  generateTrack 
} from './services/curriculum';
import { z } from 'zod';
import { storage } from './storage';
import { generateSentence, analyzeText, postProcessWordAnalysis } from './services/llm';

export const curriculumRouter = Router();

/**
 * Error handler for API routes
 */
const handleError = (res: Response, error: any) => {
  console.error('Curriculum API error:', error);
  const message = error instanceof Error ? error.message : String(error);
  res.status(500).json({ success: false, error: message });
};

/**
 * Initialize curriculum with default tracks if not already created
 * GET /api/curriculum/initialize
 */
curriculumRouter.get('/initialize', async (req: Request, res: Response) => {
  try {
    await initializeCurriculum();
    res.json({ success: true, message: 'Curriculum initialized successfully' });
  } catch (error) {
    handleError(res, error);
  }
});

/**
 * Generate curriculum for a specific track
 * POST /api/curriculum/generate-track
 */
curriculumRouter.post('/generate-track', async (req: Request, res: Response) => {
  try {
    const schema = z.object({
      trackId: z.number(),
      sentencesPerLesson: z.number().optional().default(5)
    });
    
    const { trackId, sentencesPerLesson } = schema.parse(req.body);
    
    // Check if track exists
    const track = await getCurriculumTrack(trackId);
    if (!track) {
      return res.status(404).json({ success: false, error: 'Track not found' });
    }
    
    // Generate sentences for all lessons in the track
    const generatedCount = await generateTrack(trackId, sentencesPerLesson);
    
    res.json({ 
      success: true, 
      message: `Generated ${generatedCount} sentences for track "${track.title}"`,
      generatedCount
    });
  } catch (error) {
    handleError(res, error);
  }
});

/**
 * Get all curriculum tracks
 * GET /api/curriculum/tracks
 */
curriculumRouter.get('/tracks', async (req: Request, res: Response) => {
  try {
    const tracks = await getCurriculumTracks();
    res.json({ success: true, tracks });
  } catch (error) {
    handleError(res, error);
  }
});

/**
 * Get a specific curriculum track
 * GET /api/curriculum/tracks/:id
 */
curriculumRouter.get('/tracks/:id', async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      return res.status(400).json({ success: false, error: 'Invalid track ID' });
    }
    
    const track = await getCurriculumTrack(id);
    if (!track) {
      return res.status(404).json({ success: false, error: 'Track not found' });
    }
    
    res.json({ success: true, track });
  } catch (error) {
    handleError(res, error);
  }
});

/**
 * Get a curriculum track by code
 * GET /api/curriculum/tracks/code/:code
 */
curriculumRouter.get('/tracks/code/:code', async (req: Request, res: Response) => {
  try {
    const { code } = req.params;
    
    const track = await getCurriculumTrackByCode(code);
    if (!track) {
      return res.status(404).json({ success: false, error: 'Track not found' });
    }
    
    res.json({ success: true, track });
  } catch (error) {
    handleError(res, error);
  }
});

/**
 * Get lessons for a specific track
 * GET /api/curriculum/lessons/:trackId
 */
curriculumRouter.get('/lessons/:trackId', async (req: Request, res: Response) => {
  try {
    const trackId = parseInt(req.params.trackId);
    if (isNaN(trackId)) {
      return res.status(400).json({ success: false, error: 'Invalid track ID' });
    }
    
    // Check if track exists
    const track = await getCurriculumTrack(trackId);
    if (!track) {
      return res.status(404).json({ success: false, error: 'Track not found' });
    }
    
    const lessons = await getLessons(trackId);
    res.json({ success: true, lessons });
  } catch (error) {
    handleError(res, error);
  }
});

/**
 * Get a specific lesson
 * GET /api/curriculum/lesson/:id
 */
curriculumRouter.get('/lesson/:id', async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      return res.status(400).json({ success: false, error: 'Invalid lesson ID' });
    }
    
    const lesson = await getLesson(id);
    if (!lesson) {
      return res.status(404).json({ success: false, error: 'Lesson not found' });
    }
    
    const track = await getCurriculumTrack(lesson.trackId);
    
    res.json({ 
      success: true, 
      lesson: {
        ...lesson,
        trackName: track?.title || '',
        cefrLevel: track?.cefrLevel || ''
      }
    });
  } catch (error) {
    handleError(res, error);
  }
});

/**
 * Get sentences for a specific lesson
 * GET /api/curriculum/lesson/:id/sentences
 */
curriculumRouter.get('/lesson/:id/sentences', async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      return res.status(400).json({ success: false, error: 'Invalid lesson ID' });
    }
    
    const lesson = await getLesson(id);
    if (!lesson) {
      return res.status(404).json({ success: false, error: 'Lesson not found' });
    }
    
    const sentences = await getLessonSentences(id);
    
    res.json({ 
      success: true, 
      lesson,
      sentences: sentences.map(item => ({
        ...item.sentence,
        orderIndex: item.order
      }))
    });
  } catch (error) {
    handleError(res, error);
  }
});

/**
 * Generate a new sentence with word-by-word data
 * POST /api/curriculum/generate-sentence
 */
curriculumRouter.post('/generate-sentence', async (req: Request, res: Response) => {
  try {
    const schema = z.object({
      difficulty: z.string().optional(),
      topic: z.string().optional(),
      grammarFocus: z.string().optional(),
      cefrLevel: z.string().optional()
    });
    
    const params = schema.parse(req.body);
    
    const result = await generateSentence(params);
    
    res.json({ 
      success: true, 
      sentence: result
    });
  } catch (error) {
    handleError(res, error);
  }
});

/**
 * Populate a lesson with sentences
 * POST /api/curriculum/populate-lesson
 */
curriculumRouter.post('/populate-lesson', async (req: Request, res: Response) => {
  try {
    const schema = z.object({
      lessonId: z.number(),
      count: z.number().optional().default(5)
    });
    
    const { lessonId, count } = schema.parse(req.body);
    
    // Check if lesson exists
    const lesson = await getLesson(lessonId);
    if (!lesson) {
      return res.status(404).json({ success: false, error: 'Lesson not found' });
    }
    
    // Generate sentences for the lesson
    const generatedCount = await populateLesson(lessonId, count);
    
    res.json({ 
      success: true, 
      message: `Generated ${generatedCount} sentences for lesson ${lesson.title}`,
      generatedCount
    });
  } catch (error) {
    handleError(res, error);
  }
});

/**
 * Fix grammatical analysis for a given word data array
 * POST /api/curriculum/post-process
 */
curriculumRouter.post('/post-process', async (req: Request, res: Response) => {
  try {
    const schema = z.object({
      wordData: z.array(z.any())
    });
    
    const { wordData } = schema.parse(req.body);
    
    const processed = await postProcessWordAnalysis(wordData);
    
    res.json({ 
      success: true, 
      wordData: processed
    });
  } catch (error) {
    handleError(res, error);
  }
});

/**
 * Update user progress for a lesson
 * POST /api/curriculum/progress
 */
curriculumRouter.post('/progress', async (req: Request, res: Response) => {
  try {
    const schema = z.object({
      userId: z.number(),
      lessonId: z.number(),
      progress: z.number().min(0).max(100),
      completed: z.boolean().optional()
    });
    
    const { userId, lessonId, progress, completed } = schema.parse(req.body);
    
    // Check if user and lesson exist
    const user = await storage.getUser(userId);
    if (!user) {
      return res.status(404).json({ success: false, error: 'User not found' });
    }
    
    const lesson = await getLesson(lessonId);
    if (!lesson) {
      return res.status(404).json({ success: false, error: 'Lesson not found' });
    }
    
    // Update progress
    const updatedProgress = await updateUserLessonProgress(
      userId,
      lessonId,
      progress,
      completed
    );
    
    // If the lesson was completed, update the user's overall progress
    if (updatedProgress.completed) {
      const userProgress = await storage.getUserProgress(userId);
      await storage.updateUserProgress(userId, {
        ...userProgress,
        lessonsCompleted: (userProgress.lessonsCompleted || 0) + 1,
        lastActive: new Date()
      });
    }
    
    res.json({ 
      success: true, 
      progress: updatedProgress
    });
  } catch (error) {
    handleError(res, error);
  }
});

/**
 * Get completed lessons for a user
 * GET /api/curriculum/completed/:userId
 */
curriculumRouter.get('/completed/:userId', async (req: Request, res: Response) => {
  try {
    const userId = parseInt(req.params.userId);
    if (isNaN(userId)) {
      return res.status(400).json({ success: false, error: 'Invalid user ID' });
    }
    
    const trackId = req.query.trackId ? parseInt(req.query.trackId as string) : undefined;
    
    const completedLessons = await getUserCompletedLessons(userId, trackId);
    
    res.json({ 
      success: true, 
      completedLessons
    });
  } catch (error) {
    handleError(res, error);
  }
});
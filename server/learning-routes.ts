import { Router, Request, Response } from 'express';
import { storage } from './storage';
import { logSystemEvent } from './db';
import { translateSpanishToEnglish, analyzeSpanishSentence, generateExercises, provideFeedback } from './services/openai';

export const learningRouter = Router();

// Helper function to handle errors
const handleError = (res: Response, error: any) => {
  console.error('API Error:', error);
  const message = error instanceof Error ? error.message : String(error);
  res.status(500).json({ message });
};

// Get learning sentences with pagination and filtering
learningRouter.get('/sentences', async (req: Request, res: Response) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    
    const filter: any = {};
    if (req.query.difficulty) filter.difficulty = req.query.difficulty;
    if (req.query.topic) filter.topic = req.query.topic;
    if (req.query.grammarFocus) filter.grammarFocus = req.query.grammarFocus;
    
    const { sentences, total } = await storage.getLearningSentences(page, limit, Object.keys(filter).length > 0 ? filter : undefined);
    
    res.json({ sentences, total, page, limit });
  } catch (error) {
    handleError(res, error);
  }
});

// Get a single learning sentence by ID
learningRouter.get('/sentences/:id', async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id);
    const sentence = await storage.getLearningSentence(id);
    
    if (!sentence) {
      return res.status(404).json({ message: 'Sentence not found' });
    }
    
    res.json(sentence);
  } catch (error) {
    handleError(res, error);
  }
});

// Create a new learning sentence
learningRouter.post('/sentences', async (req: Request, res: Response) => {
  try {
    const { spanishText, englishText, difficulty, topic, grammarFocus } = req.body;
    
    if (!spanishText || !englishText || !difficulty) {
      return res.status(400).json({ message: 'Spanish text, English text, and difficulty are required' });
    }
    
    // Analyze the sentence to get word-by-word data
    const analysis = await analyzeSpanishSentence(spanishText);
    
    const sentence = await storage.createLearningSentence({
      spanishText,
      englishText,
      difficulty,
      topic,
      grammarFocus,
      wordByWordData: analysis
    });
    
    await logSystemEvent('info', `Created learning sentence: "${spanishText}"`);
    res.status(201).json(sentence);
  } catch (error) {
    handleError(res, error);
  }
});

// Update a learning sentence
learningRouter.put('/sentences/:id', async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id);
    const { spanishText, englishText, difficulty, topic, grammarFocus } = req.body;
    
    const existingSentence = await storage.getLearningSentence(id);
    if (!existingSentence) {
      return res.status(404).json({ message: 'Sentence not found' });
    }
    
    // Only reanalyze if Spanish text changed
    let wordByWordData = existingSentence.wordByWordData;
    if (spanishText && spanishText !== existingSentence.spanishText) {
      const analysis = await analyzeSpanishSentence(spanishText);
      wordByWordData = analysis;
    }
    
    const updates: any = {};
    if (spanishText) updates.spanishText = spanishText;
    if (englishText) updates.englishText = englishText;
    if (difficulty) updates.difficulty = difficulty;
    if (topic) updates.topic = topic;
    if (grammarFocus) updates.grammarFocus = grammarFocus;
    if (wordByWordData) updates.wordByWordData = wordByWordData;
    
    const updatedSentence = await storage.updateLearningSentence(id, updates);
    
    res.json(updatedSentence);
  } catch (error) {
    handleError(res, error);
  }
});

// Delete a learning sentence
learningRouter.delete('/sentences/:id', async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id);
    const success = await storage.deleteLearningSentence(id);
    
    if (!success) {
      return res.status(404).json({ message: 'Sentence not found' });
    }
    
    await logSystemEvent('info', `Deleted learning sentence with ID: ${id}`);
    res.status(204).send();
  } catch (error) {
    handleError(res, error);
  }
});

// Generate exercises for a sentence
learningRouter.post('/sentences/:id/exercises', async (req: Request, res: Response) => {
  try {
    const sentenceId = parseInt(req.params.id);
    const { exerciseType = 'mixed', count = 3 } = req.body;
    
    const sentence = await storage.getLearningSentence(sentenceId);
    if (!sentence) {
      return res.status(404).json({ message: 'Sentence not found' });
    }
    
    // Generate exercises using OpenAI
    const generatedExercises = await generateExercises(
      sentence.spanishText,
      exerciseType as any
    );
    
    // Store generated exercises in the database
    const savedExercises = [];
    for (const exercise of generatedExercises.exercises.slice(0, count)) {
      const savedExercise = await storage.createExercise({
        type: exercise.type,
        sentenceId,
        question: exercise.question,
        options: exercise.options || [],
        correctAnswer: exercise.correctAnswer,
        explanation: exercise.explanation,
        difficulty: sentence.difficulty
      });
      
      savedExercises.push(savedExercise);
    }
    
    res.status(201).json(savedExercises);
  } catch (error) {
    handleError(res, error);
  }
});

// Get exercises with pagination and filtering
learningRouter.get('/exercises', async (req: Request, res: Response) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    
    const filter: any = {};
    if (req.query.type) filter.type = req.query.type;
    if (req.query.difficulty) filter.difficulty = req.query.difficulty;
    if (req.query.sentenceId) filter.sentenceId = parseInt(req.query.sentenceId as string);
    
    const { exercises, total } = await storage.getExercises(
      page, 
      limit, 
      Object.keys(filter).length > 0 ? filter : undefined
    );
    
    res.json({ exercises, total, page, limit });
  } catch (error) {
    handleError(res, error);
  }
});

// Get a single exercise by ID
learningRouter.get('/exercises/:id', async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id);
    const exercise = await storage.getExercise(id);
    
    if (!exercise) {
      return res.status(404).json({ message: 'Exercise not found' });
    }
    
    res.json(exercise);
  } catch (error) {
    handleError(res, error);
  }
});

// Submit an answer to an exercise
learningRouter.post('/exercises/:id/attempt', async (req: Request, res: Response) => {
  try {
    const exerciseId = parseInt(req.params.id);
    const { userId, userAnswer } = req.body;
    
    if (!userId || userAnswer === undefined) {
      return res.status(400).json({ message: 'User ID and answer are required' });
    }
    
    const exercise = await storage.getExercise(exerciseId);
    if (!exercise) {
      return res.status(404).json({ message: 'Exercise not found' });
    }
    
    // Check if the answer is correct
    const isCorrect = userAnswer === exercise.correctAnswer;
    
    // Get the corresponding sentence if available
    let sentence = null;
    if (exercise.sentenceId) {
      sentence = await storage.getLearningSentence(exercise.sentenceId);
    }
    
    // Generate feedback using OpenAI
    let feedback = '';
    if (!isCorrect && sentence) {
      const feedbackResponse = await provideFeedback(
        userAnswer,
        exercise.correctAnswer,
        exercise.type.includes('translation')
      );
      
      feedback = feedbackResponse.feedback;
    }
    
    // Record the attempt
    const attempt = await storage.createExerciseAttempt({
      userId,
      exerciseId,
      userAnswer,
      isCorrect,
      feedback
    });
    
    res.json({
      attempt,
      isCorrect,
      correctAnswer: exercise.correctAnswer,
      explanation: exercise.explanation,
      feedback
    });
  } catch (error) {
    handleError(res, error);
  }
});

// Analyze a Spanish sentence (for usage in the frontend)
learningRouter.post('/analyze', async (req: Request, res: Response) => {
  try {
    const { text } = req.body;
    
    if (!text) {
      return res.status(400).json({ message: 'Text is required' });
    }
    
    const analysis = await analyzeSpanishSentence(text);
    res.json(analysis);
  } catch (error) {
    handleError(res, error);
  }
});

// Generate a translation for a Spanish/English sentence
learningRouter.post('/translate', async (req: Request, res: Response) => {
  try {
    const { text, preferBritishEnglish = true } = req.body;
    
    if (!text) {
      return res.status(400).json({ message: 'Text is required' });
    }
    
    const translation = await translateSpanishToEnglish(text, preferBritishEnglish);
    res.json({ original: text, translation });
  } catch (error) {
    handleError(res, error);
  }
});

// Generate feedback for a user's Spanish text
learningRouter.post('/feedback', async (req: Request, res: Response) => {
  try {
    const { userText, correctText, isTranslation = false } = req.body;
    
    if (!userText || !correctText) {
      return res.status(400).json({ message: 'User text and correct text are required' });
    }
    
    const feedback = await provideFeedback(userText, correctText, isTranslation);
    res.json(feedback);
  } catch (error) {
    handleError(res, error);
  }
});

// Get user's learning progress
learningRouter.get('/progress/:userId', async (req: Request, res: Response) => {
  try {
    const userId = parseInt(req.params.userId);
    
    // Get user's progress
    const progress = await storage.getUserProgress(userId);
    
    // Get recent exercise attempts
    const attempts = await storage.getUserExerciseAttempts(userId, 10);
    
    res.json({
      progress,
      recentAttempts: attempts
    });
  } catch (error) {
    handleError(res, error);
  }
});
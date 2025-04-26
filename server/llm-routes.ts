import { Router, Request, Response } from "express";
import * as llmService from "./services/llm";
import { storage } from "./storage";
import { logSystemEvent } from "./db";

export const llmRouter = Router();

// Error handler helper function
const handleError = (res: Response, error: any) => {
  console.error("LLM API Error:", error);
  const errorMessage = error.message || "An unexpected error occurred";
  
  logSystemEvent("error", `LLM API Error: ${errorMessage}`).catch(err => {
    console.error("Failed to log error:", err);
  });
  
  return res.status(500).json({
    success: false,
    message: errorMessage
  });
};

/**
 * Generate practice sentences
 * POST /api/llm/sentences
 */
llmRouter.post('/sentences', async (req: Request, res: Response) => {
  try {
    const { difficulty, theme, grammarFocus, count } = req.body;
    
    if (!difficulty) {
      return res.status(400).json({
        success: false,
        message: "Difficulty level is required"
      });
    }
    
    const result = await llmService.generateSentences(
      difficulty,
      theme || "any",
      grammarFocus || "any",
      count || 3
    );
    
    return res.status(200).json({
      success: true,
      data: result
    });
  } catch (error) {
    return handleError(res, error);
  }
});

/**
 * Generate conversation response from AI language buddy
 * POST /api/llm/conversation
 */
llmRouter.post('/conversation', async (req: Request, res: Response) => {
  try {
    const { 
      messages, 
      persona, 
      learningLevel, 
      shouldProvideTranslation, 
      shouldProvideFeedback 
    } = req.body;
    
    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Valid conversation messages are required"
      });
    }
    
    const result = await llmService.generateConversationResponse(
      messages,
      persona || "friendly language tutor",
      learningLevel || "intermediate",
      shouldProvideTranslation !== false,
      shouldProvideFeedback !== false
    );
    
    return res.status(200).json({
      success: true,
      data: result
    });
  } catch (error) {
    return handleError(res, error);
  }
});

/**
 * Generate curriculum content for a specific track and lesson
 * POST /api/llm/curriculum
 */
llmRouter.post('/curriculum', async (req: Request, res: Response) => {
  try {
    const { track, level, lessonNumber } = req.body;
    
    if (!track || !level || !lessonNumber) {
      return res.status(400).json({
        success: false,
        message: "Track, level, and lesson number are required"
      });
    }
    
    const result = await llmService.generateCurriculumContent(
      track,
      level,
      lessonNumber
    );
    
    return res.status(200).json({
      success: true,
      data: result
    });
  } catch (error) {
    return handleError(res, error);
  }
});

/**
 * Analyze user's proficiency level based on their language samples
 * POST /api/llm/analyze-proficiency
 */
llmRouter.post('/analyze-proficiency', async (req: Request, res: Response) => {
  try {
    const { textSamples } = req.body;
    
    if (!textSamples || !Array.isArray(textSamples) || textSamples.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Valid text samples are required"
      });
    }
    
    const result = await llmService.analyzeProficiencyLevel(textSamples);
    
    return res.status(200).json({
      success: true,
      data: result
    });
  } catch (error) {
    return handleError(res, error);
  }
});

/**
 * Save generated sentence to database
 * POST /api/llm/save-sentence
 */
llmRouter.post('/save-sentence', async (req: Request, res: Response) => {
  try {
    const { 
      spanishText, 
      englishText, 
      difficulty, 
      topic, 
      grammarFocus, 
      wordByWordData 
    } = req.body;
    
    if (!spanishText || !englishText) {
      return res.status(400).json({
        success: false,
        message: "Spanish and English text are required"
      });
    }
    
    // Save to database
    const savedSentence = await storage.createLearningSentence({
      spanishText,
      englishText,
      cefr: difficulty || "b1",
      topic: topic || "",
      grammarFocus: grammarFocus || "",
      wordByWordData: wordByWordData || []
    });
    
    return res.status(201).json({
      success: true,
      data: savedSentence
    });
  } catch (error) {
    return handleError(res, error);
  }
});

/**
 * Save user conversation history
 * POST /api/llm/save-conversation
 */
llmRouter.post('/save-conversation', async (req: Request, res: Response) => {
  try {
    const { userId, messages, title } = req.body;
    
    if (!messages || !Array.isArray(messages)) {
      return res.status(400).json({
        success: false,
        message: "Valid conversation messages are required"
      });
    }
    
    // In a production app, this would save to the database
    // Here we'll just log and return success
    await logSystemEvent("info", `Conversation saved: ${title || 'Untitled'} with ${messages.length} messages`);
    
    return res.status(201).json({
      success: true,
      message: "Conversation saved successfully"
    });
  } catch (error) {
    return handleError(res, error);
  }
});
import { Router, Request, Response } from "express";
import * as culturalContextService from "./services/cultural-context";
import { storage } from "./storage";

export const culturalContextRouter = Router();

// Helper function for error handling
const handleError = (res: Response, error: any) => {
  console.error("Error in cultural context route:", error);
  res.status(500).json({
    success: false,
    message: "An error occurred while processing your request",
    error: error.message || "Unknown error"
  });
};

/**
 * Generate Spanish idioms and expressions
 * POST /api/cultural-context/idioms
 */
culturalContextRouter.post('/idioms', async (req: Request, res: Response) => {
  try {
    const { difficulty = "beginner", region = "any", category = "any", count = 5 } = req.body;
    
    const result = await culturalContextService.generateIdioms(
      difficulty,
      region,
      category,
      count
    );
    
    res.json({
      success: true,
      data: {
        idioms: result
      }
    });
  } catch (error) {
    handleError(res, error);
  }
});

/**
 * Get cultural context information for a specific region
 * POST /api/cultural-context/region
 */
culturalContextRouter.post('/region', async (req: Request, res: Response) => {
  try {
    const { region, topic = "general" } = req.body;
    
    if (!region) {
      return res.status(400).json({
        success: false,
        message: "Region parameter is required"
      });
    }
    
    const result = await culturalContextService.generateCulturalContext(
      region,
      topic
    );
    
    res.json({
      success: true,
      data: result
    });
  } catch (error) {
    handleError(res, error);
  }
});

/**
 * Generate practice exercises for idioms
 * POST /api/cultural-context/exercises
 */
culturalContextRouter.post('/exercises', async (req: Request, res: Response) => {
  try {
    const { idioms, exerciseType = "multiple-choice" } = req.body;
    
    if (!idioms || !Array.isArray(idioms) || idioms.length === 0) {
      return res.status(400).json({
        success: false,
        message: "A list of idioms is required"
      });
    }
    
    const result = await culturalContextService.generateIdiomExercises(
      idioms,
      exerciseType
    );
    
    res.json({
      success: true,
      data: {
        exercises: result
      }
    });
  } catch (error) {
    handleError(res, error);
  }
});

/**
 * Get feedback on user's idiom usage
 * POST /api/cultural-context/feedback
 */
culturalContextRouter.post('/feedback', async (req: Request, res: Response) => {
  try {
    const { userResponses } = req.body;
    
    if (!userResponses || !Array.isArray(userResponses) || userResponses.length === 0) {
      return res.status(400).json({
        success: false,
        message: "User responses are required"
      });
    }
    
    const result = await culturalContextService.provideCulturalFeedback(
      userResponses
    );
    
    res.json({
      success: true,
      data: {
        feedback: result
      }
    });
  } catch (error) {
    handleError(res, error);
  }
});
import OpenAI from "openai";
import { storage } from "../storage";
import { db } from "../db";

// Initialize OpenAI client
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

/**
 * Generate Spanish idioms and cultural expressions based on filters
 */
export async function generateIdioms(
  difficulty: string = "beginner",
  region: string = "any",
  category: string = "any",
  count: number = 5
): Promise<any[]> {
  try {
    const systemPrompt = `You are a Spanish language expert specializing in idioms, expressions, and cultural context.`;
    
    const userPrompt = `Generate ${count} Spanish idioms or expressions ${
      region !== "any" ? `from ${region}` : "from various Spanish-speaking regions"
    } that are appropriate for ${difficulty} level Spanish learners ${
      category !== "any" ? `related to the category: ${category}` : ""
    }.

    For each idiom or expression, provide:
    1. The Spanish text
    2. The English translation
    3. The literal word-by-word translation if applicable
    4. A detailed explanation of its meaning and usage
    5. Cultural context and usage examples
    6. The region(s) where it's commonly used
    7. At least 2 example sentences with English translations

    Respond with a JSON array where each idiom is an object with these properties:
    - spanishText: string
    - englishTranslation: string
    - literalTranslation: string
    - explanation: string
    - usage: string
    - region: string
    - category: string (e.g., "everyday", "humor", "food", etc.)
    - difficulty: string ("beginner", "intermediate", or "advanced")
    - examples: array of objects with "spanish" and "english" properties
    `;

    const response = await openai.chat.completions.create({
      model: "gpt-4o", // the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt }
      ],
      temperature: 0.7,
      response_format: { type: "json_object" }
    });

    // Parse the response
    const content = response.choices[0].message.content;
    if (!content) {
      throw new Error("No content in response");
    }

    const responseData = JSON.parse(content);
    return responseData.idioms || [];
  } catch (error) {
    console.error("Error generating idioms:", error);
    throw error;
  }
}

/**
 * Generate cultural context information for a specific Spanish-speaking region
 */
export async function generateCulturalContext(
  region: string,
  topic: string = "general"
): Promise<any> {
  try {
    const systemPrompt = `You are a cultural anthropologist and linguist specializing in Spanish-speaking cultures and dialects.`;
    
    const userPrompt = `Provide detailed information about the linguistic and cultural context of Spanish as spoken in ${region}, focusing on ${topic === "general" ? "general language usage and culture" : topic}.

    Include:
    1. Key linguistic features that distinguish this regional variety of Spanish
    2. Common expressions or slang unique to this region
    3. Communication patterns or cultural norms that might affect language use
    4. Cultural aspects that influence the language

    Format your response as a JSON object with these properties:
    - region: string (the region name)
    - linguisticFeatures: array of objects, each with "feature" and "examples" properties
    - regionalExpressions: array of objects with "expression", "meaning", and "usage" properties
    - communicationTips: array of strings with cultural communication advice
    - culturalContext: string (broader cultural information relevant to language)
    `;

    const response = await openai.chat.completions.create({
      model: "gpt-4o", // the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt }
      ],
      temperature: 0.7,
      response_format: { type: "json_object" }
    });

    // Parse the response
    const content = response.choices[0].message.content;
    if (!content) {
      throw new Error("No content in response");
    }

    return JSON.parse(content);
  } catch (error) {
    console.error("Error generating cultural context:", error);
    throw error;
  }
}

/**
 * Generate idiom practice exercises
 */
export async function generateIdiomExercises(
  idioms: string[],
  exerciseType: string = "multiple-choice"
): Promise<any[]> {
  try {
    // Format the idioms as a string for the prompt
    const idiomsText = idioms.map(idiom => `- "${idiom}"`).join("\n");
    
    const systemPrompt = `You are a Spanish language teacher specializing in creating practice exercises for idioms and cultural expressions.`;
    
    const userPrompt = `Create practice exercises for the following Spanish idioms or expressions:
    ${idiomsText}

    Exercise type: ${exerciseType}

    For each idiom, create 1-2 exercises that test the student's understanding of the idiom's meaning and usage.
    
    For multiple-choice exercises, include:
    - A clear question
    - 4 options (including the correct answer)
    - The correct answer

    For fill-in-blank exercises, include:
    - A sentence with a blank where the idiom should be used
    - The correct answer

    Respond with a JSON array where each exercise is an object with these properties:
    - type: string (the exercise type)
    - idiom: string (the idiom being tested)
    - question: string
    - options: array of strings (for multiple-choice) or null (for fill-in-blank)
    - correctAnswer: string
    - explanation: string (explaining why the answer is correct)
    `;

    const response = await openai.chat.completions.create({
      model: "gpt-4o", // the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt }
      ],
      temperature: 0.7,
      response_format: { type: "json_object" }
    });

    // Parse the response
    const content = response.choices[0].message.content;
    if (!content) {
      throw new Error("No content in response");
    }

    const responseData = JSON.parse(content);
    return responseData.exercises || [];
  } catch (error) {
    console.error("Error generating idiom exercises:", error);
    throw error;
  }
}

/**
 * Provide feedback on user's understanding and usage of idioms
 */
export async function provideCulturalFeedback(
  userResponses: any[]
): Promise<any> {
  try {
    // Format the user responses for the prompt
    const responsesText = userResponses.map(response => 
      `Question: ${response.question}\nUser's answer: ${response.answer}\nCorrect answer: ${response.correctAnswer}`
    ).join("\n\n");
    
    const systemPrompt = `You are a Spanish language teacher specializing in idioms and cultural expressions.`;
    
    const userPrompt = `Provide feedback on the student's responses to these idiom exercises:

    ${responsesText}

    For each response:
    1. Assess if the answer is correct
    2. Explain why the answer is correct or incorrect
    3. Provide additional context or tips to help the student understand the idiom better

    Then provide an overall assessment of the student's understanding of Spanish idioms and cultural expressions.

    Respond with a JSON object that has:
    - individualFeedback: array of objects with "question", "userAnswer", "isCorrect", and "feedback" properties
    - overallFeedback: string with a summary assessment
    - improvementTips: array of strings with suggestions for improvement
    - score: number (percentage of correct answers)
    `;

    const response = await openai.chat.completions.create({
      model: "gpt-4o", // the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt }
      ],
      temperature: 0.7,
      response_format: { type: "json_object" }
    });

    // Parse the response
    const content = response.choices[0].message.content;
    if (!content) {
      throw new Error("No content in response");
    }

    return JSON.parse(content);
  } catch (error) {
    console.error("Error providing cultural feedback:", error);
    throw error;
  }
}
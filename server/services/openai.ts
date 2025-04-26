import OpenAI from "openai";

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

/**
 * Generate a grammatically correct English translation for a Spanish sentence
 */
export async function translateSpanishToEnglish(
  spanishText: string,
  preferBritishEnglish: boolean = true
): Promise<string> {
  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4o", // the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
      messages: [
        {
          role: "system",
          content: `You are a professional Spanish-English translator. Translate the provided Spanish text into ${
            preferBritishEnglish ? "British" : "American"
          } English, ensuring the translation is natural, grammatically correct, and captures the nuances of the original text.`
        },
        {
          role: "user",
          content: spanishText
        }
      ]
    });

    return response.choices[0].message.content || spanishText;
  } catch (error: unknown) {
    console.error("Error in translateSpanishToEnglish:", error);
    const errorMessage = error instanceof Error ? error.message : String(error);
    throw new Error(`Failed to translate Spanish text: ${errorMessage}`);
  }
}

/**
 * Analyze a Spanish sentence for grammar, structure and generate word-by-word translation
 */
export async function analyzeSpanishSentence(spanishText: string): Promise<{
  englishTranslation: string;
  words: Array<{
    spanishWord: string;
    englishWord: string;
    lemma: string;
    partOfSpeech: string;
    ukPronunciation?: string;
    usPronunciation?: string;
    ipaSpanish?: string;
    ipaEnglish?: string;
    audioUrl?: string;
    examples?: Array<{
      spanish: string;
      english: string;
    }>;
    grammarNotes?: string;
    conjugations?: Array<{
      form: string;
      value: string;
    }>;
    gender?: string;
    number?: string;
    formality?: string;
  }>;
  grammar?: string;
  structuralNotes?: string;
}> {
  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4o", // the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
      messages: [
        {
          role: "system",
          content: `You are a linguist specializing in Spanish language analysis with expertise in grammatical categorization. For the given Spanish sentence, provide:
          1. A high-quality English translation
          2. A rigorously accurate word-by-word analysis with precise part of speech tagging and proper English translations
          3. Detailed pronunciation guidance including IPA notation for both Spanish and English words
          4. Comprehensive grammar notes explaining the sentence structure
          5. Detailed conjugation information for verbs
          6. Grammatical gender, number and formality level for relevant words
          
          IMPORTANT PART OF SPEECH TAGGING RULES:
          - Use standard linguistic part of speech categories: noun, verb, adjective, adverb, pronoun, preposition, conjunction, determiner, interjection, article
          - Be extremely precise about assigning the correct part of speech
          - Pay close attention to context to determine the role of each word
          - For verbs, include their form (e.g., "verb (present)", "verb (conditional)", "verb (infinitive)", "verb (preterite)")
          - For compound forms, identify each component correctly
          - "si" (if/whether) is a conjunction, not an adverb
          - "más" (more) is an adverb, not a noun
          - "tener" (to have) is a verb in infinitive form
          - "a" is typically a preposition, not an adverb
          - "para" is a preposition (meaning "for" or "in order to"), not an adverb
          
          PRONUNCIATION REQUIREMENTS:
          - Include IPA transcription for both Spanish and English versions of each word
          - Specify both UK and US pronunciation variants where they differ
          - For Spanish words, provide detailed guidance on regional pronunciation differences if relevant
          
          EXAMPLES AND GRAMMAR NOTES:
          - Provide at least one example sentence for each word showing its usage in a different context
          - Include specific grammar notes about how each word functions in the given sentence
          - For verbs, provide key conjugation forms (present, past, future, subjunctive as relevant)
          
          Format your response as valid JSON with the following structure:
          {
            "englishTranslation": "complete sentence translation",
            "words": [
              {
                "spanishWord": "word as it appears in text",
                "englishWord": "English translation of just this word",
                "lemma": "base form",
                "partOfSpeech": "precise part of speech with additional form info if applicable",
                "ukPronunciation": "British pronunciation guidance",
                "usPronunciation": "American pronunciation guidance",
                "ipaSpanish": "IPA transcription for Spanish pronunciation",
                "ipaEnglish": "IPA transcription for English pronunciation",
                "examples": [
                  {
                    "spanish": "Example sentence in Spanish",
                    "english": "Translation of example"
                  }
                ],
                "grammarNotes": "Specific notes about this word's grammatical function",
                "conjugations": [
                  {
                    "form": "present", 
                    "value": "conjugated form"
                  }
                ],
                "gender": "masculine/feminine/neuter if applicable",
                "number": "singular/plural if applicable",
                "formality": "formal/informal if applicable"
              }
            ],
            "grammar": "explanation of grammar structure",
            "structuralNotes": "detailed analysis of sentence construction"
          }`
        },
        {
          role: "user",
          content: spanishText
        }
      ],
      response_format: { type: "json_object" }
    });

    const content = response.choices[0].message.content || "{}";
    const result = JSON.parse(content);
    
    // Post-process to validate and correct any grammatical errors
    if (result.words && Array.isArray(result.words)) {
      result.words = result.words.map((word: any) => {
        // Fix common POS errors
        const commonPrepositions = ["a", "de", "en", "con", "por", "para", "sin", "sobre", "hasta", "desde", "entre", "hacia"];
        const commonConjunctions = ["y", "o", "pero", "si", "porque", "aunque", "cuando", "como", "que", "pues", "sino"];
        const commonDeterminers = ["el", "la", "los", "las", "un", "una", "unos", "unas", "este", "esta", "estos", "estas", "ese", "esa", "esos", "esas"];
        
        // Check for common misclassifications
        if (commonPrepositions.includes(word.spanishWord.toLowerCase()) && !word.partOfSpeech.includes("preposition")) {
          word.partOfSpeech = "preposition";
        } else if (commonConjunctions.includes(word.spanishWord.toLowerCase()) && !word.partOfSpeech.includes("conjunction")) {
          word.partOfSpeech = "conjunction";
        } else if (commonDeterminers.includes(word.spanishWord.toLowerCase()) && !word.partOfSpeech.includes("determiner") && !word.partOfSpeech.includes("article")) {
          word.partOfSpeech = "determiner";
        }
          
        // Fix verb forms
        if ((word.spanishWord.endsWith("ar") || word.spanishWord.endsWith("er") || word.spanishWord.endsWith("ir")) 
            && word.spanishWord.length > 2) {
          if (!word.partOfSpeech.includes("verb")) {
            word.partOfSpeech = "verb (infinitive)";
          }
        }
        
        // Ensure translations match common words
        if (word.spanishWord.toLowerCase() === "si" && word.englishWord.toLowerCase() !== "if") {
          word.englishWord = "if";
        }
        if (word.spanishWord.toLowerCase() === "más" && word.englishWord.toLowerCase() !== "more") {
          word.englishWord = "more";
        }
        if (word.spanishWord.toLowerCase() === "tiempo" && word.englishWord.toLowerCase() !== "time") {
          word.englishWord = "time";
        }
        if (word.spanishWord.toLowerCase() === "libre" && word.partOfSpeech.includes("adjective") && word.englishWord.toLowerCase() !== "free") {
          word.englishWord = "free";
        }
        
        // Ensure IPA fields are present
        if (!word.ipaSpanish) {
          word.ipaSpanish = "";
        }
        if (!word.ipaEnglish) {
          word.ipaEnglish = "";
        }
        
        // Ensure examples field is an array
        if (!word.examples || !Array.isArray(word.examples)) {
          word.examples = [];
        }
        
        return word;
      });
    }
    
    return result;
  } catch (error: unknown) {
    console.error("Error in analyzeSpanishSentence:", error);
    const errorMessage = error instanceof Error ? error.message : String(error);
    throw new Error(`Failed to analyze Spanish sentence: ${errorMessage}`);
  }
}

/**
 * Generate interactive exercises based on a Spanish sentence or word
 */
export async function generateExercises(
  spanishText: string,
  exerciseType: "multiple_choice" | "fill_blank" | "mixed" = "mixed"
): Promise<{
  exercises: Array<{
    type: string;
    question: string;
    options?: string[];
    correctAnswer: string;
    explanation: string;
  }>;
}> {
  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4o", // the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
      messages: [
        {
          role: "system",
          content: `You are a professional Spanish language educator. Generate interactive exercises based on the provided Spanish text.
          
          ${
            exerciseType === "multiple_choice"
              ? "Generate only multiple-choice questions with 4 options each."
              : exerciseType === "fill_blank"
              ? "Generate only fill-in-the-blank exercises."
              : "Generate a mix of multiple-choice questions with 4 options each and fill-in-the-blank exercises."
          }
          
          Format your response as valid JSON with the following structure:
          {
            "exercises": [
              {
                "type": "multiple_choice or fill_blank",
                "question": "The exercise question",
                "options": ["option1", "option2", "option3", "option4"],  // Include only for multiple_choice
                "correctAnswer": "the correct answer",
                "explanation": "Explanation of why this is correct and the learning opportunity"
              }
            ]
          }`
        },
        {
          role: "user",
          content: spanishText
        }
      ],
      response_format: { type: "json_object" }
    });

    const content = response.choices[0].message.content || "{}";
    const result = JSON.parse(content);
    return result;
  } catch (error: unknown) {
    console.error("Error in generateExercises:", error);
    const errorMessage = error instanceof Error ? error.message : String(error);
    throw new Error(`Failed to generate exercises: ${errorMessage}`);
  }
}

/**
 * Get feedback on a user's Spanish text or translation attempt
 */
export async function provideFeedback(
  userText: string,
  correctText: string,
  isTranslation: boolean = false
): Promise<{
  feedback: string;
  score: number;
  improvements: string[];
}> {
  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4o", // the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
      messages: [
        {
          role: "system",
          content: `You are a supportive and encouraging Spanish language tutor. Provide constructive feedback on the user's ${
            isTranslation ? "translation attempt" : "Spanish text"
          }.
          
          Compare the user's response with the correct version and highlight:
          - What they did well
          - Specific areas for improvement 
          - Score their attempt on a scale of 1-100
          
          Format your response as valid JSON with the following structure:
          {
            "feedback": "detailed, encouraging and specific feedback",
            "score": 85,  // a number between 1-100
            "improvements": ["specific point 1", "specific point 2"]
          }`
        },
        {
          role: "user",
          content: `User's response: "${userText}"
          Correct response: "${correctText}"`
        }
      ],
      response_format: { type: "json_object" }
    });

    const content = response.choices[0].message.content || "{}";
    const result = JSON.parse(content);
    return result;
  } catch (error: unknown) {
    console.error("Error in provideFeedback:", error);
    const errorMessage = error instanceof Error ? error.message : String(error);
    throw new Error(`Failed to provide feedback: ${errorMessage}`);
  }
}
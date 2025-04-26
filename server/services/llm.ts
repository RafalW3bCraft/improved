/**
 * LLM service for generating natural language content
 */

import { logSystemEvent } from '../db';
import OpenAI from 'openai';

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
// the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
const MODEL = 'gpt-4o';

interface SentenceGenerationParams {
  difficulty?: string;
  topic?: string;
  grammarFocus?: string;
  cefrLevel?: string;
}

interface WordData {
  spanishWord: string;
  englishTranslation: string;
  pronunciation: string;
  partOfSpeech: string;
  gender?: string;
  tense?: string;
  form?: string;
  isConjugated?: boolean;
  baseForm?: string;
}

interface GeneratedSentence {
  spanishText: string;
  englishText: string;
  wordByWordData: WordData[];
}

/**
 * Generate a Spanish sentence with comprehensive word-by-word analysis
 */
export async function generateSentence(params: SentenceGenerationParams): Promise<GeneratedSentence> {
  try {
    const { difficulty, topic, grammarFocus, cefrLevel } = params;
    
    const prompt = `Generate a single Spanish sentence with its English translation and detailed word-by-word analysis.

Parameters:
- Difficulty: ${difficulty || 'intermediate'}
- Topic: ${topic || 'everyday conversation'}
- Grammar Focus: ${grammarFocus || 'present tense'}
- CEFR Level: ${cefrLevel || 'B1'}

For the word-by-word analysis, provide:
1. Each Spanish word
2. Its English translation
3. Pronunciation guide using simplified IPA or phonetic English
4. Part of speech (noun, verb, adjective, etc.)
5. For nouns: gender (masculine/feminine)
6. For verbs: tense and whether it's conjugated (include base form if conjugated)

Format your response as JSON in EXACTLY this format:
{
  "spanishText": "Complete Spanish sentence",
  "englishText": "Complete English translation",
  "wordByWordData": [
    {
      "spanishWord": "hola",
      "englishTranslation": "hello",
      "pronunciation": "OH-lah",
      "partOfSpeech": "interjection"
    },
    {
      "spanishWord": "cómo",
      "englishTranslation": "how",
      "pronunciation": "KOH-moh",
      "partOfSpeech": "adverb"
    },
    {
      "spanishWord": "estás",
      "englishTranslation": "are",
      "pronunciation": "eh-STAHS",
      "partOfSpeech": "verb",
      "tense": "present",
      "isConjugated": true,
      "baseForm": "estar"
    }
  ]
}

IMPORTANT GUIDELINES:
1. Ensure the Spanish is grammatically correct 
2. Match the difficulty level to the CEFR level
3. Focus on the requested grammar point
4. Create natural, useful sentences a language learner would encounter
5. For articles and pronouns, clearly identify them as such (e.g., "el" as article, "yo" as pronoun)
6. Be precise with part of speech classifications

Respond ONLY with the JSON object and nothing else.`;

    const response = await openai.chat.completions.create({
      model: MODEL,
      messages: [
        { role: 'system', content: 'You are a professional Spanish language curriculum developer, specializing in creating educational content for Spanish learners.' },
        { role: 'user', content: prompt }
      ],
      temperature: 0.5,
      response_format: { type: 'json_object' }
    });

    const content = response.choices[0].message.content;
    if (!content) {
      throw new Error('Empty response from LLM');
    }

    const result = JSON.parse(content) as GeneratedSentence;
    
    // Log the generated sentence
    await logSystemEvent('info', `Generated sentence: "${result.spanishText}" (${difficulty || 'intermediate'}, ${cefrLevel || 'B1'})`);
    
    return result;
  } catch (error) {
    console.error('Error generating sentence:', error);
    await logSystemEvent('error', `Sentence generation failed: ${error instanceof Error ? error.message : String(error)}`);
    throw new Error(`Failed to generate sentence: ${error instanceof Error ? error.message : String(error)}`);
  }
}

/**
 * Analyze a Spanish text to produce word-by-word data
 */
export async function analyzeText(spanishText: string, englishText?: string): Promise<WordData[]> {
  try {
    const prompt = `Analyze the following Spanish sentence word-by-word with detailed grammatical information:

Spanish: "${spanishText}"
${englishText ? `English translation: "${englishText}"` : ''}

For each word, provide:
1. The Spanish word as it appears in the text
2. Its English translation in context
3. Pronunciation guide using simplified IPA or phonetic English
4. Part of speech (noun, verb, adjective, etc.)
5. For nouns: gender (masculine/feminine)
6. For verbs: tense and whether it's conjugated (include base form if conjugated)

Format your response as JSON in EXACTLY this format:
[
  {
    "spanishWord": "hola",
    "englishTranslation": "hello",
    "pronunciation": "OH-lah",
    "partOfSpeech": "interjection"
  },
  {
    "spanishWord": "cómo",
    "englishTranslation": "how",
    "pronunciation": "KOH-moh",
    "partOfSpeech": "adverb"
  },
  {
    "spanishWord": "estás",
    "englishTranslation": "are",
    "pronunciation": "eh-STAHS",
    "partOfSpeech": "verb",
    "tense": "present",
    "isConjugated": true,
    "baseForm": "estar"
  }
]

IMPORTANT GUIDELINES:
1. Analyze EVERY word in the sentence, including articles, prepositions, and pronouns
2. Be precise with grammatical terms
3. For articles and pronouns, clearly identify them (e.g., "el" as definite article, "yo" as personal pronoun)
4. For verb conjugations, always include the base form and tense
5. For pronouns attached to verbs (e.g., "dímelo"), split them and analyze each part

Respond ONLY with the JSON array and nothing else.`;

    const response = await openai.chat.completions.create({
      model: MODEL,
      messages: [
        { role: 'system', content: 'You are a professional Spanish language grammatical analyst, specializing in detailed linguistic analysis of Spanish text.' },
        { role: 'user', content: prompt }
      ],
      temperature: 0.3,
      response_format: { type: 'json_object' }
    });

    const content = response.choices[0].message.content;
    if (!content) {
      throw new Error('Empty response from LLM');
    }

    const result = JSON.parse(content) as WordData[];
    
    // Post-process to fix common errors
    return await postProcessWordAnalysis(result);
  } catch (error) {
    console.error('Error analyzing text:', error);
    await logSystemEvent('error', `Text analysis failed: ${error instanceof Error ? error.message : String(error)}`);
    throw new Error(`Failed to analyze text: ${error instanceof Error ? error.message : String(error)}`);
  }
}

/**
 * Post-process word analysis to fix common errors in grammatical classification
 */
export async function postProcessWordAnalysis(wordData: WordData[]): Promise<WordData[]> {
  try {
    // Common prepositions in Spanish
    const commonPrepositions = [
      'a', 'ante', 'bajo', 'con', 'contra', 'de', 'desde', 'durante', 
      'en', 'entre', 'hacia', 'hasta', 'mediante', 'para', 'por', 
      'según', 'sin', 'sobre', 'tras'
    ];
    
    // Common determiners/articles in Spanish
    const commonDeterminers = [
      'el', 'la', 'los', 'las', 'un', 'una', 'unos', 'unas',
      'este', 'esta', 'estos', 'estas', 'ese', 'esa', 'esos', 'esas',
      'aquel', 'aquella', 'aquellos', 'aquellas', 'mi', 'mis', 'tu', 'tus',
      'su', 'sus', 'nuestro', 'nuestra', 'nuestros', 'nuestras'
    ];
    
    // Common conjunctions in Spanish
    const commonConjunctions = [
      'y', 'e', 'o', 'u', 'ni', 'pero', 'sino', 'aunque', 'porque',
      'pues', 'si', 'como', 'cuando', 'mientras', 'antes', 'después',
      'ya', 'que', 'donde', 'según'
    ];
    
    // Apply common fixes to each word
    return wordData.map(word => {
      // Fix prepositions
      if (commonPrepositions.includes(word.spanishWord.toLowerCase())) {
        return { ...word, partOfSpeech: 'preposition' };
      }
      
      // Fix determiners/articles
      if (commonDeterminers.includes(word.spanishWord.toLowerCase())) {
        // Specific fix for articles
        if (['el', 'la', 'los', 'las', 'un', 'una', 'unos', 'unas'].includes(word.spanishWord.toLowerCase())) {
          const isDefinite = ['el', 'la', 'los', 'las'].includes(word.spanishWord.toLowerCase());
          return { 
            ...word, 
            partOfSpeech: 'article',
            form: isDefinite ? 'definite' : 'indefinite'
          };
        }
        return { ...word, partOfSpeech: 'determiner' };
      }
      
      // Fix conjunctions
      if (commonConjunctions.includes(word.spanishWord.toLowerCase())) {
        return { ...word, partOfSpeech: 'conjunction' };
      }
      
      return word;
    });
  } catch (error) {
    console.error('Error post-processing word analysis:', error);
    await logSystemEvent('error', `Word analysis post-processing failed: ${error instanceof Error ? error.message : String(error)}`);
    
    // Return the original data if there's an error
    return wordData;
  }
}
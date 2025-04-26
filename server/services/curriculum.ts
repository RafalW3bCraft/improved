/**
 * Curriculum service for generating and managing learning curriculum
 */

import { db, logSystemEvent } from '../db';
import {
  curriculumTracks, type CurriculumTrack, type InsertCurriculumTrack,
  lessons, type Lesson, type InsertLesson,
  lessonSentences, type LessonSentence,
  learningSentences, type LearningSentence, type InsertLearningSentence
} from '@shared/schema';
import { eq, sql } from 'drizzle-orm';
import { generateSentence, postProcessWordAnalysis } from './llm';
import { 
  getCurriculumTrack, 
  getLesson, 
  getMaxLessonNumber, 
  countLessons
} from '../storage-curriculum';

/**
 * Generate CEFR-appropriate vocabulary based on level
 */
function getVocabularyForLevel(level: string): string[] {
  // Vocabulary focus topics by CEFR level
  const vocabularyByLevel = {
    A1: [
      'Greetings and basic phrases',
      'Numbers 1-100',
      'Family members',
      'Days of the week',
      'Telling time',
      'Weather',
      'Colors',
      'Food and drinks',
      'Basic verbs',
      'Classroom objects'
    ],
    A2: [
      'Shopping',
      'Transportation',
      'Directions',
      'Jobs and professions',
      'The house and furniture',
      'Clothing',
      'Daily routines',
      'Hobbies and free time',
      'Months and dates',
      'Places in town'
    ],
    B1: [
      'Travel and tourism',
      'Health and medicine',
      'Technology',
      'Feelings and emotions',
      'Environment',
      'Education',
      'Music and arts',
      'Sports',
      'Personality traits',
      'Food and cooking'
    ],
    B2: [
      'Work and business',
      'News and media',
      'Politics',
      'Science',
      'Law and justice',
      'Urban life',
      'Nature and wildlife',
      'Personal relationships',
      'Social issues',
      'Cultural differences'
    ],
    C1: [
      'Academic language',
      'Philosophy',
      'Psychology',
      'Literature',
      'Economics',
      'Global issues',
      'Idiomatic expressions',
      'Formal language',
      'Abstract concepts',
      'Professional development'
    ],
    Q: [
      'Wisdom and knowledge',
      'Spiritual concepts',
      'Ethics and morality',
      'Personal growth',
      'Universal truths',
      'Character building',
      'Inner qualities',
      'Life lessons',
      'Human values',
      'Existential questions'
    ]
  };

  // Return vocabulary for the given level, or for A1 if level not found
  return vocabularyByLevel[level as keyof typeof vocabularyByLevel] || vocabularyByLevel.A1;
}

/**
 * Initialize curriculum data if it doesn't exist
 */
export async function initializeCurriculum(): Promise<void> {
  try {
    // Check if we already have curriculum tracks
    const existingTracks = await db.select().from(curriculumTracks);
    
    if (existingTracks.length > 0) {
      await logSystemEvent('info', `Curriculum already initialized with ${existingTracks.length} tracks`);
      return;
    }
    
    await logSystemEvent('info', 'Initializing curriculum with default tracks');
    
    // Create the 6 default tracks
    const defaultTracks = [
      {
        code: 'basic',
        title: 'Basic Survival',
        description: 'Essential Spanish for everyday situations and basic conversation.',
        cefrLevel: 'A1',
        iconName: 'graduation-cap'
      },
      {
        code: 'travel',
        title: 'Travel & Conversation',
        description: 'Spanish for traveling and having conversations with native speakers.',
        cefrLevel: 'A2',
        iconName: 'plane'
      },
      {
        code: 'grammar',
        title: 'Grammar & Usage',
        description: 'Focus on Spanish grammar structures and practical usage.',
        cefrLevel: 'B1',
        iconName: 'book'
      },
      {
        code: 'fluency',
        title: 'Intermediate Fluency',
        description: 'Develop greater fluency and vocabulary for complex topics.',
        cefrLevel: 'B2',
        iconName: 'comments'
      },
      {
        code: 'media',
        title: 'Native Media Comprehension',
        description: 'Understand native Spanish media, literature, and advanced conversations.',
        cefrLevel: 'C1',
        iconName: 'film'
      },
      {
        code: 'wisdom',
        title: 'Quranic-style Wisdom',
        description: 'Poetic and philosophical expressions in a style similar to sacred texts.',
        cefrLevel: 'Q',
        iconName: 'star'
      }
    ];
    
    // Insert tracks one by one and create lessons for each track
    for (const trackData of defaultTracks) {
      const track: InsertCurriculumTrack = {
        code: trackData.code,
        title: trackData.title,
        description: trackData.description,
        cefrLevel: trackData.cefrLevel,
        iconName: trackData.iconName
      };
      
      // Create track
      const [createdTrack] = await db.insert(curriculumTracks).values(track).returning();
      await logSystemEvent('info', `Created curriculum track: ${track.title} (${track.cefrLevel})`);
      
      // Get vocabulary topics for this level
      const vocabularyTopics = getVocabularyForLevel(track.cefrLevel);
      
      // Create lessons for the track (30-37 lessons per track)
      const lessonCount = track.cefrLevel === 'Q' ? 30 : 37;
      
      for (let i = 1; i <= lessonCount; i++) {
        // Alternate vocabulary topics and add some variety
        const topicIndex = (i - 1) % vocabularyTopics.length;
        const vocabularyFocus = vocabularyTopics[topicIndex];
        
        // Create different grammar focuses based on level and progression
        let grammarFocus = '';
        
        if (track.cefrLevel === 'A1') {
          if (i <= 10) grammarFocus = 'Present tense';
          else if (i <= 20) grammarFocus = 'Basic questions';
          else if (i <= 30) grammarFocus = 'Adjectives and articles';
          else grammarFocus = 'Nouns and pronouns';
        } else if (track.cefrLevel === 'A2') {
          if (i <= 10) grammarFocus = 'Past tense (preterite)';
          else if (i <= 20) grammarFocus = 'Past tense (imperfect)';
          else if (i <= 30) grammarFocus = 'Future tense expressions';
          else grammarFocus = 'Reflexive verbs';
        } else if (track.cefrLevel === 'B1') {
          if (i <= 10) grammarFocus = 'Present perfect';
          else if (i <= 20) grammarFocus = 'Subjunctive mood basics';
          else if (i <= 30) grammarFocus = 'Commands (imperative)';
          else grammarFocus = 'Conditional tense';
        } else if (track.cefrLevel === 'B2') {
          if (i <= 10) grammarFocus = 'Past perfect';
          else if (i <= 20) grammarFocus = 'Advanced subjunctive';
          else if (i <= 30) grammarFocus = 'Conditional perfect';
          else grammarFocus = 'Passive voice';
        } else if (track.cefrLevel === 'C1') {
          if (i <= 10) grammarFocus = 'Advanced verb tenses';
          else if (i <= 20) grammarFocus = 'Idiomatic expressions';
          else if (i <= 30) grammarFocus = 'Complex sentences';
          else grammarFocus = 'Literary language';
        } else {
          // Q level
          grammarFocus = 'Poetic structures and expressions';
        }
        
        const lesson: InsertLesson = {
          trackId: createdTrack.id,
          lessonNumber: i,
          title: `Lesson ${i}: ${vocabularyFocus}`,
          description: `Focus on ${vocabularyFocus.toLowerCase()} with ${grammarFocus.toLowerCase()}.`,
          grammarFocus,
          vocabularyFocus
        };
        
        // Create lesson
        await db.insert(lessons).values(lesson).returning();
      }
      
      // Update track with total lesson count
      await db
        .update(curriculumTracks)
        .set({ totalLessons: lessonCount })
        .where(eq(curriculumTracks.id, createdTrack.id));
    }
    
    await logSystemEvent('info', 'Curriculum initialization completed successfully');
  } catch (error) {
    console.error('Error initializing curriculum:', error);
    await logSystemEvent('error', `Curriculum initialization failed: ${error instanceof Error ? error.message : String(error)}`);
    throw error;
  }
}

/**
 * Generate a sentence for a specific lesson and add it to the lesson
 */
export async function generateSentenceForLesson(
  lessonId: number,
  options: {
    difficulty?: string,
    topic?: string,
    grammarFocus?: string
  } = {}
): Promise<LearningSentence & { lessonSentenceId: number, orderIndex: number }> {
  try {
    // Get lesson info
    const lesson = await getLesson(lessonId);
    if (!lesson) {
      throw new Error(`Lesson with ID ${lessonId} not found`);
    }
    
    // Get track info
    const track = await getCurriculumTrack(lesson.trackId);
    if (!track) {
      throw new Error(`Track with ID ${lesson.trackId} not found`);
    }
    
    // Determine difficulty based on CEFR level if not specified
    let difficulty = '';
    if (track.cefrLevel === 'A1') difficulty = 'beginner';
    else if (track.cefrLevel === 'A2') difficulty = 'elementary';
    else if (track.cefrLevel === 'B1') difficulty = 'intermediate';
    else if (track.cefrLevel === 'B2') difficulty = 'upper-intermediate';
    else if (track.cefrLevel === 'C1') difficulty = 'advanced';
    else difficulty = 'advanced';
    
    if (options.difficulty) {
      difficulty = options.difficulty;
    }
    
    // Generate a sentence with the LLM
    const generatedData = await generateSentence({
      difficulty,
      topic: options.topic || lesson.vocabularyFocus,
      grammarFocus: options.grammarFocus || lesson.grammarFocus,
      cefrLevel: track.cefrLevel
    });
    
    // Post-process the word analysis to fix common errors
    const processedWordData = await postProcessWordAnalysis(generatedData.wordByWordData);
    
    // Create the sentence in the database
    const sentenceData: InsertLearningSentence = {
      spanishText: generatedData.spanishText,
      englishText: generatedData.englishText,
      difficulty,
      topic: options.topic || lesson.vocabularyFocus,
      grammarFocus: options.grammarFocus || lesson.grammarFocus,
      wordByWordData: processedWordData
    };
    
    const [sentence] = await db.insert(learningSentences).values(sentenceData).returning();
    
    // Get current max order index for this lesson
    const orderIndexResults = await db
      .select({
        maxOrder: sql<number>`MAX(${lessonSentences.orderIndex})`
      })
      .from(lessonSentences)
      .where(eq(lessonSentences.lessonId, lessonId));
    
    const nextOrderIndex = orderIndexResults[0].maxOrder ? orderIndexResults[0].maxOrder + 1 : 0;
    
    // Add the sentence to the lesson
    const [lessonSentence] = await db.insert(lessonSentences).values({
      lessonId,
      sentenceId: sentence.id,
      orderIndex: nextOrderIndex
    }).returning();
    
    return {
      ...sentence,
      lessonSentenceId: lessonSentence.id,
      orderIndex: lessonSentence.orderIndex
    };
  } catch (error) {
    console.error('Error generating sentence for lesson:', error);
    await logSystemEvent('error', `Sentence generation failed for lesson ${lessonId}: ${error instanceof Error ? error.message : String(error)}`);
    throw error;
  }
}

/**
 * Populate a lesson with sentences
 */
export async function populateLesson(lessonId: number, count: number = 5): Promise<number> {
  try {
    let generatedCount = 0;
    
    for (let i = 0; i < count; i++) {
      await generateSentenceForLesson(lessonId);
      generatedCount++;
      
      // Log progress for every 5 sentences
      if (generatedCount % 5 === 0 || generatedCount === count) {
        await logSystemEvent('info', `Generated ${generatedCount}/${count} sentences for lesson ${lessonId}`);
      }
    }
    
    return generatedCount;
  } catch (error) {
    console.error('Error populating lesson with sentences:', error);
    await logSystemEvent('error', `Lesson population failed for lesson ${lessonId}: ${error instanceof Error ? error.message : String(error)}`);
    throw error;
  }
}

/**
 * Generate a full track of lessons with sentences
 */
export async function generateTrack(trackId: number, sentencesPerLesson: number = 5): Promise<number> {
  try {
    // Get all lessons for the track
    const trackLessons = await db.select().from(lessons).where(eq(lessons.trackId, trackId));
    
    let totalGenerated = 0;
    
    for (const lesson of trackLessons) {
      const count = await populateLesson(lesson.id, sentencesPerLesson);
      totalGenerated += count;
      
      await logSystemEvent('info', `Populated lesson ${lesson.id} (${lesson.title}) with ${count} sentences`);
    }
    
    return totalGenerated;
  } catch (error) {
    console.error('Error generating track:', error);
    await logSystemEvent('error', `Track generation failed for track ${trackId}: ${error instanceof Error ? error.message : String(error)}`);
    throw error;
  }
}
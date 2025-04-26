import { db } from './db';
import { sql } from 'drizzle-orm';

/**
 * Apply database migrations for our schema changes
 */
export async function applyMigrations() {
  console.log('Starting database migrations...');
  
  try {
    // Create user_progress table if it doesn't exist
    console.log('Creating user_progress table if it doesn\'t exist...');
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS user_progress (
        id SERIAL PRIMARY KEY,
        user_id INTEGER NOT NULL,
        words_learned INTEGER DEFAULT 0,
        lessons_completed INTEGER DEFAULT 0,
        average_score INTEGER DEFAULT 0,
        last_active TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        strengths TEXT[],
        weaknesses TEXT[]
      );
    `);
    
    // Create learning_sentences table if it doesn't exist
    console.log('Creating learning_sentences table if it doesn\'t exist...');
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS learning_sentences (
        id SERIAL PRIMARY KEY,
        spanish_text TEXT NOT NULL,
        english_text TEXT NOT NULL,
        difficulty TEXT NOT NULL,
        topic TEXT,
        grammar_focus TEXT,
        word_by_word_data JSONB,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);
    
    // Create exercises table if it doesn't exist
    console.log('Creating exercises table if it doesn\'t exist...');
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS exercises (
        id SERIAL PRIMARY KEY,
        type TEXT NOT NULL,
        sentence_id INTEGER,
        question TEXT NOT NULL,
        options TEXT[],
        correct_answer TEXT NOT NULL,
        explanation TEXT,
        difficulty TEXT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);
    
    // Create exercise_attempts table if it doesn't exist
    console.log('Creating exercise_attempts table if it doesn\'t exist...');
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS exercise_attempts (
        id SERIAL PRIMARY KEY,
        user_id INTEGER NOT NULL,
        exercise_id INTEGER NOT NULL,
        user_answer TEXT NOT NULL,
        is_correct BOOLEAN NOT NULL,
        feedback TEXT,
        attempted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);
    
    // Create curriculum_tracks table if it doesn't exist
    console.log('Creating curriculum_tracks table if it doesn\'t exist...');
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS curriculum_tracks (
        id SERIAL PRIMARY KEY,
        code TEXT NOT NULL UNIQUE,
        title TEXT NOT NULL,
        description TEXT,
        cefr_level TEXT NOT NULL,
        total_lessons INTEGER DEFAULT 0,
        icon_name TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);
    
    // Create lessons table if it doesn't exist
    console.log('Creating lessons table if it doesn\'t exist...');
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS lessons (
        id SERIAL PRIMARY KEY,
        track_id INTEGER NOT NULL,
        lesson_number INTEGER NOT NULL,
        title TEXT NOT NULL,
        description TEXT,
        grammar_focus TEXT,
        vocabulary_focus TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);
    
    // Create lesson_sentences table if it doesn't exist
    console.log('Creating lesson_sentences table if it doesn\'t exist...');
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS lesson_sentences (
        id SERIAL PRIMARY KEY,
        lesson_id INTEGER NOT NULL,
        sentence_id INTEGER NOT NULL,
        order_index INTEGER NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);
    
    // Create user_lesson_progress table if it doesn't exist
    console.log('Creating user_lesson_progress table if it doesn\'t exist...');
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS user_lesson_progress (
        id SERIAL PRIMARY KEY,
        user_id INTEGER NOT NULL,
        lesson_id INTEGER NOT NULL,
        completed BOOLEAN DEFAULT FALSE,
        progress INTEGER DEFAULT 0,
        last_accessed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);
    
    console.log('Database migrations completed successfully');
    return { success: true, message: 'Migrations applied successfully' };
  } catch (error) {
    console.error('Migration error:', error);
    return { success: false, message: `Migration failed: ${error.message}` };
  }
}
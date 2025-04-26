import { pgTable, text, serial, integer, boolean, timestamp, jsonb } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// User schema (keeping the existing one)
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  preferBritishEnglish: boolean("prefer_british_english").default(true),
  learningLevel: text("learning_level").default("beginner"), // 'beginner', 'intermediate', 'advanced'
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
  preferBritishEnglish: true,
  learningLevel: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

// User progress and learning data
export const userProgress = pgTable("user_progress", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  wordsLearned: integer("words_learned").default(0),
  lessonsCompleted: integer("lessons_completed").default(0),
  averageScore: integer("average_score").default(0), // 0-100
  lastActive: timestamp("last_active").defaultNow().notNull(),
  strengths: text("strengths").array(), // Areas of strength
  weaknesses: text("weaknesses").array(), // Areas for improvement
});

// Dictionary entry schema (extended)
export const dictionaryEntries = pgTable("dictionary_entries", {
  id: serial("id").primaryKey(),
  sourceWord: text("source_word").notNull(),
  translation: text("translation").notNull(),
  sourceLanguage: text("source_language").notNull(), // 'en' or 'es'
  targetLanguage: text("target_language").notNull(), // 'en' or 'es'
  examples: text("examples").array(), // Optional examples of usage
  ukPronunciation: text("uk_pronunciation"), // IPA for British English
  usPronunciation: text("us_pronunciation"), // IPA for American English
  partOfSpeech: text("part_of_speech"), // noun, verb, adjective, etc.
  difficulty: text("difficulty").default("medium"), // easy, medium, hard
  tags: text("tags").array(), // For categorization (e.g., "food", "travel")
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertDictionaryEntrySchema = createInsertSchema(dictionaryEntries).omit({
  id: true,
  createdAt: true,
});

export type InsertDictionaryEntry = z.infer<typeof insertDictionaryEntrySchema>;
export type DictionaryEntry = typeof dictionaryEntries.$inferSelect;

// Learning sentences for practice
export const learningSentences = pgTable("learning_sentences", {
  id: serial("id").primaryKey(),
  spanishText: text("spanish_text").notNull(),
  englishText: text("english_text").notNull(),
  difficulty: text("difficulty").notNull(), // 'beginner', 'intermediate', 'advanced'
  topic: text("topic"), // 'greetings', 'food', 'travel', etc.
  grammarFocus: text("grammar_focus"), // specific grammar point this sentence demonstrates
  wordByWordData: jsonb("word_by_word_data"), // JSON with word-by-word translation and pronunciation
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertLearningSentenceSchema = createInsertSchema(learningSentences).omit({
  id: true,
  createdAt: true,
});

export type InsertLearningSentence = z.infer<typeof insertLearningSentenceSchema>;
export type LearningSentence = typeof learningSentences.$inferSelect;

// Exercises for practice
export const exercises = pgTable("exercises", {
  id: serial("id").primaryKey(),
  type: text("type").notNull(), // 'fill-in-blank', 'reordering', 'vocabulary', 'multiple-choice'
  sentenceId: integer("sentence_id"), // Optional reference to a learning sentence
  question: text("question").notNull(),
  options: text("options").array(),
  correctAnswer: text("correct_answer").notNull(),
  explanation: text("explanation"),
  difficulty: text("difficulty").notNull(), // 'beginner', 'intermediate', 'advanced'
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertExerciseSchema = createInsertSchema(exercises).omit({
  id: true,
  createdAt: true,
});

export type InsertExercise = z.infer<typeof insertExerciseSchema>;
export type Exercise = typeof exercises.$inferSelect;

// User exercise attempts to track progress
export const exerciseAttempts = pgTable("exercise_attempts", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  exerciseId: integer("exercise_id").notNull(),
  userAnswer: text("user_answer").notNull(),
  isCorrect: boolean("is_correct").notNull(),
  feedback: text("feedback"),
  attemptedAt: timestamp("attempted_at").defaultNow().notNull(),
});

export const insertExerciseAttemptSchema = createInsertSchema(exerciseAttempts).omit({
  id: true,
  attemptedAt: true,
});

export type InsertExerciseAttempt = z.infer<typeof insertExerciseAttemptSchema>;
export type ExerciseAttempt = typeof exerciseAttempts.$inferSelect;

// Import job schema to track dictionary imports
export const importJobs = pgTable("import_jobs", {
  id: serial("id").primaryKey(),
  source: text("source").notNull(), // URL or file path
  status: text("status").notNull(), // 'pending', 'in_progress', 'completed', 'failed'
  totalEntries: integer("total_entries"), // Total number of entries
  processedEntries: integer("processed_entries").default(0), // Number of processed entries
  bidirectional: boolean("bidirectional").default(true), // Whether to create bidirectional entries
  replace: boolean("replace").default(false), // Whether to replace existing entries
  error: text("error"), // Error message if failed
  startedAt: timestamp("started_at").defaultNow().notNull(),
  completedAt: timestamp("completed_at"), // When the import was completed
});

export const insertImportJobSchema = createInsertSchema(importJobs).omit({
  id: true,
  processedEntries: true,
  error: true,
  startedAt: true,
  completedAt: true,
});

export type InsertImportJob = z.infer<typeof insertImportJobSchema>;
export type ImportJob = typeof importJobs.$inferSelect;

// System logs schema to track system events
export const systemLogs = pgTable("system_logs", {
  id: serial("id").primaryKey(),
  level: text("level").notNull(), // 'info', 'warn', 'error'
  message: text("message").notNull(),
  timestamp: timestamp("timestamp").defaultNow().notNull(),
});

export const insertSystemLogSchema = createInsertSchema(systemLogs).omit({
  id: true,
  timestamp: true,
});

export type InsertSystemLog = z.infer<typeof insertSystemLogSchema>;
export type SystemLog = typeof systemLogs.$inferSelect;

// Define relationships between tables
export const usersRelations = relations(users, ({ many }) => ({
  progress: many(userProgress),
  exerciseAttempts: many(exerciseAttempts),
}));

export const learningSentencesRelations = relations(learningSentences, ({ many }) => ({
  exercises: many(exercises),
}));

export const exercisesRelations = relations(exercises, ({ one, many }) => ({
  sentence: one(learningSentences, {
    fields: [exercises.sentenceId],
    references: [learningSentences.id],
  }),
  attempts: many(exerciseAttempts),
}));

export const exerciseAttemptsRelations = relations(exerciseAttempts, ({ one }) => ({
  exercise: one(exercises, {
    fields: [exerciseAttempts.exerciseId],
    references: [exercises.id],
  }),
  user: one(users, {
    fields: [exerciseAttempts.userId],
    references: [users.id],
  }),
}));

// Curriculum Tracks (like "Survival Spanish", "Travel & Conversation", etc.)
export const curriculumTracks = pgTable("curriculum_tracks", {
  id: serial("id").primaryKey(),
  code: text("code").notNull().unique(), // e.g., "survival-spanish"
  title: text("title").notNull(),
  description: text("description"),
  cefrLevel: text("cefr_level").notNull(), // A1, A2, B1, B2, C1, C2
  totalLessons: integer("total_lessons").default(0),
  iconName: text("icon_name"), // For UI display
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertCurriculumTrackSchema = createInsertSchema(curriculumTracks).omit({
  id: true,
  createdAt: true,
});

export type InsertCurriculumTrack = z.infer<typeof insertCurriculumTrackSchema>;
export type CurriculumTrack = typeof curriculumTracks.$inferSelect;

// Lessons within curriculum tracks
export const lessons = pgTable("lessons", {
  id: serial("id").primaryKey(),
  trackId: integer("track_id").notNull(),
  lessonNumber: integer("lesson_number").notNull(),
  title: text("title").notNull(),
  description: text("description"),
  grammarFocus: text("grammar_focus"),
  vocabularyFocus: text("vocabulary_focus"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertLessonSchema = createInsertSchema(lessons).omit({
  id: true,
  createdAt: true,
});

export type InsertLesson = z.infer<typeof insertLessonSchema>;
export type Lesson = typeof lessons.$inferSelect;

// Sentence to Lesson mappings
export const lessonSentences = pgTable("lesson_sentences", {
  id: serial("id").primaryKey(),
  lessonId: integer("lesson_id").notNull(),
  sentenceId: integer("sentence_id").notNull(),
  orderIndex: integer("order_index").notNull(), // Order within lesson
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertLessonSentenceSchema = createInsertSchema(lessonSentences).omit({
  id: true,
  createdAt: true,
});

export type InsertLessonSentence = z.infer<typeof insertLessonSentenceSchema>;
export type LessonSentence = typeof lessonSentences.$inferSelect;

// User lesson progress
export const userLessonProgress = pgTable("user_lesson_progress", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  lessonId: integer("lesson_id").notNull(),
  completed: boolean("completed").default(false),
  progress: integer("progress").default(0), // percentage completed
  lastAccessedAt: timestamp("last_accessed_at").defaultNow().notNull(),
});

export const insertUserLessonProgressSchema = createInsertSchema(userLessonProgress).omit({
  id: true,
  lastAccessedAt: true,
});

export type InsertUserLessonProgress = z.infer<typeof insertUserLessonProgressSchema>;
export type UserLessonProgress = typeof userLessonProgress.$inferSelect;

// Add relationships for curriculum
export const curriculumTracksRelations = relations(curriculumTracks, ({ many }) => ({
  lessons: many(lessons),
}));

export const lessonsRelations = relations(lessons, ({ one, many }) => ({
  track: one(curriculumTracks, {
    fields: [lessons.trackId],
    references: [curriculumTracks.id],
  }),
  lessonSentences: many(lessonSentences),
  userProgress: many(userLessonProgress),
}));

export const lessonSentencesRelations = relations(lessonSentences, ({ one }) => ({
  lesson: one(lessons, {
    fields: [lessonSentences.lessonId],
    references: [lessons.id],
  }),
  sentence: one(learningSentences, {
    fields: [lessonSentences.sentenceId],
    references: [learningSentences.id],
  }),
}));

export const userLessonProgressRelations = relations(userLessonProgress, ({ one }) => ({
  user: one(users, {
    fields: [userLessonProgress.userId],
    references: [users.id],
  }),
  lesson: one(lessons, {
    fields: [userLessonProgress.lessonId],
    references: [lessons.id],
  }),
}));

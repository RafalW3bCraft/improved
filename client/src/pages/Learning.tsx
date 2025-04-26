import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";

import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger, SelectValue } from "@/components/ui/select";
import { LearningSentence } from "@/components/learning/LearningSentence";
import { useToast } from "@/hooks/use-toast";
import type { WordData } from "@/components/learning/WordBlock";

// Type definitions based on API responses
interface LearningSentenceType {
  id: number;
  spanishText: string;
  englishText: string;
  cefr: string;
  topic: string;
  grammarFocus: string;
  wordByWordData: WordData[];
  lessonSetId?: number;
  lessonSetTitle?: string;
  lessonNumber?: number;
  nextId?: number;
  previousId?: number;
  createdAt?: string;
}

interface Exercise {
  id: number;
  type: string;
  sentenceId: number;
  question: string;
  options: string[];
  correctAnswer: string;
  explanation: string;
  difficulty: string;
  createdAt?: string;
}

// Sample CEFR level type
type CEFRLevel = "A1" | "A2" | "B1" | "B2" | "C1" | "C2";

// Sample lesson sets for the UI
const LESSON_SETS = [
  { id: 1, title: "Basic Survival", level: "A1" },
  { id: 2, title: "Travel & Conversation", level: "A2" },
  { id: 3, title: "Grammar & Usage", level: "B1" },
  { id: 4, title: "Intermediate Fluency", level: "B2" },
  { id: 5, title: "Native Media", level: "C1" },
  { id: 6, title: "Quranic-style Wisdom", level: "C1" },
];

// Sample data for development purposes (in a real app, this would come from the database)
const SAMPLE_SENTENCES: LearningSentenceType[] = [
  {
    id: 1,
    spanishText: "El gato negro duerme en la cama.",
    englishText: "The black cat sleeps on the bed.",
    wordByWordData: [
      {
        spanishWord: "El",
        englishWord: "The",
        lemma: "el",
        partOfSpeech: "determiner",
        ipaSpanish: "el",
        ipaEnglish: "ðə",
        ukPronunciation: "thuh",
        usPronunciation: "thuh",
        grammarNotes: "Definite article (masculine singular)",
        examples: [
          { spanish: "El hombre es alto.", english: "The man is tall." },
          { spanish: "El libro es interesante.", english: "The book is interesting." }
        ]
      },
      {
        spanishWord: "gato",
        englishWord: "cat",
        lemma: "gato",
        partOfSpeech: "noun",
        ipaSpanish: "ˈɡato",
        ipaEnglish: "kæt",
        ukPronunciation: "kat",
        usPronunciation: "kat",
        grammarNotes: "Masculine noun",
        examples: [
          { spanish: "Mi gato es blanco.", english: "My cat is white." },
          { spanish: "Los gatos son animales.", english: "Cats are animals." }
        ]
      },
      {
        spanishWord: "negro",
        englishWord: "black",
        lemma: "negro",
        partOfSpeech: "adjective",
        ipaSpanish: "ˈneɣɾo",
        ipaEnglish: "blæk",
        ukPronunciation: "blak",
        usPronunciation: "blak",
        grammarNotes: "Adjective (masculine form)",
        examples: [
          { spanish: "El coche negro", english: "The black car" },
          { spanish: "Tiene pelo negro", english: "He has black hair" }
        ]
      },
      {
        spanishWord: "duerme",
        englishWord: "sleeps",
        lemma: "dormir",
        partOfSpeech: "verb",
        ipaSpanish: "ˈdweɾme",
        ipaEnglish: "sliːps",
        ukPronunciation: "sleeps",
        usPronunciation: "sleeps",
        grammarNotes: "Present tense, 3rd person singular of 'dormir'",
        examples: [
          { spanish: "Ella duerme ocho horas.", english: "She sleeps eight hours." },
          { spanish: "El bebé duerme bien.", english: "The baby sleeps well." }
        ]
      },
      {
        spanishWord: "en",
        englishWord: "on",
        lemma: "en",
        partOfSpeech: "preposition",
        ipaSpanish: "en",
        ipaEnglish: "ɒn",
        ukPronunciation: "on",
        usPronunciation: "on",
        grammarNotes: "Preposition of place",
        examples: [
          { spanish: "El libro está en la mesa.", english: "The book is on the table." },
          { spanish: "Vivo en España.", english: "I live in Spain." }
        ]
      },
      {
        spanishWord: "la",
        englishWord: "the",
        lemma: "la",
        partOfSpeech: "determiner",
        ipaSpanish: "la",
        ipaEnglish: "ðə",
        ukPronunciation: "thuh",
        usPronunciation: "thuh",
        grammarNotes: "Definite article (feminine singular)",
        examples: [
          { spanish: "La casa es grande.", english: "The house is big." },
          { spanish: "La mujer habla inglés.", english: "The woman speaks English." }
        ]
      },
      {
        spanishWord: "cama",
        englishWord: "bed",
        lemma: "cama",
        partOfSpeech: "noun",
        ipaSpanish: "ˈkama",
        ipaEnglish: "bɛd",
        ukPronunciation: "bed",
        usPronunciation: "bed",
        grammarNotes: "Feminine noun",
        examples: [
          { spanish: "Mi cama es cómoda.", english: "My bed is comfortable." },
          { spanish: "Hice la cama esta mañana.", english: "I made the bed this morning." }
        ]
      },
      {
        spanishWord: ".",
        englishWord: ".",
        lemma: ".",
        partOfSpeech: "punctuation"
      }
    ],
    cefr: "A1",
    topic: "Animals",
    grammarFocus: "Present Tense",
    lessonSetId: 1,
    lessonSetTitle: "Basic Survival",
    lessonNumber: 3,
    nextId: 2,
    previousId: null
  },
  {
    id: 2,
    spanishText: "¿Dónde está el restaurante más cercano?",
    englishText: "Where is the nearest restaurant?",
    wordByWordData: [
      {
        spanishWord: "¿Dónde",
        englishWord: "Where",
        lemma: "dónde",
        partOfSpeech: "adverb",
        ipaSpanish: "ˈdonde",
        ipaEnglish: "wɛə",
        ukPronunciation: "wair",
        usPronunciation: "wehr",
        grammarNotes: "Interrogative adverb",
        examples: [
          { spanish: "¿Dónde vives?", english: "Where do you live?" },
          { spanish: "¿Dónde está el baño?", english: "Where is the bathroom?" }
        ]
      },
      {
        spanishWord: "está",
        englishWord: "is",
        lemma: "estar",
        partOfSpeech: "verb",
        ipaSpanish: "esˈta",
        ipaEnglish: "ɪz",
        ukPronunciation: "iz",
        usPronunciation: "iz",
        grammarNotes: "Present tense, 3rd person singular of 'estar'",
        examples: [
          { spanish: "Él está en casa.", english: "He is at home." },
          { spanish: "¿Dónde está el libro?", english: "Where is the book?" }
        ]
      },
      {
        spanishWord: "el",
        englishWord: "the",
        lemma: "el",
        partOfSpeech: "determiner",
        ipaSpanish: "el",
        ipaEnglish: "ðə",
        ukPronunciation: "thuh",
        usPronunciation: "thuh",
        grammarNotes: "Definite article (masculine singular)",
        examples: [
          { spanish: "El hombre es alto.", english: "The man is tall." },
          { spanish: "El libro es interesante.", english: "The book is interesting." }
        ]
      },
      {
        spanishWord: "restaurante",
        englishWord: "restaurant",
        lemma: "restaurante",
        partOfSpeech: "noun",
        ipaSpanish: "restaʊˈɾante",
        ipaEnglish: "ˈrɛst(ə)rɒnt",
        ukPronunciation: "rest-uh-ront",
        usPronunciation: "res-tuh-rahnt",
        grammarNotes: "Masculine noun",
        examples: [
          { spanish: "El restaurante está cerrado.", english: "The restaurant is closed." },
          { spanish: "Vamos a un restaurante italiano.", english: "Let's go to an Italian restaurant." }
        ]
      },
      {
        spanishWord: "más",
        englishWord: "most",
        lemma: "más",
        partOfSpeech: "adverb",
        ipaSpanish: "mas",
        ipaEnglish: "məʊst",
        ukPronunciation: "mohst",
        usPronunciation: "mohst",
        grammarNotes: "Adverb used for comparisons",
        examples: [
          { spanish: "Él es el más alto.", english: "He is the tallest." },
          { spanish: "Es el libro más interesante.", english: "It's the most interesting book." }
        ]
      },
      {
        spanishWord: "cercano",
        englishWord: "nearest",
        lemma: "cercano",
        partOfSpeech: "adjective",
        ipaSpanish: "θerˈkano",
        ipaEnglish: "ˈnɪərɪst",
        ukPronunciation: "neer-ist",
        usPronunciation: "neer-ist",
        grammarNotes: "Adjective (masculine form)",
        examples: [
          { spanish: "La tienda más cercana", english: "The nearest store" },
          { spanish: "Mi amigo cercano", english: "My close friend" }
        ]
      },
      {
        spanishWord: "?",
        englishWord: "?",
        lemma: "?",
        partOfSpeech: "punctuation"
      }
    ],
    cefr: "A1",
    topic: "Travel",
    grammarFocus: "Question Forms",
    lessonSetId: 1,
    lessonSetTitle: "Basic Survival",
    lessonNumber: 4,
    nextId: 3,
    previousId: 1
  },
  {
    id: 3,
    spanishText: "Necesito practicar español todos los días para mejorar.",
    englishText: "I need to practice Spanish every day to improve.",
    wordByWordData: [
      {
        spanishWord: "Necesito",
        englishWord: "I need",
        lemma: "necesitar",
        partOfSpeech: "verb",
        ipaSpanish: "neθeˈsito",
        ipaEnglish: "aɪ niːd",
        ukPronunciation: "eye need",
        usPronunciation: "eye need",
        grammarNotes: "Present tense, 1st person singular of 'necesitar'",
        examples: [
          { spanish: "Necesito ayuda.", english: "I need help." },
          { spanish: "Necesito un nuevo teléfono.", english: "I need a new phone." }
        ]
      },
      {
        spanishWord: "practicar",
        englishWord: "to practice",
        lemma: "practicar",
        partOfSpeech: "verb",
        ipaSpanish: "pɾaktiˈkaɾ",
        ipaEnglish: "tu ˈpræktɪs",
        ukPronunciation: "too prak-tiss",
        usPronunciation: "too prak-tiss",
        grammarNotes: "Infinitive verb",
        examples: [
          { spanish: "Quiero practicar inglés.", english: "I want to practice English." },
          { spanish: "Es importante practicar deportes.", english: "It's important to practice sports." }
        ]
      },
      {
        spanishWord: "español",
        englishWord: "Spanish",
        lemma: "español",
        partOfSpeech: "noun",
        ipaSpanish: "espaˈɲol",
        ipaEnglish: "ˈspænɪʃ",
        ukPronunciation: "span-ish",
        usPronunciation: "span-ish",
        grammarNotes: "Masculine noun referring to the language",
        examples: [
          { spanish: "Hablo español.", english: "I speak Spanish." },
          { spanish: "El español es un idioma bonito.", english: "Spanish is a beautiful language." }
        ]
      },
      {
        spanishWord: "todos",
        englishWord: "every",
        lemma: "todo",
        partOfSpeech: "adjective",
        ipaSpanish: "ˈtoðos",
        ipaEnglish: "ˈɛvri",
        ukPronunciation: "ev-ree",
        usPronunciation: "ev-ree",
        grammarNotes: "Adjective (masculine plural)",
        examples: [
          { spanish: "Todos los días", english: "Every day" },
          { spanish: "Todos los estudiantes", english: "All the students" }
        ]
      },
      {
        spanishWord: "los",
        englishWord: "the",
        lemma: "el",
        partOfSpeech: "determiner",
        ipaSpanish: "los",
        ipaEnglish: "ðə",
        ukPronunciation: "thuh",
        usPronunciation: "thuh",
        grammarNotes: "Definite article (masculine plural)",
        examples: [
          { spanish: "Los libros son interesantes.", english: "The books are interesting." },
          { spanish: "Los niños juegan en el parque.", english: "The children play in the park." }
        ]
      },
      {
        spanishWord: "días",
        englishWord: "days",
        lemma: "día",
        partOfSpeech: "noun",
        ipaSpanish: "ˈdi.as",
        ipaEnglish: "deɪz",
        ukPronunciation: "dayz",
        usPronunciation: "dayz",
        grammarNotes: "Masculine plural noun",
        examples: [
          { spanish: "Siete días de la semana", english: "Seven days of the week" },
          { spanish: "Faltan tres días.", english: "Three days left." }
        ]
      },
      {
        spanishWord: "para",
        englishWord: "to",
        lemma: "para",
        partOfSpeech: "preposition",
        ipaSpanish: "ˈpaɾa",
        ipaEnglish: "tuː",
        ukPronunciation: "too",
        usPronunciation: "too",
        grammarNotes: "Preposition indicating purpose",
        examples: [
          { spanish: "Estudio para aprobar.", english: "I study to pass." },
          { spanish: "El regalo es para ti.", english: "The gift is for you." }
        ]
      },
      {
        spanishWord: "mejorar",
        englishWord: "improve",
        lemma: "mejorar",
        partOfSpeech: "verb",
        ipaSpanish: "mexoˈɾaɾ",
        ipaEnglish: "ɪmˈpruːv",
        ukPronunciation: "im-proov",
        usPronunciation: "im-proov",
        grammarNotes: "Infinitive verb",
        examples: [
          { spanish: "Quiero mejorar mi inglés.", english: "I want to improve my English." },
          { spanish: "Necesitas mejorar tus notas.", english: "You need to improve your grades." }
        ]
      },
      {
        spanishWord: ".",
        englishWord: ".",
        lemma: ".",
        partOfSpeech: "punctuation"
      }
    ],
    cefr: "A2",
    topic: "Learning",
    grammarFocus: "Infinitive Forms",
    lessonSetId: 2,
    lessonSetTitle: "Travel & Conversation",
    lessonNumber: 1,
    nextId: null,
    previousId: 2
  }
];

// Sample exercise types
const SAMPLE_EXERCISES: Exercise[] = [
  {
    id: 1,
    type: "multiple_choice",
    question: "¿Qué significa 'gato' en inglés?",
    options: ["dog", "cat", "bird", "fish"],
    correctAnswer: "cat",
    explanation: "La palabra española 'gato' significa 'cat' en inglés.",
    difficulty: "A1",
    sentenceId: 1
  },
  {
    id: 2,
    type: "fill_blank",
    question: "El gato negro _____ en la cama. (dormir)",
    options: [],
    correctAnswer: "duerme",
    explanation: "La forma correcta es 'duerme' (sleeps), que es la tercera persona del singular del presente de 'dormir'.",
    difficulty: "A1",
    sentenceId: 1
  }
];

export default function Learning() {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("learn");
  const [selectedLessonSet, setSelectedLessonSet] = useState<string | null>(null);
  const [selectedLevel, setSelectedLevel] = useState<string | null>(null);
  const [currentSentenceId, setCurrentSentenceId] = useState<number>(1);
  const [exerciseAnswer, setExerciseAnswer] = useState<string>("");
  const [selectedExercise, setSelectedExercise] = useState<Exercise | null>(null);
  const [exerciseResult, setExerciseResult] = useState<any>(null);
  
  // Find current sentence from our sample data
  const currentSentence = SAMPLE_SENTENCES.find(sentence => sentence.id === currentSentenceId);

  // Fetch sentences (simulated)
  const { data: sentencesData, isLoading: isLoadingSentences } = useQuery({
    queryKey: ['/api/learning/sentences', selectedLessonSet, selectedLevel],
    enabled: activeTab === "lessons",
    queryFn: async () => {
      // Simulate API call with our sample data
      return { 
        sentences: SAMPLE_SENTENCES,
        total: SAMPLE_SENTENCES.length 
      };
    },
  });
  
  // Fetch exercises (simulated)
  const { data: exercisesData, isLoading: isLoadingExercises } = useQuery({
    queryKey: ['/api/learning/exercises'],
    enabled: activeTab === "practice",
    queryFn: async () => {
      // Simulate API call with our sample data
      return { 
        exercises: SAMPLE_EXERCISES,
        total: SAMPLE_EXERCISES.length 
      };
    },
  });

  // Analyze Spanish text
  const analyzeMutation = useMutation({
    mutationFn: async (text: string) => {
      return await apiRequest('/api/learning/analyze', {
        method: 'POST',
        body: JSON.stringify({ text }),
      });
    },
    onSuccess: (data) => {
      setGeneratedAnalysis(data);
      toast({
        title: "Text analyzed successfully",
        description: "Tap on any word to see its translation and details.",
      });
    },
    onError: (error) => {
      toast({
        title: "Failed to analyze text",
        description: error instanceof Error ? error.message : "An error occurred",
        variant: "destructive",
      });
    },
  });

  // Create a new sentence
  const createSentenceMutation = useMutation({
    mutationFn: async (data: any) => {
      return await apiRequest('/api/learning/sentences', {
        method: 'POST',
        body: JSON.stringify(data),
      });
    },
    onSuccess: () => {
      toast({
        title: "Sentence created",
        description: "The new sentence has been added to the practice section.",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/learning/sentences'] });
      setSpanishText("");
      setGeneratedAnalysis(null);
    },
    onError: (error) => {
      toast({
        title: "Failed to create sentence",
        description: error instanceof Error ? error.message : "An error occurred",
        variant: "destructive",
      });
    },
  });

  // Generate exercises for a sentence
  const generateExercisesMutation = useMutation({
    mutationFn: async ({ sentenceId, exerciseType, count }: { sentenceId: number, exerciseType: string, count: number }) => {
      return await apiRequest(`/api/learning/sentences/${sentenceId}/exercises`, {
        method: 'POST',
        body: JSON.stringify({ exerciseType, count }),
      });
    },
    onSuccess: () => {
      toast({
        title: "Exercises generated",
        description: "New exercises have been created based on the sentence.",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/learning/exercises'] });
    },
    onError: (error) => {
      toast({
        title: "Failed to generate exercises",
        description: error instanceof Error ? error.message : "An error occurred",
        variant: "destructive",
      });
    },
  });

  // Submit an exercise attempt
  const submitExerciseAttemptMutation = useMutation({
    mutationFn: async ({ exerciseId, userAnswer }: { exerciseId: number, userAnswer: string }) => {
      return await apiRequest(`/api/learning/exercises/${exerciseId}/attempt`, {
        method: 'POST',
        body: JSON.stringify({ 
          userId: 1, // For now, hardcoded user ID
          userAnswer 
        }),
      });
    },
    onSuccess: (data) => {
      setExerciseResult(data);
      toast({
        title: data.isCorrect ? "Correct!" : "Incorrect",
        description: data.isCorrect 
          ? "Great job! Your answer is correct." 
          : `The correct answer is: ${data.correctAnswer}`,
        variant: data.isCorrect ? "default" : "destructive",
      });
    },
    onError: (error) => {
      toast({
        title: "Failed to submit answer",
        description: error instanceof Error ? error.message : "An error occurred",
        variant: "destructive",
      });
    },
  });

  // Handle Spanish text analysis
  const handleAnalyzeText = () => {
    if (!spanishText.trim()) {
      toast({
        title: "No text to analyze",
        description: "Please enter a Spanish sentence to analyze.",
        variant: "destructive",
      });
      return;
    }
    
    analyzeMutation.mutate(spanishText);
  };

  // Handle saving the analyzed sentence
  const handleSaveSentence = () => {
    if (!spanishText.trim() || !generatedAnalysis) {
      toast({
        title: "Invalid data",
        description: "Please analyze a Spanish sentence first.",
        variant: "destructive",
      });
      return;
    }
    
    // For demo purposes, we'll provide a simple English translation
    createSentenceMutation.mutate({
      spanishText,
      englishText: generatedAnalysis.englishTranslation || "Translation not available",
      difficulty: "intermediate", // Default difficulty
      topic: "general",
      grammarFocus: "mixed",
      wordByWordData: generatedAnalysis
    });
  };

  // Handle generating exercises for a sentence
  const handleGenerateExercises = (sentenceId: number) => {
    generateExercisesMutation.mutate({
      sentenceId,
      exerciseType: selectedExerciseType,
      count: 3 // Generate 3 exercises by default
    });
  };

  // Handle exercise selection
  const handleSelectExercise = (exercise: Exercise) => {
    setSelectedExercise(exercise);
    setExerciseAnswer("");
    setExerciseResult(null);
  };

  // Handle exercise answer submission
  const handleSubmitAnswer = () => {
    if (!selectedExercise || !exerciseAnswer) {
      toast({
        title: "No answer provided",
        description: "Please select an option before submitting.",
        variant: "destructive",
      });
      return;
    }
    
    submitExerciseAttemptMutation.mutate({
      exerciseId: selectedExercise.id,
      userAnswer: exerciseAnswer
    });
  };

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold tracking-tight">Spanish Learning</h1>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full md:w-auto grid-cols-2">
          <TabsTrigger value="practice">Practice</TabsTrigger>
          <TabsTrigger value="create">Create</TabsTrigger>
        </TabsList>
        
        {/* Practice tab - browse sentences and do exercises */}
        <TabsContent value="practice" className="space-y-6">
          <div className="grid md:grid-cols-2 gap-6">
            {/* Left column - Sentences */}
            <div className="space-y-4">
              <h2 className="text-xl font-semibold">Learning Sentences</h2>
              
              {isLoadingSentences ? (
                <div className="flex justify-center py-4">
                  <p>Loading sentences...</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {sentencesData?.sentences?.length > 0 ? (
                    sentencesData.sentences.map((sentence: LearningSentenceType) => (
                      <LearningSentence
                        key={sentence.id}
                        spanishText={sentence.spanishText}
                        englishText={sentence.englishText}
                        wordByWordData={sentence.wordByWordData}
                        difficulty={sentence.difficulty}
                        onGenerateExercises={() => handleGenerateExercises(sentence.id)}
                      />
                    ))
                  ) : (
                    <Card>
                      <CardContent className="pt-6">
                        <p className="text-center text-neutral-500">
                          No sentences found. Create one in the "Create" tab.
                        </p>
                      </CardContent>
                    </Card>
                  )}
                </div>
              )}
            </div>
            
            {/* Right column - Exercises */}
            <div className="space-y-4">
              <h2 className="text-xl font-semibold">Exercises</h2>
              
              {/* Exercise type selector */}
              <div className="mb-4">
                <Label htmlFor="exercise-type">Exercise Type</Label>
                <RadioGroup 
                  id="exercise-type" 
                  value={selectedExerciseType}
                  onValueChange={setSelectedExerciseType}
                  className="flex space-x-4 mt-2"
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="mixed" id="mixed" />
                    <Label htmlFor="mixed">Mixed</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="multiple_choice" id="multiple_choice" />
                    <Label htmlFor="multiple_choice">Multiple Choice</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="fill_blank" id="fill_blank" />
                    <Label htmlFor="fill_blank">Fill in Blank</Label>
                  </div>
                </RadioGroup>
              </div>
              
              {isLoadingExercises ? (
                <div className="flex justify-center py-4">
                  <p>Loading exercises...</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {/* Exercise selection */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {exercisesData?.exercises?.length > 0 ? (
                      exercisesData.exercises.map((exercise: Exercise) => (
                        <Card 
                          key={exercise.id}
                          className={`cursor-pointer transition-shadow hover:shadow-md ${selectedExercise?.id === exercise.id ? 'ring-2 ring-blue-500' : ''}`}
                          onClick={() => handleSelectExercise(exercise)}
                        >
                          <CardHeader className="p-4">
                            <CardTitle className="text-sm font-medium">
                              {exercise.type}
                            </CardTitle>
                          </CardHeader>
                          <CardContent className="p-4 pt-0">
                            <p className="text-sm truncate">{exercise.question}</p>
                          </CardContent>
                        </Card>
                      ))
                    ) : (
                      <div className="col-span-2">
                        <Card>
                          <CardContent className="p-6">
                            <p className="text-center text-neutral-500">
                              No exercises found. Generate some from a sentence.
                            </p>
                          </CardContent>
                        </Card>
                      </div>
                    )}
                  </div>
                  
                  {/* Selected exercise */}
                  {selectedExercise && (
                    <Card className="mt-6">
                      <CardContent className="p-6">
                        <h3 className="font-semibold mb-4">{selectedExercise.question}</h3>
                        
                        {/* Multiple choice options */}
                        {selectedExercise.options && selectedExercise.options.length > 0 && (
                          <RadioGroup 
                            value={exerciseAnswer}
                            onValueChange={setExerciseAnswer}
                            className="space-y-2 mb-4"
                            disabled={!!exerciseResult}
                          >
                            {selectedExercise.options.map((option, index) => (
                              <div 
                                key={index} 
                                className={`flex items-center space-x-2 p-2 rounded-md ${
                                  exerciseResult && option === selectedExercise.correctAnswer 
                                    ? 'bg-green-50 border border-green-200' 
                                    : exerciseResult && option === exerciseAnswer
                                      ? 'bg-red-50 border border-red-200'
                                      : ''
                                }`}
                              >
                                <RadioGroupItem value={option} id={`option-${index}`} />
                                <Label htmlFor={`option-${index}`}>{option}</Label>
                              </div>
                            ))}
                          </RadioGroup>
                        )}
                        
                        {/* Fill in blank input */}
                        {selectedExercise.type === 'fill_blank' && !selectedExercise.options.length && (
                          <div className="mb-4">
                            <Input 
                              value={exerciseAnswer}
                              onChange={(e) => setExerciseAnswer(e.target.value)}
                              placeholder="Your answer"
                              disabled={!!exerciseResult}
                            />
                          </div>
                        )}
                        
                        {/* Submit button */}
                        {!exerciseResult && (
                          <Button 
                            onClick={handleSubmitAnswer}
                            disabled={!exerciseAnswer}
                          >
                            Submit Answer
                          </Button>
                        )}
                        
                        {/* Result feedback */}
                        {exerciseResult && (
                          <div className={`mt-4 p-3 rounded-md ${exerciseResult.isCorrect ? 'bg-green-50' : 'bg-red-50'}`}>
                            <p className="font-medium">
                              {exerciseResult.isCorrect ? '✓ Correct!' : '✗ Incorrect'}
                            </p>
                            {!exerciseResult.isCorrect && (
                              <p className="mt-1">Correct answer: <span className="font-medium">{exerciseResult.correctAnswer}</span></p>
                            )}
                            {exerciseResult.explanation && (
                              <p className="mt-2 text-sm">{exerciseResult.explanation}</p>
                            )}
                            {exerciseResult.feedback && (
                              <div className="mt-3 p-2 bg-white rounded border">
                                <p className="text-sm font-medium">Feedback:</p>
                                <p className="text-sm">{exerciseResult.feedback}</p>
                              </div>
                            )}
                            <Button 
                              variant="outline" 
                              className="mt-3"
                              onClick={() => {
                                setExerciseResult(null);
                                setExerciseAnswer("");
                              }}
                            >
                              Try Another Exercise
                            </Button>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  )}
                </div>
              )}
            </div>
          </div>
        </TabsContent>
        
        {/* Create tab - analyze and create new sentences */}
        <TabsContent value="create" className="space-y-6">
          <div className="grid md:grid-cols-2 gap-6">
            {/* Left column - Input */}
            <div className="space-y-4">
              <h2 className="text-xl font-semibold">Analyze Spanish Text</h2>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="spanish-text">Enter Spanish text</Label>
                  <Textarea
                    id="spanish-text"
                    placeholder="Type or paste Spanish text here..."
                    rows={4}
                    value={spanishText}
                    onChange={(e) => setSpanishText(e.target.value)}
                    className="resize-none mt-1"
                  />
                </div>
                
                <div className="flex space-x-2">
                  <Button
                    onClick={handleAnalyzeText}
                    disabled={!spanishText.trim() || analyzeMutation.isPending}
                  >
                    {analyzeMutation.isPending ? "Analyzing..." : "Analyze Text"}
                  </Button>
                  
                  <Button
                    variant="outline"
                    onClick={() => {
                      setSpanishText("");
                      setGeneratedAnalysis(null);
                    }}
                  >
                    Clear
                  </Button>
                </div>
              </div>
              
              {/* Save options */}
              {generatedAnalysis && (
                <div className="mt-6 pt-6 border-t">
                  <h3 className="font-semibold mb-2">Save Sentence</h3>
                  
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="difficulty">Difficulty</Label>
                      <RadioGroup 
                        id="difficulty" 
                        defaultValue="intermediate"
                        className="flex space-x-4 mt-2"
                      >
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="beginner" id="beginner" />
                          <Label htmlFor="beginner">Beginner</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="intermediate" id="intermediate" />
                          <Label htmlFor="intermediate">Intermediate</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="advanced" id="advanced" />
                          <Label htmlFor="advanced">Advanced</Label>
                        </div>
                      </RadioGroup>
                    </div>
                    
                    <Button 
                      onClick={handleSaveSentence}
                      disabled={createSentenceMutation.isPending}
                    >
                      {createSentenceMutation.isPending ? "Saving..." : "Save to Practice"}
                    </Button>
                  </div>
                </div>
              )}
            </div>
            
            {/* Right column - Analysis results */}
            <div className="space-y-4">
              <h2 className="text-xl font-semibold">Analysis Results</h2>
              
              {analyzeMutation.isPending ? (
                <Card>
                  <CardContent className="py-6">
                    <p className="text-center">Analyzing text...</p>
                  </CardContent>
                </Card>
              ) : generatedAnalysis ? (
                <div className="space-y-4">
                  <LearningSentence
                    spanishText={spanishText}
                    englishText={generatedAnalysis.englishTranslation || "Translation not available"}
                    wordByWordData={generatedAnalysis}
                    difficulty="intermediate"
                  />
                  
                  {generatedAnalysis.grammar && (
                    <Card>
                      <CardHeader className="pb-2">
                        <CardTitle className="text-lg">Grammar Notes</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <p>{generatedAnalysis.grammar}</p>
                      </CardContent>
                    </Card>
                  )}
                </div>
              ) : (
                <Card>
                  <CardContent className="py-6">
                    <p className="text-center text-neutral-500">
                      Enter and analyze a Spanish sentence to see word-by-word translation and details.
                    </p>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
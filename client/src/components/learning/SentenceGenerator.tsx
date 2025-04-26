import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Wand2, RefreshCw, BookOpen, Bookmark, BookMarked, CheckCircle2, Volume2, HelpCircle, Brain } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface WordData {
  spanish: string;
  english: string;
  partOfSpeech: string;
  ipaSpanish?: string;
  ipaEnglish?: string;
  notes?: string;
}

interface GeneratedSentence {
  id: string;
  spanishText: string;
  englishText: string;
  difficulty: string;
  grammarFocus: string;
  wordByWordData: WordData[];
  saved: boolean;
}

// CEFR level descriptions for user reference
const CEFR_LEVELS = [
  { 
    value: "a1", 
    label: "A1 - Beginner", 
    description: "Simple sentences using basic vocabulary and grammar structures." 
  },
  { 
    value: "a2", 
    label: "A2 - Elementary", 
    description: "Day-to-day expressions and basic interactions in familiar contexts." 
  },
  { 
    value: "b1", 
    label: "B1 - Intermediate", 
    description: "Can deal with most situations while traveling and describe experiences." 
  },
  { 
    value: "b2", 
    label: "B2 - Upper Intermediate", 
    description: "Can interact with a degree of fluency with native speakers." 
  },
  { 
    value: "c1", 
    label: "C1 - Advanced", 
    description: "Can use language flexibly and effectively for professional purposes." 
  },
  { 
    value: "c2", 
    label: "C2 - Proficient", 
    description: "Can understand with ease virtually everything heard or read." 
  }
];

// Grammar focus options for sentence generation
const GRAMMAR_FOCUSES = [
  { value: "any", label: "Any Grammar Topic" },
  { value: "present-simple", label: "Present Simple" },
  { value: "present-continuous", label: "Present Continuous" },
  { value: "past-simple", label: "Past Simple" },
  { value: "past-continuous", label: "Past Continuous" },
  { value: "future-simple", label: "Future Simple" },
  { value: "conditional", label: "Conditional Forms" },
  { value: "subjunctive", label: "Subjunctive Mood" },
  { value: "imperative", label: "Imperative Forms" },
  { value: "ser-estar", label: "Ser vs. Estar" },
  { value: "por-para", label: "Por vs. Para" },
  { value: "pronouns", label: "Pronouns" },
  { value: "prepositions", label: "Prepositions" }
];

// Content themes for sentence generation
const THEMES = [
  { value: "any", label: "Any Theme" },
  { value: "daily-life", label: "Daily Life" },
  { value: "travel", label: "Travel & Tourism" },
  { value: "business", label: "Business & Work" },
  { value: "culture", label: "Culture & Entertainment" },
  { value: "technology", label: "Technology" },
  { value: "nature", label: "Nature & Environment" },
  { value: "food", label: "Food & Dining" },
  { value: "health", label: "Health & Wellness" },
  { value: "education", label: "Education" },
  { value: "relationships", label: "Relationships" }
];

// Curriculum tracks inspired by FreeCodeCamp's structured approach
const CURRICULUM_TRACKS = [
  { 
    id: "survival-spanish", 
    title: "Survival Spanish",
    description: "Essential phrases and vocabulary for basic communication (A1)",
    level: "a1",
    lessons: 25
  },
  { 
    id: "travel-conversation", 
    title: "Travel & Conversation",
    description: "Practical language for travelers and short conversations (A2)",
    level: "a2",
    lessons: 30
  },
  { 
    id: "grammar-fundamentals", 
    title: "Grammar Fundamentals",
    description: "Core grammar structures and everyday usage (B1)",
    level: "b1",
    lessons: 35
  },
  { 
    id: "intermediate-fluency", 
    title: "Intermediate Fluency",
    description: "Express opinions, explain viewpoints, and understand native speakers (B2)",
    level: "b2",
    lessons: 40
  },
  { 
    id: "advanced-expression", 
    title: "Advanced Expression",
    description: "Complex language for professional and academic contexts (C1)",
    level: "c1",
    lessons: 45
  },
  { 
    id: "native-comprehension", 
    title: "Native Media Comprehension",
    description: "Understand and use Spanish like a native speaker (C2)",
    level: "c2",
    lessons: 50
  },
  { 
    id: "wisdom-sentences", 
    title: "Wisdom Sentences",
    description: "Profound philosophical and cultural expressions",
    level: "c1",
    lessons: 20
  }
];

export default function SentenceGenerator() {
  const [difficulty, setDifficulty] = useState<string>("b1");
  const [theme, setTheme] = useState<string>("any");
  const [grammarFocus, setGrammarFocus] = useState<string>("any");
  const [selectedTrack, setSelectedTrack] = useState<string>("grammar-fundamentals");
  const [numSentences, setNumSentences] = useState<number[]>([3]);
  const [showTranslation, setShowTranslation] = useState<boolean>(true);
  const [showWordByWord, setShowWordByWord] = useState<boolean>(true);
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [generatedSentences, setGeneratedSentences] = useState<GeneratedSentence[]>([]);
  const [savedSentences, setSavedSentences] = useState<GeneratedSentence[]>([]);
  const { toast } = useToast();

  // Generate sentences based on user preferences
  const generateSentences = async () => {
    setIsGenerating(true);
    
    try {
      // In a production app, this would call the OpenAI API
      // For now, we'll generate realistic sample data
      setTimeout(() => {
        const newSentences: GeneratedSentence[] = [];
        
        // Mock sentence data based on selected difficulty
        const difficultyPatterns: Record<string, { spanish: string[], english: string[] }> = {
          a1: {
            spanish: [
              "Hola, me llamo Juan. ¿Cómo te llamas?",
              "Me gusta el café con leche por la mañana.",
              "¿Dónde está el restaurante más cercano?",
              "Quiero comprar un billete de tren, por favor.",
              "Hoy hace buen tiempo en la ciudad."
            ],
            english: [
              "Hello, my name is Juan. What's your name?",
              "I like coffee with milk in the morning.",
              "Where is the nearest restaurant?",
              "I want to buy a train ticket, please.",
              "Today the weather is good in the city."
            ]
          },
          b1: {
            spanish: [
              "Desde que empecé a estudiar español, he notado una mejora en mi capacidad para comunicarme.",
              "Si tuviera más tiempo libre, viajaría a México para practicar el idioma.",
              "Aunque la gramática española puede ser difícil, la práctica constante facilita el aprendizaje.",
              "Antes de venir a España, había estudiado el idioma durante dos años.",
              "Me gustaría saber cuáles son las tradiciones más importantes de la cultura española."
            ],
            english: [
              "Since I started studying Spanish, I've noticed an improvement in my ability to communicate.",
              "If I had more free time, I would travel to Mexico to practice the language.",
              "Although Spanish grammar can be difficult, constant practice makes learning easier.",
              "Before coming to Spain, I had studied the language for two years.",
              "I would like to know what are the most important traditions in Spanish culture."
            ]
          },
          c1: {
            spanish: [
              "A pesar de las dificultades económicas que atraviesa el país, se ha registrado un aumento significativo en el turismo internacional.",
              "La implementación de políticas lingüísticas inclusivas fomenta la preservación de dialectos regionales y lenguas minoritarias.",
              "El análisis exhaustivo de los datos revela patrones consistentes que podrían indicar una tendencia emergente en el campo de la inteligencia artificial.",
              "Se está debatiendo actualmente en el parlamento una propuesta de ley que regularía el uso de tecnologías de reconocimiento facial en espacios públicos.",
              "La confluencia de factores sociales, económicos y políticos ha contribuido a la transformación radical del panorama cultural contemporáneo."
            ],
            english: [
              "Despite the economic difficulties the country is facing, there has been a significant increase in international tourism.",
              "The implementation of inclusive language policies encourages the preservation of regional dialects and minority languages.",
              "Comprehensive analysis of the data reveals consistent patterns that could indicate an emerging trend in the field of artificial intelligence.",
              "A bill that would regulate the use of facial recognition technologies in public spaces is currently being debated in parliament.",
              "The confluence of social, economic, and political factors has contributed to the radical transformation of the contemporary cultural landscape."
            ]
          }
        };
        
        // Determine which difficulty level to use
        let difficultyKey = "b1"; // Default to B1
        if (["a1", "a2"].includes(difficulty)) difficultyKey = "a1";
        if (["c1", "c2"].includes(difficulty)) difficultyKey = "c1";
        
        // Generate the requested number of sentences
        for (let i = 0; i < numSentences[0]; i++) {
          const index = Math.floor(Math.random() * difficultyPatterns[difficultyKey].spanish.length);
          const spanishText = difficultyPatterns[difficultyKey].spanish[index];
          const englishText = difficultyPatterns[difficultyKey].english[index];
          
          // Create mock word-by-word data
          const wordByWordData: WordData[] = spanishText.split(" ").map((word, idx) => {
            // Simplified mock data - in real app this would be more accurate
            return {
              spanish: word.replace(/[.,!?;:]/g, ""),
              english: englishText.split(" ")[idx] || "",
              partOfSpeech: ["noun", "verb", "adjective", "adverb", "preposition"][Math.floor(Math.random() * 5)],
              ipaSpanish: "/example/",
              ipaEnglish: "/example/"
            };
          });
          
          newSentences.push({
            id: `sentence-${Date.now()}-${i}`,
            spanishText,
            englishText,
            difficulty,
            grammarFocus: grammarFocus === "any" 
              ? GRAMMAR_FOCUSES[Math.floor(Math.random() * GRAMMAR_FOCUSES.length)].value 
              : grammarFocus,
            wordByWordData,
            saved: false
          });
        }
        
        setGeneratedSentences(newSentences);
        setIsGenerating(false);
        
        toast({
          title: "Sentences Generated",
          description: `Generated ${numSentences[0]} new sentences for your practice.`,
          duration: 3000
        });
      }, 1500);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to generate sentences. Please try again.",
        variant: "destructive"
      });
      setIsGenerating(false);
    }
  };

  // Toggle saving a sentence
  const toggleSaveSentence = (id: string) => {
    // Update in generated sentences list
    setGeneratedSentences(prev => 
      prev.map(sentence => 
        sentence.id === id ? { ...sentence, saved: !sentence.saved } : sentence
      )
    );
    
    // Find the sentence
    const sentence = generatedSentences.find(s => s.id === id);
    if (!sentence) return;
    
    if (!sentence.saved) {
      // Add to saved sentences
      setSavedSentences(prev => [...prev, { ...sentence, saved: true }]);
      toast({
        title: "Sentence Saved",
        description: "Added to your saved sentences for review later.",
        duration: 2000
      });
    } else {
      // Remove from saved sentences
      setSavedSentences(prev => prev.filter(s => s.id !== id));
      toast({
        title: "Sentence Removed",
        description: "Removed from your saved sentences.",
        duration: 2000
      });
    }
  };

  // Read a sentence aloud
  const speakSentence = (text: string) => {
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'es-ES';
    window.speechSynthesis.speak(utterance);
  };

  return (
    <Card className="w-full shadow-md">
      <CardHeader>
        <CardTitle className="flex items-center">
          <Wand2 className="h-5 w-5 mr-2" />
          AI Sentence Generator
        </CardTitle>
        <CardDescription>
          Generate tailored practice sentences based on your preferences and learning goals
        </CardDescription>
      </CardHeader>
      
      <CardContent>
        <Tabs defaultValue="generator">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="generator">
              <Wand2 className="h-4 w-4 mr-2" />
              Generator
            </TabsTrigger>
            <TabsTrigger value="curriculum">
              <BookOpen className="h-4 w-4 mr-2" />
              Curriculum Tracks
            </TabsTrigger>
            <TabsTrigger value="saved">
              <BookMarked className="h-4 w-4 mr-2" />
              Saved Sentences
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="generator" className="space-y-4 pt-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="difficulty" className="text-sm font-medium">CEFR Level</Label>
                <Select value={difficulty} onValueChange={setDifficulty}>
                  <SelectTrigger id="difficulty">
                    <SelectValue placeholder="Select difficulty level" />
                  </SelectTrigger>
                  <SelectContent>
                    {CEFR_LEVELS.map(level => (
                      <SelectItem key={level.value} value={level.value}>
                        {level.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <p className="text-xs text-muted-foreground mt-1">
                  {CEFR_LEVELS.find(l => l.value === difficulty)?.description}
                </p>
              </div>
              
              <div>
                <Label htmlFor="grammar-focus" className="text-sm font-medium">Grammar Focus</Label>
                <Select value={grammarFocus} onValueChange={setGrammarFocus}>
                  <SelectTrigger id="grammar-focus">
                    <SelectValue placeholder="Select grammar focus" />
                  </SelectTrigger>
                  <SelectContent>
                    {GRAMMAR_FOCUSES.map(focus => (
                      <SelectItem key={focus.value} value={focus.value}>
                        {focus.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <Label htmlFor="theme" className="text-sm font-medium">Theme/Content Area</Label>
                <Select value={theme} onValueChange={setTheme}>
                  <SelectTrigger id="theme">
                    <SelectValue placeholder="Select content theme" />
                  </SelectTrigger>
                  <SelectContent>
                    {THEMES.map(theme => (
                      <SelectItem key={theme.value} value={theme.value}>
                        {theme.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <div className="flex items-center justify-between">
                  <Label htmlFor="num-sentences" className="text-sm font-medium">
                    Number of Sentences: {numSentences[0]}
                  </Label>
                </div>
                <Slider
                  id="num-sentences"
                  value={numSentences}
                  onValueChange={setNumSentences}
                  min={1}
                  max={10}
                  step={1}
                  className="py-4"
                />
              </div>
              
              <div className="flex items-center space-x-2">
                <Switch
                  id="show-translation"
                  checked={showTranslation}
                  onCheckedChange={setShowTranslation}
                />
                <Label htmlFor="show-translation" className="text-sm">Show Translation</Label>
              </div>
              
              <div className="flex items-center space-x-2">
                <Switch
                  id="show-word-by-word"
                  checked={showWordByWord}
                  onCheckedChange={setShowWordByWord}
                />
                <Label htmlFor="show-word-by-word" className="text-sm">Show Word-by-Word Analysis</Label>
              </div>
            </div>
            
            <Button
              className="w-full"
              onClick={generateSentences}
              disabled={isGenerating}
            >
              {isGenerating ? (
                <>
                  <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <Wand2 className="h-4 w-4 mr-2" />
                  Generate Sentences
                </>
              )}
            </Button>
            
            <div className="space-y-4 mt-6">
              {generatedSentences.map((sentence) => (
                <Card key={sentence.id} className="overflow-hidden">
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between">
                      <div className="space-y-2 flex-1">
                        <p className="text-lg font-medium">{sentence.spanishText}</p>
                        
                        {showTranslation && (
                          <p className="text-muted-foreground">{sentence.englishText}</p>
                        )}
                        
                        <div className="flex flex-wrap gap-2 mt-2">
                          <Badge variant="outline">
                            {CEFR_LEVELS.find(l => l.value === sentence.difficulty)?.label || sentence.difficulty}
                          </Badge>
                          <Badge variant="outline">
                            {GRAMMAR_FOCUSES.find(g => g.value === sentence.grammarFocus)?.label || sentence.grammarFocus}
                          </Badge>
                        </div>
                        
                        {showWordByWord && (
                          <div className="border rounded-md p-3 mt-3 bg-muted/30">
                            <p className="text-sm font-medium mb-2 flex items-center">
                              <Brain className="h-3.5 w-3.5 mr-1.5" />
                              Word-by-Word Analysis
                            </p>
                            <div className="grid grid-cols-2 gap-2">
                              {sentence.wordByWordData.map((word, idx) => (
                                <div key={idx} className="text-sm border border-dashed border-muted-foreground/30 p-2 rounded">
                                  <div className="flex justify-between">
                                    <span className="font-medium">{word.spanish}</span>
                                    <Badge variant="secondary" className="text-xs">
                                      {word.partOfSpeech}
                                    </Badge>
                                  </div>
                                  <p className="text-muted-foreground text-xs mt-1">{word.english}</p>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                      
                      <div className="flex flex-col gap-2 ml-4">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => speakSentence(sentence.spanishText)}
                        >
                          <Volume2 className="h-5 w-5" />
                        </Button>
                        
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => toggleSaveSentence(sentence.id)}
                        >
                          {sentence.saved ? (
                            <BookMarked className="h-5 w-5 text-amber-500" />
                          ) : (
                            <Bookmark className="h-5 w-5" />
                          )}
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
              
              {generatedSentences.length === 0 && !isGenerating && (
                <div className="text-center py-8 border border-dashed rounded-md">
                  <HelpCircle className="h-8 w-8 mx-auto text-muted-foreground/50" />
                  <p className="mt-2 text-muted-foreground">
                    Adjust the settings above and click "Generate Sentences" to create customized practice content
                  </p>
                </div>
              )}
            </div>
          </TabsContent>
          
          <TabsContent value="curriculum" className="pt-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {CURRICULUM_TRACKS.map((track) => (
                <Card key={track.id} className={`overflow-hidden ${selectedTrack === track.id ? 'border-primary' : ''}`}>
                  <CardContent className="p-4">
                    <div className="flex justify-between">
                      <div>
                        <h3 className="font-semibold text-base">{track.title}</h3>
                        <p className="text-sm text-muted-foreground mt-1">{track.description}</p>
                        <div className="flex mt-2 gap-2">
                          <Badge variant="outline">
                            {CEFR_LEVELS.find(l => l.value === track.level)?.label || track.level}
                          </Badge>
                          <Badge variant="outline">{track.lessons} Lessons</Badge>
                        </div>
                      </div>
                      <Button 
                        variant={selectedTrack === track.id ? "default" : "outline"}
                        size="sm"
                        className="ml-2 self-start"
                        onClick={() => {
                          setSelectedTrack(track.id);
                          setDifficulty(track.level);
                          
                          // Generate sentences when a track is selected
                          setTimeout(() => generateSentences(), 100);
                          
                          toast({
                            title: `${track.title} Track Selected`,
                            description: `Your sentence generator is now optimized for ${track.title} content.`,
                            duration: 3000
                          });
                        }}
                      >
                        {selectedTrack === track.id ? (
                          <>
                            <CheckCircle2 className="h-4 w-4 mr-1" />
                            Selected
                          </>
                        ) : "Select"}
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>
          
          <TabsContent value="saved" className="pt-4">
            <div className="space-y-4">
              {savedSentences.length > 0 ? (
                savedSentences.map((sentence) => (
                  <Card key={sentence.id} className="overflow-hidden">
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between">
                        <div className="space-y-2 flex-1">
                          <p className="text-lg font-medium">{sentence.spanishText}</p>
                          <p className="text-muted-foreground">{sentence.englishText}</p>
                          
                          <div className="flex flex-wrap gap-2 mt-2">
                            <Badge variant="outline">
                              {CEFR_LEVELS.find(l => l.value === sentence.difficulty)?.label || sentence.difficulty}
                            </Badge>
                            <Badge variant="outline">
                              {GRAMMAR_FOCUSES.find(g => g.value === sentence.grammarFocus)?.label || sentence.grammarFocus}
                            </Badge>
                          </div>
                        </div>
                        
                        <div className="flex flex-col gap-2 ml-4">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => speakSentence(sentence.spanishText)}
                          >
                            <Volume2 className="h-5 w-5" />
                          </Button>
                          
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => toggleSaveSentence(sentence.id)}
                          >
                            <BookMarked className="h-5 w-5 text-amber-500" />
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))
              ) : (
                <div className="text-center py-8 border border-dashed rounded-md">
                  <BookMarked className="h-8 w-8 mx-auto text-muted-foreground/50" />
                  <p className="mt-2 text-muted-foreground">
                    You haven't saved any sentences yet. Save sentences from the generator to review them later.
                  </p>
                </div>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
      
      <CardFooter className="flex justify-between border-t pt-4">
        <p className="text-xs text-muted-foreground">
          Powered by OpenAI language models
        </p>
        <Badge className="bg-green-100 text-green-800 hover:bg-green-200">
          <Brain className="h-3 w-3 mr-1 fill-current" />
          AI Assisted
        </Badge>
      </CardFooter>
    </Card>
  );
}
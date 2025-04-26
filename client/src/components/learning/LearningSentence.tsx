import { useState, useRef, useEffect } from "react";
import { WordBlock, type WordData } from "./WordBlock";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Pause, Play, SkipBack, SkipForward, Volume2, Settings2 } from "lucide-react";
import { cn } from "@/lib/utils";

// Define interface for user settings related to word analysis
interface WordAnalysisSettings {
  pronunciation: {
    enabled: boolean;
    volume: number;
    accent: string;
  };
  grammar: {
    enabled: boolean;
    showConjugations: boolean;
  };
  translation: {
    enabled: boolean;
    language: string;
  };
}

// CEFR level types
type CEFRLevel = "A1" | "A2" | "B1" | "B2" | "C1" | "C2";

// Direction types
type Direction = "spanish-to-english" | "english-to-spanish";

interface LearningSentenceProps {
  id: number;
  spanishText: string;
  englishText: string;
  wordByWordData: WordData[];
  cefr: CEFRLevel;
  topic?: string;
  grammarFocus?: string;
  lessonSetId?: number;
  lessonSetTitle?: string;
  lessonNumber?: number;
  previousId?: number;
  nextId?: number;
  onGenerateExercises?: () => void;
  onNavigate?: (id: number) => void;
  direction?: Direction;
}

export function LearningSentence({
  id,
  spanishText,
  englishText,
  wordByWordData,
  cefr = "B1",
  topic,
  grammarFocus,
  lessonSetId,
  lessonSetTitle,
  lessonNumber,
  previousId,
  nextId,
  onGenerateExercises,
  onNavigate,
  direction = "english-to-spanish",
}: LearningSentenceProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentWordIndex, setCurrentWordIndex] = useState<number | null>(null);
  const [showAllWords, setShowAllWords] = useState(true);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  
  // Initialize default settings for word analysis
  const [settings, setSettings] = useState<WordAnalysisSettings>({
    pronunciation: {
      enabled: true,
      volume: 75,
      accent: "spain"
    },
    grammar: {
      enabled: true,
      showConjugations: true
    },
    translation: {
      enabled: true,
      language: "english"
    }
  });
  
  // Load settings from localStorage if available
  useEffect(() => {
    try {
      const savedSettings = localStorage.getItem('userSettings');
      if (savedSettings) {
        const parsedSettings = JSON.parse(savedSettings);
        setSettings({
          pronunciation: {
            enabled: parsedSettings.pronunciation?.enabled ?? true,
            volume: parsedSettings.pronunciation?.volume ?? 75,
            accent: parsedSettings.pronunciation?.accent ?? "spain"
          },
          grammar: {
            enabled: parsedSettings.grammar?.enabled ?? true,
            showConjugations: parsedSettings.grammar?.showConjugations ?? true
          },
          translation: {
            enabled: parsedSettings.translation?.enabled ?? true,
            language: parsedSettings.translation?.language ?? "english"
          }
        });
      }
    } catch (error) {
      console.error("Error loading settings:", error);
    }
  }, []);

  // Function to render the interactive sentence with WordBlocks
  const renderInteractiveSentence = () => {
    if (!wordByWordData?.length) {
      return (
        <div className="flex flex-col items-center gap-4">
          <p className="text-lg">{spanishText}</p>
          <p className="text-lg text-blue-700">{englishText}</p>
        </div>
      );
    }
    
    // Determine the primary text (top) and secondary text (bottom)
    const primaryText = direction === "english-to-spanish" ? englishText : spanishText;
    const secondaryText = direction === "english-to-spanish" ? spanishText : englishText;
    
    return (
      <div className="flex flex-col gap-8">
        {/* Top section shows the primary language (English in english-to-spanish mode) */}
        {direction === "english-to-spanish" && (
          <p className="text-xl leading-relaxed text-neutral-800 dark:text-neutral-200">{primaryText}</p>
        )}
        
        {/* Middle section always shows the word-by-word breakdown - styled similar to Quran.com */}
        <div className="flex flex-wrap items-center justify-center gap-y-6 gap-x-2 py-8 border-y border-neutral-100 dark:border-neutral-800 text-center">
          {wordByWordData.map((word, index) => (
            <WordBlock 
              key={index} 
              word={word} 
              index={index}
              direction={direction}
              level={cefr}
              showPronunciation={settings.pronunciation.enabled}
              showTranslation={settings.translation.enabled}
              showGrammar={settings.grammar.enabled}
              className={cn(
                "mx-2 px-1",
                currentWordIndex === index && "bg-blue-50 dark:bg-blue-900 ring-2 ring-blue-200 dark:ring-blue-700 rounded-lg"
              )}
            />
          ))}
        </div>
        
        {/* Bottom section shows the secondary language (Spanish in english-to-spanish mode) */}
        {direction === "spanish-to-english" && (
          <p className="text-xl leading-relaxed text-neutral-800 dark:text-neutral-200">{primaryText}</p>
        )}
        
        {/* Settings button and learning context */}
        <div className="mt-2 flex items-center justify-between text-xs text-neutral-500 dark:text-neutral-400">
          <div className="flex gap-2 items-center">
            <span className="font-medium">Direction:</span>
            <span>{direction === "english-to-spanish" ? "English → Spanish" : "Spanish → English"}</span>
          </div>
          <div className="flex items-center gap-1" title="Learning features active">
            <Settings2 className="h-3.5 w-3.5 mr-0.5" />
            {settings.pronunciation.enabled && (
              <span className="px-1.5 py-0.5 bg-blue-50 dark:bg-blue-900 text-blue-600 dark:text-blue-400 rounded-sm">
                Pronunciation
              </span>
            )}
            {settings.grammar.enabled && (
              <span className="px-1.5 py-0.5 bg-purple-50 dark:bg-purple-900 text-purple-600 dark:text-purple-400 rounded-sm">
                Grammar
              </span>
            )}
            {settings.translation.enabled && (
              <span className="px-1.5 py-0.5 bg-green-50 dark:bg-green-900 text-green-600 dark:text-green-400 rounded-sm">
                Translation
              </span>
            )}
          </div>
        </div>
      </div>
    );
  };
  
  // Get level color for the CEFR level
  const getLevelColor = () => {
    switch (cefr) {
      case "A1": return "bg-green-50 text-green-700 border-green-200";
      case "A2": return "bg-green-100 text-green-800 border-green-300";
      case "B1": return "bg-yellow-50 text-yellow-700 border-yellow-200";
      case "B2": return "bg-yellow-100 text-yellow-800 border-yellow-300";
      case "C1": return "bg-orange-50 text-orange-700 border-orange-200";
      case "C2": return "bg-orange-100 text-orange-800 border-orange-300";
      default: return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  // Enhanced audio playback with real TTS
  const playAudio = () => {
    if (!window.speechSynthesis) {
      console.error("Speech synthesis not supported in this browser");
      return;
    }
    
    // Cancel any current TTS
    window.speechSynthesis.cancel();
    
    setIsPlaying(true);
    setCurrentWordIndex(0);
    
    // Set up word-by-word playback
    let index = 0;
    const wordCount = wordByWordData.length;
    
    // Function to play the current word
    const speakCurrentWord = () => {
      if (index < wordCount) {
        const word = wordByWordData[index];
        setCurrentWordIndex(index);
        
        // Create utterance for the word
        const utterance = new SpeechSynthesisUtterance(word.spanishWord);
        
        // Set language based on accent preference
        switch (settings.pronunciation.accent) {
          case "spain":
            utterance.lang = "es-ES";
            break;
          case "mexico":
            utterance.lang = "es-MX";
            break;
          case "argentina":
            utterance.lang = "es-AR";
            break;
          case "colombia":
            utterance.lang = "es-CO";
            break;
          default:
            utterance.lang = "es";
        }
        
        // Set volume from settings
        utterance.volume = settings.pronunciation.volume / 100;
        
        // Set rate and pitch
        utterance.rate = 0.8; // Slightly slower than normal
        utterance.pitch = 1;
        
        // When word is done, move to next
        utterance.onend = () => {
          index++;
          if (index < wordCount) {
            // Small delay between words for natural sound
            setTimeout(speakCurrentWord, 300);
          } else {
            // All words spoken
            setIsPlaying(false);
            setCurrentWordIndex(null);
          }
        };
        
        // Handle errors
        utterance.onerror = (e) => {
          console.error("Speech synthesis error:", e);
          setIsPlaying(false);
          setCurrentWordIndex(null);
        };
        
        // Speak the word
        window.speechSynthesis.speak(utterance);
      }
    };
    
    // Start speaking
    speakCurrentWord();
  };
  
  const stopAudio = () => {
    if (window.speechSynthesis) {
      window.speechSynthesis.cancel();
    }
    setIsPlaying(false);
    setCurrentWordIndex(null);
  };
  
  const handleNextSentence = () => {
    if (nextId && onNavigate) {
      onNavigate(nextId);
    }
  };
  
  const handlePrevSentence = () => {
    if (previousId && onNavigate) {
      onNavigate(previousId);
    }
  };

  return (
    <Card className="w-full overflow-hidden">
      <CardHeader className="border-b bg-neutral-50 dark:bg-neutral-900 dark:border-neutral-800 pb-3 pt-4">
        <div className="flex justify-between items-center">
          <div className="flex flex-col gap-1">
            {lessonSetTitle && (
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium text-neutral-500 dark:text-neutral-400">
                  {lessonSetTitle}
                </span>
                {lessonNumber && (
                  <span className="text-xs px-2 py-0.5 rounded-full bg-neutral-200 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300">
                    Lesson {lessonNumber}
                  </span>
                )}
              </div>
            )}
            <CardTitle className="text-lg font-semibold flex items-center gap-2">
              Sentence #{id}
              <span className={`text-xs px-2 py-0.5 rounded-full border ${getLevelColor()}`}>
                {cefr}
              </span>
            </CardTitle>
          </div>
          
          <div className="flex items-center gap-2">
            {topic && (
              <span className="text-xs px-2 py-0.5 rounded-full bg-blue-50 dark:bg-blue-950 text-blue-700 dark:text-blue-400 border border-blue-200 dark:border-blue-800">
                {topic}
              </span>
            )}
            {grammarFocus && (
              <span className="text-xs px-2 py-0.5 rounded-full bg-purple-50 dark:bg-purple-950 text-purple-700 dark:text-purple-400 border border-purple-200 dark:border-purple-800">
                {grammarFocus}
              </span>
            )}
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="pt-6 pb-4">
        {renderInteractiveSentence()}
      </CardContent>
      
      <CardFooter className="border-t bg-neutral-50 dark:bg-neutral-900 dark:border-neutral-800 flex justify-between py-3">
        <div className="flex items-center gap-2">
          <Button 
            onClick={handlePrevSentence}
            size="sm" 
            variant="outline"
            disabled={!previousId}
          >
            <SkipBack className="h-4 w-4 mr-1" />
            Previous
          </Button>
          
          <Button 
            onClick={handleNextSentence}
            size="sm" 
            variant="outline"
            disabled={!nextId}
          >
            Next
            <SkipForward className="h-4 w-4 ml-1" />
          </Button>
        </div>
        
        <div className="flex items-center gap-2">
          <Button 
            onClick={isPlaying ? stopAudio : playAudio}
            size="sm" 
            variant="ghost"
            className="text-blue-600 dark:text-blue-400"
          >
            {isPlaying ? (
              <Pause className="h-4 w-4 mr-1" />
            ) : (
              <Play className="h-4 w-4 mr-1" />
            )}
            {isPlaying ? "Pause" : "Play"}
          </Button>
          
          {onGenerateExercises && (
            <Button 
              onClick={onGenerateExercises}
              size="sm" 
              variant="outline"
            >
              Practice Exercises
            </Button>
          )}
        </div>
      </CardFooter>
    </Card>
  );
}
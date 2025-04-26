import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";
import { Volume2, BookOpen, Info, X } from "lucide-react";

export interface WordData {
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
}

interface WordBlockProps {
  word: WordData;
  index: number;
  className?: string;
  direction?: "spanish-to-english" | "english-to-spanish";
  level?: "A1" | "A2" | "B1" | "B2" | "C1" | "C2";
  showPronunciation?: boolean;
  showTranslation?: boolean;
  showGrammar?: boolean;
}

export function WordBlock({ 
  word, 
  index, 
  className, 
  direction = "english-to-spanish",
  level = "B1",
  showPronunciation = true,
  showTranslation = true,
  showGrammar = true
}: WordBlockProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [audioElement, setAudioElement] = useState<HTMLAudioElement | null>(null);

  // Determine the primary and secondary words based on direction
  const primaryWord = direction === "english-to-spanish" ? word.englishWord : word.spanishWord;
  const secondaryWord = direction === "english-to-spanish" ? word.spanishWord : word.englishWord;
  const primaryIPA = direction === "english-to-spanish" ? word.ipaEnglish : word.ipaSpanish;
  const secondaryIPA = direction === "english-to-spanish" ? word.ipaSpanish : word.ipaEnglish;
  
  // Setup speech synthesis
  useEffect(() => {
    return () => {
      if (audioElement) {
        audioElement.pause();
      }
    };
  }, [audioElement]);

  // Get user settings from localStorage
  const getUserSettings = () => {
    try {
      const savedSettings = localStorage.getItem('userSettings');
      if (savedSettings) {
        return JSON.parse(savedSettings);
      }
    } catch (error) {
      console.error("Error loading settings:", error);
    }
    
    // Default settings if none found
    return {
      pronunciation: {
        enabled: true,
        volume: 75,
        accent: "spain"
      }
    };
  };

  // Handle pronunciation using browser's speech synthesis API
  const handlePronounce = (e: React.MouseEvent) => {
    e.stopPropagation();
    
    if (!window.speechSynthesis) {
      console.error("Speech synthesis not supported in this browser");
      return;
    }
    
    // Get current user settings
    const userSettings = getUserSettings();
    const volume = userSettings?.pronunciation?.volume ?? 75;
    const accent = userSettings?.pronunciation?.accent ?? "spain";
    
    // Cancel any current speech
    window.speechSynthesis.cancel();
    
    // Create utterance for the word
    const utterance = new SpeechSynthesisUtterance(word.spanishWord);
    
    // Set language based on accent preference
    switch (accent) {
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
    utterance.volume = volume / 100;
    
    // Set rate and pitch
    utterance.rate = 0.8; // Slightly slower than normal
    utterance.pitch = 1;
    
    // Start speaking
    setIsPlaying(true);
    window.speechSynthesis.speak(utterance);
    
    // End event
    utterance.onend = () => setIsPlaying(false);
    
    // Error event
    utterance.onerror = (error) => {
      console.error("Speech synthesis error:", error);
      setIsPlaying(false);
    };
  };

  // Get level color indicator
  const getLevelColor = () => {
    switch (level) {
      case "A1": return "bg-green-50 text-green-700 dark:bg-green-900 dark:text-green-300";
      case "A2": return "bg-green-100 text-green-800 dark:bg-green-800 dark:text-green-200";
      case "B1": return "bg-yellow-50 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300";
      case "B2": return "bg-yellow-100 text-yellow-800 dark:bg-yellow-800 dark:text-yellow-200";
      case "C1": return "bg-orange-50 text-orange-700 dark:bg-orange-900 dark:text-orange-300";
      case "C2": return "bg-orange-100 text-orange-800 dark:bg-orange-800 dark:text-orange-200";
      default: return "bg-gray-50 text-gray-700 dark:bg-gray-800 dark:text-gray-300";
    }
  };
  
  return (
    <div className={cn("inline-block group relative", className)}>
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className={cn(
          "px-1 py-0.5 mx-1 rounded transition-colors hover:bg-blue-50 dark:hover:bg-blue-950 focus:outline-none focus:ring-2 focus:ring-blue-400 dark:focus:ring-blue-600",
          isExpanded && "bg-blue-50 dark:bg-blue-950 shadow-sm"
        )}
      >
        {/* Arabic/Spanish style word with enhanced styling */}
        <div className="flex flex-col items-center">
          {/* Primary word (top) */}
          <span className={cn(
            "text-base md:text-xl",
            direction === "spanish-to-english" && "font-medium text-gray-800 dark:text-gray-100"
          )}>
            {primaryWord}
          </span>
          
          {/* IPA pronunciation (if enabled) */}
          {showPronunciation && primaryIPA && (
            <span className="text-xs text-neutral-500 dark:text-neutral-400">[{primaryIPA}]</span>
          )}
          
          {/* Translation (if enabled) - smaller text below */}
          {showTranslation && (
            <span className="text-xs block text-blue-600 dark:text-blue-400 mt-0.5">{secondaryWord}</span>
          )}
        </div>
      </button>
      
      {/* Expanded word details */}
      {isExpanded && (
        <div className="absolute z-10 left-0 top-full mt-1 bg-white dark:bg-gray-900 rounded-md shadow-lg p-3 w-80 md:w-96 text-left border border-neutral-200 dark:border-neutral-700">
          <div className="flex justify-between items-start">
            <div className="flex-1">
              <div className="flex items-center justify-between">
                <p className="text-lg font-medium dark:text-white">{word.spanishWord}</p>
                <span className={cn("text-xs px-2 py-0.5 rounded-full", getLevelColor())}>{level}</span>
              </div>
              <p className="text-sm text-neutral-500 dark:text-neutral-400">
                {word.lemma} <span className="italic">({word.partOfSpeech})</span>
                {word.ipaSpanish && showPronunciation && <span className="ml-2 font-mono">[{word.ipaSpanish}]</span>}
              </p>
              
              {/* Grammar information */}
              {showGrammar && (
                <div className="flex flex-wrap gap-2 mt-1">
                  {word.gender && (
                    <span className="text-xs bg-purple-50 dark:bg-purple-950 text-purple-700 dark:text-purple-400 rounded px-1.5 py-0.5">
                      {word.gender}
                    </span>
                  )}
                  {word.number && (
                    <span className="text-xs bg-blue-50 dark:bg-blue-950 text-blue-700 dark:text-blue-400 rounded px-1.5 py-0.5">
                      {word.number}
                    </span>
                  )}
                  {word.formality && (
                    <span className="text-xs bg-teal-50 dark:bg-teal-950 text-teal-700 dark:text-teal-400 rounded px-1.5 py-0.5">
                      {word.formality}
                    </span>
                  )}
                </div>
              )}
            </div>
            
            {/* Pronunciation button */}
            <button 
              onClick={handlePronounce}
              className={cn(
                "p-1.5 rounded-full",
                isPlaying 
                  ? "bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300" 
                  : "text-blue-500 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 hover:bg-blue-50 dark:hover:bg-blue-950"
              )}
              title="Pronounce word"
              disabled={isPlaying}
            >
              <Volume2 className="h-4 w-4" />
            </button>
            
            {/* Close button */}
            <button 
              onClick={(e) => {
                e.stopPropagation();
                setIsExpanded(false);
              }}
              className="text-neutral-400 hover:text-neutral-600 dark:text-neutral-500 dark:hover:text-neutral-300 p-1 ml-1 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
          
          {/* Translation section */}
          <div className="mt-2 pb-2 border-b border-neutral-100 dark:border-neutral-800">
            <div className="text-md font-medium dark:text-white">Translation</div>
            <div className="flex items-center">
              <div className="text-blue-700 dark:text-blue-400">{word.englishWord}</div>
              {word.ipaEnglish && showPronunciation && (
                <span className="ml-2 text-xs text-neutral-500 dark:text-neutral-400 font-mono">[{word.ipaEnglish}]</span>
              )}
            </div>
          </div>
          
          {/* Pronunciation guide */}
          {showPronunciation && (word.ukPronunciation || word.usPronunciation) && (
            <div className="mt-2 pb-2 border-b border-neutral-100 dark:border-neutral-800">
              <div className="text-md font-medium dark:text-white">Pronunciation Guide</div>
              {word.ukPronunciation && (
                <div className="flex justify-between">
                  <span className="text-sm text-neutral-500 dark:text-neutral-400">UK</span>
                  <span className="text-sm font-mono dark:text-neutral-300">{word.ukPronunciation}</span>
                </div>
              )}
              {word.usPronunciation && (
                <div className="flex justify-between">
                  <span className="text-sm text-neutral-500 dark:text-neutral-400">US</span>
                  <span className="text-sm font-mono dark:text-neutral-300">{word.usPronunciation}</span>
                </div>
              )}
            </div>
          )}
          
          {/* Conjugation table for verbs */}
          {showGrammar && word.conjugations && word.conjugations.length > 0 && (
            <div className="mt-2 pb-2 border-b border-neutral-100 dark:border-neutral-800">
              <div className="text-md font-medium dark:text-white">Conjugations</div>
              <div className="grid grid-cols-2 gap-2 mt-1">
                {word.conjugations.map((conj, idx) => (
                  <div key={idx} className="text-sm flex justify-between">
                    <span className="text-neutral-500 dark:text-neutral-400">{conj.form}:</span>
                    <span className="font-medium dark:text-white">{conj.value}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
          
          {/* Grammar notes */}
          {showGrammar && word.grammarNotes && (
            <div className="mt-2 pb-2 border-b border-neutral-100 dark:border-neutral-800">
              <div className="text-md font-medium dark:text-white">Grammar Notes</div>
              <p className="text-sm mt-1 dark:text-neutral-300">{word.grammarNotes}</p>
            </div>
          )}
          
          {/* Examples */}
          {word.examples && word.examples.length > 0 && (
            <div className="mt-2">
              <div className="text-md font-medium flex items-center dark:text-white">
                <BookOpen className="h-4 w-4 mr-1" />
                Examples
              </div>
              <ul className="mt-1 space-y-2">
                {word.examples.map((example, idx) => (
                  <li key={idx} className="text-sm">
                    <p className="text-neutral-800 dark:text-neutral-200">{example.spanish}</p>
                    <p className="text-neutral-500 dark:text-neutral-400 italic">{example.english}</p>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
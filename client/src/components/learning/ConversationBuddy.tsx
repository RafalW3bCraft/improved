import { useState, useRef, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Sparkles, Mic, MicOff, Send, Volume2, User, ChevronDown, Brain, MoveHorizontal, Globe2, MessageSquare } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

type Message = {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
  translation?: string;
  feedbacks?: {
    grammar?: string;
    vocabulary?: string;
    pronunciation?: string;
    fluency?: string;
  };
  showFeedback?: boolean;
};

type BuddyPersona = {
  id: string;
  name: string;
  description: string;
  avatarUrl: string;
  personality: string;
  languageLevel: string;
  accent: string;
};

// List of buddy personas to choose from
const BUDDY_PERSONAS: BuddyPersona[] = [
  {
    id: "maria",
    name: "María",
    description: "University student from Madrid",
    avatarUrl: "https://randomuser.me/api/portraits/women/65.jpg",
    personality: "Friendly and patient",
    languageLevel: "Adjusts to your level",
    accent: "Spain (Castilian)"
  },
  {
    id: "carlos",
    name: "Carlos",
    description: "Travel guide from Mexico City",
    avatarUrl: "https://randomuser.me/api/portraits/men/32.jpg",
    personality: "Enthusiastic and helpful",
    languageLevel: "Adjusts to your level",
    accent: "Mexico"
  },
  {
    id: "ana",
    name: "Ana",
    description: "Chef from Buenos Aires",
    avatarUrl: "https://randomuser.me/api/portraits/women/22.jpg",
    personality: "Expressive and encouraging",
    languageLevel: "Adjusts to your level",
    accent: "Argentina"
  },
  {
    id: "professional",
    name: "Professional Tutor",
    description: "Certified language instructor",
    avatarUrl: "https://randomuser.me/api/portraits/men/46.jpg",
    personality: "Professional and structured",
    languageLevel: "Adapts methodically",
    accent: "Neutral Spanish"
  }
];

export default function ConversationBuddy() {
  const [selectedPersona, setSelectedPersona] = useState<BuddyPersona>(BUDDY_PERSONAS[0]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputMessage, setInputMessage] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [isMicActive, setIsMicActive] = useState(false);
  const [learningLevel, setLearningLevel] = useState("intermediate");
  const [conversationTheme, setConversationTheme] = useState("free");
  const [showTranslations, setShowTranslations] = useState(true);
  const [showFeedback, setShowFeedback] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  // Auto-scroll to bottom of messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Set initial welcome message from buddy
  useEffect(() => {
    // Clear messages when persona changes
    setMessages([
      {
        id: "welcome",
        role: "assistant",
        content: `¡Hola! Soy ${selectedPersona.name}, tu compañero de conversación. ¿Cómo puedo ayudarte hoy?`,
        timestamp: new Date(),
        translation: showTranslations ? `Hi! I'm ${selectedPersona.name}, your conversation partner. How can I help you today?` : undefined
      }
    ]);
  }, [selectedPersona]);

  const handleSendMessage = async () => {
    if (!inputMessage.trim()) return;

    // Add user message
    const userMessage: Message = {
      id: `user-${Date.now()}`,
      role: "user",
      content: inputMessage,
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInputMessage("");
    setIsProcessing(true);

    try {
      // In a production app, this would call the OpenAI API
      // For now, we'll simulate a response after a short delay
      setTimeout(() => {
        let response: Message;

        // Simulate different responses based on the conversation theme
        if (conversationTheme === "free") {
          response = {
            id: `assistant-${Date.now()}`,
            role: "assistant",
            content: "Me alegra que estés practicando español. Cuéntame más sobre tus intereses o lo que te gustaría discutir hoy.",
            timestamp: new Date(),
            translation: showTranslations ? "I'm glad you're practicing Spanish. Tell me more about your interests or what you'd like to discuss today." : undefined,
            feedbacks: showFeedback ? {
              grammar: "Good use of present tense! Try including more complex structures in your next message.",
              vocabulary: "You've used appropriate vocabulary. Consider expanding your range with more specific terms.",
              fluency: "Your sentence structure is clear. Work on connecting your thoughts more naturally."
            } : undefined,
            showFeedback: false
          };
        } else if (conversationTheme === "travel") {
          response = {
            id: `assistant-${Date.now()}`,
            role: "assistant",
            content: "¿Has visitado algún lugar en España o Latinoamérica? Me encantaría oír sobre tus experiencias de viaje o los lugares que te gustaría visitar.",
            timestamp: new Date(),
            translation: showTranslations ? "Have you visited any place in Spain or Latin America? I'd love to hear about your travel experiences or places you'd like to visit." : undefined,
            feedbacks: showFeedback ? {
              grammar: "Watch your use of past tense when describing past trips.",
              vocabulary: "Good travel-related vocabulary! Try incorporating more location-specific terms.",
              fluency: "Your response flows well. Practice adding more details to enrich the conversation."
            } : undefined,
            showFeedback: false
          };
        } else {
          // Food theme
          response = {
            id: `assistant-${Date.now()}`,
            role: "assistant",
            content: "La comida es una parte importante de la cultura española y latinoamericana. ¿Cuál es tu plato favorito? ¿Has intentado cocinar comida española o latina?",
            timestamp: new Date(),
            translation: showTranslations ? "Food is an important part of Spanish and Latin American culture. What's your favorite dish? Have you tried cooking Spanish or Latin food?" : undefined,
            feedbacks: showFeedback ? {
              grammar: "Good sentence structure. Practice using more descriptive adjectives when talking about food.",
              vocabulary: "Consider using more specific food-related terms to express your preferences.",
              fluency: "Your response is clear. Try adding more personal opinions to make the conversation more engaging."
            } : undefined,
            showFeedback: false
          };
        }

        setMessages(prev => [...prev, response]);
        setIsProcessing(false);
      }, 1500);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to get a response. Please try again.",
        variant: "destructive"
      });
      setIsProcessing(false);
    }
  };

  const toggleMicrophone = () => {
    if (isMicActive) {
      // Stop recording
      setIsMicActive(false);
      toast({
        title: "Voice input stopped",
        description: "Your voice recording has been stopped."
      });
    } else {
      // Start recording - in a real app, this would use the Web Speech API
      setIsMicActive(true);
      toast({
        title: "Voice input activated",
        description: "Speak clearly in Spanish. Your speech will be converted to text."
      });
      
      // Simulate voice recognition after 3 seconds
      setTimeout(() => {
        setInputMessage("Hola, me gustaría practicar mi español contigo.");
        setIsMicActive(false);
      }, 3000);
    }
  };

  const toggleFeedback = (messageId: string) => {
    setMessages(messages.map(msg => 
      msg.id === messageId ? { ...msg, showFeedback: !msg.showFeedback } : msg
    ));
  };

  const speakText = (text: string) => {
    // In a real app, this would use a high-quality TTS service
    // For now, we'll use the browser's speech synthesis
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'es-ES';
    window.speechSynthesis.speak(utterance);
  };

  return (
    <Card className="w-full h-[80vh] max-h-[800px] flex flex-col">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Avatar className="h-10 w-10">
              <AvatarImage src={selectedPersona.avatarUrl} />
              <AvatarFallback>{selectedPersona.name.charAt(0)}</AvatarFallback>
            </Avatar>
            <div>
              <CardTitle className="text-xl">Conversation with {selectedPersona.name}</CardTitle>
              <CardDescription>{selectedPersona.description}</CardDescription>
            </div>
          </div>
          <Select value={selectedPersona.id} onValueChange={(value) => {
            const newPersona = BUDDY_PERSONAS.find(p => p.id === value);
            if (newPersona) setSelectedPersona(newPersona);
          }}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Select persona" />
            </SelectTrigger>
            <SelectContent>
              {BUDDY_PERSONAS.map(persona => (
                <SelectItem key={persona.id} value={persona.id}>
                  {persona.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        
        <div className="flex flex-wrap gap-2 mt-2">
          <div className="flex items-center space-x-2">
            <Label htmlFor="show-translations" className="text-sm">Translations</Label>
            <Switch
              id="show-translations"
              checked={showTranslations}
              onCheckedChange={setShowTranslations}
            />
          </div>
          
          <div className="flex items-center space-x-2 ml-4">
            <Label htmlFor="show-feedback" className="text-sm">Feedback</Label>
            <Switch
              id="show-feedback"
              checked={showFeedback}
              onCheckedChange={setShowFeedback}
            />
          </div>
          
          <Select value={learningLevel} onValueChange={setLearningLevel} className="ml-auto">
            <SelectTrigger className="w-[140px] h-8">
              <Globe2 className="h-3.5 w-3.5 mr-2" />
              <SelectValue placeholder="Level" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="beginner">A1-A2 Beginner</SelectItem>
              <SelectItem value="intermediate">B1-B2 Intermediate</SelectItem>
              <SelectItem value="advanced">C1-C2 Advanced</SelectItem>
            </SelectContent>
          </Select>
          
          <Select value={conversationTheme} onValueChange={setConversationTheme}>
            <SelectTrigger className="w-[140px] h-8">
              <MessageSquare className="h-3.5 w-3.5 mr-2" />
              <SelectValue placeholder="Theme" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="free">Free Conversation</SelectItem>
              <SelectItem value="travel">Travel & Tourism</SelectItem>
              <SelectItem value="food">Food & Cuisine</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </CardHeader>
      
      <CardContent className="flex-grow overflow-y-auto pt-0 px-4">
        <div className="space-y-4 py-4">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}
            >
              <div
                className={`relative max-w-[80%] ${
                  message.role === "user"
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted"
                } rounded-lg px-4 py-3`}
              >
                {message.role === "assistant" && (
                  <div className="absolute -left-10 top-0">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={selectedPersona.avatarUrl} />
                      <AvatarFallback>{selectedPersona.name.charAt(0)}</AvatarFallback>
                    </Avatar>
                  </div>
                )}
                
                <div>
                  <div className="flex items-center gap-2">
                    <p 
                      className={message.role === "user" ? "text-primary-foreground" : ""}
                    >
                      {message.content}
                    </p>
                    {message.role === "assistant" && (
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6 rounded-full"
                        onClick={() => speakText(message.content)}
                      >
                        <Volume2 className="h-3.5 w-3.5" />
                      </Button>
                    )}
                  </div>
                  
                  {message.translation && (
                    <p className="text-sm text-muted-foreground mt-1 italic">
                      {message.translation}
                    </p>
                  )}
                  
                  {message.role === "user" && message.feedbacks && (
                    <div className="mt-2">
                      <Button
                        variant="link"
                        size="sm"
                        className="text-xs p-0 h-auto"
                        onClick={() => toggleFeedback(message.id)}
                      >
                        <Sparkles className="h-3 w-3 mr-1" />
                        {message.showFeedback ? "Hide feedback" : "Show feedback"}
                        <ChevronDown className="h-3 w-3 ml-1" />
                      </Button>
                      
                      {message.showFeedback && (
                        <div className="mt-2 space-y-1.5 text-xs">
                          {message.feedbacks.grammar && (
                            <div className="flex gap-1.5">
                              <Badge variant="outline" className="px-1.5 py-0">Grammar</Badge>
                              <span>{message.feedbacks.grammar}</span>
                            </div>
                          )}
                          {message.feedbacks.vocabulary && (
                            <div className="flex gap-1.5">
                              <Badge variant="outline" className="px-1.5 py-0">Vocabulary</Badge>
                              <span>{message.feedbacks.vocabulary}</span>
                            </div>
                          )}
                          {message.feedbacks.fluency && (
                            <div className="flex gap-1.5">
                              <Badge variant="outline" className="px-1.5 py-0">Fluency</Badge>
                              <span>{message.feedbacks.fluency}</span>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  )}
                </div>
                
                <div className="text-xs opacity-50 mt-1">
                  {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </div>
              </div>
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>
      </CardContent>
      
      <CardFooter className="border-t p-4">
        <div className="flex w-full gap-2">
          <Button
            variant={isMicActive ? "destructive" : "outline"}
            size="icon"
            disabled={isProcessing}
            onClick={toggleMicrophone}
          >
            {isMicActive ? <MicOff className="h-5 w-5" /> : <Mic className="h-5 w-5" />}
          </Button>
          
          <Input
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSendMessage()}
            placeholder="Type your message in Spanish..."
            disabled={isProcessing || isMicActive}
            className="flex-grow"
          />
          
          <Button disabled={isProcessing || !inputMessage.trim()} onClick={handleSendMessage}>
            <Send className="h-5 w-5 mr-1" />
            Send
          </Button>
        </div>
      </CardFooter>
    </Card>
  );
}
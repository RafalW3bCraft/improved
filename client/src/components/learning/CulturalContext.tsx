import { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import {
  BookMarked,
  Globe,
  Languages,
  Music,
  Utensils,
  Landmark,
  Users,
  Calendar,
  ShoppingBag,
  Map,
  Heart,
  ThumbsUp,
  MessageCircle,
  BookOpen,
  Search,
  Play,
  Volume2,
  Info,
  ExternalLink,
  ChevronsUpDown,
  Check,
  Loader2,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import * as culturalContextService from "@/services/culturalContextService";

// Types for cultural context items
interface CulturalItem {
  id: string;
  type: "idiom" | "expression" | "custom" | "context";
  spanishText: string;
  englishTranslation: string;
  literalTranslation?: string;
  explanation: string;
  usage: string;
  region?: string;
  audioUrl?: string;
  examples: {
    spanish: string;
    english: string;
  }[];
  category: string;
  difficulty: string;
  saved: boolean;
}

// Sample idioms data
const SPANISH_IDIOMS: CulturalItem[] = [
  {
    id: "idiom-1",
    type: "idiom",
    spanishText: "Estar en las nubes",
    englishTranslation: "To be daydreaming",
    literalTranslation: "To be in the clouds",
    explanation: "This expression is used when someone is not paying attention or is distracted because they're thinking about something else.",
    usage: "Used in casual conversations to indicate someone is not mentally present.",
    examples: [
      {
        spanish: "¡Juan, estás en las nubes! Te he llamado tres veces.",
        english: "Juan, you're daydreaming! I've called you three times."
      },
      {
        spanish: "Perdón, estaba en las nubes pensando en las vacaciones.",
        english: "Sorry, I was daydreaming about the vacation."
      }
    ],
    category: "everyday",
    difficulty: "beginner",
    saved: false
  },
  {
    id: "idiom-2",
    type: "idiom",
    spanishText: "Tomar el pelo",
    englishTranslation: "To pull someone's leg",
    literalTranslation: "To take the hair",
    explanation: "This idiom is used when someone is joking with or teasing another person, usually by telling them something that isn't true as a joke.",
    usage: "Common in friendly conversations and jokes between friends.",
    examples: [
      {
        spanish: "No te creo, me estás tomando el pelo.",
        english: "I don't believe you, you're pulling my leg."
      },
      {
        spanish: "Solo te estaba tomando el pelo, no es verdad.",
        english: "I was just pulling your leg, it's not true."
      }
    ],
    category: "humor",
    difficulty: "beginner",
    saved: false
  },
  {
    id: "idiom-3",
    type: "idiom",
    spanishText: "Ser pan comido",
    englishTranslation: "To be a piece of cake",
    literalTranslation: "To be eaten bread",
    explanation: "This expression means something is very easy to do or accomplish, just like the English equivalent 'piece of cake'.",
    usage: "Used to describe tasks or activities that are considered very easy.",
    examples: [
      {
        spanish: "El examen fue pan comido.",
        english: "The exam was a piece of cake."
      },
      {
        spanish: "No te preocupes, arreglar esto será pan comido para mí.",
        english: "Don't worry, fixing this will be a piece of cake for me."
      }
    ],
    category: "everyday",
    difficulty: "beginner",
    saved: false
  },
  {
    id: "idiom-4",
    type: "idiom",
    spanishText: "Dar en el clavo",
    englishTranslation: "To hit the nail on the head",
    literalTranslation: "To hit the nail",
    explanation: "Just like in English, this idiom means to be exactly right or to identify the exact problem or solution.",
    usage: "Used when someone makes a very accurate statement or finds the perfect solution.",
    examples: [
      {
        spanish: "¡Diste en el clavo! Ese es exactamente el problema.",
        english: "You hit the nail on the head! That's exactly the problem."
      },
      {
        spanish: "Creo que María dio en el clavo con su análisis de la situación.",
        english: "I think Maria hit the nail on the head with her analysis of the situation."
      }
    ],
    category: "accuracy",
    difficulty: "intermediate",
    saved: false
  },
  {
    id: "idiom-5",
    type: "idiom",
    spanishText: "No tener pelos en la lengua",
    englishTranslation: "To speak one's mind freely",
    literalTranslation: "To not have hairs on the tongue",
    explanation: "This idiom refers to someone who speaks frankly and directly, without hesitation or fear of consequences.",
    usage: "Used to describe someone who is very direct and honest in their speech.",
    region: "Spain",
    examples: [
      {
        spanish: "Mi abuela no tiene pelos en la lengua y siempre dice lo que piensa.",
        english: "My grandmother speaks her mind freely and always says what she thinks."
      },
      {
        spanish: "Si quieres la verdad, pregúntale a Ana. Ella no tiene pelos en la lengua.",
        english: "If you want the truth, ask Ana. She speaks her mind freely."
      }
    ],
    category: "personality",
    difficulty: "intermediate",
    saved: false
  },
  {
    id: "expression-1",
    type: "expression",
    spanishText: "¡Qué padre!",
    englishTranslation: "How cool!",
    literalTranslation: "How father!",
    explanation: "In Mexican Spanish, 'padre' can be used as an adjective to mean 'cool' or 'great'.",
    usage: "Very common in Mexico to express enthusiasm or approval.",
    region: "Mexico",
    examples: [
      {
        spanish: "¡Qué padre está tu nuevo carro!",
        english: "How cool is your new car!"
      },
      {
        spanish: "La fiesta estuvo muy padre.",
        english: "The party was very cool."
      }
    ],
    category: "slang",
    difficulty: "beginner",
    saved: false
  },
  {
    id: "custom-1",
    type: "custom",
    spanishText: "Siesta",
    englishTranslation: "Afternoon nap",
    explanation: "The siesta is a short nap taken in the early afternoon, typically after the midday meal. It's a cultural tradition in Spain and some Latin American countries, especially in hot climates.",
    usage: "Traditional custom in Spain and parts of Latin America, though less common in urban areas now.",
    region: "Spain, Latin America",
    examples: [
      {
        spanish: "Durante el verano, muchas tiendas cierran durante la siesta.",
        english: "During summer, many shops close during siesta time."
      },
      {
        spanish: "Mi abuelo siempre hace la siesta después de comer.",
        english: "My grandfather always takes a siesta after lunch."
      }
    ],
    category: "customs",
    difficulty: "beginner",
    saved: false
  },
  {
    id: "context-1",
    type: "context",
    spanishText: "Tutear",
    englishTranslation: "To address someone using 'tú'",
    explanation: "In Spanish-speaking cultures, the decision to use the informal 'tú' versus the formal 'usted' is important and varies by country, age, and social context.",
    usage: "Understanding when to use 'tú' versus 'usted' is essential for proper communication.",
    examples: [
      {
        spanish: "En España, es común tutear a personas que acabas de conocer.",
        english: "In Spain, it's common to use 'tú' with people you've just met."
      },
      {
        spanish: "¿Podemos tutearnos? El 'usted' me hace sentir viejo.",
        english: "Can we use 'tú' with each other? Using 'usted' makes me feel old."
      }
    ],
    category: "grammar",
    difficulty: "beginner",
    saved: false
  },
];

// Region categories for filtering
const REGIONS = [
  { label: "All Regions", value: "all" },
  { label: "Spain", value: "Spain" },
  { label: "Mexico", value: "Mexico" },
  { label: "Colombia", value: "Colombia" },
  { label: "Argentina", value: "Argentina" },
  { label: "Peru", value: "Peru" },
  { label: "Chile", value: "Chile" },
];

// Content categories for filtering
const CATEGORIES = [
  { label: "All Categories", value: "all" },
  { label: "Everyday", value: "everyday" },
  { label: "Humor", value: "humor" },
  { label: "Food", value: "food" },
  { label: "Business", value: "business" },
  { label: "Customs", value: "customs" },
  { label: "Slang", value: "slang" },
  { label: "Grammar", value: "grammar" },
];

export default function CulturalContext() {
  const [items, setItems] = useState<CulturalItem[]>(SPANISH_IDIOMS);
  const [savedItems, setSavedItems] = useState<CulturalItem[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedRegion, setSelectedRegion] = useState("all");
  const [selectedDifficulty, setSelectedDifficulty] = useState("all");
  const [expandedItems, setExpandedItems] = useState<Record<string, boolean>>({});
  const [selectedIdioms, setSelectedIdioms] = useState<string[]>([]);
  const { toast } = useToast();
  
  // Query to fetch idioms
  const idiomsQuery = useQuery({
    queryKey: ['idioms', selectedDifficulty, selectedRegion, selectedCategory],
    queryFn: () => culturalContextService.generateIdioms(
      selectedDifficulty !== 'all' ? selectedDifficulty : 'beginner',
      selectedRegion !== 'all' ? selectedRegion : 'any',
      selectedCategory !== 'all' ? selectedCategory : 'any',
      8
    ),
    enabled: false, // Don't run automatically on mount
  });
  
  // Query to fetch cultural context information
  const culturalContextQuery = useQuery({
    queryKey: ['cultural-context', selectedRegion],
    queryFn: () => culturalContextService.getCulturalContext(
      selectedRegion !== 'all' ? selectedRegion : 'Spain'
    ),
    enabled: false, // Don't run automatically
  });
  
  // Mutation to generate exercises
  const exercisesMutation = useMutation({
    mutationFn: (idioms: string[]) => 
      culturalContextService.generateExercises(idioms, 'multiple-choice'),
    onSuccess: (data) => {
      toast({
        title: "Exercises Generated",
        description: "Practice exercises have been created based on selected idioms.",
        duration: 3000
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to generate exercises. Please try again.",
        variant: "destructive",
        duration: 3000
      });
    }
  });
  
  // Effect to update items when idioms query data changes
  useEffect(() => {
    if (idiomsQuery.data && idiomsQuery.data.success) {
      const apiItems = idiomsQuery.data.data.idioms.map((item: any, index: number) => ({
        id: `api-idiom-${index}`,
        type: "idiom",
        spanishText: item.spanishText,
        englishTranslation: item.englishTranslation,
        literalTranslation: item.literalTranslation,
        explanation: item.explanation,
        usage: item.usage, 
        region: item.region,
        examples: item.examples,
        category: item.category || "everyday",
        difficulty: item.difficulty || "beginner",
        saved: false
      }));
      
      setItems(prevItems => {
        // Keep saved items and add new ones
        const savedItemIds = prevItems.filter(item => item.saved).map(item => item.id);
        return [
          ...prevItems.filter(item => item.saved), 
          ...apiItems.filter(item => !savedItemIds.includes(item.id))
        ];
      });
    }
  }, [idiomsQuery.data]);

  // Filter items based on search and filters
  const filteredItems = items.filter(item => {
    const matchesSearch = 
      item.spanishText.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.englishTranslation.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesCategory = 
      selectedCategory === "all" || item.category === selectedCategory;
    
    const matchesRegion = 
      selectedRegion === "all" || 
      (item.region && item.region.includes(selectedRegion));
    
    const matchesDifficulty = 
      selectedDifficulty === "all" || item.difficulty === selectedDifficulty;
    
    return matchesSearch && matchesCategory && matchesRegion && matchesDifficulty;
  });

  // Toggle item expansion
  const toggleExpand = (id: string) => {
    setExpandedItems(prev => ({
      ...prev,
      [id]: !prev[id]
    }));
  };

  // Toggle save item
  const toggleSaveItem = (id: string) => {
    // Update main items list
    setItems(prev => prev.map(item => 
      item.id === id ? { ...item, saved: !item.saved } : item
    ));
    
    // Find the item
    const item = items.find(i => i.id === id);
    if (!item) return;
    
    if (!item.saved) {
      // Add to saved items
      setSavedItems(prev => [...prev, { ...item, saved: true }]);
      
      toast({
        title: "Item Saved",
        description: `${item.spanishText} has been saved to your collection.`,
        duration: 3000
      });
    } else {
      // Remove from saved items
      setSavedItems(prev => prev.filter(i => i.id !== id));
      
      toast({
        title: "Item Removed",
        description: `${item.spanishText} has been removed from your collection.`,
        duration: 3000
      });
    }
  };

  // Simulate playing audio
  const playAudio = (item: CulturalItem) => {
    // In a real app, this would play an audio file
    toast({
      title: "Playing Audio",
      description: `Playing pronunciation for "${item.spanishText}"`,
      duration: 2000
    });
  };

  const renderItemCard = (item: CulturalItem) => {
    const isExpanded = expandedItems[item.id] || false;
    
    return (
      <Card key={item.id} className="mb-4">
        <CardHeader className="pb-3">
          <div className="flex justify-between items-start">
            <div>
              <CardTitle className="text-xl flex items-center">
                {item.spanishText}
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => playAudio(item)}
                  className="ml-2 h-6 w-6"
                >
                  <Volume2 className="h-4 w-4" />
                </Button>
              </CardTitle>
              <CardDescription className="mt-1">
                {item.englishTranslation}
                {item.literalTranslation && (
                  <span className="block text-xs mt-0.5">
                    Literal: {item.literalTranslation}
                  </span>
                )}
              </CardDescription>
            </div>
            <div className="flex space-x-1">
              {item.region && (
                <Badge variant="outline" className="text-xs">
                  <Globe className="h-3 w-3 mr-1" />
                  {item.region}
                </Badge>
              )}
              <Badge className="text-xs">
                {item.type === "idiom" && <MessageCircle className="h-3 w-3 mr-1" />}
                {item.type === "expression" && <Languages className="h-3 w-3 mr-1" />}
                {item.type === "custom" && <Landmark className="h-3 w-3 mr-1" />}
                {item.type === "context" && <Info className="h-3 w-3 mr-1" />}
                {item.type.charAt(0).toUpperCase() + item.type.slice(1)}
              </Badge>
            </div>
          </div>
        </CardHeader>
        
        <CardContent>
          <div className={`${isExpanded ? '' : 'line-clamp-2'} text-sm`}>
            <p className="font-medium text-neutral-700">Explanation:</p>
            <p>{item.explanation}</p>
          </div>
          
          {isExpanded && (
            <div className="mt-4 space-y-3">
              <div>
                <p className="font-medium text-sm text-neutral-700">Usage Context:</p>
                <p className="text-sm">{item.usage}</p>
              </div>
              
              <div>
                <p className="font-medium text-sm text-neutral-700">Examples:</p>
                <ul className="space-y-2 mt-1">
                  {item.examples.map((example, idx) => (
                    <li key={idx} className="text-sm border-l-2 border-primary-100 pl-3 py-1">
                      <p className="italic">{example.spanish}</p>
                      <p className="text-neutral-500">{example.english}</p>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          )}
          
          <Button
            variant="ghost"
            size="sm"
            onClick={() => toggleExpand(item.id)}
            className="mt-2 text-xs h-8 px-2"
          >
            {isExpanded ? 'Show Less' : 'Show More'}
            <ChevronsUpDown className="h-3.5 w-3.5 ml-1" />
          </Button>
        </CardContent>
        
        <CardFooter className="pt-0 flex justify-between">
          <div className="flex space-x-1">
            <Badge variant="outline" className="h-5 text-xs">
              {item.difficulty.charAt(0).toUpperCase() + item.difficulty.slice(1)}
            </Badge>
            <Badge variant="outline" className="h-5 text-xs capitalize">
              {item.category}
            </Badge>
          </div>
          
          <Button
            variant="ghost"
            size="sm"
            onClick={() => toggleSaveItem(item.id)}
            className={`${item.saved ? 'text-amber-500' : ''}`}
          >
            {item.saved ? (
              <>
                <BookMarked className="h-4 w-4 mr-1" />
                Saved
              </>
            ) : (
              <>
                <BookOpen className="h-4 w-4 mr-1" />
                Save
              </>
            )}
          </Button>
        </CardFooter>
      </Card>
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Cultural Context & Idioms</h2>
          <p className="text-muted-foreground">
            Learn Spanish expressions, idioms, and cultural contexts to speak like a native
          </p>
        </div>
        
        <div className="flex gap-2">
          <Badge variant="outline" className="py-1.5 px-3">
            <BookMarked className="h-4 w-4 mr-1.5" />
            {savedItems.length} Saved Items
          </Badge>
        </div>
      </div>
      
      <Tabs defaultValue="browse">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="browse">
            <Globe className="h-4 w-4 mr-2" />
            Browse
          </TabsTrigger>
          <TabsTrigger value="saved">
            <BookMarked className="h-4 w-4 mr-2" />
            Saved Items
          </TabsTrigger>
          <TabsTrigger value="practice">
            <Play className="h-4 w-4 mr-2" />
            Practice
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="browse" className="space-y-4 pt-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Search idioms and expressions..."
                className="pl-8"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            
            <select
              className="h-10 rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
            >
              {CATEGORIES.map(category => (
                <option key={category.value} value={category.value}>
                  {category.label}
                </option>
              ))}
            </select>
            
            <select
              className="h-10 rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              value={selectedRegion}
              onChange={(e) => setSelectedRegion(e.target.value)}
            >
              {REGIONS.map(region => (
                <option key={region.value} value={region.value}>
                  {region.label}
                </option>
              ))}
            </select>
            
            <select
              className="h-10 rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              value={selectedDifficulty}
              onChange={(e) => setSelectedDifficulty(e.target.value)}
            >
              <option value="all">All Levels</option>
              <option value="beginner">Beginner</option>
              <option value="intermediate">Intermediate</option>
              <option value="advanced">Advanced</option>
            </select>
          </div>
          
          <div className="flex justify-between items-center">
            <div className="space-x-2">
              <Button 
                onClick={() => idiomsQuery.refetch()}
                disabled={idiomsQuery.isFetching}
                className="flex items-center"
              >
                {idiomsQuery.isFetching ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <Globe className="mr-2 h-4 w-4" />
                )}
                Generate New Idioms
              </Button>
              
              <Button 
                variant="outline"
                onClick={() => culturalContextQuery.refetch()}
                disabled={culturalContextQuery.isFetching || selectedRegion === 'all'}
                className="flex items-center"
              >
                {culturalContextQuery.isFetching ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <Landmark className="mr-2 h-4 w-4" />
                )}
                Get Cultural Context
              </Button>
            </div>
            
            <div>
              <Badge variant="outline">
                {filteredItems.length} items shown
              </Badge>
            </div>
          </div>
          
          {/* Information display when region is selected */}
          {culturalContextQuery.data && culturalContextQuery.data.success && (
            <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200 mb-4">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Landmark className="h-5 w-5 mr-2" />
                  Cultural Context: {culturalContextQuery.data.data.region}
                </CardTitle>
                <CardDescription>
                  Learn about the cultural background that influences language use
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {culturalContextQuery.data.data.linguisticFeatures && (
                    <div>
                      <h3 className="font-medium mb-2">Linguistic Features</h3>
                      <ul className="space-y-2">
                        {culturalContextQuery.data.data.linguisticFeatures.map((feature: any, idx: number) => (
                          <li key={idx} className="text-sm">
                            <p className="font-medium">{feature.feature}</p>
                            {feature.examples && (
                              <div className="pl-3 mt-1 border-l-2 border-primary-100">
                                <p className="text-xs text-muted-foreground">Examples:</p>
                                <ul className="text-xs">
                                  {feature.examples.map((example: string, i: number) => (
                                    <li key={i} className="text-primary-700">{example}</li>
                                  ))}
                                </ul>
                              </div>
                            )}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                  
                  {culturalContextQuery.data.data.communicationTips && (
                    <div>
                      <h3 className="font-medium mb-2">Communication Tips</h3>
                      <ul className="pl-5 list-disc space-y-1 text-sm">
                        {culturalContextQuery.data.data.communicationTips.map((tip: string, idx: number) => (
                          <li key={idx}>{tip}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          )}
          
          {/* API loading indicator */}
          {idiomsQuery.isFetching && (
            <div className="text-center py-8">
              <Loader2 className="h-8 w-8 animate-spin mx-auto text-primary" />
              <p className="mt-2 text-muted-foreground">
                Generating idioms and expressions...
              </p>
            </div>
          )}
          
          <div className="grid grid-cols-1 gap-4">
            {filteredItems.length > 0 ? (
              filteredItems.map(item => renderItemCard(item))
            ) : (
              <div className="text-center py-12 border border-dashed rounded-lg">
                <Languages className="mx-auto h-8 w-8 text-muted-foreground/60" />
                <p className="mt-2 text-muted-foreground">
                  No idioms or expressions found matching your filters.
                </p>
                <div className="flex justify-center mt-3 space-x-2">
                  <Button
                    variant="outline"
                    onClick={() => {
                      setSearchTerm("");
                      setSelectedCategory("all");
                      setSelectedRegion("all");
                      setSelectedDifficulty("all");
                    }}
                  >
                    Clear Filters
                  </Button>
                  
                  <Button
                    onClick={() => idiomsQuery.refetch()}
                    disabled={idiomsQuery.isFetching}
                  >
                    Generate New Idioms
                  </Button>
                </div>
              </div>
            )}
          </div>
        </TabsContent>
        
        <TabsContent value="saved" className="pt-4">
          <ScrollArea className="h-[600px] pr-4">
            {savedItems.length > 0 ? (
              <div className="space-y-4">
                {savedItems.map(item => renderItemCard(item))}
              </div>
            ) : (
              <div className="text-center py-12 border border-dashed rounded-lg">
                <BookMarked className="mx-auto h-8 w-8 text-muted-foreground/60" />
                <p className="mt-2 text-muted-foreground">
                  You haven't saved any idioms or expressions yet.
                </p>
                <p className="text-sm text-muted-foreground/70 mt-1">
                  Browse the collection and click "Save" to add items to your personal list.
                </p>
              </div>
            )}
          </ScrollArea>
        </TabsContent>
        
        <TabsContent value="practice" className="pt-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Play className="h-5 w-5 mr-2" />
                Practice Activities
              </CardTitle>
              <CardDescription>
                Test your knowledge of Spanish idioms and cultural expressions
              </CardDescription>
            </CardHeader>
            
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Card className="border-2 hover:border-primary/50 transition-colors cursor-pointer">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-lg">Matching Game</CardTitle>
                    <CardDescription>Match idioms with their meanings</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm">
                      Test your memory by matching Spanish idioms with their English equivalents in this interactive game.
                    </p>
                  </CardContent>
                  <CardFooter>
                    <Button className="w-full">
                      Start Game
                    </Button>
                  </CardFooter>
                </Card>
                
                <Card className="border-2 hover:border-primary/50 transition-colors cursor-pointer">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-lg">Fill-in-the-Blank</CardTitle>
                    <CardDescription>Complete sentences with the right idiom</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm">
                      Read context clues and fill in the blank with the appropriate Spanish idiom or expression.
                    </p>
                  </CardContent>
                  <CardFooter>
                    <Button className="w-full">
                      Start Exercise
                    </Button>
                  </CardFooter>
                </Card>
                
                <Card className="border-2 hover:border-primary/50 transition-colors cursor-pointer">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-lg">Context Quiz</CardTitle>
                    <CardDescription>Select the right contexts for idiom usage</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm">
                      Test your understanding of when and how to use various Spanish expressions in different contexts.
                    </p>
                  </CardContent>
                  <CardFooter>
                    <Button className="w-full">
                      Start Quiz
                    </Button>
                  </CardFooter>
                </Card>
                
                <Card className="border-2 hover:border-primary/50 transition-colors cursor-pointer">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-lg">Cultural Insights</CardTitle>
                    <CardDescription>Learn about traditions behind the language</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm">
                      Explore the cultural contexts and historical backgrounds that gave rise to common Spanish expressions.
                    </p>
                  </CardContent>
                  <CardFooter>
                    <Button className="w-full">
                      Explore
                    </Button>
                  </CardFooter>
                </Card>
              </div>
              
              <Separator className="my-6" />
              
              <div>
                <h3 className="text-lg font-medium mb-3">Daily Challenge</h3>
                <Card className="bg-gradient-to-r from-amber-50 to-orange-50 border-amber-200">
                  <CardHeader>
                    <div className="flex justify-between">
                      <CardTitle>Idiom of the Day</CardTitle>
                      <Badge>New</Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-xl font-medium">Hablar por los codos</p>
                    <p className="text-muted-foreground mt-1">Literal: To talk through one's elbows</p>
                    <p className="mt-3">Can you guess what this idiom means?</p>
                    
                    <div className="mt-6 space-y-2">
                      <div className="flex items-center space-x-2">
                        <input type="radio" id="option1" name="idiom-meaning" className="h-4 w-4" />
                        <label htmlFor="option1">To speak with one's hands</label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <input type="radio" id="option2" name="idiom-meaning" className="h-4 w-4" />
                        <label htmlFor="option2">To gossip about others</label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <input type="radio" id="option3" name="idiom-meaning" className="h-4 w-4" />
                        <label htmlFor="option3">To talk too much</label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <input type="radio" id="option4" name="idiom-meaning" className="h-4 w-4" />
                        <label htmlFor="option4">To speak nonsense</label>
                      </div>
                    </div>
                  </CardContent>
                  <CardFooter>
                    <Button className="w-full">
                      Check Answer
                    </Button>
                  </CardFooter>
                </Card>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
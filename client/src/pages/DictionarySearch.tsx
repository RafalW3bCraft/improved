import { useState, useRef } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search, Volume2, Bookmark, BookMarked, Copy, MoreHorizontal, Book, Sparkles, MessageSquare, History, Star, Download } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { useToast } from "@/hooks/use-toast";

export default function DictionarySearch() {
  const [searchTerm, setSearchTerm] = useState("");
  const [direction, setDirection] = useState("en-es");
  const [hasSearched, setHasSearched] = useState(false);
  const [searchHistory, setSearchHistory] = useState<string[]>([]);
  const [bookmarked, setBookmarked] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<string>("dictionary");
  const pronunciationRef = useRef<HTMLAudioElement>(null);
  const { toast } = useToast();
  
  // Split direction into source and target languages
  const [sourceLang, targetLang] = direction.split('-');
  
  // Search dictionary
  const searchQuery = useQuery({
    queryKey: ['/api/dictionary/search', searchTerm, sourceLang, targetLang],
    enabled: hasSearched && searchTerm.length > 0,
    refetchOnWindowFocus: false,
  });
  
  const handleSearch = () => {
    if (searchTerm.trim().length > 0) {
      setHasSearched(true);
      
      // Add to search history if not already present
      if (!searchHistory.includes(searchTerm)) {
        setSearchHistory(prev => [searchTerm, ...prev].slice(0, 10));
      }
    }
  };
  
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };
  
  const handleHistoryClick = (term: string) => {
    setSearchTerm(term);
    setHasSearched(true);
  };
  
  const handleToggleBookmark = () => {
    setBookmarked(!bookmarked);
    toast({
      title: bookmarked ? "Removed from saved words" : "Added to saved words",
      description: bookmarked 
        ? `${searchTerm} has been removed from your saved words.`
        : `${searchTerm} has been added to your saved words.`,
      duration: 3000,
    });
  };
  
  const handleCopyToClipboard = () => {
    if (primaryResult) {
      navigator.clipboard.writeText(`${primaryResult.sourceWord} - ${primaryResult.translation}`);
      toast({
        title: "Copied to clipboard",
        description: "The translation has been copied to your clipboard.",
        duration: 3000,
      });
    }
  };
  
  const handlePlayPronunciation = () => {
    // In a production app, this would play audio from a real pronunciation API
    // For now, we'll just use browser's speech synthesis as a placeholder
    const utterance = new SpeechSynthesisUtterance(primaryResult?.sourceWord || searchTerm);
    utterance.lang = sourceLang === 'es' ? 'es-ES' : 'en-US';
    window.speechSynthesis.speak(utterance);
  };
  
  // Find the primary translation (first result)
  const primaryResult = searchQuery.data && searchQuery.data.length > 0 ? searchQuery.data[0] : null;
  
  // Other translations (excluding the first one)
  const otherTranslations = searchQuery.data && searchQuery.data.length > 1
    ? [...new Set(searchQuery.data.slice(1).map(entry => entry.translation))]
    : [];
    
  // For a production app, these would come from real APIs - using placeholders for now
  const exampleSentences = [
    {
      source: sourceLang === 'en' 
        ? "This is an example sentence using this word." 
        : "Esta es una frase de ejemplo usando esta palabra.",
      translation: targetLang === 'en'
        ? "This is an example sentence using this word."
        : "Esta es una frase de ejemplo usando esta palabra."
    },
    {
      source: sourceLang === 'en'
        ? "Here is another example for context."
        : "Aquí hay otro ejemplo para contexto.",
      translation: targetLang === 'en'
        ? "Here is another example for context."
        : "Aquí hay otro ejemplo para contexto."
    }
  ];
  
  return (
    <Card className="max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle className="text-2xl font-bold">Spanish-English Dictionary</CardTitle>
        <CardDescription>Search for words, save favorites, and learn pronunciations</CardDescription>
      </CardHeader>
      
      <CardContent>
        <Tabs defaultValue="dictionary" className="w-full" onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="dictionary">
              <Search className="mr-2 h-4 w-4" />
              Dictionary
            </TabsTrigger>
            <TabsTrigger value="saved">
              <BookMarked className="mr-2 h-4 w-4" />
              Saved Words
            </TabsTrigger>
            <TabsTrigger value="history">
              <History className="mr-2 h-4 w-4" />
              History
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="dictionary" className="mt-6">
            {/* Dictionary Search Controls */}
            <div className="w-full sm:flex sm:items-center sm:gap-x-4 mb-8">
              <div className="relative flex-grow">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Search className="h-5 w-5 text-neutral-400" />
                </div>
                <Input
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Enter a word or phrase to translate..."
                  className="pl-10 py-6 text-lg"
                />
                <div className="absolute inset-y-0 right-0 flex items-center pr-3">
                  <Select value={direction} onValueChange={setDirection}>
                    <SelectTrigger className="border-0 bg-transparent w-[90px]">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="en-es">EN → ES</SelectItem>
                      <SelectItem value="es-en">ES → EN</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <Button className="mt-3 sm:mt-0 w-full sm:w-auto" onClick={handleSearch}>
                <Search className="h-4 w-4 mr-2" />
                Translate
              </Button>
            </div>
            
            {/* Search Results */}
            {hasSearched && (
              <>
                {searchQuery.isLoading ? (
                  <div className="text-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-700 mx-auto"></div>
                    <p className="mt-2 text-neutral-600">Searching...</p>
                  </div>
                ) : searchQuery.error ? (
                  <div className="text-center py-8 text-red-500">
                    <p>An error occurred while searching. Please try again.</p>
                  </div>
                ) : searchQuery.data && searchQuery.data.length > 0 ? (
                  <div className="border border-neutral-200 rounded-lg overflow-hidden">
                    <div className="bg-neutral-50 px-4 py-3 border-b border-neutral-200">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center">
                          <span className="text-lg font-medium text-neutral-800">{primaryResult?.sourceWord}</span>
                          <span className="ml-2 text-sm text-neutral-500">
                            {sourceLang === 'en' ? 'English' : 'Spanish'} → {targetLang === 'en' ? 'English' : 'Spanish'}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button 
                                variant="ghost" 
                                size="icon" 
                                onClick={handlePlayPronunciation}
                                className="text-neutral-500 hover:text-neutral-700"
                              >
                                <Volume2 className="h-5 w-5" />
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent>
                              <p>Hear pronunciation</p>
                            </TooltipContent>
                          </Tooltip>
                          
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button 
                                variant="ghost" 
                                size="icon" 
                                onClick={handleToggleBookmark}
                                className={bookmarked ? "text-amber-500" : "text-neutral-500 hover:text-neutral-700"}
                              >
                                {bookmarked ? <BookMarked className="h-5 w-5" /> : <Bookmark className="h-5 w-5" />}
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent>
                              <p>{bookmarked ? "Remove from saved words" : "Save word"}</p>
                            </TooltipContent>
                          </Tooltip>
                          
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button 
                                variant="ghost" 
                                size="icon" 
                                className="text-neutral-500 hover:text-neutral-700"
                              >
                                <MoreHorizontal className="h-5 w-5" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem onClick={handleCopyToClipboard}>
                                <Copy className="mr-2 h-4 w-4" />
                                <span>Copy</span>
                              </DropdownMenuItem>
                              <DropdownMenuItem>
                                <Sparkles className="mr-2 h-4 w-4" />
                                <span>Generate Example</span>
                              </DropdownMenuItem>
                              <DropdownMenuItem>
                                <Book className="mr-2 h-4 w-4" />
                                <span>Add to Learning List</span>
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      </div>
                    </div>
                    
                    <div className="divide-y divide-neutral-200">
                      <div className="px-4 py-4">
                        <h4 className="text-sm font-medium text-neutral-500 uppercase">Primary Translation</h4>
                        <p className="mt-1 text-lg text-neutral-800">{primaryResult?.translation}</p>
                      </div>
                      
                      {otherTranslations.length > 0 && (
                        <div className="px-4 py-4">
                          <h4 className="text-sm font-medium text-neutral-500 uppercase">Other Translations</h4>
                          <div className="mt-2 flex flex-wrap gap-2">
                            {otherTranslations.map((translation, index) => (
                              <Badge key={index} variant="secondary" className="text-sm">
                                {translation}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      )}
                      
                      <div className="px-4 py-4">
                        <h4 className="text-sm font-medium text-neutral-500 uppercase">Example Sentences</h4>
                        <div className="mt-2 space-y-3">
                          {exampleSentences.map((example, index) => (
                            <div key={index} className="border-l-2 border-primary-300 pl-3">
                              <p className="text-sm font-medium">{example.source}</p>
                              <p className="text-sm text-muted-foreground mt-1">{example.translation}</p>
                            </div>
                          ))}
                        </div>
                      </div>
                      
                      <div className="flex px-4 py-3 bg-neutral-50 text-sm text-muted-foreground justify-between items-center">
                        <span>
                          <span className="font-medium">IPA: </span>
                          {sourceLang === 'en' ? '/ɪɡˈzæmpəl/' : '/ekˈsamplo/'}
                        </span>
                        <Button variant="outline" size="sm">
                          <MessageSquare className="h-4 w-4 mr-2" />
                          Practice with AI
                        </Button>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-8 text-neutral-600 border border-dashed border-neutral-300 rounded-lg">
                    <p>No results found for "{searchTerm}"</p>
                    <p className="text-sm mt-2">Try a different word or check your spelling</p>
                  </div>
                )}
              </>
            )}
          </TabsContent>
          
          <TabsContent value="saved" className="mt-6">
            <div className="text-center py-12 border border-dashed border-neutral-300 rounded-lg">
              <BookMarked className="h-12 w-12 text-neutral-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium mb-2">No saved words yet</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Words you save will appear here for quick access
              </p>
              <Button variant="outline" onClick={() => setActiveTab("dictionary")}>
                <Search className="h-4 w-4 mr-2" />
                Search Dictionary
              </Button>
            </div>
          </TabsContent>
          
          <TabsContent value="history" className="mt-6">
            {searchHistory.length > 0 ? (
              <div className="space-y-2">
                {searchHistory.map((term, index) => (
                  <Button 
                    key={index} 
                    variant="outline" 
                    className="w-full justify-start text-left font-normal"
                    onClick={() => handleHistoryClick(term)}
                  >
                    <History className="h-4 w-4 mr-2 text-neutral-500" />
                    {term}
                  </Button>
                ))}
              </div>
            ) : (
              <div className="text-center py-12 border border-dashed border-neutral-300 rounded-lg">
                <History className="h-12 w-12 text-neutral-300 mx-auto mb-4" />
                <h3 className="text-lg font-medium mb-2">No search history</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Your recent searches will appear here
                </p>
                <Button variant="outline" onClick={() => setActiveTab("dictionary")}>
                  <Search className="h-4 w-4 mr-2" />
                  Search Dictionary
                </Button>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </CardContent>
      
      <CardFooter className="flex justify-between border-t pt-6">
        <Button variant="outline" size="sm">
          <Download className="h-4 w-4 mr-2" />
          Export Dictionary
        </Button>
        
        <div className="flex space-x-2">
          <Badge className="bg-green-100 text-green-800 hover:bg-green-200">
            <Star className="h-3 w-3 mr-1 fill-current" />
            Premium Features
          </Badge>
        </div>
      </CardFooter>
    </Card>
  );
}

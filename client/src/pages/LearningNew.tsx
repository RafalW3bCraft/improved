import { useState } from "react";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  BookOpen,
  MessageSquare,
  Sparkles,
  BarChart,
  FileText,
  BookMarked,
  Layers,
  Brain,
  GraduationCap,
  Languages,
  Globe,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import ConversationBuddy from "@/components/learning/ConversationBuddy";
import SentenceGenerator from "@/components/learning/SentenceGenerator";
import CulturalContext from "@/components/learning/CulturalContext";

export default function LearningPage() {
  const [activeTab, setActiveTab] = useState("practice");

  // Curriculum tracks with FreeCodeCamp-inspired progression
  const curriculumTracks = [
    {
      id: "survival-spanish",
      title: "Survival Spanish",
      description: "Essential phrases and vocabulary for basic communication",
      level: "A1",
      progress: 75, // percentage
      totalLessons: 25,
      completedLessons: 18,
    },
    {
      id: "travel-conversation",
      title: "Travel & Conversation",
      description: "Practical language for travelers and casual interactions",
      level: "A2",
      progress: 45,
      totalLessons: 30,
      completedLessons: 13,
    },
    {
      id: "grammar-fundamentals",
      title: "Grammar Fundamentals",
      description: "Core grammar structures and everyday usage patterns",
      level: "B1",
      progress: 25,
      totalLessons: 35,
      completedLessons: 8,
    },
    {
      id: "intermediate-fluency",
      title: "Intermediate Fluency",
      description: "Express opinions and understand native speakers",
      level: "B2",
      progress: 10,
      totalLessons: 40,
      completedLessons: 4,
    },
    {
      id: "advanced-expression",
      title: "Advanced Expression",
      description: "Complex language for professional contexts",
      level: "C1",
      progress: 5,
      totalLessons: 45,
      completedLessons: 2,
    },
    {
      id: "native-comprehension",
      title: "Native Media Comprehension",
      description: "Understand and use Spanish like a native speaker",
      level: "C2",
      progress: 0,
      totalLessons: 50,
      completedLessons: 0,
    },
    {
      id: "wisdom-sentences",
      title: "Wisdom Sentences",
      description: "Philosophical and cultural expressions",
      level: "C1+",
      progress: 15,
      totalLessons: 20,
      completedLessons: 3,
    },
  ];

  // Learning statistics data
  const learningStats = {
    streakDays: 12,
    wordsLearned: 347,
    sentencesPracticed: 124,
    minutesSpent: 840,
    level: "B1",
    nextMilestone: "B1+",
    progressToNextLevel: 68,
    strengthAreas: ["Travel vocabulary", "Present tense", "Food terms"],
    focusAreas: ["Subjunctive mood", "Past perfect", "Idiomatic expressions"],
  };

  // Quran.com-inspired recent lessons
  const recentLessons = [
    {
      id: "travel-4",
      title: "At the Hotel",
      track: "Travel & Conversation",
      lastAccessedDate: "2 days ago",
      progress: 80,
    },
    {
      id: "grammar-7",
      title: "Using the Subjunctive",
      track: "Grammar Fundamentals",
      lastAccessedDate: "1 week ago",
      progress: 60,
    },
    {
      id: "survival-15",
      title: "Emergency Situations",
      track: "Survival Spanish",
      lastAccessedDate: "3 days ago",
      progress: 100,
    },
  ];

  return (
    <div className="container py-6 max-w-6xl">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Learning Center</h1>
          <p className="text-muted-foreground">
            Practice Spanish through interactive exercises, AI-powered conversations, and structured lessons
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Badge variant="outline" className="py-1.5 px-3">
            <GraduationCap className="h-4 w-4 mr-1.5" />
            Level: {learningStats.level}
          </Badge>
          <Badge variant="outline" className="py-1.5 px-3">
            <Brain className="h-4 w-4 mr-1.5" />
            {learningStats.wordsLearned} Words Learned
          </Badge>
          <Badge variant="outline" className="py-1.5 px-3">
            <Layers className="h-4 w-4 mr-1.5" />
            {learningStats.streakDays} Day Streak
          </Badge>
        </div>
      </div>

      <Tabs defaultValue={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid grid-cols-5 w-full">
          <TabsTrigger value="learn">
            <BookOpen className="h-4 w-4 mr-2" />
            Learn
          </TabsTrigger>
          <TabsTrigger value="practice">
            <Sparkles className="h-4 w-4 mr-2" />
            Practice
          </TabsTrigger>
          <TabsTrigger value="conversation">
            <MessageSquare className="h-4 w-4 mr-2" />
            Conversation
          </TabsTrigger>
          <TabsTrigger value="cultural">
            <Globe className="h-4 w-4 mr-2" />
            Cultural Context
          </TabsTrigger>
          <TabsTrigger value="progress">
            <BarChart className="h-4 w-4 mr-2" />
            Progress
          </TabsTrigger>
        </TabsList>

        {/* Learn tab: Curriculum tracks with Quran.com styled navigation */}
        <TabsContent value="learn" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="md:col-span-2">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <BookMarked className="h-5 w-5 mr-2" />
                    Curriculum Tracks
                  </CardTitle>
                  <CardDescription>
                    Structured learning paths organized by CEFR proficiency levels
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {curriculumTracks.map((track) => (
                    <div
                      key={track.id}
                      className="border rounded-lg p-4 hover:bg-accent/50 transition cursor-pointer"
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="flex items-center">
                            <h3 className="font-medium">{track.title}</h3>
                            <Badge className="ml-2 text-xs">{track.level}</Badge>
                          </div>
                          <p className="text-sm text-muted-foreground mt-1">
                            {track.description}
                          </p>
                        </div>
                        <div className="text-right">
                          <span className="text-sm font-medium">
                            {track.completedLessons}/{track.totalLessons} Lessons
                          </span>
                          <div className="w-32 bg-secondary rounded-full h-2 mt-1.5">
                            <div
                              className="bg-primary rounded-full h-2"
                              style={{ width: `${track.progress}%` }}
                            ></div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </div>

            <div>
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <FileText className="h-5 w-5 mr-2" />
                    Recent Lessons
                  </CardTitle>
                  <CardDescription>
                    Continue where you left off
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {recentLessons.map((lesson) => (
                    <div
                      key={lesson.id}
                      className="border rounded-lg p-3 hover:bg-accent/50 transition cursor-pointer"
                    >
                      <h4 className="font-medium">{lesson.title}</h4>
                      <p className="text-xs text-muted-foreground">
                        {lesson.track}
                      </p>
                      <div className="flex justify-between items-center mt-2">
                        <span className="text-xs text-muted-foreground">
                          Last accessed: {lesson.lastAccessedDate}
                        </span>
                        <div className="flex items-center">
                          {lesson.progress === 100 ? (
                            <Badge className="bg-green-100 text-green-800 hover:bg-green-200">
                              Completed
                            </Badge>
                          ) : (
                            <span className="text-xs font-medium">
                              {lesson.progress}%
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}

                  <Button className="w-full mt-2" variant="outline">
                    View All Lessons
                  </Button>
                </CardContent>
              </Card>

              <Card className="mt-4">
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center">
                    <Languages className="h-5 w-5 mr-2" />
                    Learning Resources
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <Button variant="outline" className="w-full justify-start">
                      <BookOpen className="h-4 w-4 mr-2" />
                      Spanish Grammar Guide
                    </Button>
                    <Button variant="outline" className="w-full justify-start">
                      <FileText className="h-4 w-4 mr-2" />
                      Pronunciation Tips
                    </Button>
                    <Button variant="outline" className="w-full justify-start">
                      <Layers className="h-4 w-4 mr-2" />
                      Vocabulary Lists
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>

        {/* Practice tab with sentence generator */}
        <TabsContent value="practice">
          <SentenceGenerator />
        </TabsContent>

        {/* Conversation tab with AI conversation buddy */}
        <TabsContent value="conversation">
          <ConversationBuddy />
        </TabsContent>
        
        {/* Cultural Context tab with idioms and culture */}
        <TabsContent value="cultural">
          <CulturalContext />
        </TabsContent>

        {/* Progress tab with learning analytics */}
        <TabsContent value="progress" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="md:col-span-2">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <BarChart className="h-5 w-5 mr-2" />
                    Learning Analytics
                  </CardTitle>
                  <CardDescription>
                    Track your progress and identify areas for improvement
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="border rounded-lg p-4 text-center">
                      <p className="text-3xl font-bold">{learningStats.streakDays}</p>
                      <p className="text-sm text-muted-foreground">Day Streak</p>
                    </div>
                    <div className="border rounded-lg p-4 text-center">
                      <p className="text-3xl font-bold">{learningStats.wordsLearned}</p>
                      <p className="text-sm text-muted-foreground">Words Learned</p>
                    </div>
                    <div className="border rounded-lg p-4 text-center">
                      <p className="text-3xl font-bold">{learningStats.sentencesPracticed}</p>
                      <p className="text-sm text-muted-foreground">Sentences Practiced</p>
                    </div>
                    <div className="border rounded-lg p-4 text-center">
                      <p className="text-3xl font-bold">{Math.round(learningStats.minutesSpent / 60)}</p>
                      <p className="text-sm text-muted-foreground">Hours Spent</p>
                    </div>
                  </div>

                  <div className="mt-6">
                    <h3 className="text-sm font-medium mb-2">Progress to Next Level</h3>
                    <div className="flex items-center">
                      <span className="text-sm font-medium mr-2">{learningStats.level}</span>
                      <div className="flex-1">
                        <div className="w-full bg-secondary rounded-full h-2.5">
                          <div
                            className="bg-primary rounded-full h-2.5"
                            style={{ width: `${learningStats.progressToNextLevel}%` }}
                          ></div>
                        </div>
                      </div>
                      <span className="text-sm font-medium ml-2">{learningStats.nextMilestone}</span>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
                    <div>
                      <h3 className="text-sm font-medium mb-2">Strength Areas</h3>
                      <div className="flex flex-wrap gap-2">
                        {learningStats.strengthAreas.map((area, index) => (
                          <Badge key={index} variant="secondary" className="text-xs">
                            {area}
                          </Badge>
                        ))}
                      </div>
                    </div>
                    <div>
                      <h3 className="text-sm font-medium mb-2">Focus Areas</h3>
                      <div className="flex flex-wrap gap-2">
                        {learningStats.focusAreas.map((area, index) => (
                          <Badge key={index} variant="outline" className="text-xs">
                            {area}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            <div>
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <BookMarked className="h-5 w-5 mr-2" />
                    Learning Recommendations
                  </CardTitle>
                  <CardDescription>
                    AI-powered recommendations based on your learning patterns
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="border rounded-lg p-3 bg-accent/30">
                    <h4 className="font-medium flex items-center">
                      <Brain className="h-4 w-4 mr-1.5" />
                      Practice Subjunctive Mood
                    </h4>
                    <p className="text-xs text-muted-foreground mt-1">
                      You seem to struggle with subjunctive conjugations based on your exercise history.
                    </p>
                    <Button size="sm" className="mt-2 w-full">
                      Start Practice
                    </Button>
                  </div>

                  <div className="border rounded-lg p-3">
                    <h4 className="font-medium flex items-center">
                      <MessageSquare className="h-4 w-4 mr-1.5" />
                      Conversation Practice
                    </h4>
                    <p className="text-xs text-muted-foreground mt-1">
                      Try a conversation session focused on past tense verbs to build fluency.
                    </p>
                    <Button size="sm" variant="outline" className="mt-2 w-full">
                      Start Conversation
                    </Button>
                  </div>

                  <div className="border rounded-lg p-3">
                    <h4 className="font-medium flex items-center">
                      <Sparkles className="h-4 w-4 mr-1.5" />
                      New Vocabulary Set
                    </h4>
                    <p className="text-xs text-muted-foreground mt-1">
                      Expand your business vocabulary with these 15 new terms.
                    </p>
                    <Button size="sm" variant="outline" className="mt-2 w-full">
                      Study Vocabulary
                    </Button>
                  </div>
                </CardContent>
              </Card>

              <Card className="mt-4">
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <GraduationCap className="h-5 w-5 mr-2" />
                    Proficiency Assessment
                  </CardTitle>
                  <CardDescription>
                    Test your current Spanish level
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-sm mb-3">
                    Take a comprehensive assessment to get an accurate measure of your current CEFR level.
                  </p>
                  <Button className="w-full">
                    Start Assessment
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
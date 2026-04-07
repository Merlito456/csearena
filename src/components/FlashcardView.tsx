import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "./ui/card";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { Layers, Flame, Brain, BookOpen, Calculator, Scale, Zap, ArrowRight, Star } from "lucide-react";
import { motion } from "motion/react";

interface FlashcardViewProps {
  onBack: () => void;
  onStartDeck: (deckId: string, title: string) => void;
  userId: string | null;
  isPremium: boolean;
}

export function FlashcardView({ onBack, onStartDeck, userId, isPremium }: FlashcardViewProps) {
  const decks = [
    {
      id: "daily",
      title: "Daily Flashcards",
      description: "10 cards • 3 min",
      icon: Flame,
      color: "text-orange-500",
      bgColor: "bg-orange-100",
      count: 10,
      mastery: 0,
      isSpecial: true
    },
    {
      id: "ai-smart",
      title: "AI Smart Deck",
      description: "Based on your mistakes",
      icon: Brain,
      color: "text-purple-500",
      bgColor: "bg-purple-100",
      count: 15,
      mastery: 0,
      badge: "PRO",
      isSpecial: true,
      isPremium: true
    },
    {
      id: "verbal",
      title: "Verbal Vocabulary",
      description: "Synonyms, antonyms & idioms",
      icon: BookOpen,
      color: "text-green-500",
      bgColor: "bg-green-100",
      count: 120,
      mastery: 45
    },
    {
      id: "constitution",
      title: "Philippine Constitution",
      description: "Articles, Bill of Rights & Laws",
      icon: Scale,
      color: "text-blue-500",
      bgColor: "bg-blue-100",
      count: 80,
      mastery: 20
    },
    {
      id: "math",
      title: "Math Formulas",
      description: "Geometry, Algebra & Statistics",
      icon: Calculator,
      color: "text-red-500",
      bgColor: "bg-red-100",
      count: 45,
      mastery: 10
    },
    {
      id: "logic",
      title: "Logical Patterns",
      description: "Series, Analogies & Logic",
      icon: Zap,
      color: "text-yellow-500",
      bgColor: "bg-yellow-100",
      count: 60,
      mastery: 5
    }
  ];

  const handleDeckClick = (deck: any) => {
    if (deck.isPremium && !isPremium) {
      alert("AI Smart Deck is a Premium Feature. Please upgrade to unlock.");
      return;
    }
    onStartDeck(deck.id, deck.title);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold flex items-center gap-2">
          <Layers className="w-6 h-6 text-primary" />
          Flashcards
        </h2>
        <div className="flex items-center gap-2 bg-muted/50 px-3 py-1 rounded-full text-sm font-medium">
          <Flame className="w-4 h-4 text-orange-500" />
          <span>3 Day Streak</span>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        {decks.map((deck, index) => (
          <motion.div
            key={deck.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <Card className="hover:border-primary/50 transition-all cursor-pointer group h-full flex flex-col" onClick={() => handleDeckClick(deck)}>
              <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-2">
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-lg ${deck.bgColor} ${deck.isPremium && !isPremium ? 'grayscale opacity-50' : ''}`}>
                    <deck.icon className={`w-6 h-6 ${deck.color}`} />
                  </div>
                  <div>
                    <CardTitle className="text-base font-bold flex items-center gap-2">
                      {deck.title}
                      {deck.badge && <Badge variant={deck.isPremium && !isPremium ? "outline" : "secondary"} className="text-[10px] h-5">{deck.badge}</Badge>}
                    </CardTitle>
                    <CardDescription className="text-xs">{deck.description}</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className={`pb-2 flex-1 ${deck.isPremium && !isPremium ? 'opacity-50' : ''}`}>
                <div className="flex items-center gap-4 text-sm text-muted-foreground mt-2">
                  <div className="flex items-center gap-1">
                    <Layers className="w-3 h-3" />
                    {deck.count} cards
                  </div>
                  {!deck.isSpecial && (
                    <div className="flex items-center gap-1 ml-auto">
                      <div className="w-16 h-1.5 bg-muted rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-green-500 rounded-full" 
                          style={{ width: `${deck.mastery}%` }}
                        />
                      </div>
                      <span className="text-xs">{deck.mastery}%</span>
                    </div>
                  )}
                </div>
              </CardContent>
              <CardFooter className="pt-2">
                <Button className="w-full group-hover:bg-primary/90" size="sm" variant={deck.isPremium && !isPremium ? "outline" : (deck.isSpecial ? "default" : "outline")}>
                  {deck.isPremium && !isPremium ? "Unlock Pro" : "Study Now"} 
                  {!(deck.isPremium && !isPremium) && <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />}
                </Button>
              </CardFooter>
            </Card>
          </motion.div>
        ))}
      </div>
    </div>
  );
}

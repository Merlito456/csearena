import { useState } from "react";
import { Card, CardContent } from "./ui/card";
import { Button } from "./ui/button";
import { ArrowLeft, RotateCw, Check, X, HelpCircle, ThumbsUp, ThumbsDown, Star } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { Progress } from "./ui/progress";

interface Flashcard {
  id: string;
  front: string;
  back: string;
  category?: string;
}

interface FlashcardInterfaceProps {
  deckTitle: string;
  cards: Flashcard[];
  onExit: () => void;
}

export function FlashcardInterface({ deckTitle, cards, onExit }: FlashcardInterfaceProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [finished, setFinished] = useState(false);
  const [masteredCount, setMasteredCount] = useState(0);

  const currentCard = cards[currentIndex];
  const progress = cards.length > 0 ? ((currentIndex) / cards.length) * 100 : 0;

  const handleFlip = () => {
    setIsFlipped(!isFlipped);
  };

  const handleNext = (confidence: 'again' | 'hard' | 'good' | 'easy') => {
    if (confidence === 'good' || confidence === 'easy') {
      setMasteredCount(prev => prev + 1);
    }

    if (currentIndex < cards.length - 1) {
      setIsFlipped(false);
      setTimeout(() => setCurrentIndex(prev => prev + 1), 200);
    } else {
      setFinished(true);
    }
  };

  if (finished) {
    return (
      <div className="max-w-md mx-auto text-center space-y-6 pt-10">
        <motion.div 
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="bg-green-100 p-6 rounded-full w-24 h-24 mx-auto flex items-center justify-center"
        >
          <Star className="w-12 h-12 text-green-600 fill-current" />
        </motion.div>
        
        <div className="space-y-2">
          <h2 className="text-2xl font-bold">Session Complete!</h2>
          <p className="text-muted-foreground">You reviewed {cards.length} cards.</p>
        </div>

        <div className="bg-card border rounded-xl p-6 space-y-2">
          <div className="text-sm text-muted-foreground uppercase tracking-wider font-semibold">Mastery</div>
          <div className="text-4xl font-bold text-primary">{cards.length > 0 ? Math.round((masteredCount / cards.length) * 100) : 0}%</div>
          <p className="text-xs text-muted-foreground">Cards marked Good or Easy</p>
        </div>

        <div className="flex gap-4 justify-center">
          <Button variant="outline" onClick={onExit}>Back to Decks</Button>
          <Button onClick={() => {
            setCurrentIndex(0);
            setFinished(false);
            setMasteredCount(0);
            setIsFlipped(false);
          }}>Study Again</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-xl mx-auto space-y-6 h-[calc(100vh-100px)] flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between">
        <Button variant="ghost" size="sm" onClick={onExit}>
          <ArrowLeft className="w-4 h-4 mr-2" /> Exit
        </Button>
        <div className="text-sm font-medium">{currentIndex + 1} / {cards.length}</div>
      </div>

      <Progress value={progress} className="h-2" />

      {/* Card Area */}
      <div className="flex-1 flex flex-col justify-center perspective-1000">
        <div 
          className="relative w-full aspect-[4/3] cursor-pointer group"
          onClick={handleFlip}
          style={{ perspective: "1000px" }}
        >
          <motion.div
            className="w-full h-full relative preserve-3d transition-all duration-500"
            animate={{ rotateY: isFlipped ? 180 : 0 }}
            transition={{ type: "spring", stiffness: 260, damping: 20 }}
            style={{ transformStyle: "preserve-3d" }}
          >
            {/* Front */}
            <Card className="absolute inset-0 backface-hidden flex flex-col items-center justify-center p-8 text-center border-2 hover:border-primary/50 transition-colors shadow-lg">
              <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-4">Question</div>
              <div className="text-2xl font-bold leading-relaxed">{currentCard.front}</div>
              <div className="absolute bottom-4 text-xs text-muted-foreground flex items-center gap-1 opacity-50 group-hover:opacity-100 transition-opacity">
                <RotateCw className="w-3 h-3" /> Tap to flip
              </div>
            </Card>

            {/* Back */}
            <Card 
              className="absolute inset-0 backface-hidden flex flex-col items-center justify-center p-8 text-center border-2 border-primary/20 bg-primary/5 shadow-lg"
              style={{ transform: "rotateY(180deg)" }}
            >
              <div className="text-xs font-semibold text-primary uppercase tracking-wider mb-4">Answer</div>
              <div className="text-xl font-medium leading-relaxed">{currentCard.back}</div>
            </Card>
          </motion.div>
        </div>
      </div>

      {/* Controls */}
      <div className="h-24">
        {!isFlipped ? (
          <Button className="w-full h-14 text-lg" onClick={handleFlip}>
            Show Answer
          </Button>
        ) : (
          <div className="grid grid-cols-4 gap-2">
            <div className="flex flex-col gap-1">
              <Button 
                variant="outline" 
                className="h-14 border-red-200 hover:bg-red-50 hover:text-red-600 hover:border-red-300"
                onClick={() => handleNext('again')}
              >
                <X className="w-5 h-5" />
              </Button>
              <span className="text-[10px] text-center font-medium text-red-500 uppercase">Again</span>
            </div>

            <div className="flex flex-col gap-1">
              <Button 
                variant="outline" 
                className="h-14 border-orange-200 hover:bg-orange-50 hover:text-orange-600 hover:border-orange-300"
                onClick={() => handleNext('hard')}
              >
                <HelpCircle className="w-5 h-5" />
              </Button>
              <span className="text-[10px] text-center font-medium text-orange-500 uppercase">Hard</span>
            </div>

            <div className="flex flex-col gap-1">
              <Button 
                variant="outline" 
                className="h-14 border-blue-200 hover:bg-blue-50 hover:text-blue-600 hover:border-blue-300"
                onClick={() => handleNext('good')}
              >
                <ThumbsUp className="w-5 h-5" />
              </Button>
              <span className="text-[10px] text-center font-medium text-blue-500 uppercase">Good</span>
            </div>

            <div className="flex flex-col gap-1">
              <Button 
                variant="outline" 
                className="h-14 border-green-200 hover:bg-green-50 hover:text-green-600 hover:border-green-300"
                onClick={() => handleNext('easy')}
              >
                <Star className="w-5 h-5" />
              </Button>
              <span className="text-[10px] text-center font-medium text-green-500 uppercase">Easy</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

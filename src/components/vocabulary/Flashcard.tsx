"use client";
import { useState } from 'react';
import type { VocabularyItem } from '@/lib/data';
import { Button } from '@/components/ui/button';
import { Volume2, RotateCcw } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';

interface FlashcardProps {
  item: VocabularyItem;
}

export default function Flashcard({ item }: FlashcardProps) {
  const [isFlipped, setIsFlipped] = useState(false);

  const handleFlip = () => {
    setIsFlipped(!isFlipped);
  };

  const playAudio = () => {
    // Mock audio playback
    alert(`Playing audio for: ${item.english}`);
    if (item.pronunciationAudio) {
      // const audio = new Audio(item.pronunciationAudio);
      // audio.play();
    }
  };

  return (
    <Card 
      className={`w-full max-w-md h-80 mx-auto perspective cursor-pointer pixel-border shadow-lg transition-all duration-700 transform-style-preserve-3d ${isFlipped ? 'rotate-y-180' : ''}`}
      onClick={handleFlip}
    >
      {/* Front of the card */}
      <div className={`absolute w-full h-full backface-hidden bg-card flex flex-col items-center justify-center p-6 ${isFlipped ? 'hidden' : ''}`}>
        <h2 className="font-headline text-4xl text-accent mb-4 text-center">{item.english}</h2>
        <Button variant="ghost" size="icon" onClick={(e) => { e.stopPropagation(); playAudio(); }} className="absolute top-4 right-4 text-accent hover:bg-accent/20">
          <Volume2 size={24} />
        </Button>
        <p className="text-sm text-muted-foreground mt-auto">Click to see translation</p>
      </div>

      {/* Back of the card */}
      <div className={`absolute w-full h-full backface-hidden bg-secondary text-secondary-foreground flex flex-col items-center justify-center p-6 rotate-y-180 ${!isFlipped ? 'hidden' : ''}`}>
        <h3 className="font-headline text-3xl text-accent mb-3 text-center">{item.chinese}</h3>
        <div className="text-center space-y-2 text-sm overflow-auto max-h-48">
            <p><span className="font-semibold">EN:</span> {item.exampleSentenceEn}</p>
            <p><span className="font-semibold">ZH:</span> {item.exampleSentenceZh}</p>
        </div>
        <Button variant="ghost" size="icon" onClick={(e) => { e.stopPropagation(); playAudio(); }} className="absolute top-4 right-4 text-accent hover:bg-accent/20">
          <Volume2 size={24} />
        </Button>
        <p className="text-sm text-muted-foreground/70 mt-auto">Click to see English</p>
      </div>
    </Card>
  );
}

// Add these styles to globals.css or a style tag in layout for 3D flip effect
/*
.perspective { perspective: 1000px; }
.transform-style-preserve-3d { transform-style: preserve-3d; }
.backface-hidden { backface-visibility: hidden; -webkit-backface-visibility: hidden; }
.rotate-y-180 { transform: rotateY(180deg); }
*/
// These are Tailwind classes for preserve-3d and backface-visibility (check your Tailwind config version).
// If not available, define them.
// For simplicity, I'll add a quick style block to globals.css or rely on existing utilities if possible.
// The current setup should mostly work with Tailwind's transform utilities.
// Adding explicit preserve-3d and backface-hidden if needed:
// in globals.css:
// @layer utilities {
//   .perspective { perspective: 1000px; }
//   .transform-style-3d { transform-style: preserve-3d; }
//   .backface-hidden { backface-visibility: hidden; }
// }
// In component: className="perspective" on parent, then "transform-style-3d backface-hidden" on card faces.
// I'll try to use what Tailwind offers first. For the Card: transform-gpu is often useful.
// The current classNames are:
// Card: `perspective` (custom), `transition-all duration-700 transform-style-preserve-3d` (custom or to be defined), `${isFlipped ? 'rotate-y-180' : ''}` (Tailwind)
// Front/Back: `absolute w-full h-full backface-hidden` (custom or to be defined)

// Better approach: create these utility classes in globals.css:
// @layer utilities {
//   .perspective {
//     perspective: 1000px;
//   }
//   .transform-style-3d {
//     transform-style: preserve-3d;
//   }
//   .backface-visibility-hidden {
//     backface-visibility: hidden;
//   }
// }
// Then use:
// Card: className="perspective relative ..." // remove absolute from children
// Card Faces Wrapper: className="relative w-full h-full transform-style-3d transition-transform duration-700 ${isFlipped ? 'rotate-y-180' : ''}"
// Front/Back: className="absolute w-full h-full backface-visibility-hidden ..."

// Re-evaluating the simple flip:
// Just toggling visibility and using rotate-y-180 on the main card.
// The current structure with absolute positioning for front/back and rotating the parent card is a common pattern.
// The custom CSS classes `perspective`, `transform-style-preserve-3d`, `backface-hidden` are key.
// I'll add these to globals.css.
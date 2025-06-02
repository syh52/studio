import { Award } from 'lucide-react';

interface IndexDisplayProps {
  points: number;
}

export default function IndexDisplay({ points }: IndexDisplayProps) {
  return (
    <div className="flex items-center gap-1 md:gap-2 bg-primary-foreground/10 text-primary-foreground p-1 md:p-2 rounded-sm pixel-border border-accent">
      <Award size={18} className="text-accent" />
      <span className="font-headline text-sm md:text-base text-accent">{points}</span>
      <span className="text-xs hidden md:inline">指数</span>
    </div>
  );
}

"use client";
import { useAuth } from "@/contexts/AuthContext";
import Link from 'next/link';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { CalendarCheck, BookOpen, Plane, CheckSquare, LogIn } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useRouter } from "next/navigation";
import Image from "next/image";

interface FeatureCardProps {
  title: string;
  description: string;
  link: string;
  icon: React.ReactNode;
  disabled?: boolean;
}

const FeatureCard = ({ title, description, link, icon, disabled }: FeatureCardProps) => (
  <Link href={disabled ? "#" : link} passHref>
    <Card className={`pixel-border hover:shadow-hard-accent transition-shadow cursor-pointer h-full flex flex-col ${disabled ? "opacity-50 cursor-not-allowed" : ""}`}>
      <CardHeader className="flex flex-row items-center gap-4 pb-2">
        <div className="text-accent">{icon}</div>
        <CardTitle className="font-headline text-xl">{title}</CardTitle>
      </CardHeader>
      <CardContent className="flex-grow">
        <CardDescription>{description}</CardDescription>
      </CardContent>
    </Card>
  </Link>
);

export default function HomePage() {
  const { user, isAuthenticated, dailyCheckIn, isLoading } = useAuth();
  const { toast } = useToast();
  const router = useRouter();

  const handleDailyCheckIn = () => {
    if (!isAuthenticated) {
      toast({ title: "Not Logged In", description: "Please log in to check in.", variant: "destructive" });
      return;
    }
    const success = dailyCheckIn();
    if (success) {
      toast({ title: "Checked In!", description: `You've earned 10 Index points! Current Index: ${user?.indexPoints}.`, className:"bg-green-600 text-white pixel-border" });
    } else {
      toast({ title: "Already Checked In", description: "You've already checked in today. Come back tomorrow!", variant: "default" });
    }
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center text-center py-10">
         <div className="w-16 h-16 border-4 border-accent border-t-transparent rounded-full animate-spin mb-4"></div>
        <p className="font-headline text-xl">Loading Trainer...</p>
      </div>
    );
  }
  
  return (
    <div className="space-y-8 py-6">
      <section className="text-center space-y-4">
        <Image src="https://placehold.co/300x150.png?text=Aviation+Trainer" alt="Aviation Banner" width={300} height={150} data-ai-hint="aviation pixelart" className="mx-auto pixel-border shadow-lg"/>
        <h1 className="text-4xl font-headline text-accent">Welcome to the Aviation Lexicon Trainer!</h1>
        {isAuthenticated && user ? (
          <p className="text-lg">Hello, <span className="font-bold text-accent">{user.username}</span>! Ready to expand your aviation vocabulary?</p>
        ) : (
          <p className="text-lg">Your journey to mastering aviation English starts here. Log in to begin!</p>
        )}
      </section>

      {isAuthenticated && (
        <section className="text-center">
          <Button onClick={handleDailyCheckIn} className="btn-pixel bg-primary text-primary-foreground hover:bg-primary/80 text-lg px-6 py-3">
            <CalendarCheck size={24} className="mr-2" /> Daily Check-in
          </Button>
        </section>
      )}
       {!isAuthenticated && (
        <section className="text-center">
          <Button onClick={() => router.push('/login')} className="btn-pixel bg-accent text-accent-foreground hover:bg-accent/90 text-lg px-6 py-3">
            <LogIn size={24} className="mr-2" /> Login to Get Started
          </Button>
        </section>
      )}

      <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <FeatureCard 
          title="Vocabulary" 
          description="Study essential English vocabulary with Chinese translations, audio, and examples using flashcards." 
          link="/vocabulary"
          icon={<BookOpen size={32} />}
          disabled={!isAuthenticated}
        />
        <FeatureCard 
          title="Scenario Dialogues" 
          description="Practice basic scenario dialogues for aviation safety officers with read and listen modes." 
          link="/dialogues"
          icon={<Plane size={32} />}
          disabled={!isAuthenticated}
        />
        <FeatureCard 
          title="Quizzes" 
          description="Test your understanding with vocabulary and dialogue quizzes. Earn points for correct answers." 
          link="/quizzes"
          icon={<CheckSquare size={32} />}
          disabled={!isAuthenticated}
        />
      </section>
    </div>
  );
}

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
      toast({ title: "尚未登录", description: "请登录后进行签到。", variant: "destructive" });
      return;
    }
    const success = dailyCheckIn();
    if (success) {
      toast({ title: "签到成功！", description: `您已获得10点"指数"！当前指数：${user?.indexPoints}。`, className:"bg-green-600 text-white pixel-border" });
    } else {
      toast({ title: "今日已签到", description: "您今天已经签到过了。明天再来吧！", variant: "default" });
    }
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center text-center py-10">
         <div className="w-16 h-16 border-4 border-accent border-t-transparent rounded-full animate-spin mb-4"></div>
        <p className="font-headline text-xl">Lexicon 加载中...</p>
      </div>
    );
  }
  
  return (
    <div className="space-y-8 py-6">
      <section className="text-center space-y-4">
        <Image src="https://placehold.co/300x150.png?text=Lexicon" alt="Lexicon 横幅" width={300} height={150} data-ai-hint="cute creature" className="mx-auto pixel-border shadow-lg"/>
      </section>

      {isAuthenticated && (
        <section className="text-center">
          <Button onClick={handleDailyCheckIn} className="btn-pixel bg-primary text-primary-foreground hover:bg-primary/80 text-lg px-6 py-3">
            <CalendarCheck size={24} className="mr-2" /> 每日签到
          </Button>
        </section>
      )}
       {!isAuthenticated && (
        <section className="text-center">
          <Button onClick={() => router.push('/login')} className="btn-pixel bg-accent text-accent-foreground hover:bg-accent/90 text-lg px-6 py-3">
            <LogIn size={24} className="mr-2" /> 登录以开始
          </Button>
        </section>
      )}

      <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <FeatureCard 
          title="词汇学习" 
          description="通过抽认卡学习带有中文翻译、音频和例句的基础英语词汇。" 
          link="/vocabulary"
          icon={<BookOpen size={32} />}
          disabled={!isAuthenticated}
        />
        <FeatureCard 
          title="情景对话" 
          description="练习航空安全员的基础情景对话，支持阅读和收听模式。" 
          link="/dialogues"
          icon={<Plane size={32} />}
          disabled={!isAuthenticated}
        />
        <FeatureCard 
          title="测验" 
          description="通过词汇和对话测验来检验您的理解程度。答对即可获得积分。" 
          link="/quizzes"
          icon={<CheckSquare size={32} />}
          disabled={!isAuthenticated}
        />
      </section>
    </div>
  );
}

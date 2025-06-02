
"use client";
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { LogIn, LogOut, UserPlus, UserCircle, Award, Plane, BookOpen, CheckSquare, Settings } from 'lucide-react';
import IndexDisplay from '@/components/shared/IndexDisplay';
import { useRouter, usePathname } from 'next/navigation';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useState, useEffect } from 'react'; // Added useState and useEffect

export default function Header() {
  const { isAuthenticated, user, logout, isLoading: authIsLoading } = useAuth(); // Renamed isLoading to authIsLoading
  const router = useRouter();
  const pathname = usePathname();

  const [isMounted, setIsMounted] = useState(false);
  useEffect(() => {
    setIsMounted(true);
  }, []);

  const navLinks = [
    { href: "/vocabulary", label: "词汇", icon: <BookOpen size={18} /> },
    { href: "/dialogues", label: "对话", icon: <Plane size={18} /> },
    { href: "/quizzes", label: "测验", icon: <CheckSquare size={18} /> },
  ];

  // If not mounted yet, or if auth is still loading, show a consistent placeholder.
  // This placeholder will be rendered by the server, and initially by the client, matching perfectly.
  if (!isMounted || authIsLoading) {
    return (
      <header className="bg-primary text-primary-foreground p-3 flex justify-between items-center pixel-border border-b-4 border-accent">
        <div className="text-lg md:text-xl font-headline">航空词汇教练</div> {/* Consistent title placeholder */}
        <div className="h-8 w-24 bg-primary-foreground/20 animate-pulse rounded-sm"></div> {/* Placeholder for auth-dependent parts */}
      </header>
    );
  }

  // If mounted and auth is resolved, show the full header.
  // This part is effectively client-side rendered after mount and auth resolution.
  return (
    <header className="bg-primary text-primary-foreground p-3 flex flex-col sm:flex-row justify-between items-center gap-2 pixel-border border-b-4 border-accent sticky top-0 z-50">
      <Link href="/" className="text-lg md:text-xl font-headline hover:text-accent transition-colors">
        航空词汇教练
      </Link>
      
      <nav className="flex items-center gap-2 md:gap-3">
        {isAuthenticated && navLinks.map(link => (
          <Link key={link.href} href={link.href} legacyBehavior>
            <a className={`flex items-center gap-1 text-xs md:text-sm p-1 md:p-2 hover:bg-accent hover:text-accent-foreground transition-colors rounded-sm ${pathname === link.href ? 'bg-accent text-accent-foreground' : ''}`}>
              {link.icon}
              <span className="hidden md:inline">{link.label}</span>
            </a>
          </Link>
        ))}
      </nav>

      <div className="flex items-center gap-2 md:gap-4">
        {isAuthenticated && user && (
          <>
            <IndexDisplay points={user.indexPoints} />
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-8 w-8 rounded-full p-0 hover:bg-primary-foreground/20">
                  <Avatar className="h-8 w-8 border-2 border-accent">
                    <AvatarFallback className="bg-secondary text-secondary-foreground font-headline">
                      {user.username ? user.username.charAt(0).toUpperCase() : "U"}
                    </AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56 font-body pixel-border shadow-md" align="end" forceMount>
                <DropdownMenuLabel className="font-medium">
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm leading-none">{user.username}</p>
                    <p className="text-xs leading-none text-muted-foreground/80">{user.email}</p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => router.push('/profile')} className="cursor-pointer">
                  <UserCircle className="mr-2 h-4 w-4" />
                  <span>个人资料</span>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => router.push('/settings')} className="cursor-pointer">
                  <Settings className="mr-2 h-4 w-4" />
                  <span>设置</span>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={logout} className="cursor-pointer text-red-400 hover:!text-red-400 focus:!bg-red-500/20 focus:!text-red-400">
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>退出登录</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </>
        )}
        {!isAuthenticated && (
          <div className="flex gap-2">
            <Button onClick={() => router.push('/login')} variant="secondary" size="sm" className="btn-pixel text-xs">
              <LogIn size={16} className="mr-1 md:mr-2" /> 登录
            </Button>
            <Button onClick={() => router.push('/register')} variant="default" size="sm" className="btn-pixel bg-accent text-accent-foreground hover:bg-accent/90 text-xs">
              <UserPlus size={16} className="mr-1 md:mr-2" /> 注册
            </Button>
          </div>
        )}
      </div>
    </header>
  );
}

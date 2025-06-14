
'use client';

import Link from 'next/link';
import Image from 'next/image';
import { Input } from "@/components/ui/input";
import { Search } from 'lucide-react';

interface HeaderProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
}

const Header: React.FC<HeaderProps> = ({ searchQuery, onSearchChange }) => {
  const logoUrl = "https://i.postimg.cc/3wDfQ1xM/vdslogo.png";
  const logoWidth = 105; 
  const logoHeight = 40;

  return (
    <header className="bg-background/80 backdrop-blur-sm sticky top-0 z-50 shadow-md">
      <div className="container mx-auto px-4 py-3 sm:py-4 flex items-center justify-between gap-4">
        <Link href="/" className="flex items-center gap-2 text-xl sm:text-2xl font-headline font-bold text-primary hover:text-primary/90 transition-colors shrink-0">
          <Image
            src={logoUrl}
            alt="Vaidic Dharma Sansthan Logo"
            width={logoWidth}
            height={logoHeight}
            className="h-10 w-auto" 
            priority 
          />
          <span className="hidden sm:inline">Vaidic Dharma Sansthan</span>
        </Link>
        
        <div className="relative w-full max-w-lg ml-auto"> {/* Adjusted for better layout with flex parent */}
          <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground pointer-events-none" />
          <Input
            type="search"
            placeholder="Search pujas by name, activity, venue..."
            className="w-full pl-10 pr-4 py-2 h-10 rounded-lg border bg-card shadow-sm focus:ring-primary focus:border-primary"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            aria-label="Search pujas"
          />
        </div>
      </div>
    </header>
  );
};

export default Header;

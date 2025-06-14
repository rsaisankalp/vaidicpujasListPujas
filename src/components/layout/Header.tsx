
'use client';

import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, HandHeart, CalendarDays } from 'lucide-react';

interface HeaderProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
}

const Header: React.FC<HeaderProps> = ({ searchQuery, onSearchChange }) => {
  const logoUrl = "https://i.postimg.cc/3wDfQ1xM/vdslogo.png";
  const logoWidth = 105; 
  const logoHeight = 40;
  const pathname = usePathname();

  const isOnDonationsPage = pathname === '/donations';

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
        
        <div className="flex items-center gap-3 sm:gap-4">
          <div className="relative w-full max-w-xs sm:max-w-sm md:max-w-md">
            <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground pointer-events-none" />
            <Input
              type="search"
              placeholder="Search events or donations..."
              className="w-full pl-10 pr-4 py-2 h-10 rounded-lg border bg-card shadow-sm focus:ring-primary focus:border-primary"
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              aria-label="Search"
            />
          </div>
          <Button 
            asChild 
            variant="outline" 
            className="border-primary text-primary hover:bg-primary/10 hover:text-primary shrink-0 px-3 sm:px-4 py-2 h-10"
          >
            {isOnDonationsPage ? (
              <Link href="/">
                <CalendarDays className="w-4 h-4 mr-0 sm:mr-2" />
                <span className="hidden sm:inline">Events</span>
              </Link>
            ) : (
              <Link href="/donations">
                <HandHeart className="w-4 h-4 mr-0 sm:mr-2" />
                <span className="hidden sm:inline">Donate</span>
              </Link>
            )}
          </Button>
        </div>
      </div>
    </header>
  );
};

export default Header;

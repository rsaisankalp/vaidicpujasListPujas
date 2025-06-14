
import Link from 'next/link';
import Image from 'next/image';
import { Input } from "@/components/ui/input";

const Header = () => {
  const logoUrl = "https://i.postimg.cc/3wDfQ1xM/vdslogo.png";
  // Assuming the new logo's intrinsic aspect ratio is similar or can be constrained.
  // Let's aim for a height of 32px or 40px (h-8 or h-10 in Tailwind)
  // For vdslogo.png (300x114), if height is 32px, width = 32 * (300/114) = 84.2
  // if height is 40px, width = 40 * (300/114) = 105.26
  const logoWidth = 105; 
  const logoHeight = 40;

  return (
    <header className="bg-background/80 backdrop-blur-sm sticky top-0 z-50 shadow-md">
      <div className="container mx-auto px-4 py-3 sm:py-4 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/" className="flex items-center gap-2 text-xl sm:text-2xl font-headline font-bold text-primary hover:text-primary/90 transition-colors">
            <Image
              src={logoUrl}
              alt="Vaidic Dharma Sansthan Logo"
              width={logoWidth}
              height={logoHeight}
              className="h-10 w-auto" // Maintain height, auto width for responsiveness
              priority // Prioritize loading the logo
            />
            <span className="hidden sm:inline">Vaidic Dharma Sansthan</span>
          </Link>
          <nav>
            {/* Future navigation links can go here */}
            <Input type="text" placeholder="Search pujas..." className="w-full max-w-sm" />
            {/* <Link href="/about" className="text-foreground hover:text-primary transition-colors">About</Link> */}
          </nav>
        </div>
      </div>
    </header>
  );
};

export default Header;

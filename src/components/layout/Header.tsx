
import Link from 'next/link';
import Image from 'next/image';

const Header = () => {
  const logoUrl = "https://i0.wp.com/vaidicpujas.org/wp-content/uploads/2020/06/cropped-VDS-AOL-Logo-white-1-1.png?fit=200%2C76&ssl=1";
  const logoWidth = 84; // Calculated for a height of 32px based on original 200x76
  const logoHeight = 32;

  return (
    <header className="bg-background/80 backdrop-blur-sm sticky top-0 z-50 shadow-md">
      <div className="container mx-auto px-4 py-4 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2 text-2xl font-headline font-bold text-primary hover:text-primary/90 transition-colors">
          <Image 
            src={logoUrl} 
            alt="Vaidic Dharma Sansthan Logo" 
            width={logoWidth} 
            height={logoHeight}
            className="h-8 w-auto" // Maintain height, auto width
          />
          <span>Vaidic Dharma Sansthan</span>
        </Link>
        <nav>
          {/* Future navigation links can go here */}
          {/* <Link href="/about" className="text-foreground hover:text-primary transition-colors">About</Link> */}
        </nav>
      </div>
    </header>
  );
};

export default Header;

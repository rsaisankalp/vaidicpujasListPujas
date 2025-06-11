import Link from 'next/link';
import { Flower2 } from 'lucide-react'; // Changed Lotus to Flower2

const Header = () => {
  return (
    <header className="bg-background/80 backdrop-blur-sm sticky top-0 z-50 shadow-md">
      <div className="container mx-auto px-4 py-4 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2 text-2xl font-headline font-bold text-primary hover:text-primary/90 transition-colors">
          <Flower2 className="w-8 h-8" /> {/* Changed Lotus to Flower2 */}
          <span>PujaPlace</span>
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

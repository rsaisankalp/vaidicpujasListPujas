const Footer = () => {
  return (
    <footer className="bg-muted/50 py-6 text-center mt-auto">
      <div className="container mx-auto px-4">
        <p className="text-sm text-muted-foreground">
          &copy; {new Date().getFullYear()} PujaPlace. All rights reserved.
        </p>
        <p className="text-xs text-muted-foreground mt-1">
          Inspired by the teachings of Art of Living.
        </p>
      </div>
    </footer>
  );
};

export default Footer;

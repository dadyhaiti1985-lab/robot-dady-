import React from 'react';
import { Link } from 'react-router-dom';
import { Activity } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="border-t border-border bg-card/50">
      <div className="container mx-auto px-4 py-12 flex flex-col md:flex-row justify-between items-center md:items-start gap-8">
        <div className="flex flex-col items-center md:items-start space-y-4">
          <Link to="/" className="flex items-center space-x-2">
            <Activity className="w-6 h-6 text-primary" />
            <span className="font-bold text-xl tracking-tight text-foreground">RoboKripto</span>
          </Link>
          <span className="text-sm text-muted-foreground max-w-xs text-center md:text-left">
            Sistèm oto-komès avanse pou mache kriptografik la. Fè pwofi 24/7 san efò.
          </span>
        </div>
        
        <div className="flex gap-12 text-center md:text-left">
          <div className="flex flex-col space-y-3">
            <span className="font-semibold text-foreground">Pwodwi</span>
            <Link to="/features" className="text-sm text-muted-foreground hover:text-primary transition-colors">Karakteristik</Link>
            <Link to="/pricing" className="text-sm text-muted-foreground hover:text-primary transition-colors">Pri</Link>
          </div>
          <div className="flex flex-col space-y-3">
            <span className="font-semibold text-foreground">Sipò</span>
            <Link to="/contact" className="text-sm text-muted-foreground hover:text-primary transition-colors">Kontakte Nou</Link>
            <span className="text-sm text-muted-foreground hover:text-primary transition-colors cursor-pointer">Tèm & Kondisyon</span>
            <span className="text-sm text-muted-foreground hover:text-primary transition-colors cursor-pointer">Politik Konfidansyalite</span>
          </div>
        </div>
      </div>
      <div className="border-t border-border py-6 text-center">
        <span className="text-sm text-muted-foreground">© {new Date().getFullYear()} RoboKripto. Tout dwa rezève.</span>
      </div>
    </footer>
  );
};

export default Footer;
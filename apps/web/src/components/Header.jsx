import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext.jsx';
import { Button } from '@/components/ui/button';
import { Activity, LogOut, Settings, LayoutDashboard } from 'lucide-react';

const Header = () => {
  const { isAuthenticated, logout } = useAuth();
  const location = useLocation();

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error('Logout error', error);
    }
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border bg-background/80 backdrop-blur-md">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <Link to="/" className="flex items-center space-x-2">
          <Activity className="w-6 h-6 text-primary" />
          <span className="font-bold text-xl tracking-tight text-foreground">RoboKripto</span>
        </Link>

        <nav className="hidden md:flex items-center space-x-6">
          <Link to="/" className={`text-sm font-medium transition-colors hover:text-primary ${location.pathname === '/' ? 'text-primary' : 'text-muted-foreground'}`}>
            Akèy
          </Link>
          {isAuthenticated && (
            <>
              <Link to="/dashboard" className={`text-sm font-medium transition-colors hover:text-primary ${location.pathname === '/dashboard' ? 'text-primary' : 'text-muted-foreground'}`}>
                Tablo de Bò
              </Link>
              <Link to="/settings" className={`text-sm font-medium transition-colors hover:text-primary ${location.pathname === '/settings' ? 'text-primary' : 'text-muted-foreground'}`}>
                Paramèt
              </Link>
            </>
          )}
        </nav>

        <div className="flex items-center space-x-4">
          {isAuthenticated ? (
            <>
              <Link to="/dashboard" className="hidden sm:block">
                <Button variant="outline" size="sm">
                  <LayoutDashboard className="w-4 h-4 mr-2" />
                  Tablo de Bò
                </Button>
              </Link>
              <Button variant="ghost" size="sm" onClick={handleLogout} className="text-muted-foreground hover:text-foreground">
                <LogOut className="w-4 h-4 mr-2" />
                Dekonekte
              </Button>
            </>
          ) : (
            <>
              <Link to="/login">
                <Button variant="ghost" size="sm">Konekte</Button>
              </Link>
              <Link to="/signup">
                <Button size="sm">Kòmanse Kounye a</Button>
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuSeparator, 
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu';
import { User, LogOut, LayoutDashboard, GraduationCap, Menu, X } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';

export function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);


  useEffect(() => {
    setMobileMenuOpen(false);
  }, [location.pathname]);


  const handleLogout = () => {
    logout();
    navigate('/');
  };



  
  return (
    <nav className="fixed top-0 left-0 right-0 z-[999] bg-background backdrop-blur-xl border-b border-border/50 shadow-sm">
      <div className="container mx-auto px-6">
        <div className="flex items-center justify-between h-16">

          {/* Logo */}
         <Link to="/" className="flex items-center gap-3 group">
  <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-violet-600 to-indigo-600 flex items-center justify-center shadow-md group-hover:shadow-lg group-hover:scale-105 transition-all duration-300">
    <GraduationCap className="w-6 h-6 text-white" />
  </div>
  <span className="font-display font-bold text-xl lg:text-2xl bg-gradient-to-r from-violet-600 to-indigo-600 bg-clip-text text-transparent">
    Math Mastermind
  </span>
</Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-5 text-foreground">
            {!user ? (
              <>
               <Link to="/" className="hover:text-primary transition-colors px-3 py-2 text-base font-medium">
                  Home
                </Link>
                <Link to="/login" className="hover:text-primary transition-colors px-3 py-2 text-base font-medium">
                  Login
                </Link>
                <Link to="/register">
                  <Button className="btn-gradient px-6 py-2.5 text-sm font-semibold">Get Started</Button>
                </Link>
              </>
            ) : (
              <>
                <Link 
                  to={user.role === 'admin' ? '/admin' : '/dashboard'} 
                  className="hover:text-primary transition-colors"
                >
                  Dashboard
                </Link>

                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <button className="flex items-center gap-3 px-4 py-2 rounded-xl hover:bg-secondary transition-colors">
                      <div className="w-8 h-8 rounded-full gradient-primary flex items-center justify-center">
                        <span className="text-sm font-semibold text-primary-foreground">
                          {user.name.charAt(0).toUpperCase()}
                        </span>
                      </div>
                      <div className="text-left">
                        <p className="text-sm font-medium">{user.name}</p>
                        <p className="text-xs text-muted-foreground capitalize">{user.role}</p>
                      </div>
                    </button>
                  </DropdownMenuTrigger>

                  <DropdownMenuContent align="end" className="w-48">
                    <DropdownMenuItem onClick={() => navigate(user.role === 'admin' ? '/admin' : '/dashboard')}>
                      <LayoutDashboard className="w-4 h-4 mr-2" />
                      Dashboard
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => navigate('/profile')}>
                      <User className="w-4 h-4 mr-2" />
                      Profile
                    </DropdownMenuItem>

                    <DropdownMenuSeparator />

                    <DropdownMenuItem onClick={handleLogout} className="text-destructive">
                      <LogOut className="w-4 h-4 mr-2" />
                      Logout
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>

              </>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button 
            className="md:hidden p-2 text-foreground"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden py-4 border-t border-border/50 bg-background backdrop-blur-xl rounded-b-xl text-foreground">
            {!user ? (
              <div className="flex flex-col gap-3">
                <Link 
                  to="/" 
                  className="px-4 py-2 hover:bg-secondary rounded-lg"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Home
                </Link>

                <Link 
                  to="/login" 
                  className="px-4 py-2 hover:bg-secondary rounded-lg"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Login
                </Link>

                <Link 
                  to="/register" 
                  className="px-4 py-2"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <Button className="btn-gradient w-full">Get Started</Button>
                </Link>
              </div>
            ) : (
              <div className="flex flex-col gap-3">
                
                <div className="flex items-center gap-3 px-4 py-2">
                  <div className="w-10 h-10 rounded-full gradient-primary flex items-center justify-center">
                    <span className="text-lg font-semibold text-primary-foreground">
                      {user.name.charAt(0).toUpperCase()}
                    </span>
                  </div>
                  <div>
                    <p className="font-medium">{user.name}</p>
                    <p className="text-sm text-muted-foreground capitalize">{user.role}</p>
                  </div>
                </div>

                <Link 
                  to={user.role === 'admin' ? '/admin' : '/dashboard'}
                  className="px-4 py-2 hover:bg-secondary rounded-lg"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Dashboard
                </Link>

                <button 
                  onClick={() => { handleLogout(); setMobileMenuOpen(false); }}
                  className="px-4 py-2 text-left text-destructive hover:bg-secondary rounded-lg"
                >
                  Logout
                </button>

              </div>
            )}
          </div>
        )}

      </div>
    </nav>
  );
}

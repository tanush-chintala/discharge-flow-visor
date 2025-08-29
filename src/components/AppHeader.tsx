import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { getStoredAuth, clearStoredAuth } from '@/lib/auth';
import { useToast } from '@/hooks/use-toast';
import { Activity, Stethoscope, LogOut, User } from 'lucide-react';

interface AppHeaderProps {
  title: string;
  subtitle?: string;
  children?: React.ReactNode;
}

export function AppHeader({ title, subtitle, children }: AppHeaderProps) {
  const auth = getStoredAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleLogout = () => {
    clearStoredAuth();
    toast({
      title: 'Logged Out',
      description: 'You have been successfully logged out.',
    });
    navigate('/login');
  };

  return (
    <header className="border-b bg-card shadow-card">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link to="/dashboard" className="flex items-center gap-2">
              <div className="flex items-center gap-2 p-2 bg-gradient-primary rounded-lg shadow-status">
                <Activity className="w-5 h-5 text-white" />
                <Stethoscope className="w-4 h-4 text-white/80" />
              </div>
            </Link>
            <div>
              <h1 className="text-xl font-bold text-foreground">{title}</h1>
              {subtitle && (
                <p className="text-sm text-muted-foreground">{subtitle}</p>
              )}
            </div>
          </div>

          <div className="flex items-center gap-4">
            {children}
            
            <div className="flex items-center gap-3">
              <div className="text-right">
                <div className="flex items-center gap-2">
                  <User className="w-4 h-4 text-muted-foreground" />
                  <span className="text-sm font-medium">{auth.user?.name}</span>
                </div>
                <Badge variant="outline" className="text-xs mt-1">
                  {auth.user?.role.replace('_', ' ')}
                </Badge>
              </div>
              
              <Button
                variant="ghost"
                size="sm"
                onClick={handleLogout}
                className="text-muted-foreground hover:text-foreground"
              >
                <LogOut className="w-4 h-4" />
                <span className="sr-only">Logout</span>
              </Button>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
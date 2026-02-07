import { ReactNode } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Home, User, Wallet, Settings, MessageSquare } from 'lucide-react';
import { cn } from '@/lib/utils';
import { LoginArea } from '@/components/auth/LoginArea';
import { useCurrentUser } from '@/hooks/useCurrentUser';

interface LayoutProps {
  children: ReactNode;
}

const navItems = [
  { name: 'Home', href: '/', icon: Home },
  { name: 'Messages', href: '/messages', icon: MessageSquare },
  { name: 'Profile', href: '/profile', icon: User },
  { name: 'Wallet', href: '/wallet', icon: Wallet },
  { name: 'Settings', href: '/settings', icon: Settings },
];

export function Layout({ children }: LayoutProps) {
  const location = useLocation();
  const { user } = useCurrentUser();

  return (
    <div className="flex h-screen bg-background">
      {/* Left Sidebar */}
      <aside className="w-64 border-r border-border bg-sidebar-background flex flex-col">
        {/* Logo */}
        <div className="p-6 border-b border-sidebar-border">
          <Link to="/" className="flex items-center gap-3">
            <img src="/logo.png" alt="erybody" className="w-10 h-10 rounded-full" />
            <span className="text-2xl font-bold text-sidebar-foreground">erybody</span>
          </Link>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4 space-y-2">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.href;
            
            return (
              <Link
                key={item.name}
                to={item.href}
                className={cn(
                  "flex items-center gap-3 px-4 py-3 rounded-lg transition-colors",
                  isActive
                    ? "bg-sidebar-accent text-sidebar-accent-foreground font-semibold"
                    : "text-sidebar-foreground hover:bg-sidebar-accent/50"
                )}
              >
                <Icon className="w-5 h-5" />
                <span>{item.name}</span>
              </Link>
            );
          })}
        </nav>

        {/* Login Area */}
        <div className="p-4 border-t border-sidebar-border">
          <LoginArea className="w-full" />
        </div>

        {/* Footer */}
        <div className="p-4 text-xs text-sidebar-foreground/60 text-center">
          <a 
            href="https://shakespeare.diy" 
            target="_blank" 
            rel="noopener noreferrer"
            className="hover:text-sidebar-foreground/80 transition-colors"
          >
            Vibed with Shakespeare
          </a>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto">
        {children}
      </main>
    </div>
  );
}

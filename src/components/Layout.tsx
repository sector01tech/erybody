import { ReactNode, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Home, User, Wallet, Settings, MessageSquare, Search, Radio, Bell, Bookmark, Compass, Edit, Users } from 'lucide-react';
import { cn } from '@/lib/utils';
import { LoginArea } from '@/components/auth/LoginArea';
import { useCurrentUser } from '@/hooks/useCurrentUser';
import { Button } from '@/components/ui/button';
import { ComposePostModal } from '@/components/ComposePostModal';

interface LayoutProps {
  children: ReactNode;
}

const navItems = [
  { name: 'Home', href: '/', icon: Home },
  { name: 'Explore', href: '/explore', icon: Compass },
  { name: 'Communities', href: '/communities', icon: Users },
  { name: 'Search', href: '/search', icon: Search },
  { name: 'Live', href: '/live', icon: Radio },
  { name: 'Notifications', href: '/notifications', icon: Bell },
  { name: 'Bookmarks', href: '/bookmarks', icon: Bookmark },
  { name: 'Messages', href: '/messages', icon: MessageSquare },
  { name: 'Profile', href: '/profile', icon: User },
  { name: 'Wallet', href: '/wallet', icon: Wallet },
  { name: 'Settings', href: '/settings', icon: Settings },
];

export function Layout({ children }: LayoutProps) {
  const location = useLocation();
  const { user } = useCurrentUser();
  const [isComposeOpen, setIsComposeOpen] = useState(false);

  return (
    <div className="flex h-screen bg-background justify-center">
      <div className="flex w-full max-w-7xl">
        {/* Left Sidebar */}
        <aside className="w-64 border-r border-border bg-sidebar-background flex flex-col flex-shrink-0">
          {/* Logo */}
          <div className="p-6 border-b border-sidebar-border flex justify-center">
            <Link to="/">
              <img src="/logo.png" alt="erybody" className="w-20 h-20 rounded-full" />
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

            {/* Post Button */}
            <Button
              onClick={() => setIsComposeOpen(true)}
              className="w-full flex items-center gap-3 px-4 py-3 h-auto justify-start font-semibold"
              disabled={!user}
            >
              <Edit className="w-5 h-5" />
              <span>Post</span>
            </Button>
          </nav>

          {/* Login Area */}
          <div className="p-4 border-t border-sidebar-border">
            <LoginArea className="w-full" />
          </div>
        </aside>

        {/* Compose Post Modal */}
        <ComposePostModal open={isComposeOpen} onOpenChange={setIsComposeOpen} />

        {/* Main Content */}
        <main className="flex-1 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  );
}

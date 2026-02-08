import { ReactNode, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Home, User, Wallet, Settings, MessageSquare, Search, Radio, Bell, Bookmark, Compass, Edit, Users, Menu, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { LoginArea } from '@/components/auth/LoginArea';
import { useCurrentUser } from '@/hooks/useCurrentUser';
import { useTheme } from '@/hooks/useTheme';
import { Button } from '@/components/ui/button';
import { ComposePostModal } from '@/components/ComposePostModal';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';

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
  const { theme } = useTheme();
  const [isComposeOpen, setIsComposeOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const logoSrc = theme === 'dark' ? '/logo-light.png' : '/logo-dark.png';

  const NavContent = () => (
    <>
      {/* Logo */}
      <div className="p-6 border-b border-sidebar-border flex justify-center">
        <Link to="/" onClick={() => setIsMobileMenuOpen(false)}>
          <img src={logoSrc} alt="erybody" className="w-20 h-20 rounded-full" />
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
              onClick={() => setIsMobileMenuOpen(false)}
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
          onClick={() => {
            setIsComposeOpen(true);
            setIsMobileMenuOpen(false);
          }}
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
    </>
  );

  return (
    <div className="flex h-screen bg-background justify-center">
      <div className="flex w-full max-w-7xl">
        {/* Desktop Sidebar */}
        <aside className="hidden md:flex w-64 border-r border-border bg-sidebar-background flex-col flex-shrink-0">
          <NavContent />
        </aside>

        {/* Mobile Header */}
        <div className="md:hidden fixed top-0 left-0 right-0 z-40 bg-sidebar-background border-b border-sidebar-border">
          <div className="flex items-center justify-between p-4">
            <Link to="/">
              <img src={logoSrc} alt="erybody" className="w-10 h-10 rounded-full" />
            </Link>
            
            <div className="flex items-center gap-2">
              <Button
                onClick={() => setIsComposeOpen(true)}
                size="sm"
                disabled={!user}
              >
                <Edit className="w-4 h-4" />
              </Button>
              
              <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
                <SheetTrigger asChild>
                  <Button variant="ghost" size="sm">
                    <Menu className="w-5 h-5" />
                  </Button>
                </SheetTrigger>
                <SheetContent side="left" className="w-64 p-0 bg-sidebar-background">
                  <div className="flex flex-col h-full">
                    <NavContent />
                  </div>
                </SheetContent>
              </Sheet>
            </div>
          </div>
        </div>

        {/* Compose Post Modal */}
        <ComposePostModal open={isComposeOpen} onOpenChange={setIsComposeOpen} />

        {/* Mobile Floating Action Button for Post */}
        <Button
          onClick={() => setIsComposeOpen(true)}
          disabled={!user}
          className="md:hidden fixed bottom-6 right-6 z-50 h-14 w-14 rounded-full shadow-lg"
          size="icon"
        >
          <Edit className="w-6 h-6" />
        </Button>

        {/* Main Content */}
        <main className="flex-1 overflow-y-auto scrollbar-hide pt-[73px] md:pt-0">
          {children}
        </main>
      </div>
    </div>
  );
}

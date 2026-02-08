import { ReactNode, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Home, User, Wallet, Settings, MessageSquare, Search, Radio, Bell, Bookmark, Compass, Edit, Users, Menu, X, LogIn } from 'lucide-react';
import { cn } from '@/lib/utils';
import { LoginArea } from '@/components/auth/LoginArea';
import { useCurrentUser } from '@/hooks/useCurrentUser';
import { useTheme } from '@/hooks/useTheme';
import { Button } from '@/components/ui/button';
import { ComposePostModal } from '@/components/ComposePostModal';
import { Drawer, DrawerContent, DrawerTrigger } from '@/components/ui/drawer';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { genUserName } from '@/lib/genUserName';

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

  // Get user metadata for mobile menu
  const userMetadata = user?.metadata;
  const displayName = userMetadata?.name ?? (user ? genUserName(user.pubkey) : '');
  const profileImage = userMetadata?.picture;

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
          <div className="flex items-center justify-center p-4">
            <Link to="/">
              <img src={logoSrc} alt="erybody" className="w-10 h-10 rounded-full" />
            </Link>
          </div>
        </div>

        {/* Mobile Bottom Navigation Tray */}
        <Drawer open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
          <div className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-sidebar-background border-t border-sidebar-border safe-area-inset-bottom">
            <div className="flex items-center justify-around p-2">
              <Link
                to="/"
                onClick={() => setIsMobileMenuOpen(false)}
                className={cn(
                  "flex flex-col items-center gap-1 p-2 rounded-lg transition-colors min-w-[60px]",
                  location.pathname === '/' ? "text-primary" : "text-sidebar-foreground"
                )}
              >
                <Home className="w-6 h-6" />
                <span className="text-xs">Home</span>
              </Link>

              <Link
                to="/search"
                onClick={() => setIsMobileMenuOpen(false)}
                className={cn(
                  "flex flex-col items-center gap-1 p-2 rounded-lg transition-colors min-w-[60px]",
                  location.pathname === '/search' ? "text-primary" : "text-sidebar-foreground"
                )}
              >
                <Search className="w-6 h-6" />
                <span className="text-xs">Search</span>
              </Link>

              <Button
                onClick={() => setIsComposeOpen(true)}
                disabled={!user}
                className="h-12 w-12 rounded-full -mt-6 shadow-lg"
                size="icon"
              >
                <Edit className="w-6 h-6" />
              </Button>

              <Link
                to="/notifications"
                onClick={() => setIsMobileMenuOpen(false)}
                className={cn(
                  "flex flex-col items-center gap-1 p-2 rounded-lg transition-colors min-w-[60px]",
                  location.pathname === '/notifications' ? "text-primary" : "text-sidebar-foreground"
                )}
              >
                <Bell className="w-6 h-6" />
                <span className="text-xs">Alerts</span>
              </Link>

              <DrawerTrigger asChild>
                <button className="flex flex-col items-center gap-1 p-2 rounded-lg transition-colors min-w-[60px] text-sidebar-foreground">
                  <Menu className="w-6 h-6" />
                  <span className="text-xs">Menu</span>
                </button>
              </DrawerTrigger>
            </div>
          </div>

          <DrawerContent className="bg-sidebar-background max-h-[85vh]">
            <div className="overflow-y-auto pb-safe">
              {/* User Info / Login */}
              <div className="p-6 border-b border-sidebar-border">
                {user ? (
                  <Link to="/profile" onClick={() => setIsMobileMenuOpen(false)} className="flex items-center gap-3">
                    <Avatar className="w-12 h-12">
                      <AvatarImage src={profileImage} alt={displayName} />
                      <AvatarFallback>{displayName[0]?.toUpperCase()}</AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold truncate">{displayName}</p>
                      <p className="text-sm text-muted-foreground">View profile</p>
                    </div>
                  </Link>
                ) : (
                  <LoginArea className="w-full" />
                )}
              </div>

              {/* Full Navigation */}
              <nav className="p-4 space-y-2">
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
              </nav>
            </div>
          </DrawerContent>
        </Drawer>

        {/* Compose Post Modal */}
        <ComposePostModal open={isComposeOpen} onOpenChange={setIsComposeOpen} />

        {/* Main Content */}
        <main className="flex-1 overflow-y-auto scrollbar-hide pt-[73px] md:pt-0 pb-[80px] md:pb-0">
          {children}
        </main>
      </div>
    </div>
  );
}

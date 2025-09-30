import { useState, useEffect } from 'react';
import { useTheme } from '@/contexts/ThemeContext';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { X, Menu, ShoppingBag, Heart, User, Settings } from 'lucide-react';

export function ThemeSidebar() {
  const [isOpen, setIsOpen] = useState(false);
  const { theme } = useTheme();

  // Close sidebar when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (isOpen && !target.closest('[data-theme-sidebar]')) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen]);

  return (
    <>
      {/* Sidebar Toggle Button */}
      <Button
        variant="ghost"
        size="icon"
        className="fixed top-20 right-4 z-40 bg-primary/10 hover:bg-primary/20"
        onClick={() => setIsOpen(true)}
      >
        <Menu className="h-5 w-5" />
      </Button>

      {/* Sidebar */}
      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.5 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-40 bg-black"
              onClick={() => setIsOpen(false)}
            />

            {/* Sidebar Panel */}
            <motion.div
              data-theme-sidebar
              className={`fixed right-0 top-0 z-50 h-full w-64 ${
                theme === 'dark' ? 'bg-black text-white' : 'bg-white text-black'
              } shadow-xl`}
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 20 }}
            >
              {/* Header */}
              <div className="flex items-center justify-between border-b p-4">
                <h2 className="text-xl font-semibold">Menu</h2>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setIsOpen(false)}
                >
                  <X className="h-5 w-5" />
                </Button>
              </div>

              {/* Content */}
              <div className="p-4">
                <nav className="space-y-4">
                  <SidebarItem icon={<ShoppingBag />} label="Shop" />
                  <SidebarItem icon={<Heart />} label="Wishlist" />
                  <SidebarItem icon={<User />} label="Account" />
                  <SidebarItem icon={<Settings />} label="Settings" />
                </nav>

                {/* Theme-specific content */}
                <div className={`mt-8 rounded-lg p-4 ${
                  theme === 'dark' 
                    ? 'bg-gray-800 text-gray-200' 
                    : 'bg-gray-100 text-gray-800'
                }`}>
                  <h3 className="mb-2 font-medium">
                    {theme === 'dark' ? 'Dark Mode Active' : 'Light Mode Active'}
                  </h3>
                  <p className="text-sm opacity-80">
                    {theme === 'dark'
                      ? 'Experience our collection in elegant dark theme.'
                      : 'Browse our collection in bright light theme.'}
                  </p>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}

function SidebarItem({ icon, label }: { icon: React.ReactNode; label: string }) {
  const { theme } = useTheme();
  
  return (
    <div className={`flex cursor-pointer items-center gap-3 rounded-md p-2 transition-colors ${
      theme === 'dark'
        ? 'hover:bg-gray-800'
        : 'hover:bg-gray-100'
    }`}>
      {icon}
      <span>{label}</span>
    </div>
  );
}
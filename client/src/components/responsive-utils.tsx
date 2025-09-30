import { useState, useEffect } from 'react';

// Custom hook for responsive design
export function useResponsive() {
  const [windowSize, setWindowSize] = useState({
    width: typeof window !== 'undefined' ? window.innerWidth : 0,
    height: typeof window !== 'undefined' ? window.innerHeight : 0,
  });
  
  const [device, setDevice] = useState({
    isMobile: false,
    isTablet: false,
    isDesktop: false,
  });

  useEffect(() => {
    // Handler to call on window resize
    function handleResize() {
      // Set window width/height to state
      setWindowSize({
        width: window.innerWidth,
        height: window.innerHeight,
      });
      
      // Update device type
      setDevice({
        isMobile: window.innerWidth < 768,
        isTablet: window.innerWidth >= 768 && window.innerWidth < 1024,
        isDesktop: window.innerWidth >= 1024,
      });
    }
    
    // Add event listener
    window.addEventListener('resize', handleResize);
    
    // Call handler right away so state gets updated with initial window size
    handleResize();
    
    // Remove event listener on cleanup
    return () => window.removeEventListener('resize', handleResize);
  }, []); // Empty array ensures that effect is only run on mount and unmount

  return { windowSize, device };
}

// Responsive container component
export function ResponsiveContainer({ 
  children,
  className = "",
}: { 
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={`w-full px-4 sm:px-6 md:px-8 lg:px-12 xl:px-16 mx-auto ${className}`}>
      {children}
    </div>
  );
}

// Grid layout that adapts to screen size
export function ResponsiveGrid({ 
  children,
  columns = { sm: 1, md: 2, lg: 3, xl: 4 },
  gap = "gap-6",
  className = "",
}: { 
  children: React.ReactNode;
  columns?: { sm?: number; md?: number; lg?: number; xl?: number };
  gap?: string;
  className?: string;
}) {
  // Generate grid template columns classes based on props
  const gridCols = `
    grid-cols-${columns.sm || 1}
    sm:grid-cols-${columns.sm || 1}
    md:grid-cols-${columns.md || 2}
    lg:grid-cols-${columns.lg || 3}
    xl:grid-cols-${columns.xl || 4}
  `;

  return (
    <div className={`grid ${gridCols} ${gap} ${className}`}>
      {children}
    </div>
  );
}

// Hide/show component based on breakpoint
export function Breakpoint({ 
  children,
  showOn = [],
}: { 
  children: React.ReactNode;
  showOn: Array<'sm' | 'md' | 'lg' | 'xl' | 'mobile' | 'desktop'>;
}) {
  const classes = showOn.map(breakpoint => {
    switch (breakpoint) {
      case 'sm': return 'hidden sm:block';
      case 'md': return 'hidden md:block';
      case 'lg': return 'hidden lg:block';
      case 'xl': return 'hidden xl:block';
      case 'mobile': return 'block md:hidden';
      case 'desktop': return 'hidden md:block';
      default: return '';
    }
  }).join(' ');

  return <div className={classes}>{children}</div>;
}
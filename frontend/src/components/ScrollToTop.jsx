import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

const ScrollToTop = () => {
  const { pathname } = useLocation();

  useEffect(() => {
    const scrollToTop = () => {
      window.scrollTo(0, 0);
      const contentArea = document.querySelector('.sidebar-content');
      if (contentArea) {
        contentArea.scrollTop = 0;
      }
    };

    // Scroll immediately
    scrollToTop();
    
    // Retry after slight delays to handle async data loading spinners
    const timer1 = setTimeout(scrollToTop, 100);
    const timer2 = setTimeout(scrollToTop, 500);

    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
    };
  }, [pathname]);

  return null;
};

export default ScrollToTop;

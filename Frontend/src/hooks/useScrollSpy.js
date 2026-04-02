import { useState, useCallback } from 'react';

export const useScrollSpy = (scrollContainerRef) => {
  const [activeSlide, setActiveSlide] = useState('slide-home');

  const handleScroll = useCallback(() => {
    if (!scrollContainerRef.current) return;
    const slides = document.querySelectorAll('.slide');
    const scrollTop = scrollContainerRef.current.scrollTop;
    const viewportHeight = window.innerHeight;

    for (let i = 0; i < slides.length; i++) {
      const slide = slides[i];
      const slideTop = slide.offsetTop;
      const slideBottom = slideTop + slide.offsetHeight;

      if (scrollTop + viewportHeight / 3 >= slideTop && scrollTop + viewportHeight / 3 < slideBottom) {
        const id = slide.getAttribute('id');
        if (id && id !== activeSlide) {
          setActiveSlide(id);
        }
        break;
      }
    }
  }, [scrollContainerRef, activeSlide]);

  return { activeSlide, handleScroll };
};
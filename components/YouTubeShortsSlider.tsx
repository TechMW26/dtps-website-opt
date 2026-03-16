'use client';

import { useState, useEffect, useRef } from 'react';

const youtubeVideos = [
  { id: 'QnvX0T0dH3g' },
  { id: '3_pnN3p23t4' },
  { id: 'ipMaYZpyJAg' },
  { id: '6uk0l9SU0Sw' },
  { id: 'CUUjzE5NnTA' },
  { id: 'QRIWXRkjEXE' },
];

export default function YouTubeShortsSlider() {
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [activeVideoId, setActiveVideoId] = useState<string | null>(null);
  const [paused, setPaused] = useState(false);
  const gridRef = useRef<HTMLDivElement>(null);
  const sliderTimerRef = useRef<NodeJS.Timeout | null>(null);

  const getGapPx = () => {
    if (!gridRef.current) return 0;
    const styles = getComputedStyle(gridRef.current);
    const gap = parseFloat(styles.gap || styles.columnGap || '0');
    return isNaN(gap) ? 0 : gap;
  };

  const getStepSize = () => {
    const grid = gridRef.current;
    if (!grid) return 0;
    const item = grid.querySelector('.yt-video-container') as HTMLElement;
    if (!item) return 0;
    const cardW = item.getBoundingClientRect().width;
    const gap = getGapPx();
    return cardW + gap;
  };

  const slideNext = () => {
    const grid = gridRef.current;
    if (!grid) return;
    
    const step = getStepSize();
    const maxScroll = grid.scrollWidth - grid.clientWidth;
    if (maxScroll <= 0) return;

    const next = grid.scrollLeft + step;
    if (next >= maxScroll - 2) {
      grid.scrollTo({ left: 0, behavior: 'smooth' });
    } else {
      grid.scrollTo({ left: next, behavior: 'smooth' });
    }
  };

  const slidePrev = () => {
    const grid = gridRef.current;
    if (!grid) return;
    
    const step = getStepSize();
    const prev = grid.scrollLeft - step;
    
    if (prev <= 0) {
      const maxScroll = grid.scrollWidth - grid.clientWidth;
      grid.scrollTo({ left: maxScroll, behavior: 'smooth' });
    } else {
      grid.scrollTo({ left: prev, behavior: 'smooth' });
    }
  };

  const slideStep = () => {
    if (paused) return;
    slideNext();
  };

  const startAuto = () => {
    stopAuto();
    sliderTimerRef.current = setInterval(slideStep, 2200);
  };

  const stopAuto = () => {
    if (sliderTimerRef.current) {
      clearInterval(sliderTimerRef.current);
      sliderTimerRef.current = null;
    }
  };

  useEffect(() => {
    startAuto();

    const handleResize = () => {
      startAuto();
    };

    window.addEventListener('resize', handleResize);

    return () => {
      stopAuto();
      window.removeEventListener('resize', handleResize);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [paused]);

  const openLightbox = (videoId: string) => {
    setActiveVideoId(videoId);
    setLightboxOpen(true);
    setPaused(true);
  };

  const closeLightbox = () => {
    setLightboxOpen(false);
    setActiveVideoId(null);
    setPaused(false);
  };

  return (
    <>
      {/* Navigation Arrows */}
      <div className="yt-slider-nav">
        <button 
          className="yt-nav-btn yt-nav-prev"
          onClick={() => { slidePrev(); setPaused(true); setTimeout(() => setPaused(false), 3000); }}
          aria-label="Previous"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M15 18l-6-6 6-6" />
          </svg>
        </button>
        <button 
          className="yt-nav-btn yt-nav-next"
          onClick={() => { slideNext(); setPaused(true); setTimeout(() => setPaused(false), 3000); }}
          aria-label="Next"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M9 18l6-6-6-6" />
          </svg>
        </button>
      </div>

      <div
        ref={gridRef}
        className="yt-video-grid"
        onMouseEnter={() => setPaused(true)}
        onMouseLeave={() => setPaused(false)}
        onTouchStart={() => setPaused(true)}
        onTouchEnd={() => setTimeout(() => setPaused(false), 3000)}
      >
        {youtubeVideos.map((video) => (
          <div
            key={video.id}
            className="yt-video-container"
            onClick={() => openLightbox(video.id)}
          >
            <img
              className="yt-thumb"
              src={`https://img.youtube.com/vi/${video.id}/hqdefault.jpg`}
              alt="Video preview"
              loading="lazy"
              decoding="async"
            />
            <div className="yt-play-overlay">
              <div className="yt-play-icon"></div>
            </div>
          </div>
        ))}
      </div>

      {/* Lightbox */}
      {lightboxOpen && (
        <div className="yt-lightbox" onClick={closeLightbox}>
          <div className="yt-lightbox-content" onClick={(e) => e.stopPropagation()}>
            <button className="yt-close-btn" onClick={closeLightbox}>
              &times;
            </button>
            {activeVideoId && (
              <iframe
                src={`https://www.youtube.com/embed/${activeVideoId}?autoplay=1&controls=1&modestbranding=1&rel=0&playsinline=1`}
                allow="autoplay; encrypted-media; picture-in-picture"
                allowFullScreen
              />
            )}
          </div>
        </div>
      )}

      <style jsx>{`
        .yt-slider-nav {
          display: flex;
          gap: 12px;
          justify-content: flex-end;
          margin-bottom: 16px;
          padding-right: 16px;
        }

        .yt-nav-btn {
          width: 48px;
          height: 48px;
          border-radius: 50%;
          border: 2px solid #d1d5db;
          background: white;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: all 0.2s ease;
          color: #374151;
        }

        .yt-nav-btn:hover {
          border-color: #ff9100;
          color: #ff9100;
        }

        .yt-video-grid {
          display: flex;
          gap: 16px;
          overflow-x: auto;
          padding: 16px;
          width: 100%;
          max-width: 1300px;
          margin: 0 auto;
          scrollbar-width: none;
          scroll-snap-type: x mandatory;
          -webkit-overflow-scrolling: touch;
        }
        .yt-video-grid::-webkit-scrollbar {
          display: none;
        }

        .yt-video-container {
          position: relative;
          flex: 0 0 auto;
          width: 200px;
          aspect-ratio: 9 / 16;
          border-radius: 30px;
          overflow: hidden;
          cursor: pointer;
          background: #000;
          scroll-snap-align: start;
        }

        .yt-thumb {
          width: 100%;
          height: 100%;
          object-fit: cover;
          display: block;
        }

        .yt-play-overlay {
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          width: 60px;
          height: 60px;
          background: rgba(0, 0, 0, 0.5);
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          pointer-events: none;
        }

        .yt-play-icon {
          border-top: 12px solid transparent;
          border-bottom: 12px solid transparent;
          border-left: 18px solid #fff;
          width: 0;
          height: 0;
          margin-left: 4px;
        }

        .yt-lightbox {
          position: fixed;
          inset: 0;
          background: rgba(0, 0, 0, 0.8);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 1000;
        }

        .yt-lightbox-content {
          position: relative;
        }

        .yt-lightbox-content iframe {
          height: 90vh;
          aspect-ratio: 9 / 16;
          border-radius: 30px;
          border: none;
          display: block;
        }

        .yt-close-btn {
          position: absolute;
          top: 10px;
          right: 10px;
          background: #fff;
          border: none;
          border-radius: 50%;
          width: 40px;
          height: 40px;
          font-size: 24px;
          cursor: pointer;
          z-index: 1001;
          line-height: 0.8;
        }

        @media (min-width: 769px) {
          .yt-video-grid {
            overflow-x: hidden;
            padding: 24px 0;
            gap: 24px;
          }

          .yt-video-container {
            width: 260px;
          }
        }
      `}</style>
    </>
  );
}

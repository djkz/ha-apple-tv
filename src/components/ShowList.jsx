import React, { useMemo, useRef, useCallback } from 'react';

const styles = {
  wrapper: {
    height: '100%',
    display: 'flex',
    position: 'relative',
  },
  container: {
    flex: 1,
    height: '100%',
    overflow: 'hidden', // We handle scroll manually
    position: 'relative',
  },
  scroller: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    // bottom set dynamically based on content
  },
  letterGroup: {
    marginBottom: 8,
  },
  letterHeader: {
    position: 'sticky',
    top: 0,
    background: '#1a1a1a',
    padding: '8px 16px',
    fontSize: 14,
    fontWeight: 600,
    color: '#03a9f4',
    borderBottom: '1px solid #333',
  },
  showItem: {
    display: 'flex',
    alignItems: 'center',
    gap: 12,
    padding: '10px 16px',
    cursor: 'pointer',
    transition: 'background 0.15s',
  },
  showItemSelected: {
    background: 'rgba(3, 169, 244, 0.2)',
  },
  thumbnail: {
    width: 60,
    height: 34,
    borderRadius: 4,
    objectFit: 'cover',
    flexShrink: 0,
  },
  showInfo: {
    flex: 1,
    minWidth: 0,
  },
  showName: {
    fontSize: 14,
    fontWeight: 500,
    color: '#fff',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
  starBadge: {
    width: 16,
    height: 16,
    fill: '#ffc107',
    flexShrink: 0,
  },
  // Alphabet scrubber
  scrubber: {
    width: 28,
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'space-between',
    alignItems: 'center',
    background: '#111',
    borderLeft: '1px solid #333',
    padding: '12px 0',
    flexShrink: 0,
  },
  scrubberLetter: {
    fontSize: 11,
    fontWeight: 600,
    color: '#666',
    padding: '4px 6px',
    cursor: 'pointer',
  },
  scrubberLetterActive: {
    color: '#03a9f4',
  },
};

export default function ShowList({ shows, favorites, selectedShow, onSelect }) {
  const containerRef = useRef(null);
  const scrollerRef = useRef(null);
  const touchStartY = useRef(0);
  const scrollTop = useRef(0);
  const letterRefs = useRef({});

  // Group shows by first letter
  const groupedShows = useMemo(() => {
    const sorted = [...shows].sort((a, b) =>
      a.name.localeCompare(b.name)
    );

    const groups = {};
    for (const show of sorted) {
      const letter = show.name[0].toUpperCase();
      if (!groups[letter]) {
        groups[letter] = [];
      }
      groups[letter].push(show);
    }
    return groups;
  }, [shows]);

  const letters = Object.keys(groupedShows).sort();

  const isFavorite = (show) => favorites.includes(show.url);
  const isSelected = (show) => selectedShow?.url === show.url;

  // Custom touch scroll handlers
  const handleTouchStart = useCallback((e) => {
    touchStartY.current = e.touches[0].clientY;
    scrollTop.current = scrollerRef.current?.offsetTop || 0;
  }, []);

  const handleTouchMove = useCallback((e) => {
    if (!scrollerRef.current || !containerRef.current) return;

    const deltaY = e.touches[0].clientY - touchStartY.current;
    const containerHeight = containerRef.current.clientHeight;
    const scrollerHeight = scrollerRef.current.scrollHeight;
    const maxScroll = Math.min(0, containerHeight - scrollerHeight);

    let newTop = scrollTop.current + deltaY;
    newTop = Math.max(maxScroll, Math.min(0, newTop));

    scrollerRef.current.style.top = `${newTop}px`;
  }, []);

  const handleTouchEnd = useCallback(() => {
    if (scrollerRef.current) {
      scrollTop.current = parseInt(scrollerRef.current.style.top) || 0;
    }
  }, []);

  // Scrubber: jump to letter
  const scrollToLetter = useCallback((letter) => {
    const el = letterRefs.current[letter];
    if (el && scrollerRef.current && containerRef.current) {
      const containerHeight = containerRef.current.clientHeight;
      const scrollerHeight = scrollerRef.current.scrollHeight;
      const maxScroll = Math.min(0, containerHeight - scrollerHeight);

      let newTop = -el.offsetTop;
      newTop = Math.max(maxScroll, Math.min(0, newTop));

      scrollerRef.current.style.top = `${newTop}px`;
      scrollTop.current = newTop;
    }
  }, []);

  return (
    <div style={styles.wrapper}>
      <div
        ref={containerRef}
        style={styles.container}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        <div ref={scrollerRef} style={styles.scroller}>
          {letters.map(letter => (
            <div
              key={letter}
              style={styles.letterGroup}
              ref={(el) => letterRefs.current[letter] = el}
            >
              <div style={styles.letterHeader}>{letter}</div>
              {groupedShows[letter].map(show => (
                <div
                  key={show.url}
                  style={{
                    ...styles.showItem,
                    ...(isSelected(show) ? styles.showItemSelected : {}),
                  }}
                  onClick={() => onSelect(show)}
                >
                  <img
                    style={styles.thumbnail}
                    src={show.image}
                    alt={show.name}
                    loading="lazy"
                  />
                  <div style={styles.showInfo}>
                    <div style={styles.showName}>{show.name}</div>
                  </div>
                  {isFavorite(show) && (
                    <svg style={styles.starBadge} viewBox="0 0 24 24">
                      <path d="M12,17.27L18.18,21L16.54,13.97L22,9.24L14.81,8.62L12,2L9.19,8.62L2,9.24L7.45,13.97L5.82,21L12,17.27Z" />
                    </svg>
                  )}
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>

      {/* Alphabet scrubber */}
      <div style={styles.scrubber}>
        {letters.map(letter => (
          <div
            key={letter}
            style={styles.scrubberLetter}
            onClick={() => scrollToLetter(letter)}
          >
            {letter}
          </div>
        ))}
      </div>
    </div>
  );
}

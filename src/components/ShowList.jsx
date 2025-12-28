import React, { useMemo } from 'react';

const styles = {
  container: {
    height: '100%',
    overflow: 'auto',
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
  showItemHover: {
    background: 'rgba(255, 255, 255, 0.05)',
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
};

export default function ShowList({ shows, favorites, selectedShow, onSelect }) {
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

  return (
    <div style={styles.container}>
      {letters.map(letter => (
        <div key={letter} style={styles.letterGroup}>
          <div style={styles.letterHeader}>{letter}</div>
          {groupedShows[letter].map(show => (
            <div
              key={show.url}
              style={{
                ...styles.showItem,
                ...(isSelected(show) ? styles.showItemSelected : {}),
              }}
              onClick={() => onSelect(show)}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => e.key === 'Enter' && onSelect(show)}
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
  );
}

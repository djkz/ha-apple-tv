import React, { useState } from 'react';
import ShowList from './ShowList';
import ShowPreview from './ShowPreview';
import SlotPicker from './SlotPicker';

const styles = {
  overlay: {
    position: 'fixed',
    inset: 0,
    background: 'rgba(0, 0, 0, 0.95)',
    zIndex: 1000,
    display: 'flex',
    flexDirection: 'column',
  },
  header: {
    display: 'flex',
    alignItems: 'center',
    gap: 12,
    padding: '12px 16px',
    borderBottom: '1px solid #333',
  },
  backButton: {
    width: 36,
    height: 36,
    borderRadius: '50%',
    border: '2px solid #03a9f4',
    background: 'transparent',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  backIcon: {
    width: 18,
    height: 18,
    fill: '#03a9f4',
  },
  title: {
    fontSize: 18,
    fontWeight: 600,
    color: '#fff',
    margin: 0,
  },
  content: {
    flex: 1,
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    overflow: 'hidden',
  },
  leftPanel: {
    borderRight: '1px solid #333',
    overflow: 'hidden',
  },
  rightPanel: {
    display: 'flex',
    flexDirection: 'column',
    padding: 16,
    gap: 16,
    overflow: 'hidden',
  },
  previewArea: {
    flex: 1,
    overflow: 'hidden',
  },
  slotArea: {
    flexShrink: 0,
  },
};

export default function ShowBrowser({ catalog, favorites, onSave, onClose }) {
  const [selectedShow, setSelectedShow] = useState(null);

  const handleSelectShow = (show) => {
    setSelectedShow(show);
  };

  const handleSaveToSlot = (slotIndex) => {
    if (selectedShow) {
      onSave(selectedShow, slotIndex);
      onClose();
    }
  };

  // Get favorite shows from URLs
  const favoriteShows = favorites.map(url =>
    catalog.find(s => s.url === url) || null
  );

  return (
    <div style={styles.overlay}>
      <div style={styles.header}>
        <button style={styles.backButton} onClick={onClose} aria-label="Close">
          <svg style={styles.backIcon} viewBox="0 0 24 24">
            <path d="M20,11V13H8L13.5,18.5L12.08,19.92L4.16,12L12.08,4.08L13.5,5.5L8,11H20Z" />
          </svg>
        </button>
        <h2 style={styles.title}>Show Browser</h2>
      </div>

      <div style={styles.content}>
        <div style={styles.leftPanel}>
          <ShowList
            shows={catalog}
            favorites={favorites}
            selectedShow={selectedShow}
            onSelect={handleSelectShow}
          />
        </div>

        <div style={styles.rightPanel}>
          <div style={styles.previewArea}>
            <ShowPreview show={selectedShow} />
          </div>
          <div style={styles.slotArea}>
            <SlotPicker
              slots={favoriteShows}
              selectedShow={selectedShow}
              onSelectSlot={handleSaveToSlot}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

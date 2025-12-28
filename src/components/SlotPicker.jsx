import React from 'react';

const styles = {
  container: {
    background: '#1a1a1a',
    borderRadius: 12,
    padding: 16,
  },
  label: {
    fontSize: 13,
    fontWeight: 500,
    color: '#888',
    marginBottom: 12,
  },
  slots: {
    display: 'flex',
    gap: 10,
  },
  slot: {
    flex: 1,
    aspectRatio: '16/9',
    borderRadius: 8,
    border: '2px solid #333',
    background: '#222',
    cursor: 'pointer',
    overflow: 'hidden',
    position: 'relative',
    transition: 'border-color 0.15s, transform 0.15s',
  },
  slotDisabled: {
    opacity: 0.5,
    cursor: 'not-allowed',
  },
  slotActive: {
    borderColor: '#03a9f4',
    transform: 'scale(1.05)',
  },
  slotImage: {
    width: '100%',
    height: '100%',
    objectFit: 'cover',
  },
  slotEmpty: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    height: '100%',
    color: '#555',
    fontSize: 16,
    fontWeight: 600,
  },
  slotNumber: {
    position: 'absolute',
    top: 4,
    left: 4,
    width: 18,
    height: 18,
    borderRadius: '50%',
    background: 'rgba(0, 0, 0, 0.7)',
    color: '#fff',
    fontSize: 11,
    fontWeight: 600,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
};

export default function SlotPicker({ slots, selectedShow, onSelectSlot }) {
  const isDisabled = !selectedShow;

  return (
    <div style={styles.container}>
      <div style={styles.label}>Save to slot:</div>
      <div style={styles.slots}>
        {[0, 1, 2, 3, 4].map(index => {
          const show = slots[index];
          const isActive = !isDisabled;

          return (
            <div
              key={index}
              style={{
                ...styles.slot,
                ...(isDisabled ? styles.slotDisabled : {}),
                ...(isActive && !isDisabled ? {} : {}),
              }}
              onClick={() => !isDisabled && onSelectSlot(index)}
              role="button"
              tabIndex={isDisabled ? -1 : 0}
              onKeyDown={(e) => e.key === 'Enter' && !isDisabled && onSelectSlot(index)}
              title={show ? `Replace ${show.name}` : `Add to slot ${index + 1}`}
            >
              {show ? (
                <>
                  <img
                    style={styles.slotImage}
                    src={show.image}
                    alt={show.name}
                  />
                  <div style={styles.slotNumber}>{index + 1}</div>
                </>
              ) : (
                <div style={styles.slotEmpty}>{index + 1}</div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

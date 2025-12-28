import React from 'react';

const styles = {
  container: {
    height: '100%',
    display: 'flex',
    flexDirection: 'column',
  },
  empty: {
    flex: 1,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: '#666',
    fontSize: 14,
  },
  imageContainer: {
    position: 'relative',
    width: '100%',
    aspectRatio: '16/9',
    borderRadius: 12,
    overflow: 'hidden',
    flexShrink: 0,
  },
  image: {
    width: '100%',
    height: '100%',
    objectFit: 'cover',
  },
  info: {
    padding: '12px 0',
    flex: 1,
    overflow: 'auto',
  },
  name: {
    fontSize: 18,
    fontWeight: 600,
    color: '#fff',
    margin: '0 0 8px 0',
  },
  description: {
    fontSize: 13,
    color: 'rgba(255, 255, 255, 0.7)',
    lineHeight: 1.5,
    margin: 0,
  },
};

export default function ShowPreview({ show }) {
  if (!show) {
    return (
      <div style={styles.container}>
        <div style={styles.empty}>Tap a show to preview</div>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      <div style={styles.imageContainer}>
        <img
          style={styles.image}
          src={show.image}
          alt={show.name}
        />
      </div>
      <div style={styles.info}>
        <h3 style={styles.name}>{show.name}</h3>
        <p style={styles.description}>{show.description}</p>
      </div>
    </div>
  );
}

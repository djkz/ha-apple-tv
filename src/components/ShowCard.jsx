import React from 'react';

const styles = {
  card: {
    borderRadius: 12,
    overflow: 'hidden',
    cursor: 'pointer',
  },
  image: {
    width: '100%',
    aspectRatio: '16/9',
    objectFit: 'cover',
    display: 'block',
  },
  info: {
    padding: 10,
  },
  name: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#fff',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    height: 24,
  },
  description: {
    fontSize: 11,
    color: 'rgba(255, 255, 255, 0.7)',
    lineHeight: 1.3,
    height: 50,
    overflow: 'hidden',
    marginTop: 4,
    display: '-webkit-box',
    WebkitLineClamp: 3,
    WebkitBoxOrient: 'vertical',
  },
};

export default function ShowCard({ show, onClick }) {
  const { name, image, description, color } = show;

  return (
    <div
      style={{ ...styles.card, background: color || '#1a1a1a' }}
      onClick={onClick}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => e.key === 'Enter' && onClick()}
    >
      <img
        style={styles.image}
        src={image}
        alt={name}
        loading="lazy"
      />
      <div style={styles.info}>
        <div style={styles.name}>{name}</div>
        <div style={styles.description}>{description}</div>
      </div>
    </div>
  );
}

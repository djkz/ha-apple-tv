import React from 'react';

const styles = {
  button: {
    width: 36,
    height: 36,
    borderRadius: '50%',
    border: '2px solid #03a9f4',
    background: 'transparent',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  svg: {
    width: 18,
    height: 18,
    fill: '#03a9f4',
  },
};

export default function BackButton({ onClick }) {
  return (
    <button style={styles.button} onClick={onClick} aria-label="Go back">
      <svg style={styles.svg} viewBox="0 0 24 24">
        <path d="M20,11V13H8L13.5,18.5L12.08,19.92L4.16,12L12.08,4.08L13.5,5.5L8,11H20Z" />
      </svg>
    </button>
  );
}

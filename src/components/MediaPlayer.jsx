import React, { useState } from 'react';

/**
 * Reusable Media Player component
 * Displays artwork, title, progress bar, and playback controls
 *
 * @param {Object} props
 * @param {Object} props.hass - Home Assistant hass object
 * @param {string} props.entityId - Media player entity ID
 */
export default function MediaPlayer({ hass, entityId }) {
  const [isDraggingVolume, setIsDraggingVolume] = useState(false);
  const [localVolume, setLocalVolume] = useState(null);
  const state = hass?.states?.[entityId];

  if (!state) {
    return (
      <div style={styles.card}>
        <div style={styles.unavailable}>Media player unavailable</div>
      </div>
    );
  }

  const { state: playerState, attributes } = state;
  const {
    friendly_name,
    media_title,
    media_series_title,
    media_season,
    media_episode,
    entity_picture,
    media_position = 0,
    media_duration = 0,
    volume_level = 0.5,
    is_volume_muted,
  } = attributes;

  const isPlaying = playerState === 'playing';
  const isPaused = playerState === 'paused';
  const isActive = isPlaying || isPaused;
  const progress = media_duration > 0 ? (media_position / media_duration) * 100 : 0;

  // Format seconds to MM:SS
  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // Build display title
  let displayTitle = media_title || 'Nothing playing';
  if (media_series_title && media_season && media_episode) {
    displayTitle = `${media_series_title} S${media_season}E${media_episode}`;
  }

  // Service call helpers
  const callService = (service, data = {}) => {
    hass?.callService('media_player', service, { entity_id: entityId, ...data });
  };

  const handlePlayPause = () => callService('media_play_pause');
  const handlePrev = () => callService('media_previous_track');
  const handleNext = () => callService('media_next_track');

  const handleVolumeChange = (e) => {
    const vol = parseFloat(e.target.value);
    setLocalVolume(vol);
    callService('volume_set', { volume_level: vol });
  };

  const handleVolumeDragStart = () => {
    setIsDraggingVolume(true);
    setLocalVolume(volume_level);
  };

  const handleVolumeDragEnd = () => {
    setIsDraggingVolume(false);
    setLocalVolume(null);
  };

  // Use local volume while dragging, otherwise use actual state
  const displayVolume = isDraggingVolume ? localVolume : volume_level;

  const handleSeek = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const percent = (e.clientX - rect.left) / rect.width;
    const seekPosition = Math.floor(percent * media_duration);
    callService('media_seek', { seek_position: seekPosition });
  };

  return (
    <div style={styles.card}>
      {/* Background image or placeholder */}
      {entity_picture && isActive ? (
        <div style={{ ...styles.background, backgroundImage: `url(${entity_picture})` }} />
      ) : (
        <div style={styles.backgroundPlaceholder}>
          <svg style={styles.placeholderIcon} viewBox="0 0 24 24">
            <path d="M21,3V15.5A3.5,3.5 0 0,1 17.5,19A3.5,3.5 0 0,1 14,15.5A3.5,3.5 0 0,1 17.5,12C18.04,12 18.55,12.12 19,12.34V6.47L9,8.6V17.5A3.5,3.5 0 0,1 5.5,21A3.5,3.5 0 0,1 2,17.5A3.5,3.5 0 0,1 5.5,14C6.04,14 6.55,14.12 7,14.34V6L21,3Z" />
          </svg>
        </div>
      )}

      {/* Glass controls bar at bottom */}
      <div style={styles.controlsBar}>
        {/* Progress bar at top edge */}
        <div style={styles.progressBar}>
          <div style={{ ...styles.progressFill, width: `${progress}%` }} />
        </div>

        {/* Main content */}
        <div style={styles.barContent}>
          {/* Left: Volume */}
          <div style={styles.volumeSection}>
            <svg style={styles.volumeIcon} viewBox="0 0 24 24">
              <path d={is_volume_muted || volume_level === 0
                ? "M12,4L9.91,6.09L12,8.18M4.27,3L3,4.27L7.73,9H3V15H7L12,20V13.27L16.25,17.53C15.58,18.04 14.83,18.46 14,18.7V20.77C15.38,20.45 16.63,19.82 17.68,18.96L19.73,21L21,19.73L12,10.73M19,12C19,12.94 18.8,13.82 18.46,14.64L19.97,16.15C20.62,14.91 21,13.5 21,12C21,7.72 18,4.14 14,3.23V5.29C16.89,6.15 19,8.83 19,12M16.5,12C16.5,10.23 15.5,8.71 14,7.97V10.18L16.45,12.63C16.5,12.43 16.5,12.21 16.5,12Z"
                : "M14,3.23V5.29C16.89,6.15 19,8.83 19,12C19,15.17 16.89,17.84 14,18.7V20.77C18,19.86 21,16.28 21,12C21,7.72 18,4.14 14,3.23M16.5,12C16.5,10.23 15.5,8.71 14,7.97V16C15.5,15.29 16.5,13.76 16.5,12M3,9V15H7L12,20V4L7,9H3Z"
              } />
            </svg>
            <input
              type="range"
              min="0"
              max="1"
              step="0.05"
              value={displayVolume}
              onChange={handleVolumeChange}
              onPointerDown={handleVolumeDragStart}
              onPointerUp={handleVolumeDragEnd}
              onPointerCancel={handleVolumeDragEnd}
              style={styles.volumeSlider}
              aria-label="Volume"
            />
          </div>

          {/* Center: Controls */}
          <div style={styles.controlsCenter}>
            <button style={styles.controlButton} onClick={handlePrev} aria-label="Previous">
              <svg style={styles.controlIcon} viewBox="0 0 24 24">
                <path d="M6,18V6H8V18H6M9.5,12L18,6V18L9.5,12Z" />
              </svg>
            </button>

            <button style={styles.playButton} onClick={handlePlayPause} aria-label={isPlaying ? 'Pause' : 'Play'}>
              {isPlaying ? (
                <svg style={styles.playIcon} viewBox="0 0 24 24">
                  <path d="M14,19H18V5H14M6,19H10V5H6V19Z" />
                </svg>
              ) : (
                <svg style={styles.playIcon} viewBox="0 0 24 24">
                  <path d="M8,5.14V19.14L19,12.14L8,5.14Z" />
                </svg>
              )}
            </button>

            <button style={styles.controlButton} onClick={handleNext} aria-label="Next">
              <svg style={styles.controlIcon} viewBox="0 0 24 24">
                <path d="M16,18H18V6H16M6,18L14.5,12L6,6V18Z" />
              </svg>
            </button>
          </div>

          {/* Right: Title */}
          <div style={styles.titleSection}>
            <div style={styles.title}>{displayTitle}</div>
            <div style={styles.subtitle}>{friendly_name}</div>
          </div>
        </div>
      </div>
    </div>
  );
}

const styles = {
  card: {
    position: 'relative',
    aspectRatio: '16/9',
    borderRadius: 12,
    overflow: 'hidden',
  },
  background: {
    position: 'absolute',
    inset: 0,
    backgroundSize: 'cover',
    backgroundPosition: 'center',
  },
  backgroundPlaceholder: {
    position: 'absolute',
    inset: 0,
    background: '#1e1e1e',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  placeholderIcon: {
    width: 48,
    height: 48,
    fill: '#333',
  },
  unavailable: {
    color: '#888',
    textAlign: 'center',
    padding: 40,
  },
  controlsBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    background: 'rgba(0, 0, 0, 0.5)',
    backdropFilter: 'blur(24px)',
    WebkitBackdropFilter: 'blur(24px)',
  },
  progressBar: {
    height: 3,
    background: 'rgba(255, 255, 255, 0.2)',
  },
  progressFill: {
    height: '100%',
    background: '#fff',
  },
  barContent: {
    display: 'flex',
    alignItems: 'center',
    padding: '10px 16px',
    gap: 16,
  },
  volumeSection: {
    display: 'flex',
    alignItems: 'center',
    gap: 8,
    width: 100,
    flexShrink: 0,
  },
  volumeIcon: {
    width: 20,
    height: 20,
    fill: 'rgba(255,255,255,0.8)',
    flexShrink: 0,
  },
  volumeSlider: {
    flex: 1,
    height: 20,
    cursor: 'pointer',
    accentColor: '#fff',
  },
  controlsCenter: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    flex: 1,
  },
  controlButton: {
    width: 44,
    height: 44,
    borderRadius: '50%',
    border: 'none',
    background: 'transparent',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 0,
  },
  controlIcon: {
    width: 28,
    height: 28,
    fill: '#fff',
  },
  playButton: {
    width: 56,
    height: 56,
    borderRadius: '50%',
    border: 'none',
    background: 'rgba(255, 255, 255, 0.2)',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 0,
  },
  playIcon: {
    width: 32,
    height: 32,
    fill: '#fff',
  },
  titleSection: {
    textAlign: 'right',
    width: 100,
    flexShrink: 0,
  },
  title: {
    fontSize: 15,
    fontWeight: 600,
    color: '#fff',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
  subtitle: {
    fontSize: 11,
    color: 'rgba(255,255,255,0.6)',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
};

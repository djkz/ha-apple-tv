import React, { useState, useEffect } from 'react';
import BackButton from './components/BackButton';
import MediaPlayer from './components/MediaPlayer';
import ShowCard from './components/ShowCard';
import ShowBrowser from './components/ShowBrowser';

const MEDIA_PLAYER_ENTITY = 'media_player.living_room_tv';
const PROFILE_KEY = 'tvProfile';
const getFavoritesKey = (profileId) => `tvFavorites_${profileId}`;

const PROFILES = [
  { id: 'timur', name: 'Timur' },
  { id: 'jackie', name: 'Jackie' },
];

const styles = {
  panel: {
    padding: 16,
    minHeight: '100vh',
    boxSizing: 'border-box',
    background: '#111',
  },
  topRow: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: 16,
    marginBottom: 16,
  },
  topRowNarrow: {
    display: 'grid',
    gridTemplateColumns: '1fr',
    gap: 16,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 500,
    color: '#fff',
    margin: '0 0 8px 0',
  },
  rightCell: {
    display: 'flex',
    flexDirection: 'column',
  },
  browserCard: {
    background: '#1e1e1e',
    borderRadius: 12,
    padding: 16,
    flex: 1,
    marginBottom: 12,
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    color: '#888',
    textAlign: 'center',
    cursor: 'pointer',
    transition: 'background 0.15s',
  },
  browserIcon: {
    width: 48,
    height: 48,
    fill: '#03a9f4',
    marginBottom: 12,
  },
  browserText: {
    fontSize: 14,
    color: '#fff',
  },
  browserSubtext: {
    marginTop: 4,
    fontSize: 12,
    opacity: 0.7,
  },
  profileSection: {
    display: 'flex',
    gap: 12,
  },
  profileButton: {
    flex: 1,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    padding: '16px 12px',
    borderRadius: 12,
    border: '2px solid transparent',
    background: '#1e1e1e',
    color: '#888',
    fontSize: 14,
    fontWeight: 500,
    cursor: 'pointer',
    transition: 'all 0.15s',
  },
  profileButtonActive: {
    borderColor: '#03a9f4',
    background: 'rgba(3, 169, 244, 0.1)',
    color: '#fff',
  },
  profileIcon: {
    width: 20,
    height: 20,
    fill: 'currentColor',
  },
  showsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))',
    gap: 16,
  },
  showsGridNarrow: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))',
    gap: 16,
  },
  emptyState: {
    gridColumn: '1 / -1',
    textAlign: 'center',
    padding: 40,
    color: '#888',
  },
};

export default function App({ hass, shows = [], narrow = false }) {
  const [browserOpen, setBrowserOpen] = useState(false);
  const [activeProfile, setActiveProfile] = useState(() => {
    return localStorage.getItem(PROFILE_KEY) || 'timur';
  });
  const [favorites, setFavorites] = useState(() => {
    const profileId = localStorage.getItem(PROFILE_KEY) || 'timur';
    try {
      return JSON.parse(localStorage.getItem(getFavoritesKey(profileId))) || [];
    } catch {
      return [];
    }
  });

  // Initialize favorites from shows if localStorage is empty
  useEffect(() => {
    if (favorites.length === 0 && shows.length > 0) {
      const initialFavorites = shows.slice(0, 5).map(s => s.url);
      setFavorites(initialFavorites);
      localStorage.setItem(getFavoritesKey(activeProfile), JSON.stringify(initialFavorites));
    }
  }, [shows, activeProfile]);

  // Get favorite shows from catalog
  const favoriteShows = favorites
    .map(url => shows.find(s => s.url === url))
    .filter(Boolean);

  const handlePlayShow = (show) => {
    if (!hass) return;
    hass.callService('media_player', 'turn_on', { entity_id: MEDIA_PLAYER_ENTITY });
    hass.callService('script', 'play_tv_show', { url: show.url, _show: show });
  };

  const handleNavigateBack = () => {
    history.pushState(null, '', '/lovelace-kiosk');
    window.dispatchEvent(new Event('location-changed'));
  };

  const handleSaveFavorite = (show, slotIndex) => {
    const newFavorites = [...favorites];
    while (newFavorites.length < 5) {
      newFavorites.push(null);
    }
    const existingIndex = newFavorites.indexOf(show.url);
    if (existingIndex !== -1) {
      newFavorites[existingIndex] = null;
    }
    newFavorites[slotIndex] = show.url;
    setFavorites(newFavorites);
    localStorage.setItem(getFavoritesKey(activeProfile), JSON.stringify(newFavorites));
  };

  const handleSwitchProfile = (profileId) => {
    if (profileId === activeProfile) return;

    setActiveProfile(profileId);
    localStorage.setItem(PROFILE_KEY, profileId);

    // Load this profile's favorites
    try {
      const profileFavorites = JSON.parse(localStorage.getItem(getFavoritesKey(profileId))) || [];
      setFavorites(profileFavorites);
    } catch {
      setFavorites([]);
    }

    // TODO: Call HA service to switch Apple TV profile
    // hass?.callService('script', 'switch_apple_tv_profile', { profile: profileId });
    console.log(`[Profile] Switching to: ${profileId}`);
  };

  return (
    <div style={styles.panel}>
      <BackButton onClick={handleNavigateBack} />

      <div style={narrow ? styles.topRowNarrow : styles.topRow}>
        <div>
          <h3 style={styles.sectionTitle}>Now Playing</h3>
          <MediaPlayer hass={hass} entityId={MEDIA_PLAYER_ENTITY} />
        </div>
        <div style={styles.rightCell}>
          <h3 style={styles.sectionTitle}>Show Browser</h3>
          <div
            style={styles.browserCard}
            onClick={() => setBrowserOpen(true)}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => e.key === 'Enter' && setBrowserOpen(true)}
          >
            <svg style={styles.browserIcon} viewBox="0 0 24 24">
              <path d="M19,11H13V5A1,1 0 0,0 12,4A1,1 0 0,0 11,5V11H5A1,1 0 0,0 4,12A1,1 0 0,0 5,13H11V19A1,1 0 0,0 12,20A1,1 0 0,0 13,19V13H19A1,1 0 0,0 20,12A1,1 0 0,0 19,11Z" />
            </svg>
            <div style={styles.browserText}>Browse Shows</div>
            <small style={styles.browserSubtext}>Pick your favorites</small>
          </div>

          <div style={styles.profileSection}>
            {PROFILES.map(profile => (
              <button
                key={profile.id}
                style={{
                  ...styles.profileButton,
                  ...(activeProfile === profile.id ? styles.profileButtonActive : {}),
                }}
                onClick={() => handleSwitchProfile(profile.id)}
              >
                <svg style={styles.profileIcon} viewBox="0 0 24 24">
                  <path d="M12,4A4,4 0 0,1 16,8A4,4 0 0,1 12,12A4,4 0 0,1 8,8A4,4 0 0,1 12,4M12,14C16.42,14 20,15.79 20,18V20H4V18C4,15.79 7.58,14 12,14Z" />
                </svg>
                {profile.name}
              </button>
            ))}
          </div>
        </div>
      </div>

      <h3 style={styles.sectionTitle}>Favorites</h3>
      <div style={narrow ? styles.showsGridNarrow : styles.showsGrid}>
        {favoriteShows.map((show, idx) => (
          <ShowCard
            key={show.url || idx}
            show={show}
            onClick={() => handlePlayShow(show)}
          />
        ))}
        {favoriteShows.length === 0 && (
          <div style={styles.emptyState}>
            No favorites yet. Tap "Browse Shows" to add some.
          </div>
        )}
      </div>

      {browserOpen && (
        <ShowBrowser
          catalog={shows}
          favorites={favorites}
          onSave={handleSaveFavorite}
          onClose={() => setBrowserOpen(false)}
        />
      )}
    </div>
  );
}

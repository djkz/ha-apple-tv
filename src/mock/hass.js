/**
 * Mock hass object for local development
 * Bridges to macOS TV app via /api/state endpoint
 */
export function createMockHass() {
  // Track last played show for artwork
  let lastPlayedShow = null;

  // Media player state - updated from real TV app
  const mediaPlayerState = {
    state: 'idle',
    attributes: {
      friendly_name: 'Living Room TV (Dev)',
      media_title: null,
      media_series_title: null,
      media_season: null,
      media_episode: null,
      media_content_type: 'tvshow',
      entity_picture: null,
      media_position: 0,
      media_duration: 0,
      media_position_updated_at: new Date().toISOString(),
      volume_level: 1,
      is_volume_muted: false,
      supported_features: 152461,
    }
  };

  // Poll real TV app state
  async function syncState() {
    try {
      const res = await fetch('/api/state');
      const data = await res.json();
      if (data.success) {
        // Map TV app states to HA states
        const stateMap = { playing: 'playing', paused: 'paused', stopped: 'idle' };
        mediaPlayerState.state = stateMap[data.state] || 'idle';
        mediaPlayerState.attributes.media_position = data.position;
        mediaPlayerState.attributes.volume_level = data.volume;
        mediaPlayerState.attributes.media_position_updated_at = new Date().toISOString();

        // Show last played show info when active
        if (lastPlayedShow && (data.state === 'playing' || data.state === 'paused')) {
          mediaPlayerState.attributes.media_title = lastPlayedShow.name;
          mediaPlayerState.attributes.media_series_title = lastPlayedShow.name;
          mediaPlayerState.attributes.entity_picture = lastPlayedShow.image;
        } else if (data.state === 'stopped') {
          mediaPlayerState.attributes.media_title = null;
          mediaPlayerState.attributes.entity_picture = null;
        }
      }
    } catch (err) {
      console.error('[HASS] State sync error:', err);
    }
  }

  // Listeners for state changes
  const listeners = new Set();

  // Sync every second and notify listeners
  async function poll() {
    await syncState();
    listeners.forEach(fn => fn());
  }
  poll();
  setInterval(poll, 1000);

  const hass = {
    // Subscribe to state changes
    subscribe(fn) {
      listeners.add(fn);
      return () => listeners.delete(fn);
    },
    states: {
      'media_player.living_room_tv': mediaPlayerState
    },
    callService: async (domain, service, data) => {
      console.log(`[HASS] ${domain}.${service}`, data);

      // Capture show info for artwork display
      if (domain === 'script' && service === 'play_tv_show' && data?._show) {
        lastPlayedShow = data._show;
        console.log('[HASS] Now playing:', lastPlayedShow.name);
      }

      // Call the bridge API (strip internal _show property)
      const apiData = { ...data };
      delete apiData._show;

      try {
        const res = await fetch('/api/hass', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ domain, service, data: apiData })
        });
        const result = await res.json();
        console.log(`[HASS] Bridge response:`, result);
      } catch (err) {
        console.error(`[HASS] Bridge error:`, err);
      }
    }
  };

  return hass;
}

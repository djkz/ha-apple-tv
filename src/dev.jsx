/**
 * Development entry point
 * Uses mock hass bridged to macOS TV app
 */
import React, { useState, useEffect } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';
import { createMockHass } from './mock/hass';

const hass = createMockHass();

function DevApp() {
  const [shows, setShows] = useState([]);
  const [, forceUpdate] = useState(0);

  // Load catalog
  useEffect(() => {
    fetch('/tv-shows-catalog.json')
      .then(res => res.json())
      .then(data => setShows(data.shows || []))
      .catch(err => console.error('Failed to load catalog:', err));
  }, []);

  // Re-render when TV app state changes
  useEffect(() => {
    return hass.subscribe(() => forceUpdate(n => n + 1));
  }, []);

  return <App hass={hass} shows={shows} version="dev" />;
}

createRoot(document.getElementById('root')).render(
  <DevApp />
);

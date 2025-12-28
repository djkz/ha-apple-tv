/**
 * Production entry point
 * Custom element wrapper for Home Assistant panel integration
 */
import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';

class TVShowsPanel extends HTMLElement {
  constructor() {
    super();
    this._hass = null;
    this._shows = [];
    this._root = null;
  }

  // Called by Home Assistant when hass object updates
  set hass(hass) {
    this._hass = hass;
    this._render();
  }

  // Called by Home Assistant with panel config
  set panel(panel) {
    this._panel = panel;
  }

  // Called by Home Assistant for responsive layout
  set narrow(narrow) {
    this._narrow = narrow;
    this._render();
  }

  connectedCallback() {
    this._root = createRoot(this);
    this._loadShows();
  }

  disconnectedCallback() {
    if (this._root) {
      this._root.unmount();
    }
  }

  async _loadShows() {
    try {
      const cacheBuster = `?t=${Date.now()}`;
      const response = await fetch(`/local/tv-shows-catalog.json${cacheBuster}`);
      const data = await response.json();
      this._shows = data.shows || [];
      this._render();
    } catch (err) {
      console.error('Failed to load TV shows:', err);
      this._shows = [];
      this._render();
    }
  }

  _render() {
    if (!this._root || !this._hass) return;

    this._root.render(
      <App
        hass={this._hass}
        shows={this._shows}
        narrow={this._narrow}
      />
    );
  }
}

customElements.define('tv-shows-panel', TVShowsPanel);

console.info(
  '%c TV-SHOWS-PANEL %c Loaded ',
  'color: white; background: #03a9f4; font-weight: bold;',
  'color: #03a9f4; background: white;'
);

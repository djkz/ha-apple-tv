# TV Shows Panel

Custom Home Assistant panel for browsing and playing Apple TV+ shows on your TV.

## Features

- **Now Playing** - Media player card showing current playback
- **Show Browser** - Browse 200+ Apple TV+ shows alphabetically, preview, and save to favorites
- **5 Favorites** - Quick-access grid of your favorite shows (per-profile)
- **Profile Switching** - Separate favorites for each household member

## Development

```bash
npm install
npm run dev
```

Opens at `http://localhost:5173`. Uses mock `hass` object - favorites persist in localStorage, play commands log to console.

The catalog loads from `public/tv-shows-catalog.json`.

## Production Deployment

1. Build the panel:
   ```bash
   npm run build
   ```

2. Copy to Home Assistant:
   ```bash
   scp -r dist/* root@homeassistant.local:/config/www/tv-shows-panel/
   scp public/tv-shows-catalog.json root@homeassistant.local:/config/www/tv-shows-catalog.json
   ```

3. Register the panel in `configuration.yaml`:
   ```yaml
   panel_custom:
     - name: tv-shows-panel
       url_path: tv-shows
       sidebar_title: TV Shows
       sidebar_icon: mdi:television
       module_url: /local/tv-shows-panel/tv-shows-panel.js
   ```

4. Restart Home Assistant.

## Updating the Catalog

The show catalog is built from TMDB API:

```bash
cd scripts
python build_catalog.py -o ../www/tv-shows-catalog.json
```

Requires `TMDB_API_KEY` environment variable (or edit the script). Fetches all Apple TV+ shows with their artwork and direct URLs.

## How It Works

- Panel is a React app wrapped as a custom element (`<tv-shows-panel>`)
- Home Assistant passes `hass` object for service calls
- Playing a show calls `script.play_tv_show` with the Apple TV+ URL
- Favorites stored in localStorage per profile (`tvFavorites_timur`, etc.)

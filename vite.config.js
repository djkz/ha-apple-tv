import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

// Plugin to bridge hass calls to macOS TV app via AppleScript
function appleTvBridge() {
  return {
    name: 'apple-tv-bridge',
    configureServer(server) {
      // Get player state
      server.middlewares.use('/api/state', async (req, res) => {
        try {
          const script = `
            tell application "TV"
              set pState to player state as string
              set pPos to 0
              try
                set pPos to player position
              end try
            end tell
            set volInfo to (get volume settings)
            set pVol to output volume of volInfo
            return pState & "|" & pPos & "|" & pVol
          `;
          const { stdout } = await execAsync(`osascript -e '${script}'`);
          const [state, position, volume] = stdout.trim().split('|');
          res.setHeader('Content-Type', 'application/json');
          res.end(JSON.stringify({
            success: true,
            state,
            position: parseFloat(position) || 0,
            volume: parseInt(volume) / 100
          }));
        } catch (err) {
          res.statusCode = 500;
          res.end(JSON.stringify({ success: false, error: err.message }));
        }
      });

      // Hass service calls
      server.middlewares.use('/api/hass', async (req, res) => {
        if (req.method !== 'POST') {
          res.statusCode = 405;
          res.end(JSON.stringify({ error: 'POST required' }));
          return;
        }

        let body = '';
        req.on('data', chunk => body += chunk);
        req.on('end', async () => {
          try {
            const { domain, service, data } = JSON.parse(body);
            let script = '';

            if (domain === 'media_player') {
              switch (service) {
                case 'turn_on':
                  script = 'tell application "TV" to activate';
                  break;
                case 'media_play_pause':
                  script = 'tell application "TV" to playpause';
                  break;
                case 'media_play':
                  script = 'tell application "TV" to play';
                  break;
                case 'media_pause':
                  script = 'tell application "TV" to pause';
                  break;
                case 'media_next_track':
                  script = 'tell application "TV" to next track';
                  break;
                case 'media_previous_track':
                  script = 'tell application "TV" to previous track';
                  break;
                case 'volume_set':
                  // TV app uses system volume
                  const vol = Math.round((data?.volume_level || 0.5) * 100);
                  script = `set volume output volume ${vol}`;
                  break;
              }
            }

            // Open URL in TV app (equivalent to play_tv_show script)
            if (domain === 'script' && service === 'play_tv_show' && data?.url) {
              script = `open location "${data.url}"`;
            }

            if (script) {
              await execAsync(`osascript -e '${script}'`);
              res.setHeader('Content-Type', 'application/json');
              res.end(JSON.stringify({ success: true, domain, service }));
            } else {
              res.setHeader('Content-Type', 'application/json');
              res.end(JSON.stringify({ success: true, unhandled: true, domain, service }));
            }
          } catch (err) {
            res.statusCode = 500;
            res.end(JSON.stringify({ success: false, error: err.message }));
          }
        });
      });
    }
  };
}

export default defineConfig({
  plugins: [react(), appleTvBridge()],
  build: {
    outDir: 'dist',
    cssCodeSplit: false,  // Bundle CSS into JS
    rollupOptions: {
      input: 'src/main.jsx',
      output: {
        entryFileNames: 'tv-shows-panel.js',
        assetFileNames: 'tv-shows-panel.[ext]',
        format: 'es',
        inlineDynamicImports: true
      }
    }
  },
  // Dev server settings
  server: {
    port: 5173,
    open: true
  }
});

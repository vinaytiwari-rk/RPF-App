const fs = require('fs');
let file = fs.readFileSync('src/pages/LiveTV.tsx', 'utf8');

const newConfig = `        const player = videojs(videoRef.current, {
          fluid: true,
          autoplay: true,
          controls: true,
          preload: 'auto',
          html5: {
            vhs: {
              enableLowInitialPlaylist: true,
              smoothQualityChange: true,
              fastReady: true,
              useDeviceAmpSupported: true
            }
          }
        });`;

file = file.replace(
    /const player = videojs\(videoRef\.current, \{\s*fluid: true,\s*autoplay: true,\s*controls: true,\s*\}\);/m,
    newConfig
);

fs.writeFileSync('src/pages/LiveTV.tsx', file, 'utf8');
console.log('Updated LiveTV.tsx videojs config');

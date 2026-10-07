const fs = require('fs');

let file = fs.readFileSync('src/layouts/MainLayout.tsx', 'utf8');

// Add Tv to lucide-react imports
file = file.replace(/Clapperboard, HeartHandshake } from "lucide-react";/, 'Clapperboard, HeartHandshake, Tv } from "lucide-react";');
if (!file.includes('Tv } from "lucide-react"')) {
    file = file.replace(/} from "lucide-react";/, ', Tv } from "lucide-react";');
}

// Add to items array
file = file.replace(
    /\{ path: "\/reels", label: "Reels", icon: Clapperboard \},/,
    '{ path: "/reels", label: "Reels", icon: Clapperboard },\n      { path: "/live-tv", label: "Live TV", icon: Tv },'
);

// Update grid-cols-6 to flex justify-between
file = file.replace(/grid grid-cols-6 items-stretch/, 'flex items-stretch justify-between w-full');

// Also add w-full to the inner buttons so they share space evenly
file = file.replace(/className={`relative flex min-w-0/, 'className={`relative flex-1 flex min-w-0');

fs.writeFileSync('src/layouts/MainLayout.tsx', file, 'utf8');
console.log('MainLayout.tsx updated with Live TV button');

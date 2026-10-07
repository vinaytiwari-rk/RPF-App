const fs = require('fs');

let f = fs.readFileSync('src/pages/InternetRadio.tsx', 'utf8');

if (!f.includes('import { useNavigate }')) {
    f = f.replace('import { useOutletContext } from', 'import { useOutletContext, useNavigate } from');
}
if (!f.includes('const navigate = useNavigate()')) {
    f = f.replace('const { lang } = useOutletContext', 'const navigate = useNavigate();\n  const { lang } = useOutletContext');
}

const toggleHTML = `          {/* Media Type Toggle */}
          <div className="flex justify-center mb-2">
            <div className="inline-flex items-center rounded-full bg-slate-200/60 p-1 shadow-inner backdrop-blur-md border border-slate-300/30">
              <button
                onClick={() => navigate('/live-tv')}
                className="flex items-center gap-1.5 rounded-full px-5 py-2 text-[11px] font-black uppercase tracking-wider text-slate-500 hover:text-slate-700 transition"
              >
                <Tv className="h-4 w-4" />
                Live TV
              </button>
              <button
                className="flex items-center gap-1.5 rounded-full px-5 py-2 text-[11px] font-black uppercase tracking-wider text-white bg-gradient-to-r from-orange-500 to-amber-500 shadow-sm transition"
              >
                <Radio className="h-4 w-4" />
                Radio
              </button>
            </div>
          </div>

          <div className="flex items-center gap-3">`;

f = f.replace('<div className="flex items-center gap-3">', toggleHTML);

if (!f.includes('import { Tv }')) {
    f = f.replace('import { Play, Pause,', 'import { Tv, Play, Pause,');
}

fs.writeFileSync('src/pages/InternetRadio.tsx', f, 'utf8');
console.log('InternetRadio toggle added');

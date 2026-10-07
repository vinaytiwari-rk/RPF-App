const fs = require('fs');

let f = fs.readFileSync('src/pages/LiveTV.tsx', 'utf8');

if (!f.includes('RadioReceiver')) {
    f = f.replace('import { ', 'import { RadioReceiver, ');
}

const toggleHTML = `          {/* Media Type Toggle */}
          <div className="flex justify-center mb-2">
            <div className="inline-flex items-center rounded-full bg-slate-200/60 p-1 shadow-inner backdrop-blur-md border border-slate-300/30">
              <button
                className="flex items-center gap-1.5 rounded-full px-5 py-2 text-[11px] font-black uppercase tracking-wider text-white bg-gradient-to-r from-orange-500 to-amber-500 shadow-sm transition"
              >
                <Tv className="h-4 w-4" />
                Live TV
              </button>
              <button
                onClick={() => navigate('/internet-radio')}
                className="flex items-center gap-1.5 rounded-full px-5 py-2 text-[11px] font-black uppercase tracking-wider text-slate-500 hover:text-slate-700 transition"
              >
                <RadioReceiver className="h-4 w-4" />
                Radio
              </button>
            </div>
          </div>

          {/* Header Card */}`;

f = f.replace('{/* Header Card */}', toggleHTML);
fs.writeFileSync('src/pages/LiveTV.tsx', f, 'utf8');
console.log('LiveTV toggle added');

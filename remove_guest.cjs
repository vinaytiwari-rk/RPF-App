const fs = require('fs');
let m = fs.readFileSync('src/layouts/MainLayout.tsx', 'utf8');

const target = `      {guest && (
        <div className="fixed inset-0 z-[100] flex items-end justify-center bg-black/30 p-4 backdrop-blur-sm sm:items-center">
          <motion.div initial={{ opacity: 0, y: 30, scale: 0.97 }} animate={{ opacity: 1, y: 0, scale: 1 }} className="w-full max-w-sm rounded-3xl border border-slate-100 bg-white p-6 shadow-2xl">
            <div className="mb-5 flex h-11 w-11 items-center justify-center rounded-2xl bg-orange-50 text-[#E67817]">
              <User className="h-5 w-5" />
            </div>
            <h2 className="text-lg font-semibold text-slate-900">Sign in to continue</h2>
            <p className="mt-2 text-sm leading-6 text-slate-500">Sign in to access your personal community features.</p>
            <div className="mt-6 flex gap-2">
              <button onClick={() => setGuest(false)} className="flex-1 rounded-xl border border-slate-200 px-4 py-3 text-sm text-slate-700">Close</button>
              <button onClick={() => { setGuest(false); navigate("/login"); }} className="flex-1 rounded-xl bg-[#167C5A] px-4 py-3 text-sm font-semibold text-white">Sign in</button>
            </div>
          </motion.div>
        </div>
      )}`;

m = m.replace(target, '');
m = m.replace('const [guest, setGuest] = useState(false); ', '');

fs.writeFileSync('src/layouts/MainLayout.tsx', m, 'utf8');
console.log('Replaced');

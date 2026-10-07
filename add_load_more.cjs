const fs = require('fs');
let file = fs.readFileSync('src/pages/LiveTV.tsx', 'utf8');

const loadMoreHtml = `          </div>

          {visibleCount < filtered.length && (
            <div className="flex justify-center mt-6 mb-4">
              <button onClick={() => setVisibleCount(v => v + 40)} className="px-6 py-2.5 bg-[#FF9933]/10 text-[#FF9933] font-bold text-sm rounded-full border border-[#FF9933]/30 hover:bg-[#FF9933]/20 transition-colors shadow-sm">
                Load More Channels ({filtered.length - visibleCount} left)
              </button>
            </div>
          )}

          {!filtered.length && (`;

file = file.replace(
    `          </div>

          {!filtered.length && (`,
    loadMoreHtml
);

fs.writeFileSync('src/pages/LiveTV.tsx', file, 'utf8');
console.log('Added Load More button successfully!');

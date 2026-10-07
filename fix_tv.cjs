const fs = require('fs');

let file = fs.readFileSync('src/pages/LiveTV.tsx', 'utf8');

// 1. Fix the proxy issue to use active.url directly
file = file.replace(
    'const srcUrl = `/api/iptv/proxy?url=${encodeURIComponent(active.url)}`;',
    'const srcUrl = active.url;'
);

// 2. Add visibleCount state
if (!file.includes('const [visibleCount')) {
    file = file.replace(
        'const [search, setSearch] = useState("");',
        'const [search, setSearch] = useState("");\n  const [visibleCount, setVisibleCount] = useState(40);'
    );
}

// 3. Reset visibleCount when search changes
file = file.replace(
    'const filtered = useMemo(() => {',
    `useEffect(() => { setVisibleCount(40); }, [search]);\n  const filtered = useMemo(() => {`
);

// 4. Slice the map
file = file.replace(
    '{filtered.map((c) => {',
    '{filtered.slice(0, visibleCount).map((c) => {'
);

// 5. Add Load More button
file = file.replace(
    '            </div>\n          </div>',
    `            </div>\n            {visibleCount < filtered.length && (\n              <div className="flex justify-center mt-6">\n                <button onClick={() => setVisibleCount(v => v + 40)} className="px-6 py-2 bg-orange-100 text-orange-700 font-semibold rounded-full hover:bg-orange-200 transition-colors">\n                  Load More Channels\n                </button>\n              </div>\n            )}\n          </div>`
);

fs.writeFileSync('src/pages/LiveTV.tsx', file, 'utf8');
console.log('Fixed LiveTV.tsx');

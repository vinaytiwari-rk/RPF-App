const fs = require('fs');

// 1. UPDATE adminDynamicRoutes.ts
let routesContent = fs.readFileSync('D:/rp-foundation/src/routes/adminDynamicRoutes.ts', 'utf8');

// Regex to capture the query components
const queryRegex = /const result = await pool\.query\("SELECT (.*?) FROM (.*?) ORDER BY (.*?) (DESC|ASC) LIMIT 500"\);\n\s*res\.json\(\{ success: true, data: result\.rows \}\);/g;

routesContent = routesContent.replace(queryRegex, (match, selectPart, fromPart, orderPart, dirPart) => {
  return \const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 50;
    const offset = (page - 1) * limit;

    const countResult = await pool.query("SELECT COUNT(*) FROM \");
    const totalCount = parseInt(countResult.rows[0].count);
    const totalPages = Math.ceil(totalCount / limit);

    const result = await pool.query(\\\SELECT \ FROM \ ORDER BY \ \ LIMIT \\\ OFFSET \\\\\\);
    res.json({ success: true, data: result.rows, totalPages, currentPage: page });\;
});

fs.writeFileSync('D:/rp-foundation/src/routes/adminDynamicRoutes.ts', routesContent);

// 2. UPDATE GenericAdminTab.tsx
let tabContent = fs.readFileSync('D:/rp-foundation/src/components/GenericAdminTab.tsx', 'utf8');

if (!tabContent.includes('const [page, setPage]')) {
  // Add state
  tabContent = tabContent.replace(
    'const [loading, setLoading] = useState(true);',
    'const [loading, setLoading] = useState(true);\n  const [page, setPage] = useState(1);\n  const [totalPages, setTotalPages] = useState(1);'
  );

  // Update fetchData to use page
  tabContent = tabContent.replace(
    'const res = await axios.get(endpoint, {',
    'const res = await axios.get(\\?page=\&limit=50\, {'
  );

  // Update setData to also set totalPages
  tabContent = tabContent.replace(
    'setData(res.data.data || []);',
    'setData(res.data.data || []);\n        if (res.data.totalPages) setTotalPages(res.data.totalPages);'
  );

  // Update useEffect dependency array to include page
  tabContent = tabContent.replace(
    '}, [token, endpoint]);',
    '}, [token, endpoint, page]);'
  );

  // Add pagination UI below the table
  const tableEnd = '</table>\n            </div>';
  const paginationUI = \</table>
            </div>
            {totalPages > 1 && (
              <div className="flex items-center justify-between px-6 py-4 bg-white border-t border-slate-100">
                <div className="text-sm text-slate-500">
                  Page <span className="font-medium text-slate-800">{page}</span> of <span className="font-medium text-slate-800">{totalPages}</span>
                </div>
                <div className="flex space-x-2">
                  <button
                    onClick={() => setPage(p => Math.max(1, p - 1))}
                    disabled={page === 1}
                    className="px-3 py-1 text-sm border border-slate-200 rounded-md disabled:opacity-50 hover:bg-slate-50 transition-colors"
                  >
                    Previous
                  </button>
                  <button
                    onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                    disabled={page === totalPages}
                    className="px-3 py-1 text-sm border border-slate-200 rounded-md disabled:opacity-50 hover:bg-slate-50 transition-colors"
                  >
                    Next
                  </button>
                </div>
              </div>
            )}\;
  
  tabContent = tabContent.replace(tableEnd, paginationUI);
  
  fs.writeFileSync('D:/rp-foundation/src/components/GenericAdminTab.tsx', tabContent);
}


const fs = require('fs');

// 1. UPDATE adminDynamicRoutes.ts
let routesContent = fs.readFileSync('D:/rp-foundation/src/routes/adminDynamicRoutes.ts', 'utf8');

routesContent = routesContent.replace(/const result = await pool\.query\("SELECT (.*?) FROM (.*?) ORDER BY (.*?) (DESC|ASC) LIMIT 500"\);\n\s*res\.json\(\{ success: true, data: result\.rows \}\);/g, 
\const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 50;
    const offset = (page - 1) * limit;

    const countResult = await pool.query("SELECT COUNT(*) FROM \");
    const totalCount = parseInt(countResult.rows[0].count);
    const totalPages = Math.ceil(totalCount / limit);

    const result = await pool.query(\\\SELECT \ FROM \ ORDER BY \ \ LIMIT \\\ OFFSET \\\\\\);
    res.json({ success: true, data: result.rows, totalPages, currentPage: page });\);
// Note: Parameterizing table names like  in postgres WILL fail.

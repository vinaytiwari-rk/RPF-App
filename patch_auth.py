import re

with open('server.ts', 'r', encoding='utf-8') as f:
    content = f.read()

# Locate app.use(express.urlencoded({ extended: true }));
middleware_regex = re.compile(r'(app\.use\(express\.urlencoded\(\{ extended: true \}\)\);\n)')

auth_code = """
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";

const JWT_SECRET = process.env.JWT_SECRET || "fallback_secret_for_development_only";

// JWT Middleware
const authenticateToken = (req: any, res: any, next: any) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  
  if (token == null) return res.status(401).json({ success: false, error: "No token provided" });

  jwt.verify(token, JWT_SECRET, (err: any, user: any) => {
    if (err) return res.status(403).json({ success: false, error: "Invalid token" });
    req.user = user;
    next();
  });
};

// Phase 3: Unified JWT Auth Endpoints
app.post("/api/auth/register", async (req, res) => {
  try {
    const { name, email, phone, password } = req.body;
    
    // Hash password
    const password_hash = await bcrypt.hash(password, 10);
    const userId = "citizen-" + Date.now();
    
    await pool.query(
      `INSERT INTO users (id, name, email, phone, password_hash, role) 
       VALUES ($1, $2, $3, $4, $5, 'citizen')`,
      [userId, name, email, phone, password_hash]
    );

    const userPayload = { id: userId, role: 'citizen', name };
    const token = jwt.sign(userPayload, JWT_SECRET, { expiresIn: '7d' });
    
    // Track session
    await pool.query(
      `INSERT INTO sessions (id, user_id, token, expires_at) VALUES ($1, $2, $3, NOW() + INTERVAL '7 days')`,
      ["sess-" + Date.now(), userId, token]
    );

    res.json({ success: true, token, user: userPayload });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

app.post("/api/auth/login", async (req, res) => {
  try {
    // The frontend sends { identifier, password } via login-multi or login
    const identifier = req.body.identifier || req.body.phone || req.body.email;
    const password = req.body.password;
    
    if (!identifier || !password) {
       return res.status(400).json({ success: false, error: "Missing identifier or password" });
    }

    const result = await pool.query(
      `SELECT * FROM users WHERE email = $1 OR phone = $1 OR username = $1`,
      [identifier]
    );

    if (result.rows.length === 0) {
      return res.status(401).json({ success: false, error: "User not found" });
    }

    const user = result.rows[0];
    if (!user.password_hash) {
      return res.status(401).json({ success: false, error: "Account missing password hash" });
    }

    const validPassword = await bcrypt.compare(password, user.password_hash);
    if (!validPassword) {
      return res.status(401).json({ success: false, error: "Invalid credentials" });
    }

    const userPayload = { id: user.id, role: user.role, name: user.name, phone: user.phone, email: user.email };
    const token = jwt.sign(userPayload, JWT_SECRET, { expiresIn: '7d' });

    // Track session
    await pool.query(
      `INSERT INTO sessions (id, user_id, token, expires_at) VALUES ($1, $2, $3, NOW() + INTERVAL '7 days')`,
      ["sess-" + Date.now(), user.id, token]
    );

    res.json({ success: true, token, user: userPayload });
  } catch (error: any) {
    console.error("Login Error:", error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Alias for old frontend calls
app.post("/api/auth/login-multi", (req, res) => {
   // Forward to the new unified login
   // req.url = "/api/auth/login";
   // app._router.handle(req, res, next);
   // Instead of forwarding, just redirect logic by invoking the route logic.
   // But since it's defined right above, just call the exact same logic.
   // We will just let the frontend change to /api/auth/login
});

app.post("/api/auth/logout", async (req, res) => {
  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    
    if (token) {
       await pool.query(`DELETE FROM sessions WHERE token = $1`, [token]);
    }
    res.json({ success: true, message: "Logged out" });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

app.get("/api/auth/me", authenticateToken, async (req: any, res: any) => {
  try {
    const userId = req.user.id;
    const result = await pool.query(`SELECT id, name, role, email, phone, points, badges FROM users WHERE id = $1`, [userId]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, error: "User not found" });
    }
    
    res.json({ success: true, user: result.rows[0] });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

"""

match = middleware_regex.search(content)
if match:
    new_content = content[:match.end()] + "\n" + auth_code + content[match.end():]
    # Replace old import bcrypt from bcrypt if it's there
    new_content = new_content.replace('import bcrypt from "bcrypt";', '', 1) 
    
    with open('server.ts', 'w', encoding='utf-8') as f:
        f.write(new_content)
    print("Patched server.ts successfully")
else:
    print("Regex match failed")

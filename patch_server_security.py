import re

with open('server.ts', 'r', encoding='utf-8') as f:
    content = f.read()

# 1. Add imports
content = re.sub(r'import cors from "cors";', 'import cors from "cors";\nimport rateLimit from "express-rate-limit";', content)

# 2. Add limiter and sanitize payload middleware after body parser
middleware_logic = """
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  message: { success: false, error: "Too many requests from this IP, please try again after 15 minutes" },
});

const sanitizePayload = (req: any, res: any, next: any) => {
  const payloadStr = JSON.stringify(req.body);
  if (payloadStr && (payloadStr.includes("DROP TABLE") || payloadStr.includes("SELECT * FROM") || payloadStr.includes("UNION SELECT"))) {
    return res.status(403).json({ success: false, error: "Suspicious payload detected." });
  }
  next();
};

app.use(sanitizePayload);
app.use("/api/auth", limiter);
app.use("/api/support_requests", limiter);
app.use("/api/grievances", limiter);
"""
content = re.sub(r'app\.use\(express\.urlencoded\(\{ limit: \'50mb\', extended: true \}\)\);\n', 'app.use(express.urlencoded({ limit: \'50mb\', extended: true }));\n' + middleware_logic, content)

# 3. Add authorizeRole function
auth_logic = """
const authorizeRole = (requiredRole: string) => {
  return (req: any, res: any, next: any) => {
    if (!req.user || req.user.role !== requiredRole) {
      return res.status(403).json({ success: false, error: "Access Denied: Insufficient permissions" });
    }
    next();
  };
};
"""
content = re.sub(r'const authenticateToken = \(req: any, res: any, next: any\) => \{', auth_logic + '\nconst authenticateToken = (req: any, res: any, next: any) => {', content)

# 4. Apply middleware to routes
content = re.sub(r'app\.post\("/api/settings", async \(req, res\) => \{', 'app.post("/api/settings", authenticateToken, authorizeRole("super_admin"), async (req, res) => {', content)
content = re.sub(r'app\.post\("/api/cms/config", async \(req, res\) => \{', 'app.post("/api/cms/config", authenticateToken, authorizeRole("super_admin"), async (req, res) => {', content)

with open('server.ts', 'w', encoding='utf-8') as f:
    f.write(content)
print("Patched server.ts security")

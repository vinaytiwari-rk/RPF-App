import re

with open('server.ts', 'r', encoding='utf-8') as f:
    content = f.read()

# Fix login-multi
login_old = """
app.post("/api/auth/login-multi", async (req, res) => {
  try {
    const { identifier, password } = req.body;
"""
login_new = """
app.post("/api/auth/login-multi", async (req, res) => {
  try {
    const body = req.body || {};
    const { identifier, password } = body;
"""
content = content.replace(login_old.strip(), login_new.strip())

# Fix credentials update
cred_old = """
app.put("/api/admin/hq/credentials", async (req, res) => {
  try {
    const { username, newPassword } = req.body;
"""
cred_new = """
app.put("/api/admin/hq/credentials", async (req, res) => {
  try {
    const body = req.body || {};
    const { username, newPassword } = body;
"""
content = content.replace(cred_old.strip(), cred_new.strip())

with open('server.ts', 'w', encoding='utf-8') as f:
    f.write(content)

print("Patched req.body in server.ts successfully!")

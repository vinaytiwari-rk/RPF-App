import re

with open('server.ts', 'r', encoding='utf-8') as f:
    content = f.read()

# Fix express payload size
express_regex = re.compile(r'app\.use\(express\.json\(\)\);\napp\.use\(express\.urlencoded\(\{ extended: true \}\)\);')
new_express = """app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));"""

content = express_regex.sub(new_express, content)

with open('server.ts', 'w', encoding='utf-8') as f:
    f.write(content)
print("Patched server.ts 503 limits")

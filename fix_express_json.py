import re

with open('server.ts', 'r', encoding='utf-8') as f:
    content = f.read()

# Remove the incorrectly placed app.use
content = content.replace('app.use(express.json());\n', '')

# Add it right after const app = express();
content = content.replace('const app = express();', 'const app = express();\napp.use(express.json());')

with open('server.ts', 'w', encoding='utf-8') as f:
    f.write(content)

print("Patched server.ts successfully!")

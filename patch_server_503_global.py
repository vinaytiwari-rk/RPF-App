import re

with open('server.ts', 'r', encoding='utf-8') as f:
    content = f.read()

# Add global error handlers before app.listen
global_handlers = """
process.on('uncaughtException', (err) => {
  console.error('CRITICAL: Uncaught Exception:', err);
  // Do not exit the process, just log it
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('CRITICAL: Unhandled Rejection at:', promise, 'reason:', reason);
  // Do not exit the process, just log it
});
"""

# Find app.listen and inject before it
listen_match = re.search(r'app\.listen\(PORT', content)
if listen_match:
    content = content[:listen_match.start()] + global_handlers + '\n  ' + content[listen_match.start():]
    with open('server.ts', 'w', encoding='utf-8') as f:
        f.write(content)
    print("Patched server.ts with global error handlers")
else:
    print("Could not find app.listen")

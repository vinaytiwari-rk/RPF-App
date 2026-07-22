import re

with open('src/components/LoginScreen.tsx', 'r', encoding='utf-8') as f:
    content = f.read()

# Locate the login-multi response
login_multi_regex = re.compile(r'(const response = await axios\.post\(\'/api/auth/login-multi\', \{ identifier, password \}\);\s*if \(response\.data\.success && response\.data\.user\) \{)')

match = login_multi_regex.search(content)
if match:
    new_content = content[:match.end()] + "\n        if (response.data.token) localStorage.setItem(\"@rpf_token\", response.data.token);" + content[match.end():]
    with open('src/components/LoginScreen.tsx', 'w', encoding='utf-8') as f:
        f.write(new_content)
    print("LoginScreen.tsx patched")
else:
    print("Regex match failed")

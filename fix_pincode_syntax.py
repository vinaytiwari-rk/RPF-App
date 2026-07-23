with open('server.ts', 'r', encoding='utf-8') as f:
    content = f.read()

content = content.replace(
    'const response = await axios.get(https://api.postalpincode.in/pincode/, { timeout: 4000 });',
    'const response = await axios.get("https://api.postalpincode.in/pincode/" + pincode, { timeout: 4000 });'
)

with open('server.ts', 'w', encoding='utf-8') as f:
    f.write(content)

print('Pincode endpoint syntax fixed')

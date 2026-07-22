import re

with open('server.ts', 'r', encoding='utf-8') as f:
    content = f.read()

imports = [
    "import { generateRegistrationOptions, verifyRegistrationResponse, generateAuthenticationOptions, verifyAuthenticationResponse } from '@simplewebauthn/server';",
    "import bcrypt from 'bcryptjs';",
    "import type { AuthenticatorTransportFuture } from '@simplewebauthn/server';"
]

for imp in imports:
    content = content.replace(imp + '\n', '')

top_marker = 'import express from "express";'
content = content.replace(top_marker, top_marker + '\n' + '\n'.join(imports))

with open('server.ts', 'w', encoding='utf-8') as f:
    f.write(content)

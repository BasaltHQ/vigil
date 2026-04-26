const fs = require('fs');
const files = [
  'app/api/admin/stats/route.ts',
  'app/api/admin/users/route.ts',
  'app/api/chat/route.ts',
  'app/api/conversations/route.ts',
  'app/api/conversations/[id]/route.ts',
  'app/api/documents/route.ts',
  'app/api/profile/route.ts'
];

for (const file of files) {
  if (!fs.existsSync(file)) continue;
  let content = fs.readFileSync(file, 'utf8');

  // I'll just use a generic replace using split/join to be safe
  const target = `const req = { cookies: { get: async (name: string) => { const cookieStore = await cookies(); const c = cookieStore.get(name); return c ? { value: c.value } : undefined; } } } as any;
    const authResult = await thirdwebAuth.authCookie(req);
    const user = authResult ? { id: authResult.address } : null;`;
    
  const replacement = `const cookieStore = await cookies();
    const token = cookieStore.get('thirdweb_auth_token')?.value;
    let user = null;
    if (token) {
      const { valid, parsedJWT } = await thirdwebAuth.verifyJWT({ jwt: token });
      if (valid && parsedJWT.sub) user = { id: parsedJWT.sub };
    }`;

  if (content.includes("authCookie")) {
     content = content.replace(/const req = \{ cookies:[\s\S]*?const user = authResult \? \{ id: authResult\.address \} : null;/g, replacement);
     fs.writeFileSync(file, content, 'utf8');
     console.log('Fixed ' + file);
  }
}

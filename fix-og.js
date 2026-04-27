const fs = require('fs'); 
const file = 'i:\\Agents\\Varuna\\Vigil\\app\\api\\og\\og-assets.ts'; 
let lines = fs.readFileSync(file, 'utf8').split('\n'); 
let newLines = lines.map(line => { 
    if (line.startsWith('export const BG_BASE64 = data:') || line.startsWith('export const LOGO_BASE64 = data:')) { 
        const parts = line.split(' = '); 
        const b64 = parts[1].trim().replace(/;$/, ''); 
        return parts[0] + ' = "' + b64 + '";'; 
    } 
    return line; 
}); 
fs.writeFileSync(file, newLines.join('\n'));

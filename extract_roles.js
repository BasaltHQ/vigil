const fs = require('fs');
const path = require('path');

const dir = path.join(__dirname, 'lib/agents/instructions');

function walkDir(d) {
  let files = [];
  const entries = fs.readdirSync(d, { withFileTypes: true });
  for (const entry of entries) {
    const fullPath = path.join(d, entry.name);
    if (entry.isDirectory()) {
      files = files.concat(walkDir(fullPath));
    } else if (entry.isFile() && entry.name.endsWith('.md')) {
      files.push(fullPath);
    }
  }
  return files;
}

const mdFiles = walkDir(dir);
const result = {};

for (const file of mdFiles) {
  const content = fs.readFileSync(file, 'utf8');
  const roleMatch = content.match(/# ROLE\s*([\s\S]*?)(?=# EXPERTISE)/);
  if (roleMatch) {
    let roleText = roleMatch[1].trim();
    const roleTitleMatch = roleText.match(/\*\*(.*?)\*\*/);
    const role = roleTitleMatch ? roleTitleMatch[1] : 'Specialist';
    
    // Clean up the description
    let desc = roleText.replace(/You are the \*\*.*?\*\* of the .*? swarm\. You /, '');
    desc = desc.replace(/You are the \*\*.*?\*\* of the .*? swarm\./, '');
    desc = desc.charAt(0).toUpperCase() + desc.slice(1);
    
    const id = path.basename(file, '.md').toLowerCase();
    result[id] = { role, description: desc };
  }
}

console.log(JSON.stringify(result, null, 2));

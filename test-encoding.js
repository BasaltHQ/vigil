
const latex = '\\\\documentclass{article}\\\\usepackage{graphicx}\\\\begin{document}\\\\includegraphics{logo.png}\\\\end{document}';
const b64 = 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAACklEQVR4nGMAAQAABQABDQottAAAAABJRU5ErkJggg==';

async function testCompile(resources) {
  const res = await fetch('https://latex.ytotech.com/builds/sync', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ compiler: 'pdflatex', resources })
  });
  console.log('Status:', res.status, res.statusText);
  if (!res.ok) console.log(await res.text());
}

testCompile([
  { main: true, content: latex },
  { path: 'logo.png', content: b64, file: b64 }
]);


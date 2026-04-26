
const fs = require('fs');
async function testCompile() {
  const latex = String.raw\\\documentclass{article}\\usepackage{graphicx}\\begin{document}\\includegraphics[width=2cm]{logo.png}\\end{document}\;
  const resImage = await fetch('https://basalthq.com/BasaltSurge.png');
  const buffer = Buffer.from(await resImage.arrayBuffer());
  const b64 = buffer.toString('base64');
  
  const res = await fetch('https://latex.ytotech.com/builds/sync', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      compiler: 'pdflatex',
      resources: [
        { main: true, content: latex },
        { path: 'logo.png', file: b64 }
      ]
    })
  });
  console.log('Status (file):', res.status, res.statusText);
  if (!res.ok) console.log(await res.text());

  const res2 = await fetch('https://latex.ytotech.com/builds/sync', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      compiler: 'pdflatex',
      resources: [
        { main: true, content: latex },
        { path: 'logo.png', content: b64 }
      ]
    })
  });
  console.log('Status (content):', res2.status, res2.statusText);
  if (!res2.ok) console.log(await res2.text());
}
testCompile();


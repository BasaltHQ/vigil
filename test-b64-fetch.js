
async function testCompile() {
  const latex = '\\\\documentclass{article}\\\\usepackage{graphicx}\\\\begin{document}\\\\includegraphics[width=2cm]{logo.png}\\\\end{document}';
  const resImage = await fetch('https://basalthq.com/BasaltSurge.png');
  const b64 = Buffer.from(await resImage.arrayBuffer()).toString('base64');
  
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
  console.log('Status:', res.status, res.statusText);
  if (res.ok) console.log('Length:', (await res.arrayBuffer()).byteLength);
  else console.log('Error:', await res.text());
}
testCompile();


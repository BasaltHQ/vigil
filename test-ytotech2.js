async function testCompile() {
  const latex = '\\\\documentclass{article}\\\\usepackage{graphicx}\\\\begin{document}\\\\includegraphics[width=2cm]{logo.png}\\\\end{document}';
  const resImage = await fetch('https://basalthq.com/BasaltSurge.png');
  const buffer = Buffer.from(await resImage.arrayBuffer());
  
  // Test file: base64
  let res = await fetch('https://latex.ytotech.com/builds/sync', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      compiler: 'pdflatex',
      resources: [
        { main: true, content: latex },
        { path: 'logo.png', file: buffer.toString('base64') }
      ]
    })
  });
  console.log('Test 1 (file):', res.status);
  
  // Test content + encoding
  res = await fetch('https://latex.ytotech.com/builds/sync', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      compiler: 'pdflatex',
      resources: [
        { main: true, content: latex },
        { path: 'logo.png', content: buffer.toString('base64'), encoding: 'base64' }
      ]
    })
  });
  console.log('Test 2 (content+encoding):', res.status);

  // Test data URL
  res = await fetch('https://latex.ytotech.com/builds/sync', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      compiler: 'pdflatex',
      resources: [
        { main: true, content: latex },
        { path: 'logo.png', url: 'data:image/png;base64,' + buffer.toString('base64') }
      ]
    })
  });
  console.log('Test 3 (data URL):', res.status);
}
testCompile();

const latex = `
\\documentclass{article}
\\usepackage{graphicx}
\\begin{document}
Hello World!
\\begin{center}
\\includegraphics[width=2cm]{logo.png}
\\end{center}
\\end{document}
`;

async function testCompile() {
  const res = await fetch('https://latex.ytotech.com/builds/sync', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      compiler: 'pdflatex',
      resources: [
        { main: true, content: latex },
        { path: 'logo.png', url: 'https://basalthq.com/BasaltSurge.png' }
      ]
    })
  });
  console.log(res.status, res.statusText);
  if (res.ok) console.log("Success! Got PDF bytes:", (await res.arrayBuffer()).byteLength);
  else console.log(await res.text());
}
testCompile();

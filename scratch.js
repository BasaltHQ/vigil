
const latex = '\\\documentclass{article}\\\usepackage{graphicx}\\\begin{document}\\\includegraphics{logo.png}\\\end{document}';
async function testCompile() {
  const res = await fetch('https://latex.ytotech.com/builds/sync', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      compiler: 'pdflatex',
      resources: [
        { main: true, content: latex },
        { path: 'logo.png', url: 'https://cdn.discordapp.com/attachments/123/456/logo.png' }
      ]
    })
  });
  console.log(res.status, res.statusText);
  if (!res.ok) console.log(await res.text());
}
testCompile();


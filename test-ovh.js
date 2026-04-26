
async function test() {
  const urlPath = 'https://s3.us-west-or.io.cloud.ovh.us/basaltvigil/assets/logo_52630854-3dd5-4b76-823b-e3b79c7dfbcc.png';
  const urlVirtual = 'https://basaltvigil.s3.us-west-or.io.cloud.ovh.us/assets/logo_52630854-3dd5-4b76-823b-e3b79c7dfbcc.png';
  
  const res1 = await fetch(urlPath);
  console.log('Path style status:', res1.status);
  if (!res1.ok) console.log('Path style error:', await res1.text());

  const res2 = await fetch(urlVirtual);
  console.log('Virtual style status:', res2.status);
  if (!res2.ok) console.log('Virtual style error:', await res2.text());
}
test();


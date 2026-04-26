const http = require('http');

http.get('http://localhost:3000/api/conversations/b608ae56-c358-4302-b07d-1b16a76192fd', (resp) => {
  let data = '';
  resp.on('data', (chunk) => { data += chunk; });
  resp.on('end', () => {
    console.log(data);
  });
}).on("error", (err) => {
  console.log("Error: " + err.message);
});

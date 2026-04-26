const http = require('http');

http.get('http://localhost:3000/api/conversations/default_user/recent?limit=3', (resp) => {
  let data = '';
  resp.on('data', (chunk) => { data += chunk; });
  resp.on('end', () => {
    console.log(data);
  });
}).on("error", (err) => {
  console.log("Error: " + err.message);
});

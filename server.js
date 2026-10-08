const http = require('http');
const fs = require('fs');
const path = require('path');

const publicDir = path.join(__dirname, 'public');
const server = http.createServer((req, res) => {
  let file = req.url === '/' ? '/index.html' : req.url;
  file = decodeURIComponent(file.split('?')[0]);
  const safe = path.normalize(file).replace(/^([.][.][\\/])+/, '');
  const full = path.join(publicDir, safe);
  fs.readFile(full, (err, data) => {
    if (err) {
      res.writeHead(404, {'Content-Type':'text/plain'});
      return res.end('Not found');
    }
    const ext = path.extname(full);
    const types = {'.html':'text/html', '.css':'text/css', '.js':'application/javascript', '.json':'application/json'};
    res.writeHead(200, {'Content-Type': types[ext] || 'application/octet-stream'});
    res.end(data);
  });
});
server.listen(process.env.PORT || 3000, '0.0.0.0', () => console.log('Naija Lifestyle running'));

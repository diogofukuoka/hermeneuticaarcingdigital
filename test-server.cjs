const http = require('http');

const options = {
  hostname: 'localhost',
  port: 3000,
  path: '/api/parse',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json'
  }
};

const req = http.request(options, (res) => {
  let data = '';
  res.on('data', (chunk) => {
    data += chunk;
  });
  res.on('end', () => {
    console.log('Status Code:', res.statusCode);
    console.log('Body:', data);
  });
});

req.on('error', (error) => {
  console.error(error);
});

req.write(JSON.stringify({ text: "16 Porque Deus amou o mundo de tal maneira que deu o seu Filho unigênito, para que todo o que nele crê não pereça, mas tenha a vida eterna." }));
req.end();

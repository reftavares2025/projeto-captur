const http = require('http');

async function testarDeployReftavares() {
  console.log("🚀 Testando Ecossistema Captur - GitHub: reftavares2025...\n");

  const postData = JSON.stringify({ message: "Olá Mônica! Teste de homologação do sistema Captur." });
  const req = http.request({
    hostname: 'localhost',
    port: 3001,
    path: '/api/chat/monica',
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Content-Length': Buffer.byteLength(postData)
    }
  }, (res) => {
    let body = '';
    res.on('data', chunk => body += chunk);
    res.on('end', () => {
      console.log("✅ [IA Mônica Test]: OK!");
      console.log("   Resposta:", JSON.parse(body).reply + "\n");
    });
  });

  req.on('error', (err) => console.error("❌ [Erro no Teste]:", err.message));
  req.write(postData);
  req.end();
}

testarDeployReftavares();

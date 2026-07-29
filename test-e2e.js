const http = require('http');

function postJSON(urlPath, data) {
  return new Promise((resolve, reject) => {
    const postData = JSON.stringify(data);
    const req = http.request({
      hostname: '127.0.0.1',
      port: 3001,
      path: urlPath,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(postData)
      }
    }, (res) => {
      let body = '';
      res.on('data', chunk => body += chunk);
      res.on('end', () => {
        try { resolve(JSON.parse(body)); } catch(e) { resolve(body); }
      });
    });
    req.on('error', (err) => reject(err));
    req.write(postData);
    req.end();
  });
}

function getJSON(urlPath) {
  return new Promise((resolve, reject) => {
    http.get({ hostname: '127.0.0.1', port: 3001, path: urlPath }, (res) => {
      let body = '';
      res.on('data', chunk => body += chunk);
      res.on('end', () => {
        try { resolve(JSON.parse(body)); } catch(e) { resolve(body); }
      });
    }).on('error', (err) => reject(err));
  });
}

async function testarEcossistema() {
  console.log("🚀 Iniciando Teste de Homologação da Captur...\n");

  // 1. Testar API Status
  try {
    const resHealth = await getJSON('/health');
    console.log("✅ [Backend Test]: Conexão OK!", resHealth.service || resHealth);
  } catch (e) {
    console.error("❌ [Backend Test]: Falhou", e.message);
  }

  // 2. Testar Mônica IA (Llama 3.1 8B Instant)
  try {
    const resAi = await postJSON('/api/chat/monica', {
      message: "Olá Mônica! Quais são os documentos necessários para viagem internacional?"
    });
    console.log("✅ [IA Mônica Test]: OK!");
    console.log("   Resposta:", resAi.reply ? resAi.reply.substring(0, 120) + "..." : resAi);
  } catch (e) {
    console.error("❌ [IA Mônica Test]: Falhou", e.message);
  }
}

testarEcossistema();

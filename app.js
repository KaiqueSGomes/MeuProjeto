require('dotenv').config();
const express = require('express');
const cors = require('cors');
const pool = require('./dataBase/db')

const app = express();
const port = process.env.PORT || 3000;


app.use(express.static('public'));
app.use(cors());
app.use(express.json());




// Rota para buscar perguntas e respostas
app.get('/perguntas', async (req, res) => {
  const sql = `
    SELECT p.id AS pergunta_id, p.enunciado, p.tempo_resposta,
    r.id AS resposta_id, r.resposta, r.correta
      FROM perguntas p
      JOIN respostas r ON p.id = r.pergunta_id;
  `;

  try {
    const [results] = await pool.query(sql);

    const perguntasMap = {};
    results.forEach(row => {
      const id = row.pergunta_id;

      if (!perguntasMap[id]) {
        perguntasMap[id] = {
          pergunta: row.pergunta,
          tempo_resposta: row.tempo_resposta,
          respostas: []
        };
      }

      perguntasMap[id].respostas.push({
        texto: row.texto,
        correta: row.correta === 1
      });
    });

    const perguntas = Object.values(perguntasMap);
    res.json(perguntas);

  } catch (err) {
    console.error("Erro ao buscar perguntas:", err);
    res.status(500).json({ error: "Erro no banco de dados" });
  }
});





app.listen(port, () => {
  console.log(`Servidor rodando em http://localhost:${port}`)
  console.log(`Vai corinthians!!!`);
});

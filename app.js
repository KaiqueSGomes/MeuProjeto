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
  try {
    const [rows] = await pool.query(`
      SELECT 
        p.id AS pergunta_id,
        p.enunciado AS pergunta,
        r.id AS resposta_id,
        r.resposta,
        r.correta
      FROM perguntas p
      JOIN respostas r ON r.pergunta_id = p.id
    `);

    // Agrupar as respostas por pergunta
    const perguntasMap = {};
    rows.forEach(row => {
      if (!perguntasMap[row.pergunta_id]) {
        perguntasMap[row.pergunta_id] = {
          id: row.pergunta_id,
          pergunta: row.pergunta,
          respostas: []
        };
      }

      perguntasMap[row.pergunta_id].respostas.push({
        id: row.resposta_id,
        texto: row.resposta,
        correta: row.correta
      });
    });

    const perguntas = Object.values(perguntasMap);
    res.json(perguntas);
  } catch (error) {
    console.error('Erro ao buscar perguntas:', error);
    res.status(500).json({ error: 'Erro ao buscar perguntas' });
  }
});

app.listen(port, () => {
  console.log(`Servidor rodando em http://localhost:${port}`)
  console.log(`Vai corinthians!!!`);
});

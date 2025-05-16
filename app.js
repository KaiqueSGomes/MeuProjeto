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
    const [perguntas] = await pool.query('SELECT * FROM perguntas');

    const perguntasComRespostas = await Promise.all(perguntas.map(async (p) => {
      const [respostas] = await pool.query('SELECT * FROM respostas WHERE pergunta_id = ?', [p.id]);
      return {
        id: p.id,
        pergunta: p.enunciado,
        tempo_resposta: p.tempo_resposta,
        respostas: respostas.map(r => ({
          texto: r.resposta,
          correta: r.correta === 1
        }))
      };
    }));

    res.json(perguntasComRespostas);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Erro ao buscar perguntas' });
  }
});








app.listen(port, () => {
  console.log(`Servidor rodando em http://localhost:${port}`)
  console.log(`Vai corinthians!!!`);
});

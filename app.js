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
    // Pega todos os temas
    const [temas] = await pool.query('SELECT id FROM temas');

    const perguntas = [];

    for (const tema of temas) {
      // Busca 2 perguntas aleatórias desse tema
      const [perguntasTema] = await pool.query(`
        SELECT 
          p.id AS pergunta_id,
          p.enunciado AS pergunta,
          p.tempo_resposta,
          r.id AS resposta_id,
          r.resposta,
          r.correta
        FROM perguntas p
        JOIN respostas r ON r.pergunta_id = p.id
        WHERE p.tema_id = ?
        ORDER BY RAND()
        LIMIT 8 -- 2 perguntas * 4 alternativas cada
      `, [tema.id]);

      // Agrupa por pergunta
      const perguntasMap = {};
      perguntasTema.forEach(row => {
        if (!perguntasMap[row.pergunta_id]) {
          perguntasMap[row.pergunta_id] = {
            id: row.pergunta_id,
            pergunta: row.pergunta,
            tempo_resposta: row.tempo_resposta,
            respostas: []
          };
        }

        perguntasMap[row.pergunta_id].respostas.push({
          id: row.resposta_id,
          texto: row.resposta,
          correta: row.correta
        });
      });

      perguntas.push(...Object.values(perguntasMap).slice(0, 2)); // garante só 2 por tema
    }

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

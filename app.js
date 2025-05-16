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
        p.tempo_resposta,
        p.tema,
        r.id AS resposta_id,
        r.resposta,
        r.correta
      FROM perguntas p
      JOIN respostas r ON r.pergunta_id = p.id
    `);

    const perguntasMap = new Map();

    rows.forEach(row => {
      if (!perguntasMap.has(row.pergunta_id)) {
        perguntasMap.set(row.pergunta_id, {
          id: row.pergunta_id,
          pergunta: row.pergunta,
          tempo_resposta: row.tempo_resposta,
          tema: row.tema,
          respostas: []
        });
      }
      perguntasMap.get(row.pergunta_id).respostas.push({
        id: row.resposta_id,
        texto: row.resposta,
        correta: !!row.correta
      });
    });

    // Filtra apenas perguntas que tenham exatamente 4 respostas
    const perguntasValidas = Array.from(perguntasMap.values()).filter(p => p.respostas.length === 4);

    // Agrupa por tema
    const temasMap = {};
    perguntasValidas.forEach(pergunta => {
      if (!temasMap[pergunta.tema]) temasMap[pergunta.tema] = [];
      temasMap[pergunta.tema].push(pergunta);
    });

    // Função para embaralhar array
    function shuffleArray(array) {
      for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
      }
    }

    // Seleciona 2 perguntas de cada tema embaralhado
    const perguntasSelecionadas = [];
    for (const tema in temasMap) {
      shuffleArray(temasMap[tema]);
      perguntasSelecionadas.push(...temasMap[tema].slice(0, 2));
    }

    shuffleArray(perguntasSelecionadas);

    res.json(perguntasSelecionadas);

  } catch (error) {
    console.error('Erro ao buscar perguntas:', error);
    res.status(500).json({ error: 'Erro ao buscar perguntas' });
  }
});





app.listen(port, () => {
  console.log(`Servidor rodando em http://localhost:${port}`)
  console.log(`Vai corinthians!!!`);
});

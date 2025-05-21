require('dotenv').config();
const express = require('express');
const cors = require('cors');
const pool = require('./dataBase/db')
const bodyParser = require('body-parser');

const app = express();
const port = process.env.PORT || 3000;


app.use(express.static('public'));
app.use(cors());
app.use(express.json());

// Rota para fazer o post dos dados do usuário
app.post('/cadastro', (req, res) => {
  const { nome, email } = req.body;

  const sql = 'INSERT INTO jogadores (nome, email) VALUES (?, ?)';
  conexao.query(sql, [nome, email], (erro, resultado) => {
    if (erro) {
      console.error('Erro ao cadastrar usuário:', erro);
      return res.status(500).send('Erro ao cadastrar');
    }

    res.send('Usuário cadastrado com sucesso!');
  });
});




// Rota para buscar perguntas e respostas
app.get('/perguntas', async (req, res) => {
  try {
    const temas = [1, 2, 3, 4, 5];
    let perguntasComRespostas = [];

    for (const temaId of temas) {
      // Busca 2 perguntas aleatórias do tema
      const [perguntas] = await pool.query(
        'SELECT * FROM perguntas WHERE tema_id = ? ORDER BY RAND() LIMIT 2',
        [temaId]
      );

      for (const p of perguntas) {
        // Busca respostas para cada pergunta
        const [respostas] = await pool.query(
          'SELECT * FROM respostas WHERE pergunta_id = ?',
          [p.id]
        );

        perguntasComRespostas.push({
          id: p.id,
          pergunta: p.enunciado,
          tempo_resposta: p.tempo_resposta,
          respostas: respostas.map(r => ({
            texto: r.resposta,
            correta: r.correta === 1,
          }))
        });
      }
    }

    res.json(perguntasComRespostas);
  } catch (error) {
    console.error(error);
    res.status(500).json({ erro: 'Erro ao buscar perguntas' });
  }
});

app.get('/turmas', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT id, turma, sala FROM turmas ORDER BY turma, sala');
    res.json(rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ erro: 'Erro ao buscar turmas' });
  }
});


app.listen(port, () => {
  console.log(`Servidor rodando em http://localhost:${port}`)
  console.log(`Vai corinthians!!!`);
});

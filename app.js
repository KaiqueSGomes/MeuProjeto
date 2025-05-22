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
app.post('/cadastro', async (req, res) => {
  const { nome, email, turma_id, tipo_usuario } = req.body;

  if (!nome || !email || !turma_id || !tipo_usuario) {
    return res.status(400).send('Dados incompletos');
  }

  try {
    const [result] = await pool.query(
      'INSERT INTO jogadores (nome, email, turma_id, tipo_usuario) VALUES (?, ?, ?, ?)',
      [nome, email, turma_id, tipo_usuario]
    );
    const jogador_id = result.insertId;
    res.json({ mensagem: 'Usuário cadastrado com sucesso!', jogador_id });
  } catch (erro) {
    console.error('Erro ao cadastrar usuário:', erro);
    res.status(500).send('Erro ao cadastrar');
  }
});



// Rota para buscar perguntas e respostas
app.get('/perguntas', async (req, res) => {
  try {
    const temas = [1, 2, 3, 4, 5];
    const niveis = [1, 2, 3];
    let perguntasComRespostas = [];

    for (const nivelId of niveis) {
      for (const temaId of temas) {
        // 2 perguntas aleatórias por nível e tema
        const [perguntas] = await pool.query(
          'SELECT * FROM perguntas WHERE nivel_id = ? AND tema_id = ? ORDER BY RAND() LIMIT 2',
          [nivelId, temaId]
        );

        for (const p of perguntas) {
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
    }

    res.json(perguntasComRespostas);
  } catch (error) {
    console.error(error);
    res.status(500).json({ erro: 'Erro ao buscar perguntas' });
  }
});

// POST /ranking
app.post('/ranking', async (req, res) => {
  const { jogador_id, pontuacao } = req.body;

  if (!jogador_id || pontuacao === undefined) {
    return res.status(400).json({ erro: 'Dados incompletos' });
  }

  try {
    await pool.query(
      'INSERT INTO ranking (jogador_id, pontuacao) VALUES (?, ?)',
      [jogador_id, pontuacao]
    );
    res.status(201).json({ mensagem: 'Pontuação registrada com sucesso' });
  } catch (error) {
    console.error('Erro ao inserir ranking:', error);
    res.status(500).json({ erro: 'Erro interno ao registrar pontuação' });
  }
});


// GET /ranking
app.get('/ranking', async (req, res) => {
  try {
    const [result] = await pool.query(`
      SELECT jogadores.nome, ranking.pontuacao
      FROM ranking
      JOIN jogadores ON ranking.jogador_id = jogadores.id
      ORDER BY ranking.pontuacao DESC
      LIMIT 10
    `);

    res.json(result);
  } catch (error) {
    console.error('Erro ao buscar ranking:', error);
    res.status(500).json({ erro: 'Erro ao buscar ranking' });
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

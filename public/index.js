let questions = [];
let currentQuestionIndex = 0;
let pontuacao = 0;
let acertos = 0;
let erros = 0;
let timer;
let jogador_id_global;


const baseURL = location.hostname.includes('localhost') 
  ? 'http://localhost:3000'
  : 'https://meuprojeto-production-2b4a.up.railway.app';

// Embaralha um array
function shuffleArray(array) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
}

// Vai para a tela de turma
// goToTurma() atualizado:
async function goToTurma() {
  const nome = document.getElementById('nickname').value.trim();
  const email = document.getElementById('email').value.trim();

  if (!nome) return alert("Digite seu nome!");
  if (!email) return alert("Digite seu email!");

  // Só avança a tela, sem enviar nada ainda
  document.getElementById('name-screen').classList.add('hidden');
  document.getElementById('turma-screen').classList.remove('hidden');
}


// Inicia o quiz
function startQuiz() {
  const nome = document.getElementById('nickname').value.trim();
  const email = document.getElementById('email').value.trim();
  const turma = document.getElementById('curso').value;
  const tipoUsuario = document.querySelector('input[name="tipo_usuario"]:checked');

  if (!nome) return alert("Digite seu nome!");
  if (!email) return alert("Digite seu email!");
  if (!turma) return alert("Escolha sua turma!");
  if (!tipoUsuario) return alert("Selecione se você é aluno ou colaborador!"); 
  if (tipoUsuario.value === 'colaborador' && turma !== '12') {
    alert("Colaboradores só podem escolher a turma 'Nenhuma'.");
    return;
  }

  const cadastroData = {
    nome,
    email,
    turma_id: turma,
    tipo_usuario: tipoUsuario.value
  };

  fetch(`${baseURL}/cadastro`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(cadastroData)
  })
  .then(res => res.json())
  .then(data => {
    alert(data.mensagem);
    jogador_id_global = data.jogador_id;
    document.getElementById('turma-screen').classList.add('hidden');
    document.getElementById('quiz-screen').classList.remove('hidden');
    fetchQuestions();
  })
  .catch(err => alert(err.message));
}





// Busca as perguntas da API
function fetchQuestions() {
  fetch(`${baseURL}/perguntas`)
    .then(res => res.json())
    .then(data => {
      questions = data;
      showQuestion();
    })
    .catch(err => console.error('Erro ao buscar perguntas:', err));
}

// Mostra a pergunta atual
function showQuestion() {
  clearTimeout(timer);

  const question = questions[currentQuestionIndex];
  document.getElementById('question-title').textContent = question.pergunta;

  const optionsDiv = document.getElementById('options');
  optionsDiv.innerHTML = '';

  // Embaralha respostas
  shuffleArray(question.respostas);

  // Garante 4 respostas
  question.respostas.forEach(resposta => {
    const btn = document.createElement('button');
    btn.textContent = resposta.texto;
    btn.classList.add('answer-btn');
    btn.onclick = () => handleAnswer(resposta);
    optionsDiv.appendChild(btn);
  });

  document.getElementById('next-btn').classList.add('hidden');
  document.querySelectorAll('.answer-btn').forEach(btn => btn.disabled = false);

  // Barra de progresso e timer
  const progressBar = document.getElementById('progress');
  progressBar.style.animation = 'none';
  progressBar.offsetHeight;
  progressBar.style.animation = `countdown ${question.tempo_resposta}s linear forwards`;

  timer = setTimeout(() => {
    alert("⏰ Tempo esgotado!");
    erros++;
    pontuacao = Math.max(0, pontuacao - 1);
    currentQuestionIndex++;
    if (currentQuestionIndex < questions.length) {
      showQuestion();
    } else {
      showResults();
    }
  }, question.tempo_resposta * 1000);
}



// Trata a resposta do usuário
function handleAnswer(resposta) {
  clearTimeout(timer);

  const progressBar = document.getElementById('progress');
  progressBar.style.animation = 'none';

  if (resposta.correta) {
    
    pontuacao++;
    acertos++;
  } else {
   
    erros++;
  }

  document.querySelectorAll('.answer-btn').forEach(btn => btn.disabled = true);
  document.getElementById('next-btn').classList.remove('hidden');
}

// Avança para a próxima pergunta ou mostra o resultado final
function nextQuestion() {
  currentQuestionIndex++;
  if (currentQuestionIndex < questions.length) {
    showQuestion();
  } else {
    showResults();
  }
}

// Mostra a tela de resultados
function showResults() {
  document.getElementById('quiz-screen').classList.add('hidden');
  document.getElementById('result-screen').classList.remove('hidden');

  document.getElementById('final-score').innerHTML = `
    Pontuação: <span class="highlight">${pontuacao}</span><br>
    Acertos: <span class="highlight">${acertos}</span> | 
    Erros: <span class="highlight">${erros}</span>
  `
  document.getElementById('btn-show-ranking').onclick = () => {
    showRanking(jogador_id_global, pontuacao);
  };
  ;
}

async function showRanking(jogador_id_global, pontuacao) {
  try {
    // Envia a pontuação (POST)
    const response = await fetch(`${baseURL}/ranking`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        jogador_id: jogador_id_global,
        pontuacao: pontuacao
      })
    });

    if (!response.ok) {
      throw new Error(`Erro ao enviar ranking! status: ${response.status}`);
    }

    // Depois busca o ranking atualizado (GET)
    const res = await fetch(`${baseURL}/ranking`);
    const data = await res.json();

    const rankingBox = document.getElementById('ranking-score');
    rankingBox.innerHTML = '';

    if (data.length === 0) {
      rankingBox.innerHTML = '<p>Nenhum jogador no ranking ainda.</p>';
    } else {
      const list = document.createElement('ol');
      data.forEach((jogador) => {
        const item = document.createElement('li');
        item.textContent = `${jogador.nome} - ${jogador.pontuacao} pontos`;
        list.appendChild(item);
      });
      rankingBox.appendChild(list);
    }

    // Exibe a tela de ranking
    document.getElementById('result-screen').classList.add('hidden');
    document.getElementById('ranking-screen').classList.remove('hidden');

  } catch (error) {
    console.error('Erro na função showRanking:', error);
    alert('Erro ao processar o ranking.');
  }
}


function resetQuiz() {
  currentQuestionIndex = 0;
  pontuacao = 0;
  acertos = 0;
  erros = 0;

  document.getElementById('result-screen').classList.add('hidden');
  document.getElementById('ranking-screen').classList.add('hidden');
  document.getElementById('name-screen').classList.remove('hidden');
}


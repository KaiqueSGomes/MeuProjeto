let questions = [];
let currentQuestionIndex = 0;
let pontos = 0;
let acertos = 0;
let erros = 0;
let timer;

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
function goToTurma() {
  const nome = document.getElementById('nickname').value.trim();
  const email = document.getElementById('email').value.trim();

  if (!nome) return alert("Digite seu nome!");
  if (!email) return alert("Digite seu email!");

  document.getElementById('name-screen').classList.add('hidden');
  document.getElementById('turma-screen').classList.remove('hidden');
}

// Inicia o quiz
function startQuiz() {
  const turma = document.getElementById('curso').value;
  const tipoUsuario = document.querySelector('input[name="tipo_usuario"]:checked');

  if (!turma) return alert("Escolha sua turma!");
  if (!tipoUsuario) return alert("Selecione se você é aluno ou colaborador!");

  const usuario = {
    turma,
    tipo: tipoUsuario.value
  };

  console.log("Usuário:", usuario);

  document.getElementById('turma-screen').classList.add('hidden');
  document.getElementById('quiz-screen').classList.remove('hidden');
  fetchQuestions();
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
    pontos = Math.max(0, pontos - 1);
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
    alert("✅ Resposta correta!");
    pontos++;
    acertos++;
  } else {
    alert("❌ Resposta errada!");
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
    Pontuação: <span class="highlight">${pontos}</span><br>
    Acertos: <span class="highlight">${acertos}</span> | 
    Erros: <span class="highlight">${erros}</span>
  `;
}

// Reseta o quiz
function resetQuiz() {
  currentQuestionIndex = 0;
  pontos = 0;
  acertos = 0;
  erros = 0;

  document.getElementById('result-screen').classList.add('hidden');
  document.getElementById('name-screen').classList.remove('hidden');
}

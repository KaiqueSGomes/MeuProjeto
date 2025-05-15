let questions = [];
let currentQuestionIndex = 0;
let pontos = 0;
let acertos = 0;
let erros = 0;
let timer;

const baseURL = location.hostname.includes('localhost') 
  ? 'http://localhost:3000'
  : 'https://meuprojeto-production-2b4a.up.railway.app';

// Função para embaralhar um array de forma aleatória
function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]]; // Troca os elementos
    }
}

function startQuiz() {
    const nome = document.getElementById('nickname').value.trim();
    if (!nome) return alert("Digite seu nome!");

    document.getElementById('start-screen').classList.add('hidden');
    document.getElementById('quiz-screen').classList.remove('hidden');
    fetchQuestions();
}

function fetchQuestions() {
fetch(`${baseURL}/perguntas`)
  .then(res => res.json())
  .then(data => {
    questions = data;
    showQuestion();
  })
  .catch(err => console.error('Erro ao buscar perguntas:', err));
}






function showQuestion() {
    clearTimeout(timer); // Limpa o timer anterior

    const question = questions[currentQuestionIndex];
    document.getElementById('question-title').textContent = question.pergunta;

    const optionsDiv = document.getElementById('options');
    optionsDiv.innerHTML = ''; // Limpa opções anteriores

    // Embaralha as respostas antes de exibi-las
    shuffleArray(question.respostas);

    question.respostas.forEach(resposta => {
        const btn = document.createElement('button');
        btn.textContent = resposta.texto;
        btn.classList.add('answer-btn');
        btn.onclick = () => handleAnswer(resposta);
        optionsDiv.appendChild(btn);
    });

    // Oculta o botão "Próxima" até que o jogador tenha respondido
    document.getElementById('next-btn').classList.add('hidden');
    document.querySelectorAll('.answer-btn').forEach(btn => btn.disabled = false);

    // Reinicia a animação da barra de progresso
    const progressBar = document.getElementById('progress');
    progressBar.style.animation = 'none';
    progressBar.offsetHeight; // Força reflow da barra de progresso
    progressBar.style.animation = 'countdown 10s linear forwards'; // Reinicia a animação

    // Inicia o timer de 10 segundos para a pergunta
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
    }, 10000);
}

function handleAnswer(resposta) {
    clearTimeout(timer); // Cancela o tempo restante

    // Remove a barra de progresso ao responder
    const progressBar = document.getElementById('progress');
    progressBar.style.animation = 'none';

    if (resposta.correta) {
        alert("✅ Resposta correta!");
        pontos++;
        acertos++;
    } else {
        alert("❌ Resposta errada!");
        pontos = Math.max(0, pontos - 1);
        erros++;
    }

    // Desabilita os botões de resposta após uma escolha
    document.querySelectorAll('.answer-btn').forEach(btn => btn.disabled = true);
    document.getElementById('next-btn').classList.remove('hidden');
}

function nextQuestion() {
    currentQuestionIndex++;
    if (currentQuestionIndex < questions.length) {
        showQuestion();
    } else {
        showResults();
    }
}

function showResults() {
    document.getElementById('quiz-screen').classList.add('hidden');
    document.getElementById('result-screen').classList.remove('hidden');

    document.getElementById('final-score').innerHTML = `
        Pontuação: <span class="highlight">${pontos}</span><br>
        Acertos: <span class="highlight">${acertos}</span> | 
        Erros: <span class="highlight">${erros}</span>
    `;
}

function resetQuiz() {
    currentQuestionIndex = 0;
    pontos = 0;
    acertos = 0;
    erros = 0;

    document.getElementById('result-screen').classList.add('hidden');
    document.getElementById('start-screen').classList.remove('hidden');
}

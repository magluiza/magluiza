// ========================================
// CONFIGURAÇÕES DO QUIZ
// ========================================

// EDITE AQUI O LINK DO DESCONTO
const LINK_DESCONTO = "COLOQUE_SEU_LINK_AQUI";

// TEMPO DA RECOMPENSA (em segundos - 10 minutos)
const TEMPO_RECOMPENSA = 10 * 60;

// BANCO DE PERGUNTAS DA COZINHA (6 Perguntas)
const QUESTIONS = [
    {
        question: "Qual desses utensílios é mais utilizado para frituras com pouco ou nenhum óleo?",
        options: ["Air Fryer", "Liquidificador", "Batedeira", "Espremedor"]
    },
    {
        question: "Qual técnica culinária consiste em cozinhar um alimento mergulhado em água fervente por pouco tempo e logo em seguida esfriá-lo em água gelada?",
        options: ["Refogar", "Blanquear (ou Branquear)", "Grelhar", "Flambar"]
    },
    {
        question: "Qual eletrodoméstico é ideal para triturar sucos, vitaminas e molhos rapidamente?",
        options: ["Torradeira", "Micro-ondas", "Liquidificador", "Cafeteira"]
    },
    {
        question: "Qual destes ingredientes é o principal agente fermentador biológico usado na fabricação de pães caseiros?",
        options: ["Fermento Biológico", "Bicarbonato de Sódio", "Amido de Milho", "Vinagre"]
    },
    {
        question: "Qual é o material recomendado para tábuas de corte a fim de evitar o desgaste excessivo do fio da faca?",
        options: ["Vidro", "Madeira ou Polietileno", "Mármore", "Aço Inoxidável"]
    },
    {
        question: "Para evitar contaminação cruzada na cozinha, o que NUNCA deve ser feito?",
        options: ["Lavar as mãos antes de cozinhar", "Usar a mesma tábua para carne crua e vegetais sem lavar", "Guardar alimentos tampados na geladeira", "Higienizar as bancadas"]
    }
];

// CHAVES DE ARMAZENAMENTO NO LOCALSTORAGE
const STORAGE_KEY_START_TIME = "ma_quiz_reward_start_time";
const STORAGE_KEY_STATUS = "ma_quiz_status";

// ESTADO DA APLICAÇÃO
let currentQuestionIndex = 0;
let timerInterval = null;

// ELEMENTOS DO DOM
const screens = {
    start: document.getElementById("screen-start"),
    quiz: document.getElementById("screen-quiz"),
    loading: document.getElementById("screen-loading"),
    reward: document.getElementById("screen-reward"),
    expired: document.getElementById("screen-expired")
};

const btnStart = document.getElementById("btn-start");
const btnClaim = document.getElementById("btn-claim");
const btnRestart = document.getElementById("btn-restart");

const progressText = document.getElementById("progress-text");
const progressPercentage = document.getElementById("progress-percentage");
const progressBarFill = document.getElementById("progress-bar-fill");

const questionCard = document.getElementById("question-card");
const questionTitle = document.getElementById("question-title");
const optionsContainer = document.getElementById("options-container");
const loadingText = document.getElementById("loading-text");
const timerDisplay = document.getElementById("timer-display");

// ========================================
// INICIALIZAÇÃO E NAVEGAÇÃO DE TELAS
// ========================================

document.addEventListener("DOMContentLoaded", () => {
    checkExistingSession();
    initEvents();
});

function initEvents() {
    btnStart.addEventListener("click", startQuiz);
    btnClaim.addEventListener("click", handleClaimDiscount);
    btnRestart.addEventListener("click", resetQuiz);
}

function showScreen(screenKey) {
    Object.keys(screens).forEach(key => {
        screens[key].classList.remove("active");
    });
    screens[screenKey].classList.add("active");
}

function checkExistingSession() {
    const status = localStorage.getItem(STORAGE_KEY_STATUS);
    
    if (status === "reward_active") {
        const startTime = parseInt(localStorage.getItem(STORAGE_KEY_START_TIME), 10);
        if (startTime) {
            const now = Math.floor(Date.now() / 1000);
            const elapsedTime = now - startTime;
            const remainingTime = TEMPO_RECOMPENSA - elapsedTime;

            if (remainingTime > 0) {
                showScreen("reward");
                startTimer(remainingTime);
            } else {
                handleExpiration();
            }
        } else {
            resetQuiz();
        }
    } else if (status === "expired") {
        showScreen("expired");
    } else {
        showScreen("start");
    }
}

// ========================================
// FLUXO DO QUIZ
// ========================================

function startQuiz() {
    currentQuestionIndex = 0;
    showScreen("quiz");
    renderQuestion();
}

function renderQuestion() {
    const q = QUESTIONS[currentQuestionIndex];
    const total = QUESTIONS.length;
    const currentNum = currentQuestionIndex + 1;
    
    // Atualiza progresso
    const percentageVal = (currentNum / total) * 100;
    const percentageFormatted = percentageVal % 1 === 0 ? percentageVal.toFixed(0) : percentageVal.toFixed(1);
    
    progressText.textContent = `Pergunta ${currentNum} de ${total}`;
    progressPercentage.textContent = `${percentageFormatted}%`;
    progressBarFill.style.width = `${percentageVal}%`;

    // Preenche a pergunta
    questionTitle.textContent = q.question;
    optionsContainer.innerHTML = "";

    // Criar alternativas
    q.options.forEach((optionText, index) => {
        const button = document.createElement("button");
        button.className = "option-btn";
        button.innerHTML = `<span>${optionText}</span>`;
        button.addEventListener("click", () => handleSelectOption(button));
        optionsContainer.appendChild(button);
    });
}

function handleSelectOption(selectedBtn) {
    // Desabilita todas as opções para evitar múltiplos cliques
    const allOptions = optionsContainer.querySelectorAll(".option-btn");
    allOptions.forEach(btn => btn.disabled = true);

    // Destaca a opção selecionada
    selectedBtn.classList.add("selected");

    // Aguarda animação visual antes de avançar
    setTimeout(() => {
        // Transição de saída
        questionCard.classList.add("slide-out");

        setTimeout(() => {
            currentQuestionIndex++;
            questionCard.classList.remove("slide-out");

            if (currentQuestionIndex < QUESTIONS.length) {
                renderQuestion();
                questionCard.classList.add("slide-in");
                setTimeout(() => questionCard.classList.remove("slide-in"), 300);
            } else {
                startCompletionAnimation();
            }
        }, 300);

    }, 1000); // Feedback visual de 1s
}

// ========================================
// ANIMAÇÃO DE CONCLUSÃO E RECOMPENSA
// ========================================

function startCompletionAnimation() {
    showScreen("loading");
    loadingText.textContent = "Analisando suas respostas...";

    setTimeout(() => {
        loadingText.textContent = "Tudo pronto! 🎉";
        
        setTimeout(() => {
            activateReward();
        }, 800);
    }, 1200);
}

function activateReward() {
    const now = Math.floor(Date.now() / 1000);
    localStorage.setItem(STORAGE_KEY_START_TIME, now.toString());
    localStorage.setItem(STORAGE_KEY_STATUS, "reward_active");

    showScreen("reward");
    startTimer(TEMPO_RECOMPENSA);
}

// ========================================
// CRONÔMETRO E EXPIRAÇÃO
// ========================================

function startTimer(secondsLeft) {
    clearInterval(timerInterval);
    updateTimerDisplay(secondsLeft);

    timerInterval = setInterval(() => {
        secondsLeft--;
        
        if (secondsLeft <= 0) {
            clearInterval(timerInterval);
            handleExpiration();
        } else {
            updateTimerDisplay(secondsLeft);
        }
    }, 1000);
}

function updateTimerDisplay(totalSeconds) {
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    
    const formattedMin = String(minutes).padStart(2, "0");
    const formattedSec = String(seconds).padStart(2, "0");
    
    timerDisplay.textContent = `${formattedMin}:${formattedSec}`;
}

function handleExpiration() {
    clearInterval(timerInterval);
    localStorage.setItem(STORAGE_KEY_STATUS, "expired");
    showScreen("expired");
}

function resetQuiz() {
    clearInterval(timerInterval);
    localStorage.removeItem(STORAGE_KEY_START_TIME);
    localStorage.removeItem(STORAGE_KEY_STATUS);
    currentQuestionIndex = 0;
    showScreen("start");
}

// ========================================
// AÇÃO DO BOTÃO DE RECOMPENSA
// ========================================

function handleClaimDiscount() {
    if (LINK_DESCONTO && LINK_DESCONTO !== "COLOQUE_SEU_LINK_AQUI") {
        window.open(LINK_DESCONTO, "_blank");
    } else {
        alert("Por favor, configure a variável LINK_DESCONTO no arquivo script.js.");
    }
}
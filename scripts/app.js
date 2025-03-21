let currentQuestion = 0;
let score = 0;
let timer;
const TIME_LIMIT = 10;

function startQuiz(subject) {
    localStorage.setItem('currentSubject', subject);
    window.location.href = 'quiz.html';
}

function loadQuiz() {
    const subject = localStorage.getItem('currentSubject');
    if (!subject) {
        console.error('No subject found in localStorage');
        return;
    }

    document.getElementById('subject-title').textContent = subject + ' Quiz';
    
    fetch(`data/${subject}.json`)
        .then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            return response.json();
        })
        .then(questions => {
            if (!questions || questions.length === 0) {
                throw new Error('No questions found');
            }
            startTimer();
            showQuestion(questions);
        })
        .catch(error => {
            console.error('Error fetching questions:', error);
            alert('Failed to load questions. Please try again.');
        });
}

function showQuestion(questions) {
    if (currentQuestion >= questions.length) {
        localStorage.setItem('score', score);
        window.location.href = 'quiz-result.html';
        return;
    }

    const question = questions[currentQuestion];
    document.getElementById('question').textContent = question.question;
    
    const optionsDiv = document.getElementById('options');
    optionsDiv.innerHTML = '';
    
    question.options.forEach(option => {
        const button = document.createElement('button');
        button.textContent = option;
        button.onclick = () => checkAnswer(option, question.answer, questions);
        optionsDiv.appendChild(button);
    });
}

function checkAnswer(selected, correct, questions) {
    if (selected === correct) score++;
    currentQuestion++;
    showQuestion(questions);
}

function startTimer() {
    let timeLeft = TIME_LIMIT;
    document.getElementById('time').textContent = timeLeft;

    timer = setInterval(() => {
        timeLeft--;
        document.getElementById('time').textContent = timeLeft;
        
        if (timeLeft <= 0) {
            clearInterval(timer);
            currentQuestion++;
            loadQuiz();
        }
    }, 1000);
}

// Result Screen
window.onload = function() {
    if (window.location.pathname.endsWith('result.html')) {
        const score = localStorage.getItem('score');
        document.getElementById('score').textContent = `Your Score: ${score}`;
    } else if (window.location.pathname.endsWith('quiz.html')) {
        loadQuiz();
    }
};

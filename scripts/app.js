let currentQuestion = 0;
let score = 0;
let timer;
const TIME_LIMIT = 10; // Time limit for each question
let questions = []; // Store the selected random questions

// Map subject names to display names
const subjectDisplayNames = {
    history: "इतिहास",
    science: "विज्ञान",
    geography: "भूगोल",
    intorg: "अन्तर्राष्ट्रिय संघ संस्था",
    iq: "आईक्यू"
};

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

    // Set the custom subject name in the heading
    const displayName = subjectDisplayNames[subject] || subject;
    document.getElementById('subject-title').textContent = displayName + ' Quiz';
    
    fetch(`data/${subject}.json`)
        .then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            return response.json();
        })
        .then(allQuestions => {
            if (!allQuestions || allQuestions.length === 0) {
                throw new Error('No questions found');
            }

            // Select 10 random questions
            questions = getRandomQuestions(allQuestions, 10);
            startTimer(); // Start the timer for the first question
            showQuestion(questions);
        })
        .catch(error => {
            console.error('Error fetching questions:', error);
            alert('Failed to load questions. Please try again.');
        });
}

function getRandomQuestions(allQuestions, count) {
    // Shuffle the array and pick the first `count` questions
    const shuffled = allQuestions.sort(() => 0.5 - Math.random());
    return shuffled.slice(0, count);
}

function showQuestion(questions) {
    if (currentQuestion >= questions.length) {
        clearInterval(timer); // Stop the timer
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
    clearInterval(timer); // Stop the current timer
    if (selected === correct) score++;
    currentQuestion++;
    startTimer(); // Start the timer for the next question
    showQuestion(questions);
}

function startTimer() {
    let timeLeft = TIME_LIMIT;
    document.getElementById('time').textContent = timeLeft;

    timer = setInterval(() => {
        timeLeft--;
        document.getElementById('time').textContent = timeLeft;
        
        if (timeLeft <= 0) {
            clearInterval(timer); // Stop the timer
            currentQuestion++; // Move to the next question
            startTimer(); // Start the timer for the next question
            showQuestion(questions);
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

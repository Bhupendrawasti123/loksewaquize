// Quiz Variables
let currentQuestion = 0;
let score = 0;
let timer;
const TIME_LIMIT = 10; // Time limit for each question in seconds
let questions = []; // Store the selected random questions
let quizResults = []; // Store questions and correct answers for the result page
let timeLeft = TIME_LIMIT; // Track time left for current question

// Subject Display Names
const subjectDisplayNames = {
    history: "इतिहास",
    science: "विज्ञान",
    geography: "भूगोल",
    intorg: "अन्तर्राष्ट्रिय संघ संस्था",
    iq: "आईक्यू"
};

// Utility Functions

/**
 * Shuffles an array using Fisher-Yates algorithm
 * @param {Array} array - The array to shuffle
 * @returns {Array} - The shuffled array
 */
function shuffleArray(array) {
    const newArray = [...array];
    for (let i = newArray.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
    }
    return newArray;
}

// Quiz Functions

/**
 * Starts the quiz with the selected subject
 * @param {string} subject - The subject to start quiz for
 */
function startQuiz(subject) {
    localStorage.setItem('currentSubject', subject);
    window.location.href = 'quiz.html';
}

/**
 * Loads quiz questions and initializes the quiz
 */
function loadQuiz() {
    const subject = localStorage.getItem('currentSubject');
    if (!subject) {
        console.error('No subject found in localStorage');
        window.location.href = 'index.html';
        return;
    }

    // Set the subject title
    const displayName = subjectDisplayNames[subject] || subject;
    document.getElementById('subject-title').textContent = displayName + ' प्रश्नोत्तरी';
    
    fetch(`data/${subject}.json`)
        .then(response => {
            if (!response.ok) throw new Error('Network response was not ok');
            return response.json();
        })
        .then(allQuestions => {
            if (!allQuestions || allQuestions.length === 0) {
                throw new Error('No questions found');
            }

            // Select and shuffle questions and options
            questions = getRandomQuestions(allQuestions, 10).map(question => {
                const shuffledOptions = shuffleArray(question.options);
                // Find the new position of the correct answer
                const correctIndex = shuffledOptions.indexOf(question.answer);
                return {
                    ...question,
                    options: shuffledOptions,
                    correctIndex: correctIndex // Store the index of correct answer
                };
            });
            
            resetQuizState();
            startTimer();
            showQuestion();
        })
        .catch(error => {
            console.error('Error fetching questions:', error);
            showErrorModal('प्रश्नहरू लोड गर्न असफल भयो। कृपया पुन: प्रयास गर्नुहोस्।');
        });
}

/**
 * Gets random questions from the pool
 * @param {Array} allQuestions - All available questions
 * @param {number} count - Number of questions to select
 * @returns {Array} - Randomly selected questions
 */
function getRandomQuestions(allQuestions, count) {
    return shuffleArray(allQuestions).slice(0, count);
}

/**
 * Displays the current question with randomized options
 */
function showQuestion() {
    if (currentQuestion >= questions.length) {
        endQuiz();
        return;
    }

    const question = questions[currentQuestion];
    document.getElementById('question-number').textContent = `प्रश्न ${currentQuestion + 1}/${questions.length}`;
    document.getElementById('question').textContent = question.question;
    
    const optionsDiv = document.getElementById('options');
    optionsDiv.innerHTML = '';
    
    // Display shuffled options
    question.options.forEach((option, index) => {
        const button = document.createElement('button');
        button.textContent = `${String.fromCharCode(97 + index)}. ${option}`; // a., b., c., d.
        button.onclick = () => checkAnswer(index, question.correctIndex);
        optionsDiv.appendChild(button);
    });

    // Reset timer
    timeLeft = TIME_LIMIT;
    document.getElementById('time').textContent = timeLeft;
    document.getElementById('feedback').style.display = 'none';
}

/**
 * Checks if the selected answer is correct
 * @param {number} selectedIndex - Index of selected option
 * @param {number} correctIndex - Index of correct answer
 */
function checkAnswer(selectedIndex, correctIndex) {
    clearInterval(timer);
    
    const isCorrect = selectedIndex === correctIndex;
    if (isCorrect) score++;

    // Store the question result
    quizResults.push({
        question: questions[currentQuestion].question,
        correctAnswer: questions[currentQuestion].options[correctIndex],
        userAnswer: questions[currentQuestion].options[selectedIndex],
        isCorrect: isCorrect
    });

    // Show feedback
    showFeedback(isCorrect);
    
    // Move to next question after delay
    setTimeout(() => {
        currentQuestion++;
        if (currentQuestion < questions.length) {
            startTimer();
            showQuestion();
        } else {
            endQuiz();
        }
    }, 1500);
}

/**
 * Shows feedback for the answer
 * @param {boolean} isCorrect - Whether the answer was correct
 */
function showFeedback(isCorrect) {
    const feedback = document.getElementById('feedback');
    feedback.textContent = isCorrect ? 'सही उत्तर! 🎉' : 'गलत उत्तर! 😞';
    feedback.style.color = isCorrect ? '#2ecc71' : '#e74c3c';
    feedback.style.display = 'block';
}

/**
 * Starts the timer for current question
 */
function startTimer() {
    clearInterval(timer);
    timeLeft = TIME_LIMIT;
    document.getElementById('time').textContent = timeLeft;

    timer = setInterval(() => {
        timeLeft--;
        document.getElementById('time').textContent = timeLeft;
        
        // Change color when time is running low
        if (timeLeft <= 5) {
            document.getElementById('time').style.color = '#e74c3c';
        }
        
        if (timeLeft <= 0) {
            clearInterval(timer);
            handleTimeOut();
        }
    }, 1000);
}

/**
 * Handles when time runs out for a question
 */
function handleTimeOut() {
    const question = questions[currentQuestion];
    quizResults.push({
        question: question.question,
        correctAnswer: question.options[question.correctIndex],
        userAnswer: null,
        isCorrect: false
    });

    showModal();
}

/**
 * Ends the quiz and shows results
 */
function endQuiz() {
    clearInterval(timer);
    localStorage.setItem('score', score);
    localStorage.setItem('quizResults', JSON.stringify(quizResults));
    localStorage.setItem('totalQuestions', questions.length);
    window.location.href = 'quiz-result.html';
}

/**
 * Resets quiz state
 */
function resetQuizState() {
    currentQuestion = 0;
    score = 0;
    quizResults = [];
    clearInterval(timer);
    document.getElementById('time').style.color = ''; // Reset timer color
}

// Modal Functions

function showModal() {
    document.getElementById('timeUpModal').style.display = 'flex';
}

function closeModal() {
    document.getElementById('timeUpModal').style.display = 'none';
    currentQuestion++;
    if (currentQuestion < questions.length) {
        startTimer();
        showQuestion();
    } else {
        endQuiz();
    }
}

function showErrorModal(message) {
    document.getElementById('errorMessage').textContent = message;
    document.getElementById('errorModal').style.display = 'flex';
}

function closeErrorModal() {
    document.getElementById('errorModal').style.display = 'none';
    window.location.href = 'index.html';
}

// Results Functions

/**
 * Toggles visibility of results section
 */
function toggleAnswers() {
    const resultsSection = document.getElementById('resultsSection');
    const showAnswersBtn = document.getElementById('showAnswersBtn');
    
    if (resultsSection.style.display === 'none' || resultsSection.style.display === '') {
        resultsSection.style.display = 'block';
        showAnswersBtn.textContent = 'जवाफहरू लुकाउनुहोस्';
    } else {
        resultsSection.style.display = 'none';
        showAnswersBtn.textContent = 'जवाफहरू देखाउनुहोस्';
    }
}

/**
 * Displays quiz results
 */
function displayResults() {
    const score = parseInt(localStorage.getItem('score')) || 0;
    const totalQuestions = parseInt(localStorage.getItem('totalQuestions')) || 10;
    const storedQuizResults = JSON.parse(localStorage.getItem('quizResults')) || [];

    // Display score
    document.getElementById('score').textContent = `तपाईंको प्राप्ताङ्क: ${score}/${totalQuestions}`;
    
    // Calculate and display percentage
    const percentage = Math.round((score / totalQuestions) * 100);
    document.getElementById('percentage').textContent = `प्रतिशत: ${percentage}%`;
    
    // Display motivational message
    document.getElementById('message').textContent = getMotivationalMessage(percentage);

    // Display questions and answers
    if (storedQuizResults.length > 0) {
        const correctAnswersList = document.getElementById('correctAnswersList');
        correctAnswersList.innerHTML = '';

        storedQuizResults.forEach((result, index) => {
            const listItem = document.createElement('li');
            const answerClass = result.isCorrect ? 'correct' : 'incorrect';
            
            listItem.innerHTML = `
                <div class="question-item ${answerClass}">
                    <strong>प्रश्न ${index + 1}:</strong> ${result.question}<br>
                    <strong>सही उत्तर:</strong> ${result.correctAnswer}<br>
                    ${result.userAnswer ? 
                        `<strong>तपाईंको उत्तर:</strong> ${result.userAnswer}` : 
                        '<span class="no-answer">तपाईंले उत्तर दिनुभएन</span>'}
                </div>
            `;
            correctAnswersList.appendChild(listItem);
        });
    }
}

/**
 * Gets motivational message based on score percentage
 * @param {number} percentage - The percentage score
 * @returns {string} - Motivational message
 */
function getMotivationalMessage(percentage) {
    if (percentage >= 90) return 'उत्कृष्ट! तपाईंले धेरै राम्रो गर्नुभयो!';
    if (percentage >= 70) return 'राम्रो! तपाईंले अझै बढी अभ्यास गर्न सक्नुहुन्छ।';
    if (percentage >= 50) return 'औसत! अझै धेरै अभ्यास गर्नुपर्छ।';
    return 'कमजोर! कृपया फेरि प्रयास गर्नुहोस् र अझै धेरै अभ्यास गर्नुहोस्।';
}

// Navigation Functions

function showAboutModal() {
    document.getElementById('aboutModal').style.display = 'flex';
}

function closeAboutModal() {
    document.getElementById('aboutModal').style.display = 'none';
}

function restartQuiz() {
    localStorage.removeItem('score');
    localStorage.removeItem('quizResults');
    window.location.href = 'index.html';
}

// Initialize appropriate page when window loads
window.onload = function() {
    if (window.location.pathname.endsWith('quiz-result.html')) {
        displayResults();
    } else if (window.location.pathname.endsWith('quiz.html')) {
        loadQuiz();
    }
};

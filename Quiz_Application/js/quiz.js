"use strict";

class stateManger {
    static wrongAnswerEmoji = "❌";
    static correctAnswerEmoji = "✅";

    static state = {
        language: localStorage.getItem("language"),
        grad: 0,
        numberOfQuestions: 0,
        questions: [],
        isFirstIteration: true,
        isFirstQuestionSwitch: true,
        timer: 10,
        questionSwitchTime: 6,
        timerInterval: null,
        isButtonClicked: false
    }

    static async getQuestions() {
        let quizzes = await fetch(`../js/languages.json`).then(response => response.json());
        for (let quiz of quizzes) {
            if (quiz.language == stateManger.state.language) {
                document.title = quiz.title;
                return quiz.questions;
            }
        }
    }

    /**
    * gets an array of random indexes
    * @param {number} maxIndex maximum index of the array
    * @param {number} arraySize size of the array
    * @returns {Array} an array of random indexes
    */
    static getRandomIndexArray(maxIndex, arraySize) {
        let array = [];
        let set = new Set();
        while (array.length < arraySize) {
            let randomNumber = Math.floor(Math.random() * (maxIndex + 1));
            if (!set.has(randomNumber)) {
                set.add(randomNumber);
                array.push(randomNumber);
            }
        }
        return array;
    }

    /**
     *shuffles the array
     * @param {Array<any>} array
     * @returns {Array<any>} the shuffled array
     */
    static shuffleArray(array) {
        let indexArray = this.getRandomIndexArray(array.length - 1, array.length);
        let shuffledArray = [];
        for (let index of indexArray) {
            shuffledArray.push(array[index]);
        }
        return shuffledArray;
    }

    /**
     * gets a random number of questions from the array of questions
     * @param {number} max the maximum number of questions
     * @returns {number} a random number of questions between 5 and max
     */
    static getRandomNumberOfQuestions(max) {
        return Math.floor(Math.random() * (max - 5 + 1)) + 5;
    }

    /**
     * updates the question data when when the question is faded out
     * @param {Array<any>} randomQuestions array of random questions
     * @returns {Array<any>} array of random questions with the first question removed
     */
    static updateQuestionData(randomQuestions) {
        if (stateManger.state.isFirstIteration) {
            document.getElementById("min-grade").innerHTML = `minimum grade to pass quiz: ${Math.ceil(stateManger.state.numberOfQuestions * 0.5)}/${stateManger.state.numberOfQuestions}`;
            document.getElementById("grade").innerHTML = `your current grade: ${stateManger.state.grad}/${stateManger.state.numberOfQuestions}`;
            stateManger.state.isFirstIteration = false;
        } else {
            while (document.getElementById("answers").childElementCount > 0) {
                document.getElementById("answers").removeChild(document.getElementById("answers").firstElementChild);
            }
        }
        document.getElementById("questions-count").innerHTML = `remaining number of questions: ${randomQuestions.length}`;
        document.getElementsByTagName("h3")[0].innerHTML = randomQuestions[0].question;
        randomQuestions[0].choices = stateManger.shuffleArray(randomQuestions[0].choices);
        for (let i = 0; i < randomQuestions[0].choices.length; i++) {
            let button = document.createElement("button");
            button.innerHTML = randomQuestions[0].choices[i].choice;
            button.value = randomQuestions[0].choices[i].isCorrect;
            document.getElementById("answers").appendChild(button);
        }
        stateManger.disableButtons();
        randomQuestions.shift();
        return randomQuestions;
    }

    /**
     * shows the result of the answer
     * @param {boolean} isCorrect weather the answer is correct or not
     */
    static showAnswerResult(isCorrect) {
        stateManger.disableButtons();
        let answerSound;
        if (isCorrect) {
            document.getElementById("answer-emoji").innerHTML = stateManger.correctAnswerEmoji;
            answerSound = new Audio("../js/right-answer.mp3");
        } else {
            document.getElementById("answer-emoji").innerHTML = stateManger.wrongAnswerEmoji;
            answerSound = new Audio("../js/wrong-answer.mp3");
        }
        let buttons = document.getElementsByTagName("button");
        for (let button of buttons) {
            if (button.value == "true") {
                button.style.backgroundColor = "green";
            } else {
                button.style.backgroundColor = "red";
            }
        }
        answerSound.play();
    }

    /**
     * removes the result of the answer
     */
    static removeAnswerResult() {
        document.getElementById("answer-emoji").innerHTML = "";
        let buttons = document.getElementsByTagName("button");
        for (let button of buttons) {
            button.style.backgroundColor = "white";
        }
    }

    /**
     * enables all the answer buttons
     */
    static enableButtons() {
        let buttons = document.getElementsByTagName("button");
        for (let button of buttons) {
            button.disabled = false;
        }
    }

    /**
     * disables all the answer buttons
     */
    static disableButtons() {
        let buttons = document.getElementsByTagName("button");
        for (let button of buttons) {
            button.disabled = true;
        }
    }

    /**
     * shows the final result of the quiz
     */
    static showFinalResult() {
        while (document.getElementsByTagName("main")[0].childElementCount > 0) {
            document.getElementsByTagName("main")[0].removeChild(document.getElementsByTagName("main")[0].firstElementChild);
        }
        document.getElementsByTagName("main")[0].style.gridTemplateAreas = `"final-massage final-massage final-massage" "final-grade final-grade final-grade" ". back ."`;
        let finalMassage = document.createElement("h1");
        if (stateManger.state.grad >= Math.ceil(stateManger.state.numberOfQuestions * 0.5)) {
            finalMassage.innerHTML = "you passed the quiz";
        } else {
            finalMassage.innerHTML = "you failed the quiz";
        }
        finalMassage.style.cssText = `grid-area: final-massage;
            display: flex;
            justify-content: center;
            align-items: center;`
        let finalGrade = document.createElement("h3");
        finalGrade.innerHTML = `your final grade: ${stateManger.state.grad}/${stateManger.state.numberOfQuestions}`;
        finalGrade.style.cssText = `grid-area: final-grade;
            display: flex;
            justify-content: center;
            align-items: center;`
        let backButton = document.createElement("button");
        backButton.innerHTML = "back";
        backButton.style.cssText = `grid-area: back;
        border-radius: 5px;
        border-color: transparent;
        background-color: white;
        color: black;
        cursor: pointer;
        font-size: medium;`
        backButton.onclick = () => {
            window.location.href = "index.html";
        }
        document.getElementsByTagName("main")[0].append(finalMassage, finalGrade, backButton);
    }

    /**
     * resets the timer
     * @param {boolean} isCorrect weather the answer is correct or not
     * @returns {Promise<void>} a promise that resolves when the timer is reset
     */
    static async resetTimer(isCorrect) {
        stateManger.showAnswerResult(isCorrect);
        if (stateManger.state.isFirstQuestionSwitch) {
            document.getElementsByTagName("main")[0].style.animationPlayState = "running";
            document.getAnimations()[0].addEventListener("finish", stateManger.startTimer);
            stateManger.state.isFirstQuestionSwitch = false;
        } else {
            document.getAnimations()[0].play();
        }
        if (stateManger.state.questions.length == 0) {
            setTimeout(() => {
                stateManger.showFinalResult();
                document.getAnimations()[0].removeEventListener("finish", stateManger.startTimer);
            }, Math.ceil(stateManger.state.questionSwitchTime * 0.25 * 1000))
        } else {
            setTimeout(() => {
                stateManger.removeAnswerResult();
                stateManger.updateQuestionData(stateManger.state.questions);
                if (window.getComputedStyle(document.getElementById("timer"), "::after").animationPlayState == "paused") {
                    document.getAnimations()[1].finish();
                }
                document.getElementById("timer").innerHTML = `${stateManger.state.timer}s remaining`;
            }, Math.ceil(stateManger.state.questionSwitchTime * 0.25 * 1000))
        }
    }

    /**
     * changes the active css rule through the style sheet
     * @param {string} element the element identifier in the css file
     * @param {string} pseudoElement the pseudo element identifier in the css file
     * @param {string} property the property to change
     * @param {string} value the value to change the property to
     */
    static changeStyleSheet(element, pseudoElement = "", property, value) {
        for (let cssRule of document.styleSheets[0].cssRules) {
            if (cssRule.selectorText == `${element}${pseudoElement}`) {
                cssRule.style.setProperty(property, value);
                break;
            }
        }
    }

    /**
     * starts the timer
     */
    static startTimer() {
        if (stateManger.state.isFirstQuestionSwitch) {
            document.getElementsByTagName("main")[0].style.animationDuration = `${stateManger.state.questionSwitchTime}s`;
            stateManger.changeStyleSheet("#timer", "::after", "animation-iteration-count", `${stateManger.state.timer}`);
            stateManger.changeStyleSheet("#timer", "::after", "animation-play-state", "running");
        } else if (!stateManger.state.isFirstQuestionSwitch && !stateManger.state.isButtonClicked) {
            document.getAnimations()[1].play();
        } else if (stateManger.state.isButtonClicked) {
            stateManger.state.isButtonClicked = false;
            stateManger.changeStyleSheet("#timer", "::after", "animation-play-state", "running");
            document.getAnimations()[1].play();
        }
        let time = stateManger.state.timer;
        document.getElementById("timer").innerHTML = `${time}s remaining`;
        stateManger.enableButtons();
        stateManger.setButtons();
        stateManger.state.timerInterval = setInterval(() => {
            time--;
            if (time == 0) {
                document.getElementById("timer").innerHTML = `time out`;
                stateManger.resetTimer(false);
                clearInterval(stateManger.state.timerInterval);
            } else {
                document.getElementById("timer").innerHTML = `${time}s remaining`;
            }
        }, 1000);
    }

    static setButtons() {
        let buttons = document.getElementsByTagName("button");
        for (let button of buttons) {
            button.onclick = () => {
                stateManger.state.isButtonClicked = true;
                stateManger.changeStyleSheet("#timer", "::after", "animation-play-state", "paused");
                document.getAnimations()[1].pause();
                clearInterval(stateManger.state.timerInterval);
                if (button.value == "true") {
                    stateManger.state.grad++;
                    document.getElementById("grade").innerHTML = `your current grade: ${stateManger.state.grad}/${stateManger.state.numberOfQuestions}`;
                    stateManger.resetTimer(true);
                } else {
                    stateManger.resetTimer(false);
                }
            }
        }
    }
}

let data = stateManger.getQuestions().then(questions => {
    stateManger.state.numberOfQuestions = stateManger.getRandomNumberOfQuestions(questions.length);
    let randomQuestionsIndexArray = stateManger.getRandomIndexArray(questions.length - 1, stateManger.state.numberOfQuestions);
    for (let index of randomQuestionsIndexArray) {
        stateManger.state.questions.push(questions[index]);
    }
    return stateManger.state.questions;
}).then(stateManger.updateQuestionData).then(stateManger.startTimer)

console.log(data);
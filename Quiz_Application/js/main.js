"use strict";


(async () => {
    let quizzes = await fetch('../js/languages.json').then(response => response.json());
    for (let quiz of quizzes) {
        let button = document.createElement('button');
        button.value = quiz.language;
        button.innerHTML = quiz.language;
        document.getElementById('languages').appendChild(button);
    }
})().then(() => {
    let buttons = document.querySelectorAll('#languages button');
    for (let button of buttons) {
        button.addEventListener('click', () => {
            let language = button.value;
            localStorage.setItem('language', language);
            location.href = 'quiz.html';
        });
    }
});
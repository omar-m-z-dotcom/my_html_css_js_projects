"use strict";

/**
 * Scroll progress bar function
 * @param {HTMLElement} element
 * @abstract This function will create a progress bar that will show the progress of the scroll
 * @returns {void}
 */
export default (element) => {
    let height = document.documentElement.scrollHeight - document.documentElement.clientHeight;
    window.addEventListener('scroll', () => {
        let progress = (window.scrollY / height) * 100;
        // another way to get the progress
        // let progress = (document.documentElement.scrollTop / hight) * 100;
        element.style.width = progress + '%';
    });
}
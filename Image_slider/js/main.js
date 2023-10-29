"use strict";

// dummy variable to prevent errors
let _ = undefined;

class stateManger {
    static state = {
        // replace the value of apiKey with your api key from website: https://www.pexels.com/api/
        apiKey: "your_api_key_here",
        nextPage: null,
        prevPage: null,
        isFirstFadeOut: true,
        fadeOutDuration: 1,
        photosData: []
    }

    static async getData(url) {
        let data;
        if (url) {
            data = await fetch(url, {
                headers: {
                    Authorization: this.state.apiKey
                }
            }).then(res => res.json());
        } else {
            data = await fetch(`https://api.pexels.com/v1/curated`, {
                headers: {
                    Authorization: this.state.apiKey
                }
            }).then(res => res.json());
        }
        return data;
    }

    /**
     * processes the data that is returned from the api and updates the state with relevant data
     * @param {any} data the data that is returned from the api
     */
    static processData(data) {
        if ("next_page" in data) {
            this.state.nextPage = data.next_page;
        } else this.state.nextPage = null;
        if ("prev_page" in data) {
            this.state.prevPage = data.prev_page;
        } else this.state.prevPage = null;
        if (this.state.photosData.length > 0) {
            this.state.photosData = [];
        }
        for (let photo of data.photos) {
            this.state.photosData.push({
                src: photo.src.large2x,
                alt: photo.alt
            });
        }
    }

    /**
     * changes the src and alt of the image during the fade out animation
     * @param {string} src the source of the image
     * @param {string} alt the alt text of the image
     */
    static fadeOutImage(src, alt) {
        if (this.state.isFirstFadeOut) {
            document.querySelector("img").style.animationPlayState = "running";
            this.state.isFirstFadeOut = false;
        } else {
            document.getAnimations()[0].play();
        }
        setTimeout(() => {
            document.querySelector("img").src = src;
            document.querySelector("img").alt = alt;
        }, this.state.fadeOutDuration * 1000 * 0.3);
    }

    /**
     * updates the image on the page
     * @param {string} src the source of the image
     * @param {string} alt the alt text of the image
     */
    static updateImage(src, alt) {
        if (document.getElementById("image-div").contains(document.querySelector("img"))) {
            this.fadeOutImage(src, alt);
        } else {
            document.getElementById("image-div").prepend(document.createElement("img"));
            document.querySelector("img").src = src;
            document.querySelector("img").alt = alt;
            document.querySelector("img").style.animationDuration = `${this.state.fadeOutDuration}s`;
        }
    }

    /**
     * gets the data of wanted image and updates the slide
     * @param {number} index the index of the photo data in the photosData array
     */
    static setNewSlide(index) {
        let imageData = this.state.photosData[index];
        this.updateImage(imageData.src, imageData.alt);
    }

    /**
     *  sets the new active slide
     * @param {number} index the index of the slide to be set active
     */
    static setActiveSlide(index) {
        let activeSlide = document.querySelector(".active");
        activeSlide.classList.remove("active");
        document.getElementById("image-switcher").children[index].classList.add("active");
    }

    /**
     * updates the slide counter
     * @param {number} index the index of the slide to be set active
     */
    static updateSlideCounter(index) {
        document.getElementById("img-counter").innerHTML = `slide#${index + 1} of ${this.state.photosData.length}`;
    }

    /**
     * sets up the image switcher
     * @param {any} data the data that is returned from the api
     */
    static setupImageSwitcher() {
        for (let index = 0; index < this.state.photosData.length; index++) {
            let slideNumber = document.createElement("li");
            slideNumber.innerHTML = `${index + 1}`
            slideNumber.value = index;
            slideNumber.onclick = () => {
                if (!slideNumber.classList.contains("active")) {
                    this.setNewSlide(slideNumber.value);
                    this.setActiveSlide(slideNumber.value);
                    this.updateSlideCounter(slideNumber.value);
                }
            }
            document.getElementById("image-switcher").appendChild(slideNumber);
            if (index == 0) {
                slideNumber.classList.add("active");
                this.setNewSlide(slideNumber.value);
                this.updateSlideCounter(slideNumber.value);
            }
        }
    }

    /**
     * updates the state of the buttons
     */
    static updateButtonsState() {
        if (this.state.nextPage == null) {
            document.getElementById("next").disabled = true;
            document.getElementById("next").style.cursor = "not-allowed";
            document.getElementById("next").style.opacity = "0.5";
        } else {
            document.getElementById("next").disabled = false;
            document.getElementById("next").style = "";
        }
        if (this.state.prevPage == null) {
            document.getElementById("prev").disabled = true;
            document.getElementById("prev").style.cursor = "not-allowed";
            document.getElementById("prev").style.opacity = "0.5";
        } else {
            document.getElementById("prev").disabled = false;
            document.getElementById("prev").style = "";
        }
    }

    /**
     * sets up the buttons Action
     */
    static setButtonsAction() {
        this.updateButtonsState();
        for (let button of document.getElementsByTagName("button")) {
            button.onclick = () => {
                if (button.id == "next") {
                    this.getData(this.state.nextPage).then(data => {
                        this.processData(data);
                        this.setNewSlide(0);
                        this.setActiveSlide(0);
                        this.updateButtonsState();
                    });
                } else {
                    this.getData(this.state.prevPage).then(data => {
                        this.processData(data);
                        this.setNewSlide(this.state.photosData.length - 1);
                        this.setActiveSlide(this.state.photosData.length - 1);
                        this.updateButtonsState();
                    });
                }
            }
        }
    }
}

stateManger.getData(_).then(data => {
    stateManger.processData(data);
    stateManger.setupImageSwitcher();
    stateManger.setButtonsAction();
});
"use strict";

let form = document.forms[0];
let reposList = document.getElementById("repos-list");

form.onsubmit = function (event) {
    event.preventDefault();
    if (form.Username.value) {
        let username = form.Username.value.trim();
        form.Username.value = "";
        getRepos(username);
    }
}

// get (name,html_url, stargazers_count)

async function getRepos(username) {
    let url = `https://api.github.com/users/${username}/repos`;
    let data = await fetch(url).then(response => response.json())
        .catch(error => {
            reposList.innerHTML = `Error: no user found with username "${username}"`;
            console.error(error);
            return false;
        });
    if (data) {
        while (reposList.childElementCount > 0) {
            reposList.removeChild(reposList.firstChild);
        }
        for (let repo of data) {
            let listItem = document.createElement("li");
            listItem.appendChild(document.createTextNode(repo.name));
            let repoData = document.createElement("div");
            repoData.classList.add("repo-data");
            let stars = document.createElement("span");
            stars.appendChild(document.createTextNode(`${repo.stargazers_count} stars`));
            let link = document.createElement("a");
            link.href = repo.html_url;
            link.appendChild(document.createTextNode("visit"));
            repoData.append(stars, link);
            listItem.appendChild(repoData);
            reposList.appendChild(listItem);
        }
    } else {
        return;
    }
}
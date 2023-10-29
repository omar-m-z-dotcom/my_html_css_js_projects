"use strict";

(async () => {
    // Get users
    let users = await fetch("https://jsonplaceholder.typicode.com/users").then(response => response.json());
    let photo;
    let posts = [];
    // loop through users
    for (let user of users) {
        // get user's first album's first photo
        photo = await fetch(`https://jsonplaceholder.typicode.com/albums?userId=${user.id}`)
            .then(response => response.json())
            .then(albums => fetch(`https://jsonplaceholder.typicode.com/photos?albumId=${albums[0].id}`)
                .then(response => response.json())
                .then(photos => photos[0]));
        // get user's posts
        for (let post of await fetch(`https://jsonplaceholder.typicode.com/posts?userId=${user.id}`)
            .then(response => response.json())) {
            posts.push(post);
        }
        console.log(user);
        console.log(photo);
        console.log(posts);

        // loop through posts and add them to the page
        posts.forEach(post => {
            let postList = document.getElementById("posts");
            let postListItem = document.createElement("li");
            postListItem.classList.add("post");
            postList.appendChild(postListItem);
            let postOwner = document.createElement("div");
            postOwner.classList.add("post-owner");
            postListItem.appendChild(postOwner);
            let postOwnerImage = document.createElement("img");
            postOwnerImage.src = photo.thumbnailUrl;
            postOwnerImage.alt = photo.title;
            postOwner.appendChild(postOwnerImage);
            let postOwnerName = document.createElement("h5");
            postOwnerName.innerHTML = user.username;
            postOwner.appendChild(postOwnerName);
            let postTitle = document.createElement("h3");
            postTitle.innerHTML = post.title;
            postListItem.appendChild(postTitle);
            let postBody = document.createElement("p");
            postBody.innerHTML = post.body;
            postListItem.appendChild(postBody);
        });
        // empty posts array for next user
        posts = [];
    }
})();
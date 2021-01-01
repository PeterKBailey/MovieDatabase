
function init(){
    //logging out
	let logoutButton = document.getElementById("logout");
    logoutButton.onclick = logout;

    //changing account type
    let contributingButton = document.getElementById("userTypeContributor");
    contributingButton.onclick = nowContributing;
    let regularButton = document.getElementById("userTypeRegular");
    regularButton.onclick = nowNotContributing;

    //unfollowing
    let unfollowButton = document.getElementById("unfollow");
    unfollowButton.onclick = unfollow;

    //clearing feed
    let clearButton = document.getElementById("clearFeed");
    clearButton.onclick = clear;
}

function unfollow(){
    //it's probably a better idea to send the names of those to remove and not all of the ones not to.
    let peopleFollowing = document.getElementById("peopleFollowing").children;
    let usersFollowing = document.getElementById("usersFollowing").children;
    let thoseRemoved = {
        people:[],
        users:[],
        unfollow: true
    }
    for(child of peopleFollowing){
        if(child.type=="checkbox" && child.checked){
            thoseRemoved.people.push(child.id);
        }
    }
    for(child of usersFollowing){
        if(child.type=="checkbox" && child.checked){
            thoseRemoved.users.push(child.id);
        }
    }
    // console.log(peopleFollowing);
    // console.log(usersFollowing);
    // console.log(thoseRemoved.people);
    // console.log(thoseRemoved.users);
    // console.log(thoseRemoved);
    sendRemoved(thoseRemoved)
}

function sendRemoved(thoseRemoved){
    console.log(thoseRemoved);

    let xhttp = new XMLHttpRequest();
   
    xhttp.onreadystatechange = function() {
		if(this.readyState==4 && this.status==200){
            console.log("Success!");
            window.location.href = window.location;
        }
        if(this.readyState == 4 && this.status == 403){
            window.alert("You're not logged in as this user!");
            // window.location.href = "http://localhost:3000/login";
        }
    }
    xhttp.open("PATCH",  "/users/session/following", true);
    xhttp.setRequestHeader('Content-type', 'application/json');
    xhttp.send(JSON.stringify(thoseRemoved));
}



function logout(){
    console.log("here we are loggin out!!")

    let xhttp = new XMLHttpRequest();
   
    xhttp.onreadystatechange = function() {
		if(this.readyState==4 && this.status==200){
            console.log("Success!");
            window.location.href = "/login";
        }
        if(this.readyState == 4 && this.status == 403){
            window.alert("Already Logged out!");
        }
    }
    xhttp.open("DELETE", "/users/session", true);
    // xhttp.setRequestHeader('Content-type', 'application/json');
    xhttp.send();
}


function nowContributing(){
    changeUserType(true);
}
function nowNotContributing(){
    changeUserType(false);
}

function changeUserType(isContributing){
    console.log("here we are user changed!!")

    let xhttp = new XMLHttpRequest();
    let info = {};
    info.isContributing = isContributing;
    xhttp.onreadystatechange = function() {
		if(this.readyState==4 && this.status==200){
            window.alert("Updated!");
        }
    }
    xhttp.open("PUT", "/users/session", true);
    xhttp.setRequestHeader('Content-type', 'application/json');
    xhttp.send(JSON.stringify(info));
}


function clear(){
    let xhttp = new XMLHttpRequest();
   
    xhttp.onreadystatechange = function() {
		if(this.readyState==4 && this.status==200){
            console.log("Success!");
            window.location.href = window.location.href;
        }
        if(this.readyState == 4 && this.status == 403){
            window.alert("Already Logged out!");
        }
    }
    xhttp.open("DELETE", window.location.href + "/notifications", true);
    // xhttp.setRequestHeader('Content-type', 'application/json');
    xhttp.send();
}
let unfollowButton = document.getElementById("unfollow");
if(unfollowButton){
    unfollowButton.onclick = unfollow;
}

let followButton = document.getElementById("follow");
if(followButton){
    followButton.onclick = follow;
}
//this format for the object is used to make the server side function compatible
function unfollow(){
    let thoseRemoved = {
        people:[],
        users:[],
        unfollow: true
    }
    sendInfo(thoseRemoved);
}
function follow(){
    let thoseAdded = {
        people:[],
        users:[],
        unfollow: false
    }
    sendInfo(thoseAdded)
}
function sendInfo(info){
    let separated = window.location.href.split("/");
    console.log(separated)
    if(window.location.href.includes("/people")){
        let person = separated[separated.indexOf("people")+1].replace(/%20/g, " ");;
        info.people.push(person);
    }
    if(window.location.href.includes("/users")){
        let user = separated[separated.indexOf("users")+1].replace(/%20/g, " ");;
        info.users.push(user);
    }
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
    xhttp.open("PATCH", "/users/session/following", true);
    xhttp.setRequestHeader('Content-type', 'application/json');
    xhttp.send(JSON.stringify(info));
}
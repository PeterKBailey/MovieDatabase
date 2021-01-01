
function init(){
	let loginButton = document.getElementById("login");
    loginButton.onclick = login;
    let signupButton = document.getElementById("signup");
    signupButton.onclick = signup;
}
function login(){
    let buttonType = "login";
    sendInfo(buttonType);
}
function signup(){
    let buttonType = "signup";
    sendInfo(buttonType);
}
function sendInfo(buttonType){
	let username = document.getElementById("username");
    let password = document.getElementById("password");
    //if one or both of the textboxes are missing info, don't bother sending it, notify the user
    if(!username.value || !password.value){
        window.alert("One or more forms left empty!");
        return;
    }    
    sendNow({username: username.value, password:password.value, buttonType});
    console.log(username.value);
    console.log(password.value);
}

function sendNow(info){
    let xhttp = new XMLHttpRequest();
   
    xhttp.onreadystatechange = function() {
		if(this.readyState==4 && this.status==200){
            console.log("Success!");
            //brings you back to the page you were just on
            let data = JSON.parse(this.responseText);
            window.location.href = data.page;
        }
        else if(this.readyState==4 && this.status == 406 && info.buttonType === "signup"){
            window.alert("Username already taken!");
        }
        else if(this.readyState==4 && this.status == 406 && info.buttonType === "login"){
            window.alert("Wrong username or password! Try peterbailey and movies1");
        }
    }
    xhttp.open("POST", "/login", true);
    xhttp.setRequestHeader('Content-type', 'application/json');
    xhttp.send(JSON.stringify(info));
}
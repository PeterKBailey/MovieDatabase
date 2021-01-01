
function init(){
	let addReviewButton = document.getElementById("addReview");
    addReviewButton.onclick = verifyInfo;
}
function verifyInfo(){
	let textBox = document.getElementById("reviewText");
    let numBox = document.getElementById("ratingNum");
    console.log("Here!");
    if(!numBox.value || numBox.value>10 || numBox.value < 1){
        window.alert("The rating must be between 1 and 10!");
        return;
    }
    sendNow({content: textBox.value, rating: numBox.value});
}

function sendNow(reviewInfo){
    let xhttp = new XMLHttpRequest();
   
    xhttp.onreadystatechange = function() {
		if(this.readyState==4 && this.status==200){
            console.log("Success!");
            window.location.href = window.location;
        }
        if(this.readyState == 4 && this.status == 406){
            window.alert("You aren't logged in!");
        }
    }
    xhttp.open("POST", window.location + "/reviews", true);
    xhttp.setRequestHeader('Content-type', 'application/json');
    xhttp.send(JSON.stringify(reviewInfo));
}
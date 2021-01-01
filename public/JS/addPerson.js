let form = document.getElementById("form");
let writtenSelection = document.getElementById("written");
let actedSelection = document.getElementById("acted");
let directedSelection = document.getElementById("directed");
let submitButton = document.getElementById("submitButt");
submitButton.onclick = sendForm;
let directed = [];
let acted = [];
let written = [];


function sendForm(){
    let selectedDirectors = document.getElementById("directed");
    selectedDirectors.disabled = false;
    let selectedWriters = document.getElementById("written");
    selectedWriters.disabled = false;
    let selectedActors = document.getElementById("acted");
    selectedActors.disabled = false;

    document.getElementById("form").submit();
}


document.getElementById("movieNameInput").addEventListener("keyup", typingName);



function typingName(event){
    let xhttp = new XMLHttpRequest();
    let list = document.getElementById("movieList");
    xhttp.onreadystatechange = function() {
		if(this.readyState==4 && this.status==200){
            console.log("Success!");
            list.innerHTML="";
            //in an array would be best
            let data = JSON.parse(this.responseText);
            // console.log(data);
            for(let name of data){
                let person = document.createElement("p");
                person.classList.add("personFromList");
                person.onclick = fillBoxHelper;
                person.innerHTML = name;
                list.appendChild(person);
            }
        }
        else if(this.readyState==4 && this.status == 404){
            list.innerHTML="";
            let person = document.createElement("p");
            person.innerHTML = "No matches found";
            list.appendChild(person);
        }

    }
    xhttp.open("GET", "/movies/list/" + document.getElementById("movieNameInput").value, true);
    xhttp.setRequestHeader('Content-type', 'application/json');
    // console.log(JSON.stringify(document.getElementById("person").value));
    xhttp.send();
}

function fillBox(src){
    // console.log("Made it1")
    if(document.getElementById("directedRadio").checked){
        // console.log("Made it2")

        let index = directed.indexOf(src.textContent);
        //if it's already in the array, remove it
        if(index!=-1){
            directed.splice(index, 1);
            window.alert("Removed " + src.textContent + " from directed.");
        }else{
            directed.push(src.textContent)
        }
        //get the selectionbox
        let selectedDirectors = document.getElementById("directed");
        //clear it
        selectedDirectors.innerHTML = "";
        //update it
        for(director of directed){
            // console.log("Director: " + director);
            
            let option = document.createElement("option");
            option.appendChild(document.createTextNode(director));
            option.value = director;
            option.selected = true;
            selectedDirectors.appendChild(option);
        }
    }

    if(document.getElementById("writtenRadio").checked){
        let index = written.indexOf(src.textContent);
        //if it's already in the array, remove it
        if(index!=-1){
            written.splice(index, 1);
            window.alert("Removed " + src.textContent + " from written.");
        }else{
            written.push(src.textContent)
        }
        //get the selectionbox
        let selectedWriters = document.getElementById("written");
        //clear it
        selectedWriters.innerHTML = "";
        //update it
        for(writer of written){
            let option = document.createElement("option");
            option.appendChild(document.createTextNode(writer));
            option.value = writer;
            option.selected = true;
            selectedWriters.appendChild(option);
        }
    }

    if(document.getElementById("actedRadio").checked){
        let index = acted.indexOf(src.textContent);
        //if it's already in the array, remove it
        if(index!=-1){
            acted.splice(index, 1);
            window.alert("Removed " + src.textContent + " from acted.");
        }else{
            acted.push(src.textContent)
        }
        //get the selectionbox
        let selectedActors = document.getElementById("acted");
        //clear it
        selectedActors.innerHTML = "";
        //update it
        for(actor of acted){
            let option = document.createElement("option");
            option.appendChild(document.createTextNode(actor));
            option.value = actor;
            option.selected = true;
            selectedActors.appendChild(option);
        }
    }

	document.getElementById("movieNameInput").value = src.textContent;
}

function fillBoxHelper(){
    fillBox(this)
}
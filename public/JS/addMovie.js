let form = document.getElementById("form");
let writersSelection = document.getElementById("writers");
let actorsSelection = document.getElementById("actors");
let directorsSelection = document.getElementById("directors");
let submitButton = document.getElementById("submitButt");
submitButton.onclick = sendForm;
let directors = [];
let actors = [];
let writers = [];


function sendForm(){
    let selectedDirectors = document.getElementById("directors");
    selectedDirectors.disabled = false;
    let selectedWriters = document.getElementById("writers");
    selectedWriters.disabled = false;
    let selectedActors = document.getElementById("actors");
    selectedActors.disabled = false;

    document.getElementById("form").submit();
}


document.getElementById("personNameInput").addEventListener("keyup", typingName);



function typingName(event){
    let xhttp = new XMLHttpRequest();
    let list = document.getElementById("peopleList");
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
    xhttp.open("GET", "/people/list/" + document.getElementById("personNameInput").value, true);
    xhttp.setRequestHeader('Content-type', 'application/json');
    // console.log(JSON.stringify(document.getElementById("person").value));
    xhttp.send();
}

function fillBox(src){
    // console.log("Made it1")
    if(document.getElementById("directorsRadio").checked){
        // console.log("Made it2")

        let index = directors.indexOf(src.textContent);
        //if it's already in the array, remove it
        if(index!=-1){
            directors.splice(index, 1);
            window.alert("Removed " + src.textContent + " from directors.");
        }else{
            directors.push(src.textContent)
        }
        //get the selectionbox
        let selectedDirectors = document.getElementById("directors");
        //clear it
        selectedDirectors.innerHTML = "";
        //update it
        for(director of directors){
            // console.log("Director: " + director);
            
            let option = document.createElement("option");
            option.appendChild(document.createTextNode(director));
            option.value = director;
            option.selected = true;
            selectedDirectors.appendChild(option);
        }
    }

    if(document.getElementById("writersRadio").checked){
        let index = writers.indexOf(src.textContent);
        //if it's already in the array, remove it
        if(index!=-1){
            writers.splice(index, 1);
            window.alert("Removed " + src.textContent + " from writers.");
        }else{
            writers.push(src.textContent)
        }
        //get the selectionbox
        let selectedWriters = document.getElementById("writers");
        //clear it
        selectedWriters.innerHTML = "";
        //update it
        for(writer of writers){
            let option = document.createElement("option");
            option.appendChild(document.createTextNode(writer));
            option.value = writer;
            option.selected = true;
            selectedWriters.appendChild(option);
        }
    }

    if(document.getElementById("actorsRadio").checked){
        let index = actors.indexOf(src.textContent);
        //if it's already in the array, remove it
        if(index!=-1){
            actors.splice(index, 1);
            window.alert("Removed " + src.textContent + " from actors.");
        }else{
            actors.push(src.textContent)
        }
        //get the selectionbox
        let selectedActors = document.getElementById("actors");
        //clear it
        selectedActors.innerHTML = "";
        //update it
        for(actor of actors){
            let option = document.createElement("option");
            option.appendChild(document.createTextNode(actor));
            option.value = actor;
            option.selected = true;
            selectedActors.appendChild(option);
        }
    }

	document.getElementById("personNameInput").value = src.textContent;
}

function fillBoxHelper(){
    fillBox(this)
}
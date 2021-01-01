let editButton = document.getElementById("editMovie");
editButton.onclick = setupEdit;
let alreadyClicked = false;

function setupEdit(){
    if(alreadyClicked===false){

        alreadyClicked = true;
        document.getElementById("removable").innerHTML = "";
        let basicInfoDiv = document.getElementById("basicInfo");

        let directorsRadio = createRadios("directorsRadio");
        directorsRadio.checked = true;
        let writersRadio = createRadios("writersRadio");
        let actorsRadio = createRadios("actorsRadio");
        basicInfoDiv.appendChild(document.createElement("br"));

        basicInfoDiv.appendChild(directorsRadio);
        basicInfoDiv.appendChild(document.createTextNode("Add directors"));
        basicInfoDiv.appendChild(document.createElement("br"));

        basicInfoDiv.appendChild(writersRadio);
        basicInfoDiv.appendChild(document.createTextNode("Add writers"));
        basicInfoDiv.appendChild(document.createElement("br"));

        basicInfoDiv.appendChild(actorsRadio);
        basicInfoDiv.appendChild(document.createTextNode("Add actors"));
        basicInfoDiv.appendChild(document.createElement("br"));
        basicInfoDiv.appendChild(document.createElement("br"));

        let textInput = document.createElement("input");
        textInput.type = "text";
        textInput.id = "personNameInput"
        basicInfoDiv.appendChild(textInput);
        textInput.addEventListener("keyup", typingName);

        basicInfoDiv.appendChild(document.createElement("hr"));

        //people list
        let listDiv = document.createElement("div");
        listDiv.id = "peopleList";
        basicInfoDiv.appendChild(listDiv);

        basicInfoDiv.appendChild(document.createElement("hr"));

        //not really a form, just in name
        let form = document.createElement("div");
        form.id = "form";


        basicInfoDiv.appendChild(form);

        let selectedDirectorsBox = document.createElement("select");
        selectedDirectorsBox.id = "directors";
        selectedDirectorsBox.multiple = true;
        selectedDirectorsBox.disabled = true;
        selectedDirectorsBox.size = "6";

        let selectedWritersBox = document.createElement("select");
        selectedWritersBox.id = "writers";
        selectedWritersBox.multiple = true;
        selectedWritersBox.disabled = true;
        selectedWritersBox.size = "6";

        let selectedActorsBox = document.createElement("select");
        selectedActorsBox.id = "actors";
        selectedActorsBox.multiple = true;
        selectedActorsBox.disabled = true;
        selectedActorsBox.size = "6";

        form.appendChild(selectedDirectorsBox);
        form.appendChild(document.createTextNode(" "));
        // form.appendChild(document.createElement("br"));

        form.appendChild(selectedWritersBox);
        form.appendChild(document.createTextNode(" "));

        // form.appendChild(document.createElement("br"));
        // form.appendChild(document.createElement("br"));

        form.appendChild(selectedActorsBox);
        form.appendChild(document.createTextNode(" "));

        form.appendChild(document.createElement("br"));
        form.appendChild(document.createElement("br"));


        let submitButt = document.createElement("button");
        submitButt.innerHTML = "save";
        submitButt.onclick = sendForm;
        basicInfoDiv.appendChild(submitButt);
    }
}

function createRadios(id){
    let radio = document.createElement("input");
    radio.id = id;
    radio.type = "radio";
    radio.name = "ignore";

    return radio;
}



let directors = [];
let actors = [];
let writers = [];


function sendForm(){
    if(directors.length == 0 && writers.length == 0 && actors.length == 0){
        window.location.href = window.location.href;
        window.alert("No inputs given!");
        return;
    }
    let selectedDirectors = document.getElementById("directors");
    selectedDirectors.disabled = false;
    let selectedWriters = document.getElementById("writers");
    selectedWriters.disabled = false;
    let selectedActors = document.getElementById("actors");
    selectedActors.disabled = false;
    console.log(directors);
    console.log(writers);
    console.log(actors);

    let obj = {
        actors: actors,
        writers: writers,
        directors: directors
    };

    let xhttp = new XMLHttpRequest();
    xhttp.onreadystatechange = function() {
		if(this.readyState==4 && this.status==200){
            window.location.href = window.location.href;
            window.alert("Movie Updated!"); // this probably won't get triggered I'd assume

        }
        else if(this.readyState==4 && this.status == 401){
            window.alert("You must be a signed in, contributing user!")
        }

    }
    xhttp.open("PUT", window.location.href, true);
    xhttp.setRequestHeader('Content-type', 'application/json');
    console.log(JSON.stringify(obj));
    xhttp.send(JSON.stringify(obj));
}





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
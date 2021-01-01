document.body.addEventListener("keyup",enter);
document.getElementById("person").addEventListener("keyup", typingName);

if(document.getElementById("addMovie")){
    document.getElementById("addMovie").onclick = goToMovieForm;
}
if(document.getElementById("addPerson")){
    document.getElementById("addPerson").onclick = goToPersonForm;
}

function goToMovieForm(){
    window.location.href = "/movieform";
}
function goToPersonForm(){
    console.log("hi")
    window.location.href = "/personform";
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
            console.log(data);
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
    xhttp.open("GET", "/people/list/" + document.getElementById("person").value, true);
    xhttp.setRequestHeader('Content-type', 'application/json');
    // console.log(JSON.stringify(document.getElementById("person").value));
    xhttp.send();
}

function fillBox(src){
	document.getElementById("person").value = src.textContent;
}

function fillBoxHelper(){
    fillBox(this)
}


//Enter pressed
function enter(event){
    let search = document.getElementById("search");
    let input = search.value;
    //if enter hit
    if(event.keyCode === 13){
        if(document.getElementById("movies").checked){
            let queryString = "";
            //get the value of the genre they want
            let genre = document.querySelector("input[name='genre']:checked").value;
            //get the name of the selected person
            let person = document.getElementById("person").value;
            //get the year before which
            let releaseYear = document.getElementById("releaseYear").value;
            //get the min rating
            let minRating = document.getElementById("ratingVal").value
            if(minRating > 10){
                window.alert("There are no movies with such ratings!");
                return;
            }

            let firstValue = true;
            if(input){
                if(!firstValue){
                    queryString+="&";
                }
                queryString+="search="+input;
                firstValue = false;
            }
            if(genre){
                if(!firstValue){
                    queryString+="&";
                }
                queryString+="genre="+genre;
                firstValue = false;
            }
            if(person){
                if(!firstValue){
                    queryString+="&";
                }
                queryString+="person="+person;
                firstValue = false;
            }
            if(releaseYear){
                if(!firstValue){
                    queryString+="&";
                }
                queryString+="releaseYear="+releaseYear;
                firstValue = false;
            }
            if(minRating){
                if(!firstValue){
                    queryString+="&";
                }
                queryString+="minRating="+minRating;
                firstValue = false;
            }

            window.location.href = "/movies?"+queryString;
        }
        else if(document.getElementById("people").checked){
            window.location.href = `/people?search=${input}`;
        }
        else if(document.getElementById("users").checked){
            window.location.href = `/users?search=${input}`;
        }
    }
}
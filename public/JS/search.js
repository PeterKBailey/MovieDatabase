document.getElementById("search").addEventListener("keyup",enter);
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

//Enter pressed
function enter(event){
    let search = document.getElementById("search");
    let input = search.value;
    //if enter hit
    if(event.keyCode === 13){
        window.location.href = `/movies?search=${input}`;
    }
}
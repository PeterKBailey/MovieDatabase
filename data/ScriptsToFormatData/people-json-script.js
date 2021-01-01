let movies = require("./movies-data.json");
const fs = require('fs');

let peopleObj={}

function containsPerson(pName){
    for (let person in peopleObj) {
        if(peopleObj[person].name == pName){
            return person;
        }
    }
    return null;
}

for(movieTitle in movies){
    for(director of movies[movieTitle].directors){
        let personObj = {};
        //if we don't have this director listed as a person
        if(!peopleObj[director]){
            personObj.name = director;
            personObj.directed = [movieTitle];
            personObj.written = [];
            personObj.acted = [];
            personObj.collaborators = [];
            personObj.followers = [];
            personObj.pic = "https://www.pphfoundation.ca/wp-content/uploads/2018/05/default-avatar.png";
            peopleObj[director] = personObj;
        }
        //if we do, add this to their directing roles
        else{
            peopleObj[director].directed.push(movieTitle);
        }
    }

    for(writer of movies[movieTitle].writers){
        let personObj = {};
        //if we don't have this writer listed as a person
        if(!peopleObj[writer]){
            personObj.name = writer;
            personObj.directed = [];
            personObj.written = [movieTitle];
            personObj.acted = [];
            personObj.collaborators = [];
            personObj.followers = [];
            personObj.pic = "https://www.pphfoundation.ca/wp-content/uploads/2018/05/default-avatar.png";
            peopleObj[writer] = personObj;
        }
        //if we do, add this movie to their writing roles
        else{
            peopleObj[writer].written.push(movieTitle);
        }
    }
    
    for(actor of movies[movieTitle].actors){
        let personObj = {};
        //if we don't have this actor listed as a person
        if(!peopleObj[actor]){
            personObj.name = actor;
            personObj.directed = [];
            personObj.written = [];
            personObj.acted = [movieTitle];
            personObj.collaborators = [];
            personObj.followers = [];
            personObj.pic = "https://www.pphfoundation.ca/wp-content/uploads/2018/05/default-avatar.png";
            peopleObj[actor] = personObj;
        }
        //if we do, add this to their acting roles
        else{
            peopleObj[actor].acted.push(movieTitle);
        }
    }
}



fs.writeFile('people-data.json', JSON.stringify(peopleObj, null, 2), function(err) {
    if (err) throw err;
    console.log('complete');
});
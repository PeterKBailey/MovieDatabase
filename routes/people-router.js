const express = require('express');
let router = express.Router({strict: true});
router.use(express.static('public'));


// function authorise(req, res, next){
//     if(req.session.isContributing){
//         next();
//     }
//     else{
//         //unauthorised - 403 maybe should be used because that's when we know the client's identity
//         res.status(401).send();
//     }
// }

router.get("/", loadPeople);
router.get("/list/:input", findPeople);
router.get("/:name", loadPerson);
//for now you don't need to be authorised to add a person in case I add this to the REST API
router.post("/", addPerson);

/*
Inputs:
request and response objects

Output:
Renders the search results when searching for people by name
OR it will send back a JSON of all matching people if requested (REST API)
*/
function loadPeople(req,res){
    let query = req.query.search;
    let found = Object.values(req.app.locals.people);
    //if there's a query, search for matching movies
    if(query){
        query = query.toLowerCase();
        found = [];
        let actual = [];
        for(personName in req.app.locals.people){
            if(personName.toLowerCase() === query){
                actual.push(req.app.locals.people[personName]);
            }
            else if(personName.toLowerCase().startsWith(query)){
                found.push(req.app.locals.people[personName]);
            }
        }
        //essentially make sure that the actual result is at the top
        found = actual.concat(found);

    }
    //so this is strange because it's adding a key value pair, which wasn't originally intended but still works in a manner that found is an array but also has properties?
    let type = "person";
    res.format(
        {
            "application/json" : function(){
                res.status(200).send(found.slice(0, 100))
            },

            "text/html" : function(){
                res.render("SearchResults.pug", {requestingUser: req.session, Found: found.slice(0, 100), type, genres: req.app.locals.genres, people: Object.keys(req.app.locals.people)});
            }
        }
    );
}


function findPeople(req, res){
    let search = req.params.input.toLowerCase();
    // console.log(req.params);
    // console.log(search);
    let found = [];
    let people = req.app.locals.people;
    let count = 0;
    for(let person in people){
        // console.log(people[person].name);
        if(people[person].name.toLowerCase().startsWith(String(search))){
            // console.log("made it")
            found.push(people[person].name);
            count++;
            if(count == 5){
                break;
            }
        }
    }
    // console.log(found);
    if(!found || found.length === 0){
        res.status(404).send();
        return;
    }
    res.status(200).send(found);
}



/*
Inputs:
request and response objects

Output:
Renders a persons profile
OR it will send back a JSON of that person if requested (REST API)
*/
function loadPerson(req,res){
    let name = req.params.name;
    let person = req.app.locals.people[name];
    if(!person){
        res.status(404).send();
        return;
    }
    findCollabs(person, person.directed, req.app.locals.movies);
    findCollabs(person, person.written, req.app.locals.movies);
    findCollabs(person, person.acted, req.app.locals.movies);

    let collaborators = [];
    for(name of person.collaborators){
        collaborators.push(req.app.locals.people[name]);
    }
    res.format(
        {
            "application/json" : function(){
                res.status(200).send(person)
            },

            "text/html" : function(){
                res.render("person.pug", {requestingUser: req.session, person, collaborators});
            }
        }
    );
}

function findCollabs(personObj, movieList, movies){
    if(personObj.collaborators.length >= 5){
        return;
    }
    for(movieTitle of movieList){
        let movie = movies[movieTitle];
        let listPeople = movie.directors.concat(movie.writers);
        listPeople = listPeople.concat(movie.actors);
        for(name of listPeople){
            if(personObj.collaborators.length >= 5){
                return;
            }
            //we don't want to push the person looking for collabs, and we don't want to push the same name twice
            if(personObj.name !== name && !personObj.collaborators.includes(name)){
                personObj.collaborators.push(name);
            }
        }
    }
}


/*
Inputs:
request and response objects

Purpose:
Adds a person to our people data, it also updates all movies that the person was specified to work on
*/
function addPerson(req,res){
    //the only requirement for adding a person is a name
    if(!req.body.name){
        //not acceptable
        res.status(406).send();
        return;
    }
    if(req.app.locals.people.hasOwnProperty(req.body.name)){
        //conflict
        res.status(409).send();
        return;
    }
    let newPerson = {};
    //all required parameters
    newPerson.name = req.body.name;
    newPerson.collaborators = [];
    newPerson.followers = [];
    //this is a labourous process of initialising all relevant details, we do it like this 
    //because we don't want to save additional info that may have been in the body
    setArrayProperty(newPerson, "directed", req.body);
    setArrayProperty(newPerson, "written", req.body);
    setArrayProperty(newPerson, "acted", req.body);

    if(req.body.hasOwnProperty("pic")){
       if(req.body.poster!=""){
        newPerson.pic = req.body.pic;
       }
    }
    else{
        newPerson.pic = "https://www.pphfoundation.ca/wp-content/uploads/2018/05/default-avatar.png"
    }
    
    //this is required in case the body contained invalid info
    req.app.locals.people[req.body.name] = newPerson;

    addAndUpdateMovie(newPerson, req.app.locals.movies, "actors");
    addAndUpdateMovie(newPerson, req.app.locals.movies, "directors");
    addAndUpdateMovie(newPerson, req.app.locals.movies, "writers");


    res.redirect("/people/"+req.body.name);


}

//NOTE: this function is in both the people and movie routers, still need to figure out how to share it across files
/*
Inputs:
newObject -movie or person
property - the array property we want to update
givenObject -the object with the property we're updating newObject to

Outputs:
updated newObject

Purpose:
This is just a way of setting up properties when adding people or movies
its meant specifically for arrays like directors or directed etc
*/
function setArrayProperty(newObject, property, givenObject){
    if(givenObject.hasOwnProperty(property)){
        if(Array.isArray(givenObject[property])){
            newObject[property] = givenObject[property];
        }
        else{
            newObject[property] = [];
            newObject[property].push(givenObject[property]);
        }
    }
    else{
        newObject[property] = [];
    }
}

/*
Inputs:
Person who just got added
object of all movies
the role the user played in a movie

Purpose:
Updates all movies a new person worked on after person object added
*/
function addAndUpdateMovie(personObject, movies, property){
    let personProp = "";
    if(property==="actors"){
        personProp = "acted";
    }else if(property==="directors"){
        personProp = "directed";
    }else{
        personProp = "written"
    }
    for(movie of personObject[personProp]){
        if(movies.hasOwnProperty(movie)){
            // console.log("reached!")
            movies[movie][property].push(personObject.name);      
        }
    }
}



module.exports = router;
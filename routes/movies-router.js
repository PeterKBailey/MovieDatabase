const express = require('express');
const fs = require('fs');
let router = express.Router();
router.use(express.static('public'));

//Middleware for authorising a user to update a movie - which can't actually be done from the front end yet
function authorise(req, res, next){
    if(req.session.isContributing){
        console.log("here! contributing");

        next();
    }
    else{
        //unauthorised
        console.log("here! Not contributing");
        res.status(401).send();
    }
}


router.get("/", loadMovies);
router.get("/:movieName", loadMovie);
router.get("/list/:input", findMovies);

//you don't actually need to be authorised to add a movie because the rest API is public and allows such a thing
//instead in the html page, the button to add movie only appears if you're a contributing user
router.post("/", addMovie);
router.put("/:movieName", authorise, updateMovie);
//authorisation middleware doesn't apply for this specific option because anyone can add review
router.post("/:movieName/reviews", postReview);

/*
Inputs:
request and response objects

Output:
Renders the search results when searching for movies with all filters
OR it will send back a JSON of all matching movies if requested (REST API)
*/
function loadMovies(req,res){
    let search = req.query.search;
    let found = Object.values(req.app.locals.movies);
    //if there's a query, search for matching movies
    if(search){
        search = search.toLowerCase();
        found = [];
        let actual = [];
        for(movieTitle in req.app.locals.movies){
            if(movieTitle.toLowerCase() === search){
                actual.push(req.app.locals.movies[movieTitle]);
            }
            else if(movieTitle.toLowerCase().search(search)>-1){
                found.push(req.app.locals.movies[movieTitle]);
            }
        }
        found = actual.concat(found);
    }
    let type = "movie";
    found = filterMovies(found, req.query);

    res.format(
        {
            "application/json" : function(){
                res.status(200).send(found.slice(0, 100))
            },

            "text/html" : function(){
                res.render("SearchResults.pug", {requestingUser: req.session, Found: found.slice(0,100), type, genres: req.app.locals.genres, people: Object.keys(req.app.locals.people)});
            }
        }
    );
}

/*
Inputs:
Movies already found, and all search parameters

Output:
movies that meet the search parameters (genre, year, person etc)
*/
function filterMovies(foundMovies, queryParams){
    if(queryParams.genre){
        foundMovies = foundMovies.filter(function(movie){
            return movie.genres.includes(queryParams.genre);
        })
    }
    if(queryParams.person){
        foundMovies = foundMovies.filter(function(movie){
           return movie.actors.includes(queryParams.person) || movie.directors.includes(queryParams.person) || movie.writers.includes(queryParams.person);
        })
    }
    if(queryParams.releaseYear){
        foundMovies = foundMovies.filter(function(movie){
            return movie.releaseYear == queryParams.releaseYear;
        })
    }
    if(queryParams.minRating){
        foundMovies = foundMovies.filter(function(movie){
            return movie.averageRating>=parseFloat(queryParams.minRating)
        })
    }
    return foundMovies
}


/*
Inputs:
request and response objects

Output:
Renders a movie page
OR it will send back a JSON of that movie if requested (REST API)
*/
function loadMovie(req,res){
    let movieTitle = req.params.movieName;
    let movie = req.app.locals.movies[movieTitle];
    if(!movie){
        res.status(404).send();
        return;
    }
    //HERE TO BE CHANGED
    let similar = findSimilar(req.app.locals.movies[movieTitle], req.app.locals.movies);
    // req.app.locals.movies[movieTitle].similar = Object.keys(similar);
    for(let movie of similar){
        req.app.locals.movies[movieTitle].similar.push(movie.title);
    }
    res.format(
        {
            "application/json" : function(){
                res.status(200).send(movie)
            },

            "text/html" : function(){
                res.render("movie.pug", {requestingUser: req.session, movie: req.app.locals.movies[movieTitle], similar});
            }
        }
    );
}


function findMovies(req, res){
    let search = req.params.input.toLowerCase();
    // console.log(req.params);
    // console.log(search);
    let found = [];
    let movies = req.app.locals.movies;
    let count = 0;
    for(let movie in movies){
        // console.log(people[person].name);
        if(movies[movie].title.toLowerCase().startsWith(String(search))){
            // console.log("made it")
            found.push(movies[movie].title);
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
Movie added to database
Works with Rest API

It also updates all people in the database who were specified to work on this movie
*/
function addMovie(req, res){
    if(!validateMovie(req.body)){
        //not acceptable
        res.status(406).send();
        return;
    }
    // console.log()
    let movie = findMovie(req.body.title, req.app.locals.movies);
    if(movie){
        //conflict
        res.status(409).send();
        return;
    }
    //well hold on this would mean people could post any kind of info, i need to check that only movie attributes are being added
    let newMovie = {};
    //all required parameters
    newMovie.title = req.body.title;
    newMovie.releaseYear = req.body.releaseYear;
    newMovie.country = req.body.country;
    newMovie.plot = req.body.plot;
    newMovie.runtime = req.body.runtime;

    //this is a labourous process of initialising all relevant details, we do it like this 
    //because we don't want to save additional info that may have been in the body
    setArrayProperty(newMovie, "directors", req.body);
    setArrayProperty(newMovie, "writers", req.body);
    setArrayProperty(newMovie, "actors", req.body);
    setArrayProperty(newMovie, "genres", req.body);


    
    if(req.body.hasOwnProperty("poster")){
       if(req.body.poster!=""){
        newMovie.poster = req.body.poster;
       }
       else{
        newMovie.poster = "https://i.pinimg.com/originals/be/58/f5/be58f582e749c1f722df0f38be5e0995.jpg"
        }
    }
    else{
        newMovie.poster = "https://i.pinimg.com/originals/be/58/f5/be58f582e749c1f722df0f38be5e0995.jpg"
    }

    newMovie.numRatings = 0;
    newMovie.sumRatings = 0;
    newMovie.averageRating = 0;
    newMovie.reviews = {};
    //HERE TO BE CHANGED
    newMovie.similar = Object.keys(findSimilar(newMovie, req.app.locals.movies));

    //this is required in case the body contained invalid info
    req.app.locals.movies[req.body.title] = newMovie;

    //now for all the people in the movie, add to their roles
    addAndUpdatePerson(newMovie, req.app.locals.people, "acted", req.app.locals.users);
    addAndUpdatePerson(newMovie, req.app.locals.people, "written", req.app.locals.users);
    addAndUpdatePerson(newMovie, req.app.locals.people, "directed", req.app.locals.users);

    //super secret passcode passed with form data, tells us whether to redirect to the movie page, or send back the JSON
    if(req.body.secret==="superSecretPassCode"){
        res.redirect("/movies/"+req.body.title);
    }
    else{
        res.status(200).send(newMovie);
    }
}

/*
Inputs:
request and response objects

Output:
Updates a movie with the inputted information
*/
function updateMovie(req, res){
    console.log(req.params.movieName);
    let movie = findMovie(req.params.movieName, req.app.locals.movies);
    // console.log("Here! in update movie");
    //can't update a non existant movie
    if(!movie){
        //movie not found
        res.status(404).send();
        return;
    }
    //avoid unnecessary looping, go over only the provided data and add it to the movie
    // console.log(req.body);
    for(property in req.body){
        // console.log(property);
        //only allow data that a movie should have to be updated (avoid extra data), don't allow update title of movies
        if(movie.hasOwnProperty(property) && property !="title"){
            if(Array.isArray(movie[property])){
                //push all people who aren't already in the list
                for(person of req.body[property]){
                    if(!movie[property].includes(person)){
                        movie[property].push(person);
                    }
                }
                let personProp = "";
                if(property==="actors"){
                    personProp = "acted";
                }else if(property==="directors"){
                    personProp = "directed";
                }else{
                    personProp = "written"
                }
                //add to people object that is
                addAndUpdatePerson(movie, req.app.locals.people, personProp, req.app.locals.users);
            }else{
                //in case I choose to allow users to update other parts of a movie
                movie[property] = req.body[property];
            }
        }
    }
    res.status(200).send();
}

/*
Inputs:
movieObject - a movie object, to be valid it has to be in our list of movies
movies - object containing all movies

Outputs:
true or false depending on if valid
*/
function validateMovie(movieObject){
    // console.log(movieObject)
    if(!movieObject){
        console.log("here")
        return false;
    }
    //if missing key properties, not valid
    if(!movieObject.title || !movieObject.releaseYear || !movieObject.country || !movieObject.plot || !movieObject.runtime){
        console.log("no here")
        
        return false;
    }
    return true;
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
Updates all people with the new movie they worked on after movie object added
NOTE IT ALSO CREATES PEOPLE OBJECTS if they didn't belong to the database, this was a specification of the REST API
*/
function addAndUpdatePerson(movieObject, people, property, users){
    let movieProp = "";
    if(property==="acted"){
        movieProp = "actors";
    }else if(property==="directed"){
        movieProp = "directors";
    }else{
        movieProp = "writers"
    }
    for(person of movieObject[movieProp]){
        // console.log(person);
        //if the actor isn't already in our people list, create them
        if(!people.hasOwnProperty(person)){
            let newPerson = {};
            newPerson.name = person;
            newPerson.pic = "https://www.pphfoundation.ca/wp-content/uploads/2018/05/default-avatar.png";
            newPerson.directed = [];
            newPerson.written = [];
            newPerson.acted = [];
            newPerson.followers = [];
            newPerson.collaborators = [];
            newPerson[property].push(movieObject.title);
            people[person] = newPerson;        
        }
        //if they are in our list, update their repetoire - this is where notification should happen probably
        //only add a movie to the persons work if they don't already have it in that section
        else if(people.hasOwnProperty(person) && !people[person][property].includes(movieObject.title)){
            people[person][property].push(movieObject.title);      
            for(let username of people[person].followers){
                users[username].notifications.push(people[person].name + " worked on \"" + movieObject.title + "\" as a(n) " + movieProp.substr(0, movieProp.length-1));
            }
        }
    }
}

/*
Inputs:
movie object to find similar for
object of all movies

Purpose:
finds movies that are "similar" to the specified similar using genres, people, country, etc
*/
function findSimilar(movie, movies){
    let similarMovies = [];
    let count = 0;
    //For now we'll just find some similar movies upon loading
    for(otherMovieTitle in movies){
        let similarity = 0;
        //only need 3 similar movies
        if(count === 3){
            break;
        }

        //we only want different movies to be put in the similar list        
        if(otherMovieTitle !== movie.title){
            if(movie.releaseYear === movies[otherMovieTitle].releaseYear){
                similarity++;
            }
            if(movie.country === movies[otherMovieTitle].country){
                similarity++;
            }
            //now look through the genres of the current movie, if there are any matching cases the movies are similar
            for(genre of movie.genres){
                if(movies[otherMovieTitle].genres.includes(genre)){
                    similarity++;
                }
            }
            //now look through the actors of the current movie, if there are any matching cases the movies are similar
            for(actor of movie.actors){
                if(movies[otherMovieTitle].actors.includes(actor)){
                    similarity++;
                }
            }
            //same idea with directors
            for(director of movie.directors){
                if(movies[otherMovieTitle].directors.includes(director)){
                    similarity++;
                }
            }
            //now lets set an arbitrary value of 4 to be the needed similarity
            if(similarity>=4){
                similarMovies[count] = movies[otherMovieTitle];
                count++;
            }
        }
    }
    return similarMovies;
}

//To handle posting reviews, there isn't any logic validating the review yet. That's in the business logic file
/*
Inputs:
req and res objects

Purpose:
Posts a review to a movie, this is done by adding the object to the movie and the movie title to the user
From there it's easy to find the user's review in the movie because the user is only allowed one
*/
function postReview(req,res){
    let name = req.params.movieName;
    let ratingVal = parseFloat(req.body.rating);
    let today = new Date();
    let review = {
        user : req.session.username,
        movie: name,
        rating : ratingVal,
        content : req.body.content,
        datePosted : `${today.getDate()}/${today.getMonth()}/${today.getFullYear()}`
    };
    if(!isValidReview(review, req.app.locals.users, req.app.locals.movies)){
        console.log("It wasnt valid!!");
        res.status(406).send(); // really if i make the website only visible to logged in users then this shouldn't be the case unless yknow it actually isn't valid
        return;
    }
    let movie = req.app.locals.movies[name];

    //it was a valid review, if that user has already reviewed, then this new one will replace it
    let isUpdate = false;
    if(movie.reviews[review.user]){
        movie.sumRatings-=movie.reviews[review.user].rating;
        movie.numRatings--;
        isUpdate = true;
    }
    movie.reviews[review.user] = review;
    movie.numRatings++;
    movie.sumRatings+=review.rating;
    movie.averageRating = movie.sumRatings / movie.numRatings;
    
    let user = getUser(req.session.username, req.app.locals.users);
    user.reviews.push(name);
    for(let follower of user.followers){
        console.log(follower);
        if(isUpdate){
            req.app.locals.users[follower].notifications.push(req.session.username + " has updated their review of " + movie.title);
        }else{
            req.app.locals.users[follower].notifications.push(req.session.username + " has uploaded a review for " + movie.title);
        }
        // console.log(req.app.locals.users[follower].notifications);
    }
    // console.log(user.reviews);
    res.status(200).send();
}


/*
Inputs:
reviewObject - a review object, to be valid it has to have a user, movie, rating, and date

Outputs:
true or false depending on if valid
*/
//Notice that to be a valid review, there doesn't need to be a body/content. It can just be a rating (basic review)
function isValidReview(reviewObject, users, movies){
    if(!reviewObject){
        console.log("heres why");
        return false;
    }
    if(!getUser(reviewObject.user, users) || !findMovie(reviewObject.movie, movies) || !reviewObject.rating || !reviewObject.datePosted){
        if(!getUser(reviewObject.user, users)){
            console.log("this is why!");
        }
        if(!findMovie(reviewObject.movie, movies)){
            console.log("this is why 2");
        }
        if(!reviewObject.rating){
            console.log("this is why 3");
        }
        if(!reviewObject.datePosted){
            console.log("This is why 4");
        }

        return false;
    }

    return true;
}

/*
Inputs:
title - the title of the movie being requested

Output:
The movie with that title if it exists, otherwise null
*/
function findMovie(title, movies){
    if(movies.hasOwnProperty(title)){
        return movies[title];
    }
    return null;
}

/*
Inputs:
username - the username of the user being requested
users - the object we want to find the user from

Output:
The user with the given id, if it exists, otherwise null
*/
function getUser(username, users){
    if(users.hasOwnProperty(username)){
        return users[username];
    }
    return null;
}

module.exports = router;
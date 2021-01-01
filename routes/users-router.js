const express = require('express');
let router = express.Router();
router.use(express.static('public'));


router.get("/", loadUsers);
router.get("/:username", loadUser);
router.delete("/:username/notifications", auth, clearNotifs);
router.delete("/session", logout);
router.put("/session", authorise, updateUser);
router.patch("/session/following", authorise, updateFollowing)

function auth(req,res,next){
    if(req.params.username === req.session.username){
        next();
        return;
    }
    console.log("clearing someone else's notifs!");
    res.status(401).send();
}
/*
Inputs:
request and response objects as well as the next middleware in the chain

Purpose:
verifies that a user has the authority to make the changes they are requesting
*/
function authorise(req,res,next){
    let user = req.app.locals.users[req.session.username];

    if(!user){
        //user doesn't exist
        res.status(404).send();
        return;
    }

    next();
}

/*
Inputs:
request and response objects

Output:
Renders the search results when searching for users by username
OR it will send back a JSON of all matching users if requested (REST API)
*/
function loadUsers(req,res){
    let query = req.query.search;
    let found = req.app.locals.users;
    // console.log(req.app.locals.users);
    //if there's a query, search for matching movies
    if(query){
        query = query.toLowerCase();
        found = [];
        let actual = [];
        for(username in req.app.locals.users){
            if(username.toLowerCase() === query){
                actual.push(req.app.locals.users[username]);
            }
            else if(username.toLowerCase().search(query)>-1){
                found.push(req.app.locals.users[username]);
            }
        }
        //essentially make sure that the user with this name is at the top
        found = actual.concat(found);
    }
    let type = "user"
    //For the REST API
    res.format(
        {
            "application/json" : function(){
                let foundUsers = {};
                
                for(user in found){
                    let REVIEWS = [];
                    //push the review found on the movie with the given title at the users name
                    for(movieTitle in found[user].reviews){
                        REVIEWS.push(findMovie(movieTitle, req.app.locals.movies).reviews[user])
                    }
                    
                    foundUsers[user] = {
                        username: found[user].username,
                        isContributing: found[user].isContributing,
                        reviews: REVIEWS
                    };
                }

                res.status(200).send(foundUsers)
            },

            "text/html" : function(){
                res.render("SearchResults.pug", {requestingUser: req.session, Found: found, type, genres: req.app.locals.genres, people: Object.keys(req.app.locals.people)});
            }
        }
    );
}

/*
Inputs:
request and response objects

Output:
Renders a users profile
OR it will send back a JSON of that user if requested (REST API)
*/
function loadUser(req,res){
    let username = req.params.username.toLowerCase();
    let user = req.app.locals.users[username];
    //maybe come up with a render page for 404 status?
    if(!user){
        res.status(404).send();
        return;
    }
    let reviews = {};
    //basically the user object only stores a list of the movies they have reviewed, and we can go to each of those movies and retrieve the review stored as the value for the key which is the username
    for(movieTitle of user.reviews){
        //find the movie, (the reviews array in a user just holds titles of movies they've reviewed to save on storage)
        let movie = findMovie(movieTitle, req.app.locals.movies);

        //the value for the title key is the review object located in the movie object, stored at the username key
        reviews[movieTitle] = movie.reviews[username];
    }
    
    res.format(
        {
            "application/json" : function(){
                let foundUser = {};
                //when sending a JSON of the user we only want to send some information about them, the reviews will also be full review objects
                foundUser.username = user.username;
                foundUser.isContributing = user.isContributing;
                foundUser.reviews = reviews;
                res.status(200).send(foundUser)
            },

            "text/html" : function(){
                if(req.session.username === req.params.username){
                    findFavoriteAndRecommend(user, req.app.locals.movies);
                    res.render("profile.pug", {requestingUser: req.session, user, reviews});
                    return;
                }
                res.render("user.pug",{requestingUser: req.session, user, reviews});
            }
        }
    );
}
/*
Inputs:
-A user Object we are finding recommended movies for
-A movies Object of movies to pick from

Output:
The user is now updated with those random choices
*/
//Just pick some random movies for now
function findFavoriteAndRecommend(userObject, moviesObj){
    let numMovies = 8;
    //These loops just pick random movies and add them to the users favorites or recommended
    for(let i = 0; i<numMovies; i++){
        if(userObject.favorites.length==8){
            break;
        }
        let index = Math.floor(Math.random() * Object.keys(moviesObj).length);
        let mov = findMovie(Object.keys(moviesObj)[index], moviesObj);
        userObject.favorites.push(mov);
    }
    for(let i = 0; i<numMovies; i++){
        if(userObject.recommended.length==8){
            break;
        }
        let index2 = Math.floor(Math.random() * Object.keys(moviesObj).length);
        let mov2 = findMovie(Object.keys(moviesObj)[index2], moviesObj);
        userObject.recommended.push(mov2);
    }
}


/*
Inputs:
request and response objects

Output:
Terminates the session object
*/
function logout(req,res){
    if(req.session.username){
        req.session.destroy();
        res.status(200).send();
        return;
    }
    else{
        //Conflict, trying to log out a 2nd time
        res.status(409).send();
    }
}


function clearNotifs(req, res){
    let user = req.app.locals.users[req.session.username];
    user.notifications = [];
    res.status(200).send();
}


/*
Inputs:
request and response objects

Output:
User gets updated with matching properties (for now it's just contributing but it should be easy to add other changes)
*/
function updateUser(req,res){
    // console.log(req.body);
    let user = req.app.locals.users[req.session.username];

    //avoid unnecessary looping, go over only the provided data and add it to the user
    for(property in req.body){
        //only allow data that a movie should have to be updated (avoid extra data)
        if(user.hasOwnProperty(property)){
            // console.log(property);
            user[property] = req.body[property];
            // console.log(user[property]);
            req.session[property] = user[property];
        }
    }
    res.status(200).send()
}

/*
Inputs:
request and response objects

Purpose:
User no longer has specified people or users in their following list
and those people and users no longer have requesting user in followers list
*/
function updateFollowing(req, res){

    if(req.body.unfollow == true){
        unfollow(req,res);
    }
    else if(req.body.unfollow == false){
        follow(req,res);
    }
    else{
        //bad request, missing info
        res.status(400).send();
    }
}

function unfollow(req, res){
    let toBeUnfollowed = req.body;
    let user = req.app.locals.users[req.session.username];
    //remove the users and people from the requesting user's list
    user.usersFollowing = user.usersFollowing.filter(function(username){
        return !toBeUnfollowed.users.includes(username);
    })
    user.peopleFollowing = user.peopleFollowing.filter(function(name){
        return !toBeUnfollowed.people.includes(name);
    })

    //remove the requesting user from the other users's followers
    for(username of toBeUnfollowed.users){
        let index = req.app.locals.users[username].followers.indexOf(req.session.username);
        if(index!=-1){
            req.app.locals.users[username].followers.splice(index, 1)
        }
    }
    //and from the people's followers
    for(name of toBeUnfollowed.people){
        let index = req.app.locals.people[name].followers.indexOf(req.session.username);
        if(index!=-1){
            req.app.locals.people[name].followers.splice(index, 1)
        }
    }

    res.status(200).send();
}

function follow(req, res){
    let toBeFollowed = req.body;
    let user = req.app.locals.users[req.session.username];
    //add the users and people to the requesting user's list and to those users/people's following list
    for(username of toBeFollowed.users){
        if(req.app.locals.users.hasOwnProperty(username) && !user.usersFollowing.includes(username)){
            user.usersFollowing.push(username);
            req.app.locals.users[username].followers.push(req.session.username);
        }
        //otherwise theyre trying to follow a non existant user ( or the same user twice )
        else{
            res.status(400).send()
            return;
        }
    }
    for(person of toBeFollowed.people){
        if(req.app.locals.people.hasOwnProperty(person) && ! user.peopleFollowing.includes(person)){
            user.peopleFollowing.push(person);
            req.app.locals.people[person].followers.push(req.session.username);
        }
        //otherwise theyre trying to follow a non existant person ( or the same person twice )
        else{
            res.status(400).send()
            return;
        }
    }

    res.status(200).send();
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

module.exports = router;
let movies = require("./movie-data-long.json");
const fs = require('fs');

let moviesObj={}

movies.forEach(m => {
    let mObj = {}
    mObj.title = m.Title;
    mObj.releaseYear = m.Year;
    mObj.runtime = m.Runtime;
    mObj.genres = m.Genre.split(",").map(str => {return str.trim();});
    // mObj.directors = m.Director.split(",").map(str => {return str.trim();});
    // mObj.actors = m.Actors.split(",").map(str => {return str.trim();});
    mObj.writers = [];
    mObj.actors = [];
    mObj.directors = [];

    let result = m.Writer.split(",")
    for (let i = 0; i < result.length; i++) {//getting rid of the text inside the brackets 
        result[i] = result[i].split("(")[0].trim();  
    }
    result.forEach(person => {//adding writers (no duplicates)
        if(!mObj.writers.includes(person)){
            mObj.writers.push(person);
        }
    });

    result = m.Director.split(",")
    for (let i = 0; i < result.length; i++) {//getting rid of the text inside the brackets 
        result[i] = result[i].split("(")[0].trim();  
    }
    result.forEach(person => {//adding writers (no duplicates)
        if(!mObj.directors.includes(person)){
            mObj.directors.push(person);
        }
    });

    result = m.Actors.split(",")
    for (let i = 0; i < result.length; i++) {//getting rid of the text inside the brackets 
        result[i] = result[i].split("(")[0].trim();  
    }
    result.forEach(person => {//adding writers (no duplicates)
        if(!mObj.actors.includes(person)){
            mObj.actors.push(person);
        }
    });

    mObj.plot = m.Plot;
    mObj.country = m.Country;
    mObj.poster = m.Poster;
    mObj.reviews = {};
    mObj.numRatings = 0;
    mObj.sumRatings = 0;
    mObj.averageRating = 0;
    mObj.similar = [];
    //if we get movies with duplicate names (remakes etc) then we label them by year
    if(!moviesObj[m.Title]){
        moviesObj[m.Title] = mObj;
    }
    //we want to separate the 2 movies by the year in which they were released
    else{
        let mov = moviesObj[m.Title];
        let title1 = mov.title + " (" + mov.year + ")";
        moviesObj[title1] = mov;
        delete moviesObj[m.Title];

        let title2 = mObj.title + " (" + mObj.year + ")";
        moviesObj[title2] = mObj;
    }
});

fs.writeFile('movies-data-long.json', JSON.stringify(moviesObj, null, 2), function(err) {
    if (err) throw err;
    console.log('complete');
});
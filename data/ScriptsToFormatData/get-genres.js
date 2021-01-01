let movies = require("./movies-data.json");
const fs = require('fs');

let genres = [];

for(movie in movies){
    for(genre of movies[movie].genres){
        if(!genres.includes(genre)){
            genres.push(genre);
        }
    }
}



fs.writeFile('genres.json', JSON.stringify(genres, null, 2), function(err) {
    if (err) throw err;
    console.log('complete');
});
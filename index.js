const express = require('express')
const app = express()
const port = 3010

const unirest = require('unirest')
const { config } = require('dotenv')
const { connectToDb, getDb } = require('./mongo')

config()

app.set('view engine', 'ejs');

app.use(express.json())
app.use(express.urlencoded({ extended: true}));


app.get('/', (req, res) => {
  const searchterm = "harry%20potter";
  const request = unirest("GET", `https://api.themoviedb.org/3/search/movie?api_key=${process.env.TMDB_API_KEY}&language=en-US&query=${searchterm}&page=1&include_adult=false`);
  request.end(function (response) {
    if (response.error) throw new Error(response.error);
    res.render('home', {
      title: "Movielist",
      movies: response.body.results
    });
  });
})

app.post('/search', (req, res) => {
  const searchterm = encodeURI(req.body.movie_search);
  const request = unirest("GET", `https://api.themoviedb.org/3/search/movie?api_key=${process.env.TMDB_API_KEY}&language=en-US&query=${searchterm}&page=1&include_adult=false`);
  request.end(function (response) {
    if (response.error) throw new Error(response.error);
    res.render('home', {
      title: "Movielist",
      movies: response.body.results,
    });
  });
})

app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`)
})
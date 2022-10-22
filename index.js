const express = require('express')
const app = express()
const port = 3010

const unirest = require('unirest')
const { config } = require('dotenv')
const { auth, requiresAuth } = require('express-openid-connect')
const { connectToDb, getDb } = require('./mongo')

config()

// Connect to Auth0
const auth_config = {
  authRequired: false,
  auth0Logout: true,
  secret: process.env.CLIENT_SECRET,
  baseURL: 'http://localhost:3010',
  clientID: process.env.CLIENT_ID,
  issuerBaseURL: process.env.BASE_URL
};

// auth router attaches /login, /logout, and /callback routes to the baseURL
app.use(auth(auth_config));

// req.isAuthenticated is provided from the auth router
// app.get('/', (req, res) => {
    

//   res.send(req.oidc.isAuthenticated() ? 'Logged in' : 'Logged out');
// });

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

app.get('/profile', requiresAuth(), (req, res) => {
  let user = req.oidc.user;
  // movies should be the object with all the details needed to render
  // ie. images from the API above
  let movies = []
  let db
  let movieobj = {}
  
  connectToDb((err) => {
    if (!err) {
      db = getDb()
      db.collection('movielist')
        .find({ id: user.sub })
        .forEach(movie => {
          for (var id of movie.movies) {
            unirest.get(`https://api.themoviedb.org/3/movie/${id}?api_key=${process.env.TMDB_API_KEY}&language=en-US`).end(function (response) {
                if (response.error) throw new Error(response.error);
                let data = response.body.title
                // console.log(data)
                return data;
                });
             }
        })
        // .then(() => {
        //   forE
        // })
        .then((data) => {
          console.log(data)
          res.render('profile', {
          user: user,
          title: "Profile Page",
          movies: movies
          })
        })
      } else {
      res.json(err)
      }
  })
  //Check if the user id exists in the DB:
  
      // inDB = "located in DB"
      // res.render('home', { user: user, inDB: inDB })


  // if yes, then movie forward

  // if not,
  
  // Check if the user has a list of movies

  




  // If they do, put it in the search term
  // if not, then use the below filler

  // const searchterm = "harry%20potter";
  // const request = unirest("GET", `https://api.themoviedb.org/3/search/movie?api_key=${process.env.TMDB_API_KEY}&language=en-US&query=${searchterm}&page=1&include_adult=false`);
  // request.end(function (response) {
  //   if (response.error) throw new Error(response.error);
  //   res.render('home', {
  //     title: "Movielist",
  //     movies: response.body.results,
  //     user: user
  //   });
  // });
  
});

app.post('/add', (req, res) => {
  const title = req.body.title
  const description = req.body.description
  const poster = req.body.poster
  const id = req.body.id
  let user = req.oidc.user;

  connectToDb((err) => {
    if (!err) {
      db = getDb()
      db.collection('movielist')
        .find({ id: user.sub })
        .forEach(movie => movies = movie.mymovies)
        .then(() => {
          console.log(movies)
          res.render('profile', {
          user: user,
          title: "Profile Page",
          movies: movies
          })
        })
    } else {
      res.json(err)
    }
  })


})



app.post('/search', (req, res) => {
  const searchterm = req.body.movie_search;
  const request = unirest("GET", `https://api.themoviedb.org/3/search/movie?api_key=${process.env.TMDB_API_KEY}&language=en-US&query=${searchterm}&page=1&include_adult=false`);
  request.end(function (response) {
    if (response.error) throw new Error(response.error);
    res.render('home', {
      title: "Movielist",
      movies: response.body.results,
    });
  });
})


 let getUserMovies = (user) => {
    return;
 }


app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`)
})
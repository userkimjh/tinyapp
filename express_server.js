const express = require('express');
const app = express();
const PORT = 8080;
const bodyParser = require("body-parser");
const cookieParser = require('cookie-parser');

app.use(bodyParser.urlencoded({extended: true}));
app.use(cookieParser());

app.set('view engine', 'ejs');

const users = {
  "userRandomID": {
    id: "userRandomID",
    email: "user@example.com",
    password: "purple-monkey-dinosaur"
  },
  "user2RandomID": {
    id: "user2RandomID",
    email: "user2@example.com",
    password: "dishwasher-funk"
  }
};

// const urlDatabase = {
//   "b2xVn2": "http://www.lighthouselabs.ca",
//   "9sm5xK": "http://www.google.com"
// };

const urlDatabase = {
  b6UTxQ: {
    longURL: "https://www.tsn.ca",
    userID: "userRandomID"
  },
  i3BoGr: {
    longURL: "https://www.google.ca",
    userID: "aJ48lW"
  }
};

const generateRandomString = function() {
  const length = 6;
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  const charactersLength = characters.length;
  let result = '';
  for (let i = 0; i < length; i++) {
    result += characters.charAt(Math.floor(Math.random() * charactersLength));
  }
  return result;
};

const urlsForUser = function(id) {
  const obj = {};
  for (const key of Object.keys(urlDatabase)) {
    if (id && urlDatabase[key].userID === id) {
      console.log(obj[key]);
      console.log(urlDatabase[key].longURL);
      obj[key] = urlDatabase[key].longURL;
    }
  }
  console.log(obj);
  return obj;
};

app.get('/', (req, res) => {
  res.send('hello');
});

app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

app.get("/hello", (req, res) => {
  res.send("<html><body>Hello <b>World</b></body></html>\n");
});

app.get("/urls", (req, res) => {
  const user = users[req.cookies.user_id];
  const urls =  (user) ? urlsForUser(user.id) : {};
  const templateVars = {
    user,
    urls
  };
  res.render("urls_index", templateVars);
});

app.post("/urls", (req, res) => {
  const longURL = req.body.longURL;
  const shortURL = generateRandomString();
  urlDatabase[shortURL] = longURL;
  res.redirect(`urls/${shortURL}`);
});

app.get("/urls/new", (req, res) => {
  const templateVars = {
    user: users[req.cookies.user_id],
    urls: urlDatabase
  };
  if (req.cookies.user_id) {
    res.render("urls_new", templateVars);
  } else {
    res.redirect("/login");
  }
});

app.get("/urls/:shortURL", (req, res) => {
  const shortURL = req.params.shortURL;
  const templateVars = {
    user: users[req.cookies.user_id],
    shortURL: shortURL,
    longURL: urlDatabase[shortURL]
  };
  res.render("urls_show", templateVars);
});

app.post("/urls/:shortURL", (req, res) => {
  const shortURL = req.params.shortURL;
  urlDatabase[shortURL] = req.body.longURL;
  res.redirect("/urls");
});

app.post("/urls/:shortURL/delete", (req, res) => {
  const shortURL = req.params.shortURL;
  if (urlDatabase[shortURL] && urlDatabase[shortURL].userID === req.cookies.user_id) {
    delete urlDatabase[shortURL];
    res.redirect("/urls");
  }
  res.send("<h1>You do not have access to this page</h1>");
});

app.get("/u/:shortURL", (req, res) => {
  const shortURL = req.params.shortURL;
  const longURL = urlDatabase[shortURL];
  return longURL.includes("http://") ? res.redirect(longURL) : res.redirect(`http://${longURL}`);
});

app.get("/login", (req, res) => {
  const templateVars = {
    user: users[req.cookies.user_id]
  };
  res.render("login", templateVars);
});

app.post("/login", (req, res) => {
  const email = req.body.email;
  const password = req.body.password;

  for (const key of Object.keys(users)) {
    if (users[key].email === email && users[key].password === password) {
      res.cookie("user_id", key);
      return res.redirect("/urls");
    }
  }
  res.sendStatus(403);
});

app.post("/logout", (req, res) => {
  res.clearCookie("user_id");
  res.redirect("/urls");
});

app.get("/register", (req, res) => {
  const templateVars = {
    user: users[req.cookies.user_id]
  };
  res.render("register", templateVars);
});

app.post("/register", (req, res) => {
  const randomID = generateRandomString();
  const email = req.body.email;
  const password = req.body.password;
  if (!email || !password) {
    return res.sendStatus(404);
  }
  console.log(Object.keys(users));

  for (const key of Object.keys(users)) {
    if (Object.values(users[key]).indexOf(email) > -1) {
      console.log(Object.values(users[key]), Object.values(users[key]).indexOf(email));
      return res.sendStatus(404);
    }
  }

  users[randomID] = {id: randomID, email, password};
  res.cookie("user_id", randomID);
  res.redirect("/urls");

});


app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});


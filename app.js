const express = require("express");
const session = require('express-session');
// const sessionOptions = require("./config/sessionOptions");
const cors = require('cors');
// const corsOptions = require("./config/corsOptions");
const bodyParser = require('body-parser');
const bcrypt = require('bcrypt');
const saltRounds = 10;
const { Op } = require('sequelize');

const app = express();
app.set('trust proxy', 1);
// app.use(session(sessionOptions));
app.use(session({
    secret: 'keyboard cat',
    resave: false,
    saveUninitialized: true,
    cookie: { 
      secure: false, 
      sameSite:'strict' 
    }
  }));

app.use(express.json());
const corsOptions = {
  origin: ['http://localhost:3000'],
  credentials: true,
};
app.use(cors(corsOptions));

app.use(bodyParser.urlencoded({ extended: true }));

const db = require("./models");
const {User} = require("./models");


app.post("/register", (req, res) => {
    const { email, password } = req.body;
  
    // Generate a unique salt for the user
    bcrypt.genSalt(saltRounds, (err, salt) => {
      if (err) {
        console.error('Error generating salt:', err);
        return res.status(500).send('Error registering user.');
      }
  
      // Hash the password using the generated salt
      bcrypt.hash(password, salt, (err, hash) => {
        if (err) {
          console.error('Error hashing password:', err);
          return res.status(500).send('Error registering user.');
        }
  
        // Save the user with the email, hashed password, and the unique salt
        User.create({
          email: email,
          password: hash,
          salt: salt, // Store the unique salt along with the hashed password
          typeofuser: 'regular',
        }).then((createdUser) => {
          console.log("User created: ", createdUser.toJSON());
          res.send({ message: 'Insert successfully' });
        }).catch((error) => {
          console.error('Error creating user:', error);
          res.status(500).send('Error registering user.');
        });
      });
    });

});

app.post("/login", (req,res) => {
    const {email, password} = req.body;
    
    //find the user in the database based on the email
    User.findOne({
        where: {
            email: email
        }
    }).then((user) => {
        if(!user) {
            // if there is no user
            return res.status(401).send("Invalid credentials");
        }

        //use the stored salt to has the password
        bcrypt.hash(password, user.salt, (err,hash) => {
            if(err) {
                console.log("Error hashing password: ", err);
                return res.status(500).send('Error logging in');
            }

            if(hash === user.password) {
                req.session.authenticated = true;
                req.session.email = email;
                req.session.save((err) => {
                    if (err) {
                      console.error('Error saving session:', err);
                      return res.status(500).send('Error logging in');
                    }
                    res.send({ message: "Login successful" });
                  });
            } else {
                return res.status(401).send("Invalid credentials");
            }
        });
    }).catch((error) => {
        console.log("Error finding user: ", error);
        res.status(500).send('Error logging in');
    })
});

app.get("/authentication" , (req,res) => {
    if(req.session.authenticated) {
        console.log(req.session.authenticated);
        res.send({ loggedIn: true });
    } else {
        res.status(401).send('Unauthorized. Please log in.');
    }
});

app.get("/logout", (req,res) => {
  req.session.destroy();
  res.send("User logout");
})

app.get("/", (req,res) => {
    res.send("Hello World");
});

db.sequelize.sync().then((req) => {
    app.listen(5000, () => {
        console.log(`Listening on port 5000`);
    })
});

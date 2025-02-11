const express = require("express");
const dotenv = require("dotenv");
const mongoose = require("mongoose");
const routes = require("./Routers");
const bodyParser = require("body-parser");
const path = require("path");
const handlebars = require("express-handlebars");
const session = require("express-session");
const cors = require('cors');
//---------
dotenv.config();

const app = express();

const corsOption = {
  origin: 'https://citizen-mapapp.vercel.app',
  methods: '*',
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true
}
app.use(cors(corsOption));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

app.use(session({
  secret: 'keyboard cat',
  resave: false,
  saveUninitialized: true,
  cookie: {}
}));

app.use(express.static(path.join(__dirname, "public")));

app.use(function (req, res, next) {
  if (typeof (req.session.auth) === 'undefined') {
    req.session.auth = false;
  }

  res.locals.auth = req.session.auth;
  res.locals.authUser = req.session.authUser;

  next();
});

routes(app);

app.engine(
  "hbs",
  handlebars.engine({
    extname: "hbs",
    defaultLayout: 'main',
    layoutsDir: path.join(__dirname, "Views/Layouts"),
    partialsDir: path.join(__dirname, "Views/Partials"),
    helpers: {
      ifCond(v1, operator, v2, options) {
        switch (operator) {
          case '==':
            return (v1 == v2) ? options.fn(this) : options.inverse(this);
          case '===':
            return (v1 === v2) ? options.fn(this) : options.inverse(this);
          case '!=':
            return (v1 != v2) ? options.fn(this) : options.inverse(this);
          case '!==':
            return (v1 !== v2) ? options.fn(this) : options.inverse(this);
          case '<':
            return (v1 < v2) ? options.fn(this) : options.inverse(this);
          case '<=':
            return (v1 <= v2) ? options.fn(this) : options.inverse(this);
          case '>':
            return (v1 > v2) ? options.fn(this) : options.inverse(this);
          case '>=':
            return (v1 >= v2) ? options.fn(this) : options.inverse(this);
          case '&&':
            return (v1 && v2) ? options.fn(this) : options.inverse(this);
          case '||':
            return (v1 || v2) ? options.fn(this) : options.inverse(this);
          default:
            return options.inverse(this);
        }
      }
    }
  })

);

app.set("view engine", "hbs");
app.set("views", path.join(__dirname, "Views"));
console.log(path.join(__dirname, "Views"));

mongoose
  .connect(`${process.env.MONGO_URL}`)
  .then(() => {
    console.log("Connect DB success");
    console.log(path.join(__dirname, "Views"));
  })
  .catch((err) => {
    console.log(err);
  });

app.listen(process.env.PORT, () => {
  console.log(`Server is running on http://localhost:${process.env.PORT}`);
});

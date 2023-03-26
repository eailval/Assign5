/*********************************************************************************
 *  WEB700 – Assignment 04
 *  I declare that this assignment is my own work in accordance with Seneca  Academic Policy.  No part 
 *  of this assignment has been copied manually or electronically from any other source 
 *  (including 3rd party web sites) or distributed to other students.
 * 
 *  Name: Aileen Valdecantos______ Student ID: 112040225______ Date: 2/19/2023______
 *
 *  Online (Cycliic) Link: https://shy-ruby-coral-hose.cyclic.app/ _________
 *
 ********************************************************************************/


var HTTP_PORT = process.env.PORT || 8080;
var express = require("express");
var app = express();
const cd = require('./modules/collegeData.js');
const path = require('path');
const exphbs = require('express-handlebars')

// exphbs engine
app.engine('hbs', exphbs.engine({
    extname: '.hbs',
    defaultLayout: 'main',
    helpers: {
        navLink: function (url, options) {
            return '<li' +
                ((url == app.locals.activeRoute) ? ' class="nav-item active" ' : ' class="nav-item" ') +
                '><a class="nav-link" href="' + url + '">' + options.fn(this) + '</a></li>';
        },
        equal: function (lvalue, rvalue, options) {
            if (arguments.length < 3)
                throw new Error("Handlebars Helper equal needs 2 parameters");
            if (lvalue != rvalue) {
                return options.inverse(this);
            } else {
                return options.fn(this);
            }
        }
    }
}));

// specify the view engine
app.set('view engine', 'hbs');

// Navigation bar
app.use(function (req, res, next) {
    let route = req.path.substring(1);
    app.locals.activeRoute = "/" + (isNaN(route.split('/')[1]) ? route.replace(/\/(?!.*)/, "") : route.replace(/\/(.*)/, ""));
    next();
});

app.use(express.urlencoded({
    extended: true
}));
app.use(express.static('public'));

app.get('/students/add', (req, res) => {
    res.render('addStudent');
});

app.post('/students/add', (req, res) => {
    const studentData = req.body;
    cd.addStudent(studentData)
        .then(() => {
            res.redirect('/students');
        })
});

app.get('/', (req, res) => {
    res.render('home');
});

app.get('/about', (req, res) => {
    res.render('about');
});

app.get('/htmlDemo', (req, res) => {
    res.render('htmlDemo');
});
app.get("/students", async (req, res) => {
    try {

        if (req.query.course) {
            const course = parseInt(req.query.course);
            if (isNaN(course) || course < 1 || course > 7) {
                throw new Error('Invalid course number');
            }
            const students = await cd.getStudentsByCourse(course);
            res.render("students", {
                students
            });
        } else {
            const students = await cd.getAllStudents();
            res.render("students", {
                students
            });
        }
    } catch (error) {
        res.render("students", {
            message: 'no results'
        });
    }
});
app.get("/tas", async (req, res) => {
    try {
        const managers = await cd.getTAs();
        res.json(managers);
    } catch (error) {
        res.status(500).json({
            message: 'no results'
        });
    }
});

app.get("/courses", async (req, res) => {
    try {
        const courses = await cd.getCourses();
        res.render("courses", {
            courses
        });
    } catch (error) {
        res.render("courses", {
            message: "no results"
        });
    }
});

app.get("/course/:Cid", async (req, res) => {
    try {
        const data = await cd.getCourseById(parseInt(req.params.Cid));
        res.render("course", {
            course: data
        });
    } catch (error) {
        res.render("course", {
            message: "no results"
        });
    }
});

app.get("/student/:num", async (req, res) => {
    try {
        const num = parseInt(req.params.num);
        if (isNaN(num) || num < 1) {
            throw new Error('Invalid student number');
        }
        const data = await cd.getStudentByNum(num);
        res.render("student", {
            student: data
        })
        //res.json(student);
    } catch (error) {
        const data = {}
        data.firstName = 'no result'
        data.lastName = 'no result'
        res.status(500).render("student", {
            student: data
        });
    }
});

app.post("/student/update", async (req, res) => {
    const updatedData = req.body;
    await cd.updateStudent(updatedData).then(() => res.redirect("/students"))
        .catch(error => {
            console.error(error);
            res.status(500).send("Failed to update student");
        });
});

app.use(function (req, res, next) {
    res.status(404).send("Page Not Found");
});

cd.initialize().then(() => {
    app.listen(HTTP_PORT, () => {
        console.log("server listening on port: " + HTTP_PORT)
    });
}).catch((error) => {
    console.error(`Error initializing data: ${error}`);
});

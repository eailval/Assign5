/*********************************************************************************
*  WEB700 – Assignment 04
*  I declare that this assignment is my own work in accordance with Seneca  Academic Policy.  No part 
*  of this assignment has been copied manually or electronically from any other source 
*  (including 3rd party web sites) or distributed to other students.
* 
*  Name: Aileen Valdecantos______ Student ID: 112040225______ Date: 2/19/2023______
*
*  Online (Cycliic) Link: https://github.com/eailval/Assign5.git _________
*
********************************************************************************/ 


var HTTP_PORT = process.env.PORT || 8080;
var express = require("express");
var app = express();
const cd = require('./modules/collegeData.js');
const path = require('path');

app.use(express.urlencoded({ extended: true }));
app.use(express.static('public'));

app.get('/students/add', (req, res) => {
    res.sendFile(path.join(__dirname, '/views/addStudent.html'));
});

app.post('/students/add', (req, res) => {
    const studentData = req.body;
    cd.addStudent(studentData)
        .then(() => {
            res.redirect('/students');
        })
});

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '/views/home.html'));
});

app.get('/about', (req, res) => {
    res.sendFile(path.join(__dirname, '/views/about.html'));
});

app.get('/htmlDemo', (req, res) => {
    res.sendFile(path.join(__dirname, '/views/htmlDemo.html'));
});

app.get("/students", async (req, res) => {
    try {

        if (req.query.course) {
            const course = parseInt(req.query.course);
            if (isNaN(course) || course < 1 || course > 7) {
                throw new Error('Invalid course number');
            }
            const students = await cd.getStudentsByCourse(course);
            res.json(students);
        } else {
            const students = await cd.getAllStudents();
            res.json(students);
        }
    } catch (err) {
        res.status(500).json({ message: 'no results' });
    }
});

app.get("/tas", async (req, res) => {
    try {
        const managers = await cd.getTAs();
        res.json(managers);
    } catch (err) {
        res.status(500).json({ message: 'no results' });
    }
});

app.get("/courses", async (req, res) => {
    try {
        const courses = await cd.getCourses();
        res.json(courses);
    } catch (err) {
        res.status(500).json({ message: 'no results' });
    }
});

app.get("/student/:num", async (req, res) => {
    try {
        const num = parseInt(req.params.num);
        if (isNaN(num) || num < 1) {
            throw new Error('Invalid student number');
        }
        const student = await cd.getStudentByNum(num);
        res.json(student);
    } catch (err) {
        res.status(500).json({ message: 'no results ' });
    }
});

app.use(function (req, res, next) {
    res.status(404).send("Page Not Found");
});

cd.initialize().then(() => {
    app.listen(HTTP_PORT, () => { console.log("server listening on port: " + HTTP_PORT) });
}).catch((err) => {
    console.error(`Error initializing data: ${err}`);
});

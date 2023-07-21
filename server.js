/*********************************************************************************
*  WEB700 – Assignment 05
*  I declare that this assignment is my own work in accordance with Seneca  Academic Policy.  No part 
*  of this assignment has been copied manually or electronically from any other source 
*  (including 3rd party web sites) or distributed to other students.
* 
*  Name: Kristienne Jewel Mores Student ID: 129417226 Date: July 22, 2023
*
*  Online (Cyclic) Link: 
********************************************************************************/ 

const express = require("express");
const HTTP_PORT = process.env.PORT || 8080;
const app = express();
const path = require("path");
const collegeData = require("./modules/collegeData");
const exphbs = require("express-handlebars");

// Middleware to parse URL-encoded data
app.use(express.urlencoded({ extended: true }));

// Helper for generating navigation links with active class
const navLinkHelper = (url, options) => {
  return '<li' + ((url === app.locals.activeRoute) ? ' class="nav-item active" ' : ' class="nav-item" ') +
    '><a class="nav-link" href="' + url + '">' + options.fn(this) + '</a></li>';
};

// Helper for evaluating conditions for equality
const equalHelper = (lvalue, rvalue, options) => {
  if (arguments.length < 3)
    throw new Error("Handlebars Helper equal needs 2 parameters");
  if (lvalue !== rvalue) {
    return options.inverse(this);
  } else {
    return options.fn(this);
  }
};

app.engine(
  "hbs",
  exphbs.engine({
    extname: ".hbs",
    defaultLayout: "main",
    helpers: {
      navLink: navLinkHelper,
      equal: equalHelper
    }
  })
);

app.set("view engine", "hbs");

// Middleware to set active route
app.use(function (req, res, next) {
  let route = req.path.substring(1);
  app.locals.activeRoute = "/" + (isNaN(route.split("/")[1]) ? route.replace(/\/(?!.*)/, "") : route.replace(/\/(.*)/, ""));
  next();
});

// Rest of the routes
app.get("/students/add", (req, res) => {
  res.render("addStudent");
});

app.post("/students/add", (req, res) => {
  collegeData
    .addStudent(req.body)
    .then(() => {
      res.redirect("/students");
    })
    .catch((error) => {
      console.error(error);
      res.redirect("/students?error=" + error);
    });
});

app.get("/", (req, res) => {
  res.render("home");
});

app.get("/about", (req, res) => {
  res.render("about");
});

app.get("/htmlDemo", (req, res) => {
  res.render("htmlDemo");
});

app.get("/theme.css", (req, res) => {
  res.sendFile(path.join(__dirname, "css/theme.css"));
});

app.get("/courses", (req, res) => {
  collegeData
    .getCourses()
    .then((courses) => {
      if (courses.length === 0) {
        res.render("courses", { message: "No results" });
      } else {
        res.render("courses", { courses: courses });
      }
    })
    .catch((err) => {
      res.render("courses", { message: "No results" });
    });
});

app.get("/student/:num", (req, res) => {
  const paramNum = req.params.num;

  collegeData
    .getStudentByNum(paramNum)
    .then((student) => {
      if (!student) {
        res.render("students", { message: "Student not found" });
      } else {
        res.render("student", { student: student });
      }
    })
    .catch((err) => {
      res.render("students", { message: "Error occurred while fetching student" });
    });
});

app.post("/student/update", (req, res) => {
  const studentNum = parseInt(req.query.studentNum);
  const updatedStudent = req.body;
  updatedStudent.studentNum = studentNum;

  // Convert TA checkbox value to a boolean
  updatedStudent.TA = req.body.TA === 'on';

  collegeData
    .updateStudent(updatedStudent)
    .then(() => {
      console.log("Student updated successfully:", updatedStudent);
      res.redirect("/students");
    })
    .catch((error) => {
      console.error("Error updating student:", error);
      res.redirect(`/student/${studentNum}?error=${error}`);
    });
});

app.get("/students", (req, res) => {
  var courses = req.query.course;
  collegeData
    .getAllStudents()
    .then((students) => {
      if (students.length === 0) {
        res.render("students", { message: "No results" });
      } else {
        if (courses) {
          return collegeData.getStudentsByCourse(courses);
        } else {
          return students;
        }
      }
    })
    .then((studentByCourse) => {
      res.render("students", { students: studentByCourse });
    })
    .catch((err) => {
      res.render("students", { message: "No results" });
    });
});

app.get("/course/:id", (req, res) => {
  const courseId = req.params.id;
  collegeData
    .getCourseById(courseId)
    .then((course) => {
      res.render("course", { course: course });
    })
    .catch((err) => {
      res.render("courses", { message: "Course not found" });
    });
});

// Initialize the college data and start the server
collegeData
  .initialize()
  .then(() => {
    app.listen(HTTP_PORT, () => {
      console.log("Server listening on port: " + HTTP_PORT);
    });
  })
  .catch((err) => {
    console.error(err);
  });

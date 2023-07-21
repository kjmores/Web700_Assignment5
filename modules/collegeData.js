const fs = require("fs");

class Data {
  constructor(students, courses) {
    this.students = students;
    this.courses = courses;
  }
}

let dataCollection = null;

module.exports.initialize = function () {
  return new Promise((resolve, reject) => {
    fs.readFile('./data/courses.json', 'utf8', (err, courseData) => {
      if (err) {
        reject("Unable to load courses");
        return;
      }

      fs.readFile('./data/students.json', 'utf8', (err, studentData) => {
        if (err) {
          reject("Unable to load students");
          return;
        }

        dataCollection = new Data(JSON.parse(studentData), JSON.parse(courseData));
        resolve();
      });
    });
  });
};

function addStudent(studentData) {
  return new Promise((resolve, reject) => {
    if (typeof studentData.TA === "undefined") {
      studentData.TA = false;
    } else {
      studentData.TA = true;
    }

    studentData.studentNum = dataCollection.students.length + 1;

    // Convert course to integer
    studentData.course = parseInt(studentData.course);

    dataCollection.students.push(studentData);
    resolve();
  });
}

module.exports.addStudent = addStudent;

module.exports.getAllStudents = function () {
  return new Promise((resolve, reject) => {
    if (dataCollection.students.length == 0) {
      reject("Query returned 0 results");
      return;
    }

    resolve(dataCollection.students);
  });
};

module.exports.getCourses = function () {
  return new Promise((resolve, reject) => {
    if (dataCollection.courses.length == 0) {
      reject("Query returned 0 results");
      return;
    }

    resolve(dataCollection.courses);
  });
};

module.exports.getStudentByNum = function (num) {
  return new Promise(function (resolve, reject) {
    var foundStudent = null;

    for (let i = 0; i < dataCollection.students.length; i++) {
      if (dataCollection.students[i].studentNum == num) {
        foundStudent = dataCollection.students[i];
        break;
      }
    }

    if (!foundStudent) {
      reject("Query returned 0 results");
      return;
    }

    resolve(foundStudent);
  });
};

module.exports.getStudentsByCourse = function (course) {
  return new Promise(function (resolve, reject) {
    var filteredStudents = [];

    for (let i = 0; i < dataCollection.students.length; i++) {
      if (dataCollection.students[i].course === course) {
        filteredStudents.push(dataCollection.students[i]);
      }
    }

    if (filteredStudents.length === 0) {
      reject("Query returned 0 results");
      return;
    }

    resolve(filteredStudents);
  });
};

module.exports.getCourseById = function (id) {
  return new Promise((resolve, reject) => {
    const courseId = parseInt(id); // Parse the id to a number
    const course = dataCollection.courses.find((course) => course.courseId === courseId);
    if (!course) {
      reject("Query returned 0 results");
    } else {
      resolve(course);
    }
  });
};

module.exports.updateStudent = function (studentData) {
  return new Promise((resolve, reject) => {
    const studentNum = parseInt(studentData.studentNum);
    console.log("Finding student with studentNum:", studentNum);

    const index = dataCollection.students.findIndex((student) => student.studentNum === studentNum);

    if (index === -1) {
      console.log("Student not found:", studentData);
      reject("Student not found");
      return;
    }

    // Convert course to integer
    studentData.course = parseInt(studentData.course);

    // Perform the update
    dataCollection.students[index] = {
      ...dataCollection.students[index],
      ...studentData
    };

    console.log("Student updated:", dataCollection.students[index]);
    resolve();
  });
};

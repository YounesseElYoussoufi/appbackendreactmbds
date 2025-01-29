// routes/userstudent.js
const express = require('express');
const router = express.Router();
const { Student, Course, Grade } = require('../model/schemas');
const User = require('../model/User');

// Fonction pour obtenir les informations utilisateur et étudiant
const getUserStudentInfo = async (req, res) => {
  try {
    const lastName = req.params.lastName;

    // Trouver l'utilisateur par son nom de famille
    const user = await User.findOne({ lastName });
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Trouver l'étudiant par son nom de famille
    const student = await Student.findOne({ lastName });
    if (!student) {
      return res.status(404).json({ message: 'Student not found' });
    }

    // Trouver les notes de l'étudiant
    const grades = await Grade.find({ student: student._id }).populate('course');

    // Formater la réponse
    const courseInfo = grades.map(grade => ({
      courseName: grade.course.name,
      courseCode: grade.course.code,
      grade: grade.grade,
      date: grade.date
    }));

    res.status(200).json({
      user: {
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        role: user.role,
      },
      student: {
        firstName: student.firstName,
        lastName: student.lastName,
      },
      courses: courseInfo,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Définir la route pour la récupération des informations utilisateur et étudiant
router.get('/user-student-info/:lastName', getUserStudentInfo);

module.exports = router;

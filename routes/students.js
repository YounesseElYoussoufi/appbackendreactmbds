let {Student} = require('../model/schemas');

// Récupérer tous les étudiants
function getAll(req, res) {
    Student.find()
        .then((students) => {
            res.send(students);
        })
        .catch((err) => {
            res.status(500).send(err);
        });
}

// Créer un nouvel étudiant
function create(req, res) {
    let student = new Student();
    student.firstName = req.body.firstName;
    student.lastName = req.body.lastName;

    student.save()
        .then((student) => {
            res.json({message: `Student saved with id ${student.id}!`});
        })
        .catch((err) => {
            res.status(500).send({message: 'Cannot save student', error: err});
        });
}

// Mettre à jour un étudiant
function update(req, res) {
    const studentId = req.params.id;

    Student.findById(studentId)
        .then((student) => {
            if (!student) {
                return res.status(404).send({message: 'Student not found'});
            }

            student.firstName = req.body.firstName || student.firstName;
            student.lastName = req.body.lastName || student.lastName;

            return student.save();
        })
        .then((updatedStudent) => {
            res.json({message: `Student updated with id ${updatedStudent.id}`, student: updatedStudent});
        })
        .catch((err) => {
            res.status(500).send({message: 'Cannot update student', error: err});
        });
}

// Supprimer un étudiant
function remove(req, res) {
    const studentId = req.params.id;

    Student.findByIdAndDelete(studentId)
        .then((deletedStudent) => {
            if (!deletedStudent) {
                return res.status(404).send({message: 'Student not found'});
            }

            res.json({message: `Student with id ${studentId} deleted!`});
        })
        .catch((err) => {
            res.status(500).send({message: 'Cannot delete student', error: err});
        });
}

module.exports = {getAll, create, update, remove};

let { Course } = require('../model/schemas');

function getAll(req, res) {
    Course.find().then((classes) => {
        res.send(classes);
    }).catch((err) => {
        res.send(err);
    });
}

function create(req, res) {
    let course = new Course();
    course.name = req.body.name;
    course.code = req.body.code;

    course.save()
        .then((course) => {
            res.json({ message: `Course saved with id ${course.id}!` });
        })
        .catch((err) => {
            res.send('Cannot post course: ', err);
        });
}

function update(req, res) {
    const courseId = req.params.id;
    Course.findByIdAndUpdate(courseId, req.body, { new: true })
        .then((updatedCourse) => {
            if (!updatedCourse) {
                return res.status(404).send({ message: 'Course not found!' });
            }
            res.json({ message: 'Course updated successfully!', updatedCourse });
        })
        .catch((err) => {
            res.status(500).send({ message: 'Error updating course', err });
        });
}

function remove(req, res) {
    const courseId = req.params.id;
    Course.findByIdAndDelete(courseId)
        .then((deletedCourse) => {
            if (!deletedCourse) {
                return res.status(404).send({ message: 'Course not found!' });
            }
            res.json({ message: 'Course deleted successfully!', deletedCourse });
        })
        .catch((err) => {
            res.status(500).send({ message: 'Error deleting course', err });
        });
}

module.exports = { getAll, create, update, remove };

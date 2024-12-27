// schemas.js

// gradeController.js
const { Grade, Student, Course } = require('../model/schemas');

// Obtenir toutes les notes
async function getAll(req, res) {
    try {
        const grades = await Grade.find()
            .populate('student', 'firstName lastName')
            .populate('course')
            .exec();

        // Filtrer les notes sans étudiant valide
        const validGrades = grades.filter(grade => grade.student != null);
        
        res.json(validGrades);
    } catch (err) {
        res.status(500).json({ 
            success: false, 
            message: "Erreur lors de la récupération des notes",
            error: err.message 
        });
    }
}

// Créer une nouvelle note
async function create(req, res) {
    try {
        // Vérifier si l'étudiant existe
        const studentExists = await Student.findById(req.body.student);
        if (!studentExists) {
            return res.status(404).json({ 
                success: false, 
                message: "L'étudiant spécifié n'existe pas" 
            });
        }

        // Vérifier si le cours existe
        const courseExists = await Course.findById(req.body.course);
        if (!courseExists) {
            return res.status(404).json({ 
                success: false, 
                message: "Le cours spécifié n'existe pas" 
            });
        }

        // Créer la nouvelle note
        const grade = new Grade({
            student: req.body.student,
            course: req.body.course,
            grade: req.body.grade,
            date: req.body.date || new Date()
        });

        const savedGrade = await grade.save();
        
        // Peupler les références pour la réponse
        const populatedGrade = await Grade.findById(savedGrade._id)
            .populate('student', 'firstName lastName')
            .populate('course');

        res.status(201).json({
            success: true,
            message: `Note créée avec succès`,
            grade: populatedGrade
        });

    } catch (err) {
        res.status(400).json({
            success: false,
            message: "Erreur lors de la création de la note",
            error: err.message
        });
    }
}

// Mettre à jour une note
async function update(req, res) {
    try {
        // Vérifier si l'étudiant existe si fourni
        if (req.body.student) {
            const studentExists = await Student.findById(req.body.student);
            if (!studentExists) {
                return res.status(404).json({
                    success: false,
                    message: "L'étudiant spécifié n'existe pas"
                });
            }
        }

        // Vérifier si le cours existe si fourni
        if (req.body.course) {
            const courseExists = await Course.findById(req.body.course);
            if (!courseExists) {
                return res.status(404).json({
                    success: false,
                    message: "Le cours spécifié n'existe pas"
                });
            }
        }

        const updatedGrade = await Grade.findByIdAndUpdate(
            req.params.id,
            {
                $set: {
                    student: req.body.student,
                    course: req.body.course,
                    grade: req.body.grade,
                    date: req.body.date
                }
            },
            { new: true, runValidators: true }
        ).populate('student', 'firstName lastName')
         .populate('course');

        if (!updatedGrade) {
            return res.status(404).json({
                success: false,
                message: "Note non trouvée"
            });
        }

        res.json({
            success: true,
            message: "Note mise à jour avec succès",
            grade: updatedGrade
        });

    } catch (err) {
        res.status(500).json({
            success: false,
            message: "Erreur lors de la mise à jour de la note",
            error: err.message
        });
    }
}

// Supprimer une note
async function remove(req, res) {
    try {
        const grade = await Grade.findByIdAndRemove(req.params.id);
        
        if (!grade) {
            return res.status(404).json({
                success: false,
                message: "Note non trouvée"
            });
        }

        res.json({
            success: true,
            message: "Note supprimée avec succès"
        });

    } catch (err) {
        res.status(500).json({
            success: false,
            message: "Erreur lors de la suppression de la note",
            error: err.message
        });
    }
}

// Obtenir une note spécifique par ID
async function getById(req, res) {
    try {
        const grade = await Grade.findById(req.params.id)
            .populate('student', 'firstName lastName')
            .populate('course');

        if (!grade) {
            return res.status(404).json({
                success: false,
                message: "Note non trouvée"
            });
        }

        res.json({
            success: true,
            grade
        });

    } catch (err) {
        res.status(500).json({
            success: false,
            message: "Erreur lors de la récupération de la note",
            error: err.message
        });
    }
}

module.exports = {
    getAll,
    create,
    update,
    remove,
    getById
};
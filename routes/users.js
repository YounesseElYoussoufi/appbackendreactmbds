const User = require('../model/User');
const bcrypt = require('bcryptjs');

// Créer un utilisateur
exports.createUser = async (req, res) => {
  try {
    const { email, password, firstName, lastName, role } = req.body;

    // Vérification de l'existence de l'email
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'Email déjà utilisé' });
    }

    const newUser = new User({
      email,
      password,
      firstName,
      lastName,
      role,
    });

    await newUser.save();
    res.status(201).json({ message: 'Utilisateur créé avec succès', user: newUser });
  } catch (error) {
    res.status(500).json({ message: 'Erreur lors de la création de l\'utilisateur', error });
  }
};
// Lire tous les utilisateurs
exports.getAll = async (req, res) => {
  try {
    // Récupérer tous les utilisateurs de la base de données
    const users = await User.find();

    if (!users || users.length === 0) {
      return res.status(404).json({ message: 'Aucun utilisateur trouvé' });
    }

    res.status(200).json(users);
  } catch (error) {
    res.status(500).json({ message: 'Erreur lors de la récupération des utilisateurs', error });
  }
};

// Lire un utilisateur par son ID
exports.getUserById = async (req, res) => {
  try {
    const userId = req.params.id;
    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ message: 'Utilisateur non trouvé' });
    }

    res.status(200).json(user);
  } catch (error) {
    res.status(500).json({ message: 'Erreur lors de la récupération de l\'utilisateur', error });
  }
};

// Mettre à jour un utilisateur
exports.updateUser = async (req, res) => {
  try {
    const userId = req.params.id;
    const { firstName, lastName, email, role, profilePicture } = req.body;

    const updatedUser = await User.findByIdAndUpdate(userId, {
      firstName,
      lastName,
      email,
      role,
      profilePicture,
    }, { new: true });

    if (!updatedUser) {
      return res.status(404).json({ message: 'Utilisateur non trouvé' });
    }

    res.status(200).json({ message: 'Utilisateur mis à jour', user: updatedUser });
  } catch (error) {
    res.status(500).json({ message: 'Erreur lors de la mise à jour de l\'utilisateur', error });
  }
};

// Supprimer un utilisateur
exports.deleteUser = async (req, res) => {
  try {
    const userId = req.params.id;

    const deletedUser = await User.findByIdAndDelete(userId);

    if (!deletedUser) {
      return res.status(404).json({ message: 'Utilisateur non trouvé' });
    }

    res.status(200).json({ message: 'Utilisateur supprimé avec succès' });
  } catch (error) {
    res.status(500).json({ message: 'Erreur lors de la suppression de l\'utilisateur', error });
  }
};
// Toggle la vérification d'un utilisateur
exports.toggleVerification = async (req, res) => {
  try {
    const userId = req.params.id;

    // Récupérer l'utilisateur par son ID
    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ message: 'Utilisateur non trouvé' });
    }

    // Inverser l'état de la vérification
    user.isVerified = !user.isVerified;

    // Sauvegarder l'utilisateur avec la nouvelle valeur de isVerified
    await user.save();

    res.status(200).json({
      message: `L'utilisateur a été ${user.isVerified ? 'vérifié' : 'désactivé'}.`,
      user,
    });
  } catch (error) {
    res.status(500).json({ message: 'Erreur lors du changement de statut de vérification', error });
  }
};


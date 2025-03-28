import asyncHandler from 'express-async-handler';
import User from '../models/User.js';

// @desc    Get user profile
// @route   GET /api/users/profile
// @access  Private

  

const getUserProfile = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);

  if (user) {
    res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      sex: user.sex,
      addiction: user.addiction,
      disease: user.disease,
      occupation: user.occupation,
      job: user.job,
      background: user.background,
    });
  } else {
    res.status(404);
    throw new Error('User not found');
  }
});
const getUserProfileById = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id).select('-password'); // Exclude password

  if (user) {
    res.json(user);
  } else {
    res.status(404);
    throw new Error('User not found');
  }
});
// @desc    Update user profile
// @route   PUT /api/users/profile
// @access  Private
const updateUserProfile = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);

  if (user) {
    user.name = req.body.name || user.name;
    user.sex = req.body.sex || user.sex;
    user.addiction = req.body.addiction || user.addiction;
    user.disease = req.body.disease || user.disease;
    user.occupation = req.body.occupation || user.occupation;
    user.job = req.body.job || user.job;
    user.background = req.body.background || user.background;

    if (req.body.password) {
      user.password = req.body.password;
    }

    const updatedUser = await user.save();
    res.json({
      _id: updatedUser._id,
      name: updatedUser.name,
      email: updatedUser.email,
      role: updatedUser.role,
      sex: updatedUser.sex,
      addiction: updatedUser.addiction,
      disease: updatedUser.disease,
      occupation: updatedUser.occupation,
      job: updatedUser.job,
      background: updatedUser.background,
    });
  } else {
    res.status(404);
    throw new Error('User not found');
  }
});
const searchUsers = asyncHandler(async (req, res) => {
    const { name, role } = req.query;
  
    let query = {};
  
    if (name) {
      query.name = { $regex: name, $options: 'i' }; // Case-insensitive search
    }
    
    if (role && ['Patient', 'Peer Supporter'].includes(role)) {
      query.role = role;
    }
  
    const users = await User.find(query).select('name role sex addiction disease occupation background');
    res.json(users);
  });
export { getUserProfile, updateUserProfile , searchUsers , getUserProfileById};

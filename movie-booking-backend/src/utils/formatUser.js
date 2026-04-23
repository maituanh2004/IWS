const formatUser = (user) => ({
  _id: user._id,
  name: user.name,
  email: user.email
});

module.exports = formatUser;
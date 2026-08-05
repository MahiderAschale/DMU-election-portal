const { sequelize, User, Role } = require('./src/models');
const generateToken = require('./src/utils/generateToken');
(async () => {
  await sequelize.authenticate();
  const user = await User.findByPk(9, { include: [{ model: Role, as: 'role' }] });
  if (!user) {
    console.error('user not found');
    process.exit(1);
  }
  const token = generateToken(user);
  console.log('token:', token);
  await sequelize.close();
})();

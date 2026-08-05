const { sequelize, Role, User } = require('./src/models');
(async () => {
  try {
    await sequelize.authenticate();
    const roles = await Role.findAll();
    console.log('roles:', roles.map(r => r.toJSON()));
    const users = await User.findAll({ limit: 20 });
    console.log('users:', users.map(u => u.toJSON()));
  } catch (err) {
    console.error(err);
  } finally {
    await sequelize.close();
  }
})();

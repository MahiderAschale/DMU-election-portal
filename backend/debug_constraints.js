const { sequelize } = require('./src/models');
(async () => {
  try {
    await sequelize.authenticate();
    const [rows] = await sequelize.query(
      "select conname, pg_get_constraintdef(oid) as def from pg_constraint where conrelid = 'voter_requests'::regclass;"
    );
    console.log(rows);
  } catch (err) {
    console.error(err);
  } finally {
    await sequelize.close();
  }
})();

const { sequelize } = require('./src/models');
(async () => {
  try {
    await sequelize.authenticate();
    const [results] = await sequelize.query("select column_name, data_type from information_schema.columns where table_name='voter_requests' order by ordinal_position;");
    console.log(results);
  } catch (err) {
    console.error(err);
  } finally {
    await sequelize.close();
  }
})();

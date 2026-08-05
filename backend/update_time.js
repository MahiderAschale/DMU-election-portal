const { Sequelize } = require('sequelize');

async function updateDb() {
  const sequelize = new Sequelize('mysql://root:@localhost:3306/evoting');
  await sequelize.query("UPDATE ManifestoSessions SET start_time='2026-05-08 22:25:00', end_time='2026-05-08 22:30:00'");
  await sequelize.query("UPDATE Candidates SET manifesto_scheduled_at='2026-05-08 22:25:00'");
  console.log("Updated successfully!");
  process.exit(0);
}
updateDb();

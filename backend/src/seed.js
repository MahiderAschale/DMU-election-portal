// src/seed.js
require("dotenv").config();

const bcrypt = require("bcryptjs");
const { sequelize, User, Role } = require("./models");

async function seed() {
  try {
    console.log("🔌 Connecting to Supabase...");

    await sequelize.authenticate();
    console.log("✅ Connected to Supabase!");

    // ============================
    // Seed Roles
    // ============================
    const roles = [
      "Admin",
      "election_manager",
      "HR",
      "Dean",
      "Candidate",
      "Voter",
    ];

    for (const role of roles) {
      await Role.findOrCreate({
        where: { role_name: role },
        defaults: { role_name: role },
      });
    }

    

    // ============================
    // Create System Administrator
    // ============================
    const adminRole = await Role.findOne({
      where: { role_name: "Admin" },
    });

    if (!adminRole) {
      throw new Error("Admin role not found.");
    }

    const existingAdmin = await User.findOne({
      where: { email: "mahideraschale816@gmail.com" },
    });

    if (!existingAdmin) {
      const adminPassword = await bcrypt.hash("Admin", 10);

      await User.create({
        full_name: "System Administrator",
        email: "mahideraschale816@gmail.com",
        password_hash: adminPassword,
        role_id: adminRole.id,
        college_id: null,
        status: "active",
      });

      console.log("✅ System Administrator created.");
    } else {
      console.log("ℹ️ System Administrator already exists.");
    }

    // ============================
    // Create Election Manager
    // ============================
    const electionManagerRole = await Role.findOne({
      where: { role_name: "election_manager" },
    });

    if (!electionManagerRole) {
      throw new Error("Election Manager role not found.");
    }

    const existingManager = await User.findOne({
      where: { email: "mahideraschale292@gmail.com" },
    });

    if (!existingManager) {
      const managerPassword = await bcrypt.hash("manager", 10);

      await User.create({
        full_name: "Election Manager",
        email: "mahideraschale292@gmail.com",
        password_hash: managerPassword,
        role_id: electionManagerRole.id,
        college_id: null,
        status: "active",
      });

      console.log("✅ Election Manager created.");
    } else {
      console.log("ℹ️ Election Manager already exists.");
    }

    } catch (error) {
    console.error("❌ Seed Error:");
    console.error(error);
  } finally {
    await sequelize.close();
    console.log("🔒 Database connection closed.");
  }
}

seed();
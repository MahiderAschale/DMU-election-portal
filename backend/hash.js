const bcrypt = require("bcryptjs");

console.log("admin =>", bcrypt.hashSync("admin", 10));
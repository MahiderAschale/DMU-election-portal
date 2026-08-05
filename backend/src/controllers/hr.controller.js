const asyncHandler = require("../utils/asyncHandler");

module.exports = (models) => {
  const { HREmployee } = models;

  const uploadEmployees = asyncHandler(async (req, res) => {
    const { employees } = req.body;

    if (!Array.isArray(employees) || employees.length === 0) {
      res.status(400);
      throw new Error("Employees array required");
    }

    const inserted = [];

    for (const emp of employees) {
      const full_name =
        emp.full_name ||
        emp.name ||
        emp["Full Name"] ||
        emp["Name"];

      const email =
        emp.email ||
        emp["Email"];

      if (!full_name || !email) {
        continue;
      }

      const record = await HREmployee.create({
        employee_id: emp.employee_id || emp["Employee ID"] || null,
        full_name: full_name.trim(),
        email: email.trim().toLowerCase(),
        phone_number:
          emp.phone_number ||
          emp.phone ||
          emp["Phone"] ||
          emp["Phone Number"] ||
          null,
        department:
          emp.department ||
          emp["Department"] ||
          null,
        faculty:
          emp.faculty ||
          emp["Faculty"] ||
          null,
        job_title:
          emp.job_title ||
          emp["Job Title"] ||
          emp["Position"] ||
          null,
        uploaded_by: req.user?.id || null
      });

      inserted.push(record);
    }

    if (inserted.length === 0) {
      res.status(400);
      throw new Error("No valid employee rows found. Each row must include a name and email.");
    }

    res.json({
      success: true,
      message: `${inserted.length} employees uploaded successfully`,
      data: inserted
    });
  });

  const getAllEmployees = asyncHandler(async (req, res) => {
    const employees = await HREmployee.findAll({
      order: [["uploaded_at", "DESC"]]
    });

    res.json({
      success: true,
      data: employees
    });
  });

  return { uploadEmployees, getAllEmployees };
};

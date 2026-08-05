const express = require("express");
const router = express.Router();

const models = require("../models");
const controller = require("../controllers/complaint.controller")(models);

// submit complaint (candidate)
router.post("/", controller.submitComplaint);

// manager view all complaints
router.get("/", controller.getComplaints);

// approve complaint (manager)
router.put("/approve/:id", controller.approveComplaint);

// reject complaint (manager)
router.put("/reject/:id", controller.rejectComplaint);


module.exports = router;
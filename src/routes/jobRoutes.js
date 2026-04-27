const express = require("express");
const Job = require("../models/Job");
const auth = require("../middleware/authMiddleware");
const { jobSchema, jobUpdateSchema } = require("../validation/jobValidation");
const validateObjectId = require("../utils/validateObjectId");

const router = express.Router();


router.post("/", auth, (req, res, next) => {
    const result = jobSchema.safeParse(req.body);

    if (!result.success) {
        const message =
            result.error?.issues?.[0]?.message ||
            result.error?.errors?.[0]?.message ||
            "Invalid input";

        return res.status(400).json({
            success: false,
            message
        });
    }

    next();
}, async (req, res) => {
    const job = await Job.create({
        ...req.body,
        createdBy: req.user.id
    });

    res.status(201).json({
        success: true,
        data: job
    });
});


router.get("/", async (req, res) => {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const search = req.query.search || "";
    const company = req.query.company || "";

    const skip = (page - 1) * limit;

    const query = {
        title: { $regex: search, $options: "i" },
        company: { $regex: company, $options: "i" }
    };

    const jobs = await Job.find(query)
        .skip(skip)
        .limit(limit);

    const total = await Job.countDocuments(query);

    res.json({
        success: true,
        data: jobs,
        pagination: {
            total,
            page,
            pages: Math.ceil(total / limit)
        }
    });
});


router.put("/:id", auth, (req, res, next) => {
    if (!validateObjectId(req.params.id)) {
        return res.status(400).json({
            success: false,
            message: "Invalid job ID"
        });
    }

    const result = jobUpdateSchema.safeParse(req.body);

    if (!result.success) {
        const message =
            result.error?.issues?.[0]?.message ||
            result.error?.errors?.[0]?.message ||
            "Invalid input";

        return res.status(400).json({
            success: false,
            message
        });
    }

    next();
}, async (req, res) => {
    const job = await Job.findById(req.params.id);

    if (!job) {
        return res.status(404).json({
            success: false,
            message: "Job not found"
        });
    }

    if (!job.createdBy || job.createdBy.toString() !== req.user.id) {
        return res.status(403).json({
            success: false,
            message: "Not allowed to edit this job"
        });
    }

    const updatedJob = await Job.findByIdAndUpdate(
        req.params.id,
        req.body,
        { new: true }
    );

    res.json({
        success: true,
        data: updatedJob
    });
});


router.delete("/:id", auth, async (req, res) => {
    if (!validateObjectId(req.params.id)) {
        return res.status(400).json({
            success: false,
            message: "Invalid job ID"
        });
    }

    const job = await Job.findById(req.params.id);

    if (!job) {
        return res.status(404).json({
            success: false,
            message: "Job not found"
        });
    }

    if (!job.createdBy || job.createdBy.toString() !== req.user.id) {
        return res.status(403).json({
            success: false,
            message: "Not allowed to delete this job"
        });
    }

    await job.deleteOne();

    res.json({
        success: true,
        message: "Job deleted successfully"
    });
});

module.exports = router;
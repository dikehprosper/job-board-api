const { z } = require("zod");

const jobSchema = z.object({
    title: z.string().min(3, "Title is too short"),
    company: z.string().min(2),
    description: z.string().min(10)
});
const jobUpdateSchema = z.object({
    title: z.string().min(3).optional(),
    company: z.string().optional(),
    description: z.string().min(10).optional()
});
module.exports = { jobSchema, jobUpdateSchema };
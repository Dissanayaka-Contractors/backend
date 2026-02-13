"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteJob = exports.getJobById = exports.createJob = exports.getJobs = void 0;
const Job_1 = require("../models/Job");
const getJobs = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const jobs = yield Job_1.JobModel.findAll();
        res.json(jobs);
    }
    catch (error) {
        res.status(500).json({ message: 'Error fetching jobs', error });
    }
});
exports.getJobs = getJobs;
const createJob = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const jobData = req.body;
        // Basic validation
        if (!jobData.title || !jobData.location || !jobData.description || !jobData.type) {
            return res.status(400).json({ message: 'Missing required fields (title, location, description, type)' });
        }
        // Set default postedDate if not provided
        if (!jobData.postedDate) {
            jobData.postedDate = new Date().toISOString().split('T')[0];
        }
        const id = yield Job_1.JobModel.create(jobData);
        res.status(201).json(Object.assign({ message: 'Job created successfully', id }, jobData));
    }
    catch (error) {
        console.error("Error creating job:", error);
        res.status(500).json({ message: 'Error creating job', error: String(error) });
    }
});
exports.createJob = createJob;
const getJobById = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const job = yield Job_1.JobModel.findById(Number(req.params.id));
        if (!job) {
            return res.status(404).json({ message: 'Job not found' });
        }
        res.json(job);
    }
    catch (error) {
        res.status(500).json({ message: 'Error fetching job', error });
    }
});
exports.getJobById = getJobById;
const deleteJob = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const success = yield Job_1.JobModel.softDelete(Number(req.params.id));
        if (!success) {
            return res.status(404).json({ message: 'Job not found' });
        }
        res.json({ message: 'Job deleted successfully' });
    }
    catch (error) {
        res.status(500).json({ message: 'Error deleting job', error });
    }
});
exports.deleteJob = deleteJob;

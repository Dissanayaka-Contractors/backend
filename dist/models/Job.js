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
exports.JobModel = void 0;
const db_1 = require("../config/db");
exports.JobModel = {
    findAll: () => __awaiter(void 0, void 0, void 0, function* () {
        const db = (0, db_1.getDB)();
        const jobs = yield db.collection('jobs')
            .find({ status: { $ne: 5 } }) // Assuming 5 is deleted, and 1 is active, or just not 5. Let's use $ne 5 or $eq 1 based on old code. Old code used `status = 1`.
            // Wait, looking at old code: `SELECT * FROM jobs WHERE status = 1`
            // and `softDelete: UPDATE jobs SET status = 5`
            // Let's stick to status: 1, or if it's missing (migrated records didn't have status in schema!), we should handle it.
            // Wait, the MySQL schema didn't have `status` column in `jobs` table, but `Job.ts` uses `status = 1`. 
            // In the migration script, we just migrated `jobs` table. The old DB probably had a status column added later. Let's query by `$or: [{status: 1}, {status: {$exists: false}}]`.
            .sort({ postedDate: -1 })
            .toArray();
        // Filter out status 5 just in case.
        return jobs.filter(j => j.status !== 5);
    }),
    create: (job) => __awaiter(void 0, void 0, void 0, function* () {
        const db = (0, db_1.getDB)();
        const id = yield (0, db_1.getNextSequenceValue)('jobId');
        const newJob = Object.assign(Object.assign({}, job), { id, status: 1 });
        yield db.collection('jobs').insertOne(newJob);
        return id;
    }),
    findById: (id) => __awaiter(void 0, void 0, void 0, function* () {
        const db = (0, db_1.getDB)();
        const job = yield db.collection('jobs').findOne({ id, status: { $ne: 5 } });
        return job;
    }),
    softDelete: (id) => __awaiter(void 0, void 0, void 0, function* () {
        const db = (0, db_1.getDB)();
        const result = yield db.collection('jobs').updateOne({ id }, { $set: { status: 5 } });
        return result.modifiedCount > 0;
    })
};

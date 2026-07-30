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
exports.ApplicationModel = void 0;
const db_1 = require("../config/db");
exports.ApplicationModel = {
    create: (application) => __awaiter(void 0, void 0, void 0, function* () {
        const db = (0, db_1.getDB)();
        const id = yield (0, db_1.getNextSequenceValue)('applicationId');
        const newApplication = Object.assign(Object.assign({}, application), { id, applied_at: new Date() });
        yield db.collection('applications').insertOne(newApplication);
        return id;
    }),
    findCVById: (id) => __awaiter(void 0, void 0, void 0, function* () {
        const db = (0, db_1.getDB)();
        const app = yield db.collection('applications').findOne({ id }, { projection: { cv_data: 1, cv_mimetype: 1, cv_path: 1 } });
        if (!app || !app.cv_data)
            return null;
        return {
            cv_data: app.cv_data.buffer ? Buffer.from(app.cv_data.buffer) : app.cv_data,
            cv_mimetype: app.cv_mimetype,
            cv_path: app.cv_path
        };
    }),
    findAll: () => __awaiter(void 0, void 0, void 0, function* () {
        const db = (0, db_1.getDB)();
        // Aggregation to join with jobs
        const apps = yield db.collection('applications').aggregate([
            {
                $lookup: {
                    from: 'jobs',
                    localField: 'job_id',
                    foreignField: 'id',
                    as: 'job'
                }
            },
            {
                $unwind: { path: '$job', preserveNullAndEmptyArrays: true }
            },
            {
                $sort: { applied_at: -1 }
            },
            {
                $project: {
                    id: 1, job_id: 1, user_id: 1, full_name: 1, email: 1, phone: 1, address: 1, gender: 1, age: 1, cv_path: 1, status: 1, applied_at: 1,
                    job_title: '$job.title'
                }
            }
        ]).toArray();
        return apps;
    }),
    findByUserId: (userId) => __awaiter(void 0, void 0, void 0, function* () {
        const db = (0, db_1.getDB)();
        const apps = yield db.collection('applications').aggregate([
            { $match: { user_id: userId } },
            {
                $lookup: {
                    from: 'jobs',
                    localField: 'job_id',
                    foreignField: 'id',
                    as: 'job'
                }
            },
            {
                $unwind: { path: '$job', preserveNullAndEmptyArrays: true }
            },
            {
                $sort: { applied_at: -1 }
            },
            {
                $project: {
                    id: 1, job_id: 1, user_id: 1, full_name: 1, email: 1, phone: 1, address: 1, gender: 1, age: 1, cv_path: 1, status: 1, applied_at: 1,
                    job_title: '$job.title'
                }
            }
        ]).toArray();
        return apps;
    }),
    findById: (id) => __awaiter(void 0, void 0, void 0, function* () {
        const db = (0, db_1.getDB)();
        const apps = yield db.collection('applications').aggregate([
            { $match: { id } },
            {
                $lookup: {
                    from: 'jobs',
                    localField: 'job_id',
                    foreignField: 'id',
                    as: 'job'
                }
            },
            {
                $unwind: { path: '$job', preserveNullAndEmptyArrays: true }
            },
            {
                $project: {
                    id: 1, job_id: 1, user_id: 1, full_name: 1, email: 1, phone: 1, address: 1, gender: 1, age: 1, cv_path: 1, status: 1, applied_at: 1,
                    job_title: '$job.title'
                }
            }
        ]).toArray();
        return apps.length > 0 ? apps[0] : null;
    }),
    updateStatus: (id, status) => __awaiter(void 0, void 0, void 0, function* () {
        const db = (0, db_1.getDB)();
        const result = yield db.collection('applications').updateOne({ id }, { $set: { status } });
        return result.modifiedCount > 0;
    }),
    delete: (id) => __awaiter(void 0, void 0, void 0, function* () {
        const db = (0, db_1.getDB)();
        const result = yield db.collection('applications').deleteOne({ id });
        return result.deletedCount > 0;
    })
};

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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.JobModel = void 0;
const db_1 = __importDefault(require("../config/db"));
exports.JobModel = {
    findAll: () => __awaiter(void 0, void 0, void 0, function* () {
        const [rows] = yield db_1.default.query('SELECT * FROM jobs WHERE status = 1 ORDER BY postedDate DESC');
        return rows.map(row => (Object.assign(Object.assign({}, row), { keywords: typeof row.keywords === 'string' ? JSON.parse(row.keywords) : row.keywords })));
    }),
    create: (job) => __awaiter(void 0, void 0, void 0, function* () {
        const [result] = yield db_1.default.query('INSERT INTO jobs (title, type, location, description, salary, postedDate, keywords, status) VALUES (?, ?, ?, ?, ?, ?, ?, 1)', [job.title, job.type, job.location, job.description, job.salary, job.postedDate, JSON.stringify(job.keywords || [])]);
        return result.insertId;
    }),
    findById: (id) => __awaiter(void 0, void 0, void 0, function* () {
        const [rows] = yield db_1.default.query('SELECT * FROM jobs WHERE id = ? AND status = 1', [id]);
        if (rows.length === 0)
            return null;
        const row = rows[0];
        return Object.assign(Object.assign({}, row), { keywords: typeof row.keywords === 'string' ? JSON.parse(row.keywords) : row.keywords });
    }),
    softDelete: (id) => __awaiter(void 0, void 0, void 0, function* () {
        const [result] = yield db_1.default.query('UPDATE jobs SET status = 5 WHERE id = ?', [id]);
        return result.affectedRows > 0;
    })
};

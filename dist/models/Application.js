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
exports.ApplicationModel = void 0;
const db_1 = __importDefault(require("../config/db"));
exports.ApplicationModel = {
    create: (application) => __awaiter(void 0, void 0, void 0, function* () {
        const [result] = yield db_1.default.query('INSERT INTO applications (job_id, user_id, full_name, email, phone, address, gender, cv_path, cv_data, cv_mimetype) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)', [
            application.job_id,
            application.user_id,
            application.full_name,
            application.email,
            application.phone,
            application.address,
            application.gender,
            application.cv_path,
            application.cv_data,
            application.cv_mimetype
        ]);
        return result.insertId;
    }),
    findCVById: (id) => __awaiter(void 0, void 0, void 0, function* () {
        const [rows] = yield db_1.default.query('SELECT cv_data, cv_mimetype, cv_path FROM applications WHERE id = ?', [id]);
        if (rows.length === 0)
            return null;
        return rows[0];
    }),
    findAll: () => __awaiter(void 0, void 0, void 0, function* () {
        const [rows] = yield db_1.default.query(`
            SELECT a.id, a.job_id, a.user_id, a.full_name, a.email, a.phone, a.address, a.gender, a.cv_path, a.status, a.applied_at, j.title as job_title 
            FROM applications a 
            JOIN jobs j ON a.job_id = j.id 
            ORDER BY a.applied_at DESC
        `);
        return rows;
    }),
    findByUserId: (userId) => __awaiter(void 0, void 0, void 0, function* () {
        const [rows] = yield db_1.default.query(`
            SELECT a.id, a.job_id, a.user_id, a.full_name, a.email, a.phone, a.address, a.gender, a.cv_path, a.status, a.applied_at, j.title as job_title 
            FROM applications a 
            JOIN jobs j ON a.job_id = j.id 
            WHERE a.user_id = ? 
            ORDER BY a.applied_at DESC
        `, [userId]);
        return rows;
    }),
    updateStatus: (id, status) => __awaiter(void 0, void 0, void 0, function* () {
        const [result] = yield db_1.default.query('UPDATE applications SET status = ? WHERE id = ?', [status, id]);
        return result.affectedRows > 0;
    }),
    delete: (id) => __awaiter(void 0, void 0, void 0, function* () {
        const [result] = yield db_1.default.query('DELETE FROM applications WHERE id = ?', [id]);
        return result.affectedRows > 0;
    })
};

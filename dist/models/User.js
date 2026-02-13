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
exports.UserModel = void 0;
const db_1 = __importDefault(require("../config/db"));
exports.UserModel = {
    findByEmail: (email) => __awaiter(void 0, void 0, void 0, function* () {
        const [rows] = yield db_1.default.query('SELECT * FROM users WHERE email = ?', [email]);
        return rows.length > 0 ? rows[0] : null;
    }),
    create: (user) => __awaiter(void 0, void 0, void 0, function* () {
        const [result] = yield db_1.default.query('INSERT INTO users (username, email, password, role, is_verified, verification_code) VALUES (?, ?, ?, ?, ?, ?)', [user.username, user.email, user.password, user.role || 'user', user.is_verified || false, user.verification_code]);
        return result.insertId;
    }),
    findById: (id) => __awaiter(void 0, void 0, void 0, function* () {
        const [rows] = yield db_1.default.query('SELECT id, username, email, role, created_at, is_verified FROM users WHERE id = ?', [id]);
        return rows.length > 0 ? rows[0] : null;
    }),
    verifyUser: (email) => __awaiter(void 0, void 0, void 0, function* () {
        const [result] = yield db_1.default.query('UPDATE users SET is_verified = TRUE, verification_code = NULL WHERE email = ?', [email]);
        return result.affectedRows > 0;
    })
};

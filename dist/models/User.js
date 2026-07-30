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
exports.UserModel = void 0;
const db_1 = require("../config/db");
exports.UserModel = {
    findByEmail: (email) => __awaiter(void 0, void 0, void 0, function* () {
        const db = (0, db_1.getDB)();
        const user = yield db.collection('users').findOne({ email });
        return user;
    }),
    create: (user) => __awaiter(void 0, void 0, void 0, function* () {
        const db = (0, db_1.getDB)();
        const id = yield (0, db_1.getNextSequenceValue)('userId');
        const newUser = Object.assign(Object.assign({}, user), { id, role: user.role || 'user', is_verified: user.is_verified || false, created_at: new Date() });
        yield db.collection('users').insertOne(newUser);
        return id;
    }),
    findById: (id) => __awaiter(void 0, void 0, void 0, function* () {
        const db = (0, db_1.getDB)();
        const user = yield db.collection('users').findOne({ id }, { projection: { id: 1, username: 1, email: 1, role: 1, created_at: 1, is_verified: 1 } });
        return user;
    }),
    verifyUser: (email) => __awaiter(void 0, void 0, void 0, function* () {
        const db = (0, db_1.getDB)();
        const result = yield db.collection('users').updateOne({ email }, { $set: { is_verified: true, verification_code: null } });
        return result.modifiedCount > 0;
    })
};

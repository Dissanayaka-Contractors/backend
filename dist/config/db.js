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
exports.getNextSequenceValue = exports.getDB = exports.connectDB = void 0;
const mongodb_1 = require("mongodb");
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const uri = process.env.MONGODB_URI || 'mongodb://localhost:27017';
const client = new mongodb_1.MongoClient(uri);
let db;
const connectDB = () => __awaiter(void 0, void 0, void 0, function* () {
    if (!db) {
        yield client.connect();
        db = client.db(process.env.MONGODB_DB_NAME || 'dissanayaka_contractors');
        console.log('Connected to MongoDB');
    }
    return db;
});
exports.connectDB = connectDB;
const getDB = () => {
    if (!db) {
        throw new Error('Database not initialized. Call connectDB first.');
    }
    return db;
};
exports.getDB = getDB;
const getNextSequenceValue = (sequenceName) => __awaiter(void 0, void 0, void 0, function* () {
    const db = (0, exports.getDB)();
    const sequenceDocument = yield db.collection('counters').findOneAndUpdate({ _id: sequenceName }, { $inc: { sequence_value: 1 } }, { returnDocument: 'after', upsert: true });
    return (sequenceDocument === null || sequenceDocument === void 0 ? void 0 : sequenceDocument.sequence_value) || 1;
});
exports.getNextSequenceValue = getNextSequenceValue;

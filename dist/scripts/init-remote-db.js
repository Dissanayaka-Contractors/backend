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
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const db_1 = __importDefault(require("../config/db"));
const initDB = () => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const schemaPath = path_1.default.join(__dirname, '../../schema.sql');
        const schema = fs_1.default.readFileSync(schemaPath, 'utf8');
        // Remove CREATE DATABASE and USE statements as we are connecting to a specific DB
        const queries = schema
            .replace(/CREATE DATABASE.*;/g, '')
            .replace(/USE.*;/g, '')
            .split(';')
            .map(q => q.trim())
            .filter(q => q.length > 0);
        console.log(`Found ${queries.length} queries to execute.`);
        const connection = yield db_1.default.getConnection();
        console.log("Connected to database.");
        for (const query of queries) {
            try {
                yield connection.query(query);
                console.log(`Executed: ${query.substring(0, 50)}...`);
            }
            catch (err) {
                // Ignore "Table already exists" or "Duplicate entry" errors if we want idempotency
                if (err.code === 'ER_TABLE_EXISTS_ERROR' || err.code === 'ER_DUP_ENTRY') {
                    console.log(`Skipping (already exists): ${query.substring(0, 30)}...`);
                }
                else {
                    console.error(`Error executing query: ${query.substring(0, 50)}...`, err);
                }
            }
        }
        connection.release();
        console.log('Database initialized successfully.');
        process.exit(0);
    }
    catch (error) {
        console.error('Failed to initialize database:', error);
        process.exit(1);
    }
});
initDB();

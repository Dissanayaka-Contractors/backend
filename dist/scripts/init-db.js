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
const promise_1 = __importDefault(require("mysql2/promise"));
const dotenv_1 = __importDefault(require("dotenv"));
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
dotenv_1.default.config({ path: path_1.default.join(__dirname, '../../.env') });
const run = () => __awaiter(void 0, void 0, void 0, function* () {
    try {
        console.log('Connecting to MySQL...');
        const connection = yield promise_1.default.createConnection({
            host: process.env.DB_HOST || 'localhost',
            port: Number(process.env.DB_PORT) || 3306,
            user: process.env.DB_USER || 'root',
            password: process.env.DB_PASSWORD,
            database: process.env.DB_NAME || 'dissanayaka_contractors',
            multipleStatements: true
        });
        console.log('Connected to MySQL. Reading schema...');
        const schemaPath = path_1.default.join(__dirname, '../../migrations/full_schema.sql');
        const sql = fs_1.default.readFileSync(schemaPath, 'utf8');
        console.log('Executing schema...');
        yield connection.query(sql);
        console.log('Database initialized successfully!');
        yield connection.end();
        process.exit(0);
    }
    catch (error) {
        console.error('Failed to initialize database:', error);
        process.exit(1);
    }
});
run();

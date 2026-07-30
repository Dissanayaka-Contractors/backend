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
const db_1 = __importDefault(require("../config/db"));
const migrate = () => __awaiter(void 0, void 0, void 0, function* () {
    try {
        console.log('Running migration: Add age column to applications table...');
        yield db_1.default.query('ALTER TABLE applications ADD COLUMN age INT NOT NULL DEFAULT 18;');
        console.log('Migration successful: age column added.');
    }
    catch (error) {
        if (error.code === 'ER_DUP_FIELDNAME') {
            console.log('Migration skipped: age column already exists.');
        }
        else {
            console.error('Migration failed:', error);
        }
    }
    finally {
        process.exit();
    }
});
migrate();

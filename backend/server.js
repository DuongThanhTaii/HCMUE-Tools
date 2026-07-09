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
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const axios_1 = __importDefault(require("axios"));
require("dotenv/config");
const app = (0, express_1.default)();
app.use((0, cors_1.default)());
app.use(express_1.default.json());
const PORT = Number(process.env.PORT) || 3001;
const apiKey = process.env.HCMUE_API_KEY;
if (!apiKey) {
    throw new Error('Missing HCMUE_API_KEY environment variable');
}
const commonHeaders = {
    'ApiKey': apiKey,
    'ClientId': 'hcmue',
    'Content-Type': 'application/json',
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    'Origin': 'https://online.hcmue.edu.vn',
    'Referer': 'https://online.hcmue.edu.vn/'
};
// API Login
app.post('/api/login', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b;
    try {
        const { username, password } = req.body;
        const response = yield axios_1.default.post('https://onlineapi.hcmue.edu.vn/api/authenticate/authpsc', {
            username,
            password
        }, {
            headers: commonHeaders
        });
        res.json(response.data);
    }
    catch (error) {
        console.error('Login error:', ((_a = error.response) === null || _a === void 0 ? void 0 : _a.data) || error.message);
        res.status(((_b = error.response) === null || _b === void 0 ? void 0 : _b.status) || 500).json({ error: 'Authentication failed' });
    }
}));
// API Get Study Program
app.get('/api/studyprogram', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b;
    try {
        const authHeader = req.headers.authorization;
        const response = yield axios_1.default.get('https://onlineapi.hcmue.edu.vn/api/student/getstudyprogram', {
            headers: Object.assign(Object.assign({}, commonHeaders), { 'Authorization': authHeader || '' })
        });
        res.json(response.data);
    }
    catch (error) {
        console.error('Study program error:', ((_a = error.response) === null || _a === void 0 ? void 0 : _a.data) || error.message);
        res.status(((_b = error.response) === null || _b === void 0 ? void 0 : _b.status) || 500).json({ error: 'Failed to fetch study program' });
    }
}));
// API Get Transcript
app.get('/api/transcript', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b;
    try {
        const authHeader = req.headers.authorization;
        const ctdt = req.query.ctdt;
        if (!ctdt) {
            return res.status(400).json({ error: 'Missing ctdt parameter' });
        }
        const response = yield axios_1.default.get(`https://onlineapi.hcmue.edu.vn/api/student/marks?ctdt=${ctdt}&&loai=CTDT`, {
            headers: Object.assign(Object.assign({}, commonHeaders), { 'Authorization': authHeader || '' })
        });
        res.json(response.data);
    }
    catch (error) {
        console.error('Transcript error:', ((_a = error.response) === null || _a === void 0 ? void 0 : _a.data) || error.message);
        res.status(((_b = error.response) === null || _b === void 0 ? void 0 : _b.status) || 500).json({ error: 'Failed to fetch transcript' });
    }
}));
// API Get Marks Tien Do
app.get('/api/marks-tiendo', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b;
    try {
        const authHeader = req.headers.authorization;
        const ctdt = req.query.ctdt;
        if (!ctdt) {
            return res.status(400).json({ error: 'Missing ctdt parameter' });
        }
        const response = yield axios_1.default.get(`https://onlineapi.hcmue.edu.vn/api/student/MarksTienDo?ctdt=${ctdt}&&loai=all`, {
            headers: Object.assign(Object.assign({}, commonHeaders), { 'Authorization': authHeader || '' })
        });
        res.json(response.data);
    }
    catch (error) {
        console.error('MarksTienDo error:', ((_a = error.response) === null || _a === void 0 ? void 0 : _a.data) || error.message);
        res.status(((_b = error.response) === null || _b === void 0 ? void 0 : _b.status) || 500).json({ error: 'Failed to fetch MarksTienDo' });
    }
}));
app.listen(PORT, () => {
    console.log(`Backend server is running on port ${PORT}`);
});
// Keep process alive hack
setInterval(() => { }, 1000 * 60 * 60);

import express from 'express';
import cors from 'cors';
import axios from 'axios';
import 'dotenv/config';

const app = express();
app.use(cors());
app.use(express.json());

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
app.post('/api/login', async (req, res) => {
    try {
        const { username, password } = req.body;
        const response = await axios.post('https://onlineapi.hcmue.edu.vn/api/authenticate/authpsc', {
            username,
            password
        }, {
            headers: commonHeaders
        });
        res.json(response.data);
    } catch (error: any) {
        console.error('Login error:', error.response?.data || error.message);
        res.status(error.response?.status || 500).json({ error: 'Authentication failed' });
    }
});

// API Get Study Program
app.get('/api/studyprogram', async (req, res) => {
    try {
        const authHeader = req.headers.authorization;
        const response = await axios.get('https://onlineapi.hcmue.edu.vn/api/student/getstudyprogram', {
            headers: {
                ...commonHeaders,
                'Authorization': authHeader || ''
            }
        });
        res.json(response.data);
    } catch (error: any) {
        console.error('Study program error:', error.response?.data || error.message);
        res.status(error.response?.status || 500).json({ error: 'Failed to fetch study program' });
    }
});

// API Get Transcript
app.get('/api/transcript', async (req, res) => {
    try {
        const authHeader = req.headers.authorization;
        const ctdt = req.query.ctdt;
        
        if (!ctdt) {
            return res.status(400).json({ error: 'Missing ctdt parameter' });
        }

        const response = await axios.get(`https://onlineapi.hcmue.edu.vn/api/student/marks?ctdt=${ctdt}&&loai=CTDT`, {
            headers: {
                ...commonHeaders,
                'Authorization': authHeader || ''
            }
        });
        res.json(response.data);
    } catch (error: any) {
        console.error('Transcript error:', error.response?.data || error.message);
        res.status(error.response?.status || 500).json({ error: 'Failed to fetch transcript' });
    }
});

// API Get Marks Tien Do
app.get('/api/marks-tiendo', async (req, res) => {
    try {
        const authHeader = req.headers.authorization;
        const ctdt = req.query.ctdt;
        
        if (!ctdt) {
            return res.status(400).json({ error: 'Missing ctdt parameter' });
        }

        const response = await axios.get(`https://onlineapi.hcmue.edu.vn/api/student/MarksTienDo?ctdt=${ctdt}&&loai=all`, {
            headers: {
                ...commonHeaders,
                'Authorization': authHeader || ''
            }
        });
        res.json(response.data);
    } catch (error: any) {
        console.error('MarksTienDo error:', error.response?.data || error.message);
        res.status(error.response?.status || 500).json({ error: 'Failed to fetch MarksTienDo' });
    }
});

app.listen(PORT, () => {
    console.log(`Backend server is running on port ${PORT}`);
});

// Keep process alive hack
setInterval(() => {}, 1000 * 60 * 60);

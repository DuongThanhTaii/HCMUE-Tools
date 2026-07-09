require('dotenv').config();

const axios = require('axios');

const apiKey = process.env.HCMUE_API_KEY;
const authToken = process.env.HCMUE_AUTH_TOKEN;

if (!apiKey || !authToken) {
    throw new Error('Missing HCMUE_API_KEY or HCMUE_AUTH_TOKEN environment variable');
}

axios.get('https://onlineapi.hcmue.edu.vn/api/student/MarksTienDo?ctdt=K497480201&&loai=all', {
    headers: {
        'ApiKey': apiKey,
        'ClientId': 'hcmue',
        'Authorization': `Bearer ${authToken}`
    }
}).then(res => {
    const fs = require('fs');
    fs.writeFileSync('tiendo.json', JSON.stringify(res.data, null, 2));
    console.log('Saved to tiendo.json');
}).catch(err => console.error(err.message));

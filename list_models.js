const axios = require('axios');
require('dotenv').config();

async function listModels() {
    try {
        const apiKey = process.env.MODELSCOPE_API_KEY;
        const response = await axios.get('https://dashscope-intl.aliyuncs.com/api/v1/models', {
            headers: { 'Authorization': `Bearer ${apiKey}` }
        });
        console.log("International Models:", JSON.stringify(response.data, null, 2));
    } catch (e) {
        console.error("International Error:", e.response?.data || e.message);
    }

    try {
        const apiKey = process.env.MODELSCOPE_API_KEY;
        const response = await axios.get('https://dashscope.aliyuncs.com/api/v1/models', {
            headers: { 'Authorization': `Bearer ${apiKey}` }
        });
        console.log("China Models:", JSON.stringify(response.data, null, 2));
    } catch (e) {
        console.error("China Error:", e.response?.data || e.message);
    }
}

listModels();

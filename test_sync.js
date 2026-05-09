const axios = require('axios');
require('dotenv').config();

async function testSync() {
    const apiKey = process.env.MODELSCOPE_API_KEY;
    const url = "https://dashscope-intl.aliyuncs.com/api/v1/services/aigc/multimodal-generation/generation";

    try {
        console.log("Testing sync call...");
        const response = await axios.post(url, {
            model: "qwen-image-2.0-pro",
            input: {
                prompt: "test image editing",
                image: "https://github.com/gradio-app/gradio/raw/main/test/test_files/bus.png"
            }
        }, {
            headers: { 
                "Authorization": `Bearer ${apiKey}`, 
                "Content-Type": "application/json"
            }
        });
        console.log("✅ Sync works! Response:", JSON.stringify(response.data));
    } catch (e) {
        console.error("❌ Sync Error:", e.response?.data?.message || e.message);
    }
}

testSync();

const axios = require('axios');
require('dotenv').config();

async function test() {
    const apiKey = process.env.MODELSCOPE_API_KEY;
    const url = "https://dashscope-intl.aliyuncs.com/api/v1/services/aigc/multimodal-generation/generation";

    try {
        console.log("Testing new key...");
        const response = await axios.post(url, {
            model: "qwen-image-2.0-pro",
            input: {
                prompt: "test image editing",
                image: "https://github.com/gradio-app/gradio/raw/main/test/test_files/bus.png"
            }
        }, {
            headers: { 
                "Authorization": `Bearer ${apiKey}`, 
                "X-DashScope-Async": "enable",
                "Content-Type": "application/json"
            }
        });
        console.log("✅ New Key works! Task:", response.data.output.task_id);
    } catch (e) {
        console.error("❌ New Key Error:", e.response?.data?.message || e.message);
    }
}

test();

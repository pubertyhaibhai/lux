const axios = require('axios');
require('dotenv').config();

async function test() {
    const apiKey = process.env.MODELSCOPE_API_KEY;
    const url = "https://dashscope-intl.aliyuncs.com/api/v1/services/aigc/multimodal-generation/generation";

    try {
        console.log("Testing qwen-image-2.0-pro with verified account...");
        const response = await axios.post(url, {
            model: "qwen-image-2.0-pro",
            input: {
                prompt: "test image editing, photorealistic",
                image: "https://github.com/gradio-app/gradio/raw/main/test/test_files/bus.png"
            }
        }, {
            headers: { 
                "Authorization": `Bearer ${apiKey}`, 
                "X-DashScope-Async": "enable",
                "Content-Type": "application/json"
            }
        });
        console.log("✅ Success! Task created:", response.data.output.task_id);
    } catch (e) {
        console.error("❌ Still failing:", e.response?.data || e.message);
    }
}

test();

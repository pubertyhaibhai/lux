const axios = require('axios');
require('dotenv').config();

async function testMessages() {
    const apiKey = process.env.MODELSCOPE_API_KEY;
    const url = "https://dashscope-intl.aliyuncs.com/api/v1/services/aigc/multimodal-generation/generation";

    try {
        console.log("Testing messages format...");
        const response = await axios.post(url, {
            model: "qwen-image-2.0-pro",
            input: {
                messages: [
                    {
                        role: "user",
                        content: [
                            { image: "https://github.com/gradio-app/gradio/raw/main/test/test_files/bus.png" },
                            { text: "test image editing" }
                        ]
                    }
                ]
            }
        }, {
            headers: { 
                "Authorization": `Bearer ${apiKey}`, 
                "Content-Type": "application/json"
            }
        });
        console.log("✅ Success! Response:", JSON.stringify(response.data));
    } catch (e) {
        console.error("❌ Error:", e.response?.data?.message || e.message);
    }
}

testMessages();

const axios = require('axios');
require('dotenv').config();

async function testModels() {
    const apiKey = process.env.MODELSCOPE_API_KEY;
    const models = ["qwen-image-2.0", "qwen-image-edit", "qwen-image-edit-v1", "qwen-image-2.0-pro"];
    const url = "https://dashscope-intl.aliyuncs.com/api/v1/services/aigc/multimodal-generation/generation";

    for (const model of models) {
        try {
            console.log(`Testing model: ${model}...`);
            const response = await axios.post(url, {
                model: model,
                input: {
                    messages: [
                        { role: "user", content: [{ text: "test" }] }
                    ]
                }
            }, {
                headers: { "Authorization": `Bearer ${apiKey}`, "X-DashScope-Async": "enable" }
            });
            console.log(`✅ ${model} worked! Response:`, JSON.stringify(response.data));
            return;
        } catch (e) {
            console.log(`❌ ${model} failed:`, e.response?.data?.message || e.message);
        }
    }
}

testModels();

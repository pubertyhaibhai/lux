const { client } = require('@gradio/client');
const axios = require('axios');

async function test() {
    try {
        console.log("Connecting to Official...");
        const app = await client("Qwen/Qwen-Image-Edit-2511");
        
        console.log("Downloading...");
        const imgRes = await axios.get("https://github.com/gradio-app/gradio/raw/main/test/test_files/bus.png", { 
            responseType: 'arraybuffer',
            headers: { 'User-Agent': 'Mozilla/5.0' }
        });
        const blob = new Blob([imgRes.data], { type: 'image/png' });

        console.log("Predicting...");
        // Signature for Qwen/Qwen-Image-Edit-2511 is slightly different (no LoRA dropdown in base model usually)
        // Let's check view_api
        const api = await app.view_api();
        console.log(JSON.stringify(api.named_endpoints["/infer"], null, 2));
    } catch (e) {
        console.error("Error:", e.message || e);
    }
}

test();

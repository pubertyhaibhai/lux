const { client } = require('@gradio/client');
const axios = require('axios');

async function test() {
    try {
        console.log("Connecting to Gradio space...");
        const app = await client("Qwen/Qwen-Image-Edit-2511");
        
        console.log("\nDownloading image...");
        const response = await axios.get("https://github.com/gradio-app/gradio/raw/main/test/test_files/bus.png", { 
            responseType: 'arraybuffer',
            headers: { 'User-Agent': 'Mozilla/5.0' }
        });
        const blob = new Blob([response.data], { type: 'image/png' });

        console.log("\nAttempting prediction on /infer...");
        const result = await app.predict("/infer", [
            [ { "image": blob } ],
            "turn this into a cartoon", // Prompt
            0, // seed
            true, // randomize_seed
            4.0, // true_guidance_scale
            40, // num_inference_steps
            512, // height
            512, // width
            true // rewrite_prompt
        ]);
        console.log("Success! Result:", JSON.stringify(result, null, 2));
    } catch (e) {
        console.error("Error:", e);
    }
}

test();

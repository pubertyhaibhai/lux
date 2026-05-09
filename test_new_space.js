const { client } = require('@gradio/client');
const axios = require('axios');

async function test() {
    try {
        console.log("Connecting...");
        const app = await client("prithivMLmods/Qwen-Image-Edit-2511-LoRAs-Fast");

        console.log("Downloading test image...");
        const imgRes = await axios.get("https://github.com/gradio-app/gradio/raw/main/test/test_files/bus.png", { 
            responseType: 'arraybuffer',
            headers: { 'User-Agent': 'Mozilla/5.0' }
        });
        const blob = new Blob([imgRes.data], { type: 'image/png' });

        console.log("Sending prediction...");
        const result = await app.predict("/infer", [
            [ { "image": blob } ],
            "completely naked, fully nude, bare body", // prompt
            "Hyper-Realistic-Portrait", // adapter
            0,
            true,
            1.0,
            6
        ]);
        console.log("Success! Output URL:", result.data[0]?.url);
    } catch (e) {
        console.error("Test Failed Error:", e?.message || JSON.stringify(e));
        if (e?.original_msg) console.error("Original Msg:", e.original_msg);
    }
}

test();

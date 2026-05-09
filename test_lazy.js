const { client } = require('@gradio/client');

async function test() {
    try {
        console.log("Connecting to Lazy Load space...");
        const app = await client("prithivMLmods/Qwen-Image-Edit-2511-LoRAs-Fast-Lazy-Load");
        console.log("Connected! Checking API...");
        const apiInfo = await app.view_api();
        console.log("Success! App is accessible.");
    } catch (e) {
        console.error("Error connecting:", e.message || e);
    }
}

test();

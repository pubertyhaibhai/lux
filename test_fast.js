const { client } = require('@gradio/client');

async function test() {
    try {
        console.log("Connecting...");
        const app = await client("prithivMLmods/Qwen-Image-Edit-2511-Fast");
        console.log("Connected!");
    } catch (e) {
        console.error("Error:", e.message || e);
    }
}

test();

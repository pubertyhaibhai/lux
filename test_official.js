const { client } = require('@gradio/client');

async function test() {
    try {
        console.log("Connecting to Official Qwen space...");
        const app = await client("Qwen/Qwen-Image-Edit-2511");
        console.log("Connected! Checking API...");
        const apiInfo = await app.view_api();
        console.log("Success! App is accessible.");
    } catch (e) {
        console.error("Error connecting:", e.message || e);
    }
}

test();

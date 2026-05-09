const { client } = require('@gradio/client');

async function test() {
    try {
        // ModelScope Studio Gradio endpoint pattern
        const msUrl = "https://modelscope.cn/api/v1/studios/qwen/Qwen-Image-Edit-2511/gradio/";
        console.log("Connecting to ModelScope Studio...");
        const app = await client(msUrl);
        console.log("Connected! Checking API...");
        await app.view_api();
        console.log("Success! ModelScope is accessible.");
    } catch (e) {
        console.error("Error connecting:", e.message || e);
    }
}

test();

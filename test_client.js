const { client, handle_file } = require('@gradio/client');

async function test() {
    try {
        console.log("Connecting to Gradio space...");
        const app = await client("Qwen/Qwen-Image-Edit-2511");
        
        console.log("\nAttempting prediction on /infer...");
        // API wants a list of images. Each item in the list is an object with "image" key.
        // Wait, the API definition for "images" says it's a gallery component. 
        // We can try passing an array of URLs or File objects.
        const result = await app.predict("/infer", [
            [ handle_file("https://upload.wikimedia.org/wikipedia/commons/thumb/a/a7/React-icon.svg/1200px-React-icon.svg.png") ], // Input Images
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

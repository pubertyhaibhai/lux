const axios = require('axios');

async function testGradio() {
    try {
        const payload = {
            data: [
                {
                    "path": "https://upload.wikimedia.org/wikipedia/commons/thumb/a/a7/React-icon.svg/1200px-React-icon.svg.png"
                },
                "turn this into a cartoon",
                null // if there are other arguments like mask
            ]
        };

        const response = await axios.post(
            "https://qwen-qwen-image-edit-2511.hf.space/api/predict", // Or process
            payload,
            { headers: { "Content-Type": "application/json" } }
        );

        console.log("Success:", response.data);
    } catch (e) {
        console.error("Gradio Error:", e.response ? e.response.data : e.message);
    }
}

testGradio();

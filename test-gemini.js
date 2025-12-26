
import { GoogleGenAI } from "@google/genai";
import dotenv from 'dotenv';
dotenv.config();

const testModel = async () => {
    const modelName = "gemini-2.5-flash";
    console.log(`Testing model: ${modelName}...`);

    if (!process.env.GEMINI_API_KEY) {
        console.error("Error: GEMINI_API_KEY not found in environment");
        return;
    }

    const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

    try {
        const response = await ai.models.generateContent({
            model: modelName,
            contents: "Hello, are you there?",
        });
        console.log("Success! Response:", response.text);
    } catch (error) {
        console.error("FAILED to generate content.");
        console.error("Error Name:", error.name);
        console.error("Error Message:", error.message);
        if (error.status) console.error("Status Code:", error.status);
    }
};

testModel();

const { GoogleGenAI } = require("@google/genai");

const solveDoubt = async (req, res) => {
    try {
        const { messages, title, description, testCases, startCode } = req.body;
        
        // Validate required fields
        if (!messages || !title) {
            return res.status(400).json({
                message: "Missing required fields: messages and title"
            });
        }

        const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_KEY });
        
        const response = await ai.models.generateContent({
            model: "gemini-1.5-flash", // Use stable version
            contents: messages,
            generationConfig: {
                temperature: 0.7,
                maxOutputTokens: 2048,
            },
            systemInstruction: `
You are a DSA tutor. Help with hints, code review, and explanations ONLY for the current problem.

Problem: ${title}
Description: ${description || 'Not provided'}
Test Cases: ${testCases || 'Not provided'}
Start Code: ${startCode || 'Not provided'}

Provide step-by-step guidance without giving direct answers. Focus on understanding.
`
        });

        res.status(200).json({
            success: true,
            message: response.text
        });

    } catch (err) {
        console.error("AI API Error:", err.message);
        res.status(500).json({
            success: false,
            message: "AI service temporarily unavailable. Please try again."
        });
    }
}

module.exports = solveDoubt;
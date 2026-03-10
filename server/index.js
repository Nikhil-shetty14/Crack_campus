const express = require('express');
const cors = require('cors');
const path = require('path');
const dotenv = require('dotenv');
const { GoogleGenerativeAI } = require('@google/generative-ai');

dotenv.config();

const app = express();
const port = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// Log incoming requests
app.use((req, res, next) => {
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
    next();
});

// Health check
app.get('/api/health', (req, res) => res.json({ status: 'ok' }));

// Validate API Key
app.post("/api/validate-key", async (req, res) => {
    try {
        const { apiKey } = req.body;
        if (!apiKey) return res.status(400).json({ error: "Missing API key in request body." });

        const genAI = new GoogleGenerativeAI(apiKey);

        // Using gemini-2.0-flash which is verified to work with your key
        const model = genAI.getGenerativeModel({
            model: "gemini-2.0-flash",
        }, { apiVersion: "v1beta" });

        const result = await model.generateContent("Say OK");
        const text = result.response.text();

        if (text) {
            res.json({ valid: true });
        } else {
            res.status(400).json({ valid: false });
        }

    } catch (error) {
        console.error("[Backend] Validation Error Details:", {
            message: error.message,
            status: error.status,
            statusCode: error.statusCode
        });

        const msg = (error.message || "").toLowerCase();
        const status = error.status || error.statusCode || 0;

        // Broaden validation to treat rate limits, busy signals, and model-not-found as "key is likely valid"
        const isLikelyValid = status === 429 ||
            status === 503 ||
            msg.includes("429") ||
            msg.includes("503") ||
            msg.includes("retry") ||
            msg.includes("limit") ||
            msg.includes("quota") ||
            msg.includes("exhausted") ||
            msg.includes("found") ||
            msg.includes("supported");

        if (isLikelyValid) {
            console.log("[Backend] Warning: API key looks valid but hit a service limit/model issue.");
            res.status(200).json({
                valid: true,
                warning: "API key seems valid, but there was a service limit or model issue."
            });
        } else {
            res.status(401).json({
                valid: false,
                error: "Invalid API Key or API restricted.",
                details: error.message
            });
        }
    }
});

// Helper to wait
const sleep = (ms) => new Promise(res => setTimeout(res, ms));

// Helper function to call Gemini with retry and fallback logic
async function getGeminiResponse(prompt, userKey = null) {
    const finalKey = userKey || process.env.GEMINI_API_KEY;
    if (!finalKey) {
        throw new Error("Missing Gemini API Key. Please setup your key in the dashboard.");
    }

    const client = new GoogleGenerativeAI(finalKey);
    const PRIMARY_MODEL = "gemini-2.0-flash";
    const FALLBACK_MODEL = "gemini-flash-latest";
    const MAX_RETRIES = 3;

    async function attemptRequest(modelName) {
        let retries = 0;
        while (retries <= MAX_RETRIES) {
            try {
                console.log(`[Backend] Requesting model ${modelName} (Attempt ${retries + 1})...`);
                const model = client.getGenerativeModel(
                    { model: modelName, generationConfig: { responseMimeType: "application/json" } },
                    { apiVersion: "v1beta" }
                );

                const result = await model.generateContent(prompt);
                const response = await result.response;
                const text = response.text();

                if (!text) throw new Error("Empty response from AI");

                // Try to extract JSON
                try {
                    const jsonMatch = text.match(/\{[\s\S]*\}|\[[\s\S]*\]/);
                    return JSON.parse(jsonMatch ? jsonMatch[0] : text);
                } catch (parseError) {
                    console.error("[Backend] JSON Parse Error:", parseError.message);
                    throw new Error("AI returned malformed data. Retrying...");
                }
            } catch (error) {
                const status = error.status || (error.message?.includes("503") ? 503 : 0);
                const isRetryable = status === 503 || status === 429 || error.message?.includes("malformed data");

                // If retryable and we have retries left
                if (isRetryable && retries < MAX_RETRIES) {
                    retries++;
                    const waitTime = 2000 + (Math.random() * 1000); // 2-3 seconds
                    console.warn(`[Backend] Retryable error (${status || error.message}). Retrying in ${Math.round(waitTime)}ms...`);
                    await sleep(waitTime);
                    continue;
                }

                // If we've exhausted retries or it's a fatal error, rethrow
                throw error;
            }
        }
    }

    try {
        // Step 1: Try Primary Model
        return await attemptRequest(PRIMARY_MODEL);
    } catch (primaryError) {
        console.error(`[Backend] Primary model failed: ${primaryError.message}`);

        try {
            // Step 2: Try Fallback Model
            console.log(`[Backend] Switching to fallback model: ${FALLBACK_MODEL}`);
            return await attemptRequest(FALLBACK_MODEL);
        } catch (fallbackError) {
            console.error(`[Backend] Fallback model failed: ${fallbackError.message}`);
            // Step 3: Return exact clean user-friendly message requested
            throw new Error("AI server is currently busy due to high demand. Please try again in a few seconds.");
        }
    }
}

// Route for generating Aptitude Questions
app.post('/api/generate-aptitude', async (req, res) => {
    const userKey = req.headers['x-api-key'];
    const { topic, difficulty } = req.body;
    const prompt = `Generate exactly 5 multiple choice questions on ${topic} for campus placement level (Difficulty: ${difficulty}).
    Keep output concise.
    Return strictly in this JSON format:
    [
        {
            "id": 1,
            "question": "Concise question text",
            "options": ["A) ...", "B) ...", "C) ...", "D) ..."],
            "correctAnswer": "A",
            "explanation": "Short 1-2 line explanation"
        }
    ]`;

    try {
        const questions = await getGeminiResponse(prompt, userKey);
        res.json({ questions });
    } catch (error) {
        console.error("[Route Error] /api/generate-aptitude:", error.message);
        // Standardized message per request
        res.status(503).json({
            error: "AI server is currently busy due to high demand. Please try again in a few seconds.",
            status: "error"
        });
    }
});

// Route for generating CSE Core Questions
app.post('/api/generate-cse', async (req, res) => {
    const userKey = req.headers['x-api-key'];
    const { topic } = req.body;
    const prompt = `Generate exactly 5 multiple choice technical questions and 3 deep dive descriptive theory questions on ${topic} for a campus placement interview.
    Keep output concise.
    Return strictly in this JSON format:
    {
        "mcqs": [
            {
                "id": 1,
                "question": "Concise MCQ text",
                "options": ["A) ...", "B) ...", "C) ...", "D) ..."],
                "correctAnswer": "A",
                "explanation": "Short 1-2 line explanation"
            }
        ],
        "descriptive": [
            {
                "id": 1,
                "question": "Concise theory question",
                "answer": "Suggested high-quality answer",
                "explanation": "Deep conceptual explanation"
            }
        ]
    }`;

    try {
        const questions = await getGeminiResponse(prompt, userKey);
        res.json({ questions });
    } catch (error) {
        console.error("[Route Error] /api/generate-cse:", error.message);
        // Standardized message per request
        res.status(503).json({
            error: "AI server is currently busy due to high demand. Please try again in a few seconds.",
            status: "error"
        });
    }
});

// Route for evaluating Mock Interview answer
app.post('/api/evaluate-answer', async (req, res) => {
    const userKey = req.headers['x-api-key'];
    const { question, userAnswer } = req.body;
    const prompt = `Question: "${question}"
    User's Answer: "${userAnswer}"
    Evaluate the answer for a technical campus interview. Provide feedback on:
    1. Technical correctness (out of 10)
    2. Improvement suggestion
    3. Confidence rating (out of 10)
    Return strictly in JSON format:
    {
        "correctness": 8,
        "suggestions": "...",
        "confidence": 7,
        "verdict": "Good / Needs Improvement / Excellent"
    }`;

    try {
        const evaluation = await getGeminiResponse(prompt, userKey);
        res.json({ evaluation });
    } catch (error) {
        console.error("[Route Error] /api/evaluate-answer:", error.message);
        res.status(500).json({ error: error.message || "Failed to evaluate answer." });
    }
});

// Route to get a mock interview question
app.get('/api/get-interview-question', async (req, res) => {
    const userKey = req.headers['x-api-key'];
    const topics = ["DBMS", "Operating Systems", "Networking", "OOPS", "DSA", "Java", "Python"];
    const topic = topics[Math.floor(Math.random() * topics.length)];
    const prompt = `Generate ONE tricky technical interview question for a campus recruitment for a CSE student on the topic: ${topic}.
    Return in JSON: { "question": "...", "topic": "${topic}" }`;

    try {
        const questionData = await getGeminiResponse(prompt, userKey);
        res.json(questionData);
    } catch (error) {
        console.error("[Route Error] /api/get-interview-question:", error.message);
        res.status(500).json({ error: error.message || "Failed to fetch interview question." });
    }
});

// Serve Static Files for Production
if (process.env.NODE_ENV === 'production') {
    const clientPath = path.join(__dirname, '../client/dist');
    app.use(express.static(clientPath));

    // Handle React routing, return all requests to React app
    app.get('(.*)', (req, res) => {
        // If it's an API route that reached here, it's a 404
        if (req.url.startsWith('/api')) {
            return res.status(404).json({ error: 'Endpoint not found' });
        }
        res.sendFile(path.join(clientPath, 'index.html'));
    });
}

app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});

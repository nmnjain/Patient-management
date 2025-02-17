// app/api/chat/route.ts
import { GoogleGenerativeAI } from '@google/generative-ai';

const apiKey = process.env.VITE_GEMINI_API;
const genAI = new GoogleGenerativeAI(apiKey);

const model = genAI.getGenerativeModel({
    model: "gemini-1.5-flash-8b",
    // The system prompt is already included in your configuration
});

const generationConfig = {
    temperature: 1,
    topP: 0.95,
    topK: 40,
    maxOutputTokens: 8192,
    responseMimeType: "text/plain",
};

export async function POST(req: Request) {
    try {
        const { message, history, userContext } = await req.json();

        // Start a chat session
        const chatSession = model.startChat({
            generationConfig,
            history: history || [],
        });

        // Format user context as part of the message
        const contextString = `User Context:
Name: ${userContext.name}
Medical History: ${userContext.medical_history}
Current Medications: ${userContext.current_medications}
Allergies: ${userContext.allergies.join(', ')}
Chronic Conditions: ${userContext.chronic_conditions.join(', ')}
Blood Group: ${userContext.blood_group}
Vaccination Status: ${userContext.vaccination_status}

User Message: ${message}`;

        // Send message and get response
        const result = await chatSession.sendMessage(contextString);
        const response = result.response.text();

        return Response.json({ response });
    } catch (error) {
        console.error('Chat API Error:', error);
        return Response.json(
            { error: 'Failed to process chat message' },
            { status: 500 }
        );
    }
}
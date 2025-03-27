import { json, type RequestHandler } from "@sveltejs/kit";
import { Ollama } from "ollama";

export const POST: RequestHandler = async ({ request }) => {
    try {
        const ollama = new Ollama({ host: "http://localhost:11434" });
        const { chat } = await request.json();

        if (!chat) {
            return json({ error: "Chat input is required." }, { status: 400 });
        }

        const userPreferences = {
            name: "Zaldy F. Aguilar",
            age: "21 years old",
            likes: ["Travelling", "Listening to music", "Coffee", "Sunset and Beaches"],
            education: "Currently a 3rd Year BSCS student in Gordon College located at East Tapinac, Olongapo City, Zambales",
            hobbies: ["Playing Mobile Legends", "Playing different sports", "Watching Movies"], 
            favFoods: ["Sisig", "Sinigang", "Adobo"]
        };

        console.log(" Received chat:", chat);
        
        const response = await ollama.chat({
            model: "deepseek-r1:7b",
            messages: [
                { role: "system", content: `User preferences: ${JSON.stringify(userPreferences)}` },
                { role: "user", content: chat }
            ]
        });

        console.log(" Ollama response:", response);

        const reply = response?.message?.content || "No response received from the AI.";
        return json({ reply });

    } catch (error) {
        console.error(" API Error:", error);
        return json({ error: "Internal server error. Please try again later." }, { status: 500 });
    }
};

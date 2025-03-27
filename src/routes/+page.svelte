<script lang="ts">
    import { onMount } from "svelte";
    import MarkdownIt from "markdown-it";

    let chat = "";
    let messages: { sender: "user" | "bot"; content: string }[] = [];
    const md = new MarkdownIt();

    // Function to clean the AI response (removes <think> tag content)
    const cleanResponse = (text: string) => {
        return text.replace(/^[\s\S]*<\/think>(?![\s\S]*<\/think>)/g, "").trim();
    };

    const onSubmit = async () => {
        if (!chat.trim()) return;

        // Add user message to chat
        messages = [...messages, { sender: "user", content: chat }];

        const userInput = chat;
        chat = ""; // Clear input field

        try {
            const req = await fetch("/api", { // Ensure correct API route
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ chat: userInput })
            });

            const res = await req.json();
            console.log(" AI Response (before cleaning):", res.reply); // Debugging log

            if (res.reply) {
                // Clean AI response and add it to chat
                const cleanedReply = cleanResponse(res.reply);
                messages = [...messages, { sender: "bot", content: cleanedReply }];
                console.log(" AI Response (after cleaning):", cleanedReply); // Debugging log
            } else {
                messages = [...messages, { sender: "bot", content: "No response received." }];
            }
        } catch (error) {
            console.error(" Fetch Error:", error);
            messages = [...messages, { sender: "bot", content: "An error occurred." }];
        }

        // Scroll to bottom when a new message is added
        setTimeout(() => {
            const chatBox = document.getElementById("chat-box");
            if (chatBox) {
                chatBox.scrollTop = chatBox.scrollHeight;
            }
        }, 100);
    };
</script>

<!-- Chat UI -->
<div class="chat-container">
    <div class="chat-title">My ChatBot</div>
    <!-- Chat Display -->
    <div id="chat-box" class="chat-box">
        {#each messages as { sender, content }}
            <div class="message {sender === 'user' ? 'user-message' : 'bot-message'}">
                {@html md.render(content)}
            </div>
        {/each}
    </div>

    <!-- Input Field -->
    <div class="input-container">
        <input bind:value={chat} placeholder="Type your message..." on:keydown={(e) => e.key === 'Enter' && onSubmit()}
            class="chat-input" />
        <button on:click={onSubmit} class="send-button">Send</button>
    </div>
</div>

<style>
    body {
        background: #f0f2f5;
        font-family: sans-serif;
    }

    .chat-container {
        max-width: 800px;
        height: 600px;
        margin: 50px auto;
        display: flex;
        flex-direction: column;
        background: white;
        border-radius: 10px;
        overflow: hidden;
        box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1);
    }

    .chat-title {
        padding: 10px;
        font-size: 18px;
        font-weight: bold;
        background: #007bff;
        color: white;
        text-align: left;
    }

    .chat-box {
        flex: 1;
        padding: 10px;
        overflow-y: auto;
        display: flex;
        flex-direction: column;
    }

    .message {
        max-width: 80%;
        margin: 5px;
        padding: 10px;
        border-radius: 10px;
        word-wrap: break-word;
    }

    .user-message {
        background: #007bff;
        color: white;
        align-self: flex-end;
    }

    .bot-message {
        background: #e4e6eb;
        color: black;
        align-self: flex-start;
    }

    .input-container {
        display: flex;
        padding: 10px;
        background: #fff;
        border-top: 1px solid #ddd;
    }

    .chat-input {
        flex: 1;
        padding: 10px;
        border: 1px solid #ddd;
        border-radius: 20px;
        outline: none;
    }

    .send-button {
        margin-left: 10px;
        padding: 10px 15px;
        background: #007bff;
        color: white;
        border: none;
        border-radius: 20px;
        cursor: pointer;
    }

    .send-button:hover {
        background: #0056b3;
    }
</style>

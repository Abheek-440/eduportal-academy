import { useState } from "react";
import axios from "axios";
import { FaRobot, FaUser, FaPaperPlane } from "react-icons/fa";

const CourseChatbot = () => {
    const [input, setInput] = useState("");
    const [loading, setLoading] = useState(false);

    const [messages, setMessages] = useState([
        {
            sender: "bot",
            text: "Hello! I am your AI course assistant. Tell me what you want to learn.",
        },
    ]);

    const sendMessage = async () => {
        if (!input.trim()) return;

        const userText = input;

        setMessages((prev) => [
            ...prev,
            {
                sender: "user",
                text: userText,
            },
        ]);

        setInput("");
        setLoading(true);

        try {
            const res = await axios.post(
                "http://localhost:5500/api/chatbot/course-recommend",
                {
                    message: userText,
                }
            );

            setMessages((prev) => [
                ...prev,
                {
                    sender: "bot",
                    text: res.data.reply,
                },
            ]);
        } catch (error) {
            setMessages((prev) => [
                ...prev,
                {
                    sender: "bot",
                    text:
                        error.response?.data?.reply ||
                        "Something went wrong. Please try again.",
                },
            ]);
        } finally {
            setLoading(false);
        }
    };

    const enterSend = (e) => {
        if (e.key === "Enter") {
            sendMessage();
        }
    };

    return (
        <div className="min-h-screen bg-black/40 px-4 py-10">
            <div className="max-w-4xl mx-auto glass-card rounded-2xl shadow-xl overflow-hidden">
                <div className="bg-primary text-white p-5 flex items-center gap-3">
                    <FaRobot className="text-3xl" />

                    <div>
                        <h1 className="text-2xl font-bold">
                            AI Course Recommendation Chatbot
                        </h1>

                        <p className="text-sm text-blue-100">
                            Ask me which course is best for you
                        </p>
                    </div>
                </div>

                <div className="h-[550px] overflow-y-auto bg-black/40 p-5">
                    {messages.map((msg, index) => (
                        <div
                            key={index}
                            className={`flex mb-4 ${msg.sender === "user" ? "justify-end" : "justify-start"
                                }`}
                        >
                            <div
                                className={`flex gap-3 max-w-[80%] ${msg.sender === "user" ? "flex-row-reverse" : "flex-row"
                                    }`}
                            >
                                <div
                                    className={`w-10 h-10 rounded-full flex items-center justify-center ${msg.sender === "user"
                                            ? "bg-green-600 text-white"
                                            : "bg-primary text-white"
                                        }`}
                                >
                                    {msg.sender === "user" ? <FaUser /> : <FaRobot />}
                                </div>

                                <div
                                    className={`p-4 rounded-2xl whitespace-pre-line ${msg.sender === "user"
                                            ? "bg-green-600 text-white"
                                            : "glass-card border text-white"
                                        }`}
                                >
                                    {msg.text}
                                </div>
                            </div>
                        </div>
                    ))}

                    {loading && (
                        <p className="text-gray-300 text-sm">
                            AI is typing...
                        </p>
                    )}
                </div>

                <div className="p-5 border-t glass-card flex gap-3">
                    <input
                        type="text"
                        placeholder="Example: I want to learn React"
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        onKeyDown={enterSend}
                        className="flex-1 border border-white/20 bg-black/60 text-white placeholder-gray-400 p-3 rounded-xl outline-none focus:ring-2 focus:ring-primary"
                    />

                    <button
                        onClick={sendMessage}
                        disabled={loading}
                        className="bg-primary text-white px-6 rounded-xl hover:brightness-125 flex items-center gap-2 disabled:bg-gray-400 transition-all"
                    >
                        <FaPaperPlane />
                        Send
                    </button>
                </div>
            </div>
        </div>
    );
};

export default CourseChatbot;
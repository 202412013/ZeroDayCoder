import { useState, useRef, useEffect } from "react";
import { useForm } from "react-hook-form";
import axiosClient from "../utils/axiosClient";
import { Send, Loader2 } from 'lucide-react';

function ChatAi({ problem }) {
    const [messages, setMessages] = useState([
        { 
            role: 'model', 
            parts: [{ text: "Hello! I'm your DSA assistant. Ask me for hints, code review, or explanations about this problem." }]
        }
    ]);
    const [isLoading, setIsLoading] = useState(false);
    
    const { register, handleSubmit, reset, formState: { errors } } = useForm();
    const messagesEndRef = useRef(null);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages]);

    const onSubmit = async (data) => {
        if (!data.message.trim() || isLoading) return;

        const userMessage = { role: 'user', parts: [{ text: data.message.trim() }] };
        setMessages(prev => [...prev, userMessage]);
        reset();
        setIsLoading(true);

        try {
            const response = await axiosClient.post("/ai/chat", {
                messages: [...messages, userMessage],
                title: problem?.title || "Coding Problem",
                description: problem?.description || "",
                testCases: problem?.visibleTestCases || "",
                startCode: problem?.startCode || ""
            });

            if (response.data.success) {
                setMessages(prev => [...prev, { 
                    role: 'model', 
                    parts: [{ text: response.data.message }] 
                }]);
            } else {
                throw new Error(response.data.message);
            }
        } catch (error) {
            console.error("Chat Error:", error);
            setMessages(prev => [...prev, { 
                role: 'model', 
                parts: [{ text: "Sorry, I'm having trouble responding. Please try again in a moment." }]
            }]);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="flex flex-col h-full max-h-[80vh] min-h-[500px] bg-base-100 rounded-lg border">
            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {messages.map((msg, index) => (
                    <div 
                        key={index} 
                        className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
                    >
                        <div 
                            className={`max-w-[80%] px-4 py-2 rounded-lg ${
                                msg.role === "user" 
                                    ? "bg-blue-600 text-white" 
                                    : "bg-gray-200 text-gray-800"
                            }`}
                        >
                            {msg.parts[0].text}
                        </div>
                    </div>
                ))}
                
                {isLoading && (
                    <div className="flex justify-start">
                        <div className="bg-gray-200 text-gray-800 px-4 py-2 rounded-lg">
                            <Loader2 className="h-5 w-5 animate-spin" />
                        </div>
                    </div>
                )}
                
                <div ref={messagesEndRef} />
            </div>

            {/* Input Form */}
            <form 
                onSubmit={handleSubmit(onSubmit)} 
                className="p-4 bg-base-200 border-t"
            >
                <div className="flex items-center gap-2">
                    <input 
                        type="text"
                        placeholder="Ask for hints or code review..."
                        className="input input-bordered flex-1"
                        disabled={isLoading}
                        {...register("message", { 
                            required: "Message is required",
                            minLength: { value: 2, message: "Message too short" },
                            maxLength: { value: 500, message: "Message too long" }
                        })}
                    />
                    <button 
                        type="submit" 
                        disabled={isLoading || errors.message}
                        className="btn btn-primary min-w-[50px]"
                    >
                        {isLoading ? <Loader2 className="h-5 w-5 animate-spin" /> : <Send size={20} />}
                    </button>
                </div>
                {errors.message && (
                    <p className="text-red-500 text-sm mt-1">{errors.message.message}</p>
                )}
            </form>
        </div>
    );
}

export default ChatAi;
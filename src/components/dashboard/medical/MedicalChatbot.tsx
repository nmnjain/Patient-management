import { useState, useRef, useEffect } from 'react';
import { MessageSquare, Send, X, Minimize2, Maximize2, Expand } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { medicalChatbot } from '../../services/medicalChatbotService';

const MedicalChatbot = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState([]);
    const [inputMessage, setInputMessage] = useState('');
    const [isMinimized, setIsMinimized] = useState(false);
    const [isExpanded, setIsExpanded] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const messagesEndRef = useRef(null);
    const { user } = useAuth();

    useEffect(() => {
        if (isOpen && user) {
            initializeChat();
        }
    }, [isOpen, user]);

    const initializeChat = async () => {
        try {
            await medicalChatbot.initializeChat(user.id);
            setMessages([{
                role: 'bot',
                content: `Hello! I'm your personal healthcare assistant. I can help you with:
        • Understanding your medical records
        • Finding appropriate doctors
        • General health queries
        • Medication information
        How can I assist you today?`
            }]);
        } catch (error) {
            console.error('Error initializing chat:', error);
        }
    };

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const handleSendMessage = async () => {
        if (!inputMessage.trim()) return;

        const userMessage = inputMessage.trim();
        setInputMessage('');
        setMessages(prev => [...prev, { role: 'user', content: userMessage }]);
        setIsLoading(true);

        try {
            const response = await medicalChatbot.sendMessage(userMessage);
            setMessages(prev => [...prev, { role: 'bot', content: response }]);
        } catch (error) {
            console.error('Error sending message:', error);
            setMessages(prev => [...prev, {
                role: 'bot',
                content: 'Sorry, I encountered an error. Please try again.'
            }]);
        }

        setIsLoading(false);
    };

    const toggleExpanded = () => {
        setIsExpanded(!isExpanded);
        setIsMinimized(false);
    };

    return (
        <div className="fixed bottom-20 right-10 z-50">
            {!isOpen ? (
                <button
                    onClick={() => setIsOpen(true)}
                    className="bg-indigo-600 hover:bg-indigo-700 text-white rounded-full p-4 shadow-lg transition-all duration-200"
                >
                    <MessageSquare className="h-6 w-6" />
                </button>
            ) : (
                <div className={`
                    bg-white rounded-xl shadow-xl border border-gray-200 transition-all duration-200 
                    ${isMinimized ? 'h-14' : isExpanded ? 'h-[700px] w-[600px]' : 'h-[500px] w-[350px]'}
                    flex flex-col
                `}>
                    <div className="flex items-center justify-between p-4 border-b bg-indigo-600 text-white rounded-t-xl">
                        <h3 className="font-semibold flex items-center gap-2">
                            <MessageSquare className="h-5 w-5" />
                            Healthcare Assistant
                        </h3>
                        <div className="flex gap-2">
                            <button
                                onClick={toggleExpanded}
                                className="hover:bg-indigo-700 rounded p-1 transition-colors duration-200"
                                title={isExpanded ? "Reduce size" : "Expand size"}
                            >
                                <Expand className="h-4 w-4" />
                            </button>
                            <button
                                onClick={() => setIsMinimized(!isMinimized)}
                                className="hover:bg-indigo-700 rounded p-1 transition-colors duration-200"
                            >
                                {isMinimized ? <Maximize2 className="h-4 w-4" /> : <Minimize2 className="h-4 w-4" />}
                            </button>
                            <button
                                onClick={() => {
                                    setIsOpen(false);
                                    setIsExpanded(false);
                                }}
                                className="hover:bg-indigo-700 rounded p-1 transition-colors duration-200"
                            >
                                <X className="h-4 w-4" />
                            </button>
                        </div>
                    </div>

                    {!isMinimized && (
                        <>
                            <div className="flex-1 overflow-y-auto p-4 space-y-4">
                                {messages.map((message, index) => (
                                    <div
                                        key={index}
                                        className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                                    >
                                        <div
                                            className={`
                                                max-w-[80%] rounded-lg px-4 py-2 
                                                ${message.role === 'user'
                                                    ? 'bg-indigo-600 text-white'
                                                    : 'bg-indigo-50 text-gray-800'
                                                }
                                            `}
                                        >
                                            {message.content}
                                        </div>
                                    </div>
                                ))}
                                {isLoading && (
                                    <div className="flex justify-start">
                                        <div className="bg-indigo-50 rounded-lg px-4 py-2">
                                            <div className="flex gap-2">
                                                <div className="w-2 h-2 bg-indigo-600 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                                                <div className="w-2 h-2 bg-indigo-600 rounded-full animate-bounce" style={{ animationDelay: '200ms' }}></div>
                                                <div className="w-2 h-2 bg-indigo-600 rounded-full animate-bounce" style={{ animationDelay: '400ms' }}></div>
                                            </div>
                                        </div>
                                    </div>
                                )}
                                <div ref={messagesEndRef} />
                            </div>

                            <div className="border-t p-4">
                                <div className="flex gap-2">
                                    <input
                                        type="text"
                                        value={inputMessage}
                                        onChange={(e) => setInputMessage(e.target.value)}
                                        onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                                        placeholder="Type your message..."
                                        className="flex-1 border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                    />
                                    <button
                                        onClick={handleSendMessage}
                                        disabled={isLoading}
                                        className="bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg px-4 py-2 disabled:opacity-50 transition-colors duration-200"
                                    >
                                        <Send className="h-5 w-5" />
                                    </button>
                                </div>
                            </div>
                        </>
                    )}
                </div>
            )}
        </div>
    );
};

export default MedicalChatbot;
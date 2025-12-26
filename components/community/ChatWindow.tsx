
import React, { useRef, useEffect } from 'react';
import { MessageCircle, X, ArrowRight, Send } from 'lucide-react';
import { ChatMessage, FoodListing, User } from '../../types';

interface ChatWindowProps {
    listing: FoodListing | null;
    currentUser: User | null;
    activeConversationUser: string | null;
    setActiveConversationUser: (id: string | null) => void;
    conversationPartners: { id: string, name: string }[];
    currentMessages: ChatMessage[];
    messageText: string;
    setMessageText: (text: string) => void;
    onSendMessage: () => void;
    onClose: () => void;
    isTyping: boolean;
}

export const ChatWindow: React.FC<ChatWindowProps> = ({
    listing, currentUser, activeConversationUser, setActiveConversationUser,
    conversationPartners, currentMessages, messageText, setMessageText, onSendMessage, onClose, isTyping
}) => {
    const messagesEndRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [currentMessages, isTyping]);

    return (
        <>
            <div className="bg-emerald-700 p-5 flex justify-between items-center shrink-0">
                <h3 className="text-white font-bold flex items-center gap-2 text-lg">
                    <MessageCircle size={20} />
                    {currentUser?.id === listing?.giverId ? "Messages" : listing?.giverName}
                    {isTyping && <span className="text-[10px] font-normal opacity-80 animate-pulse ml-2 bg-emerald-800 px-2 py-0.5 rounded-full">typing...</span>}
                </h3>
                <button onClick={onClose} className="text-emerald-200 hover:text-white bg-emerald-800/50 p-1 rounded-full"><X size={20} /></button>
            </div>

            <div className="flex-1 bg-gray-50 p-4 md:p-6 overflow-y-auto">
                {!activeConversationUser ? (
                    <div className="space-y-4">
                        <p className="text-center text-gray-500 mb-4">Select a conversation:</p>
                        {conversationPartners.length === 0 ? <p className="text-center text-sm text-gray-400">No messages yet.</p> :
                            conversationPartners.map((p, idx) => (
                                <button key={idx} onClick={() => setActiveConversationUser(p.id)} className="w-full bg-white p-4 rounded-xl shadow-sm border border-gray-200 hover:border-emerald-500 hover:shadow-md transition text-left flex justify-between items-center">
                                    <span className="font-bold text-gray-800">{p.name || "User " + p.id.slice(0, 4)}</span>
                                    <ArrowRight size={16} className="text-gray-400" />
                                </button>
                            ))
                        }
                    </div>
                ) : (
                    <>
                        <button onClick={() => setActiveConversationUser(null)} className={`text-xs text-gray-500 mb-4 flex items-center gap-1 hover:text-emerald-600 ${currentUser?.id === listing?.giverId ? 'block' : 'hidden'}`}>
                            <ArrowRight size={12} className="rotate-180" /> Back to conversations
                        </button>

                        {currentMessages.length === 0 && (
                            <div className="text-center py-10">
                                <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-3 text-gray-400"><MessageCircle size={24} /></div>
                                <p className="text-gray-400 text-sm font-medium">Start the conversation about picking up {listing?.title}.</p>
                            </div>
                        )}

                        {currentMessages.map((msg, idx) => {
                            const isMe = msg.senderId === currentUser?.id;
                            return (
                                <div key={idx} className={`flex mb-4 ${isMe ? 'justify-end' : 'justify-start'}`}>
                                    <div className={`max-w-[75%] p-4 rounded-2xl text-sm shadow-sm ${isMe ? 'bg-emerald-600 text-white rounded-br-none' : 'bg-white text-gray-800 border border-gray-100 rounded-bl-none'}`}>
                                        <p className="leading-relaxed">{msg.text}</p>
                                        <div className={`text-[10px] mt-1.5 text-right font-medium opacity-70`}>{new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</div>
                                    </div>
                                </div>
                            );
                        })}

                        {isTyping && (
                            <div className="flex justify-start mb-4">
                                <div className="bg-white border border-gray-100 p-4 rounded-2xl rounded-bl-none shadow-sm flex items-center gap-1.5">
                                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
                                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
                                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                                </div>
                            </div>
                        )}
                        <div ref={messagesEndRef} />
                    </>
                )}
            </div>

            <div className="p-4 bg-white border-t border-gray-100 shrink-0">
                <div className="flex gap-3">
                    <input
                        type="text"
                        value={messageText}
                        onChange={(e) => setMessageText(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && onSendMessage()}
                        placeholder="Type a message..."
                        disabled={!activeConversationUser}
                        className="flex-1 p-4 bg-gray-50 text-gray-900 border border-gray-200 rounded-2xl focus:ring-2 focus:ring-emerald-500 outline-none transition disabled:opacity-50"
                    />
                    <button onClick={onSendMessage} disabled={!messageText.trim() || !activeConversationUser} className="bg-emerald-600 text-white p-4 rounded-2xl hover:bg-emerald-700 disabled:opacity-50 transition shadow-md hover:shadow-lg hover:-translate-y-0.5">
                        <Send size={24} />
                    </button>
                </div>
            </div>
        </>
    );
};

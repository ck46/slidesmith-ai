import { useEffect } from 'react';
import { Sparkles } from 'lucide-react';
import { useWebSocket } from '../../hooks/useWebSocket';

const BACKEND_URL = import.meta.env.VITE_BACKEND_WS_URL || 'ws://localhost:8001/ws/generate';

function InputBar({ setMessages, isGenerating, setIsGenerating, setSlides, input, setInput }) {
    const { isConnected, messages: wsMessages, connect, send, clearMessages } = useWebSocket(BACKEND_URL);

    // Process WebSocket messages
    useEffect(() => {
        if (wsMessages.length === 0) return;

        const latest = wsMessages[wsMessages.length - 1];

        if (latest.type === 'thinking') {
            setMessages(prev => {
                // Update or add thinking card
                const lastMsg = prev[prev.length - 1];
                if (lastMsg && lastMsg.type === 'action') {
                    // Update existing thinking card
                    return [
                        ...prev.slice(0, -1),
                        {
                            ...lastMsg,
                            steps: [...lastMsg.steps, latest.step]
                        }
                    ];
                } else {
                    // Add new thinking card
                    return [
                        ...prev,
                        {
                            type: 'action',
                            action: { icon: 'search', title: 'Agent Working' },
                            steps: [latest.step]
                        }
                    ];
                }
            });
        } else if (latest.type === 'slides') {
            setSlides(latest.slides);
            setMessages(prev => {
                // Remove action cards and add success message
                const withoutActions = prev.filter(msg => msg.type !== 'action');
                return [
                    ...withoutActions,
                    {
                        type: 'agent',
                        content: `Created a ${latest.slides.length}-slide presentation!`
                    }
                ];
            });
            setIsGenerating(false);
            clearMessages();
        } else if (latest.type === 'error') {
            setMessages(prev => {
                // Remove action cards and add error message
                const withoutActions = prev.filter(msg => msg.type !== 'action');
                return [
                    ...withoutActions,
                    {
                        type: 'agent',
                        content: `Error: ${latest.message}`
                    }
                ];
            });
            setIsGenerating(false);
            clearMessages();
        } else if (latest.type === 'complete') {
            setIsGenerating(false);
            clearMessages();
        }
    }, [wsMessages, setMessages, setSlides, setIsGenerating, clearMessages]);

    // Connect on mount
    useEffect(() => {
        connect();
    }, []);

    const handleSend = () => {
        if (!input.trim() || isGenerating) return;

        const userMessage = input.trim();
        setInput('');
        setIsGenerating(true);

        // Add user message
        setMessages(prev => [
            ...prev,
            { type: 'user', content: userMessage }
        ]);

        // Send to backend
        if (isConnected) {
            send({ prompt: userMessage });
        } else {
            // Fallback to connecting if not connected
            connect();
            setTimeout(() => {
                send({ prompt: userMessage });
            }, 1000);
        }
    };

    const handleKeyDown = (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSend();
        }
    };

    return (
        <div className="lab-input">
            <div className="input-container">
                <textarea
                    className="input-field"
                    placeholder={isConnected ? "Describe your presentation..." : "Connecting to AI..."}
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={handleKeyDown}
                    disabled={isGenerating || !isConnected}
                    rows={1}
                />
                <button
                    className="magic-button"
                    onClick={handleSend}
                    disabled={isGenerating || !input.trim() || !isConnected}
                >
                    <Sparkles size={18} />
                    Generate
                </button>
            </div>
            {!isConnected && (
                <div style={{ fontSize: '0.75rem', color: 'var(--ui-text-muted)', marginTop: '0.5rem' }}>
                    Connecting to backend... Make sure the backend is running on port 8001
                </div>
            )}
        </div>
    );
}

export default InputBar;

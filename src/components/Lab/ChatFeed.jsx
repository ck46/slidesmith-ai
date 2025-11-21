import { useEffect, useRef } from 'react';
import ActionCard from './ActionCard';

function ChatFeed({ messages, onChipClick }) {
    const feedRef = useRef(null);

    useEffect(() => {
        if (feedRef.current) {
            feedRef.current.scrollTop = feedRef.current.scrollHeight;
        }
    }, [messages]);

    if (messages.length === 0) {
        return (
            <div className="lab-feed">
                <div className="empty-state">
                    <div className="empty-state-title">What would you like to create?</div>
                    <div className="starter-chips">
                        <div className="starter-chip" onClick={() => onChipClick?.('Pitch Deck for SaaS Startup')}>📊 Pitch Deck for SaaS Startup</div>
                        <div className="starter-chip" onClick={() => onChipClick?.('History of Ancient Rome')}>🏛️ History of Ancient Rome</div>
                        <div className="starter-chip" onClick={() => onChipClick?.('Q3 Marketing Report')}>📈 Q3 Marketing Report</div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="lab-feed" ref={feedRef}>
            {messages.map((msg, idx) => {
                if (msg.type === 'user') {
                    return (
                        <div key={idx} className="message-bubble user">
                            {msg.content}
                        </div>
                    );
                } else if (msg.type === 'agent') {
                    return (
                        <div key={idx} className="message-bubble agent">
                            {msg.content}
                        </div>
                    );
                } else if (msg.type === 'action') {
                    return <ActionCard key={idx} action={msg.action} steps={msg.steps} />;
                }
                return null;
            })}
        </div>
    );
}

export default ChatFeed;

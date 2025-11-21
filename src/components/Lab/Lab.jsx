import { useState } from 'react';
import { Sparkles } from 'lucide-react';
import ChatFeed from './ChatFeed';
import InputBar from './InputBar';
import './Lab.css';

function Lab({ messages, setMessages, isGenerating, setIsGenerating, setSlides }) {
    const status = isGenerating ? 'thinking' : 'ready';
    const [input, setInput] = useState('');

    const handleChipClick = (text) => {
        setInput(text);
    };

    return (
        <div className="lab">
            <div className="lab-header">
                <div className="lab-identity">
                    <div className="lab-logo">SlideSmith AI</div>
                </div>
                <div className={`status-indicator ${status}`}></div>
            </div>
            <ChatFeed messages={messages} onChipClick={handleChipClick} />
            <InputBar
                setMessages={setMessages}
                isGenerating={isGenerating}
                setIsGenerating={setIsGenerating}
                setSlides={setSlides}
                input={input}
                setInput={setInput}
            />
        </div>
    );
}

export default Lab;

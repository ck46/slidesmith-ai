import { Search, PenTool, Database } from 'lucide-react';
import { useState, useEffect } from 'react';

const ICONS = {
    search: Search,
    draft: PenTool,
    data: Database,
};

function ActionCard({ action, steps }) {
    const [currentStepIndex, setCurrentStepIndex] = useState(0);
    const Icon = ICONS[action.icon] || Search;

    useEffect(() => {
        if (currentStepIndex < steps.length - 1) {
            const timer = setTimeout(() => {
                setCurrentStepIndex((prev) => prev + 1);
            }, 800);
            return () => clearTimeout(timer);
        }
    }, [currentStepIndex, steps.length]);

    return (
        <div className="action-card">
            <div className="action-card-header">
                <Icon size={18} />
                <span>{action.title}</span>
            </div>
            <div className="action-card-content">
                {steps.slice(0, currentStepIndex + 1).map((step, idx) => (
                    <div key={idx} className="thinking-step">
                        {step}
                    </div>
                ))}
            </div>
        </div>
    );
}

export default ActionCard;

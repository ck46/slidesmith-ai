import { useState } from 'react';
import './styles/variables.css';
import './styles/global.css';
import './styles/layout.css';
import Lab from './components/Lab/Lab';
import Studio from './components/Studio/Studio';

function App() {
  const [theme, setTheme] = useState('corporate');
  const [slides, setSlides] = useState([]);
  const [currentSlideIndex, setCurrentSlideIndex] = useState(0);
  const [messages, setMessages] = useState([]);
  const [isGenerating, setIsGenerating] = useState(false);

  return (
    <div className="app-container" data-theme={theme}>
      <Lab
        messages={messages}
        setMessages={setMessages}
        isGenerating={isGenerating}
        setIsGenerating={setIsGenerating}
        setSlides={setSlides}
      />
      <Studio
        theme={theme}
        setTheme={setTheme}
        slides={slides}
        setSlides={setSlides}
        currentSlideIndex={currentSlideIndex}
        setCurrentSlideIndex={setCurrentSlideIndex}
      />
    </div>
  );
}

export default App;

import Toolbar from './Toolbar';
import SlideRenderer from './SlideRenderer';
import Filmstrip from './Filmstrip';
import './Studio.css';

function Studio({ theme, setTheme, slides, setSlides, currentSlideIndex, setCurrentSlideIndex }) {
    return (
        <div className="studio">
            <Toolbar theme={theme} setTheme={setTheme} slides={slides} />
            <div className="studio-main">
                {slides.length > 0 ? (
                    <SlideRenderer slide={slides[currentSlideIndex]} theme={theme} />
                ) : (
                    <div className="studio-empty">
                        <div className="studio-empty-icon">📽️</div>
                        <div className="studio-empty-text">Your slides will appear here</div>
                    </div>
                )}
            </div>
            {slides.length > 0 && (
                <Filmstrip
                    slides={slides}
                    currentSlideIndex={currentSlideIndex}
                    setCurrentSlideIndex={setCurrentSlideIndex}
                />
            )}
        </div>
    );
}

export default Studio;

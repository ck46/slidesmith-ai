import SlideRenderer from './SlideRenderer';

function Filmstrip({ slides, currentSlideIndex, setCurrentSlideIndex }) {
    return (
        <div className="studio-filmstrip">
            <div className="filmstrip-container">
                {slides.map((slide, idx) => (
                    <div
                        key={idx}
                        className={`filmstrip-thumbnail ${idx === currentSlideIndex ? 'active' : ''}`}
                        onClick={() => setCurrentSlideIndex(idx)}
                    >
                        <div className="filmstrip-thumbnail-content">
                            <SlideRenderer slide={slide} theme="corporate" />
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}

export default Filmstrip;

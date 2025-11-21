import './Slides.css';

function SplitSlide({ title, text, imageUrl }) {
    return (
        <div className="slide split-slide">
            <div className="split-content">
                <h2 className="slide-title" contentEditable suppressContentEditableWarning>
                    {title}
                </h2>
                <div className="split-text" contentEditable suppressContentEditableWarning>
                    {text}
                </div>
            </div>
            <div className="split-media">
                {imageUrl ? (
                    <img src={imageUrl} alt="Visual content" style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '0.75rem' }} />
                ) : (
                    'Visual Content'
                )}
            </div>
        </div>
    );
}

export default SplitSlide;

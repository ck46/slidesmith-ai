import './Slides.css';

function TitleSlide({ title, subtitle, backgroundImage }) {
    const slideStyle = backgroundImage
        ? {
            backgroundImage: `url(${backgroundImage})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
        }
        : {};

    return (
        <div className="slide title-slide" style={slideStyle}>
            {backgroundImage && <div className="slide-overlay"></div>}
            <h1 className="slide-title" contentEditable suppressContentEditableWarning>
                {title}
            </h1>
            {subtitle && (
                <div className="slide-subtitle" contentEditable suppressContentEditableWarning>
                    {subtitle}
                </div>
            )}
        </div>
    );
}

export default TitleSlide;

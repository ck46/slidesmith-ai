import './Slides.css';

function QuoteSlide({ quote, author }) {
    return (
        <div className="slide quote-slide">
            <div className="quote-text" contentEditable suppressContentEditableWarning>
                {quote}
            </div>
            <div className="quote-author" contentEditable suppressContentEditableWarning>
                {author}
            </div>
        </div>
    );
}

export default QuoteSlide;

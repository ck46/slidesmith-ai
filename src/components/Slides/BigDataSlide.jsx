import './Slides.css';

function BigDataSlide({ number, caption }) {
    return (
        <div className="slide bigdata-slide">
            <div className="bigdata-number" contentEditable suppressContentEditableWarning>
                {number}
            </div>
            <div className="bigdata-caption" contentEditable suppressContentEditableWarning>
                {caption}
            </div>
        </div>
    );
}

export default BigDataSlide;

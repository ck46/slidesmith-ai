import './Slides.css';

function BulletSlide({ title, items = [] }) {
    return (
        <div className="slide bullet-slide">
            <h2 className="slide-title" contentEditable suppressContentEditableWarning>
                {title}
            </h2>
            <ul className="bullet-list">
                {items.map((item, idx) => (
                    <li key={idx} className="bullet-item" contentEditable suppressContentEditableWarning>
                        {item}
                    </li>
                ))}
            </ul>
        </div>
    );
}

export default BulletSlide;

import TitleSlide from '../Slides/TitleSlide';
import BulletSlide from '../Slides/BulletSlide';
import SplitSlide from '../Slides/SplitSlide';
import BigDataSlide from '../Slides/BigDataSlide';
import QuoteSlide from '../Slides/QuoteSlide';

function SlideRenderer({ slide, theme }) {
    const renderSlide = () => {
        switch (slide.type) {
            case 'title':
                return <TitleSlide {...slide} />;
            case 'bullet':
                return <BulletSlide {...slide} />;
            case 'split':
                return <SplitSlide {...slide} />;
            case 'bigdata':
                return <BigDataSlide {...slide} />;
            case 'quote':
                return <QuoteSlide {...slide} />;
            default:
                return <div>Unknown slide type</div>;
        }
    };

    return (
        <div className="slide-container" data-theme={theme}>
            {renderSlide()}
        </div>
    );
}

export default SlideRenderer;

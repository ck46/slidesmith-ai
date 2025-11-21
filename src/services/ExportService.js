import pptxgen from 'pptxgenjs';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

// Theme configurations
const THEME_CONFIGS = {
    corporate: {
        bgColor: 'FFFFFF',
        textColor: '1E293B',
        headingColor: '0F172A',
        accentColor: '4F46E5',
        fontFace: 'Arial',
    },
    cyber: {
        bgColor: '0F172A',
        textColor: 'E2E8F0',
        headingColor: 'F0FDF4',
        accentColor: '22D3EE',
        fontFace: 'Courier New',
    },
    editorial: {
        bgColor: 'FEFCE8',
        textColor: '374151',
        headingColor: '1F2937',
        accentColor: '92400E',
        fontFace: 'Georgia',
    },
};

// Helper function to convert image URL to base64 data URL
async function imageUrlToDataUrl(url) {
    try {
        // Use fetch which handles CORS better than Image object
        const response = await fetch(url, { mode: 'cors' });
        if (!response.ok) {
            throw new Error(`Failed to fetch image: ${response.statusText}`);
        }

        const blob = await response.blob();

        // Load image to resize it (avoid massive data URLs)
        const img = await createImageBitmap(blob);

        // Calculate new dimensions (max 1600px width)
        const maxWidth = 1600;
        let width = img.width;
        let height = img.height;

        if (width > maxWidth) {
            height = (height * maxWidth) / width;
            width = maxWidth;
        }

        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, width, height);

        // Convert to JPEG with 0.8 quality
        return canvas.toDataURL('image/jpeg', 0.8);
    } catch (error) {
        console.warn(`Failed to convert image ${url} to data URL:`, error);
        return null;
    }
}

export const exportToPDF = async () => {
    try {
        console.log('Starting PDF export...');

        const pdf = new jsPDF({
            orientation: 'landscape',
            unit: 'px',
            format: [1920, 1080], // 16:9 aspect ratio
        });

        // Get the slide container that's currently displayed
        const slideContainer = document.querySelector('.slide-container');

        if (!slideContainer) {
            throw new Error('No slide container found to export');
        }

        // Get all filmstrip thumbnails to know how many slides there are
        const thumbnails = document.querySelectorAll('.filmstrip-thumbnail');

        if (thumbnails.length === 0) {
            throw new Error('No slides available for export');
        }

        console.log(`Found ${thumbnails.length} slides to export`);

        // For each slide, click thumbnail, wait, capture, add to PDF
        for (let i = 0; i < thumbnails.length; i++) {
            console.log(`Capturing slide ${i + 1}/${thumbnails.length}...`);

            // Click the thumbnail to display the slide
            thumbnails[i].click();

            // Wait for the slide to render
            await new Promise(resolve => setTimeout(resolve, 200));

            // Capture the slide container
            const canvas = await html2canvas(slideContainer, {
                scale: 1.5,
                useCORS: true,
                backgroundColor: null,
                logging: false,
                windowWidth: 1920,
                windowHeight: 1080,
            });

            const imgData = canvas.toDataURL('image/png');
            const imgWidth = pdf.internal.pageSize.getWidth();
            const imgHeight = pdf.internal.pageSize.getHeight();

            if (i > 0) {
                pdf.addPage();
            }

            pdf.addImage(imgData, 'PNG', 0, 0, imgWidth, imgHeight);
        }

        console.log('PDF generation complete, saving...');

        // Force download (not open in new tab)
        const filename = `SlideSmith_Presentation_${Date.now()}.pdf`;
        pdf.save(filename, { returnPromise: true }).then(() => {
            console.log('PDF downloaded successfully!');

            // Navigate back to the first slide
            if (thumbnails[0]) {
                thumbnails[0].click();
            }
        });
    } catch (error) {
        console.error('PDF Export Error:', error);
        throw error;
    }
};

export const exportToPPTX = async (slides, theme = 'corporate') => {
    try {
        console.log('Starting PPTX export...');

        // First, convert all external images to data URLs
        console.log('Converting images to data URLs...');
        const processedSlides = await Promise.all(
            slides.map(async (slide) => {
                const processedSlide = { ...slide };

                // Convert background images for title slides
                if (slide.backgroundImage && slide.backgroundImage.startsWith('http')) {
                    const dataUrl = await imageUrlToDataUrl(slide.backgroundImage);
                    if (dataUrl) {
                        processedSlide.backgroundImage = dataUrl;
                    } else {
                        delete processedSlide.backgroundImage; // Remove if conversion failed
                    }
                }

                // Convert images for split slides
                if (slide.imageUrl && slide.imageUrl.startsWith('http')) {
                    const dataUrl = await imageUrlToDataUrl(slide.imageUrl);
                    if (dataUrl) {
                        processedSlide.imageUrl = dataUrl;
                    } else {
                        delete processedSlide.imageUrl; // Remove if conversion failed
                    }
                }

                return processedSlide;
            })
        );

        console.log('Images converted, generating PPTX...');

        const pptx = new pptxgen();
        const config = THEME_CONFIGS[theme];

        // Set presentation properties
        pptx.author = 'SlideSmith AI';
        pptx.title = 'AI Generated Presentation';
        pptx.subject = 'Generated by SlideSmith AI';
        pptx.layout = 'LAYOUT_16x9';

        // Define a slide master for consistent styling
        pptx.defineSlideMaster({
            title: 'MASTER_SLIDE',
            background: { color: config.bgColor },
            objects: [
                {
                    rect: {
                        x: 0,
                        y: 0,
                        w: '100%',
                        h: '100%',
                        fill: { color: config.bgColor }
                    }
                }
            ]
        });

        for (const slideData of processedSlides) {
            const slide = pptx.addSlide({ masterName: 'MASTER_SLIDE' });

            switch (slideData.type) {
                case 'title':
                    addTitleSlide(slide, slideData, config);
                    break;
                case 'bullet':
                    addBulletSlide(slide, slideData, config);
                    break;
                case 'split':
                    addSplitSlide(slide, slideData, config);
                    break;
                case 'bigdata':
                    addBigDataSlide(slide, slideData, config);
                    break;
                case 'quote':
                    addQuoteSlide(slide, slideData, config);
                    break;
                default:
                    console.warn(`Unknown slide type: ${slideData.type}`);
            }
        }

        console.log('PPTX generation complete, saving...');
        const filename = `SlideSmith_Presentation_${Date.now()}.pptx`;
        await pptx.writeFile({ fileName: filename });
        console.log('PPTX exported successfully!');
    } catch (error) {
        console.error('PPTX Export Error:', error);
        throw error;
    }
};

// Helper functions for PPTX slide generation
function addTitleSlide(slide, data, config) {
    // Add background image if available
    if (data.backgroundImage) {
        try {
            slide.background = { path: data.backgroundImage };
        } catch (error) {
            console.warn('Failed to add background image to title slide:', error);
        }
    }

    // Title - using inches for better precision
    slide.addText(data.title || '', {
        x: 1,
        y: 2.5,
        w: 8,
        h: 1.5,
        fontSize: 48,
        bold: true,
        color: data.backgroundImage ? 'FFFFFF' : config.headingColor,
        fontFace: config.fontFace,
        align: 'center',
        valign: 'middle',
    });

    // Subtitle
    if (data.subtitle) {
        slide.addText(data.subtitle, {
            x: 1,
            y: 4.2,
            w: 8,
            h: 0.8,
            fontSize: 24,
            color: config.accentColor,
            fontFace: config.fontFace,
            align: 'center',
            valign: 'middle',
        });
    }
}

function addBulletSlide(slide, data, config) {
    // Title
    slide.addText(data.title || '', {
        x: 0.5,
        y: 0.5,
        w: 9,
        h: 1,
        fontSize: 36,
        bold: true,
        color: config.headingColor,
        fontFace: config.fontFace,
    });

    // Bullet points - simplified formatting
    if (data.items && data.items.length > 0) {
        slide.addText(data.items.join('\n'), {
            x: 0.8,
            y: 1.8,
            w: 8.4,
            h: 4,
            fontSize: 20,
            color: config.textColor,
            fontFace: config.fontFace,
            bullet: true,
            valign: 'top',
        });
    }
}

function addSplitSlide(slide, data, config) {
    // Title
    slide.addText(data.title || '', {
        x: 0.5,
        y: 0.5,
        w: 9,
        h: 1,
        fontSize: 36,
        bold: true,
        color: config.headingColor,
        fontFace: config.fontFace,
    });

    // Text content on the left - ensure it's a string
    if (data.text) {
        const textContent = typeof data.text === 'string' ? data.text : String(data.text);
        slide.addText(textContent, {
            x: 0.5,
            y: 1.8,
            w: 4.5,
            h: 4,
            fontSize: 18,
            color: config.textColor,
            fontFace: config.fontFace,
            valign: 'top',
        });
    }

    // Image or placeholder
    if (data.imageUrl) {
        try {
            const imgOpts = {
                x: 5.2,
                y: 1.5,
                w: 4.3,
                h: 4,
                sizing: { type: 'contain', w: 4.3, h: 4 }
            };

            if (data.imageUrl.startsWith('data:')) {
                imgOpts.data = data.imageUrl;
            } else {
                imgOpts.path = data.imageUrl;
            }

            slide.addImage(imgOpts);
        } catch (error) {
            console.warn('Failed to add image to split slide:', error);
            // Fallback to text placeholder
            slide.addText('[Image]', {
                x: 5.2,
                y: 1.5,
                w: 4.3,
                h: 4,
                fontSize: 24,
                color: config.accentColor,
                fontFace: config.fontFace,
                align: 'center',
                valign: 'middle',
            });
        }
    } else {
        // No image - use placeholder
        slide.addText('Visual Content', {
            x: 5.2,
            y: 1.5,
            w: 4.3,
            h: 4,
            fontSize: 24,
            color: config.accentColor,
            fontFace: config.fontFace,
            align: 'center',
            valign: 'middle',
        });
    }
}

function addBigDataSlide(slide, data, config) {
    // Title
    if (data.title) {
        slide.addText(data.title, {
            x: 0.5,
            y: 0.5,
            w: 9,
            h: 1,
            fontSize: 36,
            bold: true,
            color: config.headingColor,
            fontFace: config.fontFace,
            align: 'center',
        });
    }

    // Big number
    slide.addText(data.number || '', {
        x: 1,
        y: 2,
        w: 8,
        h: 2,
        fontSize: 96,
        bold: true,
        color: config.accentColor,
        fontFace: config.fontFace,
        align: 'center',
        valign: 'middle',
    });

    // Caption
    if (data.caption) {
        slide.addText(data.caption, {
            x: 1,
            y: 4.5,
            w: 8,
            h: 1,
            fontSize: 28,
            color: config.textColor,
            fontFace: config.fontFace,
            align: 'center',
            valign: 'middle',
        });
    }
}

function addQuoteSlide(slide, data, config) {
    // Quote
    slide.addText(`"${data.quote || ''}"`, {
        x: 1,
        y: 2,
        w: 8,
        h: 2.5,
        fontSize: 32,
        italic: true,
        color: config.headingColor,
        fontFace: config.fontFace,
        align: 'center',
        valign: 'middle',
    });

    // Author
    if (data.author) {
        slide.addText(`— ${data.author}`, {
            x: 1,
            y: 4.8,
            w: 8,
            h: 0.7,
            fontSize: 28,
            color: config.accentColor,
            fontFace: config.fontFace,
            align: 'center',
            valign: 'middle',
        });
    }
}

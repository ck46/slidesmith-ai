import { Download } from 'lucide-react';
import { useState } from 'react';
import { exportToPPTX, exportToPDF } from '../../services/ExportService';

const THEMES = ['corporate', 'cyber', 'editorial'];

function Toolbar({ theme, setTheme, slides }) {
    const [showExportMenu, setShowExportMenu] = useState(false);
    const [exporting, setExporting] = useState(false);

    const handleExportPPTX = async () => {
        setExporting(true);
        setShowExportMenu(false);
        try {
            await exportToPPTX(slides, theme);
        } catch (error) {
            console.error('PPTX export failed:', error);
            alert('Export failed. Please try again.');
        }
        setExporting(false);
    };

    const handleExportPDF = async () => {
        setExporting(true);
        setShowExportMenu(false);
        try {
            await exportToPDF();
        } catch (error) {
            console.error('PDF export failed:', error);
            alert('Export failed. Please try again.');
        }
        setExporting(false);
    };

    return (
        <div className="studio-toolbar">
            <div className="theme-switcher">
                {THEMES.map((t) => (
                    <button
                        key={t}
                        className={`theme-pill ${theme === t ? 'active' : ''}`}
                        onClick={() => setTheme(t)}
                    >
                        {t}
                    </button>
                ))}
            </div>
            <div className="export-dropdown">
                <button
                    className="export-button"
                    onClick={() => setShowExportMenu(!showExportMenu)}
                    disabled={exporting}
                >
                    <Download size={16} />
                    {exporting ? 'Exporting...' : 'Export'}
                </button>
                {showExportMenu && (
                    <div className="export-menu">
                        <button onClick={handleExportPPTX}>Export as PPTX</button>
                        <button onClick={handleExportPDF}>Export as PDF</button>
                    </div>
                )}
            </div>
        </div>
    );
}

export default Toolbar;

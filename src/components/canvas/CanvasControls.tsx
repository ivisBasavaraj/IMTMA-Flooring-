import React from 'react';
import { 
  ZoomIn, 
  ZoomOut, 
  Maximize, 
  Grid, 
  Magnet, 
  Save, 
  Download,
  Share2
} from 'lucide-react';
import { useCanvasStore } from '../../store/canvasStore';
import { PDFExport } from '../export/PDFExport';

interface CanvasControlsProps {
  stageRef: React.RefObject<any>;
}

export const CanvasControls: React.FC<CanvasControlsProps> = ({ stageRef }) => {
  const { zoom, grid, setZoom, setGrid } = useCanvasStore();
  
  const handleZoomIn = () => {
    setZoom(Math.min(zoom * 1.2, 4));
  };
  
  const handleZoomOut = () => {
    setZoom(Math.max(zoom / 1.2, 0.25));
  };
  
  const handleResetZoom = () => {
    setZoom(1);
  };
  
  const handleToggleGrid = () => {
    setGrid(!grid.enabled, grid.size, grid.snap);
  };
  
  const handleToggleSnap = () => {
    setGrid(grid.enabled, grid.size, !grid.snap);
  };
  
  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: 'Event Floor Plan',
        url: window.location.href
      });
    } else {
      // Fallback to copying URL
      navigator.clipboard.writeText(window.location.href);
    }
  };

  return (
    <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2 bg-white rounded-lg shadow-lg p-2 flex items-center space-x-2">
      <button
        onClick={handleZoomOut}
        className="p-2 hover:bg-gray-100 rounded-md transition-colors"
        title="Zoom Out"
      >
        <ZoomOut size={20} />
      </button>
      
      <div className="px-2 min-w-16 text-center">
        {Math.round(zoom * 100)}%
      </div>
      
      <button
        onClick={handleZoomIn}
        className="p-2 hover:bg-gray-100 rounded-md transition-colors"
        title="Zoom In"
      >
        <ZoomIn size={20} />
      </button>
      
      <button
        onClick={handleResetZoom}
        className="p-2 hover:bg-gray-100 rounded-md transition-colors"
        title="Reset Zoom"
      >
        <Maximize size={20} />
      </button>
      
      <div className="w-px h-6 bg-gray-200 mx-1"></div>
      
      <button
        onClick={handleToggleGrid}
        className={`p-2 rounded-md transition-colors ${
          grid.enabled ? 'bg-blue-100 text-blue-600' : 'hover:bg-gray-100'
        }`}
        title="Toggle Grid"
      >
        <Grid size={20} />
      </button>
      
      <button
        onClick={handleToggleSnap}
        className={`p-2 rounded-md transition-colors ${
          grid.snap ? 'bg-blue-100 text-blue-600' : 'hover:bg-gray-100'
        }`}
        title="Toggle Snap to Grid"
      >
        <Magnet size={20} />
      </button>
      
      <div className="w-px h-6 bg-gray-200 mx-1"></div>
      
      <button
        onClick={handleShare}
        className="p-2 hover:bg-gray-100 rounded-md transition-colors"
        title="Share Floor Plan"
      >
        <Share2 size={20} />
      </button>
      
      <PDFExport stageRef={stageRef} />
    </div>
  );
};
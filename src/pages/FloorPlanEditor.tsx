import React, { useEffect } from 'react';
import { Canvas } from '../components/canvas/Canvas';
import { ToolsPanel } from '../components/panels/ToolsPanel';
import { PropertiesPanel } from '../components/panels/PropertiesPanel';
import { useCanvasStore } from '../store/canvasStore';
import { useParams } from 'react-router-dom';

export const FloorPlanEditor: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { addElement } = useCanvasStore();
  
  // Effect to create a sample booth when the editor loads
  useEffect(() => {
    const elements = useCanvasStore.getState().elements;
    
    // Only add sample elements if the canvas is empty
    if (elements.length === 0) {
      // Add a sample booth
      addElement({
        type: 'booth',
        x: 100,
        y: 100,
        width: 100,
        height: 100,
        rotation: 0,
        fill: '#FFFFFF',
        stroke: '#333333',
        strokeWidth: 1,
        draggable: true,
        layer: 1,
        customProperties: {},
        number: '101',
        status: 'available',
        dimensions: {
          imperial: '10\' x 10\'',
          metric: '3m x 3m'
        }
      });
      
      // Add some text
      addElement({
        type: 'text',
        x: 300,
        y: 150,
        width: 200,
        height: 50,
        rotation: 0,
        fill: '#333333',
        stroke: '',
        strokeWidth: 0,
        draggable: true,
        layer: 2,
        customProperties: {},
        text: 'Exhibition Hall A',
        fontSize: 24,
        fontFamily: 'Arial',
        align: 'center',
        fontStyle: 'bold'
      });
    }
  }, [addElement]);
  
  // Auto-save effect (would be implemented with throttling in a real app)
  useEffect(() => {
    const saveInterval = setInterval(() => {
      console.log('Auto-saving floor plan...');
      // Implementation would store the canvas state
    }, 30000);
    
    return () => clearInterval(saveInterval);
  }, []);
  
  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="h-16 bg-white shadow-sm border-b border-gray-200 flex items-center justify-between px-4">
        <h1 className="text-xl font-medium">Floor Plan Editor</h1>
        
        <div className="space-x-2">
          <button className="px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-md text-sm">
            Preview
          </button>
          <button className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md text-sm">
            Save
          </button>
        </div>
      </div>
      
      {/* Main content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Tools panel */}
        <div className="p-4">
          <ToolsPanel />
        </div>
        
        {/* Canvas */}
        <div className="flex-1 relative overflow-hidden">
          <Canvas />
        </div>
        
        {/* Properties panel */}
        <div className="p-4">
          <PropertiesPanel />
        </div>
      </div>
    </div>
  );
};
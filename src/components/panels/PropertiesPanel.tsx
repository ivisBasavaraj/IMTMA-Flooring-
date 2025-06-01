import React, { useState } from 'react';
import { useCanvasStore } from '../../store/canvasStore';
import { 
  BoothElement, 
  TextElement, 
  AnyCanvasElement 
} from '../../types/canvas';

export const PropertiesPanel: React.FC = () => {
  const { elements, selectedIds, updateElement } = useCanvasStore();
  
  // Get the first selected element for editing
  const selectedElement = elements.find(el => selectedIds.includes(el.id));
  
  if (!selectedElement) {
    return (
      <div className="bg-white shadow-lg rounded-md border border-gray-200 w-72 p-4">
        <h3 className="text-lg font-medium text-gray-700 mb-4">Properties</h3>
        <p className="text-gray-500 text-sm">No element selected</p>
      </div>
    );
  }
  
  return (
    <div className="bg-white shadow-lg rounded-md border border-gray-200 w-72 overflow-y-auto max-h-[calc(100vh-2rem)]">
      <div className="p-4">
        <h3 className="text-lg font-medium text-gray-700 mb-4">
          {getElementTitle(selectedElement)}
        </h3>
        
        {/* Common properties */}
        <CommonProperties element={selectedElement} />
        
        {/* Element-specific properties */}
        {selectedElement.type === 'booth' && (
          <BoothProperties element={selectedElement as BoothElement} />
        )}
        
        {selectedElement.type === 'text' && (
          <TextProperties element={selectedElement as TextElement} />
        )}
      </div>
    </div>
  );
};

const getElementTitle = (element: AnyCanvasElement): string => {
  switch (element.type) {
    case 'booth':
      return `Booth ${(element as BoothElement).number}`;
    case 'text':
      return 'Text Element';
    case 'shape':
      return 'Shape';
    case 'image':
      return 'Image';
    default:
      return 'Element';
  }
};

interface PropertiesProps {
  element: AnyCanvasElement;
}

const CommonProperties: React.FC<PropertiesProps> = ({ element }) => {
  const { updateElement } = useCanvasStore();
  
  const handleChange = (field: keyof AnyCanvasElement, value: any) => {
    updateElement(element.id, { [field]: value });
  };
  
  return (
    <div className="space-y-4 mb-6">
      <h4 className="font-medium text-gray-600 border-b pb-1">Dimensions & Position</h4>
      
      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1">
          <label className="text-xs text-gray-500">X Position</label>
          <input 
            type="number" 
            value={element.x} 
            onChange={(e) => handleChange('x', Number(e.target.value))}
            className="w-full p-1 text-sm border border-gray-300 rounded" 
          />
        </div>
        
        <div className="space-y-1">
          <label className="text-xs text-gray-500">Y Position</label>
          <input 
            type="number" 
            value={element.y} 
            onChange={(e) => handleChange('y', Number(e.target.value))}
            className="w-full p-1 text-sm border border-gray-300 rounded" 
          />
        </div>
        
        <div className="space-y-1">
          <label className="text-xs text-gray-500">Width</label>
          <input 
            type="number" 
            value={element.width} 
            onChange={(e) => handleChange('width', Number(e.target.value))}
            className="w-full p-1 text-sm border border-gray-300 rounded" 
          />
        </div>
        
        <div className="space-y-1">
          <label className="text-xs text-gray-500">Height</label>
          <input 
            type="number" 
            value={element.height} 
            onChange={(e) => handleChange('height', Number(e.target.value))}
            className="w-full p-1 text-sm border border-gray-300 rounded" 
          />
        </div>
      </div>
      
      <div className="space-y-1">
        <label className="text-xs text-gray-500">Rotation (degrees)</label>
        <input 
          type="number" 
          value={element.rotation} 
          onChange={(e) => handleChange('rotation', Number(e.target.value))}
          className="w-full p-1 text-sm border border-gray-300 rounded" 
        />
      </div>
      
      <h4 className="font-medium text-gray-600 border-b pb-1 mt-4">Appearance</h4>
      
      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1">
          <label className="text-xs text-gray-500">Fill Color</label>
          <div className="flex">
            <input 
              type="color" 
              value={element.fill} 
              onChange={(e) => handleChange('fill', e.target.value)}
              className="w-8 h-8 border border-gray-300 rounded mr-2" 
            />
            <input 
              type="text" 
              value={element.fill} 
              onChange={(e) => handleChange('fill', e.target.value)}
              className="w-full p-1 text-sm border border-gray-300 rounded" 
            />
          </div>
        </div>
        
        <div className="space-y-1">
          <label className="text-xs text-gray-500">Stroke Color</label>
          <div className="flex">
            <input 
              type="color" 
              value={element.stroke} 
              onChange={(e) => handleChange('stroke', e.target.value)}
              className="w-8 h-8 border border-gray-300 rounded mr-2" 
            />
            <input 
              type="text" 
              value={element.stroke} 
              onChange={(e) => handleChange('stroke', e.target.value)}
              className="w-full p-1 text-sm border border-gray-300 rounded" 
            />
          </div>
        </div>
      </div>
      
      <div className="space-y-1">
        <label className="text-xs text-gray-500">Stroke Width</label>
        <input 
          type="number" 
          value={element.strokeWidth} 
          onChange={(e) => handleChange('strokeWidth', Number(e.target.value))}
          className="w-full p-1 text-sm border border-gray-300 rounded" 
          min="0"
          step="0.5"
        />
      </div>
    </div>
  );
};

const BoothProperties: React.FC<{ element: BoothElement }> = ({ element }) => {
  const { updateElement, updateBoothStatus } = useCanvasStore();
  
  const handleChange = (field: keyof BoothElement, value: any) => {
    updateElement(element.id, { [field]: value });
  };
  
  return (
    <div className="space-y-4">
      <h4 className="font-medium text-gray-600 border-b pb-1">Booth Properties</h4>
      
      <div className="space-y-1">
        <label className="text-xs text-gray-500">Booth Number</label>
        <input 
          type="text" 
          value={element.number} 
          onChange={(e) => handleChange('number', e.target.value)}
          className="w-full p-1 text-sm border border-gray-300 rounded" 
        />
      </div>
      
      <div className="space-y-1">
        <label className="text-xs text-gray-500">Status</label>
        <select 
          value={element.status} 
          onChange={(e) => updateBoothStatus(element.id, e.target.value as BoothElement['status'])}
          className="w-full p-1 text-sm border border-gray-300 rounded" 
        >
          <option value="available">Available</option>
          <option value="reserved">Reserved</option>
          <option value="sold">Sold</option>
        </select>
      </div>
      
      <div className="space-y-1">
        <label className="text-xs text-gray-500">Price</label>
        <input 
          type="number" 
          value={element.price || ''} 
          onChange={(e) => handleChange('price', e.target.value ? Number(e.target.value) : undefined)}
          placeholder="Enter price"
          className="w-full p-1 text-sm border border-gray-300 rounded" 
        />
      </div>
      
      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1">
          <label className="text-xs text-gray-500">Dimensions (Imperial)</label>
          <input 
            type="text" 
            value={element.dimensions.imperial} 
            onChange={(e) => handleChange('dimensions', { 
              ...element.dimensions, 
              imperial: e.target.value 
            })}
            placeholder="10' x 10'"
            className="w-full p-1 text-sm border border-gray-300 rounded" 
          />
        </div>
        
        <div className="space-y-1">
          <label className="text-xs text-gray-500">Dimensions (Metric)</label>
          <input 
            type="text" 
            value={element.dimensions.metric} 
            onChange={(e) => handleChange('dimensions', { 
              ...element.dimensions, 
              metric: e.target.value 
            })}
            placeholder="3m x 3m"
            className="w-full p-1 text-sm border border-gray-300 rounded" 
          />
        </div>
      </div>
    </div>
  );
};

const TextProperties: React.FC<{ element: TextElement }> = ({ element }) => {
  const { updateElement } = useCanvasStore();
  
  const handleChange = (field: keyof TextElement, value: any) => {
    updateElement(element.id, { [field]: value });
  };
  
  return (
    <div className="space-y-4">
      <h4 className="font-medium text-gray-600 border-b pb-1">Text Properties</h4>
      
      <div className="space-y-1">
        <label className="text-xs text-gray-500">Text Content</label>
        <textarea 
          value={element.text} 
          onChange={(e) => handleChange('text', e.target.value)}
          className="w-full p-1 text-sm border border-gray-300 rounded min-h-24" 
        />
      </div>
      
      <div className="space-y-1">
        <label className="text-xs text-gray-500">Font Size</label>
        <input 
          type="number" 
          value={element.fontSize} 
          onChange={(e) => handleChange('fontSize', Number(e.target.value))}
          className="w-full p-1 text-sm border border-gray-300 rounded" 
          min="8"
          max="120"
        />
      </div>
      
      <div className="space-y-1">
        <label className="text-xs text-gray-500">Font Family</label>
        <select 
          value={element.fontFamily} 
          onChange={(e) => handleChange('fontFamily', e.target.value)}
          className="w-full p-1 text-sm border border-gray-300 rounded" 
        >
          <option value="Arial">Arial</option>
          <option value="Helvetica">Helvetica</option>
          <option value="Times New Roman">Times New Roman</option>
          <option value="Courier New">Courier New</option>
          <option value="Georgia">Georgia</option>
          <option value="Verdana">Verdana</option>
        </select>
      </div>
      
      <div className="space-y-1">
        <label className="text-xs text-gray-500">Text Align</label>
        <select 
          value={element.align} 
          onChange={(e) => handleChange('align', e.target.value)}
          className="w-full p-1 text-sm border border-gray-300 rounded" 
        >
          <option value="left">Left</option>
          <option value="center">Center</option>
          <option value="right">Right</option>
        </select>
      </div>
      
      <div className="space-y-1">
        <label className="text-xs text-gray-500">Font Style</label>
        <select 
          value={element.fontStyle} 
          onChange={(e) => handleChange('fontStyle', e.target.value)}
          className="w-full p-1 text-sm border border-gray-300 rounded" 
        >
          <option value="normal">Normal</option>
          <option value="bold">Bold</option>
          <option value="italic">Italic</option>
          <option value="bold italic">Bold Italic</option>
        </select>
      </div>
    </div>
  );
};

import React, { ReactElement } from 'react';
import { MousePointer, Grid3x3, Square, Circle, Type, Image, LineChart, Copy, Trash2, ChevronUp, ChevronDown, ArrowUpToLine, ArrowDownToLine, Ruler, Sofa, DoorOpen, Trees, Users, Car, Ban, Utensils, Info, Coffee, CreditCard, /* Elevator, */ AlertTriangle, Baby, Stethoscope, GraduationCap, Accessibility, Archive, HelpCircle, Activity, /* Toilet, */ Droplet, Briefcase, LucideIcon } from 'lucide-react';
import { useCanvasStore } from '../../store/canvasStore';

import './tools-panel.css';

// Define interfaces for our tool items
interface ToolItem {
  id: string;
  icon: ReactElement;
  label: string;
}

interface ActionItem extends ToolItem {
  action: () => void;
  disabled: boolean;
}

export const ToolsPanel: React.FC = () => {
  const { 
    activeTool, 
    selectedIds, 
    setActiveTool,
    deleteElements,
    duplicateElements,
    bringForward,
    sendBackward,
    bringToFront,
    sendToBack
  } = useCanvasStore();
  
  const hasSelection = selectedIds.length > 0;
  
  const tools: ToolItem[] = [
    { id: 'select', icon: <MousePointer className="tool-icon" />, label: 'Select' },
    { id: 'booth', icon: <Grid3x3 className="tool-icon" />, label: 'Booth' },
    { id: 'rectangle', icon: <Square className="tool-icon" />, label: 'Rectangle' },
    { id: 'circle', icon: <Circle className="tool-icon" />, label: 'Circle' },
    { id: 'text', icon: <Type className="tool-icon" />, label: 'Text' },
    { id: 'image', icon: <Image className="tool-icon" />, label: 'Image' },
    { id: 'line', icon: <LineChart className="tool-icon" />, label: 'Line' },
    { id: 'wall', icon: <Ruler className="tool-icon" />, label: 'Wall' },
    { id: 'door', icon: <DoorOpen className="tool-icon" />, label: 'Door' },
    { id: 'furniture', icon: <Sofa className="tool-icon" />, label: 'Furniture' },
    { id: 'plant', icon: <Trees className="tool-icon" />, label: 'Plant' },
    
    // Meeting / Conference Room
    { id: 'meeting-room', icon: <Users size={20} />, label: 'Meeting Room' },
    
    // Family / Family Services
    { id: 'family-services', icon: <Baby size={20} />, label: 'Family Services' },
    
    // Car / Transportation
    { id: 'transportation', icon: <Car size={20} />, label: 'Transportation' },
    
    // No Smoking
    { id: 'no-smoking', icon: <Ban size={20} />, label: 'No Smoking' },
    
    // Restaurant / Dining
    { id: 'restaurant', icon: <Utensils size={20} />, label: 'Restaurant' },
    
    // Information / Help Desk
    { id: 'information', icon: <Info size={20} />, label: 'Information' },
    
    // Cafeteria / Food Service
    { id: 'cafeteria', icon: <Coffee size={20} />, label: 'Cafeteria' },
    
    // ATM / Banking Services
    { id: 'atm', icon: <CreditCard size={20} />, label: 'ATM' },
    
    // Elevator
    { id: 'elevator', icon: /* <Elevator size={20} /> */ <CreditCard size={20} />, label: 'Elevator' },
    
    // Emergency Exit
    { id: 'emergency-exit', icon: <AlertTriangle size={20} />, label: 'Emergency Exit' },
    
    // Doctor / Medical Services
    { id: 'medical', icon: <Stethoscope size={20} />, label: 'Medical' },
    
    // Childcare / Family Room
    { id: 'childcare', icon: <Baby size={20} />, label: 'Childcare' },
    
    // Nursing Room / Mother and Baby Room
    { id: 'nursing-room', icon: <Baby size={20} />, label: 'Nursing Room' },
    
    // Senior Citizen / Elderly Assistance
    { id: 'senior-assistance', icon: <GraduationCap size={20} />, label: 'Senior Assistance' },
    
    // Accessible / Wheelchair Accessible
    { id: 'wheelchair-accessible', icon: <Accessibility size={20} />, label: 'Wheelchair Accessible' },
    
    // Lost and Found
    { id: 'lost-found', icon: <Archive size={20} />, label: 'Lost & Found' },
    
    // Information Point
    { id: 'info-point', icon: <HelpCircle size={20} />, label: 'Info Point' },
    
    // First Aid / Medical Assistance
    { id: 'first-aid', icon: <Activity size={20} />, label: 'First Aid' },
    
    // Restroom (All Gender or Male and Female)
    { id: 'restroom', icon: /* <Toilet size={20} /> */ <Droplet size={20} />, label: 'Restroom' },
    
    // Men’s Restroom
    { id: 'mens-restroom', icon: <Droplet size={20} />, label: "Men's Restroom" },
    
    // Women’s Restroom
    { id: 'womens-restroom', icon: <Droplet size={20} />, label: "Women's Restroom" },
    
    // Luggage / Baggage Services
    { id: 'baggage', icon: <Briefcase size={20} />, label: 'Baggage' }
  ];
  
  const actions: ActionItem[] = [
    { 
      id: 'duplicate', 
      icon: <Copy size={20} />, 
      label: 'Duplicate', 
      action: () => duplicateElements(selectedIds),
      disabled: !hasSelection
    },
    { 
      id: 'delete', 
      icon: <Trash2 size={20} />, 
      label: 'Delete', 
      action: () => deleteElements(selectedIds),
      disabled: !hasSelection
    },
    { 
      id: 'bringForward', 
      icon: <ChevronUp size={20} />, 
      label: 'Bring Forward', 
      action: () => bringForward(selectedIds),
      disabled: !hasSelection
    },
    { 
      id: 'sendBackward', 
      icon: <ChevronDown size={20} />, 
      label: 'Send Backward', 
      action: () => sendBackward(selectedIds),
      disabled: !hasSelection
    },
    { 
      id: 'bringToFront', 
      icon: <ArrowUpToLine size={20} />, 
      label: 'Bring to Front', 
      action: () => bringToFront(selectedIds),
      disabled: !hasSelection
    },
    { 
      id: 'sendToBack', 
      icon: <ArrowDownToLine size={20} />, 
      label: 'Send to Back', 
      action: () => sendToBack(selectedIds),
      disabled: !hasSelection
    }
  ];

  // Group tools into categories for better organization
  const basicTools = tools.slice(0, 11); // First 11 tools are basic elements
  const facilityTools = [
    tools.find(t => t.id === 'meeting-room'),
    tools.find(t => t.id === 'restaurant'),
    tools.find(t => t.id === 'information'),
    tools.find(t => t.id === 'cafeteria'),
    tools.find(t => t.id === 'atm'),
    tools.find(t => t.id === 'elevator'),
    tools.find(t => t.id === 'restroom'),
    tools.find(t => t.id === 'mens-restroom'),
    tools.find(t => t.id === 'womens-restroom'),
  ].filter((tool): tool is ToolItem => Boolean(tool));
  
  const serviceTools = [
    tools.find(t => t.id === 'family-services'),
    tools.find(t => t.id === 'medical'),
    tools.find(t => t.id === 'childcare'),
    tools.find(t => t.id === 'nursing-room'),
    tools.find(t => t.id === 'senior-assistance'),
    tools.find(t => t.id === 'wheelchair-accessible'),
    tools.find(t => t.id === 'lost-found'),
    tools.find(t => t.id === 'info-point'),
    tools.find(t => t.id === 'first-aid'),
    tools.find(t => t.id === 'baggage'),
  ].filter((tool): tool is ToolItem => Boolean(tool));
  
  const specialTools = [
    tools.find(t => t.id === 'transportation'),
    tools.find(t => t.id === 'no-smoking'),
    tools.find(t => t.id === 'emergency-exit'),
  ].filter((tool): tool is ToolItem => Boolean(tool));

  // Add className to all icons for consistent styling
  const addToolIconClass = (toolList: ToolItem[]): ToolItem[] => {
    return toolList.map(tool => ({
      ...tool,
      icon: React.cloneElement(tool.icon, { 
        className: tool.icon.props.className || "tool-icon" 
      })
    }));
  };

  const enhancedBasicTools = addToolIconClass(basicTools);
  const enhancedFacilityTools = addToolIconClass(facilityTools);
  const enhancedServiceTools = addToolIconClass(serviceTools);
  const enhancedSpecialTools = addToolIconClass(specialTools);

  // Function to render a tool item
  const renderToolItem = (tool: ToolItem): JSX.Element => (
    <div
      key={tool.id}
      className={`tool-item ${activeTool === tool.id ? 'active' : ''}`}
      onClick={() => setActiveTool(tool.id)}
      title={tool.label}
      draggable="true"
      onDragStart={(e: React.DragEvent<HTMLDivElement>) => {
        e.dataTransfer.setData('text/plain', tool.id);
        e.dataTransfer.effectAllowed = 'copy';
      }}
    >
      <div className="flex items-center">
        {tool.icon}
        <span className="ml-3">{tool.label}</span>
      </div>
    </div>
  );

  // Function to render a category of tools
  const renderToolCategory = (title: string, toolsList: ToolItem[]): JSX.Element => (
    <div className="mb-4">
      <h3 className="text-sm font-medium text-gray-500 mb-2">{title}</h3>
      <div className="space-y-1">
        {toolsList.map(renderToolItem)}
      </div>
    </div>
  );

  return (
    <div className="p-4 bg-white rounded-lg shadow-md overflow-y-auto max-h-[calc(100vh-120px)]">
      <h2 className="text-lg font-semibold mb-4">Tools</h2>
      
      <div className="space-y-2">
        {/* Basic Elements */}
        {renderToolCategory('Basic Elements', enhancedBasicTools)}
        
        {/* Facilities */}
        {renderToolCategory('Facilities', enhancedFacilityTools)}
        
        {/* Services */}
        {renderToolCategory('Services', enhancedServiceTools)}
        
        {/* Special Areas */}
        {renderToolCategory('Special Areas', enhancedSpecialTools)}
        
        <hr className="my-3 border-gray-200" />
        
        {/* Action buttons */}
        <div className="mt-4">
          <h3 className="text-sm font-medium text-gray-500 mb-2">Actions</h3>
          <div className="grid grid-cols-2 gap-1">
            <button
              onClick={() => deleteElements(selectedIds)}
              disabled={!hasSelection}
              className="p-2 text-sm text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              title="Delete selected elements"
            >
              <Trash2 size={16} />
            </button>
            <button
              onClick={() => duplicateElements(selectedIds)}
              disabled={!hasSelection}
              className="p-2 text-sm text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              title="Duplicate selected elements"
            >
              <Copy size={16} />
            </button>
            <button
              onClick={() => bringForward(selectedIds)}
              disabled={!hasSelection}
              className="p-2 text-sm text-gray-600 hover:text-green-600 hover:bg-green-50 rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              title="Bring forward"
            >
              <ChevronUp size={16} />
            </button>
            <button
              onClick={() => sendBackward(selectedIds)}
              disabled={!hasSelection}
              className="p-2 text-sm text-gray-600 hover:text-green-600 hover:bg-green-50 rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              title="Send backward"
            >
              <ChevronDown size={16} />
            </button>
            <button
              onClick={() => bringToFront(selectedIds)}
              disabled={!hasSelection}
              className="p-2 text-sm text-gray-600 hover:text-purple-600 hover:bg-purple-50 rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              title="Bring to front"
            >
              <ArrowUpToLine size={16} />
            </button>
            <button
              onClick={(e) => sendToBack(selectedIds)}
              disabled={!hasSelection}
              className="p-2 text-sm text-gray-600 hover:text-purple-600 hover:bg-purple-50 rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              title="Send to back"
            >
              <ArrowDownToLine size={16} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
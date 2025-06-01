import React, { useRef, useEffect, useState, useCallback } from 'react';
import { Stage, Layer, Rect, Line } from 'react-konva';
import { useCanvasStore } from '../../store/canvasStore';
import { CanvasGrid } from './CanvasGrid';
import { ElementRenderer } from './ElementRenderer';
import { SelectionRect } from './SelectionRect';
import { CanvasControls } from './CanvasControls';
import { BackgroundControls } from './BackgroundControls';
import { PreviewShape } from './PreviewShape';
import { BackgroundImage } from './BackgroundImage';
import { FlooringLayer } from './FlooringLayer';
import { FlooringToolbar } from './FlooringToolbar';
import { IconColors } from '../icons/IconPaths';
import type { BoothElement, ShapeElement, FurnitureElement, DoorElement, PlantElement, Point } from '../../types/canvas';

export const Canvas: React.FC = () => {
  const stageRef = useRef<any>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [dragStartPos, setDragStartPos] = useState<{ x: number, y: number } | null>(null);
  const [isDragOver, setIsDragOver] = useState(false);

  const {
    elements,
    selectedIds,
    grid,
    zoom,
    offset,
    canvasSize,
    activeTool,
    backgroundImage,
    flooring,
    addElement,
    selectElements,
    deselectAll,
    setZoom,
    setOffset,
    setActiveTool,
    deleteElements
  } = useCanvasStore();

  const [selectionStart, setSelectionStart] = useState<{ x: number, y: number } | null>(null);
  const [selectionEnd, setSelectionEnd] = useState<{ x: number, y: number } | null>(null);
  const [isPanning, setIsPanning] = useState(false);
  
  // Handle keyboard events for delete
  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    // Delete or Backspace key
    if ((e.key === 'Delete' || e.key === 'Backspace') && selectedIds.length > 0) {
      deleteElements(selectedIds);
    }
  }, [selectedIds, deleteElements]);
  
  // Add and remove keyboard event listeners
  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [handleKeyDown]);

  // Handle mouse down for selection, pan, or element creation
  const handleMouseDown = (e: any) => {
    if (e.evt.button === 2) {
      e.evt.preventDefault();
      return;
    }

    const stage = stageRef.current;
    const pointerPos = stage.getPointerPosition();
    const canvasPos = {
      x: (pointerPos.x - offset.x) / zoom,
      y: (pointerPos.y - offset.y) / zoom
    };

    // Start panning with middle mouse or ctrl + left mouse
    if (e.evt.button === 1 || (e.evt.button === 0 && e.evt.ctrlKey)) {
      setIsPanning(true);
      return;
    }

    // Handle element creation tools
    if (activeTool !== 'select' && e.evt.button === 0) {
      setIsDragging(true);
      setDragStartPos(canvasPos);
      return;
    }

    // Start selection rect if using select tool
    if (activeTool === 'select' && e.evt.button === 0) {
      setSelectionStart(canvasPos);
      setSelectionEnd(canvasPos);
    }
  };

  // Handle mouse move for selection, pan, or element creation
  const handleMouseMove = (e: any) => {
    if (isPanning && stageRef.current) {
      const dx = e.evt.movementX;
      const dy = e.evt.movementY;
      setOffset(offset.x + dx, offset.y + dy);
      return;
    }

    const stage = stageRef.current;
    const pointerPos = stage.getPointerPosition();
    const canvasPos = {
      x: (pointerPos.x - offset.x) / zoom,
      y: (pointerPos.y - offset.y) / zoom
    };

    // Update selection or preview shape
    if (isDragging && dragStartPos) {
      setSelectionEnd(canvasPos);
    } else if (selectionStart) {
      setSelectionEnd(canvasPos);
    }
  };

  // Handle mouse up for selection, pan, or element creation
  const handleMouseUp = (e: any) => {
    try {
      if (isPanning) {
        setIsPanning(false);
        return;
      }
  
      // Create new element if dragging with a creation tool
      if (isDragging && dragStartPos && selectionEnd) {
        const width = Math.abs(selectionEnd.x - dragStartPos.x);
        const height = Math.abs(selectionEnd.y - dragStartPos.y);
        
        // Only create if there's a meaningful size
        if (width > 5 && height > 5) {
          const x = Math.min(dragStartPos.x, selectionEnd.x);
          const y = Math.min(dragStartPos.y, selectionEnd.y);

        // Create a function to handle all tool types
        const createElementForTool = () => {
          // Base properties for all elements
          const baseProps = {
            x,
            y,
            rotation: 0,
            draggable: true,
            customProperties: {}
          };

          // Handle different tool types
          switch (activeTool) {
            case 'booth':
              return {
                ...baseProps,
                type: 'booth',
                width,
                height,
                fill: '#FFFFFF',
                stroke: '#333333',
                strokeWidth: 1,
                layer: 1,
                number: `B-${Math.floor(Math.random() * 1000)}`,
                status: 'available',
                dimensions: {
                  imperial: `${Math.round(width / 12)}'x${Math.round(height / 12)}'`,
                  metric: `${Math.round(width * 0.0254)}m x ${Math.round(height * 0.0254)}m`
                }
              } as Omit<BoothElement, 'id' | 'selected'>;
              
            case 'line':
              return {
                ...baseProps,
                type: 'shape',
                shapeType: 'line',
                width,
                height,
                fill: 'transparent',
                stroke: '#333333',
                strokeWidth: 2,
                layer: 1,
                points: [0, 0, width, height]
              } as Omit<ShapeElement, 'id' | 'selected'>;
              
            case 'wall':
              return {
                ...baseProps,
                type: 'shape',
                shapeType: 'rectangle',
                width,
                height,
                fill: '#8B4513',
                stroke: '#654321',
                strokeWidth: 2,
                layer: 1
              } as Omit<ShapeElement, 'id' | 'selected'>;
              
            case 'door':
              return {
                ...baseProps,
                type: 'door',
                width: 30,
                height: 5,
                fill: '#A0522D',
                stroke: '#800000',
                strokeWidth: 1,
                layer: 2,
                direction: 'right'
              } as Omit<DoorElement, 'id' | 'selected'>;
              
            case 'furniture':
              return {
                ...baseProps,
                type: 'furniture',
                furnitureType: 'sofa',
                width: 60,
                height: 40,
                fill: '#C0C0C0',
                stroke: '#808080',
                strokeWidth: 1,
                layer: 2
              } as Omit<FurnitureElement, 'id' | 'selected'>;
              
            case 'meeting-room':
              return {
                ...baseProps,
                type: 'furniture',
                furnitureType: 'meeting',
                width: 80,
                height: 60,
                fill: '#E3F2FD',
                stroke: '#4285F4',
                strokeWidth: 1,
                layer: 2,
                customProperties: {
                  description: 'Meeting/Conference Area'
                }
              } as Omit<FurnitureElement, 'id' | 'selected'>;
              
            case 'restroom':
              return {
                ...baseProps,
                type: 'furniture',
                furnitureType: 'restroom',
                width: 50,
                height: 50,
                fill: '#E8EAF6',
                stroke: '#3F51B5',
                strokeWidth: 1,
                layer: 2,
                customProperties: {
                  description: 'Restroom Area'
                }
              } as Omit<FurnitureElement, 'id' | 'selected'>;
              
            case 'emergency-exit':
              return {
                ...baseProps,
                type: 'door',
                furnitureType: 'emergency',
                width: 40,
                height: 10,
                fill: '#FFEBEE',
                stroke: '#F44336',
                strokeWidth: 2,
                layer: 2,
                direction: 'out',
                customProperties: {
                  isEmergency: true,
                  description: 'Emergency Exit'
                }
              } as Omit<DoorElement, 'id' | 'selected'>;
              
            case 'plant':
              return {
                ...baseProps,
                type: 'plant',
                plantType: 'tree',
                width: 40,
                height: 40,
                fill: 'rgba(255, 255, 255, 0.2)', // Almost transparent background
                stroke: IconColors.plant,
                strokeWidth: 1,
                layer: 0
              } as Omit<PlantElement, 'id' | 'selected'>;
              
            case 'restaurant':
              return {
                ...baseProps,
                type: 'furniture',
                furnitureType: 'restaurant',
                width: 60,
                height: 60,
                fill: 'rgba(255, 255, 255, 0.2)', // Almost transparent background
                stroke: IconColors.restaurant,
                strokeWidth: 1,
                layer: 2,
                customProperties: {
                  description: 'Restaurant/Dining Area'
                }
              } as Omit<FurnitureElement, 'id' | 'selected'>;
              
            case 'information':
              return {
                ...baseProps,
                type: 'furniture',
                furnitureType: 'info',
                width: 40,
                height: 40,
                fill: 'rgba(255, 255, 255, 0.2)', // Almost transparent background
                stroke: IconColors.info,
                strokeWidth: 1,
                layer: 2,
                customProperties: {
                  description: 'Information Desk'
                }
              } as Omit<FurnitureElement, 'id' | 'selected'>;
              
            case 'cafeteria':
              return {
                ...baseProps,
                type: 'furniture',
                furnitureType: 'cafeteria',
                width: 70,
                height: 50,
                fill: 'rgba(255, 255, 255, 0.2)', // Almost transparent background
                stroke: IconColors.cafeteria,
                strokeWidth: 1,
                layer: 2,
                customProperties: {
                  description: 'Cafeteria/Food Service'
                }
              } as Omit<FurnitureElement, 'id' | 'selected'>;
              
            case 'atm':
              return {
                ...baseProps,
                type: 'furniture',
                furnitureType: 'atm',
                width: 30,
                height: 30,
                fill: 'rgba(255, 255, 255, 0.2)', // Almost transparent background
                stroke: IconColors.atm,
                strokeWidth: 1,
                layer: 2,
                customProperties: {
                  description: 'ATM/Banking Services'
                }
              } as Omit<FurnitureElement, 'id' | 'selected'>;
              
            case 'elevator':
              return {
                ...baseProps,
                type: 'furniture',
                furnitureType: 'elevator',
                width: 40,
                height: 40,
                fill: 'rgba(255, 255, 255, 0.2)', // Almost transparent background
                stroke: IconColors.elevator,
                strokeWidth: 1,
                layer: 2,
                customProperties: {
                  description: 'Elevator'
                }
              } as Omit<FurnitureElement, 'id' | 'selected'>;
              
            case 'medical':
            case 'first-aid':
              return {
                ...baseProps,
                type: 'furniture',
                furnitureType: 'medical',
                width: 50,
                height: 40,
                fill: 'rgba(255, 255, 255, 0.2)', // Almost transparent background
                stroke: IconColors.medical,
                strokeWidth: 1,
                layer: 2,
                customProperties: {
                  description: 'Medical Services/First Aid'
                }
              } as Omit<FurnitureElement, 'id' | 'selected'>;
              
            case 'childcare':
            case 'nursing-room':
              return {
                ...baseProps,
                type: 'furniture',
                furnitureType: 'childcare',
                width: 50,
                height: 40,
                fill: 'rgba(255, 255, 255, 0.2)', // Almost transparent background
                stroke: IconColors.childcare,
                strokeWidth: 1,
                layer: 2,
                customProperties: {
                  description: activeTool === 'childcare' ? 'Childcare Area' : 'Nursing Room'
                }
              } as Omit<FurnitureElement, 'id' | 'selected'>;
              
            case 'wheelchair-accessible':
              return {
                ...baseProps,
                type: 'furniture',
                furnitureType: 'accessible',
                width: 40,
                height: 40,
                fill: 'rgba(255, 255, 255, 0.2)', // Almost transparent background
                stroke: IconColors.accessible,
                strokeWidth: 1,
                layer: 2,
                customProperties: {
                  description: 'Wheelchair Accessible'
                }
              } as Omit<FurnitureElement, 'id' | 'selected'>;
              
            case 'mens-restroom':
            case 'womens-restroom':
              return {
                ...baseProps,
                type: 'furniture',
                furnitureType: 'restroom', // Use the standard restroom icon for both
                width: 40,
                height: 40,
                fill: 'rgba(255, 255, 255, 0.2)', // Almost transparent background
                stroke: IconColors.restroom,
                strokeWidth: 1,
                layer: 2,
                customProperties: {
                  description: activeTool === 'mens-restroom' ? "Men's Restroom" : "Women's Restroom"
                }
              } as Omit<FurnitureElement, 'id' | 'selected'>;
              
            // Add cases for all other tools from the ToolsPanel
            default:
              // For any other tool, create a generic furniture element
              return {
                ...baseProps,
                type: 'furniture',
                furnitureType: activeTool,
                width: 50,
                height: 40,
                fill: '#F5F5F5',
                stroke: '#9E9E9E',
                strokeWidth: 1,
                layer: 2,
                customProperties: {
                  description: activeTool.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase())
                }
              } as Omit<FurnitureElement, 'id' | 'selected'>;
          }
        };
        
        // Add the element based on the active tool
        const elementToAdd = createElementForTool();
        if (elementToAdd) {
          addElement(elementToAdd);
        }
      }

      setIsDragging(false);
      setDragStartPos(null);
      setSelectionEnd(null);
      return;
    }

    // Handle selection rectangle
    if (selectionStart && selectionEnd && activeTool === 'select') {
      const left = Math.min(selectionStart.x, selectionEnd.x);
      const top = Math.min(selectionStart.y, selectionEnd.y);
      const right = Math.max(selectionStart.x, selectionEnd.x);
      const bottom = Math.max(selectionStart.y, selectionEnd.y);
      
      const hasSize = Math.abs(right - left) > 5 && Math.abs(bottom - top) > 5;
      
      if (hasSize) {
        const selectedElements = elements.filter(element => {
          const { x, y, width, height } = element;
          return (
            x < right &&
            x + width > left &&
            y < bottom &&
            y + height > top
          );
        });
        
        selectElements(selectedElements.map(el => el.id));
      }
    }
    
    setSelectionStart(null);
    setSelectionEnd(null);
    } catch (error) {
      console.error("Error in handleMouseUp:", error);
      // Reset state to prevent UI from getting stuck
      setIsDragging(false);
      setDragStartPos(null);
      setSelectionStart(null);
      setSelectionEnd(null);
      setIsPanning(false);
    }
  };

  // Handle wheel event for zooming
  const handleWheel = (e: any) => {
    e.evt.preventDefault();
    
    const stage = stageRef.current;
    const oldScale = zoom;
    
    const newScale = e.evt.deltaY < 0 
      ? oldScale * 1.1 
      : oldScale / 1.1;
    
    const scale = Math.min(Math.max(newScale, 0.25), 4);
    
    const pointer = stage.getPointerPosition();
    
    const newOffset = {
      x: pointer.x - (pointer.x - offset.x) * (scale / oldScale),
      y: pointer.y - (pointer.y - offset.y) * (scale / oldScale)
    };
    
    setZoom(scale);
    setOffset(newOffset.x, newOffset.y);
  };
  
  // Handle context menu
  const handleContextMenu = (e: any) => {
    e.evt.preventDefault();
  };

  // Handle drag and drop from tools panel
  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = () => {
    setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragOver(false);
    
    const toolId = e.dataTransfer.getData('text/plain');
    if (!toolId) return;
    
    // Get the drop position in canvas coordinates
    const stage = stageRef.current;
    if (!stage) return;
    
    const pointerPos = stage.getPointerPosition();
    const canvasPos = {
      x: (pointerPos.x - offset.x) / zoom,
      y: (pointerPos.y - offset.y) / zoom
    };
    
    // Set the active tool to the dropped tool
    setActiveTool(toolId);
    
    // Create a default size element at the drop position
    // Use different sizes based on the tool type for better icon display
    let width = 60;
    let height = 60;
    
    // Adjust sizes for specific tools
    if (toolId === 'door' || toolId === 'emergency-exit') {
      width = 60;
      height = 40;
    } else if (toolId === 'line' || toolId === 'wall') {
      width = 80;
      height = 10;
    } else if (toolId === 'meeting-room' || toolId === 'restaurant' || toolId === 'cafeteria') {
      width = 80;
      height = 80;
    }
    
    // Simulate drag start and end at the drop position
    setDragStartPos({
      x: canvasPos.x - width/2,
      y: canvasPos.y - height/2
    });
    
    // Create the element
    const createElementForTool = () => {
      // Base properties for all elements
      const baseProps = {
        x: canvasPos.x - width/2,
        y: canvasPos.y - height/2,
        width,
        height,
        rotation: 0,
        draggable: true, // Always enable dragging
        customProperties: {}
      };

      // Handle different tool types based on the dropped tool ID
      switch (toolId) {
        case 'booth':
          return {
            ...baseProps,
            type: 'booth',
            fill: '#FFFFFF',
            stroke: '#333333',
            strokeWidth: 1,
            layer: 1,
            number: `B-${Math.floor(Math.random() * 1000)}`,
            status: 'available',
            dimensions: {
              imperial: `${Math.round(width / 12)}'x${Math.round(height / 12)}'`,
              metric: `${Math.round(width * 0.0254)}m x ${Math.round(height * 0.0254)}m`
            }
          } as Omit<BoothElement, 'id' | 'selected'>;
          
        case 'line':
          return {
            ...baseProps,
            type: 'shape',
            shapeType: 'line',
            fill: 'transparent',
            stroke: '#333333',
            strokeWidth: 2,
            layer: 1,
            points: [0, 0, width, height]
          } as Omit<ShapeElement, 'id' | 'selected'>;
          
        case 'wall':
          return {
            ...baseProps,
            type: 'shape',
            shapeType: 'rectangle',
            fill: '#8B4513',
            stroke: '#654321',
            strokeWidth: 2,
            layer: 1
          } as Omit<ShapeElement, 'id' | 'selected'>;
          
        case 'door':
          return {
            ...baseProps,
            type: 'door',
            width: 30,
            height: 5,
            fill: '#A0522D',
            stroke: '#800000',
            strokeWidth: 1,
            layer: 2,
            direction: 'right'
          } as Omit<DoorElement, 'id' | 'selected'>;
          
        case 'furniture':
          return {
            ...baseProps,
            type: 'furniture',
            furnitureType: 'sofa',
            fill: 'rgba(255, 255, 255, 0.2)', // Almost transparent background
            stroke: IconColors.furniture,
            strokeWidth: 1,
            layer: 2
          } as Omit<FurnitureElement, 'id' | 'selected'>;
          
        case 'meeting-room':
          return {
            ...baseProps,
            type: 'furniture',
            furnitureType: 'meeting',
            fill: 'rgba(255, 255, 255, 0.2)', // Almost transparent background
            stroke: IconColors.meeting,
            strokeWidth: 1,
            layer: 2,
            customProperties: {
              description: 'Meeting/Conference Area'
            }
          } as Omit<FurnitureElement, 'id' | 'selected'>;
          
        case 'restroom':
          return {
            ...baseProps,
            type: 'furniture',
            furnitureType: 'restroom',
            fill: 'rgba(255, 255, 255, 0.2)', // Almost transparent background
            stroke: IconColors.restroom,
            strokeWidth: 1,
            layer: 2,
            customProperties: {
              description: 'Restroom Area'
            }
          } as Omit<FurnitureElement, 'id' | 'selected'>;
          
        case 'emergency-exit':
          return {
            ...baseProps,
            type: 'door',
            furnitureType: 'emergency',
            width: 40,
            height: 30, // Taller to fit the icon better
            fill: 'rgba(255, 255, 255, 0.2)', // Almost transparent background
            stroke: IconColors.emergency,
            strokeWidth: 1,
            layer: 2,
            direction: 'out',
            customProperties: {
              isEmergency: true,
              description: 'Emergency Exit'
            }
          } as Omit<DoorElement, 'id' | 'selected'>;
          
        case 'plant':
          return {
            ...baseProps,
            type: 'plant',
            plantType: 'tree',
            fill: '#228B22',
            stroke: '#006400',
            strokeWidth: 1,
            layer: 0
          } as Omit<PlantElement, 'id' | 'selected'>;
          
        // Medical services
        case 'medical':
        case 'first-aid':
          return {
            ...baseProps,
            type: 'furniture',
            furnitureType: 'medical',
            fill: '#FFEBEE',
            stroke: '#F44336',
            strokeWidth: 1,
            layer: 2,
            customProperties: {
              description: toolId === 'medical' ? 'Medical Services' : 'First Aid'
            }
          } as Omit<FurnitureElement, 'id' | 'selected'>;
          
        // Childcare related
        case 'childcare':
        case 'nursing-room':
        case 'family-services':
          return {
            ...baseProps,
            type: 'furniture',
            furnitureType: 'childcare',
            fill: '#F9FBE7',
            stroke: '#CDDC39',
            strokeWidth: 1,
            layer: 2,
            customProperties: {
              description: toolId.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase())
            }
          } as Omit<FurnitureElement, 'id' | 'selected'>;
          
        // Accessibility
        case 'wheelchair-accessible':
        case 'senior-assistance':
          return {
            ...baseProps,
            type: 'furniture',
            furnitureType: 'accessible',
            fill: '#E0F7FA',
            stroke: '#00BCD4',
            strokeWidth: 1,
            layer: 2,
            customProperties: {
              description: toolId.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase())
            }
          } as Omit<FurnitureElement, 'id' | 'selected'>;
          
        // Food related
        case 'restaurant':
        case 'cafeteria':
          return {
            ...baseProps,
            type: 'furniture',
            furnitureType: toolId,
            fill: '#FFF3E0',
            stroke: '#FF9800',
            strokeWidth: 1,
            layer: 2,
            customProperties: {
              description: toolId === 'restaurant' ? 'Restaurant/Dining Area' : 'Cafeteria/Food Service'
            }
          } as Omit<FurnitureElement, 'id' | 'selected'>;
          
        // Information related
        case 'information':
        case 'info-point':
        case 'lost-found':
          return {
            ...baseProps,
            type: 'furniture',
            furnitureType: 'info',
            fill: '#E1F5FE',
            stroke: '#03A9F4',
            strokeWidth: 1,
            layer: 2,
            customProperties: {
              description: toolId.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase())
            }
          } as Omit<FurnitureElement, 'id' | 'selected'>;
          
        // Restroom related
        case 'mens-restroom':
        case 'womens-restroom':
          return {
            ...baseProps,
            type: 'furniture',
            furnitureType: 'restroom',
            fill: '#E8EAF6',
            stroke: '#3F51B5',
            strokeWidth: 1,
            layer: 2,
            customProperties: {
              description: toolId === 'mens-restroom' ? "Men's Restroom" : "Women's Restroom"
            }
          } as Omit<FurnitureElement, 'id' | 'selected'>;
          
        // Transportation
        case 'transportation':
        case 'baggage':
          return {
            ...baseProps,
            type: 'furniture',
            furnitureType: toolId,
            fill: '#ECEFF1',
            stroke: '#607D8B',
            strokeWidth: 1,
            layer: 2,
            customProperties: {
              description: toolId === 'transportation' ? 'Transportation Area' : 'Baggage Services'
            }
          } as Omit<FurnitureElement, 'id' | 'selected'>;
          
        // Other facilities
        case 'elevator':
        case 'atm':
        case 'no-smoking':
          return {
            ...baseProps,
            type: 'furniture',
            furnitureType: toolId,
            fill: '#F5F5F5',
            stroke: '#9E9E9E',
            strokeWidth: 1,
            layer: 2,
            customProperties: {
              description: toolId.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase())
            }
          } as Omit<FurnitureElement, 'id' | 'selected'>;
          
        // Add cases for all other tools
        default:
          // For any other tool, create a generic furniture element
          return {
            ...baseProps,
            type: 'furniture',
            furnitureType: toolId,
            fill: '#F5F5F5',
            stroke: '#9E9E9E',
            strokeWidth: 1,
            layer: 2,
            customProperties: {
              description: toolId.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase())
            }
          } as Omit<FurnitureElement, 'id' | 'selected'>;
      }
    };
    
    // Add the element based on the dropped tool
    const elementToAdd = createElementForTool();
    if (elementToAdd) {
      addElement(elementToAdd);
    }
    
    // Reset active tool to select after dropping
    setActiveTool('select');
  };

  return (
    <div 
      ref={containerRef} 
      className={`w-full h-full overflow-hidden bg-neutral-100 relative ${isDragOver ? 'bg-blue-50' : ''}`}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      <Stage
        ref={stageRef}
        width={window.innerWidth}
        height={window.innerHeight}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onWheel={handleWheel}
        onContextMenu={handleContextMenu}
        x={offset.x}
        y={offset.y}
        scale={{ x: zoom, y: zoom }}
        draggable={false}
        pixelRatio={window.devicePixelRatio || 2} // Use device pixel ratio for high-DPI displays
        imageSmoothingEnabled={true} // Enable image smoothing for better quality
        perfectDrawEnabled={true} // Enable perfect drawing for crisp edges
      >
        {/* Background Layer */}
        <Layer
          imageSmoothingEnabled={true}
          perfectDrawEnabled={true}
          hitGraphEnabled={false} // Disable hit graph for better performance
        >
          {/* Base Canvas Background */}
          <Rect
            x={0}
            y={0}
            width={canvasSize.width}
            height={canvasSize.height}
            fill="#ffffff"
            stroke="#cccccc"
            strokeWidth={1}
          />
          
          {/* Background Image */}
          {backgroundImage && (
            <BackgroundImage settings={backgroundImage} />
          )}
        </Layer>
        
        {/* Flooring Layer */}
        <Layer
          imageSmoothingEnabled={true}
          perfectDrawEnabled={true}
          hitGraphEnabled={false}
          opacity={flooring?.enabled ? 1 : 0}
        >
          {flooring?.enabled && flooring.elements.length > 0 && (
            <FlooringLayer 
              opacity={flooring.opacity} 
              elements={flooring.elements} 
            />
          )}
        </Layer>
        
        {/* Grid Layer - Always on top of background and flooring */}
        <Layer
          imageSmoothingEnabled={true}
          perfectDrawEnabled={true}
          hitGraphEnabled={false}
        >
          <CanvasGrid
            enabled={grid.enabled}
            size={grid.size}
            width={canvasSize.width}
            height={canvasSize.height}
            opacity={grid.opacity}
          />
        </Layer>
        
        {/* Main Content Layer */}
        <Layer
          imageSmoothingEnabled={true}
          perfectDrawEnabled={true}
          hitGraphEnabled={false}
        >
          
          {/* Preview shape while dragging */}
          {isDragging && dragStartPos && selectionEnd && (
            <PreviewShape
              tool={activeTool}
              start={dragStartPos}
              end={selectionEnd}
            />
          )}
          
          {/* Render all elements sorted by layer */}
          {[...elements]
            .sort((a, b) => a.layer - b.layer)
            .map(element => (
              <ElementRenderer
                key={element.id}
                element={element}
                isSelected={selectedIds.includes(element.id)}
                snapToGrid={grid.snap}
                gridSize={grid.size}
              />
            ))}
          
          {/* Selection rectangle */}
          {selectionStart && selectionEnd && activeTool === 'select' && (
            <SelectionRect
              start={selectionStart}
              end={selectionEnd}
            />
          )}
        </Layer>
      </Stage>
      
      <CanvasControls />
      <BackgroundControls />
      <FlooringToolbar />
    </div>
  );
};


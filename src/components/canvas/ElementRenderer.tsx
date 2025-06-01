import React from 'react';
import { Group, Rect, Text, Circle, Line, Image, Transformer, Path } from 'react-konva';
import { useCanvasStore } from '../../store/canvasStore';
import { 
  AnyCanvasElement, 
  BoothElement, 
  TextElement, 
  ShapeElement, 
  ImageElement,
  DoorElement,
  FurnitureElement,
  PlantElement
} from '../../types/canvas';
import { IconPaths, IconColors } from '../icons/IconPaths';

interface ElementRendererProps {
  element: AnyCanvasElement;
  isSelected: boolean;
  snapToGrid: boolean;
  gridSize: number;
}

export const ElementRenderer: React.FC<ElementRendererProps> = ({ 
  element, 
  isSelected, 
  snapToGrid, 
  gridSize 
}) => {
  const { updateElement, selectElements, deselectAll, deleteElements } = useCanvasStore();
  const shapeRef = React.useRef<any>(null);
  const transformerRef = React.useRef<any>(null);
  const deleteButtonRef = React.useRef<any>(null);
  const [isDragging, setIsDragging] = React.useState(false);
  
  React.useEffect(() => {
    if (isSelected && transformerRef.current && shapeRef.current) {
      // Attach transformer to the selected shape
      transformerRef.current.nodes([shapeRef.current]);
      transformerRef.current.getLayer().batchDraw();
    }
  }, [isSelected]);
  
  const getSnappedPosition = (pos: number) => {
    if (!snapToGrid) return pos;
    return Math.round(pos / gridSize) * gridSize;
  };
  
  const handleDragStart = () => {
    setIsDragging(true);
    // Set z-index higher during drag for visual feedback
    if (shapeRef.current) {
      shapeRef.current.moveToTop();
    }
  };
  
  const handleDragMove = (e: any) => {
    // Optional: Add real-time snapping during drag
    if (snapToGrid && shapeRef.current) {
      const newX = getSnappedPosition(e.target.x());
      const newY = getSnappedPosition(e.target.y());
      
      // Apply snapping in real-time
      if (newX !== e.target.x() || newY !== e.target.y()) {
        e.target.position({ x: newX, y: newY });
      }
    }
  };
  
  const handleDragEnd = (e: any) => {
    setIsDragging(false);
    
    let newX = e.target.x();
    let newY = e.target.y();
    
    if (snapToGrid) {
      newX = getSnappedPosition(newX);
      newY = getSnappedPosition(newY);
    }
    
    updateElement(element.id, {
      x: newX,
      y: newY
    });
  };
  
  const handleTransformEnd = (e: any) => {
    // Get the updated dimensions and position
    const node = shapeRef.current;
    const scaleX = node.scaleX();
    const scaleY = node.scaleY();
    
    // Reset scale to 1 and apply scale to width/height
    node.scaleX(1);
    node.scaleY(1);
    
    let newWidth = Math.max(element.width * scaleX, 10);
    let newHeight = Math.max(element.height * scaleY, 10);
    let newX = node.x();
    let newY = node.y();
    
    if (snapToGrid) {
      newWidth = getSnappedPosition(newWidth);
      newHeight = getSnappedPosition(newHeight);
      newX = getSnappedPosition(newX);
      newY = getSnappedPosition(newY);
    }
    
    updateElement(element.id, {
      x: newX,
      y: newY,
      width: newWidth,
      height: newHeight,
      rotation: node.rotation()
    });
  };
  
  const handleClick = (e: any) => {
    // Prevent propagation to avoid deselection
    e.cancelBubble = true;
    
    // Check if shift is pressed for multi-select
    if (e.evt.shiftKey) {
      const currentSelected = useCanvasStore.getState().selectedIds;
      if (currentSelected.includes(element.id)) {
        // Deselect if already selected
        selectElements(currentSelected.filter(id => id !== element.id));
      } else {
        // Add to selection
        selectElements([...currentSelected, element.id]);
      }
    } else {
      // Single select
      selectElements([element.id]);
    }
  };
  
  const renderElement = () => {
    switch (element.type) {
      case 'booth':
        return renderBooth(element as BoothElement);
      case 'text':
        return renderText(element as TextElement);
      case 'shape':
        return renderShape(element as ShapeElement);
      case 'image':
        return renderImage(element as ImageElement);
      case 'door':
        return renderDoor(element as DoorElement);
      case 'furniture':
        return renderFurniture(element as FurnitureElement);
      case 'plant':
        return renderPlant(element as PlantElement);
      default:
        return null;
    }
  };
  
  // Enhanced helper function to render a high-quality icon
  const renderIcon = (element: AnyCanvasElement, iconPath: string, iconColor?: string): JSX.Element | null => {
    // Use a fixed size for the icon to prevent scaling issues
    const baseSize = 40; // Base size for the icon (40x40 viewBox)
    
    // Make icons more prominent by using a larger portion of the element
    const maxIconSize = Math.min(element.width, element.height) * 0.8; // Use 80% of the element size
    
    // Ensure minimum scale but allow for larger icons
    const scale = Math.max(maxIconSize / baseSize, 0.7); 
    
    // Center the icon in the element - ensure pixel-perfect positioning
    const xPos = Math.round((element.width - (baseSize * scale)) / 2);
    const yPos = Math.round((element.height - (baseSize * scale)) / 2);
    
    // Determine if this is a stroke-based icon (like plant) or a fill-based icon
    const isStrokeBased = iconPath.includes('M') && !iconPath.includes('Z');
    const color = iconColor || element.stroke || "#333333";
    
    try {
      return (
        <Path
          x={xPos}
          y={yPos}
          data={iconPath}
          fill={isStrokeBased ? 'transparent' : color}
          stroke={isStrokeBased ? color : undefined}
          strokeWidth={isStrokeBased ? 2 : 0}
          scaleX={scale}
          scaleY={scale}
          perfectDrawEnabled={true} // Enable perfect drawing for crisp edges
          listening={false} // Optimize performance by disabling event listening on the icon
          shadowForStrokeEnabled={false} // Disable shadow for better performance
          hitStrokeWidth={0} // Optimize hit detection
          lineCap="round" // Smooth line endings
          lineJoin="round" // Smooth line joins
          tension={0.5} // Add slight curve tension for smoother appearance
          visible={true} // Force visibility
        />
      );
    } catch (error) {
      console.error("Error rendering icon:", error);
      // Fallback to a simple visible shape if there's an error
      return (
        <Rect
          x={xPos}
          y={yPos}
          width={baseSize * scale}
          height={baseSize * scale}
          fill={color}
          opacity={0.5}
          cornerRadius={5}
        />
      );
    }
  };

  const renderBooth = (booth: BoothElement) => {
    // Define status colors
    const statusColors = {
      available: 'rgba(255, 255, 255, 0.7)',
      reserved: 'rgba(255, 249, 196, 0.7)',
      sold: 'rgba(255, 205, 210, 0.7)'
    };
    
    // For booths, we want to keep the number and dimensions visible
    return (
      <>
        <Rect
          x={0}
          y={0}
          width={booth.width}
          height={booth.height}
          fill={statusColors[booth.status] || 'rgba(255, 255, 255, 0.7)'}
          stroke={booth.stroke || IconColors.booth}
          strokeWidth={1}
          cornerRadius={4}
        />
        
        {/* Make the icon more prominent with high-quality rendering */}
        <Path
          x={Math.round(booth.width * 0.2)} // 20% padding, rounded for pixel-perfect alignment
          y={Math.round(booth.height * 0.2)} // 20% padding, rounded for pixel-perfect alignment
          data={IconPaths.booth}
          fill={IconColors.booth}
          stroke={IconColors.booth}
          strokeWidth={1}
          width={Math.round(booth.width * 0.6)} // 60% of the width, rounded for crisp edges
          height={Math.round(booth.height * 0.6)} // 60% of the height, rounded for crisp edges
          scaleX={booth.width * 0.6 / 40} // Scale to fit 60% of the element
          scaleY={booth.height * 0.6 / 40} // Scale to fit 60% of the element
          perfectDrawEnabled={true} // Enable perfect drawing for crisp edges
          listening={false} // Optimize performance by disabling event listening on the icon
          shadowForStrokeEnabled={false} // Disable shadow for better performance
          lineCap="round" // Smooth line endings
          lineJoin="round" // Smooth line joins
          visible={true} // Force visibility
        />
        
        {/* Keep the booth number visible */}
        <Text
          x={5}
          y={5}
          text={booth.number}
          fontSize={14}
          fontFamily="Arial"
          fill="#333333"
        />
        
        {/* Keep the dimensions visible */}
        <Text
          x={5}
          y={booth.height - 20}
          text={booth.dimensions.imperial}
          fontSize={10}
          fontFamily="Arial"
          fill="#666666"
        />
      </>
    );
  };
  
  const renderText = (text: TextElement) => {
    return (
      <>
        <Text
          x={0}
          y={0}
          width={text.width}
          height={text.height}
          text={text.text}
          fontSize={text.fontSize}
          fontFamily={text.fontFamily}
          fill={text.fill}
          align={text.align}
          fontStyle={text.fontStyle}
        />
        {/* Text icon is optional since the text itself is visible */}
      </>
    );
  };
  
  const renderShape = (shape: ShapeElement) => {
    switch (shape.shapeType) {
      case 'rectangle':
        return (
          <>
            <Rect
              x={0}
              y={0}
              width={shape.width}
              height={shape.height}
              fill={shape.fill}
              stroke={shape.stroke}
              strokeWidth={shape.strokeWidth}
            />
            {renderIcon(shape, IconPaths.wall, IconColors.wall)}
          </>
        );
      case 'circle':
        const radius = Math.min(shape.width, shape.height) / 2;
        return (
          <>
            <Circle
              x={shape.width / 2}
              y={shape.height / 2}
              radius={radius}
              fill={shape.fill}
              stroke={shape.stroke}
              strokeWidth={shape.strokeWidth}
            />
          </>
        );
      case 'line':
      case 'arrow':
        return (
          <>
            <Line
              points={shape.points || [0, 0, shape.width, shape.height]}
              stroke={shape.stroke}
              strokeWidth={shape.strokeWidth}
              lineCap="round"
              lineJoin="round"
              dash={shape.shapeType === 'line' ? undefined : [10, 5]}
            />
            {/* For lines, we don't add an icon as it would interfere with the line itself */}
          </>
        );
      default:
        return null;
    }
  };
  
  const renderImage = (image: ImageElement) => {
    // In a real app, we would load the image properly
    // This is a simplified implementation
    
    // Create a dummy HTMLImageElement to satisfy the required 'image' prop
    const dummyImage = new window.Image();
    if (image.src) {
      dummyImage.src = image.src;
    }
    
    return (
      <>
        <Image
          x={0}
          y={0}
          width={image.width}
          height={image.height}
          image={dummyImage}
          fill={image.fill} // Placeholder until image loads
        />
      </>
    );
  };
  
  const renderDoor = (door: DoorElement) => {
    // Check if it's an emergency exit
    const isEmergency = door.customProperties?.isEmergency || 
                       door.furnitureType === 'emergency';
    const iconToUse = isEmergency ? IconPaths.emergency : IconPaths.door;
    const iconColor = isEmergency ? IconColors.emergency : (door.stroke || IconColors.door);
    
    // IMPORTANT: Focus on displaying the icon, not the text
    return (
      <>
        {/* Very subtle background */}
        <Rect
          x={0}
          y={0}
          width={door.width}
          height={door.height}
          fill={'rgba(255, 255, 255, 0.2)'} // Almost transparent background
          stroke={door.stroke || iconColor}
          strokeWidth={1}
          cornerRadius={isEmergency ? 4 : 0}
        />
        
        {/* Make the icon the primary visual element with high-quality rendering */}
        <Path
          x={Math.round(door.width * 0.1)} // 10% padding, rounded for pixel-perfect alignment
          y={Math.round(door.height * 0.1)} // 10% padding, rounded for pixel-perfect alignment
          data={iconToUse}
          fill={iconColor}
          stroke={iconColor}
          strokeWidth={1}
          width={Math.round(door.width * 0.8)} // 80% of the width, rounded for crisp edges
          height={Math.round(door.height * 0.8)} // 80% of the height, rounded for crisp edges
          scaleX={door.width * 0.8 / 40} // Scale to fit 80% of the element (40 is the base size)
          scaleY={door.height * 0.8 / 40} // Scale to fit 80% of the element
          perfectDrawEnabled={true} // Enable perfect drawing for crisp edges
          listening={false} // Optimize performance by disabling event listening on the icon
          shadowForStrokeEnabled={false} // Disable shadow for better performance
          lineCap="round" // Smooth line endings
          lineJoin="round" // Smooth line joins
          tension={0.5} // Add slight curve tension for smoother appearance
          visible={true} // Force visibility
        />
        
        {/* Only show description on hover or when selected - not implemented here */}
      </>
    );
  };
  
  const renderFurniture = (furniture: FurnitureElement) => {
    // Determine which icon to use based on furniture type
    let iconToUse = IconPaths.furniture;
    let iconColor = furniture.stroke || IconColors.furniture;
    
    // Get the furniture type
    const furnitureType = furniture.furnitureType || 'sofa';
    
    // Check if we have a specific icon for this furniture type
    if (furnitureType in IconPaths) {
      iconToUse = IconPaths[furnitureType];
      iconColor = (furnitureType in IconColors) ? IconColors[furnitureType] : (furniture.stroke || IconColors.furniture);
    } else {
      // Handle specific cases that don't match the exact key in IconPaths
      switch (furnitureType) {
        case 'restroom':
          iconToUse = IconPaths.restroom;
          iconColor = IconColors.restroom;
          break;
        case 'meeting':
          iconToUse = IconPaths.meeting;
          iconColor = IconColors.meeting;
          break;
        case 'medical':
        case 'first-aid':
          iconToUse = IconPaths.medical;
          iconColor = IconColors.medical;
          break;
        case 'childcare':
        case 'nursing-room':
        case 'family-services':
          iconToUse = IconPaths.childcare;
          iconColor = IconColors.childcare;
          break;
        case 'accessible':
        case 'wheelchair-accessible':
        case 'senior-assistance':
          iconToUse = IconPaths.accessible;
          iconColor = IconColors.accessible;
          break;
        case 'info':
        case 'information':
        case 'info-point':
        case 'lost-found':
          iconToUse = IconPaths.info;
          iconColor = IconColors.info;
          break;
        case 'sofa':
        default:
          iconToUse = IconPaths.furniture;
          iconColor = IconColors.furniture;
      }
    }
    
    // IMPORTANT: Focus on displaying the icon, not the text
    return (
      <>
        {/* Very subtle background */}
        <Rect
          x={0}
          y={0}
          width={furniture.width}
          height={furniture.height}
          fill={'rgba(255, 255, 255, 0.2)'} // Almost transparent background
          stroke={furniture.stroke || iconColor}
          strokeWidth={1}
          cornerRadius={4}
        />
        
        {/* Make the icon the primary visual element with high-quality rendering */}
        <Path
          x={Math.round(furniture.width * 0.1)} // 10% padding, rounded for pixel-perfect alignment
          y={Math.round(furniture.height * 0.1)} // 10% padding, rounded for pixel-perfect alignment
          data={iconToUse}
          fill={iconColor}
          stroke={iconColor}
          strokeWidth={1}
          width={Math.round(furniture.width * 0.8)} // 80% of the width, rounded for crisp edges
          height={Math.round(furniture.height * 0.8)} // 80% of the height, rounded for crisp edges
          scaleX={furniture.width * 0.8 / 40} // Scale to fit 80% of the element (40 is the base size)
          scaleY={furniture.height * 0.8 / 40} // Scale to fit 80% of the element
          perfectDrawEnabled={true} // Enable perfect drawing for crisp edges
          listening={false} // Optimize performance by disabling event listening on the icon
          shadowForStrokeEnabled={false} // Disable shadow for better performance
          lineCap="round" // Smooth line endings
          lineJoin="round" // Smooth line joins
          tension={0.5} // Add slight curve tension for smoother appearance
          visible={true} // Force visibility
        />
        
        {/* Only show description on hover or when selected - not implemented here */}
      </>
    );
  };
  
  const renderPlant = (plant: PlantElement) => {
    // IMPORTANT: Focus on displaying the icon, not the text
    return (
      <>
        {/* Very subtle background */}
        <Circle
          x={plant.width / 2}
          y={plant.height / 2}
          radius={Math.min(plant.width, plant.height) / 2.2}
          fill={'rgba(255, 255, 255, 0.2)'} // Almost transparent background
          stroke={plant.stroke || IconColors.plant}
          strokeWidth={1}
        />
        
        {/* Make the icon the primary visual element with high-quality rendering */}
        <Path
          x={Math.round(plant.width * 0.1)} // 10% padding, rounded for pixel-perfect alignment
          y={Math.round(plant.height * 0.1)} // 10% padding, rounded for pixel-perfect alignment
          data={IconPaths.plant}
          fill="transparent" // Plant icon is stroke-based, not fill-based
          stroke={IconColors.plant}
          strokeWidth={2}
          width={Math.round(plant.width * 0.8)} // 80% of the width, rounded for crisp edges
          height={Math.round(plant.height * 0.8)} // 80% of the height, rounded for crisp edges
          scaleX={plant.width * 0.8 / 40} // Scale to fit 80% of the element (40 is the base size)
          scaleY={plant.height * 0.8 / 40} // Scale to fit 80% of the element
          perfectDrawEnabled={true} // Enable perfect drawing for crisp edges
          listening={false} // Optimize performance by disabling event listening on the icon
          shadowForStrokeEnabled={false} // Disable shadow for better performance
          lineCap="round" // Smooth line endings
          lineJoin="round" // Smooth line joins
          tension={0.5} // Add slight curve tension for smoother appearance
          visible={true} // Force visibility
        />
      </>
    );
  };
  
  // Handle delete button click
  const handleDelete = (e: any) => {
    e.cancelBubble = true; // Stop event propagation
    deleteElements([element.id]);
  };

  // Render delete button for selected elements
  const renderDeleteButton = () => {
    if (!isSelected) return null;
    
    return (
      <Group
        x={element.width}
        y={0}
        onClick={handleDelete}
        onTap={handleDelete}
        ref={deleteButtonRef}
      >
        {/* Red circle background */}
        <Circle
          radius={10}
          fill="red"
          stroke="white"
          strokeWidth={1}
        />
        {/* X symbol */}
        <Text
          text="×"
          fontSize={16}
          fontFamily="Arial"
          fill="white"
          align="center"
          verticalAlign="middle"
          x={-5}
          y={-8}
        />
      </Group>
    );
  };

  return (
    <Group
      ref={shapeRef}
      x={element.x}
      y={element.y}
      width={element.width}
      height={element.height}
      rotation={element.rotation}
      draggable={true} // Always enable dragging
      onClick={handleClick}
      onTap={handleClick}
      onDragStart={handleDragStart}
      onDragMove={handleDragMove}
      onDragEnd={handleDragEnd}
      onTransformEnd={handleTransformEnd}
      opacity={isDragging ? 0.8 : 1} // Visual feedback during drag
      shadowColor={isDragging ? "black" : undefined}
      shadowBlur={isDragging ? 10 : 0}
      shadowOpacity={isDragging ? 0.3 : 0}
      shadowOffset={isDragging ? { x: 5, y: 5 } : { x: 0, y: 0 }}
    >
      {renderElement()}
      {renderDeleteButton()}
      
      {isSelected && (
        <Transformer
          ref={transformerRef}
          boundBoxFunc={(oldBox, newBox) => {
            // Ensure minimum size
            if (newBox.width < 10 || newBox.height < 10) {
              return oldBox;
            }
            return newBox;
          }}
          rotateEnabled={true}
          enabledAnchors={[
            'top-left', 'top-center', 'top-right', 
            'middle-right', 'middle-left',
            'bottom-left', 'bottom-center', 'bottom-right'
          ]}
          anchorSize={8}
          anchorCornerRadius={2}
          padding={1}
        />
      )}
    </Group>
  );
};
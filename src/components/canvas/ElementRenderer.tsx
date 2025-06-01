import React from 'react';
import { Group, Rect, Text, Circle, Line, Image, Path } from 'react-konva';
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

export const ElementRenderer = React.forwardRef<any, ElementRendererProps>(({ 
  element, 
  isSelected, 
  snapToGrid, 
  gridSize 
}, ref) => {
  const { updateElement, selectElements, deselectAll, deleteElements } = useCanvasStore();
  const deleteButtonRef = React.useRef<any>(null);
  const [isDragging, setIsDragging] = React.useState(false);
  
  const getSnappedPosition = (pos: number) => {
    if (!snapToGrid) return pos;
    return Math.round(pos / gridSize) * gridSize;
  };
  
  const handleDragStart = () => {
    setIsDragging(true);
    // Set z-index higher during drag for visual feedback
    const node = ref as any;
    if (node?.current) {
      node.current.moveToTop();
    }
  };
  
  const handleDragMove = (e: any) => {
    // Optional: Add real-time snapping during drag
    if (snapToGrid && e.target) {
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
  
  const renderIcon = (element: AnyCanvasElement, iconPath: string, iconColor?: string): JSX.Element | null => {
    const baseSize = 40;
    const maxIconSize = Math.min(element.width, element.height) * 0.8;
    const scale = Math.max(maxIconSize / baseSize, 0.7);
    const xPos = Math.round((element.width - (baseSize * scale)) / 2);
    const yPos = Math.round((element.height - (baseSize * scale)) / 2);
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
          perfectDrawEnabled={true}
          listening={false}
          shadowForStrokeEnabled={false}
          hitStrokeWidth={0}
          lineCap="round"
          lineJoin="round"
          tension={0.5}
          visible={true}
        />
      );
    } catch (error) {
      console.error("Error rendering icon:", error);
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
    const statusColors = {
      available: 'rgba(255, 255, 255, 0.7)',
      reserved: 'rgba(255, 249, 196, 0.7)',
      sold: 'rgba(255, 205, 210, 0.7)'
    };
    
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
        
        <Path
          x={Math.round(booth.width * 0.2)}
          y={Math.round(booth.height * 0.2)}
          data={IconPaths.booth}
          fill={IconColors.booth}
          stroke={IconColors.booth}
          strokeWidth={1}
          width={Math.round(booth.width * 0.6)}
          height={Math.round(booth.height * 0.6)}
          scaleX={booth.width * 0.6 / 40}
          scaleY={booth.height * 0.6 / 40}
          perfectDrawEnabled={true}
          listening={false}
          shadowForStrokeEnabled={false}
          lineCap="round"
          lineJoin="round"
          visible={true}
        />
        
        <Text
          x={5}
          y={5}
          text={booth.number}
          fontSize={14}
          fontFamily="Arial"
          fill="#333333"
        />
        
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
          </>
        );
      default:
        return null;
    }
  };
  
  const renderImage = (image: ImageElement) => {
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
          fill={image.fill}
        />
      </>
    );
  };
  
  const renderDoor = (door: DoorElement) => {
    const isEmergency = door.customProperties?.isEmergency || 
                       door.furnitureType === 'emergency';
    const iconToUse = isEmergency ? IconPaths.emergency : IconPaths.door;
    const iconColor = isEmergency ? IconColors.emergency : (door.stroke || IconColors.door);
    
    return (
      <>
        <Rect
          x={0}
          y={0}
          width={door.width}
          height={door.height}
          fill={'rgba(255, 255, 255, 0.2)'}
          stroke={door.stroke || iconColor}
          strokeWidth={1}
          cornerRadius={isEmergency ? 4 : 0}
        />
        
        <Path
          x={Math.round(door.width * 0.1)}
          y={Math.round(door.height * 0.1)}
          data={iconToUse}
          fill={iconColor}
          stroke={iconColor}
          strokeWidth={1}
          width={Math.round(door.width * 0.8)}
          height={Math.round(door.height * 0.8)}
          scaleX={door.width * 0.8 / 40}
          scaleY={door.height * 0.8 / 40}
          perfectDrawEnabled={true}
          listening={false}
          shadowForStrokeEnabled={false}
          lineCap="round"
          lineJoin="round"
          tension={0.5}
          visible={true}
        />
      </>
    );
  };
  
  const renderFurniture = (furniture: FurnitureElement) => {
    let iconToUse = IconPaths.furniture;
    let iconColor = furniture.stroke || IconColors.furniture;
    
    const furnitureType = furniture.furnitureType || 'sofa';
    
    if (furnitureType in IconPaths) {
      iconToUse = IconPaths[furnitureType];
      iconColor = (furnitureType in IconColors) ? IconColors[furnitureType] : (furniture.stroke || IconColors.furniture);
    } else {
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
    
    return (
      <>
        <Rect
          x={0}
          y={0}
          width={furniture.width}
          height={furniture.height}
          fill={'rgba(255, 255, 255, 0.2)'}
          stroke={furniture.stroke || iconColor}
          strokeWidth={1}
          cornerRadius={4}
        />
        
        <Path
          x={Math.round(furniture.width * 0.1)}
          y={Math.round(furniture.height * 0.1)}
          data={iconToUse}
          fill={iconColor}
          stroke={iconColor}
          strokeWidth={1}
          width={Math.round(furniture.width * 0.8)}
          height={Math.round(furniture.height * 0.8)}
          scaleX={furniture.width * 0.8 / 40}
          scaleY={furniture.height * 0.8 / 40}
          perfectDrawEnabled={true}
          listening={false}
          shadowForStrokeEnabled={false}
          lineCap="round"
          lineJoin="round"
          tension={0.5}
          visible={true}
        />
      </>
    );
  };
  
  const renderPlant = (plant: PlantElement) => {
    return (
      <>
        <Circle
          x={plant.width / 2}
          y={plant.height / 2}
          radius={Math.min(plant.width, plant.height) / 2.2}
          fill={'rgba(255, 255, 255, 0.2)'}
          stroke={plant.stroke || IconColors.plant}
          strokeWidth={1}
        />
        
        <Path
          x={Math.round(plant.width * 0.1)}
          y={Math.round(plant.height * 0.1)}
          data={IconPaths.plant}
          fill="transparent"
          stroke={IconColors.plant}
          strokeWidth={2}
          width={Math.round(plant.width * 0.8)}
          height={Math.round(plant.height * 0.8)}
          scaleX={plant.width * 0.8 / 40}
          scaleY={plant.height * 0.8 / 40}
          perfectDrawEnabled={true}
          listening={false}
          shadowForStrokeEnabled={false}
          lineCap="round"
          lineJoin="round"
          tension={0.5}
          visible={true}
        />
      </>
    );
  };
  
  const handleDelete = (e: any) => {
    e.cancelBubble = true;
    deleteElements([element.id]);
  };

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
        <Circle
          radius={10}
          fill="red"
          stroke="white"
          strokeWidth={1}
        />
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
      ref={ref}
      x={element.x}
      y={element.y}
      width={element.width}
      height={element.height}
      rotation={element.rotation}
      draggable={true}
      onClick={handleClick}
      onTap={handleClick}
      onDragStart={handleDragStart}
      onDragMove={handleDragMove}
      onDragEnd={handleDragEnd}
      opacity={isDragging ? 0.8 : 1}
      shadowColor={isDragging ? "black" : undefined}
      shadowBlur={isDragging ? 10 : 0}
      shadowOpacity={isDragging ? 0.3 : 0}
      shadowOffset={isDragging ? { x: 5, y: 5 } : { x: 0, y: 0 }}
    >
      {renderElement()}
      {renderDeleteButton()}
    </Group>
  );
});
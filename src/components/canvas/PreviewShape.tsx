import React from 'react';
import { Rect, Line, Group, Text, Circle, Path } from 'react-konva';
import { Point } from '../../types/canvas';
import { IconPaths, IconColors } from '../icons/IconPaths';

interface PreviewShapeProps {
  tool: string;
  start: Point;
  end: Point;
}

export const PreviewShape: React.FC<PreviewShapeProps> = ({ tool, start, end }) => {
  const width = Math.abs(end.x - start.x);
  const height = Math.abs(end.y - start.y);
  const x = Math.min(start.x, end.x);
  const y = Math.min(start.y, end.y);

  // Get the appropriate icon path and color based on the tool
  const getIconData = (toolType: string) => {
    let iconPath = '';
    let iconColor = '#333333';

    switch (toolType) {
      case 'booth':
        iconPath = IconPaths.booth;
        iconColor = IconColors.booth;
        break;
      case 'line':
        iconPath = IconPaths.line;
        iconColor = IconColors.line;
        break;
      case 'wall':
        iconPath = IconPaths.wall;
        iconColor = IconColors.wall;
        break;
      case 'door':
        iconPath = IconPaths.door;
        iconColor = IconColors.door;
        break;
      case 'furniture':
        iconPath = IconPaths.furniture;
        iconColor = IconColors.furniture;
        break;
      case 'plant':
        iconPath = IconPaths.plant;
        iconColor = IconColors.plant;
        break;
      case 'text':
        iconPath = IconPaths.text;
        iconColor = IconColors.text;
        break;
      // New element types
      case 'meeting':
        iconPath = IconPaths.meeting;
        iconColor = IconColors.meeting;
        break;
      case 'restroom':
        iconPath = IconPaths.restroom;
        iconColor = IconColors.restroom;
        break;
      case 'emergency':
        iconPath = IconPaths.emergency;
        iconColor = IconColors.emergency;
        break;
      default:
        iconPath = IconPaths.booth;
        iconColor = IconColors.booth;
    }

    return { iconPath, iconColor };
  };

  // Render the shape with its icon
  const renderShapeWithIcon = () => {
    try {
      // Get icon data
      const { iconPath, iconColor } = getIconData(tool);
      
      // Create the background shape
      let backgroundShape;
      
      if (tool === 'line') {
        backgroundShape = (
          <Line
            points={[start.x, start.y, end.x, end.y]}
            stroke="#333333"
            strokeWidth={2}
            dash={[5, 5]}
          />
        );
      } else {
        backgroundShape = (
          <Rect
            x={x}
            y={y}
            width={width || 40}  // Ensure minimum size
            height={height || 40}
            stroke={iconColor}
            strokeWidth={1}
            dash={[5, 5]}
            fill={`${iconColor}33`}  // Add transparency
            cornerRadius={tool === 'plant' ? Math.min(width, height) / 2 : 0}
          />
        );
      }

      // Calculate icon position and scale with safety checks
      const iconSize = Math.min(width || 40, height || 40, 100);
      const iconScale = Math.max(iconSize / 40, 0.5);  // Scale based on a 40x40 viewBox with minimum
      const iconX = x + ((width || 40) - iconSize) / 2;
      const iconY = y + ((height || 40) - iconSize) / 2;

      return (
        <Group>
          {backgroundShape}
          <Group 
            x={iconX} 
            y={iconY}
            scaleX={iconScale}
            scaleY={iconScale}
          >
            <Path
              data={iconPath}
              fill={iconPath.includes('Z') ? iconColor : 'transparent'} // Use fill for closed paths
              stroke={iconColor}
              strokeWidth={iconPath.includes('Z') ? 1 : 2} // Thicker stroke for open paths
              opacity={0.9}
              perfectDrawEnabled={true} // Enable perfect drawing for crisp edges
              shadowForStrokeEnabled={false} // Disable shadow for better performance
              lineCap="round" // Smooth line endings
              lineJoin="round" // Smooth line joins
              tension={0.5} // Add slight curve tension for smoother appearance
              visible={true} // Force visibility
            />
          </Group>
        </Group>
      );
    } catch (error) {
      console.error("Error rendering preview shape:", error);
      
      // Fallback to a simple rectangle if there's an error
      return (
        <Rect
          x={x}
          y={y}
          width={width || 40}
          height={height || 40}
          stroke="#333333"
          strokeWidth={1}
          dash={[5, 5]}
          fill="rgba(200, 200, 200, 0.5)"
        />
      );
    }
  };

  // If we're dragging (have both start and end points), render the shape with icon
  if (start && end) {
    return renderShapeWithIcon();
  }

  return null;
};
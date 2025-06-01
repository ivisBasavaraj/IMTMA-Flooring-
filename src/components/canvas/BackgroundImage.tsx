import React, { useEffect, useState } from 'react';
import { Image, Transformer, Group } from 'react-konva';
import { useCanvasStore } from '../../store/canvasStore';
import type { BackgroundImageSettings } from '../../types/canvas';

interface BackgroundImageProps {
  settings: BackgroundImageSettings;
}

export const BackgroundImage: React.FC<BackgroundImageProps> = ({ settings }) => {
  const { updateBackgroundImage, canvasSize } = useCanvasStore();
  const [image, setImage] = useState<HTMLImageElement | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const imageRef = React.useRef<any>(null);
  const transformerRef = React.useRef<any>(null);
  
  // Load the image
  useEffect(() => {
    setIsLoading(true);
    setError(null);
    
    const img = new window.Image();
    img.crossOrigin = 'Anonymous'; // Enable CORS if needed
    
    img.onload = () => {
      setImage(img);
      setIsLoading(false);
    };
    
    img.onerror = () => {
      setError('Failed to load image');
      setIsLoading(false);
    };
    
    img.src = settings.url;
    
    return () => {
      img.onload = null;
      img.onerror = null;
    };
  }, [settings.url]);
  
  // Attach transformer if not locked
  useEffect(() => {
    if (imageRef.current && transformerRef.current && !settings.locked) {
      transformerRef.current.nodes([imageRef.current]);
      transformerRef.current.getLayer()?.batchDraw();
    }
  }, [settings.locked]);
  
  // Calculate dimensions based on fit mode
  const getDimensions = () => {
    if (!image) return { width: 0, height: 0 };
    
    const { fitMode, scale } = settings;
    const imgRatio = image.width / image.height;
    
    switch (fitMode) {
      case 'stretch':
        return {
          width: canvasSize.width,
          height: canvasSize.height
        };
      
      case 'fit':
        if (canvasSize.width / canvasSize.height > imgRatio) {
          // Canvas is wider than image
          return {
            width: canvasSize.height * imgRatio,
            height: canvasSize.height
          };
        } else {
          // Canvas is taller than image
          return {
            width: canvasSize.width,
            height: canvasSize.width / imgRatio
          };
        }
      
      case 'center':
        return {
          width: image.width * scale,
          height: image.height * scale
        };
      
      case 'tile':
        // Tiling is handled differently - we'll use a pattern fill
        return {
          width: canvasSize.width,
          height: canvasSize.height
        };
      
      default:
        return {
          width: image.width * scale,
          height: image.height * scale
        };
    }
  };
  
  const handleDragEnd = (e: any) => {
    if (settings.locked) return;
    
    updateBackgroundImage({
      position: {
        x: e.target.x(),
        y: e.target.y()
      }
    });
  };
  
  const handleTransformEnd = (e: any) => {
    if (settings.locked) return;
    
    const node = imageRef.current;
    if (!node) return;
    
    // Get the new scale
    const scaleX = node.scaleX();
    const scaleY = node.scaleY();
    
    // Reset scale to 1 (we'll apply it to width/height)
    node.scaleX(1);
    node.scaleY(1);
    
    updateBackgroundImage({
      position: {
        x: node.x(),
        y: node.y()
      },
      scale: scaleX, // Assuming uniform scaling
      rotation: node.rotation()
    });
  };
  
  if (isLoading) return null;
  if (error) return null;
  if (!image) return null;
  
  const dimensions = getDimensions();
  
  // For tiling, we use a different approach
  if (settings.fitMode === 'tile') {
    return (
      <Group>
        {/* Create a grid of images to cover the canvas */}
        {Array.from({ length: Math.ceil(dimensions.width / (image.width * settings.scale)) }).map((_, colIndex) =>
          Array.from({ length: Math.ceil(dimensions.height / (image.height * settings.scale)) }).map((_, rowIndex) => (
            <Image
              key={`tile-${colIndex}-${rowIndex}`}
              image={image}
              x={colIndex * image.width * settings.scale + settings.position.x}
              y={rowIndex * image.height * settings.scale + settings.position.y}
              width={image.width * settings.scale}
              height={image.height * settings.scale}
              opacity={settings.opacity}
              listening={!settings.locked}
            />
          ))
        )}
      </Group>
    );
  }
  
  return (
    <>
      <Image
        ref={imageRef}
        image={image}
        x={settings.position.x}
        y={settings.position.y}
        width={dimensions.width}
        height={dimensions.height}
        rotation={settings.rotation}
        opacity={settings.opacity}
        draggable={!settings.locked}
        onDragEnd={handleDragEnd}
        onTransformEnd={handleTransformEnd}
      />
      
      {!settings.locked && (
        <Transformer
          ref={transformerRef}
          boundBoxFunc={(oldBox, newBox) => {
            // Limit minimum size
            if (newBox.width < 20 || newBox.height < 20) {
              return oldBox;
            }
            return newBox;
          }}
          enabledAnchors={['top-left', 'top-right', 'bottom-left', 'bottom-right']}
          rotateEnabled={true}
        />
      )}
    </>
  );
};
import React from 'react';

interface PreviewLayer {
  layerId: string;
  imageUrl: string;
  zIndex: number;
  linkedFieldKey?: string;
}

interface CustomizationPreviewProps {
  baseImage: string;
  layers: PreviewLayer[];
  selections: Record<string, string | string[]>;
  className?: string;
}

export const CustomizationPreview: React.FC<CustomizationPreviewProps> = ({
  baseImage,
  layers,
  selections,
  className = '',
}) => {
  const getLayerImageUrl = (layer: PreviewLayer): string => {
    if (!layer.linkedFieldKey) return layer.imageUrl;
    
    const value = selections[layer.linkedFieldKey];
    if (!value) return layer.imageUrl;
    
    const values = Array.isArray(value) ? value : [value];
    
    // Try to find an option-specific image based on selection
    // This would be enhanced to have option-specific images in the layer config
    return layer.imageUrl;
  };

  return (
    <div className={`relative w-full h-full ${className}`}>
      {/* Base product layer */}
      <img
        src={baseImage}
        alt="Base product"
        className="absolute inset-0 w-full h-full object-contain"
        style={{ zIndex: 0 }}
      />
      
      {/* Dynamic layers */}
      {layers.map((layer) => (
        <img
          key={layer.layerId}
          src={getLayerImageUrl(layer)}
          alt={layer.layerId}
          className="absolute inset-0 w-full h-full object-contain transition-opacity duration-300"
          style={{ zIndex: layer.zIndex }}
        />
      ))}
    </div>
  );
};

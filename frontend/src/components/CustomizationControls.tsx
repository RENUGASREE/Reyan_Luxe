import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';

interface CustomizationOption {
  value: string;
  label: string;
  priceModifier?: number;
  imageUrl?: string;
  metadata?: Record<string, string>;
}

interface CustomizationField {
  key: string;
  label: string;
  type: 'select' | 'multiselect' | 'color' | 'text' | 'number';
  options?: CustomizationOption[];
  required?: boolean;
  sortOrder?: number;
}

interface CustomizationControlsProps {
  fields: CustomizationField[];
  selections: Record<string, string | string[]>;
  onChange: (key: string, value: string | string[]) => void;
  disabled?: boolean;
}

export const CustomizationControls: React.FC<CustomizationControlsProps> = ({
  fields,
  selections,
  onChange,
  disabled = false,
}) => {
  const renderSelectField = (field: CustomizationField) => {
    const value = selections[field.key] as string | undefined;
    
    return (
      <div key={field.key} className="space-y-3">
        <div className="flex items-center gap-2">
          <Label>{field.label}</Label>
          {field.required && <span className="text-red-500">*</span>}
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          {field.options?.map((option) => (
            <Card
              key={option.value}
              className={`cursor-pointer transition-all ${
                value === option.value ? 'ring-2 ring-primary' : 'hover:ring-1 hover:ring-primary/50'
              }`}
              onClick={() => !disabled && onChange(field.key, option.value)}
            >
              <CardContent className="p-3">
                {option.imageUrl ? (
                  <div className="space-y-2">
                    <img
                      src={option.imageUrl}
                      alt={option.label}
                      className="w-full h-20 object-cover rounded"
                    />
                    <p className="text-sm font-medium text-center">{option.label}</p>
                  </div>
                ) : (
                  <div className="text-center">
                    <p className="font-medium">{option.label}</p>
                    {option.priceModifier !== undefined && option.priceModifier !== 0 && (
                      <Badge variant="secondary" className="mt-1">
                        {option.priceModifier > 0 ? '+' : ''}₹{option.priceModifier}
                      </Badge>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  };

  const renderMultiselectField = (field: CustomizationField) => {
    const values = (selections[field.key] as string[]) || [];
    
    return (
      <div key={field.key} className="space-y-3">
        <div className="flex items-center gap-2">
          <Label>{field.label}</Label>
          {field.required && values.length === 0 && <span className="text-red-500">*</span>}
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          {field.options?.map((option) => (
            <Card
              key={option.value}
              className={`cursor-pointer transition-all ${
                values.includes(option.value) ? 'ring-2 ring-primary' : 'hover:ring-1 hover:ring-primary/50'
              }`}
              onClick={() => {
                if (disabled) return;
                const newValues = values.includes(option.value)
                  ? values.filter((v) => v !== option.value)
                  : [...values, option.value];
                onChange(field.key, newValues);
              }}
            >
              <CardContent className="p-3">
                {option.imageUrl ? (
                  <div className="space-y-2">
                    <img
                      src={option.imageUrl}
                      alt={option.label}
                      className="w-full h-20 object-cover rounded"
                    />
                    <p className="text-sm font-medium text-center">{option.label}</p>
                  </div>
                ) : (
                  <div className="text-center">
                    <p className="font-medium">{option.label}</p>
                    {option.priceModifier !== undefined && option.priceModifier !== 0 && (
                      <Badge variant="secondary" className="mt-1">
                        {option.priceModifier > 0 ? '+' : ''}₹{option.priceModifier}
                      </Badge>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  };

  const renderColorField = (field: CustomizationField) => {
    const value = selections[field.key] as string | undefined;
    
    return (
      <div key={field.key} className="space-y-3">
        <div className="flex items-center gap-2">
          <Label>{field.label}</Label>
          {field.required && <span className="text-red-500">*</span>}
        </div>
        <div className="flex flex-wrap gap-3">
          {field.options?.map((option) => (
            <button
              key={option.value}
              type="button"
              disabled={disabled}
              className={`w-12 h-12 rounded-full border-4 transition-all ${
                value === option.value ? 'border-primary scale-110' : 'border-transparent hover:scale-105'
              }`}
              style={{ backgroundColor: option.value.startsWith('#') ? option.value : `#${option.value}` }}
              onClick={() => onChange(field.key, option.value)}
              title={option.label}
            />
          ))}
        </div>
        {value && (
          <p className="text-sm text-muted-foreground">
            Selected: {field.options?.find((o) => o.value === value)?.label}
          </p>
        )}
      </div>
    );
  };

  const renderTextField = (field: CustomizationField) => {
    const value = selections[field.key] as string || '';
    
    return (
      <div key={field.key} className="space-y-3">
        <div className="flex items-center gap-2">
          <Label htmlFor={field.key}>{field.label}</Label>
          {field.required && <span className="text-red-500">*</span>}
        </div>
        <Input
          id={field.key}
          type="text"
          value={value}
          onChange={(e) => onChange(field.key, e.target.value)}
          disabled={disabled}
          placeholder={field.label}
          maxLength={100}
        />
        <p className="text-xs text-muted-foreground">Maximum 100 characters</p>
      </div>
    );
  };

  const renderNumberField = (field: CustomizationField) => {
    const value = selections[field.key] as string || '';
    
    return (
      <div key={field.key} className="space-y-3">
        <div className="flex items-center gap-2">
          <Label htmlFor={field.key}>{field.label}</Label>
          {field.required && <span className="text-red-500">*</span>}
        </div>
        <Input
          id={field.key}
          type="number"
          value={value}
          onChange={(e) => onChange(field.key, e.target.value)}
          disabled={disabled}
          placeholder={field.label}
          min="0"
          step="0.1"
        />
      </div>
    );
  };

  const renderField = (field: CustomizationField) => {
    switch (field.type) {
      case 'select':
        return renderSelectField(field);
      case 'multiselect':
        return renderMultiselectField(field);
      case 'color':
        return renderColorField(field);
      case 'text':
        return renderTextField(field);
      case 'number':
        return renderNumberField(field);
      default:
        return null;
    }
  };

  const sortedFields = [...fields].sort((a, b) => (a.sortOrder || 0) - (b.sortOrder || 0));

  return (
    <div className="space-y-6">
      {sortedFields.map(renderField)}
    </div>
  );
};

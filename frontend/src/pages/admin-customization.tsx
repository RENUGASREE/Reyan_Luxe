import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { apiRequest } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';
import { useNavigate } from 'react-router-dom';

interface CustomizationField {
  key: string;
  label: string;
  type: 'select' | 'multiselect' | 'color' | 'text' | 'number';
  options?: { value: string; label: string; priceModifier?: number; imageUrl?: string }[];
  required?: boolean;
  sortOrder?: number;
}

interface Category {
  _id: string;
  name: string;
  productType: string;
  customizationFields: CustomizationField[];
}

export default function AdminCustomization() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
  const [loading, setLoading] = useState(true);
  const [editingField, setEditingField] = useState<CustomizationField | null>(null);
  const [showFieldForm, setShowFieldForm] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      const response = await apiRequest('GET', '/api/v1/categories');
      const data = await response.json();
      setCategories(data.data);
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to fetch categories',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSaveField = async (field: CustomizationField) => {
    if (!selectedCategory) return;

    try {
      const updatedFields = [...selectedCategory.customizationFields];
      const existingIndex = updatedFields.findIndex((f) => f.key === field.key);
      
      if (existingIndex >= 0) {
        updatedFields[existingIndex] = field;
      } else {
        updatedFields.push(field);
      }

      const response = await apiRequest('PATCH', `/api/v1/categories/${selectedCategory._id}`, {
        customizationFields: updatedFields,
      });

      if (response.ok) {
        toast({
          title: 'Success',
          description: 'Customization field saved',
        });
        setShowFieldForm(false);
        setEditingField(null);
        fetchCategories();
        setSelectedCategory({
          ...selectedCategory,
          customizationFields: updatedFields,
        });
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to save field',
        variant: 'destructive',
      });
    }
  };

  const handleDeleteField = async (fieldKey: string) => {
    if (!selectedCategory) return;

    try {
      const updatedFields = selectedCategory.customizationFields.filter((f) => f.key !== fieldKey);
      
      const response = await apiRequest('PATCH', `/api/v1/categories/${selectedCategory._id}`, {
        customizationFields: updatedFields,
      });

      if (response.ok) {
        toast({
          title: 'Success',
          description: 'Field deleted',
        });
        fetchCategories();
        setSelectedCategory({
          ...selectedCategory,
          customizationFields: updatedFields,
        });
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to delete field',
        variant: 'destructive',
      });
    }
  };

  if (loading) {
    return <div className="text-center py-8">Loading...</div>;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Customization Management</h1>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Categories List */}
        <Card>
          <CardHeader>
            <CardTitle>Categories</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {categories.map((category) => (
                <button
                  key={category._id}
                  onClick={() => setSelectedCategory(category)}
                  className={`w-full text-left p-3 rounded border transition-all ${
                    selectedCategory?._id === category._id
                      ? 'border-primary bg-primary/5'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="font-medium">{category.name}</div>
                  <div className="text-sm text-muted-foreground">
                    {category.customizationFields.length} fields
                  </div>
                </button>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Customization Fields */}
        {selectedCategory && (
          <Card className="lg:col-span-2">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>{selectedCategory.name} - Customization Fields</CardTitle>
                <Button onClick={() => {
                  setEditingField({
                    key: '',
                    label: '',
                    type: 'select',
                    options: [],
                    required: false,
                    sortOrder: selectedCategory.customizationFields.length,
                  });
                  setShowFieldForm(true);
                }}>
                  Add Field
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {selectedCategory.customizationFields.length === 0 ? (
                <p className="text-muted-foreground text-center py-8">
                  No customization fields configured
                </p>
              ) : (
                <div className="space-y-4">
                  {selectedCategory.customizationFields
                    .sort((a, b) => (a.sortOrder || 0) - (b.sortOrder || 0))
                    .map((field) => (
                      <Card key={field.key}>
                        <CardContent className="p-4">
                          <div className="flex items-start justify-between">
                            <div>
                              <div className="flex items-center gap-2">
                                <h3 className="font-semibold">{field.label}</h3>
                                <Badge variant="outline">{field.type}</Badge>
                                {field.required && <Badge variant="destructive">Required</Badge>}
                              </div>
                              <p className="text-sm text-muted-foreground">Key: {field.key}</p>
                              {field.options && field.options.length > 0 && (
                                <div className="mt-2 text-sm">
                                  <span className="font-medium">Options:</span> {field.options.length}
                                </div>
                              )}
                            </div>
                            <div className="flex gap-2">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => {
                                  setEditingField(field);
                                  setShowFieldForm(true);
                                }}
                              >
                                Edit
                              </Button>
                              <Button
                                variant="destructive"
                                size="sm"
                                onClick={() => handleDeleteField(field.key)}
                              >
                                Delete
                              </Button>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                </div>
              )}
            </CardContent>
          </Card>
        )}
      </div>

      {/* Field Form Modal */}
      {showFieldForm && editingField && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <CardHeader>
              <CardTitle>{editingField.key ? 'Edit Field' : 'Add Field'}</CardTitle>
            </CardHeader>
            <CardContent>
              <FieldForm
                field={editingField}
                onSave={handleSaveField}
                onCancel={() => {
                  setShowFieldForm(false);
                  setEditingField(null);
                }}
              />
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}

function FieldForm({
  field,
  onSave,
  onCancel,
}: {
  field: CustomizationField;
  onSave: (field: CustomizationField) => void;
  onCancel: () => void;
}) {
  const [formData, setFormData] = useState<CustomizationField>(field);
  const [newOption, setNewOption] = useState({ value: '', label: '', priceModifier: 0, imageUrl: '' });

  const handleAddOption = () => {
    if (!newOption.value || !newOption.label) return;
    setFormData({
      ...formData,
      options: [...(formData.options || []), { ...newOption }],
    });
    setNewOption({ value: '', label: '', priceModifier: 0, imageUrl: '' });
  };

  const handleRemoveOption = (index: number) => {
    setFormData({
      ...formData,
      options: formData.options?.filter((_, i) => i !== index),
    });
  };

  return (
    <div className="space-y-4">
      <div>
        <Label htmlFor="key">Field Key</Label>
        <Input
          id="key"
          value={formData.key}
          onChange={(e) => setFormData({ ...formData, key: e.target.value })}
          placeholder="e.g., beadColor"
        />
      </div>
      <div>
        <Label htmlFor="label">Field Label</Label>
        <Input
          id="label"
          value={formData.label}
          onChange={(e) => setFormData({ ...formData, label: e.target.value })}
          placeholder="e.g., Bead Color"
        />
      </div>
      <div>
        <Label htmlFor="type">Field Type</Label>
        <select
          id="type"
          value={formData.type}
          onChange={(e) => setFormData({ ...formData, type: e.target.value as any })}
          className="w-full p-2 border rounded"
        >
          <option value="select">Select (Single)</option>
          <option value="multiselect">Multi-select</option>
          <option value="color">Color</option>
          <option value="text">Text</option>
          <option value="number">Number</option>
        </select>
      </div>
      <div className="flex items-center gap-2">
        <input
          type="checkbox"
          id="required"
          checked={formData.required}
          onChange={(e) => setFormData({ ...formData, required: e.target.checked })}
        />
        <Label htmlFor="required">Required</Label>
      </div>
      <div>
        <Label htmlFor="sortOrder">Sort Order</Label>
        <Input
          id="sortOrder"
          type="number"
          value={formData.sortOrder || 0}
          onChange={(e) => setFormData({ ...formData, sortOrder: Number(e.target.value) })}
        />
      </div>

      {/* Options Management */}
      {(formData.type === 'select' || formData.type === 'multiselect' || formData.type === 'color') && (
        <div className="space-y-4 border-t pt-4">
          <h3 className="font-semibold">Options</h3>
          
          <div className="space-y-2">
            {formData.options?.map((option, index) => (
              <div key={index} className="flex items-center gap-2 p-2 border rounded">
                <span className="flex-1">{option.label}</span>
                <Badge variant="outline">{option.value}</Badge>
                {option.priceModifier !== undefined && option.priceModifier !== 0 && (
                  <Badge>₹{option.priceModifier}</Badge>
                )}
                <Button variant="destructive" size="sm" onClick={() => handleRemoveOption(index)}>
                  Remove
                </Button>
              </div>
            ))}
          </div>

          <div className="grid grid-cols-2 gap-2">
            <Input
              placeholder="Value"
              value={newOption.value}
              onChange={(e) => setNewOption({ ...newOption, value: e.target.value })}
            />
            <Input
              placeholder="Label"
              value={newOption.label}
              onChange={(e) => setNewOption({ ...newOption, label: e.target.value })}
            />
            <Input
              type="number"
              placeholder="Price Modifier"
              value={newOption.priceModifier}
              onChange={(e) => setNewOption({ ...newOption, priceModifier: Number(e.target.value) })}
            />
            <Input
              placeholder="Image URL (optional)"
              value={newOption.imageUrl}
              onChange={(e) => setNewOption({ ...newOption, imageUrl: e.target.value })}
            />
          </div>
          <Button onClick={handleAddOption} variant="outline" className="w-full">
            Add Option
          </Button>
        </div>
      )}

      <div className="flex gap-2 justify-end pt-4">
        <Button variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button onClick={() => onSave(formData)}>
          Save Field
        </Button>
      </div>
    </div>
  );
}

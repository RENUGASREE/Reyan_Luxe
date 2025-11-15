import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
// import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
// import { Slider } from '@/components/ui/slider';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { API_BASE_URL } from '@/lib/queryClient';

interface CustomizationOption {
  id: number;
  name: string;
  description: string;
  price_modifier: number;
  image?: string;
}

interface Material extends CustomizationOption {
  color: string;
  price_per_unit: number;
}

interface ChainType extends CustomizationOption {}

interface BraceletSize extends CustomizationOption {
  size: string;
  length_cm: number;
}

interface CustomizationData {
  productType: 'bracelet' | 'chain';
  material?: number;
  chainType?: number;
  size?: number;
  color?: string;
  charms?: number[];
  design?: string;
  beadsLocation?: string[];
}

interface CustomizationPanelProps {
  productType: 'bracelet' | 'chain';
  baseProductId?: number;
  onCustomizationComplete?: (customization: any) => void;
}

export const CustomizationPanel: React.FC<CustomizationPanelProps> = ({
  productType,
  baseProductId,
  onCustomizationComplete,
}) => {
  const { toast } = useToast();
  const [materials, setMaterials] = useState<Material[]>([]);
  const [chainTypes, setChainTypes] = useState<ChainType[]>([]);
  const [braceletSizes, setBraceletSizes] = useState<BraceletSize[]>([]);
  const [charms, setCharms] = useState<CustomizationOption[]>([]);
  const [loading, setLoading] = useState(true);
  const [generatingPreview, setGeneratingPreview] = useState(false);
  
  const [customization, setCustomization] = useState<CustomizationData>({
    productType,
    material: undefined,
    chainType: undefined,
    size: undefined,
    color: '#000000',
    charms: [],
    design: '',
    beadsLocation: [],
  });
  
  const [previewUrl, setPreviewUrl] = useState<string>('');
  const [totalPrice, setTotalPrice] = useState<number>(0);

  useEffect(() => {
    fetchCustomizationOptions();
  }, [productType]);

  useEffect(() => {
    calculateTotalPrice();
  }, [customization, materials, chainTypes, braceletSizes]);

  const fetchCustomizationOptions = async () => {
    try {
      setLoading(true);
      
      // Fetch materials
      const materialsResponse = await fetch(`${API_BASE_URL}/api/materials/`);
      if (materialsResponse.ok) {
        const materialsData = await materialsResponse.json();
        setMaterials(materialsData);
      }
      
      // Fetch chain types
      const chainTypesResponse = await fetch(`${API_BASE_URL}/api/chain-types/`);
      if (chainTypesResponse.ok) {
        const chainTypesData = await chainTypesResponse.json();
        setChainTypes(chainTypesData);
      }
      
      // Fetch bracelet sizes
      const sizesResponse = await fetch(`${API_BASE_URL}/api/bracelet-sizes/`);
      if (sizesResponse.ok) {
        const sizesData = await sizesResponse.json();
        setBraceletSizes(sizesData);
      }
      
      // Fetch charms
      const charmsResponse = await fetch(`${API_BASE_URL}/api/customization-options/?option_type=charm`);
      if (charmsResponse.ok) {
        const charmsData = await charmsResponse.json();
        setCharms(charmsData);
      }
      
    } catch (error) {
      console.error('Error fetching customization options:', error);
      toast({
        title: 'Error',
        description: 'Failed to load customization options',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const calculateTotalPrice = () => {
    let basePrice = 0;
    
    // Add material price
    if (customization.material) {
      const material = materials.find(m => m.id === customization.material);
      if (material) {
        basePrice += material.price_per_unit;
      }
    }
    
    // Add chain type price modifier
    if (customization.chainType) {
      const chainType = chainTypes.find(ct => ct.id === customization.chainType);
      if (chainType) {
        basePrice += chainType.price_modifier;
      }
    }
    
    // Add size price modifier
    if (customization.size) {
      const size = braceletSizes.find(s => s.id === customization.size);
      if (size) {
        basePrice += size.price_modifier;
      }
    }
    
    // Add charms price
    if (customization.charms && customization.charms.length > 0) {
      customization.charms.forEach(charmId => {
        const charm = charms.find(c => c.id === charmId);
        if (charm) {
          basePrice += charm.price_modifier;
        }
      });
    }
    
    setTotalPrice(basePrice);
  };

  const generatePreview = async () => {
    if (!customization.material) {
      toast({
        title: 'Missing Information',
        description: 'Please select a material first',
        variant: 'destructive',
      });
      return;
    }

    try {
      setGeneratingPreview(true);
      
      const response = await fetch(`${API_BASE_URL}/api/customized-products/generate-preview/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Token ${localStorage.getItem('authToken')}`,
        },
        body: JSON.stringify({
          customization_data: customization,
          product_type: productType,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        setPreviewUrl(data.preview_url);
        toast({
          title: 'Preview Generated',
          description: 'Your customization preview has been generated',
        });
      } else {
        throw new Error('Failed to generate preview');
      }
    } catch (error) {
      console.error('Error generating preview:', error);
      toast({
        title: 'Error',
        description: 'Failed to generate preview',
        variant: 'destructive',
      });
    } finally {
      setGeneratingPreview(false);
    }
  };

  const saveCustomization = async () => {
    if (!customization.material) {
      toast({
        title: 'Missing Information',
        description: 'Please select a material first',
        variant: 'destructive',
      });
      return;
    }

    try {
      const response = await fetch(`${API_BASE_URL}/api/customized-products/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Token ${localStorage.getItem('authToken')}`,
        },
        body: JSON.stringify({
          product_type: productType,
          base_product_id: baseProductId,
          customization_data: customization,
          total_price: totalPrice,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        toast({
          title: 'Customization Saved',
          description: 'Your customization has been saved successfully',
        });
        
        if (onCustomizationComplete) {
          onCustomizationComplete(data);
        }
      } else {
        throw new Error('Failed to save customization');
      }
    } catch (error) {
      console.error('Error saving customization:', error);
      toast({
        title: 'Error',
        description: 'Failed to save customization',
        variant: 'destructive',
      });
    }
  };

  const addToCart = async () => {
    if (!customization.material) {
      toast({
        title: 'Missing Information',
        description: 'Please select a material first',
        variant: 'destructive',
      });
      return;
    }

    // First save the customization
    try {
      const saveResponse = await fetch(`${API_BASE_URL}/api/customized-products/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Token ${localStorage.getItem('authToken')}`,
        },
        body: JSON.stringify({
          product_type: productType,
          base_product_id: baseProductId,
          customization_data: customization,
          total_price: totalPrice,
        }),
      });

      if (saveResponse.ok) {
        const savedData = await saveResponse.json();
        
        // Then add to cart
        const cartResponse = await fetch(`${API_BASE_URL}/api/customized-products/${savedData.id}/add_to_cart/`, {
          method: 'POST',
          headers: {
            'Authorization': `Token ${localStorage.getItem('authToken')}`,
          },
        });

        if (cartResponse.ok) {
          toast({
            title: 'Added to Cart',
            description: 'Your customized product has been added to cart',
          });
        }
      }
    } catch (error) {
      console.error('Error adding to cart:', error);
      toast({
        title: 'Error',
        description: 'Failed to add to cart',
        variant: 'destructive',
      });
    }
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="animate-pulse space-y-4">
            <div className="h-4 bg-gray-200 rounded w-3/4"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2"></div>
            <div className="h-4 bg-gray-200 rounded w-5/6"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Customize Your {productType === 'bracelet' ? 'Bracelet' : 'Chain'}</CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="materials" className="w-full">
            <TabsList className="grid w-full grid-cols-2 lg:grid-cols-4">
              <TabsTrigger value="materials">Materials</TabsTrigger>
              {productType === 'chain' && <TabsTrigger value="chain-type">Chain Type</TabsTrigger>}
              {productType === 'bracelet' && <TabsTrigger value="size">Size</TabsTrigger>}
              <TabsTrigger value="charms">Charms</TabsTrigger>
              <TabsTrigger value="design">Design</TabsTrigger>
            </TabsList>

            <TabsContent value="materials" className="space-y-4">
              <Label>Select Material</Label>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {materials.map((material) => (
                  <Card
                    key={material.id}
                    className={`cursor-pointer transition-all ${
                      customization.material === material.id ? 'ring-2 ring-primary' : ''
                    }`}
                    onClick={() => setCustomization({ ...customization, material: material.id })}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-center space-x-3">
                        <div
                          className="w-8 h-8 rounded-full border"
                          style={{ backgroundColor: material.color }}
                        />
                        <div>
                          <p className="font-medium">{material.name}</p>
                          <p className="text-sm text-gray-500">${material.price_per_unit}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>

            {productType === 'chain' && (
              <TabsContent value="chain-type" className="space-y-4">
                <Label>Select Chain Type</Label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {chainTypes.map((chainType) => (
                    <Card
                      key={chainType.id}
                      className={`cursor-pointer transition-all ${
                        customization.chainType === chainType.id ? 'ring-2 ring-primary' : ''
                      }`}
                      onClick={() => setCustomization({ ...customization, chainType: chainType.id })}
                    >
                      <CardContent className="p-4">
                        <p className="font-medium">{chainType.name}</p>
                        <p className="text-sm text-gray-500">{chainType.description}</p>
                        {chainType.price_modifier > 0 && (
                          <Badge variant="secondary" className="mt-2">
                            +${chainType.price_modifier}
                          </Badge>
                        )}
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </TabsContent>
            )}

            {productType === 'bracelet' && (
              <TabsContent value="size" className="space-y-4">
                <Label>Select Size</Label>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {braceletSizes.map((size) => (
                    <Card
                      key={size.id}
                      className={`cursor-pointer transition-all ${
                        customization.size === size.id ? 'ring-2 ring-primary' : ''
                      }`}
                      onClick={() => setCustomization({ ...customization, size: size.id })}
                    >
                      <CardContent className="p-4">
                        <p className="font-medium">{size.size}</p>
                        <p className="text-sm text-gray-500">{size.length_cm} cm</p>
                        {size.price_modifier > 0 && (
                          <Badge variant="secondary" className="mt-2">
                            +${size.price_modifier}
                          </Badge>
                        )}
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </TabsContent>
            )}

            <TabsContent value="charms" className="space-y-4">
              <Label>Select Charms (Multiple can be selected)</Label>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {charms.map((charm) => (
                  <Card
                    key={charm.id}
                    className={`cursor-pointer transition-all ${
                      customization.charms?.includes(charm.id) ? 'ring-2 ring-primary' : ''
                    }`}
                    onClick={() => {
                      const newCharms = customization.charms?.includes(charm.id)
                        ? customization.charms.filter(id => id !== charm.id)
                        : [...(customization.charms || []), charm.id];
                      setCustomization({ ...customization, charms: newCharms });
                    }}
                  >
                    <CardContent className="p-4">
                      <p className="font-medium">{charm.name}</p>
                      <p className="text-sm text-gray-500">{charm.description}</p>
                      {charm.price_modifier > 0 && (
                        <Badge variant="secondary" className="mt-2">
                          +${charm.price_modifier}
                        </Badge>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="design" className="space-y-4">
              <div className="space-y-4">
                <div>
                  <Label htmlFor="color">Primary Color</Label>
                  <input
                    id="color"
                    type="color"
                    value={customization.color}
                    onChange={(e) => setCustomization({ ...customization, color: e.target.value })}
                    className="w-full h-10 rounded border"
                  />
                </div>
                
                <div>
                  <Label htmlFor="design">Special Design Instructions</Label>
                  <textarea
                    id="design"
                    value={customization.design}
                    onChange={(e) => setCustomization({ ...customization, design: e.target.value })}
                    placeholder="Describe any special design requirements..."
                    className="w-full p-3 border rounded-md"
                    rows={3}
                  />
                </div>

                {productType === 'bracelet' && (
                  <div>
                    <Label>Beads Location (for bracelets)</Label>
                    <div className="space-y-2">
                      {['Center', 'Left Side', 'Right Side', 'All Around'].map((location) => (
                        <label key={location} className="flex items-center space-x-2">
                          <input
                            type="checkbox"
                            checked={customization.beadsLocation?.includes(location) || false}
                            onChange={(e) => {
                              const newLocations = e.target.checked
                                ? [...(customization.beadsLocation || []), location]
                                : customization.beadsLocation?.filter(l => l !== location) || [];
                              setCustomization({ ...customization, beadsLocation: newLocations });
                            }}
                          />
                          <span>{location}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {/* Preview and Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Preview & Pricing</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {previewUrl && (
              <div className="text-center">
                <img
                  src={previewUrl}
                  alt="Customization Preview"
                  className="mx-auto max-w-sm rounded-lg shadow-md"
                />
              </div>
            )}
            
            <div className="text-center space-y-2">
              <p className="text-2xl font-bold text-primary">
                Total: ${totalPrice.toFixed(2)}
              </p>
              <p className="text-sm text-gray-500">
                Price includes all selected customizations
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-3">
              <Button
                onClick={generatePreview}
                disabled={!customization.material || generatingPreview}
                className="flex-1"
                variant="outline"
              >
                {generatingPreview ? 'Generating...' : 'Generate Preview'}
              </Button>
              
              <Button
                onClick={saveCustomization}
                disabled={!customization.material}
                className="flex-1"
                variant="secondary"
              >
                Save Customization
              </Button>
              
              <Button
                onClick={addToCart}
                disabled={!customization.material}
                className="flex-1"
              >
                Add to Cart
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

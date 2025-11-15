import React from 'react';
import { useParams } from 'react-router-dom';
import { CustomizationPanel } from '@/components/CustomizationPanel';
import Navbar from '@/components/navbar';
import Footer from '@/components/footer';
import { SEO } from '@/components/SEO';

interface CustomizationPageProps {}

const CustomizationPage: React.FC<CustomizationPageProps> = () => {
  const { productType, productId } = useParams<{ productType: string; productId: string }>();
  
  const validProductType = productType === 'bracelet' || productType === 'chain' ? productType : 'bracelet';
  const baseProductId = productId ? parseInt(productId) : undefined;

  return (
    <div className="min-h-screen bg-background">
      <SEO 
        title="Customize Your Jewelry - Reyan Luxe"
        description="Create your perfect customized bracelet or chain with our interactive customization tool. Choose materials, colors, charms, and design your unique piece."
        keywords="customize jewelry, custom bracelet, custom chain, jewelry customization, personalized jewelry, design your own jewelry"
        url={`https://reyanluxe.com/customize/${validProductType}${baseProductId ? `/${baseProductId}` : ''}`}
      />
      <Navbar />
      
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          <div className="mb-8">
            <h1 className="text-4xl font-bold text-center mb-2">
              Customize Your {validProductType === 'bracelet' ? 'Bracelet' : 'Chain'}
            </h1>
            <p className="text-center text-muted-foreground">
              Create a unique piece that reflects your personal style
            </p>
          </div>
          
          <CustomizationPanel
            productType={validProductType}
            baseProductId={baseProductId}
            onCustomizationComplete={(customization) => {
              console.log('Customization completed:', customization);
            }}
          />
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default CustomizationPage;

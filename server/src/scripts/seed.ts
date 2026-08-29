import dotenv from "dotenv";
import {
  Category,
  Product,
  CustomizationConfig,
  Coupon,
} from "../models/index.js";
import { connectDatabase, disconnectDatabase } from "../db/connection.js";

dotenv.config();

const PLACEHOLDER_IMAGE = "https://placehold.co/800x800/FF0066/FFFFFF?text=Reyan+Luxe";

const braceletCustomizationFields = [
  {
    key: "beadColor",
    label: "Bead Color",
    type: "select" as const,
    required: true,
    sortOrder: 1,
    options: [
      { value: "rose-quartz", label: "Rose Quartz", priceModifier: 0 },
      { value: "amethyst", label: "Amethyst", priceModifier: 200 },
      { value: "citrine", label: "Citrine", priceModifier: 150 },
      { value: "clear-quartz", label: "Clear Quartz", priceModifier: 0 },
    ],
  },
  {
    key: "beadType",
    label: "Bead Type",
    type: "select" as const,
    required: true,
    sortOrder: 2,
    options: [
      { value: "crystal", label: "Crystal", priceModifier: 0 },
      { value: "glass", label: "Glass", priceModifier: -100 },
      { value: "gemstone", label: "Natural Gemstone", priceModifier: 500 },
    ],
  },
  {
    key: "beadSize",
    label: "Bead Size (mm)",
    type: "select" as const,
    required: true,
    sortOrder: 3,
    options: [
      { value: "6", label: "6mm", priceModifier: 0 },
      { value: "8", label: "8mm", priceModifier: 100 },
      { value: "10", label: "10mm", priceModifier: 200 },
    ],
  },
  {
    key: "braceletSize",
    label: "Bracelet Size",
    type: "select" as const,
    required: true,
    sortOrder: 4,
    options: [
      { value: "S", label: "Small (6.0–6.5\")", priceModifier: 0 },
      { value: "M", label: "Medium (6.5–7.0\")", priceModifier: 0 },
      { value: "L", label: "Large (7.0–7.5\")", priceModifier: 0 },
    ],
  },
  {
    key: "charms",
    label: "Charms",
    type: "multiselect" as const,
    required: false,
    sortOrder: 5,
    options: [
      { value: "heart", label: "Heart Charm", priceModifier: 150 },
      { value: "star", label: "Star Charm", priceModifier: 150 },
      { value: "moon", label: "Moon Charm", priceModifier: 175 },
    ],
  },
  {
    key: "metalFinish",
    label: "Metal Finish",
    type: "select" as const,
    required: true,
    sortOrder: 6,
    options: [
      { value: "gold", label: "Gold Plated", priceModifier: 200 },
      { value: "rose-gold", label: "Rose Gold", priceModifier: 250 },
      { value: "silver", label: "Sterling Silver", priceModifier: 150 },
    ],
  },
  {
    key: "engraving",
    label: "Engraving",
    type: "text" as const,
    required: false,
    sortOrder: 7,
    options: [],
  },
];

const earringCustomizationFields = [
  {
    key: "stoneColor",
    label: "Stone Color",
    type: "select" as const,
    required: true,
    sortOrder: 1,
    options: [
      { value: "ruby-red", label: "Ruby Red", priceModifier: 0 },
      { value: "emerald-green", label: "Emerald Green", priceModifier: 300 },
      { value: "sapphire-blue", label: "Sapphire Blue", priceModifier: 350 },
    ],
  },
  {
    key: "stoneShape",
    label: "Stone Shape",
    type: "select" as const,
    required: true,
    sortOrder: 2,
    options: [
      { value: "round", label: "Round", priceModifier: 0 },
      { value: "teardrop", label: "Teardrop", priceModifier: 150 },
      { value: "marquise", label: "Marquise", priceModifier: 200 },
    ],
  },
  {
    key: "metalFinish",
    label: "Metal Finish",
    type: "select" as const,
    required: true,
    sortOrder: 3,
    options: [
      { value: "gold", label: "Gold", priceModifier: 0 },
      { value: "antique-gold", label: "Antique Gold", priceModifier: 100 },
    ],
  },
  {
    key: "hookType",
    label: "Hook Type",
    type: "select" as const,
    required: true,
    sortOrder: 4,
    options: [
      { value: "fish-hook", label: "Fish Hook", priceModifier: 0 },
      { value: "lever-back", label: "Lever Back", priceModifier: 75 },
      { value: "stud", label: "Stud", priceModifier: 50 },
    ],
  },
];

const bangleCustomizationFields = [
  {
    key: "size",
    label: "Bangle Size",
    type: "select" as const,
    required: true,
    sortOrder: 1,
    options: [
      { value: "2-4", label: "2.4 (Small)", priceModifier: 0 },
      { value: "2-6", label: "2.6 (Medium)", priceModifier: 0 },
      { value: "2-8", label: "2.8 (Large)", priceModifier: 0 },
    ],
  },
  {
    key: "stoneColor",
    label: "Stone Color",
    type: "select" as const,
    required: true,
    sortOrder: 2,
    options: [
      { value: "multicolor", label: "Multicolor Kundan", priceModifier: 0 },
      { value: "ruby", label: "Ruby Tone", priceModifier: 400 },
      { value: "emerald", label: "Emerald Tone", priceModifier: 400 },
    ],
  },
  {
    key: "stoneArrangement",
    label: "Stone Arrangement",
    type: "select" as const,
    required: true,
    sortOrder: 3,
    options: [
      { value: "single-row", label: "Single Row", priceModifier: 0 },
      { value: "double-row", label: "Double Row", priceModifier: 600 },
      { value: "floral", label: "Floral Pattern", priceModifier: 900 },
    ],
  },
  {
    key: "metalFinish",
    label: "Metal Finish",
    type: "select" as const,
    required: true,
    sortOrder: 4,
    options: [
      { value: "gold", label: "Gold", priceModifier: 0 },
      { value: "antique", label: "Antique Gold", priceModifier: 150 },
    ],
  },
];

async function seed() {
  const reset = process.argv.includes("--reset");

  await connectDatabase();

  if (reset) {
    console.log("Resetting catalog collections...");
    await Promise.all([
      Product.deleteMany({}),
      Category.deleteMany({}),
      CustomizationConfig.deleteMany({}),
      Coupon.deleteMany({}),
    ]);
  }

  console.log("Seeding categories...");

  const braceletCategory = await Category.findOneAndUpdate(
    { slug: "crystal-bead-bracelets" },
    {
      name: "Crystal Bead Bracelets",
      slug: "crystal-bead-bracelets",
      description: "Handcrafted crystal bead bracelets with customizable colors, charms, and finishes.",
      productType: "bracelet",
      isActive: true,
      showInMenu: true,
      sortOrder: 1,
      customizationFields: braceletCustomizationFields,
      imageUrl: PLACEHOLDER_IMAGE,
    },
    { upsert: true, new: true }
  );

  const earringCategory = await Category.findOneAndUpdate(
    { slug: "kundan-stone-earrings" },
    {
      name: "Kundan Stone Earrings",
      slug: "kundan-stone-earrings",
      description: "Premium Kundan stone earrings with customizable stone colors, shapes, and hooks.",
      productType: "earring",
      isActive: true,
      showInMenu: true,
      sortOrder: 2,
      customizationFields: earringCustomizationFields,
      imageUrl: PLACEHOLDER_IMAGE,
    },
    { upsert: true, new: true }
  );

  const bangleCategory = await Category.findOneAndUpdate(
    { slug: "kundan-stone-bangles" },
    {
      name: "Kundan Stone Bangles",
      slug: "kundan-stone-bangles",
      description: "Elegant Kundan bangles with customizable size, stone arrangement, and metal finish.",
      productType: "bangle",
      isActive: true,
      showInMenu: true,
      sortOrder: 3,
      customizationFields: bangleCustomizationFields,
      imageUrl: PLACEHOLDER_IMAGE,
    },
    { upsert: true, new: true }
  );

  console.log("Seeding customization configs...");

  await CustomizationConfig.findOneAndUpdate(
    { name: "Bracelet Configurator", productType: "bracelet" },
    {
      name: "Bracelet Configurator",
      productType: "bracelet",
      categoryId: braceletCategory._id,
      fields: braceletCustomizationFields,
      isActive: true,
    },
    { upsert: true, new: true }
  );

  await CustomizationConfig.findOneAndUpdate(
    { name: "Earring Configurator", productType: "earring" },
    {
      name: "Earring Configurator",
      productType: "earring",
      categoryId: earringCategory._id,
      fields: earringCustomizationFields,
      isActive: true,
    },
    { upsert: true, new: true }
  );

  await CustomizationConfig.findOneAndUpdate(
    { name: "Bangle Configurator", productType: "bangle" },
    {
      name: "Bangle Configurator",
      productType: "bangle",
      categoryId: bangleCategory._id,
      fields: bangleCustomizationFields,
      isActive: true,
    },
    { upsert: true, new: true }
  );

  console.log("Seeding sample products...");

  const products = [
    {
      name: "Aura Rose Crystal Bracelet",
      slug: "aura-rose-crystal-bracelet",
      sku: "BRC-AURA-001",
      description:
        "A delicate crystal bead bracelet featuring rose quartz tones and gold-plated accents. Perfect for everyday elegance.",
      categoryId: braceletCategory._id,
      price: 1299,
      salePrice: 1099,
      stock: 25,
      colors: ["rose", "pink"],
      materials: ["crystal", "gold-plated"],
      badge: "Bestseller",
      isSignaturePiece: true,
      signatureCategory: "trending",
    },
    {
      name: "Celestial Amethyst Bracelet",
      slug: "celestial-amethyst-bracelet",
      sku: "BRC-CELE-002",
      description: "Deep amethyst crystal beads with sterling silver spacers and optional charm customization.",
      categoryId: braceletCategory._id,
      price: 1599,
      stock: 18,
      colors: ["purple"],
      materials: ["amethyst", "silver"],
      badge: "Modern Classic",
      isSignaturePiece: true,
      signatureCategory: "fashion",
    },
    {
      name: "Royal Kundan Drop Earrings",
      slug: "royal-kundan-drop-earrings",
      sku: "EAR-ROYAL-001",
      description: "Traditional Kundan drop earrings with ruby-toned stones and antique gold finish.",
      categoryId: earringCategory._id,
      price: 2499,
      salePrice: 2199,
      stock: 12,
      colors: ["red", "gold"],
      materials: ["kundan", "gold"],
      badge: "Limited Edition",
      isSignaturePiece: true,
      signatureCategory: "latest",
    },
    {
      name: "Heritage Kundan Stud Earrings",
      slug: "heritage-kundan-stud-earrings",
      sku: "EAR-HERT-002",
      description: "Compact Kundan stud earrings ideal for festive occasions. Customizable stone shape and hook type.",
      categoryId: earringCategory._id,
      price: 1899,
      stock: 20,
      colors: ["green", "gold"],
      materials: ["kundan", "gold"],
      isSignaturePiece: false,
    },
    {
      name: "Regal Kundan Bangle Set",
      slug: "regal-kundan-bangle-set",
      sku: "BNG-REGAL-001",
      description: "Single handcrafted Kundan bangle with multicolor stone arrangement and antique gold finish.",
      categoryId: bangleCategory._id,
      price: 3499,
      stock: 8,
      colors: ["multicolor", "gold"],
      materials: ["kundan", "gold"],
      badge: "Bestseller",
      isSignaturePiece: true,
      signatureCategory: "trending",
    },
    {
      name: "Floral Kundan Bangle",
      slug: "floral-kundan-bangle",
      sku: "BNG-FLOR-002",
      description: "Floral-pattern Kundan bangle with customizable size and stone color palette.",
      categoryId: bangleCategory._id,
      price: 2999,
      stock: 10,
      colors: ["pink", "gold"],
      materials: ["kundan", "gold"],
      isSignaturePiece: true,
      signatureCategory: "fashion",
    },
  ];

  for (const data of products) {
    await Product.findOneAndUpdate(
      { sku: data.sku },
      {
        ...data,
        shortDescription: data.description.slice(0, 120),
        currency: "INR",
        lowStockThreshold: 5,
        media: [{ url: PLACEHOLDER_IMAGE, type: "image", isPrimary: true, alt: data.name }],
        tags: ["reyan-luxe", "handcrafted"],
        isActive: true,
        isCustomizable: true,
      },
      { upsert: true, new: true }
    );
  }

  await Coupon.findOneAndUpdate(
    { code: "WELCOME10" },
    {
      code: "WELCOME10",
      description: "10% off your first order",
      type: "percentage",
      value: 10,
      minOrderAmount: 999,
      maxDiscount: 500,
      usageLimit: 1000,
      isActive: true,
    },
    { upsert: true, new: true }
  );

  console.log("Seed completed successfully.");
  console.log(`  Categories: 3`);
  console.log(`  Products: ${products.length}`);
  console.log(`  Customization configs: 3`);
  console.log(`  Sample coupon: WELCOME10`);

  await disconnectDatabase();
}

seed().catch(async (error) => {
  console.error("Seed failed:", error);
  await disconnectDatabase();
  process.exit(1);
});

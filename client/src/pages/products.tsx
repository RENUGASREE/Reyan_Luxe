import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Footer from "@/components/footer";

// Dummy product data
const products = [
  {
    id: "1",
    name: "Luxury Watch",
    price: "$10,000",
    category: "Accessories",
    image: "https://via.placeholder.com/150",
  },
  {
    id: "2",
    name: "Designer Handbag",
    price: "$5,000",
    category: "Accessories",
    image: "https://via.placeholder.com/150",
  },
  {
    id: "3",
    name: "Custom Suit",
    price: "$3,000",
    category: "Apparel",
    image: "https://via.placeholder.com/150",
  },
  {
    id: "4",
    name: "Diamond Ring",
    price: "$20,000",
    category: "Jewelry",
    image: "https://via.placeholder.com/150",
  },
];

export default function Products() {
  const [searchTerm, setSearchTerm] = useState("");
  const [filterCategory, setFilterCategory] = useState("all");

  const filteredProducts = products.filter((product) => {
    const matchesSearch = product.name
      .toLowerCase()
      .includes(searchTerm.toLowerCase());
    const matchesCategory =
      filterCategory === "all" || product.category === filterCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* <Navbar /> */}
      <main className="container mx-auto px-4 py-8 pt-20">
        <h1 className="text-5xl font-bold text-center mb-12">Our Products</h1>

        <div className="flex flex-col md:flex-row gap-4 mb-8">
          <Input
            placeholder="Search products..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="flex-grow"
          />
          <Select
            onValueChange={(value) => setFilterCategory(value)}
            value={filterCategory}
          >
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Filter by Category" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Categories</SelectItem>
              <SelectItem value="Accessories">Accessories</SelectItem>
              <SelectItem value="Apparel">Apparel</SelectItem>
              <SelectItem value="Jewelry">Jewelry</SelectItem>
            </SelectContent>
          </Select>
          <Button onClick={() => {
            setSearchTerm("");
            setFilterCategory("all");
          }}>Reset Filters</Button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredProducts.map((product) => (
            <Card key={product.id} className="flex flex-col">
              <CardHeader>
                <img
                  src={product.image}
                  alt={product.name}
                  className="w-full h-48 object-cover rounded-md mb-4"
                />
                <CardTitle>{product.name}</CardTitle>
              </CardHeader>
              <CardContent className="flex-grow flex flex-col justify-between">
                <p className="text-lg font-semibold mb-2">{product.price}</p>
                <p className="text-sm text-muted-foreground">
                  Category: {product.category}
                </p>
                <Button className="mt-4 w-full">View Details</Button>
              </CardContent>
            </Card>
          ))}
        </div>
        {filteredProducts.length === 0 && (
          <p className="text-center text-xl mt-10">No products found.</p>
        )}
      </main>
      <Footer />
    </div>
  );
}
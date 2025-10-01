import { useState } from "react";
import { Button } from "./ui/button";

export type Category = "all" | "vip" | "clothing" | "transport" | "cosmetic" | "cassettes" | "custom";

interface CategoryFilterProps {
  onCategoryChange: (category: Category) => void;
}

const categories = [
  { id: "all" as Category, label: "Всі товари" },
  { id: "vip" as Category, label: "VIP" },
  { id: "clothing" as Category, label: "Одяг" },
  { id: "transport" as Category, label: "Транспорт" },
  { id: "cosmetic" as Category, label: "Косметика" },
  { id: "cassettes" as Category, label: "Музичні кассети" },
  { id: "custom" as Category, label: "Кастомні предмети" },
];

const CategoryFilter = ({ onCategoryChange }: CategoryFilterProps) => {
  const [activeCategory, setActiveCategory] = useState<Category>("all");

  const handleCategoryClick = (category: Category) => {
    setActiveCategory(category);
    onCategoryChange(category);
  };

  return (
    <div className="flex flex-wrap gap-2 justify-center mb-12">
      {categories.map((category) => (
        <Button
          key={category.id}
          variant={activeCategory === category.id ? "default" : "outline"}
          onClick={() => handleCategoryClick(category.id)}
          className="min-w-[120px]"
        >
          {category.label}
        </Button>
      ))}
    </div>
  );
};

export default CategoryFilter;

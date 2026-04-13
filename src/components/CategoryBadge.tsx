import { Category } from "@prisma/client";
import { CATEGORIES } from "@/lib/categories";

interface CategoryBadgeProps {
  category: Category;
  className?: string;
}

export default function CategoryBadge({ category, className = "" }: CategoryBadgeProps) {
  const cat = CATEGORIES[category];
  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${cat.badge} ${className}`}
    >
      {cat.label}
    </span>
  );
}

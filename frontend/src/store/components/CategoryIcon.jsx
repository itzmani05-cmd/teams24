import { BookOpen, Dumbbell, Home, Shirt, Smartphone, Sparkles, Tag } from "lucide-react";

const ICONS = { BookOpen, Dumbbell, Home, Shirt, Smartphone, Sparkles, Tag };

const CategoryIcon = ({ name, size = 28 }) => {
  const Icon = ICONS[name] || Tag;
  return <Icon size={size} strokeWidth={1.6} />;
};

export default CategoryIcon;

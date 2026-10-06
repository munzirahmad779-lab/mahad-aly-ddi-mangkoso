export interface Article {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  content: string;
  author: string;
  authorRole: string;
  category: "karya-anregurutta" | "usul-fikih" | "tafsir-hadis";
  categoryLabel: string;
  date: string;
  hijriDate: string;
  readTime: string;
  isSpecial?: boolean;
}

export interface CategoryInfo {
  slug: string;
  name: string;
  description: string;
  iconName: string;
}
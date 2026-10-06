export interface Article {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  content: string;
  author: string;
  authorRole: string;
  authorBio?: string;
  category: string;
  categoryLabel: string;
  date: string;
  hijriDate: string;
  readTime: string;
  views?: number;
  isSpecial?: boolean;
  tags?: string[];
  arabicSnippet?: string;
}

export interface CategoryInfo {
  id: string;
  slug: string;
  name: string;
  description: string;
  iconName: string;
}

export interface Thesis {
  id: string;
  slug: string;
  title: string;
  author: string;
  nim: string;
  angkatan: string;
  year: string;
  advisor1: string;
  advisor2: string;
  abstractId: string;
  abstractAr: string;
  keywords: string[];
  category: string;
  categoryLabel: string;
  downloadUrl: string; // Google Drive or external link
  fileSize: string; // e.g. "3.2 MB"
}

export interface Submission {
  id: string;
  nama: string;
  email: string;
  afiliasi: string;
  kategori: string;
  judul: string;
  abstrak: string;
  keywords: string;
  fileLink?: string;
  tanggal: string;
  status: "draft" | "review" | "revisi" | "publish";
  reviewNote?: string;
}

export interface NewsItem {
  id: string;
  slug: string;
  title: string;
  date: string;
  excerpt: string;
  content: string;
  category: "Berita" | "Pengumuman" | "Agenda";
  author: string;
}

export interface AdminUser {
  id: string;
  name: string;
  email: string;
  role: "Super Admin" | "Editor" | "Penulis";
  status: "Aktif" | "Nonaktif";
  lastLogin: string;
}

export interface ActivityLog {
  id: string;
  user: string;
  action: string;
  target: string;
  timestamp: string;
}

export interface MediaItem {
  id: string;
  name: string;
  url: string;
  size: string;
  type: "image" | "pdf" | "document";
  uploadedAt: string;
}

export interface TestimonialItem {
  id: string;
  name: string;
  role: string;
  text: string;
}

export interface HeroSectionData {
  badge: string;
  title: string;
  subtitle: string;
  arabicMotto: string;
  ctaPrimaryText: string;
  ctaPrimaryLink: string;
  ctaSecondaryText: string;
  ctaSecondaryLink: string;
}

export interface QuoteSectionData {
  arabicQuote: string;
  source: string;
  translation: string;
  context: string;
}

export interface SeoSettings {
  siteTitle: string;
  metaDescription: string;
  keywords: string;
  ogImage: string;
  googleAnalyticsId: string;
  searchConsoleCode: string;
  enableSitemap: boolean;
}

export interface SiteSettings {
  institutionName: string;
  takhassus: string;
  focusField: string;
  mudirName: string;
  establishedDate: string;
  location: string;
  address: string;
  phone: string;
  emailSubmission: string;
  visi: string;
  misi: string[];
  hero?: HeroSectionData;
  quote?: QuoteSectionData;
  seo?: SeoSettings;
  maintenanceMode?: boolean;
}
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

export interface Lecturer {
  id: string;
  name: string;
  title: string;
  role: string;
  photoUrl: string;
  expertise: string;
  education: string[];
  publications: string[];
  order: number;
  isActive: boolean;
}

export interface Facility {
  id: string;
  name: string;
  category: "Masjid" | "Asrama" | "Perpustakaan" | "Laboratorium" | "Aula" | "Lainnya";
  photoUrl: string;
  description: string;
}

export interface Accreditation {
  id: string;
  name: string;
  issuer: string;
  validDate: string;
  pdfUrl: string;
  fileSize?: string;
  status: "Terakreditasi Baik Sekali" | "A" | "Unggul" | "Resmi Kemenag";
}

export interface Course {
  id: string;
  name: string;
  semester: number;
  credits: number;
  mainBook: string;
  supportBook: string;
  lecturer: string;
  description: string;
}

export interface CalendarEvent {
  id: string;
  name: string;
  startDate: string;
  endDate: string;
  category: "kuliah" | "ujian" | "libur" | "kegiatan";
  description: string;
}

export interface BahtsulMasailQA {
  id: string;
  title: string;
  question: string;
  answer: string;
  theme: string;
  author: string;
  date: string;
  status: "draft" | "published";
  arabicReferences?: string;
}

export interface PMBWave {
  id: string;
  name: string;
  startDate: string;
  endDate: string;
  quota: string;
  scholarshipInfo: string;
  requirements: string[];
  procedure: string[];
}

export interface PMBFAQ {
  id: string;
  question: string;
  answer: string;
  category: string;
}

export interface EmailSubscriber {
  id: string;
  email: string;
  name?: string;
  phone?: string;
  pageTarget: string;
  subscribedAt: string;
}

export interface EmailLog {
  id: string;
  to: string;
  subject: string;
  status: "Terkirim" | "Gagal";
  timestamp: string;
}

export interface GalleryPhoto {
  id: string;
  url: string;
  caption: string;
}

export interface GalleryAlbum {
  id: string;
  title: string;
  category: string;
  date: string;
  coverUrl: string;
  photos: GalleryPhoto[];
}

export interface ComingSoonPageSetting {
  id: string;
  slug: string;
  title: string;
  isEnabled: boolean;
  releaseDate: string;
  description: string;
  subscriberCount: number;
}

export interface PageSeoItem {
  pageKey: "home" | "profil" | "akademik" | "kajian" | "publikasi" | "pmb" | "kontak";
  pageName: string;
  title: string;
  description: string;
  keywords: string;
  ogImage: string;
}

export interface SocialMediaSettings {
  facebook: string;
  instagram: string;
  youtube: string;
  whatsapp: string;
  emailOfficial: string;
  fullAddress: string;
}

export interface FooterNavLink {
  id: string;
  label: string;
  url: string;
  position: number;
  isActive: boolean;
}

export interface FooterFocusItem {
  id: string;
  name: string;
  icon?: string;
  position: number;
  isActive: boolean;
}

export interface FooterSettings {
  logoUrl: string;
  orgName: string;
  orgSubname: string;
  description: string;
  address: string;
  kanalDescription: string;
  email: string;
  whatsapp: string;
  facebookUrl: string;
  instagramUrl: string;
  youtubeUrl: string;
  telegramUrl?: string;
  tiktokUrl?: string;
  copyrightText: string;
  tagline: string;
  showAdminLink: boolean;
  adminLinkLabel: string;
  adminLinkUrl: string;
  footerBgColor: string;
  footerTextColor: string;
  columnLayout: number; // 2, 3, or 4
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
  targetSubmissionEmails?: string[];
  visi: string;
  misi: string[];
  historyContent?: string;
  historyArabic?: string;
  organizationChartUrl?: string;
  gradingSystemRules?: string;
  academicGuideBookUrl?: string;
  academicGuideBookSize?: string;
  academicGuideBookYear?: string;
  hero?: HeroSectionData;
  quote?: QuoteSectionData;
  seo?: SeoSettings;
  socialMedia?: SocialMediaSettings;
  footer?: FooterSettings;
  maintenanceMode?: boolean;
}
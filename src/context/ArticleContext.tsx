"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import {
  Article,
  CategoryInfo,
  Thesis,
  Submission,
  NewsItem,
  SiteSettings,
  AdminUser,
  ActivityLog,
  MediaItem
} from "@/lib/types";
import {
  INITIAL_ARTICLES,
  INITIAL_CATEGORIES,
  INITIAL_THESES,
  INITIAL_NEWS,
  INITIAL_SETTINGS,
  INITIAL_ADMIN_USERS,
  INITIAL_ACTIVITY_LOGS,
  INITIAL_MEDIA
} from "@/lib/mock-data";

interface DataContextType {
  // Articles
  articles: Article[];
  addArticle: (article: Omit<Article, "id" | "slug">) => void;
  updateArticle: (id: string, updatedData: Partial<Article>) => void;
  deleteArticle: (id: string) => void;
  incrementArticleViews: (slug: string) => void;

  // Categories
  categories: CategoryInfo[];
  addCategory: (category: Omit<CategoryInfo, "id" | "slug">) => void;
  updateCategory: (id: string, updatedData: Partial<CategoryInfo>) => void;
  deleteCategory: (id: string) => void;

  // Theses / Skripsi
  theses: Thesis[];
  addThesis: (thesis: Omit<Thesis, "id" | "slug">) => void;
  updateThesis: (id: string, updatedData: Partial<Thesis>) => void;
  deleteThesis: (id: string) => void;

  // Submissions
  submissions: Submission[];
  addSubmission: (submission: Omit<Submission, "id" | "tanggal" | "status">) => void;
  updateSubmissionStatus: (id: string, status: Submission["status"], reviewNote?: string) => void;
  deleteSubmission: (id: string) => void;

  // News / Berita
  news: NewsItem[];
  addNews: (newsItem: Omit<NewsItem, "id" | "slug">) => void;
  updateNews: (id: string, updatedData: Partial<NewsItem>) => void;
  deleteNews: (id: string) => void;

  // Users & Roles
  users: AdminUser[];
  addUser: (user: Omit<AdminUser, "id">) => void;
  updateUser: (id: string, updatedData: Partial<AdminUser>) => void;
  deleteUser: (id: string) => void;

  // Activity Logs
  logs: ActivityLog[];
  addLog: (action: string, target: string, user?: string) => void;

  // Media Library
  media: MediaItem[];
  addMedia: (item: Omit<MediaItem, "id" | "uploadedAt">) => void;
  deleteMedia: (id: string) => void;

  // Site Settings
  settings: SiteSettings;
  updateSettings: (newSettings: Partial<SiteSettings>) => void;

  // Backup & Reset
  exportBackupJson: () => string;
  importBackupJson: (jsonString: string) => boolean;
  resetAllData: () => void;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

export function ArticleProvider({ children }: { children: React.ReactNode }) {
  const [articles, setArticles] = useState<Article[]>(INITIAL_ARTICLES);
  const [categories, setCategories] = useState<CategoryInfo[]>(INITIAL_CATEGORIES);
  const [theses, setTheses] = useState<Thesis[]>(INITIAL_THESES);
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [news, setNews] = useState<NewsItem[]>(INITIAL_NEWS);
  const [settings, setSettings] = useState<SiteSettings>(INITIAL_SETTINGS);
  const [users, setUsers] = useState<AdminUser[]>(INITIAL_ADMIN_USERS);
  const [logs, setLogs] = useState<ActivityLog[]>(INITIAL_ACTIVITY_LOGS);
  const [media, setMedia] = useState<MediaItem[]>(INITIAL_MEDIA);

  // Load from LocalStorage
  useEffect(() => {
    try {
      const savedArticles = localStorage.getItem("mahad_articles");
      if (savedArticles) setArticles(JSON.parse(savedArticles));

      const savedCategories = localStorage.getItem("mahad_categories");
      if (savedCategories) setCategories(JSON.parse(savedCategories));

      const savedTheses = localStorage.getItem("mahad_theses");
      if (savedTheses) setTheses(JSON.parse(savedTheses));

      const savedSubmissions = localStorage.getItem("mahad_submissions");
      if (savedSubmissions) setSubmissions(JSON.parse(savedSubmissions));

      const savedNews = localStorage.getItem("mahad_news");
      if (savedNews) setNews(JSON.parse(savedNews));

      const savedSettings = localStorage.getItem("mahad_settings");
      if (savedSettings) setSettings(JSON.parse(savedSettings));

      const savedUsers = localStorage.getItem("mahad_users");
      if (savedUsers) setUsers(JSON.parse(savedUsers));

      const savedLogs = localStorage.getItem("mahad_logs");
      if (savedLogs) setLogs(JSON.parse(savedLogs));

      const savedMedia = localStorage.getItem("mahad_media");
      if (savedMedia) setMedia(JSON.parse(savedMedia));
    } catch (err) {
      console.error("Gagal membaca LocalStorage:", err);
    }
  }, []);

  // Helper savers
  const saveArticles = (data: Article[]) => {
    setArticles(data);
    localStorage.setItem("mahad_articles", JSON.stringify(data));
  };

  const saveCategories = (data: CategoryInfo[]) => {
    setCategories(data);
    localStorage.setItem("mahad_categories", JSON.stringify(data));
  };

  const saveTheses = (data: Thesis[]) => {
    setTheses(data);
    localStorage.setItem("mahad_theses", JSON.stringify(data));
  };

  const saveSubmissions = (data: Submission[]) => {
    setSubmissions(data);
    localStorage.setItem("mahad_submissions", JSON.stringify(data));
  };

  const saveNews = (data: NewsItem[]) => {
    setNews(data);
    localStorage.setItem("mahad_news", JSON.stringify(data));
  };

  const saveSettings = (data: SiteSettings) => {
    setSettings(data);
    localStorage.setItem("mahad_settings", JSON.stringify(data));
  };

  const saveUsers = (data: AdminUser[]) => {
    setUsers(data);
    localStorage.setItem("mahad_users", JSON.stringify(data));
  };

  const saveLogs = (data: ActivityLog[]) => {
    setLogs(data);
    localStorage.setItem("mahad_logs", JSON.stringify(data));
  };

  const saveMedia = (data: MediaItem[]) => {
    setMedia(data);
    localStorage.setItem("mahad_media", JSON.stringify(data));
  };

  // Helper log
  const addLog = (action: string, target: string, user: string = "Admin") => {
    const newLog: ActivityLog = {
      id: "log-" + Date.now().toString(),
      user,
      action,
      target,
      timestamp: "Baru saja"
    };
    saveLogs([newLog, ...logs.slice(0, 19)]);
  };

  // Article Actions
  const addArticle = (data: Omit<Article, "id" | "slug">) => {
    const slugBase = data.title
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, "")
      .trim()
      .replace(/\s+/g, "-");
    const newArticle: Article = {
      ...data,
      id: "art-" + Date.now().toString(),
      slug: `${slugBase}-${Date.now().toString().slice(-4)}`,
      views: 0
    };
    saveArticles([newArticle, ...articles]);
    addLog("Menerbitkan Artikel", data.title);
  };

  const updateArticle = (id: string, updatedData: Partial<Article>) => {
    const updated = articles.map((a) => (a.id === id ? { ...a, ...updatedData } : a));
    saveArticles(updated);
    addLog("Memperbarui Artikel", updatedData.title || id);
  };

  const deleteArticle = (id: string) => {
    const target = articles.find((a) => a.id === id);
    const filtered = articles.filter((a) => a.id !== id);
    saveArticles(filtered);
    addLog("Menghapus Artikel", target?.title || id);
  };

  const incrementArticleViews = (slug: string) => {
    const updated = articles.map((a) =>
      a.slug === slug ? { ...a, views: (a.views || 0) + 1 } : a
    );
    saveArticles(updated);
  };

  // Category Actions
  const addCategory = (data: Omit<CategoryInfo, "id" | "slug">) => {
    const slug = data.name
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, "")
      .trim()
      .replace(/\s+/g, "-");
    const newCat: CategoryInfo = {
      ...data,
      id: "cat-" + Date.now().toString(),
      slug: `${slug}-${Date.now().toString().slice(-3)}`
    };
    saveCategories([...categories, newCat]);
    addLog("Menambah Kategori", data.name);
  };

  const updateCategory = (id: string, updatedData: Partial<CategoryInfo>) => {
    const updated = categories.map((c) => (c.id === id ? { ...c, ...updatedData } : c));
    saveCategories(updated);
    addLog("Memperbarui Kategori", updatedData.name || id);
  };

  const deleteCategory = (id: string) => {
    const target = categories.find((c) => c.id === id);
    const filtered = categories.filter((c) => c.id !== id);
    saveCategories(filtered);
    addLog("Menghapus Kategori", target?.name || id);
  };

  // Thesis Actions
  const addThesis = (data: Omit<Thesis, "id" | "slug">) => {
    const slugBase = data.title
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, "")
      .trim()
      .replace(/\s+/g, "-");
    const newThesis: Thesis = {
      ...data,
      id: "th-" + Date.now().toString(),
      slug: `${slugBase}-${Date.now().toString().slice(-4)}`
    };
    saveTheses([newThesis, ...theses]);
    addLog("Menambahkan Skripsi", data.title);
  };

  const updateThesis = (id: string, updatedData: Partial<Thesis>) => {
    const updated = theses.map((t) => (t.id === id ? { ...t, ...updatedData } : t));
    saveTheses(updated);
    addLog("Memperbarui Skripsi", updatedData.title || id);
  };

  const deleteThesis = (id: string) => {
    const target = theses.find((t) => t.id === id);
    const filtered = theses.filter((t) => t.id !== id);
    saveTheses(filtered);
    addLog("Menghapus Skripsi", target?.title || id);
  };

  // Submission Actions
  const addSubmission = (data: Omit<Submission, "id" | "tanggal" | "status">) => {
    const newSub: Submission = {
      ...data,
      id: "sub-" + Date.now().toString(),
      tanggal: new Date().toLocaleDateString("id-ID", {
        day: "numeric",
        month: "long",
        year: "numeric"
      }),
      status: "review"
    };
    saveSubmissions([newSub, ...submissions]);
    addLog("Naskah Masuk Baru", data.judul, data.nama);
  };

  const updateSubmissionStatus = (id: string, status: Submission["status"], reviewNote?: string) => {
    const updated = submissions.map((s) =>
      s.id === id ? { ...s, status, reviewNote: reviewNote ?? s.reviewNote } : s
    );
    saveSubmissions(updated);
    const target = submissions.find((s) => s.id === id);
    addLog(`Ubah Status Naskah (${status})`, target?.judul || id);
  };

  const deleteSubmission = (id: string) => {
    const target = submissions.find((s) => s.id === id);
    const filtered = submissions.filter((s) => s.id !== id);
    saveSubmissions(filtered);
    addLog("Menghapus Submission", target?.judul || id);
  };

  // News Actions
  const addNews = (data: Omit<NewsItem, "id" | "slug">) => {
    const slugBase = data.title
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, "")
      .trim()
      .replace(/\s+/g, "-");
    const newItem: NewsItem = {
      ...data,
      id: "news-" + Date.now().toString(),
      slug: `${slugBase}-${Date.now().toString().slice(-4)}`
    };
    saveNews([newItem, ...news]);
    addLog("Menerbitkan Berita", data.title);
  };

  const updateNews = (id: string, updatedData: Partial<NewsItem>) => {
    const updated = news.map((n) => (n.id === id ? { ...n, ...updatedData } : n));
    saveNews(updated);
    addLog("Memperbarui Berita", updatedData.title || id);
  };

  const deleteNews = (id: string) => {
    const target = news.find((n) => n.id === id);
    const filtered = news.filter((n) => n.id !== id);
    saveNews(filtered);
    addLog("Menghapus Berita", target?.title || id);
  };

  // User Actions
  const addUser = (data: Omit<AdminUser, "id">) => {
    const newUser: AdminUser = {
      ...data,
      id: "usr-" + Date.now().toString()
    };
    saveUsers([...users, newUser]);
    addLog("Menambah Pengguna Admin", data.name);
  };

  const updateUser = (id: string, updatedData: Partial<AdminUser>) => {
    const updated = users.map((u) => (u.id === id ? { ...u, ...updatedData } : u));
    saveUsers(updated);
    addLog("Memperbarui Pengguna", updatedData.name || id);
  };

  const deleteUser = (id: string) => {
    const target = users.find((u) => u.id === id);
    const filtered = users.filter((u) => u.id !== id);
    saveUsers(filtered);
    addLog("Menghapus Pengguna", target?.name || id);
  };

  // Media Actions
  const addMedia = (item: Omit<MediaItem, "id" | "uploadedAt">) => {
    const newMedia: MediaItem = {
      ...item,
      id: "med-" + Date.now().toString(),
      uploadedAt: new Date().toLocaleDateString("id-ID", {
        day: "numeric",
        month: "short",
        year: "numeric"
      })
    };
    saveMedia([newMedia, ...media]);
    addLog("Mengunggah Media", item.name);
  };

  const deleteMedia = (id: string) => {
    const target = media.find((m) => m.id === id);
    const filtered = media.filter((m) => m.id !== id);
    saveMedia(filtered);
    addLog("Menghapus Media", target?.name || id);
  };

  // Site Settings Action
  const updateSettings = (newSettings: Partial<SiteSettings>) => {
    const updated = { ...settings, ...newSettings };
    saveSettings(updated);
    addLog("Memperbarui Pengaturan Website", "Identitas & Konfigurasi");
  };

  // Export / Import Backup
  const exportBackupJson = () => {
    const fullBackup = {
      articles,
      categories,
      theses,
      submissions,
      news,
      settings,
      users,
      media,
      exportedAt: new Date().toISOString()
    };
    return JSON.stringify(fullBackup, null, 2);
  };

  const importBackupJson = (jsonString: string): boolean => {
    try {
      const data = JSON.parse(jsonString);
      if (data.articles) saveArticles(data.articles);
      if (data.categories) saveCategories(data.categories);
      if (data.theses) saveTheses(data.theses);
      if (data.submissions) saveSubmissions(data.submissions);
      if (data.news) saveNews(data.news);
      if (data.settings) saveSettings(data.settings);
      if (data.users) saveUsers(data.users);
      if (data.media) saveMedia(data.media);
      addLog("Memulihkan Data Backup", "JSON Restore");
      return true;
    } catch (e) {
      console.error("Gagal mengimpor file backup:", e);
      return false;
    }
  };

  // Reset Data
  const resetAllData = () => {
    localStorage.removeItem("mahad_articles");
    localStorage.removeItem("mahad_categories");
    localStorage.removeItem("mahad_theses");
    localStorage.removeItem("mahad_submissions");
    localStorage.removeItem("mahad_news");
    localStorage.removeItem("mahad_settings");
    localStorage.removeItem("mahad_users");
    localStorage.removeItem("mahad_logs");
    localStorage.removeItem("mahad_media");
    setArticles(INITIAL_ARTICLES);
    setCategories(INITIAL_CATEGORIES);
    setTheses(INITIAL_THESES);
    setSubmissions([]);
    setNews(INITIAL_NEWS);
    setSettings(INITIAL_SETTINGS);
    setUsers(INITIAL_ADMIN_USERS);
    setLogs(INITIAL_ACTIVITY_LOGS);
    setMedia(INITIAL_MEDIA);
  };

  return (
    <DataContext.Provider
      value={{
        articles,
        addArticle,
        updateArticle,
        deleteArticle,
        incrementArticleViews,
        categories,
        addCategory,
        updateCategory,
        deleteCategory,
        theses,
        addThesis,
        updateThesis,
        deleteThesis,
        submissions,
        addSubmission,
        updateSubmissionStatus,
        deleteSubmission,
        news,
        addNews,
        updateNews,
        deleteNews,
        users,
        addUser,
        updateUser,
        deleteUser,
        logs,
        addLog,
        media,
        addMedia,
        deleteMedia,
        settings,
        updateSettings,
        exportBackupJson,
        importBackupJson,
        resetAllData
      }}
    >
      {children}
    </DataContext.Provider>
  );
}

export function useArticles() {
  const context = useContext(DataContext);
  if (!context) {
    throw new Error("useArticles harus digunakan di dalam ArticleProvider");
  }
  return context;
}
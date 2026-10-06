"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { Article, CategoryInfo, Thesis, Submission, NewsItem, SiteSettings } from "@/lib/types";
import {
  INITIAL_ARTICLES,
  INITIAL_CATEGORIES,
  INITIAL_THESES,
  INITIAL_NEWS,
  INITIAL_SETTINGS
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

  // Site Settings
  settings: SiteSettings;
  updateSettings: (newSettings: Partial<SiteSettings>) => void;

  // Reset to default data
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
  };

  const updateArticle = (id: string, updatedData: Partial<Article>) => {
    const updated = articles.map((a) => (a.id === id ? { ...a, ...updatedData } : a));
    saveArticles(updated);
  };

  const deleteArticle = (id: string) => {
    const filtered = articles.filter((a) => a.id !== id);
    saveArticles(filtered);
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
  };

  const updateCategory = (id: string, updatedData: Partial<CategoryInfo>) => {
    const updated = categories.map((c) => (c.id === id ? { ...c, ...updatedData } : c));
    saveCategories(updated);
  };

  const deleteCategory = (id: string) => {
    const filtered = categories.filter((c) => c.id !== id);
    saveCategories(filtered);
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
  };

  const updateThesis = (id: string, updatedData: Partial<Thesis>) => {
    const updated = theses.map((t) => (t.id === id ? { ...t, ...updatedData } : t));
    saveTheses(updated);
  };

  const deleteThesis = (id: string) => {
    const filtered = theses.filter((t) => t.id !== id);
    saveTheses(filtered);
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
  };

  const updateSubmissionStatus = (id: string, status: Submission["status"], reviewNote?: string) => {
    const updated = submissions.map((s) =>
      s.id === id ? { ...s, status, reviewNote: reviewNote ?? s.reviewNote } : s
    );
    saveSubmissions(updated);
  };

  const deleteSubmission = (id: string) => {
    const filtered = submissions.filter((s) => s.id !== id);
    saveSubmissions(filtered);
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
  };

  const updateNews = (id: string, updatedData: Partial<NewsItem>) => {
    const updated = news.map((n) => (n.id === id ? { ...n, ...updatedData } : n));
    saveNews(updated);
  };

  const deleteNews = (id: string) => {
    const filtered = news.filter((n) => n.id !== id);
    saveNews(filtered);
  };

  // Site Settings Action
  const updateSettings = (newSettings: Partial<SiteSettings>) => {
    const updated = { ...settings, ...newSettings };
    saveSettings(updated);
  };

  // Reset Data
  const resetAllData = () => {
    localStorage.removeItem("mahad_articles");
    localStorage.removeItem("mahad_categories");
    localStorage.removeItem("mahad_theses");
    localStorage.removeItem("mahad_submissions");
    localStorage.removeItem("mahad_news");
    localStorage.removeItem("mahad_settings");
    setArticles(INITIAL_ARTICLES);
    setCategories(INITIAL_CATEGORIES);
    setTheses(INITIAL_THESES);
    setSubmissions([]);
    setNews(INITIAL_NEWS);
    setSettings(INITIAL_SETTINGS);
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
        settings,
        updateSettings,
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
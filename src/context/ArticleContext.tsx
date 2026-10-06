"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { Article } from "@/lib/types";
import { ARTICLES as INITIAL_ARTICLES } from "@/lib/mock-data";

export interface Submission {
  id: string;
  nama: string;
  kategori: string;
  afiliasi: string;
  judul: string;
  abstrak: string;
  tanggal: string;
}

interface ArticleContextType {
  articles: Article[];
  submissions: Submission[];
  addArticle: (article: Omit<Article, "id" | "slug">) => void;
  updateArticle: (id: string, updatedData: Partial<Article>) => void;
  deleteArticle: (id: string) => void;
  addSubmission: (submission: Omit<Submission, "id" | "tanggal">) => void;
  deleteSubmission: (id: string) => void;
}

const ArticleContext = createContext<ArticleContextType | undefined>(undefined);

export function ArticleProvider({ children }: { children: React.ReactNode }) {
  const [articles, setArticles] = useState<Article[]>(INITIAL_ARTICLES);
  const [submissions, setSubmissions] = useState<Submission[]>([]);

  // Muat data tersimpan dari browser (LocalStorage) saat pertama kali buka
  useEffect(() => {
    const savedArticles = localStorage.getItem("mahad_articles_data");
    const savedSubmissions = localStorage.getItem("mahad_submissions_data");

    if (savedArticles) {
      try {
        setArticles(JSON.parse(savedArticles));
      } catch (e) {
        console.error("Gagal memuat artikel tersimpan", e);
      }
    }

    if (savedSubmissions) {
      try {
        setSubmissions(JSON.parse(savedSubmissions));
      } catch (e) {
        console.error("Gagal memuat kiriman naskah tersimpan", e);
      }
    }
  }, []);

  // Simpan otomatis ke memori browser setiap ada perubahan
  const saveArticles = (newArticles: Article[]) => {
    setArticles(newArticles);
    localStorage.setItem("mahad_articles_data", JSON.stringify(newArticles));
  };

  const saveSubmissions = (newSubmissions: Submission[]) => {
    setSubmissions(newSubmissions);
    localStorage.setItem("mahad_submissions_data", JSON.stringify(newSubmissions));
  };

  // 1. Tambah Artikel Baru dari Admin
  const addArticle = (data: Omit<Article, "id" | "slug">) => {
    const slug = data.title
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, "")
      .trim()
      .replace(/\s+/g, "-");

    const newArticle: Article = {
      ...data,
      id: Date.now().toString(),
      slug: `${slug}-${Date.now().toString().slice(-4)}`,
    };

    saveArticles([newArticle, ...articles]);
  };

  // 2. Edit Artikel dari Admin
  const updateArticle = (id: string, updatedData: Partial<Article>) => {
    const updated = articles.map((art) =>
      art.id === id ? { ...art, ...updatedData } : art
    );
    saveArticles(updated);
  };

  // 3. Hapus Artikel dari Admin
  const deleteArticle = (id: string) => {
    const filtered = articles.filter((art) => art.id !== id);
    saveArticles(filtered);
  };

  // 4. Tambah Naskah Masuk dari Form Santri
  const addSubmission = (data: Omit<Submission, "id" | "tanggal">) => {
    const newSub: Submission = {
      ...data,
      id: Date.now().toString(),
      tanggal: new Date().toLocaleDateString("id-ID", {
        day: "numeric",
        month: "long",
        year: "numeric",
      }),
    };
    saveSubmissions([newSub, ...submissions]);
  };

  // 5. Hapus Naskah Masuk
  const deleteSubmission = (id: string) => {
    const filtered = submissions.filter((s) => s.id !== id);
    saveSubmissions(filtered);
  };

  return (
    <ArticleContext.Provider
      value={{
        articles,
        submissions,
        addArticle,
        updateArticle,
        deleteArticle,
        addSubmission,
        deleteSubmission,
      }}
    >
      {children}
    </ArticleContext.Provider>
  );
}

export function useArticles() {
  const context = useContext(ArticleContext);
  if (!context) {
    throw new Error("useArticles harus digunakan di dalam ArticleProvider");
  }
  return context;
}
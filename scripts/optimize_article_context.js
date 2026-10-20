const fs = require('fs');
const path = require('path');

const ctxPath = path.join(__dirname, '..', 'src', 'context', 'ArticleContext.tsx');
let content = fs.readFileSync(ctxPath, 'utf8');

const isCRLF = content.includes('\r\n');
content = content.replace(/\r\n/g, '\n');

// Find start of useEffect
const startToken = '  // Load from Supabase + LocalStorage fallback\n  useEffect(() => {';
const startIndex = content.indexOf(startToken);
if (startIndex === -1) {
  console.error('Could not find startToken');
  process.exit(1);
}

// Find where fetchFromSupabase ends
const fetchEndToken = '      } catch (err) {\n        console.error("Gagal sinkronisasi data Supabase:", err);\n      }\n    }\n\n    fetchFromSupabase();\n  }, []);';
const fetchEndIndex = content.indexOf(fetchEndToken);
if (fetchEndIndex === -1) {
  console.error('Could not find fetchEndToken');
  process.exit(1);
}

const replacement = `  // Load from Supabase + LocalStorage fallback
  useEffect(() => {
    // 0. Cache Invalidation: Hapus semua cache browser lama agar tidak pernah memunculkan data usang (anti-flicker)
    try {
      const CURRENT_CACHE_VERSION = "2026-10-20-v5-real-sync";
      const storedVersion = localStorage.getItem("mahad_cache_version");
      if (storedVersion !== CURRENT_CACHE_VERSION) {
        [
          "mahad_settings",
          "mahad_dema_settings",
          "mahad_hero_settings",
          "mahad_home_sections",
          "mahad_articles",
          "mahad_categories",
          "mahad_theses",
          "mahad_about_page_content",
          "mahad_page_texts",
          "mahad_navbar_settings",
          "mahad_footer_settings",
          "mahad_lecturers",
          "mahad_facilities",
          "mahad_courses"
        ].forEach((k) => localStorage.removeItem(k));
        localStorage.setItem("mahad_cache_version", CURRENT_CACHE_VERSION);
      }

      // Pastikan dema_settings lokal langsung selaras dengan 24 anggota asli
      const savedDema = localStorage.getItem("mahad_dema_settings");
      if (savedDema) {
        try {
          const parsedDema = JSON.parse(savedDema);
          const hasRealData = Array.isArray(parsedDema?.members) &&
            parsedDema.members.length >= 20 &&
            parsedDema.members.some((m: any) => m.name === "IMRAN");
          if (hasRealData) {
            setDemaSettings(parsedDema);
          } else {
            localStorage.setItem("mahad_dema_settings", JSON.stringify(INITIAL_DEMA_SETTINGS));
            setDemaSettings(INITIAL_DEMA_SETTINGS);
          }
        } catch {
          localStorage.setItem("mahad_dema_settings", JSON.stringify(INITIAL_DEMA_SETTINGS));
          setDemaSettings(INITIAL_DEMA_SETTINGS);
        }
      } else {
        localStorage.setItem("mahad_dema_settings", JSON.stringify(INITIAL_DEMA_SETTINGS));
        setDemaSettings(INITIAL_DEMA_SETTINGS);
      }

      const savedLogs = localStorage.getItem("mahad_logs");
      if (savedLogs) setLogs(JSON.parse(savedLogs));
    } catch (e) {
      console.warn("LocalStorage check notice:", e);
    }

    // 2. Fetch live data from Supabase in PARALLEL (100% cepat tanpa ngelag atau tunggu sekuensial)
    async function fetchFromSupabase() {
      try {
        const [
          articlesRes,
          thesesRes,
          categoriesRes,
          footerRes,
          collectionsRes,
          settingsRes,
          newsRes,
          mediaRes,
          submissionsRes,
          headerRes,
          heroRes,
          homeSectionsRes,
          emailTemplatesRes,
          aboutRes,
          pageTextsRes,
          demaRes,
          securityRes
        ] = await Promise.allSettled([
          supabase.from("articles").select("*").order("created_at", { ascending: false }),
          supabase.from("theses").select("*").order("created_at", { ascending: false }),
          supabase.from("categories").select("*").order("urutan", { ascending: true }),
          supabase.from("site_content").select("value").eq("key", "footer").single(),
          supabase.from("collections").select("*").order("order_index", { ascending: true }),
          supabase.from("site_content").select("value").eq("key", "site_settings").single(),
          supabase.from("news").select("*").order("created_at", { ascending: false }),
          supabase.from("media").select("*").order("created_at", { ascending: false }),
          supabase.from("submissions").select("*").order("created_at", { ascending: false }),
          supabase.from("site_content").select("value").eq("key", "header").single(),
          supabase.from("site_content").select("value").eq("key", "home.hero").single(),
          supabase.from("site_content").select("value").eq("key", "home_sections").single(),
          supabase.from("site_content").select("value").eq("key", "email_templates").single(),
          supabase.from("site_content").select("value").eq("key", "about_page").single(),
          supabase.from("site_content").select("value").eq("key", "page_texts").single(),
          supabase.from("site_content").select("value").eq("key", "dema_settings").single(),
          supabase.from("site_content").select("value").eq("key", "security_threats").single()
        ]);

        // Process Articles
        if (articlesRes.status === "fulfilled") {
          const dbArticles = (articlesRes.value as any)?.data;
          if (Array.isArray(dbArticles) && dbArticles.length > 0) {
            const mappedArticles: Article[] = dbArticles.map((a: any) => ({
              id: a.id,
              slug: a.slug,
              title: a.title,
              excerpt: a.excerpt || "",
              content: a.content,
              author: a.author_name || "Redaksi",
              authorRole: a.author_role || "Mahasantri Marhalah Ula",
              authorBio: "",
              category: a.category_id || "fiqh-muamalah-kontemporer",
              categoryLabel: "Fiqh Mu'asarah",
              date: new Date(a.created_at).toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" }),
              hijriDate: "1448 H",
              readTime: "5 menit",
              views: a.views || 0,
              tags: a.tags || []
            }));
            setArticles(mappedArticles);
          }
        }

        // Process Theses
        if (thesesRes.status === "fulfilled") {
          const dbTheses = (thesesRes.value as any)?.data;
          if (Array.isArray(dbTheses) && dbTheses.length > 0) {
            const mappedTheses: Thesis[] = dbTheses.map((t: any) => ({
              id: t.id,
              slug: t.slug,
              title: t.judul,
              author: t.penulis,
              nim: t.nim,
              angkatan: t.angkatan,
              year: t.tahun,
              advisor1: t.pembimbing_1,
              advisor2: t.pembimbing_2,
              abstractId: t.abstrak_id || "",
              abstractAr: t.abstrak_ar || "",
              keywords: t.keyword || [],
              category: "Fiqh Mu'asarah",
              categoryLabel: "Fiqh Mu'asarah",
              downloadUrl: t.pdf_url || "",
              fileSize: t.pdf_size_mb || "3.5 MB"
            }));
            setTheses(mappedTheses);
          }
        }

        // Process Categories
        if (categoriesRes.status === "fulfilled") {
          const dbCategories = (categoriesRes.value as any)?.data;
          if (Array.isArray(dbCategories) && dbCategories.length > 0) {
            setCategories(
              dbCategories.map((c: any) => {
                const isOpini =
                  c.type === "opini" ||
                  c.slug?.startsWith("opini-") ||
                  c.slug?.startsWith("refleksi-") ||
                  c.slug?.startsWith("kolom-") ||
                  c.slug?.startsWith("sosial-");
                return {
                  id: c.id,
                  slug: c.slug,
                  name: c.nama,
                  description: c.deskripsi || "",
                  iconName: c.icon || "book",
                  type: isOpini ? ("opini" as const) : ("artikel" as const)
                };
              })
            );
          }
        }

        // Process Footer
        if (footerRes.status === "fulfilled") {
          const val = (footerRes.value as any)?.data?.value;
          if (val) setFooterSettings((prev) => ({ ...prev, ...val }));
        }

        // Process Masyayikh & Sarana from collections
        if (collectionsRes.status === "fulfilled") {
          const dbCollections = (collectionsRes.value as any)?.data;
          if (Array.isArray(dbCollections) && dbCollections.length > 0) {
            const dbLecturers = dbCollections
              .filter((c: any) => c.collection_type === "masyayikh")
              .map((c: any, idx: number) => ({
                id: c.id,
                name: c.data?.name || "Nama Dosen",
                title: c.data?.title || "",
                role: c.data?.role || "Dosen Pengampu",
                photoUrl: c.data?.photoUrl || "",
                expertise: c.data?.expertise || "",
                education: Array.isArray(c.data?.education)
                  ? c.data.education
                  : typeof c.data?.education === "string" && c.data.education.trim().length > 0
                  ? c.data.education.split("•").map((s: string) => s.trim()).filter(Boolean)
                  : [],
                publications: Array.isArray(c.data?.publications)
                  ? c.data.publications
                  : typeof c.data?.publications === "string" && c.data.publications.trim().length > 0
                  ? c.data.publications.split("•").map((s: string) => s.trim()).filter(Boolean)
                  : [],
                order: idx + 1,
                isActive: c.data?.isActive !== false
              }));
            if (dbLecturers.length > 0) setLecturers(dbLecturers);

            const dbFacilities = dbCollections
              .filter((c: any) => c.collection_type === "sarana")
              .map((c: any) => ({
                id: c.id,
                name: c.data?.name || "Nama Fasilitas",
                category: c.data?.category || "Masjid",
                photoUrl: c.data?.photoUrl || "",
                description: c.data?.description || "",
                capacity: c.data?.capacity,
                specs: c.data?.specs
              }));
            if (dbFacilities.length > 0) setFacilities(dbFacilities);
          }
        }

        // Process Site Settings
        if (settingsRes.status === "fulfilled") {
          const val = (settingsRes.value as any)?.data?.value;
          if (val) setSettings((prev) => ({ ...prev, ...val }));
        }

        // Process News
        if (newsRes.status === "fulfilled") {
          const dbNews = (newsRes.value as any)?.data;
          if (Array.isArray(dbNews) && dbNews.length > 0) {
            setNews(
              dbNews.map((n: any) => ({
                id: n.id,
                slug: n.slug,
                title: n.judul,
                excerpt: n.konten?.slice(0, 120) + "...",
                content: n.konten,
                category: n.tipe || "Berita",
                author: "Humas Ma'had Aly",
                date: n.tanggal || new Date(n.created_at).toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" }),
                imageUrl: n.gambar_url
              }))
            );
          }
        }

        // Process Media
        if (mediaRes.status === "fulfilled") {
          const dbMedia = (mediaRes.value as any)?.data;
          if (Array.isArray(dbMedia) && dbMedia.length > 0) {
            setMedia(
              dbMedia.map((m: any) => ({
                id: m.id,
                name: m.filename,
                url: m.url,
                size: m.size_kb > 1024 ? \`\${(m.size_kb / 1024).toFixed(1)} MB\` : \`\${m.size_kb} KB\`,
                type: m.mime_type?.startsWith("image/") ? "image" : (m.mime_type?.includes("pdf") ? "pdf" : "document"),
                uploadedAt: new Date(m.created_at).toLocaleDateString("id-ID", {
                  day: "numeric",
                  month: "short",
                  year: "numeric"
                })
              }))
            );
          }
        }

        // Process Submissions
        if (submissionsRes.status === "fulfilled") {
          const dbSubmissions = (submissionsRes.value as any)?.data;
          if (Array.isArray(dbSubmissions) && dbSubmissions.length > 0) {
            const mappedSubmissions: Submission[] = dbSubmissions.map((s: any) => {
              let extraMeta: any = {};
              if (s.catatan_admin) {
                try {
                  extraMeta = JSON.parse(s.catatan_admin);
                } catch {
                  extraMeta = { feedback: s.catatan_admin };
                }
              }
              return {
                id: s.id,
                trackingCode: extraMeta.trackingCode || \`MAD-\${new Date(s.created_at).getFullYear()}-\${s.id.slice(0, 4)}\`,
                nama: s.nama,
                email: s.email,
                hp: extraMeta.hp || "",
                afiliasi: s.afiliasi || "",
                tipeNaskah: extraMeta.tipeNaskah || "Artikel Fikih Kontemporer",
                judul: s.judul,
                kategori: s.kategori_id || "Fiqh Mu'asarah",
                abstrak: s.abstrak,
                keyword: s.keyword || [],
                fileUrl: s.file_url || "",
                fileNama: extraMeta.fileNama || "Naskah.pdf",
                fileUkuran: extraMeta.fileUkuran || "1.2 MB",
                tanggal: new Date(s.created_at).toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" }),
                status: (s.status as any) || "review",
                reviewNote: extraMeta.feedback || s.catatan_admin || "",
                feedback: extraMeta.feedback || "",
                timeline: extraMeta.timeline || [
                  { status: "submitted", label: "Naskah Dikirim", timestamp: new Date(s.created_at).toISOString(), notes: "Naskah berhasil diterima oleh sistem" }
                ]
              };
            });
            setSubmissions(mappedSubmissions);
          }
        }

        // Process Header
        if (headerRes.status === "fulfilled") {
          const val = (headerRes.value as any)?.data?.value;
          if (val) {
            setNavbarSettings((prev) => {
              const next = { ...prev, ...val };
              if (Array.isArray(next.navLinks)) {
                next.navLinks = next.navLinks
                  .filter((l: any) => !(l.url === "/kirim-tulisan" && l.label?.toLowerCase().includes("kirim tulisan")))
                  .map((l: any) => {
                    if (l.url === "/dema" || l.label?.toLowerCase().includes("dema") || l.label?.toLowerCase().includes("dewan mahasantri")) {
                      return { ...l, label: "DeMa", url: "/dema" };
                    }
                    return l;
                  });

                if (!next.navLinks.some((l: any) => l.url === "/donasi")) {
                  next.navLinks.push({ id: "nav-donasi", label: "Infaq & Donasi", url: "/donasi", order: 7, isActive: true });
                }
                if (!next.navLinks.some((l: any) => l.url === "/dema")) {
                  next.navLinks.push({ id: "nav-8", label: "DeMa", url: "/dema", order: 8, isActive: true });
                }
              }
              return next;
            });
          }
        }

        // Process Hero
        if (heroRes.status === "fulfilled") {
          const val = (heroRes.value as any)?.data?.value;
          if (val) setHeroSettings((prev) => ({ ...prev, ...val }));
        }

        // Process Home Sections
        if (homeSectionsRes.status === "fulfilled") {
          const val = (homeSectionsRes.value as any)?.data?.value;
          if (Array.isArray(val)) setHomeSections(val);
        }

        // Process Email Templates
        if (emailTemplatesRes.status === "fulfilled") {
          const val = (emailTemplatesRes.value as any)?.data?.value;
          if (Array.isArray(val)) setEmailTemplates(val);
        }

        // Process About Page
        if (aboutRes.status === "fulfilled") {
          const val = (aboutRes.value as any)?.data?.value;
          if (val) setAboutPageContent((prev) => ({ ...prev, ...val }));
        }

        // Process Page Texts
        if (pageTextsRes.status === "fulfilled") {
          const val = (pageTextsRes.value as any)?.data?.value;
          if (val) setPageTexts((prev) => ({ ...prev, ...val }));
        }

        // Process DeMa Settings
        if (demaRes.status === "fulfilled") {
          const val = (demaRes.value as any)?.data?.value;
          if (val) {
            setDemaSettings((prev) => {
              const dbMembers = Array.isArray(val.members) ? val.members : [];
              const localMembers = Array.isArray(prev.members) ? prev.members : [];
              const safeMembers = dbMembers.length > 0 ? dbMembers : (localMembers.length > 0 ? localMembers : []);
              const merged = { ...prev, ...val, members: safeMembers };
              try {
                localStorage.setItem("mahad_dema_settings", JSON.stringify(merged));
              } catch (e) {}
              return merged;
            });
          }
        }

        // Process Security Threats
        if (securityRes.status === "fulfilled") {
          const val = (securityRes.value as any)?.data?.value;
          if (Array.isArray(val)) {
            const SEVEN_DAYS_MS = 7 * 24 * 60 * 60 * 1000;
            const nowMs = Date.now();
            const freshLogs = val.filter((item: any) => {
              if (!item.createdAt) return true;
              return nowMs - new Date(item.createdAt).getTime() < SEVEN_DAYS_MS;
            });
            setSecurityThreats(freshLogs);
          }
        }
      } catch (err) {
        console.error("Gagal sinkronisasi data Supabase:", err);
      }
    }

    fetchFromSupabase();
  }, []);`;

content = content.slice(0, startIndex) + replacement + content.slice(fetchEndIndex + fetchEndToken.length);

if (isCRLF) {
  content = content.replace(/\n/g, '\r\n');
}

fs.writeFileSync(ctxPath, content, 'utf8');
console.log('Successfully updated ArticleContext.tsx with type-safe parallel fetches!');

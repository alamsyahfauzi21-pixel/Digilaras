import express from "express";
import path from "path";
import fs from "fs";
import { createServer as createViteServer } from "vite";

const app = express();
const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;
const DATA_DIR = path.join(process.cwd(), "data");
const ARTICLES_FILE = path.join(DATA_DIR, "articles.json");

// Ensure data folder and file exist
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

// Helper to load articles
function getArticles() {
  try {
    if (fs.existsSync(ARTICLES_FILE)) {
      const data = fs.readFileSync(ARTICLES_FILE, "utf-8");
      return JSON.parse(data);
    }
  } catch (err) {
    console.error("Error reading articles file:", err);
  }
  return [];
}

// Helper to save articles
function saveArticles(articles: any[]) {
  try {
    fs.writeFileSync(ARTICLES_FILE, JSON.stringify(articles, null, 2), "utf-8");
    regenerateSitemap(articles);
    return true;
  } catch (err) {
    console.error("Error writing articles file:", err);
    return false;
  }
}

// Helper to format date in Indonesian format
function formatIndonesianDate(dateStr: string) {
  try {
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return dateStr;
    return d.toLocaleDateString("id-ID", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  } catch {
    return dateStr;
  }
}

// Function to automatically regenerate the sitemap.xml
function regenerateSitemap(articles: any[]) {
  const dateStr = new Date().toISOString().split("T")[0];
  const sitemapXml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <!-- Home Page -->
  <url>
    <loc>https://digilaras.com/</loc>
    <lastmod>${dateStr}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>1.0</priority>
  </url>
  
  <!-- About Page -->
  <url>
    <loc>https://digilaras.com/about/</loc>
    <lastmod>${dateStr}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.8</priority>
  </url>

  <!-- Portfolio Page -->
  <url>
    <loc>https://digilaras.com/portfolio/</loc>
    <lastmod>${dateStr}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.8</priority>
  </url>

  <!-- Layanan: Google Ads -->
  <url>
    <loc>https://digilaras.com/layanan/google-ads/</loc>
    <lastmod>${dateStr}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.7</priority>
  </url>

  <!-- Layanan: Meta Ads -->
  <url>
    <loc>https://digilaras.com/layanan/meta-ads/</loc>
    <lastmod>${dateStr}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.7</priority>
  </url>

  <!-- Layanan: Pembuatan Website -->
  <url>
    <loc>https://digilaras.com/layanan/pembuatan-website/</loc>
    <lastmod>${dateStr}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.7</priority>
  </url>

  <!-- Layanan: Social Media Management -->
  <url>
    <loc>https://digilaras.com/layanan/social-media-management/</loc>
    <lastmod>${dateStr}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.7</priority>
  </url>

  <!-- Contact Page -->
  <url>
    <loc>https://digilaras.com/contact/</loc>
    <lastmod>${dateStr}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.8</priority>
  </url>
${articles
  .map(
    (article) => `
  <!-- Article: ${article.title} -->
  <url>
    <loc>https://digilaras.com/artikel/${article.slug}</loc>
    <lastmod>${article.date || dateStr}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.6</priority>
  </url>`
  )
  .join("")}
</urlset>`;

  try {
    const devSitemapPath = path.join(process.cwd(), "public_html", "public", "sitemap.xml");
    fs.writeFileSync(devSitemapPath, sitemapXml, "utf-8");

    if (process.env.NODE_ENV === "production") {
      const prodSitemapPath = path.join(process.cwd(), "dist", "sitemap.xml");
      if (fs.existsSync(path.dirname(prodSitemapPath))) {
        fs.writeFileSync(prodSitemapPath, sitemapXml, "utf-8");
      }
    }
    console.log("Sitemap successfully regenerated with", articles.length, "articles.");
  } catch (err) {
    console.error("Failed to regenerate sitemap:", err);
  }
}

// Middleware
app.use(express.json());

// API Routes
app.get("/api/articles", (req, res) => {
  res.json(getArticles());
});

app.get("/api/articles/:slug", (req, res) => {
  const articles = getArticles();
  const article = articles.find((a: any) => a.slug === req.params.slug);
  if (!article) {
    return res.status(404).json({ error: "Article not found" });
  }
  res.json(article);
});

app.post("/api/articles", (req, res) => {
  const { title, slug, category, author, date, coverImage, description, content, passcode } = req.body;

  // Simple passkey validation
  const correctPasscode = process.env.ADMIN_PASSCODE || "digilaras2026";
  if (passcode !== correctPasscode) {
    return res.status(403).json({ error: "Sandi admin salah (unauthorized)." });
  }

  if (!title || !slug || !category || !author || !date || !description || !content) {
    return res.status(400).json({ error: "Semua kolom bertanda bintang (*) wajib diisi." });
  }

  const articles = getArticles();
  
  // Check duplicate slug
  if (articles.some((a: any) => a.slug === slug)) {
    return res.status(400).json({ error: "Slug URL sudah digunakan oleh artikel lain." });
  }

  const newArticle = {
    title,
    slug,
    category,
    author,
    date,
    coverImage: coverImage || "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800",
    description,
    content,
  };

  articles.unshift(newArticle); // Put newest first
  if (saveArticles(articles)) {
    res.status(201).json(newArticle);
  } else {
    res.status(500).json({ error: "Gagal menyimpan artikel ke server." });
  }
});

app.delete("/api/articles/:slug", (req, res) => {
  const { passcode } = req.body;
  const correctPasscode = process.env.ADMIN_PASSCODE || "digilaras2026";
  if (passcode !== correctPasscode) {
    return res.status(403).json({ error: "Sandi admin salah (unauthorized)." });
  }

  let articles = getArticles();
  const index = articles.findIndex((a: any) => a.slug === req.params.slug);
  if (index === -1) {
    return res.status(404).json({ error: "Artikel tidak ditemukan." });
  }

  articles.splice(index, 1);
  if (saveArticles(articles)) {
    res.json({ message: "Artikel berhasil dihapus." });
  } else {
    res.status(500).json({ error: "Gagal memperbarui database server." });
  }
});

// Setup dev server or static router
async function start() {
  let viteInstance: any = null;

  // Regenerate sitemap initially on startup
  regenerateSitemap(getArticles());

  // Pre-render middleware for Articles Listing (SEO crawler friendly)
  app.get(["/artikel", "/artikel/"], async (req, res, next) => {
    try {
      const templatePath = process.env.NODE_ENV === "production"
        ? path.join(process.cwd(), "dist", "artikel", "index.html")
        : path.join(process.cwd(), "public_html", "artikel", "index.html");

      if (!fs.existsSync(templatePath)) {
        return next();
      }

      let html = fs.readFileSync(templatePath, "utf-8");

      // Load articles to pre-render
      const articles = getArticles();
      const articlesHtml = articles
        .map((article: any) => {
          return `
            <article class="bg-agency-950/60 border border-white/10 rounded-2xl overflow-hidden hover:border-agency-500/40 group hover:shadow-card transition-all duration-300 flex flex-col h-full" id="article-${article.slug}">
              <div class="relative overflow-hidden aspect-video">
                <img src="${article.coverImage}" alt="${article.title}" class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" loading="lazy" referrerPolicy="no-referrer">
                <span class="absolute top-4 left-4 bg-agency-600 text-white text-xs font-extrabold uppercase px-3 py-1.5 rounded-full tracking-wider z-10">
                  ${article.category}
                </span>
              </div>
              <div class="p-6 flex flex-col flex-grow">
                <div class="flex items-center gap-4 text-xs text-slate-400 mb-3 uppercase tracking-wider font-semibold">
                  <span><i class="fa-regular fa-calendar-days text-agency-500 mr-1.5"></i>${formatIndonesianDate(article.date)}</span>
                  <span><i class="fa-regular fa-user text-agency-500 mr-1.5"></i>${article.author}</span>
                </div>
                <h3 class="text-xl font-bold text-white mb-3 group-hover:text-agency-500 transition-colors uppercase tracking-tight">
                  <a href="/artikel/${article.slug}" class="outline-none">${article.title}</a>
                </h3>
                <p class="text-slate-300 text-sm leading-relaxed mb-6 flex-grow line-clamp-3">
                  ${article.description}
                </p>
                <div class="mt-auto">
                  <a href="/artikel/${article.slug}" class="inline-flex items-center text-sm font-extrabold text-agency-500 group-hover:translate-x-1.5 transition-transform uppercase tracking-wider gap-2 outline-none">
                    Baca Selengkapnya <i class="fa-solid fa-arrow-right-long"></i>
                  </a>
                </div>
              </div>
            </article>`;
        })
        .join("");

      // Replace loading indicator / default grid layout with pre-rendered articles
      const targetPlaceholder = `<!-- ARTICLES_LIST -->`;
      if (html.includes(targetPlaceholder)) {
        html = html.replace(targetPlaceholder, articlesHtml);
      }

      if (process.env.NODE_ENV !== "production" && viteInstance) {
        html = await viteInstance.transformIndexHtml(req.originalUrl, html);
      }

      res.setHeader("Content-Type", "text/html");
      return res.status(200).send(html);
    } catch (err) {
      console.error("Error pre-rendering articles index page:", err);
      next();
    }
  });

  // Dynamic SSR Router for reading articles (Perfect SEO & AI crawling)
  app.get("/artikel/:slug", async (req, res, next) => {
    const slug = req.params.slug;

    // Skip static files in the directory
    if (slug === "index.html" || slug === "admin.html" || slug === "baca.html") {
      return next();
    }

    const articles = getArticles();
    const article = articles.find((a: any) => a.slug === slug);

    if (!article) {
      // Send a professional 404 page
      return res.status(404).send(`
        <!DOCTYPE html>
        <html lang="id">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Artikel Tidak Ditemukan | DIGILARAS</title>
            <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">
            <link rel="stylesheet" href="/assets/css/style.css">
        </head>
        <body class="bg-agency-950 text-slate-300 antialiased h-screen flex flex-col justify-center items-center px-4">
            <div class="text-center max-w-md">
                <i class="fa-regular fa-face-frown text-6xl text-agency-500 mb-6"></i>
                <h1 class="text-3xl font-black text-white uppercase tracking-tight mb-4">Artikel Tidak Ditemukan</h1>
                <p class="text-slate-400 mb-8">Maaf, artikel yang Anda cari tidak tersedia atau telah dihapus oleh tim admin.</p>
                <a href="/artikel/" class="inline-flex items-center justify-center px-6 py-3 bg-agency-600 hover:bg-agency-500 text-white hover:text-agency-950 font-bold rounded-full transition-all uppercase tracking-widest text-sm shadow-glow">
                    <i class="fa-solid fa-arrow-left mr-2"></i> Kembali ke Artikel
                </a>
            </div>
        </body>
        </html>
      `);
    }

    try {
      const templatePath = process.env.NODE_ENV === "production"
        ? path.join(process.cwd(), "dist", "artikel", "baca.html")
        : path.join(process.cwd(), "public_html", "artikel", "baca.html");

      if (!fs.existsSync(templatePath)) {
        return res.status(500).send("Reading template is missing.");
      }

      let html = fs.readFileSync(templatePath, "utf-8");

      // Replace placeholders
      html = html
        .replace(/{{TITLE}}/g, article.title)
        .replace(/{{DESCRIPTION}}/g, article.description)
        .replace(/{{COVER_IMAGE}}/g, article.coverImage)
        .replace(/{{CATEGORY}}/g, article.category)
        .replace(/{{DATE}}/g, article.date)
        .replace(/{{SLUG}}/g, article.slug)
        .replace(/{{AUTHOR}}/g, article.author)
        .replace(/{{FORMATTED_DATE}}/g, formatIndonesianDate(article.date))
        .replace(/{{CONTENT}}/g, article.content);

      if (process.env.NODE_ENV !== "production" && viteInstance) {
        html = await viteInstance.transformIndexHtml(req.originalUrl, html);
      }

      res.setHeader("Content-Type", "text/html");
      return res.status(200).send(html);
    } catch (err) {
      console.error("Error pre-rendering article page:", err);
      return res.status(500).send("Error rendering the article page.");
    }
  });

  // Load Vite Dev Server in Development
  if (process.env.NODE_ENV !== "production") {
    viteInstance = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa", // Let Vite handle serving index files and layouts
    });
    app.use(viteInstance.middlewares);
    console.log("Vite development middleware loaded.");
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
    console.log("Serving production files from /dist.");
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running at http://0.0.0.0:${PORT} in ${process.env.NODE_ENV || 'development'} mode`);
  });
}

start();

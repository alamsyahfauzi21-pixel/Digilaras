<?php
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, POST, DELETE, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

// Adjust database path. Since 'data' is usually uploaded parallel to public_html or inside it.
// We will look for data/articles.json first in ../data/ (safer, above public root) and fallback to ./data/
$db_dir_above = dirname(__DIR__) . '/data';
$db_dir_inside = __DIR__ . '/data';

if (is_dir($db_dir_above)) {
    $data_dir = $db_dir_above;
} else {
    $data_dir = $db_dir_inside;
}

if (!is_dir($data_dir)) {
    mkdir($data_dir, 0755, true);
}

$articles_file = $data_dir . '/articles.json';

// Helper to read articles
function get_articles($file) {
    if (file_exists($file)) {
        $content = file_get_contents($file);
        $data = json_decode($content, true);
        if (is_array($data)) {
            return $data;
        }
    }
    return [];
}

// Helper to save articles
function save_articles($file, $articles) {
    $result = file_put_contents($file, json_encode($articles, JSON_PRETTY_PRINT | JSON_UNESCAPED_SLASHES));
    if ($result !== false) {
        regenerate_sitemap($articles);
        return true;
    }
    return false;
}

// Helper to format date in Indonesian format
function format_indonesian_date($date_str) {
    try {
        $months = [
            1 => 'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
            'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
        ];
        $time = strtotime($date_str);
        if (!$time) return $date_str;
        
        $day = date('j', $time);
        $month_num = (int)date('n', $time);
        $year = date('Y', $time);
        
        return "$day " . $months[$month_num] . " $year";
    } catch (Exception $e) {
        return $date_str;
    }
}

// Function to automatically regenerate the sitemap.xml
function regenerate_sitemap($articles) {
    $date_str = date('Y-m-d');
    
    $xml = '<?xml version="1.0" encoding="UTF-8"?>' . "\n";
    $xml .= '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">' . "\n";
    
    // Base static pages
    $xml .= "  <!-- Home Page -->\n  <url>\n    <loc>https://digilaras.com/</loc>\n    <lastmod>{$date_str}</lastmod>\n    <changefreq>monthly</changefreq>\n    <priority>1.0</priority>\n  </url>\n";
    $xml .= "  <!-- About Page -->\n  <url>\n    <loc>https://digilaras.com/about/</loc>\n    <lastmod>{$date_str}</lastmod>\n    <changefreq>monthly</changefreq>\n    <priority>0.8</priority>\n  </url>\n";
    $xml .= "  <!-- Portfolio Page -->\n  <url>\n    <loc>https://digilaras.com/portfolio/</loc>\n    <lastmod>{$date_str}</lastmod>\n    <changefreq>monthly</changefreq>\n    <priority>0.8</priority>\n  </url>\n";
    $xml .= "  <!-- Layanan: Google Ads -->\n  <url>\n    <loc>https://digilaras.com/layanan/google-ads/</loc>\n    <lastmod>{$date_str}</lastmod>\n    <changefreq>monthly</changefreq>\n    <priority>0.7</priority>\n  </url>\n";
    $xml .= "  <!-- Layanan: Meta Ads -->\n  <url>\n    <loc>https://digilaras.com/layanan/meta-ads/</loc>\n    <lastmod>{$date_str}</lastmod>\n    <changefreq>monthly</changefreq>\n    <priority>0.7</priority>\n  </url>\n";
    $xml .= "  <!-- Layanan: SEO -->\n  <url>\n    <loc>https://digilaras.com/layanan/seo/</loc>\n    <lastmod>{$date_str}</lastmod>\n    <changefreq>monthly</changefreq>\n    <priority>0.7</priority>\n  </url>\n";
    $xml .= "  <!-- Layanan: Social Media Management -->\n  <url>\n    <loc>https://digilaras.com/layanan/social-media/</loc>\n    <lastmod>{$date_str}</lastmod>\n    <changefreq>monthly</changefreq>\n    <priority>0.7</priority>\n  </url>\n";
    $xml .= "  <!-- Layanan: Web Development -->\n  <url>\n    <loc>https://digilaras.com/layanan/web-dev/</loc>\n    <lastmod>{$date_str}</lastmod>\n    <changefreq>monthly</changefreq>\n    <priority>0.7</priority>\n  </url>\n";
    $xml .= "  <!-- Contact Page -->\n  <url>\n    <loc>https://digilaras.com/contact/</loc>\n    <lastmod>{$date_str}</lastmod>\n    <changefreq>monthly</changefreq>\n    <priority>0.8</priority>\n  </url>\n";
    $xml .= "  <!-- Artikel Index Page -->\n  <url>\n    <loc>https://digilaras.com/artikel/</loc>\n    <lastmod>{$date_str}</lastmod>\n    <changefreq>daily</changefreq>\n    <priority>0.9</priority>\n  </url>\n";
    
    // Dynamic articles
    $xml .= "  <!-- Dynamic Articles -->\n";
    foreach ($articles as $article) {
        $slug = htmlspecialchars($article['slug']);
        $date = htmlspecialchars($article['date']);
        $xml .= "  <url>\n    <loc>https://digilaras.com/artikel/{$slug}</loc>\n    <lastmod>{$date}</lastmod>\n    <changefreq>weekly</changefreq>\n    <priority>0.8</priority>\n  </url>\n";
    }
    
    $xml .= '</urlset>';
    
    // Save to web root sitemap
    file_put_contents(__DIR__ . '/sitemap.xml', $xml);
}

// Route Requests
$method = $_SERVER['REQUEST_METHOD'];
$request_uri = $_SERVER['REQUEST_URI'];

// API path match (accepts either rewritten /api/articles or direct /api.php requests)
$is_api_articles = (strpos($request_uri, '/api/articles') !== false) || (strpos($request_uri, 'api.php') !== false);

if ($is_api_articles) {
    if ($method === 'GET') {
        header('Content-Type: application/json');
        echo json_encode(get_articles($articles_file));
        exit();
    }
    
    if ($method === 'POST') {
        $input = json_decode(file_get_contents('php://input'), true);
        if (!$input) {
            http_response_code(400);
            header('Content-Type: application/json');
            echo json_encode(['error' => 'Data tidak valid.']);
            exit();
        }

        $title = $input['title'] ?? null;
        $slug = $input['slug'] ?? null;
        $category = $input['category'] ?? null;
        $author = $input['author'] ?? null;
        $date = $input['date'] ?? null;
        $description = $input['description'] ?? null;
        $content = $input['content'] ?? null;
        $coverImage = $input['coverImage'] ?? null;
        $passcode = $input['passcode'] ?? null;

        // Passcode authorization
        $correct_passcode = getenv('ADMIN_PASSCODE') ?: 'digilaras2026';
        if ($passcode !== $correct_passcode) {
            http_response_code(403);
            header('Content-Type: application/json');
            echo json_encode(['error' => 'Sandi admin salah (unauthorized).']);
            exit();
        }

        if (!$title || !$slug || !$category || !$author || !$date || !$description || !$content) {
            http_response_code(400);
            header('Content-Type: application/json');
            echo json_encode(['error' => 'Semua kolom bertanda bintang (*) wajib diisi.']);
            exit();
        }

        $articles = get_articles($articles_file);

        // Check duplicate slug
        foreach ($articles as $a) {
            if ($a['slug'] === $slug) {
                http_response_code(400);
                header('Content-Type: application/json');
                echo json_encode(['error' => 'Slug URL sudah digunakan oleh artikel lain.']);
                exit();
            }
        }

        $new_article = [
            'title' => $title,
            'slug' => $slug,
            'category' => $category,
            'author' => $author,
            'date' => $date,
            'coverImage' => $coverImage ?: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800',
            'description' => $description,
            'content' => $content
        ];

        array_unshift($articles, $new_article);
        if (save_articles($articles_file, $articles)) {
            http_response_code(201);
            header('Content-Type: application/json');
            echo json_encode($new_article);
        } else {
            http_response_code(500);
            header('Content-Type: application/json');
            echo json_encode(['error' => 'Gagal menyimpan artikel ke server.']);
        }
        exit();
    }

    if ($method === 'DELETE') {
        $input = json_decode(file_get_contents('php://input'), true);
        $passcode = $input['passcode'] ?? null;

        $correct_passcode = getenv('ADMIN_PASSCODE') ?: 'digilaras2026';
        if ($passcode !== $correct_passcode) {
            http_response_code(403);
            header('Content-Type: application/json');
            echo json_encode(['error' => 'Sandi admin salah (unauthorized).']);
            exit();
        }

        // Extract slug from URL parameter or query
        $slug = $_GET['slug'] ?? null;
        if (!$slug) {
            // Parse from URL segment /api/articles/{slug}
            $parts = explode('/api/articles/', $request_uri);
            if (isset($parts[1])) {
                $slug_parts = explode('?', $parts[1]);
                $slug = $slug_parts[0];
            }
        }

        if (!$slug) {
            http_response_code(400);
            header('Content-Type: application/json');
            echo json_encode(['error' => 'Slug artikel wajib disertakan.']);
            exit();
        }

        $articles = get_articles($articles_file);
        $index = -1;
        foreach ($articles as $i => $a) {
            if ($a['slug'] === $slug) {
                $index = $i;
                break;
            }
        }

        if ($index === -1) {
            http_response_code(404);
            header('Content-Type: application/json');
            echo json_encode(['error' => 'Artikel tidak ditemukan.']);
            exit();
        }

        array_splice($articles, $index, 1);
        if (save_articles($articles_file, $articles)) {
            header('Content-Type: application/json');
            echo json_encode(['message' => 'Artikel berhasil dihapus.']);
        } else {
            http_response_code(500);
            header('Content-Type: application/json');
            echo json_encode(['error' => 'Gagal memperbarui database server.']);
        }
        exit();
    }
}

// 404 for other API routes
http_response_code(404);
echo json_encode(['error' => 'Endpoint tidak ditemukan.']);

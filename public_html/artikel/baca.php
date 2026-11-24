<?php
// PHP Router for reading articles dynamically on Hostinger Shared Hosting (Perfect SEO & AI crawling)

$slug = isset($_GET['slug']) ? trim($_GET['slug']) : '';

// Validate slug
if (empty($slug) || in_array($slug, ['index.html', 'admin.html', 'baca.html'])) {
    include __DIR__ . '/index.html';
    exit();
}

$db_dir_above = dirname(dirname(__DIR__)) . '/data';
$db_dir_inside = dirname(__DIR__) . '/data';

if (is_dir($db_dir_above)) {
    $data_dir = $db_dir_above;
} else {
    $data_dir = $db_dir_inside;
}

$articles_file = $data_dir . '/articles.json';
$articles = [];

if (file_exists($articles_file)) {
    $articles = json_decode(file_get_contents($articles_file), true);
    if (!is_array($articles)) {
        $articles = [];
    }
}

// Find article matching slug
$article = null;
foreach ($articles as $a) {
    if (isset($a['slug']) && $a['slug'] === $slug) {
        $article = $a;
        break;
    }
}

// Format date helper
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

if (!$article) {
    // Send a professional 404 page
    http_response_code(404);
    ?>
    <!DOCTYPE html>
    <html lang="id">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Artikel Tidak Ditemukan | DIGILARAS</title>
        <link rel="icon" type="image/svg+xml" href="data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><rect width='100' height='100' rx='20' fill='%23022c22'/><path d='M30 70V30h20c15 0 25 10 25 20s-10 20-25 20H30zm10-10h10c10 0 15-5 15-10s-5-10-15-10H40v20z' fill='%23facc15'/></svg>">
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
    <?php
    exit();
}

$template_path = __DIR__ . '/baca.html';

if (!file_exists($template_path)) {
    http_response_code(500);
    echo "Reading template 'baca.html' is missing.";
    exit();
}

$html = file_get_contents($template_path);

// Replace placeholders
$html = str_replace('{{TITLE}}', htmlspecialchars($article['title']), $html);
$html = str_replace('{{DESCRIPTION}}', htmlspecialchars($article['description']), $html);
$html = str_replace('{{COVER_IMAGE}}', htmlspecialchars($article['coverImage']), $html);
$html = str_replace('{{CATEGORY}}', htmlspecialchars($article['category']), $html);
$html = str_replace('{{DATE}}', htmlspecialchars($article['date']), $html);
$html = str_replace('{{SLUG}}', htmlspecialchars($article['slug']), $html);
$html = str_replace('{{AUTHOR}}', htmlspecialchars($article['author']), $html);
$html = str_replace('{{FORMATTED_DATE}}', htmlspecialchars(format_indonesian_date($article['date'])), $html);
$html = str_replace('{{CONTENT}}', $article['content'], $html); // Content contains HTML formatted markdown, do not strip

header("Content-Type: text/html; charset=utf-8");
echo $html;

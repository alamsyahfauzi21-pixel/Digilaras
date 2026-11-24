const fs = require('fs');

const generateHtml = (title, desc, canonical, mainContent) => `<!DOCTYPE html>
<html lang="id" class="scroll-smooth">
<head>
    <!-- Google Tag Manager -->
    <script>(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
    new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
    j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
    'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
    })(window,document,'script','dataLayer','GTM-5KRWLVRR');</script>
    <!-- End Google Tag Manager -->

    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${title}</title>
    <meta name="description" content="${desc}">
    <link rel="canonical" href="${canonical}">
    <meta property="og:title" content="${title}">
    <meta property="og:description" content="${desc}">
    <meta property="og:url" content="${canonical}">
    <meta property="og:type" content="website">
    <meta name="twitter:card" content="summary_large_image">
    
    <link rel="icon" type="image/svg+xml" href="data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><rect width='100' height='100' rx='20' fill='%23022c22'/><path d=''M30 70V30h20c15 0 25 10 25 20s-10 20-25 20H30zm10-10h10c10 0 15-5 15-10s-5-10-15-10H40v20z'' fill='%23facc15'/></svg>">
    
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700;800;900&display=swap" rel="stylesheet">
    
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">
    <script src="https://cdn.tailwindcss.com"></script>
    
    <script>
        tailwind.config = {
            theme: {
                extend: {
                    fontFamily: { sans: ['Poppins', 'sans-serif'], },
                    colors: {
                        agency: {
                            50: '#fefce8', 100: '#fef9c3', 500: '#facc15', 600: '#c53030',
                            800: '#065f46', 900: '#064e3b', 950: '#022c22',
                        },
                        accent: { 500: '#fde047', blue: '#3b82f6', orange: '#f97316' },
                        slate: { 300: '#fef08a', 400: '#fde047', 500: '#eab308', },
                        blue: { 400: '#facc15', 500: '#9b2c2c', 600: '#c53030' }
                    },
                    boxShadow: {
                        'glow': '0 0 20px rgba(197, 48, 48, 0.5)', 
                        'glow-yellow': '0 0 20px rgba(250, 204, 21, 0.5)',
                        'card': '0 10px 30px -10px rgba(0,0,0,0.5)',
                    }
                }
            }
        }
    </script>
    <link rel="stylesheet" href="/assets/css/style.css">
</head>
<body class="bg-agency-900 text-slate-300 antialiased overflow-x-hidden">
    <!-- Google Tag Manager (noscript) -->
    <noscript><iframe src="https://www.googletagmanager.com/ns.html?id=GTM-5KRWLVRR"
    height="0" width="0" style="display:none;visibility:hidden"></iframe></noscript>
    <!-- End Google Tag Manager (noscript) -->

    <div id="header-placeholder"></div>

${mainContent.replace(/#kontak/g, '/contact#form')}

    <div id="footer-placeholder"></div>

    <script src="/assets/js/main.js"></script>
</body>
</html>`;

const filesToGenerate = {};

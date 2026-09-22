
const fs = require("fs");
const path = require("path");

const races = require("./races.js");

console.log(
    `races.js에서 ${races.length}개 대회를 확인했습니다.`
);

const outputDir = path.join(__dirname, "races");

if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
}

function escapeHtml(value) {
    return String(value ?? "")
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}

function createFileName(race, index) {
    if (race.name === "2026 이일선마라톤") {
        return "2026-iilseon-marathon.html";
    }

    const raceNumber = String(index + 1).padStart(3, "0");

    return `${race.date}-race-${raceNumber}.html`;
}

function createEventSchema(race, canonicalUrl) {
    return {
        "@context": "https://schema.org",
        "@type": "Event",
        "name": race.name,
        "startDate": race.date,
        "endDate": race.date,
        "eventStatus": "https://schema.org/EventScheduled",
        "eventAttendanceMode":
            "https://schema.org/OfflineEventAttendanceMode",
        "description":
            `${race.name} 일정, 장소, 참가 종목 및 접수 정보를 확인할 수 있습니다.`,
        "location": {
            "@type": "Place",
            "name": race.place || race.region || "대한민국",
            "address": {
                "@type": "PostalAddress",
                "addressRegion": race.region || "대한민국",
                "addressCountry": "KR"
            }
        },
        "organizer": {
            "@type": "Organization",
            "name": "여기런",
            "url": "https://sanggeon90.github.io/yeogirun/"
        },
        "url": canonicalUrl
    };
}

function createHtml(race, index) {
    const fileName = createFileName(race, index);

    const canonicalUrl =
        `https://sanggeon90.github.io/yeogirun/races/${fileName}`;

    const distances =
        Array.isArray(race.distances) && race.distances.length
            ? race.distances.join(", ")
            : "공식 홈페이지 확인";

    const officialLink =
        race.url && race.url.trim() !== ""
            ? `
                <p>
                    <a
                        href="${escapeHtml(race.url)}"
                        target="_blank"
                        rel="noopener noreferrer"
                    >
                        공식 홈페이지 바로가기
                    </a>
                </p>
            `
            : `
                <p>공식 홈페이지 확인</p>
            `;

    const eventSchema = createEventSchema(
        race,
        canonicalUrl
    );

    return `<!DOCTYPE html>
<html lang="ko">
<head>
    <meta charset="UTF-8">

    <meta
        name="viewport"
        content="width=device-width, initial-scale=1.0"
    >

    <title>
        ${escapeHtml(race.name)}
        일정·참가정보 | 여기런
    </title>

    <meta
        name="description"
        content="${escapeHtml(
            `${race.name} 대회 일정, 장소, 종목, 접수 정보를 확인하세요.`
        )}"
    >

    <meta
        name="robots"
        content="index, follow"
    >

    <link
        rel="canonical"
        href="${canonicalUrl}"
    >

    <meta
        property="og:type"
        content="website"
    >

    <meta
        property="og:title"
        content="${escapeHtml(race.name)} 일정·참가정보 | 여기런"
    >

    <meta
        property="og:description"
        content="${escapeHtml(
            `${race.name} 일정, 장소, 종목, 접수 정보를 확인하세요.`
        )}"
    >

    <meta
        property="og:url"
        content="${canonicalUrl}"
    >

    <meta
        property="og:site_name"
        content="여기런"
    >

    <script
        async
        src="https://www.googletagmanager.com/gtag/js?id=G-RDRN60R6ZB"
    ></script>

    <script>
        window.dataLayer = window.dataLayer || [];

        function gtag(){
            dataLayer.push(arguments);
        }

        gtag('js', new Date());

        gtag('config', 'G-RDRN60R6ZB');
    </script>

    <script type="application/ld+json">
${JSON.stringify(eventSchema, null, 4)}
    </script>

    <style>
        * {
            box-sizing: border-box;
        }

        body {
            margin: 0;
            font-family:
                -apple-system,
                BlinkMacSystemFont,
                "Segoe UI",
                "Noto Sans KR",
                Arial,
                sans-serif;
            background: #f5f7fb;
            color: #172033;
        }

        .container {
            width: min(900px, calc(100% - 32px));
            margin: 0 auto;
        }

        header {
            background: #ffffff;
            border-bottom: 1px solid #e5e7eb;
        }

        .header-inner {
            height: 72px;
            display: flex;
            align-items: center;
            justify-content: space-between;
        }

        .logo {
            font-size: 24px;
            font-weight: 900;
        }

        .logo span {
            color: #2563eb;
        }

        .back {
            color: #2563eb;
            text-decoration: none;
            font-weight: 700;
            font-size: 14px;
        }

        main {
            padding: 40px 0 70px;
        }

        .card {
            background: #ffffff;
            border: 1px solid #e5e7eb;
            border-radius: 20px;
            padding: 28px;
            box-shadow: 0 5px 20px rgba(15, 23, 42, 0.04);
        }

        h1 {
            margin: 0 0 20px;
            font-size: 30px;
            line-height: 1.4;
        }

        .status {
            display: inline-block;
            padding: 6px 10px;
            border-radius: 999px;
            background: #f1f5f9;
            color: #475569;
            font-size: 12px;
            font-weight: 800;
            margin-bottom: 20px;
        }

        table {
            width: 100%;
            border-collapse: collapse;
        }

        th,
        td {
            padding: 14px 10px;
            border-bottom: 1px solid #eef1f5;
            text-align: left;
            vertical-align: top;
        }

        th {
            width: 120px;
            color: #64748b;
            font-size: 14px;
        }

        td {
            font-weight: 700;
        }

        .official {
            display: block;
            margin-top: 25px;
            padding: 14px;
            border-radius: 10px;
            background: #2563eb;
            color: #ffffff;
            text-align: center;
            text-decoration: none;
            font-weight: 800;
        }

        .home {
            display: block;
            margin-top: 12px;
            padding: 14px;
            border: 1px solid #dbe3ef;
            border-radius: 10px;
            background: #ffffff;
            color: #334155;
            text-align: center;
            text-decoration: none;
            font-weight: 800;
        }

        @media (max-width: 600px) {
            .container {
                width: min(100% - 22px, 900px);
            }

            .card {
                padding: 20px;
            }

            h1 {
                font-size: 24px;
            }

            th {
                width: 90px;
            }
        }
    </style>
</head>

<body>

<header>
    <div class="container header-inner">
        <div class="logo">
            여기<span>런</span>
        </div>

        <a
            class="back"
            href="../index.html"
        >
            ← 전체 대회 보기
        </a>
    </div>
</header>

<main>
    <div class="container">

        <article class="card">

            <span class="status">
                ${escapeHtml(race.status)}
            </span>

            <h1>
                ${escapeHtml(race.name)}
            </h1>

            <table>
                <tr>
                    <th>대회일</th>
                    <td>${escapeHtml(race.date)}</td>
                </tr>

                <tr>
                    <th>지역</th>
                    <td>${escapeHtml(race.region)}</td>
                </tr>

                <tr>
                    <th>장소</th>
                    <td>${escapeHtml(race.place)}</td>
                </tr>

                <tr>
                    <th>참가 종목</th>
                    <td>${escapeHtml(distances)}</td>
                </tr>

                <tr>
                    <th>참가비</th>
                    <td>${escapeHtml(race.price)}</td>
                </tr>

                ${
                    race.period
                        ? `
                <tr>
                    <th>접수기간</th>
                    <td>${escapeHtml(race.period)}</td>
                </tr>
                `
                        : ""
                }
            </table>

            ${
                race.url && race.url.trim() !== ""
                    ? `
            <a
                class="official"
                href="${escapeHtml(race.url)}"
                target="_blank"
                rel="noopener noreferrer"
            >
                공식 홈페이지 바로가기
            </a>
            `
                    : `
            <div
                style="
                    margin-top:25px;
                    padding:14px;
                    border-radius:10px;
                    background:#f8fafc;
                    color:#94a3b8;
                    text-align:center;
                    font-weight:700;
                "
            >
                공식 홈페이지 확인
            </div>
            `
            }

            <a
                class="home"
                href="../index.html"
            >
                여기런 전체 대회 목록으로 돌아가기
            </a>

        </article>

    </div>
</main>

</body>
</html>`;
}

for (let i = 0; i < races.length; i++) {
    const race = races[i];

    const fileName = createFileName(race, i);

    const filePath = path.join(
        outputDir,
        fileName
    );

    const html = createHtml(
        race,
        i
    );

    fs.writeFileSync(
        filePath,
        html,
        "utf8"
    );
}

const sitemapUrls = [
    "https://sanggeon90.github.io/yeogirun/"
];

races.forEach((race, index) => {
    const fileName = createFileName(
        race,
        index
    );

    sitemapUrls.push(
        `https://sanggeon90.github.io/yeogirun/races/${fileName}`
    );
});

const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset
    xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
>
${sitemapUrls
    .map(
        url => `    <url>
        <loc>${url}</loc>
    </url>`
    )
    .join("\n")}
</urlset>
`;

fs.writeFileSync(
    path.join(__dirname, "sitemap.xml"),
    sitemap,
    "utf8"
);

console.log(
    `상세페이지 ${races.length}개 생성 완료`
);

console.log(
    `sitemap.xml 생성 완료`
);

console.log(
    `총 URL 수: ${sitemapUrls.length}개`
);

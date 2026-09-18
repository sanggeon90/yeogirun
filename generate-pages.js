const fs = require("fs");
const path = require("path");

// races.js 불러오기
const racesFile = fs.readFileSync("./races.js", "utf8");

// races 배열 부분만 추출
const match = racesFile.match(/const races\s*=\s*(\[[\s\S]*?\]);/);

if (!match) {
    throw new Error("races 배열을 찾을 수 없습니다.");
}

// races.js의 배열 내용을 JavaScript로 변환
const races = Function(`"use strict"; return ${match[1]}`)();

const outputDir = "./races";

if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
}

// 파일명 만들기
function createSlug(name, date) {
    const safeName = name
        .replace(/[\/\\:*?"<>|]/g, "")
        .replace(/\s+/g, "-");

    return `${date}-${safeName}.html`;
}

// HTML 특수문자 처리
function escapeHtml(value) {
    return String(value ?? "")
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#39;");
}

races.forEach((race) => {
    const fileName = createSlug(race.name, race.date);
    const filePath = path.join(outputDir, fileName);

    const distances = race.distances.join(", ");

    const html = `<!DOCTYPE html>
<html lang="ko">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">

    <title>${escapeHtml(race.name)} 일정·참가정보 | 여기런</title>

    <meta name="description"
          content="${escapeHtml(race.name)}의 대회일, 지역, 장소, 참가 종목과 접수 상태를 확인하세요. ${escapeHtml(race.region)} ${escapeHtml(race.place)}에서 열리는 러닝대회 정보를 여기런에서 확인할 수 있습니다.">

    <meta name="robots" content="index, follow">

    <link rel="canonical"
          href="https://sanggeon90.github.io/yeogirun/races/${encodeURIComponent(fileName)}">

    <meta property="og:title"
          content="${escapeHtml(race.name)} 일정·참가정보 | 여기런">

    <meta property="og:description"
          content="${escapeHtml(race.name)}의 대회일, 장소, 종목과 접수 상태를 확인하세요.">

    <meta property="og:type" content="website">

    <meta property="og:url"
          content="https://sanggeon90.github.io/yeogirun/races/${encodeURIComponent(fileName)}">

    <meta property="og:site_name" content="여기런">

    <script async src="https://www.googletagmanager.com/gtag/js?id=G-RDRN60R6ZB"></script>

    <script>
        window.dataLayer = window.dataLayer || [];
        function gtag(){dataLayer.push(arguments);}
        gtag('js', new Date());
        gtag('config', 'G-RDRN60R6ZB');
    </script>

    <script type="application/ld+json">
    {
        "@context": "https://schema.org",
        "@type": "WebSite",
        "name": "여기런",
        "alternateName": "여기런 - 전국 러닝대회 일정",
        "url": "https://sanggeon90.github.io/yeogirun/",
        "description": "전국 마라톤과 러닝대회 일정을 제공하는 러닝대회 정보 사이트입니다."
    }
    </script>

    <script type="application/ld+json">
    {
        "@context": "https://schema.org",
        "@type": "Event",
        "name": "${escapeHtml(race.name)}",
        "startDate": "${race.date}",
        "endDate": "${race.date}",
        "location": {
            "@type": "Place",
            "name": "${escapeHtml(race.place)}",
            "address": {
                "@type": "PostalAddress",
                "addressRegion": "${escapeHtml(race.region)}",
                "addressCountry": "KR"
            }
        },
        "eventStatus": "https://schema.org/EventScheduled",
        "eventAttendanceMode": "https://schema.org/OfflineEventAttendanceMode",
        "description": "${escapeHtml(race.name)}은(는) ${escapeHtml(race.region)} ${escapeHtml(race.place)}에서 열리는 러닝대회입니다. ${escapeHtml(distances)} 종목이 있으며, 현재 ${escapeHtml(race.status)} 상태입니다.",
        "organizer": {
            "@type": "Organization",
            "name": "여기런",
            "url": "https://sanggeon90.github.io/yeogirun/"
        },
        "url": "https://sanggeon90.github.io/yeogirun/races/${encodeURIComponent(fileName)}"
    }
    </script>

    <style>
        body {
            font-family: Arial, sans-serif;
            max-width: 800px;
            margin: 0 auto;
            padding: 20px;
            line-height: 1.7;
            color: #222;
        }

        h1 {
            margin-bottom: 10px;
        }

        .intro {
            color: #555;
            margin-bottom: 25px;
        }

        table {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 30px;
        }

        th, td {
            border: 1px solid #ddd;
            padding: 10px;
            text-align: left;
        }

        th {
            width: 120px;
            background: #f7f7f7;
        }

        .links {
            margin-top: 30px;
        }

        a {
            color: #1769aa;
        }
    </style>
</head>

<body>

    <h1>${escapeHtml(race.name)}</h1>

    <p class="intro">
        ${escapeHtml(race.date)} ${escapeHtml(race.region)} ${escapeHtml(race.place)}에서 열리는
        ${escapeHtml(race.name)} 대회 정보를 확인하세요.
    </p>

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
            <th>종목</th>
            <td>${escapeHtml(distances)}</td>
        </tr>
        <tr>
            <th>접수 상태</th>
            <td>${escapeHtml(race.status)}</td>
        </tr>
        <tr>
            <th>참가비</th>
            <td>${escapeHtml(race.price)}</td>
        </tr>
        <tr>
            <th>접수 기간</th>
            <td>${race.period ? escapeHtml(race.period) : "확인된 정보 없음"}</td>
        </tr>
    </table>

    <h2>대회 정보</h2>

    <p>
        ${escapeHtml(race.name)}은(는)
        ${escapeHtml(race.region)} ${escapeHtml(race.place)}에서 열리는 러닝대회입니다.
        참가 종목은 ${escapeHtml(distances)}입니다.
    </p>

    <p>
        접수 상태와 참가비 등 세부 사항은 대회 공식 홈페이지를 통해
        최종 확인하시기 바랍니다.
    </p>

    <div class="links">
        <p>
            <a href="https://sanggeon90.github.io/yeogirun/">
                ← 여기런 전국 러닝대회 일정으로 돌아가기
            </a>
        </p>

        ${race.url ? `<p><a href="${escapeHtml(race.url)}" target="_blank" rel="noopener noreferrer">공식 홈페이지 바로가기</a></p>` : ""}
    </div>

</body>
</html>`;

    fs.writeFileSync(filePath, html, "utf8");

    console.log(`생성 완료: ${filePath}`);
});

console.log(`총 ${races.length}개 상세페이지 생성 완료`);

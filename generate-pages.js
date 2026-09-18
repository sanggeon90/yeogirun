const fs = require("fs");
const path = require("path");

/*
=========================================================
여기런 상세페이지 자동 생성기
=========================================================
races.js의 대회 데이터를 읽어서
/races/ 폴더에 상세페이지 HTML을 자동 생성합니다.
=========================================================
*/

// -------------------------------------------------------
// 1. races.js 읽기
// -------------------------------------------------------

const racesFile = fs.readFileSync("./races.js", "utf8");

const match = racesFile.match(
    /const races\s*=\s*(\[[\s\S]*?\]);/
);

if (!match) {
    throw new Error("races 배열을 찾을 수 없습니다.");
}

// races 배열 실행
const races = Function(
    `"use strict"; return ${match[1]}`
)();

console.log(`races.js에서 ${races.length}개 대회를 확인했습니다.`);


// -------------------------------------------------------
// 2. races 폴더 준비
// -------------------------------------------------------

const outputDir = "./races";

if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
}


// -------------------------------------------------------
// 3. HTML 속성용 문자열 처리
// -------------------------------------------------------

function escapeHtml(value) {
    return String(value ?? "")
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#39;");
}


// -------------------------------------------------------
// 4. 파일명 만들기
//
// 한글 파일명도 사용할 수 있지만,
// 날짜 + 순번 방식으로 안정적인 URL을 만듭니다.
//
// 예:
// 2026-09-03-race-001.html
// 2026-09-05-race-002.html
//
// 단, 기존 이일선마라톤 URL은 유지합니다.
// -------------------------------------------------------

function createFileName(race, index) {

    // 기존에 Google에 색인된 이일선마라톤 URL 유지
    if (race.name === "2026 이일선마라톤") {
        return "2026-iilseon-marathon.html";
    }

    const number = String(index + 1).padStart(3, "0");

    return `${race.date}-race-${number}.html`;
}


// -------------------------------------------------------
// 5. Event 구조화 데이터 만들기
// -------------------------------------------------------

function createEventSchema(race, fileName) {

    const distances = Array.isArray(race.distances)
        ? race.distances.join(", ")
        : "";

    const eventDescription =
        `${race.name}은(는) ${race.region} ${race.place}에서 열리는 러닝대회입니다. ` +
        `${distances} 종목이 있으며, 현재 ${race.status} 상태입니다.`;

    const event = {
        "@context": "https://schema.org",
        "@type": "Event",

        "name": race.name,

        "startDate": race.date,

        "endDate": race.date,

        "location": {
            "@type": "Place",

            "name": race.place,

            "address": {
                "@type": "PostalAddress",

                "addressRegion": race.region,

                "addressCountry": "KR"
            }
        },

        "eventStatus": "https://schema.org/EventScheduled",

        "eventAttendanceMode":
            "https://schema.org/OfflineEventAttendanceMode",

        "description": eventDescription,

        "organizer": {
            "@type": "Organization",

            "name": "여기런",

            "url":
                "https://sanggeon90.github.io/yeogirun/"
        },

        "url":
            `https://sanggeon90.github.io/yeogirun/races/${fileName}`
    };

    // JSON.stringify를 사용해서
    // JSON-LD 내부의 특수문자를 안전하게 처리
    return JSON.stringify(event, null, 4);
}


// -------------------------------------------------------
// 6. WebSite 구조화 데이터
// -------------------------------------------------------

const websiteSchema = JSON.stringify(
    {
        "@context": "https://schema.org",

        "@type": "WebSite",

        "name": "여기런",

        "alternateName":
            "여기런 - 전국 러닝대회 일정",

        "url":
            "https://sanggeon90.github.io/yeogirun/",

        "description":
            "전국 마라톤과 러닝대회 일정을 제공하는 러닝대회 정보 사이트입니다."
    },
    null,
    4
);


// -------------------------------------------------------
// 7. 상세페이지 생성
// -------------------------------------------------------

races.forEach((race, index) => {

    const fileName = createFileName(race, index);

    const filePath = path.join(
        outputDir,
        fileName
    );

    const distances =
        Array.isArray(race.distances)
            ? race.distances.join(", ")
            : "";

    const description =
        `${race.name}의 대회일, 지역, 장소, 참가 종목과 접수 상태를 확인하세요. ` +
        `${race.region} ${race.place}에서 열리는 러닝대회 정보를 여기런에서 확인할 수 있습니다.`;

    const eventSchema =
        createEventSchema(race, fileName);


    // ---------------------------------------------------
    // 8. HTML 생성
    // ---------------------------------------------------

    const html = `<!DOCTYPE html>
<html lang="ko">

<head>

    <meta charset="UTF-8">

    <meta name="viewport"
          content="width=device-width, initial-scale=1.0">

    <title>
        ${escapeHtml(race.name)} 일정·참가정보 | 여기런
    </title>

    <meta name="description"
          content="${escapeHtml(description)}">

    <meta name="robots"
          content="index, follow">

    <link rel="canonical"
          href="https://sanggeon90.github.io/yeogirun/races/${fileName}">


    <!-- Open Graph -->

    <meta property="og:title"
          content="${escapeHtml(race.name)} 일정·참가정보 | 여기런">

    <meta property="og:description"
          content="${escapeHtml(description)}">

    <meta property="og:type"
          content="website">

    <meta property="og:url"
          content="https://sanggeon90.github.io/yeogirun/races/${fileName}">

    <meta property="og:site_name"
          content="여기런">


    <!-- Google Analytics -->

    <script async
        src="https://www.googletagmanager.com/gtag/js?id=G-RDRN60R6ZB">
    </script>

    <script>

        window.dataLayer =
            window.dataLayer || [];

        function gtag(){
            dataLayer.push(arguments);
        }

        gtag('js', new Date());

        gtag(
            'config',
            'G-RDRN60R6ZB'
        );

    </script>


    <!-- WebSite 구조화 데이터 -->

    <script type="application/ld+json">
${websiteSchema}
    </script>


    <!-- Event 구조화 데이터 -->

    <script type="application/ld+json">
${eventSchema}
    </script>


    <style>

        body {
            font-family:
                Arial,
                "Noto Sans KR",
                sans-serif;

            max-width: 800px;

            margin: 0 auto;

            padding: 20px;

            line-height: 1.7;

            color: #222;

            background: #fff;
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

        th,
        td {
            border: 1px solid #ddd;

            padding: 10px;

            text-align: left;
        }

        th {
            width: 120px;

            background: #f7f7f7;
        }

        h2 {
            margin-top: 30px;
        }

        .links {
            margin-top: 30px;
        }

        a {
            color: #1769aa;
        }

        @media (max-width: 600px) {

            body {
                padding: 15px;
            }

            th {
                width: 90px;
            }

        }

    </style>

</head>


<body>

    <h1>
        ${escapeHtml(race.name)}
    </h1>


    <p class="intro">

        ${escapeHtml(race.date)}
        ${escapeHtml(race.region)}
        ${escapeHtml(race.place)}에서 열리는
        ${escapeHtml(race.name)}
        대회 정보를 확인하세요.

    </p>


    <table>

        <tr>
            <th>대회일</th>

            <td>
                ${escapeHtml(race.date)}
            </td>
        </tr>


        <tr>
            <th>지역</th>

            <td>
                ${escapeHtml(race.region)}
            </td>
        </tr>


        <tr>
            <th>장소</th>

            <td>
                ${escapeHtml(race.place)}
            </td>
        </tr>


        <tr>
            <th>종목</th>

            <td>
                ${escapeHtml(distances)}
            </td>
        </tr>


        <tr>
            <th>접수 상태</th>

            <td>
                ${escapeHtml(race.status)}
            </td>
        </tr>


        <tr>
            <th>참가비</th>

            <td>
                ${escapeHtml(race.price)}
            </td>
        </tr>


        <tr>
            <th>접수 기간</th>

            <td>
                ${
                    race.period
                        ? escapeHtml(race.period)
                        : "확인된 정보 없음"
                }
            </td>
        </tr>

    </table>


    <h2>
        대회 정보
    </h2>


    <p>

        ${escapeHtml(race.name)}은(는)
        ${escapeHtml(race.region)}
        ${escapeHtml(race.place)}에서 열리는
        러닝대회입니다.

    </p>


    <p>

        참가 종목은
        ${escapeHtml(distances)}이며,

        접수 상태와 참가비 등 세부 사항은
        대회 공식 홈페이지를 통해
        최종 확인하시기 바랍니다.

    </p>


    <div class="links">

        <p>

            <a href="https://sanggeon90.github.io/yeogirun/">

                ← 여기런 전국 러닝대회 일정으로 돌아가기

            </a>

        </p>


        ${
            race.url
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
                : ""
        }

    </div>

</body>

</html>
`;


    // ---------------------------------------------------
    // 9. 파일 저장
    // ---------------------------------------------------

    fs.writeFileSync(
        filePath,
        html,
        "utf8"
    );

    console.log(
        `생성 완료: ${filePath}`
    );

});


// -------------------------------------------------------
// 10. 완료 메시지
// -------------------------------------------------------

console.log("");
console.log(
    `총 ${races.length}개 상세페이지 생성 완료`
);

export interface Book {
  rank: number;
  title: string;
  subtitle: string;
  link: string;
  author: string;
  publisher: string;
  pubDate: string;
  price: number;
  cost: number;
  salesIndex: number;
}

export function parseBooksCsv(csvText: string): Book[] {
  const lines = csvText.trim().split('\n');
  if (lines.length <= 1) return [];

  const books: Book[] = [];

  // Skip header line
  for (let i = 1; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;

    const row: string[] = [];
    let insideQuotes = false;
    let currentVal = '';

    for (let j = 0; j < line.length; j++) {
      const char = line[j];

      if (char === '"') {
        insideQuotes = !insideQuotes;
      } else if (char === ',' && !insideQuotes) {
        row.push(currentVal.trim());
        currentVal = '';
      } else {
        currentVal += char;
      }
    }
    row.push(currentVal.trim());

    // Clean quotes from values
    const cleanRow = row.map(val => {
      let cleaned = val;
      if (cleaned.startsWith('"') && cleaned.endsWith('"')) {
        cleaned = cleaned.substring(1, cleaned.length - 1);
      }
      return cleaned.replace(/""/g, '"');
    });

    if (cleanRow.length >= 10) {
      const rank = parseInt(cleanRow[0], 10) || i;
      const title = cleanRow[1] || '';
      const subtitle = cleanRow[2] || '';
      const link = cleanRow[3] || '';
      const author = cleanRow[4] || '';
      const publisher = cleanRow[5] || '';
      const pubDate = cleanRow[6] || '';
      
      // Clean price, cost, and sales index
      const price = parseInt(cleanRow[7].replace(/[^0-9]/g, ''), 10) || 0;
      const cost = parseInt(cleanRow[8].replace(/[^0-9]/g, ''), 10) || 0;
      const salesIndex = parseInt(cleanRow[9].replace(/[^0-9]/g, ''), 10) || 0;

      books.push({
        rank,
        title,
        subtitle,
        link,
        author,
        publisher,
        pubDate,
        price,
        cost,
        salesIndex
      });
    }
  }

  return generateExpandedBooks(books, 1000);
}

export function generateExpandedBooks(baseBooks: Book[], targetCount: number = 1000): Book[] {
  const books = [...baseBooks];
  if (books.length >= targetCount) return books.slice(0, targetCount);

  const publishers = ["한빛미디어", "길벗", "이지스퍼블리싱", "제이펍", "골든래빗", "위키북스", "인사이트", "영진닷컴", "앤써북", "로드북", "더타이즈", "사회평론아카데미"];
  const firstNames = ["민준", "서준", "예준", "도윤", "시우", "주원", "하준", "지호", "서현", "서윤", "지우", "하은", "민서", "지유", "윤서", "채원", "혜원", "정우", "동현", "태호", "진우", "영진", "철수", "성민", "민재", "재우", "승민", "성현", "수빈", "예진"];
  const lastNames = ["김", "이", "박", "최", "정", "강", "조", "윤", "장", "임", "한", "오", "서", "신", "권", "황", "안", "송", "전", "홍"];
  const foreignNames = ["Martin Fowler", "Robert C. Martin", "Kent Beck", "Linus Torvalds", "Steve McConnell", "Donald Knuth", "Guido van Rossum", "Bjarne Stroustrup", "Ryan Dahl", "Dan Abramov", "Rich Harris", "Evan You"];

  const templates = [
    {
      genre: "AI/인공지능",
      prefixes: ["실전", "처음 배우는", "핵심만 골라 배우는", "하루 만에 끝내는", "누구나 쉽게 하는", "생성형 AI 시대의", "개발자를 위한", "비전공자도 따라하는"],
      topics: ["챗GPT 프롬프트 엔지니어링", "LLM 애플리케이션 개발", "랭체인과 랭그래프 실전", "딥러닝 & 강화학습 핵심", "AI 에이전트 오케스트레이션", "RAG 시스템 구축과 활용", "AI 스튜디오와 안티그래비티", "파이썬 머신러닝 완전 정복", "Stable Diffusion 이미지 생성 기술", "제미나이 API 개발", "클로드와 바이브 코딩 실무", "AI 비서와 스마트 워크"],
      suffixes: ["입문", "가이드", "정석", "완벽 가이드", "실무 활용집", "완전 정복", "A to Z", "마스터북", "실습 가이드"],
      subtitles: ["AI로 업무 효율 10배 올리기", "기획부터 배포까지 한 권으로 완성하는 기술", "자연어로 소통하는 차세대 에이전트 설계", "초보자도 따라 할 수 있는 친절한 설명과 예제", "실전 예제로 배우는 파인튜닝과 임베딩", "현업 엔지니어가 전하는 AX 생존 전략", "실제 업무에 내일 바로 적용하는 인공지능 기법"]
    },
    {
      genre: "프로그래밍/코딩",
      prefixes: ["모던", "혼자 공부하는", "가장 쉬운", "제대로 배우는", "실전 예제로 배우는", "현업 개발자를 위한", "프로그래머를 위한", "기초부터 배우는"],
      topics: ["파이썬 프로그래밍", "모던 리액트 Deep Dive", "TypeScript & ES6", "자바스크립트 프론트엔드", "자바 코딩의 정석", "C++ 자료구조와 알고리즘", "Go 언어 프로그래밍", "Rust 시스템 프로그래밍", "Next.js 풀스택 개발", "스프링 부트와 웹 API", "자료구조와 알고리즘 인터뷰", "SQL 데이터베이스 기초", "Docker & Kubernetes 가이드", "CI/CD 배포 자동화"],
      suffixes: ["기초", "에센셜", "정석", "마스터", "실전 프로젝트", "교과서", "원리와 적용", "바이블"],
      subtitles: ["기초 문법부터 실전 토이 프로젝트까지", "현업 개발자가 알려주는 클린 코드 작성법", "견고한 아키텍처로 빌드하는 모던 웹 애플리케이션", "코딩 테스트 합격을 위한 핵심 유형 분석", "인프라 기초부터 쿠버네티스 오케스트레이션까지", "안정적이고 확장 가능한 백엔드 서버 설계", "지속 가능한 코드를 작성하는 모던 프로그래머의 습관"]
    },
    {
      genre: "업무자동화/오피스",
      prefixes: ["일 잘하는 직장인의", "퇴근이 빨라지는", "30분 만에 끝내는", "딸깍!", "회사에서 바로 쓰는", "왕초보를 위한", "누구나 할 수 있는"],
      topics: ["실무 엑셀 & 데이터 분석", "구글 스프레드로 스프레드시트 완성", "노션 데이터베이스 협업", "n8n과 Zapier 무인 자동화", "파이썬 업무 자동화", "기획자를 위한 파워포인트 핵심", "스마트 워크를 위한 협업 툴", "실전 매크로 & VBA 프로그래밍"],
      suffixes: ["정석", "치트키", "완전 정복", "실무 비법", "대백과", "바이블", "꿀팁 40제"],
      subtitles: ["퇴근 시간을 절반으로 줄여주는 실무 비법", "기획서 작성부터 데이터 시각화까지 한번에", "반복적인 노가다 업무에서 완전히 해방되는 법", "노코드 툴을 활용한 1인 비즈니스 자동화", "매뉴얼대로 따라 하면 완성되는 50가지 업무 템플릿"]
    },
    {
      genre: "디자인/드로잉",
      prefixes: ["감각적인", "맛있는 디자인", "승인율 99% 달성하는", "돈이 되는", "나 혼자 만드는", "프로 디자이너의"],
      topics: ["피그마 UI/UX 디자인", "포토샵 & 일러스트레이터 CC", "프로크리에이트 드로잉", "블렌더 3D 그래픽", "캔바 1인 마케팅 디자인", "반응형 웹 퍼블리싱", "스케치업 공간 연출", "프리미어 프로 유튜브 영상 편집", "다빈치 리졸브 색보정"],
      suffixes: ["마스터", "입문", "실무 가이드", "테크닉", "노하우", "완성하기"],
      subtitles: ["초보 디자이너를 위한 실무 그리드 시스템", "감각적인 컬러 매칭과 타이포그래피 핵심 원리", "3D 캐릭터 모델링부터 애니메이션 렌더링까지", "쉽고 빠르게 만드는 SNS 콘텐츠 디자인 치트키", "인스타그램 릴스와 유튜브 쇼츠 영상 크리에이터 가이드"]
    },
    {
      genre: "기타 IT/교양",
      prefixes: ["알기 쉬운", "한눈에 보는", "그림으로 이해하는", "지적 대화를 위한", "누구나 알아야 할"],
      topics: ["컴퓨터 사이언스 지식", "인터넷과 웹의 역사", "사이버 보안과 개인 정보", "블록체인과 Web3 백서", "테크 기업의 비즈니스 전략", "네트워킹 핵심 이론", "컴퓨터 구조와 OS 이야기", "데이터 과학자를 위한 통계학"],
      suffixes: ["핵심 가이드", "트렌드 분석", "이야기", "입문 교양", "미래 지도"],
      subtitles: ["개발자가 아니어도 알아두면 쓸모 있는 기술 상식", "디지털 시대를 살아가는 현대인을 위한 IT 바이블", "해킹과 방어로 배우는 실전 인프라 보안", "분산 원장 기술의 미래와 암호화폐 생태계", "미래 비즈니스를 주도하는 테크 트렌드 분석"]
    }
  ];

  const currentLength = books.length;
  for (let i = currentLength + 1; i <= targetCount; i++) {
    const tIdx = i % templates.length;
    const template = templates[tIdx];

    const prefix = template.prefixes[i % template.prefixes.length];
    const topic = template.topics[(i * 13) % template.topics.length];
    const suffix = template.suffixes[(i * 7) % template.suffixes.length];
    const title = `${prefix} ${topic} ${suffix}`;
    
    const subtitle = template.subtitles[i % template.subtitles.length];

    // Author selection
    let author = "";
    if (i % 7 === 0) {
      author = foreignNames[i % foreignNames.length];
    } else {
      const surname = lastNames[i % lastNames.length];
      const givenName1 = firstNames[i % firstNames.length];
      const givenName2 = firstNames[(i + 13) % firstNames.length];
      author = `${surname}${givenName1[0]}${givenName2[1] || givenName1[1] || ''}`;
      if (i % 19 === 0) {
        const coSurname = lastNames[(i + 3) % lastNames.length];
        const coGivenName = firstNames[(i + 9) % firstNames.length];
        author += `, ${coSurname}${coGivenName}`;
      }
    }

    const publisher = publishers[i % publishers.length];
    
    const year = 2024 + (i % 3);
    const month = String((i % 12) + 1).padStart(2, '0');
    const pubDate = `${year}년 ${month}월`;

    const costBase = 18 + (i % 28); // 18k to 45k
    const cost = costBase * 1000;
    const price = Math.round((cost * 0.9) / 100) * 100; // 10% discount

    const salesIndex = Math.round(500 + ((i * 17) % 11500));

    const link = `https://www.yes24.com/product/goods/${180000000 + i}`;

    books.push({
      rank: i,
      title,
      subtitle,
      link,
      author,
      publisher,
      pubDate,
      price,
      cost,
      salesIndex
    });
  }

  return books;
}

import express from 'express';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI } from '@google/genai';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';
import { parseBooksCsv, Book } from './src/utils/csvParser.js';
import { booksCsv } from './src/data/booksCsv.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Initialize Gemini Client
const apiKey = process.env.GEMINI_API_KEY;
const ai = new GoogleGenAI({
  apiKey: apiKey || '',
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    }
  }
});

// Load and Parse Books
const booksList: Book[] = parseBooksCsv(booksCsv);

async function startServer() {
  const app = express();
  app.use(express.json());

  // API 1: Get Initial Book Statistics and Lists
  app.get('/api/books', (req, res) => {
    try {
      // Calculate Stats
      const totalBooks = booksList.length;
      
      // Calculate averages
      let totalSalesIndex = 0;
      let totalPrice = 0;
      let totalCost = 0;
      
      const publisherCount: { [key: string]: number } = {};
      const genreCount: { [key: string]: number } = {
        'AI/인공지능': 0,
        '프로그래밍/코딩': 0,
        '업무자동화/오피스': 0,
        '디자인/드로잉': 0,
        '기타 IT/교양': 0
      };

      booksList.forEach(book => {
        totalSalesIndex += book.salesIndex;
        totalPrice += book.price;
        totalCost += book.cost;

        // Publisher Count
        publisherCount[book.publisher] = (publisherCount[book.publisher] || 0) + 1;

        // Simple Genre Classification based on title/subtitle keywords
        const text = (book.title + ' ' + book.subtitle).toLowerCase();
        if (text.includes('ai') || text.includes('인공지능') || text.includes('제미나이') || text.includes('클로드') || text.includes('gpt') || text.includes('챗gpt') || text.includes('llm') || text.includes('에이전트')) {
          genreCount['AI/인공지능']++;
        } else if (text.includes('코딩') || text.includes('프로그래밍') || text.includes('파이썬') || text.includes('c언어') || text.includes('자바') || text.includes('리액트') || text.includes('개발자') || text.includes('알고리즘') || text.includes('html') || text.includes('css')) {
          genreCount['프로그래밍/코딩']++;
        } else if (text.includes('엑셀') || text.includes('스프레드시트') || text.includes('업무') || text.includes('노션') || text.includes('자동화') || text.includes('파워포인트') || text.includes('한글') || text.includes('office') || text.includes('n8n') || text.includes('zapier')) {
          genreCount['업무자동화/오피스']++;
        } else if (text.includes('디자인') || text.includes('드로잉') || text.includes('일러스트') || text.includes('포토샵') || text.includes('피그마') || text.includes('캔바') || text.includes('이모티콘') || text.includes('스케치업') || text.includes('블렌더')) {
          genreCount['디자인/드로잉']++;
        } else {
          genreCount['기타 IT/교양']++;
        }
      });

      const avgPrice = totalBooks > 0 ? Math.round(totalPrice / totalBooks) : 0;
      const avgCost = totalBooks > 0 ? Math.round(totalCost / totalBooks) : 0;
      const avgSalesIndex = totalBooks > 0 ? Math.round(totalSalesIndex / totalBooks) : 0;

      // Top Publishers
      const topPublishers = Object.entries(publisherCount)
        .map(([name, count]) => ({ name, count }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 5);

      // Best Sellers by Sales Index
      const topSellers = [...booksList]
        .sort((a, b) => b.salesIndex - a.salesIndex)
        .slice(0, 10);

      // Recent Books
      const newBooks = [...booksList]
        .sort((a, b) => {
          const dateA = a.pubDate.replace(/[^0-9]/g, '');
          const dateB = b.pubDate.replace(/[^0-9]/g, '');
          return dateB.localeCompare(dateA);
        })
        .slice(0, 10);

      // Average discount rate
      const avgDiscountRate = totalPrice > 0 ? Math.round(((totalCost - totalPrice) / totalCost) * 100) : 0;

      res.json({
        totalBooks,
        avgPrice,
        avgCost,
        avgDiscountRate,
        avgSalesIndex,
        genreDistribution: Object.entries(genreCount).map(([name, value]) => ({ name, value })),
        topPublishers,
        topSellers,
        newBooks,
        allBooks: booksList.slice(0, 150) // Send loaded books for search/filtering on client
      });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  // API 2: RAG Recommendation Chatbot
  app.post('/api/recommend', async (req, res) => {
    const { message, history } = req.body;
    if (!message) {
      return res.status(400).json({ error: 'Message is required' });
    }

    try {
      if (!apiKey) {
        return res.status(500).json({ 
          error: 'GEMINI_API_KEY environment variable is missing. Please set it in Settings > Secrets.' 
        });
      }

      // 1. Retrieval Phase: Core keyword search and rank
      const keywords = message.toLowerCase().split(/\s+/).filter((k: string) => k.length > 1);
      
      let scoredBooks = booksList.map(book => {
        let score = 0;
        const titleLower = book.title.toLowerCase();
        const subtitleLower = book.subtitle.toLowerCase();
        const authorLower = book.author.toLowerCase();
        const publisherLower = book.publisher.toLowerCase();

        // Exact matches and keyword matches
        keywords.forEach((keyword: string) => {
          if (titleLower.includes(keyword)) score += 15;
          if (subtitleLower.includes(keyword)) score += 8;
          if (authorLower.includes(keyword)) score += 10;
          if (publisherLower.includes(keyword)) score += 5;
        });

        // Boost based on Sales Index to prefer more popular/relevant books
        if (score > 0) {
          score += Math.log10(book.salesIndex + 1) * 2;
        }

        return { book, score };
      });

      // Sort by score desc, then by salesIndex desc
      scoredBooks.sort((a, b) => {
        if (b.score !== a.score) return b.score - a.score;
        return b.book.salesIndex - a.book.salesIndex;
      });

      // Take top 5 retrieved books
      let retrievedBooks = scoredBooks
        .filter(sb => sb.score > 0)
        .map(sb => sb.book)
        .slice(0, 5);

      // Fallback to top selling books if no match
      if (retrievedBooks.length === 0) {
        retrievedBooks = [...booksList]
          .sort((a, b) => b.salesIndex - a.salesIndex)
          .slice(0, 3);
      }

      // 2. Augment Phase: Build detailed contextual prompt
      const bookContexts = retrievedBooks.map((b, idx) => {
        return `[추천 후보 ${idx + 1}]
제목: ${b.title}
부제목: ${b.subtitle || '없음'}
저자: ${b.author}
출판사: ${b.publisher}
출판일: ${b.pubDate}
판매가: ${b.price.toLocaleString()}원 (정가: ${b.cost.toLocaleString()}원)
판매지수: ${b.salesIndex.toLocaleString()}
링크: ${b.link}`;
      }).join('\n\n');

      const systemInstruction = `당신은 대한민국 대표 IT/컴퓨터 과학 전문 도서 추천 AI 비서 "BiblioInsight AI"입니다.
제공되는 도서 목록 데이터(RAG 데이터)를 절대적인 사실 정보로 사용하여 사용자의 도서 추천 요청이나 궁금증에 명확히 답변해야 합니다.

[답변 가이드라인]
1. 인사말 및 답변은 전문적이고, 따뜻하며 신뢰감 있는 한국어 문체로 작성하세요.
2. 유저의 질문 의도(예: 초보자 코딩 공부, 업무자동화, AI 최신 트렌드, 디자인 등)에 가장 알맞은 도서를 검색된 후보군 중에서 2~3권 핵심 선정하여 추천해 주세요.
3. 책을 추천할 때는 해당 도서의 "도서명", "부제목", "저자", "출판사"를 정확히 언급하고, 왜 이 책이 유저에게 유용한지 부제목과 도서 메타데이터를 엮어서 설득력 있고 상세하게 설명하세요.
4. 판매가 및 판매지수, 출판일 등의 객관적인 정보도 활용하여 추천의 신뢰도를 높여주세요.
5. 책의 마지막에 반드시 YES24 상품 링크(데이터셋의 링크 필드)를 제공하여 유저가 상세 페이지로 쉽게 이동할 수 있도록 "[도서 바로가기](${retrievedBooks[0]?.link})" 포맷의 마크다운 링크로 깔끔하게 넣어주세요. (각 책마다 개별 링크를 매핑해서 제시해 주세요)
6. 만약 제공된 추천 후보군이 사용자의 요청과 아주 큰 관련이 없더라도 최대한 데이터셋 내에서 차선책을 찾아 제안하되, 상상해낸 허위 도서 정보를 말하지 마세요. (할루시네이션 방지)`;

      const prompt = `사용자 질문: "${message}"

제공된 관련 도서 데이터:
${bookContexts}

이 데이터를 기반으로 사용자의 질문에 성실하게 답변하고 맞춤 도서를 추천해 주세요.`;

      // 3. Generation Phase: Send request to Gemini API
      const chatConfig: any = {
        model: 'gemini-3.5-flash',
        contents: [
          ...history.map((h: any) => ({
            role: h.role === 'user' ? 'user' : 'model',
            parts: [{ text: h.content }]
          })),
          { role: 'user', parts: [{ text: prompt }] }
        ],
        config: {
          systemInstruction,
          temperature: 0.7
        }
      };

      const response = await ai.models.generateContent(chatConfig);
      const replyText = response.text || '추천 도서를 생성하는 데 실패했습니다.';

      res.json({
        reply: replyText,
        recommendedBooks: retrievedBooks
      });

    } catch (err: any) {
      console.error('Error generating recommendation:', err);
      res.status(500).json({ error: err.message || 'Gemini API 호출 중 오류가 발생했습니다.' });
    }
  });

  // Setup Front-end Dev/Production Routing
  const isProd = process.env.NODE_ENV === 'production';
  if (isProd) {
    // Serve production static assets
    const distPath = path.join(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  } else {
    // Integrate Vite as a middleware
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  }

  const PORT = 3000;
  app.listen(PORT, '0.0.0.0', () => {
    console.log(`BiblioInsight Server is running on port ${PORT}`);
  });
}

startServer().catch(err => {
  console.error('Failed to start fullstack server:', err);
});

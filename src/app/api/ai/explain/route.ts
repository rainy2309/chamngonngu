import { GoogleGenerativeAI } from "@google/generative-ai";

const SYSTEM_PROMPT = `Bạn là trợ lý giải thích từ vựng tiếng Việt cho người điếc và khiếm thính đang học tiếng Việt.

Nhiệm vụ của bạn:
- Giải thích nghĩa của từ bằng tiếng Việt đơn giản.
- Dùng câu ngắn, dễ hiểu.
- Tránh thành ngữ, ẩn dụ, từ quá trừu tượng.
- Luôn có ví dụ cụ thể trong đời sống.
- Nếu là từ ghép, hãy chia nhỏ từng phần để giải thích.
- Nếu từ chưa có dữ liệu ký hiệu từ hệ thống, tuyệt đối không tự tạo, không mô tả, không suy đoán ký hiệu tay.
- Không dùng thuật ngữ ngôn ngữ học.
- Trả lời tối đa 150 từ.
- Giọng văn thân thiện, nhẹ nhàng, phù hợp với người học.

Format trả lời:
1. Nghĩa dễ hiểu:
2. Ví dụ:
3. Khi nào dùng từ này:`;

// Simple in-memory rate limit: max 30 requests per minute per IP
const rateMap = new Map<string, { count: number; resetAt: number }>();
const RATE_LIMIT = 30;
const RATE_WINDOW_MS = 60_000;

function checkRateLimit(ip: string): boolean {
  const now = Date.now();
  const entry = rateMap.get(ip);
  if (!entry || now > entry.resetAt) {
    rateMap.set(ip, { count: 1, resetAt: now + RATE_WINDOW_MS });
    return true;
  }
  if (entry.count >= RATE_LIMIT) return false;
  entry.count++;
  return true;
}

export async function POST(request: Request) {
  try {
    // Rate limit check
    const forwarded = request.headers.get("x-forwarded-for");
    const ip = forwarded?.split(",")[0]?.trim() ?? "unknown";
    if (!checkRateLimit(ip)) {
      return Response.json(
        { error: "Bạn đã gửi quá nhiều yêu cầu. Vui lòng chờ một chút rồi thử lại." },
        { status: 429 },
      );
    }

    const body = await request.json();
    const { word, question, hasSignData, context } = body as {
      word?: string;
      question?: string;
      hasSignData?: boolean;
      context?: string;
    };

    // Validate input
    if (!word || typeof word !== "string" || word.trim().length === 0) {
      return Response.json({ error: "Vui lòng nhập từ cần giải thích." }, { status: 400 });
    }
    if (word.trim().length > 100) {
      return Response.json({ error: "Từ tìm kiếm không được quá 100 ký tự." }, { status: 400 });
    }
    if (question && typeof question === "string" && question.length > 300) {
      return Response.json({ error: "Câu hỏi thêm không được quá 300 ký tự." }, { status: 400 });
    }

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey || apiKey === "your_gemini_api_key_here") {
      return Response.json(
        { error: "Hiện tại CHẠM chưa thể giải thích từ này bằng AI. Bạn hãy thử lại sau nhé." },
        { status: 503 },
      );
    }

    // Build user prompt
    let userPrompt = "";
    if (hasSignData && context) {
      userPrompt = `Từ "${word.trim()}" đã có trong từ điển ký hiệu của hệ thống với thông tin sau:\n${context}\n\nHãy giải thích thêm nghĩa của từ này theo format đã yêu cầu.`;
    } else {
      userPrompt = `Từ "${word.trim()}" chưa có dữ liệu ký hiệu trong hệ thống.\n\nHãy giải thích nghĩa tiếng Việt của từ này theo format đã yêu cầu. Tuyệt đối KHÔNG tự tạo, mô tả hoặc suy đoán bất kỳ ký hiệu tay nào.`;
    }

    if (question && question.trim()) {
      userPrompt += `\n\nNgười dùng hỏi thêm: "${question.trim()}"`;
    }

    // Call Gemini API
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

    const result = await model.generateContent({
      contents: [
        { role: "user", parts: [{ text: SYSTEM_PROMPT + "\n\n" + userPrompt }] },
      ],
    });

    const text = result.response.text();

    return Response.json({ explanation: text });
  } catch (error) {
    console.error("AI explain error:", error);
    return Response.json(
      { error: "Hiện tại CHẠM chưa thể giải thích từ này bằng AI. Bạn hãy thử lại sau nhé." },
      { status: 500 },
    );
  }
}

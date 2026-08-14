import { ENV } from "../lib/env.js";

const LEETCODE_API = "https://alfa-leetcode-api.onrender.com";

// GET /api/problems?limit=50&skip=0&difficulty=Easy&tags=array
export async function getProblemsController(req, res) {
  const { limit = 50, skip = 0, difficulty, tags } = req.query;

  let url = `${LEETCODE_API}/problems?limit=${limit}&skip=${skip}`;
  if (difficulty) url += `&difficulty=${difficulty}`;
  if (tags) url += `&tags=${tags}`;

  try {
    const response = await fetch(url);
    if (!response.ok) throw new Error(`Upstream error: ${response.status}`);
    const data = await response.json();

    // Shape the response for frontend consumption
    const problems = (data.problemsetQuestionList || [])
      .filter((p) => !p.isPaidOnly)
      .map((p) => ({
        id: p.titleSlug,
        title: p.title,
        titleSlug: p.titleSlug,
        difficulty: p.difficulty,
        category: p.topicTags?.map((t) => t.name).join(" • ") || "",
        acRate: Math.round(p.acRate),
      }));

    return res.json({
      total: data.totalQuestions,
      count: problems.length,
      problems,
    });
  } catch (err) {
    return res.status(502).json({ error: `Failed to fetch problems: ${err.message}` });
  }
}

// GET /api/problems/:slug
export async function getProblemBySlugController(req, res) {
  const { slug } = req.params;

  try {
    const response = await fetch(`${LEETCODE_API}/select?titleSlug=${slug}`);
    if (!response.ok) throw new Error(`Upstream error: ${response.status}`);
    const data = await response.json();

    return res.json({
      id: data.titleSlug,
      title: data.questionTitle,
      titleSlug: data.titleSlug,
      difficulty: data.difficulty,
      category: data.topicTags?.map((t) => t.name).join(" • ") || "",
      descriptionHtml: data.question,         // raw HTML from LeetCode
      examples: parseExamples(data.exampleTestcases || ""),
      hints: data.hints || [],
    });
  } catch (err) {
    return res.status(502).json({ error: `Failed to fetch problem: ${err.message}` });
  }
}

// Parse raw example testcases string into structured array
function parseExamples(raw) {
  if (!raw) return [];
  return raw.split("\n\n").map((block, i) => {
    const lines = block.trim().split("\n");
    return {
      input: lines.slice(0, -1).join(", "),
      output: lines[lines.length - 1],
    };
  });
}

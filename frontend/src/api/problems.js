const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000/api";

export async function fetchProblems({ limit = 50, skip = 0, difficulty, tags } = {}) {
  const params = new URLSearchParams({ limit, skip });
  if (difficulty) params.append("difficulty", difficulty);
  if (tags) params.append("tags", tags);

  const res = await fetch(`${API_URL}/problems?${params}`);
  if (!res.ok) throw new Error("Failed to fetch problems");
  return res.json();
}

export async function fetchProblemBySlug(slug) {
  const res = await fetch(`${API_URL}/problems/${slug}`);
  if (!res.ok) throw new Error("Failed to fetch problem");
  return res.json();
}

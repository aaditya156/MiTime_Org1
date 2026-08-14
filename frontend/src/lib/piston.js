// Code execution goes: Browser → Your Backend (Cloud Run) → Piston (GCE VM)
// The backend reads PISTON_URL env var to know which Piston instance to call.
const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000/api";

/**
 * @param {string} language - "javascript" | "python" | "java"
 * @param {string} code - source code to execute
 * @returns {Promise<{success: boolean, output?: string, error?: string}>}
 */
export async function executeCode(language, code) {
  try {
    const res = await fetch(`${API_URL}/execute`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ language, code }),
    });

    const data = await res.json();
    return data;
  } catch (err) {
    return { success: false, error: `Request failed: ${err.message}` };
  }
}

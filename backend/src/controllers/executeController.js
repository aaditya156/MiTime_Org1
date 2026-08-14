// Judge0 CE — free hosted instance, no API key required
// https://ce.judge0.com
const JUDGE0_URL = "https://ce.judge0.com";

// Judge0 language IDs
const LANGUAGE_IDS = {
  javascript: 63,  // Node.js 12.14.0
  python:     71,  // Python 3.8.1
  java:       62,  // Java 13.0.1
};

/**
 * Executes code via Judge0 CE (no API key needed).
 * @param {import("express").Request} req
 * @param {import("express").Response} res
 */
export async function executeCodeController(req, res) {
  const { language, code } = req.body;

  if (!language || !code) {
    return res.status(400).json({ success: false, error: "Language and code are required" });
  }

  const languageId = LANGUAGE_IDS[language];
  if (!languageId) {
    return res.status(400).json({ success: false, error: `Unsupported language: ${language}` });
  }

  try {
    const response = await fetch(`${JUDGE0_URL}/submissions?wait=true`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        language_id: languageId,
        source_code: code,
        stdin: "",
      }),
    });

    if (!response.ok) {
      return res.json({ success: false, error: `Judge0 error: ${response.status}` });
    }

    const data = await response.json();

    // Compile error (e.g. Java syntax error)
    if (data.compile_output) {
      return res.json({ success: false, error: data.compile_output });
    }

    // Runtime error
    if (data.stderr) {
      return res.json({ success: false, error: data.stderr });
    }

    // Status other than Accepted (3)
    if (data.status?.id !== 3) {
      return res.json({
        success: false,
        error: data.message || data.status?.description || "Execution failed",
      });
    }

    return res.json({
      success: true,
      output: data.stdout || "No output",
    });

  } catch (err) {
    return res.status(502).json({
      success: false,
      error: `Could not reach Judge0: ${err.message}`,
    });
  }
}

import vm from "vm";
import { exec } from "child_process";
import fs from "fs";
import path from "path";
import os from "os";

export async function executeCodeController(req, res) {
  const { language, code } = req.body;

  if (!language || !code) {
    return res.status(400).json({ success: false, error: "Language and code are required" });
  }

  try {
    if (language === "javascript" || language === "js") {
      const logs = [];
      const sandbox = {
        console: {
          log: (...args) => logs.push(args.map(a => (typeof a === "object" ? JSON.stringify(a) : String(a))).join(" ")),
          error: (...args) => logs.push(args.map(a => (typeof a === "object" ? JSON.stringify(a) : String(a))).join(" ")),
          warn: (...args) => logs.push(args.map(a => (typeof a === "object" ? JSON.stringify(a) : String(a))).join(" ")),
        },
        Array,
        Object,
        Math,
        String,
        Number,
        Boolean,
        Date,
        RegExp,
        JSON,
        parseInt,
        parseFloat,
        isNaN,
        test1: undefined,
        test2: undefined,
      };

      const context = vm.createContext(sandbox);
      const script = new vm.Script(code);
      script.runInContext(context, { timeout: 3000 });

      return res.json({
        success: true,
        output: logs.join("\n") || "No output",
      });
    } else if (language === "python" || language === "py") {
      const tmpDir = os.tmpdir();
      const filePath = path.join(tmpDir, `solution_${Date.now()}.py`);
      fs.writeFileSync(filePath, code);

      exec(`python3 "${filePath}"`, { timeout: 3000 }, (error, stdout, stderr) => {
        try { fs.unlinkSync(filePath); } catch (_) {}

        if (error && !stdout && stderr) {
          return res.json({ success: false, output: stdout, error: stderr || error.message });
        }
        return res.json({ success: true, output: (stdout || stderr || "No output").trim() });
      });
    } else {
      // Fallback for Java or other languages
      return res.json({
        success: false,
        error: `Language ${language} execution is not enabled on server`,
      });
    }
  } catch (error) {
    return res.json({
      success: false,
      error: error.message || "Code execution failed",
    });
  }
}

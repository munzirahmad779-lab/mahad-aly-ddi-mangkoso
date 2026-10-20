/**
 * Daftarkan Cloudflare MCP server pada konfigurasi agen yang ada di mesin ini.
 * Mengikuti https://developers.cloudflare.com/agent-setup/prompt.md
 * (bagian "Install for other agents" / Cursor & OpenCode).
 *
 * Dibuat cadangan .bak-cfsetup-<timestamp> sebelum menulis.
 */
import fs from "node:fs";
import path from "node:path";

const home = process.env.USERPROFILE;
const stamp = new Date().toISOString().replace(/[:.]/g, "-").slice(0, 19);
const results = [];

function backup(file) {
  const bak = `${file}.bak-cfsetup-${stamp}`;
  fs.copyFileSync(file, bak);
  return bak;
}

function stripJsonc(text) {
  // Buang komentar // dan /* */ agar JSON.parse aman (nilai string tidak disentuh).
  let out = "";
  let inString = false;
  let escape = false;
  for (let i = 0; i < text.length; i += 1) {
    const ch = text[i];
    const next = text[i + 1];
    if (inString) {
      out += ch;
      if (escape) escape = false;
      else if (ch === "\\") escape = true;
      else if (ch === '"') inString = false;
      continue;
    }
    if (ch === '"') {
      inString = true;
      out += ch;
      continue;
    }
    if (ch === "/" && next === "/") {
      while (i < text.length && text[i] !== "\n") i += 1;
      out += "\n";
      continue;
    }
    if (ch === "/" && next === "*") {
      i += 2;
      while (i < text.length && !(text[i] === "*" && text[i + 1] === "/")) i += 1;
      i += 1;
      continue;
    }
    out += ch;
  }
  return out;
}

// ── OpenCode ────────────────────────────────────────────────────────────
{
  const file = path.join(home, ".config", "opencode", "opencode.json");
  if (fs.existsSync(file)) {
    const raw = fs.readFileSync(file, "utf8");
    const data = JSON.parse(stripJsonc(raw));
    data.mcp = data.mcp || {};
    if (data.mcp.cloudflare) {
      results.push(["OpenCode", file, "sudah terdaftar (dilewati)"]);
    } else {
      backup(file);
      data.mcp.cloudflare = {
        type: "remote",
        url: "https://mcp.cloudflare.com/mcp",
        enabled: true,
        oauth: {}
      };
      fs.writeFileSync(file, `${JSON.stringify(data, null, 2)}\n`, "utf8");
      results.push(["OpenCode", file, "ditambahkan"]);
    }
  }
}

// ── Cursor (atau agen yang memakai mcpServers) ──────────────────────────
{
  const file = path.join(home, ".cursor", "mcp.json");
  if (fs.existsSync(file)) {
    const raw = fs.readFileSync(file, "utf8");
    let data;
    try {
      data = JSON.parse(stripJsonc(raw));
    } catch {
      data = { mcpServers: {} };
    }
    data.mcpServers = data.mcpServers || {};
    if (data.mcpServers.cloudflare) {
      results.push(["Cursor", file, "sudah terdaftar (dilewati)"]);
    } else {
      backup(file);
      data.mcpServers.cloudflare = { url: "https://mcp.cloudflare.com/mcp" };
      fs.writeFileSync(file, `${JSON.stringify(data, null, 2)}\n`, "utf8");
      results.push(["Cursor", file, "ditambahkan"]);
    }
  }
}

for (const [agent, file, status] of results) {
  console.log(`${agent.padEnd(8)} ${status.padEnd(26)} ${file}`);
}
if (results.length === 0) console.log("Tidak ada konfigurasi agen yang bisa didaftari.");

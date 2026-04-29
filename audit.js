#!/usr/bin/env node
// @ts-check
const { readFileSync, readdirSync, statSync, existsSync } = require("fs");
const { join, extname } = require("path");

const ROOT = __dirname + "/";
const reset = "\x1b[0m";
const bold = "\x1b[1m";
const red = "\x1b[31m";
const green = "\x1b[32m";
const yellow = "\x1b[33m";
const cyan = "\x1b[36m";
const dim = "\x1b[2m";

const ok = (s) => `${green}✓${reset} ${s}`;
const warn = (s) => `${yellow}⚠${reset} ${s}`;
const fail = (s) => `${red}✗${reset} ${s}`;
const head = (s) => `\n${bold}${cyan}── ${s} ──${reset}`;

let errors = 0;
let warnings = 0;

// ── 1. LAB REGISTRY ──────────────────────────────────────────────────────────

console.log(head("Lab Registry"));

const registryPath = join(ROOT, "lib/lab-registry.tsx");
const registrySource = readFileSync(registryPath, "utf8");

// Extract slugs from registry
const slugMatches = [...registrySource.matchAll(/slug:\s*["']([^"']+)["']/g)];
const registrySlugs = slugMatches.map((m) => m[1]);

console.log(`  ${dim}${registrySlugs.length} experiments in registry${reset}`);

// Check for duplicate slugs
const seen = new Set();
for (const slug of registrySlugs) {
  if (seen.has(slug)) {
    console.log(fail(`Duplicate slug: "${slug}"`));
    errors++;
  }
  seen.add(slug);
}

// Extract switch cases from page.tsx
const pagePath = join(ROOT, 'app/lab/[slug]/page.tsx');
const pageSource = readFileSync(pagePath, "utf8");
const caseMatches = [...pageSource.matchAll(/case\s+["']([^"']+)["']/g)];
const switchSlugs = new Set(caseMatches.map((m) => m[1]));

// Component files in components/lab/
const labComponentsDir = join(ROOT, "components/lab");
const componentFiles = readdirSync(labComponentsDir)
  .filter((f) => [".tsx", ".ts", ".jsx", ".js"].includes(extname(f)))
  .map((f) => f.replace(/\.[^.]+$/, "").toLowerCase());

// Cross-check each registry slug
let hasSwitchIssue = false;
for (const slug of registrySlugs) {
  const inSwitch = switchSlugs.has(slug);
  // Match slug words against component filename (order-insensitive)
  const slugWords = slug.split("-").map((w) => w.toLowerCase());
  const hasComponent = componentFiles.some((f) => {
    const fname = f.toLowerCase();
    return slugWords.every((w) => fname.includes(w));
  });

  if (!inSwitch && !hasComponent) {
    console.log(warn(`"${slug}" → no switch case, no component  ${dim}(placeholder)${reset}`));
    warnings++;
  } else if (!inSwitch) {
    console.log(warn(`"${slug}" → component exists but no switch case`));
    warnings++;
    hasSwitchIssue = true;
  } else if (!hasComponent) {
    console.log(warn(`"${slug}" → switch case exists but no component file`));
    warnings++;
  } else {
    console.log(ok(`"${slug}"`));
  }
}

// Orphaned components (in components/lab but not matched by any registry slug)
const allLabFiles = readdirSync(labComponentsDir).filter((f) =>
  [".tsx", ".ts", ".jsx", ".js"].includes(extname(f))
);
for (const file of allLabFiles) {
  const fname = file.replace(/\.[^.]+$/, "").toLowerCase();
  const matchedByAnySlug = registrySlugs.some((slug) => {
    const slugWords = slug.split("-").map((w) => w.toLowerCase());
    return slugWords.every((w) => fname.includes(w));
  });
  if (!matchedByAnySlug) {
    console.log(warn(`Orphaned component: "${file}" not matched by any registry slug`));
    warnings++;
  }
}

// ── 2. ENV VARS ───────────────────────────────────────────────────────────────

console.log(head("Environment Variables"));

const requiredEnvs = [
  "DATABASE_URL",
  "OPENAI_API_KEY",
  "NEXT_PUBLIC_SUPABASE_URL",
  "NEXT_PUBLIC_SUPABASE_ANON_KEY",
];

// Load .env.local manually so vars are visible without dotenv package
const envPath = join(ROOT, ".env.local");
const envExists = existsSync(envPath);
const envSource = envExists ? readFileSync(envPath, "utf8") : "";
if (envExists) {
  for (const line of envSource.split("\n")) {
    const match = line.match(/^([^#=\s]+)=(.*)$/);
    if (match) process.env[match[1]] = match[2].replace(/^["']|["']$/g, "");
  }
}

for (const key of requiredEnvs) {
  const inEnvFile = envSource.includes(`${key}=`);
  const inProcess = !!process.env[key];
  if (inProcess || inEnvFile) {
    console.log(ok(key));
  } else {
    console.log(fail(`${key} missing`));
    errors++;
  }
}

// ── 3. PUBLIC ASSETS ─────────────────────────────────────────────────────────

console.log(head("Public Assets (> 500 KB)"));

const publicDir = join(ROOT, "public");

function walkDir(dir) {
  const results = [];
  for (const entry of readdirSync(dir)) {
    const full = join(dir, entry);
    const stat = statSync(full);
    if (stat.isDirectory()) {
      results.push(...walkDir(full));
    } else {
      results.push({ path: full.replace(ROOT, ""), size: stat.size });
    }
  }
  return results;
}

const publicFiles = walkDir(publicDir);
const largeFiles = publicFiles.filter((f) => f.size > 500 * 1024).sort((a, b) => b.size - a.size);

if (largeFiles.length === 0) {
  console.log(ok("No large files found"));
} else {
  for (const f of largeFiles) {
    const kb = (f.size / 1024).toFixed(0);
    const mb = f.size > 1024 * 1024 ? ` ${dim}(${(f.size / 1024 / 1024).toFixed(1)} MB)${reset}` : "";
    console.log(warn(`${kb} KB${mb} — ${f.path}`));
    warnings++;
  }
}

// ── 4. PRISMA SCHEMA ─────────────────────────────────────────────────────────

console.log(head("Prisma Schema"));

const schemaPath = join(ROOT, "prisma/schema.prisma");
if (!existsSync(schemaPath)) {
  console.log(fail("schema.prisma not found"));
  errors++;
} else {
  const schema = readFileSync(schemaPath, "utf8");
  const models = [...schema.matchAll(/^model\s+(\w+)/gm)].map((m) => m[1]);
  console.log(ok(`${models.length} models: ${models.join(", ")}`));

  // Check for missing @updatedAt on models with createdAt
  const modelBlocks = [...schema.matchAll(/model\s+\w+\s*\{([^}]+)\}/g)];
  for (const block of modelBlocks) {
    const hasCreatedAt = block[1].includes("createdAt");
    const hasUpdatedAt = block[1].includes("updatedAt");
    const modelName = block[0].match(/model\s+(\w+)/)[1];
    if (hasCreatedAt && !hasUpdatedAt) {
      console.log(warn(`${modelName} has createdAt but no updatedAt`));
      warnings++;
    }
  }
}

// ── SUMMARY ───────────────────────────────────────────────────────────────────

console.log(`\n${bold}── Summary ──${reset}`);
if (errors === 0 && warnings === 0) {
  console.log(ok("All checks passed"));
} else {
  if (errors > 0) console.log(fail(`${errors} error${errors !== 1 ? "s" : ""}`));
  if (warnings > 0) console.log(warn(`${warnings} warning${warnings !== 1 ? "s" : ""}`));
}
console.log();
process.exit(errors > 0 ? 1 : 0);

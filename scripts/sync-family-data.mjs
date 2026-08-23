import { cpSync, existsSync, mkdirSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const projectRoot = dirname(dirname(fileURLToPath(import.meta.url)));
const privateDirectory = join(projectRoot, "data");
const familyFile = join(privateDirectory, "family.json");
const configFile = join(privateDirectory, "config.json");
const imagesDirectory = join(privateDirectory, "images");
const generatedDirectory = join(projectRoot, "public", "family-data");

function fail(message) {
  console.error(`\nPrivate data setup error: ${message}`);
  console.error("Read SETUP.md or copy data.example to data before starting the app.\n");
  process.exit(1);
}

if (!existsSync(familyFile)) fail("data/family.json is missing.");
if (!existsSync(configFile)) fail("data/config.json is missing.");
if (!existsSync(imagesDirectory)) fail("data/images is missing.");

let members;
try {
  members = JSON.parse(readFileSync(familyFile, "utf8"));
} catch (error) {
  fail(`data/family.json is not valid JSON (${error.message}).`);
}

if (!Array.isArray(members)) fail("data/family.json must contain a JSON array.");

for (const [index, member] of members.entries()) {
  if (typeof member?.id !== "number" || typeof member?.name !== "string") {
    fail(`member at index ${index} must have a numeric id and a name.`);
  }
}

rmSync(generatedDirectory, { recursive: true, force: true });
mkdirSync(generatedDirectory, { recursive: true });
writeFileSync(join(generatedDirectory, "family.json"), `${JSON.stringify(members, null, 2)}\n`);
cpSync(configFile, join(generatedDirectory, "config.json"));
cpSync(imagesDirectory, join(generatedDirectory, "images"), { recursive: true });

console.log(`Prepared ${members.length} private family records for local use.`);

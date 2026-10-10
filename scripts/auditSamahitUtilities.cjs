const fs = require("node:fs");
const path = require("node:path");

const read = (file) => fs.readFileSync(path.join(process.cwd(), file), "utf8").replace(/\r\n/g, "\n");
const catalog = read("src/data/utilityToolsCatalog.ts");
const runner = read("src/components/utilities/UtilityToolRunnerModal.tsx");
const everyday = read("src/pages/utilities/EverydayToolPage.tsx");

const tools = [...catalog.matchAll(/\{\s*id:\s*"([^"]+)"\s*,\s*categoryId:\s*"([^"]+)"\s*,\s*titleEn:\s*"([^"]+)"/g)]
  .map((match) => ({ id: match[1], title: match[3] }));
const uniqueCases = [...new Set([...runner.matchAll(/case\s+"([^"]+)":/g)].map((match) => match[1]))];
const duplicateIds = tools.map((tool) => tool.id).filter((id, index, all) => all.indexOf(id) !== index);
const missingHandlers = tools.filter((tool) => !uniqueCases.includes(tool.id));
const orphanHandlers = uniqueCases.filter((id) => !tools.some((tool) => tool.id === id));
const failures = [];

if (tools.length !== 50) failures.push(`Expected 50 catalog tools, found ${tools.length}`);
if (duplicateIds.length) failures.push(`Duplicate catalog IDs: ${duplicateIds.join(", ")}`);
if (missingHandlers.length) failures.push(`Tools without dispatcher handlers: ${missingHandlers.map((tool) => tool.id).join(", ")}`);
if (orphanHandlers.length) failures.push(`Dispatcher IDs absent from catalog: ${orphanHandlers.join(", ")}`);
if (!runner.includes("NativeDownloads.saveToDownloads(")) failures.push("Main utility runner lacks native Android save path");
if (!everyday.includes("NativeDownloads.saveToDownloads(")) failures.push("Everyday utility page lacks native Android save path");
if (!everyday.includes("const save = async")) failures.push("Everyday utility save helper is not asynchronous");
if (/\bpdf\.save\s*\(/.test(everyday)) failures.push("Everyday utility contains a jsPDF direct-save bypass");
if (/\bfetch\s*\(|\baxios\./.test(runner)) failures.push("Main utility engine contains a direct network request; review offline requirement");

const metadataStart = runner.indexOf("function PhotoMetadataCleanerEngine");
const metadataEnd = runner.indexOf("\nfunction ", metadataStart + 10);
const metadata = runner.slice(metadataStart, metadataEnd < 0 ? undefined : metadataEnd);
if (!metadata.includes("await downloadBlob(cleanedBlob")) failures.push("Photo Metadata Cleaner does not await the shared save operation");
if (metadata.includes('toast.success(isHi ? "लोकेशन व गुप्त डेटा हट गया!"')) failures.push("Photo Metadata Cleaner reports success before the shared save confirms");

const khataStart = runner.indexOf("function CustomerKhataBookEngine");
const khataEnd = runner.indexOf("\nfunction ", khataStart + 10);
const khata = runner.slice(khataStart, khataEnd < 0 ? undefined : khataEnd);
if (!khata.includes('try {\n      localStorage.setItem("samahit_khata_v1"')) failures.push("Customer Khata writes to localStorage without guarded error handling");

if (failures.length) {
  console.error("SAMAHIT static audit FAILED");
  for (const failure of failures) console.error(` - ${failure}`);
  process.exit(1);
}
console.log("SAMAHIT static audit PASSED");
console.log(` - Catalog tools: ${tools.length}`);
console.log(` - Unique dispatcher handlers: ${uniqueCases.length}`);
console.log(" - Catalog/dispatcher mapping: complete, no duplicates");
console.log(" - Native Android save path: present in both utility interfaces");
console.log(" - Everyday PDF export bypass: none detected");
console.log(" - Direct network requests in main utility engine: none detected");
console.log(" - Metadata export awaits save; Khata localStorage writes are guarded");
console.log("NOTE: Static source audit only; not an on-device functional test.");

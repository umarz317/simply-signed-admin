const fs = require("fs");
const path = require("path");

const inputPath = path.join(__dirname, "..", "ADMIN_UI_FEATURES.md");
const outputPath = path.join(__dirname, "..", "ADMIN_UI_FEATURES.pdf");

const pageWidth = 612;
const pageHeight = 792;
const margin = 56;
const contentWidth = pageWidth - margin * 2;
const topY = pageHeight - margin;
const bottomY = margin;

function escapePdfText(value) {
  return value.replace(/\\/g, "\\\\").replace(/\(/g, "\\(").replace(/\)/g, "\\)");
}

function estimateTextWidth(text, fontSize) {
  return text.length * fontSize * 0.52;
}

function wrapText(text, fontSize, maxWidth) {
  const words = text.split(/\s+/).filter(Boolean);
  const lines = [];
  let current = "";

  for (const word of words) {
    const candidate = current ? `${current} ${word}` : word;
    if (estimateTextWidth(candidate, fontSize) <= maxWidth) {
      current = candidate;
      continue;
    }

    if (current) {
      lines.push(current);
      current = word;
      continue;
    }

    let chunk = "";
    for (const char of word) {
      const candidateChunk = `${chunk}${char}`;
      if (estimateTextWidth(candidateChunk, fontSize) <= maxWidth) {
        chunk = candidateChunk;
      } else {
        if (chunk) {
          lines.push(chunk);
        }
        chunk = char;
      }
    }
    current = chunk;
  }

  if (current) {
    lines.push(current);
  }

  return lines.length > 0 ? lines : [""];
}

function parseMarkdown(markdown) {
  const lines = markdown.split(/\r?\n/);
  const blocks = [];
  let orderedIndex = 0;

  for (const rawLine of lines) {
    const line = rawLine.trimEnd();

    if (!line.trim()) {
      blocks.push({ type: "spacer", height: 10 });
      orderedIndex = 0;
      continue;
    }

    if (line.startsWith("# ")) {
      blocks.push({ type: "heading1", text: line.slice(2).trim() });
      orderedIndex = 0;
      continue;
    }

    if (line.startsWith("## ")) {
      blocks.push({ type: "heading2", text: line.slice(3).trim() });
      orderedIndex = 0;
      continue;
    }

    if (line.startsWith("### ")) {
      blocks.push({ type: "heading3", text: line.slice(4).trim() });
      orderedIndex = 0;
      continue;
    }

    if (line.startsWith("- ")) {
      blocks.push({ type: "bullet", text: line.slice(2).trim() });
      orderedIndex = 0;
      continue;
    }

    const orderedMatch = line.match(/^\d+\.\s+(.*)$/);
    if (orderedMatch) {
      orderedIndex += 1;
      blocks.push({ type: "ordered", index: orderedIndex, text: orderedMatch[1].trim() });
      continue;
    }

    blocks.push({ type: "paragraph", text: line.trim() });
    orderedIndex = 0;
  }

  return blocks;
}

function buildRenderableLines(blocks) {
  const renderLines = [];

  for (const block of blocks) {
    if (block.type === "spacer") {
      renderLines.push({ kind: "spacer", height: block.height });
      continue;
    }

    if (block.type === "heading1") {
      renderLines.push({ kind: "text", text: block.text, font: "F2", size: 22, x: margin, gapAfter: 8 });
      continue;
    }

    if (block.type === "heading2") {
      renderLines.push({ kind: "text", text: block.text, font: "F2", size: 16, x: margin, gapBefore: 4, gapAfter: 4 });
      continue;
    }

    if (block.type === "heading3") {
      renderLines.push({ kind: "text", text: block.text, font: "F2", size: 13, x: margin, gapBefore: 2, gapAfter: 2 });
      continue;
    }

    if (block.type === "paragraph") {
      const lines = wrapText(block.text, 11, contentWidth);
      for (const line of lines) {
        renderLines.push({ kind: "text", text: line, font: "F1", size: 11, x: margin });
      }
      renderLines.push({ kind: "spacer", height: 5 });
      continue;
    }

    if (block.type === "bullet") {
      const bulletWidth = 14;
      const lines = wrapText(block.text, 11, contentWidth - bulletWidth);
      lines.forEach((line, index) => {
        renderLines.push({
          kind: "text",
          text: `${index === 0 ? "• " : "  "}${line}`,
          font: "F1",
          size: 11,
          x: margin + 8,
        });
      });
      renderLines.push({ kind: "spacer", height: 3 });
      continue;
    }

    if (block.type === "ordered") {
      const prefix = `${block.index}. `;
      const prefixWidth = estimateTextWidth(prefix, 11);
      const lines = wrapText(block.text, 11, contentWidth - prefixWidth - 6);
      lines.forEach((line, index) => {
        renderLines.push({
          kind: "text",
          text: `${index === 0 ? prefix : " ".repeat(prefix.length)}${line}`,
          font: "F1",
          size: 11,
          x: margin + 8,
        });
      });
      renderLines.push({ kind: "spacer", height: 3 });
    }
  }

  return renderLines;
}

function paginate(lines) {
  const pages = [];
  let currentPage = [];
  let y = topY;

  for (const item of lines) {
    if (item.kind === "spacer") {
      y -= item.height;
      if (y < bottomY) {
        pages.push(currentPage);
        currentPage = [];
        y = topY;
      }
      continue;
    }

    const gapBefore = item.gapBefore || 0;
    const lineHeight = item.size + 4;
    const gapAfter = item.gapAfter || 0;
    const needed = gapBefore + lineHeight + gapAfter;

    if (y - needed < bottomY) {
      pages.push(currentPage);
      currentPage = [];
      y = topY;
    }

    y -= gapBefore;
    currentPage.push({
      text: item.text,
      font: item.font,
      size: item.size,
      x: item.x,
      y,
    });
    y -= lineHeight + gapAfter;
  }

  if (currentPage.length > 0) {
    pages.push(currentPage);
  }

  return pages;
}

function buildPdf(pages) {
  const objects = [];

  function addObject(content) {
    objects.push(content);
    return objects.length;
  }

  const fontRegularId = addObject("<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>");
  const fontBoldId = addObject("<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Bold >>");

  const pageObjectIds = [];

  for (const page of pages) {
    const streamLines = ["BT"];
    let currentFont = "";
    let currentSize = 0;

    for (const line of page) {
      if (line.font !== currentFont || line.size !== currentSize) {
        streamLines.push(`/${line.font} ${line.size} Tf`);
        currentFont = line.font;
        currentSize = line.size;
      }
      streamLines.push(`1 0 0 1 ${line.x} ${line.y} Tm (${escapePdfText(line.text)}) Tj`);
    }

    streamLines.push("ET");
    const stream = streamLines.join("\n");
    const contentId = addObject(`<< /Length ${Buffer.byteLength(stream, "utf8")} >>\nstream\n${stream}\nendstream`);
    const pageId = addObject(
      `<< /Type /Page /Parent PAGES_ID 0 R /MediaBox [0 0 ${pageWidth} ${pageHeight}] /Resources << /Font << /F1 ${fontRegularId} 0 R /F2 ${fontBoldId} 0 R >> >> /Contents ${contentId} 0 R >>`
    );
    pageObjectIds.push(pageId);
  }

  const pagesId = addObject(
    `<< /Type /Pages /Kids [${pageObjectIds.map((id) => `${id} 0 R`).join(" ")}] /Count ${pageObjectIds.length} >>`
  );

  objects.forEach((value, index) => {
    if (index + 1 === 0) {
      return;
    }
    objects[index] = value.replace(/PAGES_ID/g, String(pagesId));
  });

  const catalogId = addObject(`<< /Type /Catalog /Pages ${pagesId} 0 R >>`);

  let pdf = "%PDF-1.4\n";
  const offsets = [0];

  objects.forEach((object, index) => {
    offsets.push(Buffer.byteLength(pdf, "utf8"));
    pdf += `${index + 1} 0 obj\n${object}\nendobj\n`;
  });

  const xrefOffset = Buffer.byteLength(pdf, "utf8");
  pdf += `xref\n0 ${objects.length + 1}\n`;
  pdf += "0000000000 65535 f \n";

  for (let index = 1; index < offsets.length; index += 1) {
    pdf += `${String(offsets[index]).padStart(10, "0")} 00000 n \n`;
  }

  pdf += `trailer\n<< /Size ${objects.length + 1} /Root ${catalogId} 0 R >>\n`;
  pdf += `startxref\n${xrefOffset}\n%%EOF`;

  return pdf;
}

const markdown = fs.readFileSync(inputPath, "utf8");
const blocks = parseMarkdown(markdown);
const lines = buildRenderableLines(blocks);
const pages = paginate(lines);
const pdf = buildPdf(pages);

fs.writeFileSync(outputPath, pdf, "binary");
console.log(`Created ${outputPath}`);

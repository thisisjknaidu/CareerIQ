import fs from "fs/promises";
import path from "path";
import { PDFParse } from "pdf-parse";
import mammoth from "mammoth";

const parsePdf = async (filePath) => {
  const fileBuffer = await fs.readFile(filePath);

  const parser = new PDFParse({
    data: fileBuffer,
  });

  try {
    const result = await parser.getText();

    return result.text.trim();
  } finally {
    await parser.destroy();
  }
};

const parseDocx = async (filePath) => {
  const result = await mammoth.extractRawText({
    path: filePath,
  });

  return result.value.trim();
};

const parseResumeFile = async (filePath) => {
  const extension = path.extname(filePath).toLowerCase();

  if (extension === ".pdf") {
    return parsePdf(filePath);
  }

  if (extension === ".docx") {
    return parseDocx(filePath);
  }

  throw new Error("Unsupported resume file type.");
};

export default parseResumeFile;

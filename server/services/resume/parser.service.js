import { PDFParse } from "pdf-parse";
import mammoth from "mammoth";

const parsePdf = async (fileBuffer) => {
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

const parseDocx = async (fileBuffer) => {
  const result = await mammoth.extractRawText({
    buffer: fileBuffer,
  });

  return result.value.trim();
};

const parseResumeFile = async (fileBuffer, originalFileName) => {
  const extension = originalFileName.toLowerCase().split(".").pop();

  if (extension === "pdf") {
    return parsePdf(fileBuffer);
  }

  if (extension === "docx") {
    return parseDocx(fileBuffer);
  }

  throw new Error("Unsupported resume file type.");
};

export default parseResumeFile;

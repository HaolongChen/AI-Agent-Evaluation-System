import { tool } from "langchain";
import * as z from "zod";
import { readdir, readFile } from "node:fs/promises";
import { join } from "node:path";
import { logger } from "../../../utils/logger.ts";

const DEFAULT_MAX_CHARS = 1800;
const DOCS_ROOT = `${process.cwd()}/local_shell/momen_docs`;
const DEFAULT_MAX_FILES = 20;
const MAX_REASONING_HEADINGS = 6;

const normalizeText = (value: string): string =>
  value.replace(/\s+/g, " ").trim();

const collectMarkdownFiles = async (
  dir: string,
  maxFiles: number,
  includeSummaryFiles: boolean,
  collector: string[] = [],
): Promise<string[]> => {
  if (collector.length >= maxFiles) {
    return collector;
  }

  const entries = await readdir(dir, { withFileTypes: true });
  for (const entry of entries) {
    if (collector.length >= maxFiles) {
      break;
    }

    const fullPath = join(dir, entry.name);
    if (entry.isDirectory()) {
      await collectMarkdownFiles(
        fullPath,
        maxFiles,
        includeSummaryFiles,
        collector,
      );
      continue;
    }

    if (!entry.isFile() || !entry.name.endsWith(".md")) {
      continue;
    }

    if (!includeSummaryFiles && entry.name.endsWith(".summary.md")) {
      continue;
    }

    if (includeSummaryFiles && !entry.name.endsWith(".summary.md")) {
      continue;
    }

    if (entry.isFile()) {
      collector.push(fullPath);
    }
  }

  return collector;
};

const extractHeadings = (markdown: string): string[] => {
  return markdown
    .split("\n")
    .map((line) => line.trim())
    .filter((line) => /^(#{1,6})\s+/.test(line))
    .map((line) => line.replace(/^(#{1,6})\s+/, ""));
};

const extractByHeading = (markdown: string, heading: string): string => {
  const escapedHeading = heading.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const regex = new RegExp(
    `(^#{1,6}\\s+${escapedHeading}\\s*$)([\\s\\S]*?)(?=^#{1,6}\\s+|$)`,
    "im",
  );
  const matched = markdown.match(regex);
  if (!matched) {
    return "";
  }

  const title = matched[1] ?? "";
  const body = matched[2] ?? "";
  return `${title}\n${body}`.trim();
};

const extractByKeyword = (markdown: string, keyword: string): string => {
  const lines = markdown.split("\n");
  const target = keyword.toLowerCase();
  const windows: string[] = [];

  for (let i = 0; i < lines.length; i += 1) {
    if (!lines[i]?.toLowerCase().includes(target)) {
      continue;
    }

    const start = Math.max(0, i - 3);
    const end = Math.min(lines.length, i + 4);
    windows.push(lines.slice(start, end).join("\n").trim());
    if (windows.length >= 3) {
      break;
    }
  }

  return windows.join("\n\n---\n\n");
};

const scoreKeywordMatch = (markdown: string, keyword: string): number => {
  const target = keyword.toLowerCase();
  return markdown.toLowerCase().split(target).length - 1;
};

const hasHeading = (markdown: string, heading: string): boolean => {
  return extractByHeading(markdown, heading).length > 0;
};

const loadCandidateDocs = async (
  path?: string,
): Promise<{ files: string[]; usingSummaryFiles: boolean }> => {
  if (path && path.trim()) {
    const targetPath = join(
      DOCS_ROOT,
      path.startsWith("/") ? path.slice(1) : path,
    );
    return { files: [targetPath], usingSummaryFiles: false };
  }

  const summaryFiles = await collectMarkdownFiles(
    DOCS_ROOT,
    DEFAULT_MAX_FILES,
    true,
  );
  if (summaryFiles.length > 0) {
    return { files: summaryFiles, usingSummaryFiles: true };
  }

  const markdownFiles = await collectMarkdownFiles(
    DOCS_ROOT,
    DEFAULT_MAX_FILES,
    false,
  );
  return { files: markdownFiles, usingSummaryFiles: false };
};

const selectBestFile = async (
  files: string[],
  usingSummaryFiles: boolean,
  heading?: string,
  keyword?: string,
): Promise<{ selectedFile: string; markdown: string }> => {
  const firstFile = files[0];
  if (!firstFile) {
    throw new Error("No markdown content available.");
  }

  const term = keyword?.trim() || heading?.trim();

  if (!term) {
    return {
      selectedFile: firstFile,
      markdown: await readFile(firstFile, "utf-8"),
    };
  }

  if (!usingSummaryFiles) {
    const filenameScore = (filePath: string): number => {
      const lowerPath = filePath.toLowerCase();
      const loweredTerm = term.toLowerCase();
      if (lowerPath.includes(loweredTerm)) {
        return 2;
      }

      const tokens = loweredTerm.split(/[^a-z0-9]+/).filter(Boolean);
      if (tokens.some((token) => lowerPath.includes(token))) {
        return 1;
      }

      return 0;
    };

    const rankedByPath = [...files].sort(
      (a, b) => filenameScore(b) - filenameScore(a),
    );
    const selectedFile = rankedByPath[0] ?? firstFile;
    return {
      selectedFile,
      markdown: await readFile(selectedFile, "utf-8"),
    };
  }

  let bestMatch: {
    selectedFile: string;
    markdown: string;
    score: number;
  } | null = null;
  for (const filePath of files) {
    const markdown = await readFile(filePath, "utf-8");
    const headingScore =
      heading && heading.trim() && hasHeading(markdown, heading.trim()) ? 2 : 0;
    const keywordScore =
      keyword && keyword.trim()
        ? Math.min(3, scoreKeywordMatch(markdown, keyword.trim()))
        : 0;
    const totalScore = headingScore + keywordScore;

    if (!bestMatch || totalScore > bestMatch.score) {
      bestMatch = {
        selectedFile: filePath,
        markdown,
        score: totalScore,
      };
    }

    if (totalScore >= 4) {
      break;
    }
  }

  return {
    selectedFile: bestMatch?.selectedFile ?? firstFile,
    markdown: bestMatch?.markdown ?? (await readFile(firstFile, "utf-8")),
  };
};

const truncateContent = (
  value: string,
  maxChars: number,
): { excerpt: string; truncated: boolean } => {
  if (value.length <= maxChars) {
    return { excerpt: value, truncated: false };
  }

  return {
    excerpt: `${value.slice(0, maxChars)}...`,
    truncated: true,
  };
};

export const read_markdown_docs = tool(
  async ({
    path,
    heading,
    keyword,
    maxChars,
  }: {
    path?: string;
    heading?: string;
    keyword?: string;
    maxChars?: number;
  }) => {
    try {
      const resolvedMaxChars =
        typeof maxChars === "number" &&
        Number.isFinite(maxChars) &&
        maxChars > 0
          ? Math.floor(maxChars)
          : DEFAULT_MAX_CHARS;

      const { files, usingSummaryFiles } = await loadCandidateDocs(path);

      if (files.length === 0) {
        return {
          message: "No markdown documents were found under /momen_docs/.",
        };
      }

      const { selectedFile, markdown } = await selectBestFile(
        files,
        usingSummaryFiles,
        heading,
        keyword,
      );
      const headings = extractHeadings(markdown);

      const selectedSection =
        heading && heading.trim()
          ? extractByHeading(markdown, heading.trim())
          : keyword && keyword.trim()
            ? extractByKeyword(markdown, keyword.trim())
            : markdown;

      const normalizedExcerpt = normalizeText(selectedSection || markdown);
      const { excerpt, truncated } = truncateContent(
        normalizedExcerpt,
        resolvedMaxChars,
      );

      return {
        file: selectedFile.slice(DOCS_ROOT.length),
        usingSummaryFiles,
        headingFilter: heading ?? null,
        keywordFilter: keyword ?? null,
        headings: headings.slice(0, 20),
        resultSummary: `Loaded documentation excerpt from ${selectedFile.slice(DOCS_ROOT.length)} after scanning ${files.length} file(s).`,
        truncated,
        charLimit: resolvedMaxChars,
        excerpt,
        reasoningArtifacts: {
          source: "read_markdown_docs",
          focus: heading?.trim() || keyword?.trim() || "document_overview",
          keyHeadings: headings.slice(0, MAX_REASONING_HEADINGS),
          evidenceTargets: [
            `${selectedFile.slice(DOCS_ROOT.length)}${
              heading?.trim() ? `#${heading.trim()}` : ""
            }`,
          ],
          decisionHint:
            "Cite evidenceTargets and keyHeadings when deriving rubric checks; avoid raw markdown dumps.",
        },
      };
    } catch (error) {
      logger.error("Error reading markdown docs:", error);
      return {
        message: "Failed to read markdown docs.",
        error: error instanceof Error ? error.message : String(error),
      };
    }
  },
  {
    name: "read_markdown_docs",
    description:
      "Read large markdown docs lazily by heading or keyword with bounded output.",
    schema: z.object({
      path: z
        .string()
        .optional()
        .describe(
          "Relative path under /momen_docs, for example '/introduction.md'. Omit to auto-select a file.",
        ),
      heading: z
        .string()
        .optional()
        .describe("Optional markdown heading to extract as a focused section."),
      keyword: z
        .string()
        .optional()
        .describe("Optional keyword to extract nearby text windows."),
      maxChars: z
        .number()
        .optional()
        .describe(
          "Maximum returned excerpt length. Defaults to 1800 characters.",
        ),
    }),
  },
);

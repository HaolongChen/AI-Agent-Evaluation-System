import * as cheerio from "cheerio";

import { Element } from "domhandler";
import { convertElementToMarkdown } from "dom-to-semantic-markdown";
import { JSDOM } from "jsdom";
import { writeFile, mkdir } from "node:fs/promises";

const DOCUMENT_SUMMARY_CHAR_LIMIT = 1200;

const summarizeMarkdown = (markdown: string): string => {
	const normalized = markdown.replaceAll(/\s+/g, " ").trim();
	if (!normalized) {
		return "No content extracted from the documentation page.";
	}

	if (normalized.length <= DOCUMENT_SUMMARY_CHAR_LIMIT) {
		return normalized;
	}

	return `${normalized.slice(0, DOCUMENT_SUMMARY_CHAR_LIMIT)}...`;
};

const patch = async (
	dom: cheerio.Cheerio<Element>,
	function_: cheerio.CheerioAPI,
): Promise<unknown> => {
	const length = dom.length;
	if (!length) return;
	if (length === 1) {
		const href = dom.first().attr("href") || dom.first().attr("data-href");
		if (href) {
			const resolvedHref = await storeDocumentations(
				href.at(-1) === "/" ? href.slice(0, -1) : href,
				href === "/" ? "/introduction"
				: (href.at(-1) === "/" ? href.slice(0, -1)
				: href),
			);
			return {
				name: dom.first().text(),
				href: resolvedHref,
			};
		} else
		{
			throw new Error("Unexpected document structure: link element without href.");
		}
	} else if (length === 2) {
		const children = await Promise.all(
			dom
				.eq(1)
				.find("ul:first > li")
				.toArray()
				.map(async (child) => {
					if (function_(child).children().length === 0) {
						return {
							name: function_(child).text(),
							description:
								"This is block. Next siblings until the next block are represented as children",
						};
					}
					return await patch(function_(child).children(), function_);
				}),
		);
		return {
			title: dom.first().text(),
			children,
		};
	} else {
		console.warn(
			`Unexpected number of children: ${length}. The structure of the Momen docs might have changed. Please check the logs for more details.`,
		);
		throw new Error(
			`Unexpected number of children: ${length}. The structure of the Momen docs might have changed. Please check the logs for more details.`,
		);
	}
};

export const fetchSideBar = async () => {
	try {
		const response = await fetch(process.env.MOMEN_DOCS_URL);
		if (!response.ok) {
			console.error(
				`Failed to fetch Momen docs. Status: ${response.status} ${response.statusText}`,
			);
			throw new Error(
				`Failed to fetch Momen docs. Status: ${response.status} ${response.statusText}`,
			);
		}
		const html = await response.text();
		const $ = cheerio.load(html);

		const contentElements = $("aside ul:first > li").toArray();
		if (!contentElements || contentElements.length === 0) {
			console.error(
				"Failed to extract contents from Momen docs. The structure of the page might have changed.",
			);
			throw new Error(
				"Failed to extract contents from Momen docs. The structure of the page might have changed.",
			);
		}
		const contents = await Promise.all(
			contentElements.map(async (li) => {
				return await patch($(li).children(), $);
			}),
		);
		return contents;
	} catch (error) {
		console.error("Error occurred while testing read_momen_docs tool:", error);
		throw new Error(
			"An error occurred while testing read_momen_docs tool. Please check the logs for more details.",
		);
	}
};

const storeDocumentations = async (route: string, path: string): Promise<string> => {
	try {
		const response = await fetch(process.env.MOMEN_DOCS_URL + route);
		if (!response.ok) {
			console.error(
				`Failed to fetch Momen docs. Status: ${response.status} ${response.statusText}`,
			);
			throw new Error(
				`Failed to fetch Momen docs. Status: ${response.status} ${response.statusText}`,
			);
		}
		const html = await response.text();
		const { document } = new JSDOM(html).window;
		const article = document.querySelector("main");
		if (!article) {
			console.error(
				"Failed to find the main article element in Momen docs. The structure of the page might have changed.",
			);
			throw new Error(
				"Failed to find the main article element in Momen docs. The structure of the page might have changed.",
			);
		}
		const markdown = convertElementToMarkdown(article);
		const directory = `${process.cwd()}/local_shell/momen_docs${path}`
			.split("/")
			.slice(0, -1)
			.join("/");
		await mkdir(directory, { recursive: true });
		const fileBaseName = path.split("/").pop() ?? "index";
		const markdownPath = `${directory}/${fileBaseName}.md`;
		const summaryPath = `${directory}/${fileBaseName}.summary.md`;
		await Promise.all([
			writeFile(markdownPath, markdown, "utf8"),
			writeFile(summaryPath, summarizeMarkdown(markdown), "utf8"),
		]);
		return (
			directory.slice(process.cwd().length + 12) + `/${path.split("/").pop()}.md`
		);
	} catch (error) {
		console.error("Error occurred while testing read_momen_docs tool:", error);
		throw new Error(
			"An error occurred while testing read_momen_docs tool. Please check the logs for more details.",
		);
	}
};

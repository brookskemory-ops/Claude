import { marked } from "marked";

/**
 * Renders admin-authored markdown to HTML. Blog content is authored only by admins,
 * so it is trusted; do not pass untrusted user input through this.
 */
export function renderMarkdown(md: string): string {
  return marked.parse(md ?? "", { async: false }) as string;
}

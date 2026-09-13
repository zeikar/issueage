import { readdirSync, readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { join } from "node:path";
import { expect, it } from "vitest";

const srcDir = fileURLToPath(new URL("../src", import.meta.url));

// issue content is untrusted, so raw HTML may only come from the sanitizing getHTML
it("renders {@html} only through getHTML", () => {
  const offenders = [];
  for (const file of readdirSync(srcDir, { recursive: true }) as string[]) {
    if (!file.endsWith(".svelte")) {
      continue;
    }
    const source = readFileSync(join(srcDir, file), "utf8");
    for (const [tag, expression] of source.matchAll(/\{@html\s+([^}]*)\}/g)) {
      // the whole expression must be a single getHTML(...) call, with nothing concatenated to it
      if (!/^getHTML\([^()]*\)$/.test(expression.trim())) {
        offenders.push(`${file}: ${tag}`);
      }
    }
  }

  expect(offenders).toEqual([]);
});

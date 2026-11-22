import { createHash } from "node:crypto";
import { decodeHTML } from "entities";
import { revision } from "./commands.ts";

async function get(url: string) {
  const response = await fetch(url, {signal: AbortSignal.timeout(30000)});
  const reader = response.body?.getReader();
  const chunks: Uint8Array[] = [];
  let size = 0;
  if (reader) {
    for (;;) {
      const chunk = await reader.read();
      if (chunk.done) break;
      size += chunk.value.length;
      if (size > 3000000) { await reader.cancel(); throw new Error("Source exceeds 3 MB."); }
      chunks.push(chunk.value);
    }
  }
  const body = Buffer.concat(chunks);
  return {requested:url, final:response.url, status:response.status, sha256:createHash("sha256").update(body).digest("hex"), text:body.toString("utf8")};
}

export async function inspect(repo: string, pin?: string) {
  const root = "https://huggingface.co/api/models/" + repo;
  if (!pin) {
    const head = await get(root);
    if (head.status !== 200) throw new Error("Cannot discover current SHA: HTTP " + head.status);
    pin = revision(JSON.parse(head.text).sha);
  }
  const request = root + "/revision/" + pin;
  const {text,...source} = await get(request);
  if (source.status !== 200 || source.final !== request) throw new Error("Pinned metadata unavailable: " + JSON.stringify(source));
  const data = JSON.parse(text);
  if (revision(data.sha) !== pin || data.id?.toLowerCase() !== repo.toLowerCase()) throw new Error("Pinned repository or SHA mismatch.");
  const documents = [];
  for (const name of ["README.md","LICENSE"]) {
    for (const route of ["raw","resolve"]) {
      const {text:_,...read} = await get(`https://huggingface.co/${repo}/${route}/${pin}/${name}`);
      documents.push(read);
    }
  }
  return {repo,sha:pin,gated:data.gated,license:data.cardData?.license,
    weights:data.siblings?.map((s:{rfilename:string})=>s.rfilename).filter((n:string)=>/\.(safetensors|bin|pt|pth|ckpt|npz|gguf)$/i.test(n)),
    source,documents};
}

export function quoteMatches(page: string, quote: string) {
  const clean = (s:string) => s.normalize("NFKC").toLowerCase().trim().replace(/\s+/gu," ");
  const visible = page.replace(/<!--[\s\S]*?-->|<(script|style|noscript|template)\b[^>]*>[\s\S]*?<\/\1\s*>/gi," ").replace(/<[^>]+>/g," ");
  return Boolean(clean(quote)) && clean(decodeHTML(visible)).includes(clean(quote));
}
export async function quoteCheck(url:string, quote:string) {
  if (new URL(url).protocol !== "https:") throw new Error("Expected an HTTPS claim URL.");
  const {text,...source} = await get(url);
  return {...source, match:source.status===200 && quoteMatches(text,quote)};
}

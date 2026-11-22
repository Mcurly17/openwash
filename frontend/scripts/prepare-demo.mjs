import { cpSync } from "node:fs";
cpSync(new URL("../../docs/demo/", import.meta.url), new URL("../public/demo/", import.meta.url), {recursive:true});

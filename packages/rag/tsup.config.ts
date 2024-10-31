import { defineConfig } from "tsup";

export default defineConfig((opts) => ({
  entry: ["src/index.ts", "src/custom-api-provider.ts"],
  clean: !opts.watch,
  target: "es2022",
  format: ["cjs", "esm"],
  dts: false,
  tsconfig: "tsconfig.json",
  sourcemap: true,
  treeshake: true,
  splitting: false,
}));

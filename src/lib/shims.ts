import { Shim } from './types/shim';

const prefix = '__azf_shim_import';

/**
 * A shim for `__dirname` and `__filename` using `import.meta.url` because they are not available in ESM.
 *
 * @see https://nodejs.org/docs/latest/api/esm.html#no-__filename-or-__dirname
 */
const dirnameShimCode = `const __dirname = ${prefix}_PATH.dirname(${prefix}_URL.fileURLToPath(import.meta.url));
const __filename = ${prefix}_URL.fileURLToPath(import.meta.url);`;
export const DIRNAME_SHIM: Shim = {
  imports: [
    { isDefault: true, as: `${prefix}_PATH`, from: 'path' },
    { isDefault: true, as: `${prefix}_URL`, from: 'url' },
  ],
  code: dirnameShimCode,
};

/**
 * A shim for require because esbuild cannot convert CJS requires to ESM imports.
 */
const requireShimCode = `const require = ${prefix}_MODULE.createRequire(import.meta.url);`;
export const REQUIRE_SHIM: Shim = {
  imports: [{ isDefault: true, as: `${prefix}_MODULE`, from: 'module' }],
  code: requireShimCode,
};

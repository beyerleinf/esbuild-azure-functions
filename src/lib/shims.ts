const prefix = '__azf_shim_import';

/**
 * A shim for `__dirname` and `__filename` using `import.meta.url` because they are not available in ESM.
 *
 * @see https://nodejs.org/docs/latest/api/esm.html#no-__filename-or-__dirname
 */
export const DIRNAME_SHIM = `
import ${prefix}_PATH from 'path';
import ${prefix}_URL from 'url'

const __dirname = ${prefix}_PATH.dirname(${prefix}_URL.fileURLToPath(import.meta.url));
const __filename = ${prefix}_URL.fileURLToPath(import.meta.url);
`;

/**
 * A shim for require because esbuild cannot convert CJS requires to ESM imports.
 */
export const REQUIRE_SHIM = `
import ${prefix}_MODULE from 'module';

const require = ${prefix}_MODULE.createRequire(import.meta.url);
`;

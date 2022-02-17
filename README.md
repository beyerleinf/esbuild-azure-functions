# esbuild-azure-functions <!-- omit in toc -->

> A builder for Azure Function powered by esbuild.

[![Continuous Integration Workflow](https://github.com/beyerleinf/esbuild-azure-functions/actions/workflows/ci.yml/badge.svg)](https://github.com/beyerleinf/esbuild-azure-functions/actions/workflows/ci.yml) [![Codecov](https://img.shields.io/codecov/c/github/beyerleinf/esbuild-azure-functions)](https://app.codecov.io/gh/beyerleinf/esbuild-azure-functions) [![npm](https://img.shields.io/npm/v/esbuild-azue-functions)](https://www.npmjs.com/package/esbuild-azure-functions) [![npm](https://img.shields.io/npm/dm/esbuild-azure-functions)](https://www.npmjs.com/package/esbuild-azure-functions) [![GitHub](https://img.shields.io/github/license/beyerleinf/esbuild-azure-functions)](https://github.com/beyerleinf/esbuild-azure-functions/blob/main/LICENSE)

This tool is designed to work with Azure Functions written in TypeScript. It uses [esbuild](https://esbuild.github.io/) to create crazy small bundles. This is especially helpful with cold starts and deployment duration.

# Table of Contents <!-- omit in toc -->
- [Build](#build)
  - [From the CLI](#from-the-cli)
  - [Programmatically](#programmatically)
- [Watch mode](#watch-mode)
  - [From the CLI](#from-the-cli-1)
  - [Programmatically](#programmatically-1)
- [Config](#config)
  - [`project`](#project)
  - [`entryPoints`](#entrypoints)
  - [`exclude`](#exclude)
  - [`clean`](#clean)
  - [`logLevel`](#loglevel)
  - [`esbuildOptions`](#esbuildoptions)
- [Benchmark](#benchmark)
  - [Package size](#package-size)
  - [Build time](#build-time)

## Build

### From the CLI

By default, *esbuild-azure-functions* expects a config file called `esbuild-azure-functions.config.json` in the directory you are running it from. You can specify a different config location with the `-c | --config` flag. Refer to the [Config section](#config) for config options.

```
npx esbuild-azure-functions [-c <config location>]
```

### Programmatically

Install *esbuild-azure-functions* into your project

```
npm i --save-dev esbuild-azure-functions
```

```ts
import { build, BuilderConfigType } from 'esbuild-azure-functions';

const config: BuilderConfigType = {
  project: process.cwd(),
  esbuildOptions: {
    outdir: 'MyCustomOutDir'
  }
};

const main = async () => {
  await build(config);
}

main();

```

## Watch mode

### From the CLI

By default, *esbuild-azure-functions* expects a config file called `esbuild-azure-functions.config.json` in the directory you are running it from. You can specify a different config location with the `-c | --config` flag. Refer to the [Config section](#config) for config options.

```
npx esbuild-azure-functions --watch [-c <config location>]
```

### Programmatically

Install *esbuild-azure-functions* into your project

```
npm i --save-dev esbuild-azure-functions
```

```ts
import { watch, BuilderConfigType } from 'esbuild-azure-functions';

const config: BuilderConfigType = {
  project: process.cwd(),
  esbuildOptions: {
    outdir: 'MyCustomOutDir'
  }
};

const main = async () => {
  await watch(config);
}

main();

```

## Config

A simple starting config could look like this
```json
{
  "project": ".",
  "esbuildOptions": {
    "outdir": "MyCustomOutDir"
  }
}
```

### `project`

**Required:** yes  
**Type:** `string`  
**Description:** The root folder of the Azure Functions project you want to build.  
**Example:** `.`  
**Default:**: `undefined`

### `entryPoints`

**Required:** no  
**Type:** `string[]`  
**Description:** Specify custom entry points if you don't want *esbuild-azure-functions* to search for **index.ts** files in the `project` folder.  
**Example:**: `[ "my-functions/entry.ts" ]`  
**Default:**: `undefined`

### `exclude`

**Required:** no  
**Type:** `string[]`  
**Description:** Specify directories as glob patterns to exclude when searching for **index.ts** files.  
**Example:**: `[ "**/utils/**" ]`  
**Default:**: `undefined`

### `clean`

**Required:** no  
**Type:** `boolean`  
**Description:** Specify whether *esbuild-azure-functions* should the delete the output directory before building.  
**Default:**: `false`

### `logLevel`
**Required:** no  
**Type:** `"off" | "error" | "warn" | "info" | "verbose"`  
**Description:** Specify the verbosity of log messages.  
**Default:**: `"error"`

### `esbuildOptions`

**Required:** no  
**Type:** [Refer to the official docs](https://esbuild.github.io/api/#build-api)  
**Description:** Customize the default esbuild config used.  
**Default:**
```ts
{
  minify: true,
  bundle: true,
  sourcemap: false,
  watch: false,
  platform: 'node',
  splitting: true,
  format: 'esm',
  outdir: 'build',
}
```

## Benchmark

### Package size

![package size chart](.docs/size-chart_win.png)

### Build time

![package size chart](.docs/speed-chart.png)
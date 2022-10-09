import { Shim, ShimImport } from '../types/shim';

export const shimBuilder = (shims: Shim[]) => {
  const importStatements = shims.flatMap(({ imports }) => imports.map(shimImport => buildImportStatement(shimImport)));
  const codeParts = shims.flatMap(({ code }) => code);

  return [importStatements.join('\n'), codeParts.join('\n')].join('\n');
};

const buildImportStatement = (shimImport: ShimImport) => {
  if (shimImport.isDefault) {
    return `import ${shimImport.as} from '${shimImport.from}';`;
  } else {
    return `import * as ${shimImport.as} from '${shimImport.from}';`;
  }
};

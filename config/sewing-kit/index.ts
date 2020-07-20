import {
  Package,
  createComposedProjectPlugin,
  createProjectTestPlugin,
  createProjectBuildPlugin,
} from '@sewing-kit/plugins';
import {react} from '@sewing-kit/plugin-react';
import {javascript} from '@sewing-kit/plugin-javascript';
import {typescript} from '@sewing-kit/plugin-typescript';
import {buildFlexibleOutputs} from '@sewing-kit/plugin-package-flexible-outputs';

export function quiltPackage({binaryOnly = true, jestEnv = 'jsdom'} = {}) {
  return createComposedProjectPlugin<Package>('Quilt.Package', [
    javascript(),
    typescript(),
    react(),
    buildFlexibleOutputs({
      esnext: !binaryOnly,
      esmodules: !binaryOnly,
    }),
    createProjectBuildPlugin('Quilt.PackageBuild', ({hooks}) => {
      hooks.target.hook(({hooks}) => {
        hooks.configure.hook(hooks => {
          hooks.babelIgnorePatterns.hook(ext => [
            ...ext,
            '**/*.test.ts',
            '**/*.test.tsx',
          ]);
        });
      });
    }),
    createProjectTestPlugin('Quilt.PackageTest', ({hooks}) => {
      hooks.configure.hook(hooks => {
        hooks.jestEnvironment?.hook(() => jestEnv);

        hooks.jestConfig?.hook(config => ({
          ...config,
          transform: {
            ...config.transform,
            '\\.(gql|graphql)$': 'jest-transform-graphql',
          },
          watchPathIgnorePatterns: [
            ...config.watchPathIgnorePatterns,
            '<rootDir>/.*/tests?/.*fixtures',
          ],
        }));

        hooks.babelConfig?.hook(() => ({
          presets: [
            ['babel-preset-shopify/node', {typescript: true}],
            'babel-preset-shopify/react',
          ],
          sourceMaps: 'inline',
        }));
      });
    }),
  ]);
}

import {
  Package,
  createComposedProjectPlugin,
  createProjectTestPlugin,
} from '@sewing-kit/plugins';
import {react} from '@sewing-kit/plugin-react';
import {javascript} from '@sewing-kit/plugin-javascript';
import {typescript} from '@sewing-kit/plugin-typescript';
import {buildFlexibleOutputs} from '@sewing-kit/plugin-package-flexible-outputs';

export function quiltPackage({binaryOnly = true, jestEnv = 'jsdom'} = {}) {
  return createComposedProjectPlugin<Package>('Quilt.DefaultProject', [
    javascript(),
    typescript(),
    react(),
    buildFlexibleOutputs({
      esnext: !binaryOnly,
      esmodules: !binaryOnly,
    }),
    createProjectTestPlugin('Quilt.Test', ({hooks}) => {
      hooks.configure.hook(hooks => {
        hooks.jestEnvironment?.hook(_ => jestEnv);

        hooks.jestConfig?.hook(config => ({
          ...config,
          setupFiles: ['../../tests/setup.ts'],
          setupFilesAfterEnv: ['../../tests/each-test.ts'],
          testRegex: '.*\\.test\\.tsx?$',
          transform: {
            ...config.transform,
            '\\.(gql|graphql)$': 'jest-transform-graphql',
          },
          watchPathIgnorePatterns: [
            ...config.watchPathIgnorePatterns,
            '<rootDir>/node_modules/',
            '<rootDir>/packages/web-worker/.*/fixtures',
            '<rootDir>/packages/react-server/.*/fixtures',
          ],
          coverageDirectory: './coverage/',
        }));

        hooks.babelConfig?.hook(_ => ({
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
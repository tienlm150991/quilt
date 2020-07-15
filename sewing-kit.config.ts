import {createWorkspace} from '@sewing-kit/config';
import {createWorkspaceTestPlugin} from '@sewing-kit/plugins';
import {eslint} from '@sewing-kit/plugin-eslint';
import {jest} from '@sewing-kit/plugin-jest';
import {workspaceTypeScript} from '@sewing-kit/plugin-typescript';

export default createWorkspace(workspace => {
  workspace.use(
    eslint(),
    jest(),
    workspaceTypeScript(),
    createWorkspaceTestPlugin('Quilt.NonPackageTests', ({hooks}) => {
      hooks.configure.hook(hooks => {
        hooks.jestConfig?.hook(config => ({
          ...config,
          projects: [
            ...config.projects,
            {
              ...(config.projects.length ? config.projects[0] : {}),
              displayName: 'quilt',
              rootDir: 'tests',
              setupFiles: ['./setup.ts'],
              setupFilesAfterEnv: ['./each-test.ts'],
            },
          ],
        }));
      });
    }),
  );
});

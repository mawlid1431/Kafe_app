// Learn more: https://docs.expo.dev/guides/monorepo/
const { getDefaultConfig } = require('expo/metro-config');
const path = require('node:path');

const projectRoot = __dirname;
const workspaceRoot = path.resolve(projectRoot, '../..');

const config = getDefaultConfig(projectRoot);

// Bun workspaces hoist shared dependencies to the repo root, so Metro has to
// watch the whole workspace and resolve from both node_modules trees.
config.watchFolders = [workspaceRoot];
config.resolver.nodeModulesPaths = [
  path.resolve(projectRoot, 'node_modules'),
  path.resolve(workspaceRoot, 'node_modules'),
];
// Force resolution through the paths above. Without this Metro walks parent
// directories and can pick up a second copy of React, which breaks hooks.
config.resolver.disableHierarchicalLookup = true;

module.exports = config;

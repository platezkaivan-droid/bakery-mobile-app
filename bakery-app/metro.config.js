const { getDefaultConfig } = require('expo/metro-config');
const path = require('path');

const config = getDefaultConfig(__dirname);

config.resolver.alias = {
  '@': __dirname,
  'react-native-web/dist/index': path.resolve(__dirname, 'node_modules/react-native-web/dist/index.js'),
};

// Добавляем пустое расширение для файлов без расширения
config.resolver.sourceExts = [...config.resolver.sourceExts, 'jsx', 'js', 'ts', 'tsx'];

module.exports = config;

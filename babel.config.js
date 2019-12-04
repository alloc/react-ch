module.exports = {
  presets: [
    '@babel/typescript',
    '@babel/react',
    ['@babel/env', { exclude: ['transform-regenerator'] }],
  ],
  plugins: ['transform-class-properties'],
}

// eslint.config.cjs
const prettierPlugin = require("eslint-plugin-prettier");

module.exports = [
  {
    ignores: ["node_modules", "dist", "build"], // Bỏ qua các thư mục không cần lint
  },
  {
    files: ["**/*.js"], // Chỉ định các file cần lint
    languageOptions: {
      ecmaVersion: "latest", // Sử dụng phiên bản ECMAScript mới nhất
      sourceType: "module", // Hỗ trợ import/export
    },
    rules: {
      "prettier/prettier": "error", // Tích hợp Prettier
      "no-unused-vars": "warn", // Cảnh báo biến không sử dụng
      "no-console": "off", // Cho phép console.log
    },
    plugins: {
      prettier: prettierPlugin, // Sử dụng plugin Prettier
    },
  },
];

module.exports = function (api) {
  api.cache(true);
  return {
    presets: [
      ["babel-preset-expo", { jsxImportSource: "nativewind" }],
      "nativewind/babel",
    ],
    plugins: [
      // Other plugins can be added here
      "react-native-reanimated/plugin", // Ensure this is listed last
    ],
  };
};

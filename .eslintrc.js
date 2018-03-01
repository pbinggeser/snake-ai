module.exports = {
  parser: "babel-eslint",
  extends: [
    "airbnb",
    "react-app",
    "plugin:jsx-a11y/recommended",
    "prettier",
    "prettier/react"
  ],
  plugins: ["react", "jsx-a11y", "import", "prettier"],
  rules: {
    "prettier/prettier": "error",
    "linebreak-style": 0,
    "jsx-a11y/href-no-hash": "off",
    "no-param-reassign": [
      2,
      {
        props: false
      }
    ]
  }
};

const config = {
  content: ["./src/**/*.{html,js,svelte,ts}"],

  theme: {
    extend: {
      colors: {
        "svelte-orange": "#ff3e00",
      },
    },
  },

  plugins: [require("@tailwindcss/forms")],
};

module.exports = config;

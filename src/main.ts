import "bulma";
import App from "./App.svelte";
import Config from "../config.json";

const app = new App({
  target: document.body,
  props: {
    Config,
  },
});

export default app;

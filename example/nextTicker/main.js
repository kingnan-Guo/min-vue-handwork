import { createApp } from "../../lib/mini-vue-handwork.esm.js";
import App from "./App.js";

const rootContainer = document.querySelector("#root");
createApp(App).mount(rootContainer);

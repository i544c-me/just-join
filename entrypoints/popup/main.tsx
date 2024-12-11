import { render } from "solid-js/web";

import "./style.css";
import App from "./App";

// biome-ignore lint/style/noNonNullAssertion: must be not null
render(() => <App />, document.getElementById("root")!);

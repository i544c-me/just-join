import { render } from "solid-js/web";

import "./style.css";
import App from "./App";
import { Provider } from "./Context";

render(() => (
<Provider>
  <App />
</Provider>
),
// biome-ignore lint/style/noNonNullAssertion: must be not null
document.getElementById("root")!);

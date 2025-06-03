import { createSignal, onMount } from "solid-js";
// import init from "@memo-app/wasm";
import { CardContainer } from "./CardContainer/CardContainer.jsx";
import { globalStyle } from "@macaron-css/core";

globalStyle("body", {
  "--color-bg": "#fff",
  "--color-bg-border": "#eee",
});

// globalStyle("body", {
//   "--color-bg": "#111",
//   "--color-bg-border": "#0f0",
// });

globalStyle("body", {
  fontFamily: `-apple-system, BlinkMacSystemFont, "Segoe UI", "Noto Sans",
          Helvetica, Arial, sans-serif, "Apple Color Emoji", "Segoe UI Emoji" !important;`,
});

globalStyle("pre, code", {
  fontFamily: `ui-monospace, SFMono-Regular, SF Mono, Menlo, Consolas,
          Liberation Mono, monospace !important;`,
});

function App() {
  onMount(async () => {
    const res = await fetch("http://localhost:8082/");
    const text = await res.text();
    console.log(text); // "Hello, World! 🎉"
    // init();
  });

  return (
    <div
      style={{
        width: "100vw",
        height: "100vh",
        display: "flex",
        overflow: "hidden",
        position: "relative",
      }}
    >
      <script src="https://cdn.jsdelivr.net/npm/marked/marked.min.js"></script>
      <CardContainer position={{ x: 0, y: 0 }}></CardContainer>
    </div>
  );
}

export default App;

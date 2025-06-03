import { styled } from "@macaron-css/solid";
import { createEffect, createSignal } from "solid-js";

type EditorPanelProps = {
  initialTitle: string;
  initialContents: string;
  onChangeTitle: (v: string) => void;
  onChangeContents: (v: string) => void;
  onSave: () => void;
};

export const EditorPanel = (props: EditorPanelProps) => {
  const [localTitle, setLocalTitle] = createSignal(props.initialTitle);
  const [localContents, setLocalContents] = createSignal(props.initialContents);

  createEffect(() => props.onChangeTitle(localTitle()));
  createEffect(() => props.onChangeContents(localContents()));

  return (
    <StyledPanel>
      <h2>カードを編集</h2>
      <label>
        タイトル
        <input
          type="text"
          value={localTitle()}
          onInput={(e) => setLocalTitle(e.currentTarget.value)}
          style={{ width: "100%", "margin-bottom": "1rem" }}
        />
      </label>
      <label>
        コンテンツ (Markdown)
        <textarea
          value={localContents()}
          onInput={(e) => setLocalContents(e.currentTarget.value)}
          style={{
            width: "100%",
            height: "40vh",
            "margin-bottom": "1rem",
            "font-family": "monospace",
          }}
        />
      </label>
      <button onClick={props.onSave}>Save</button>
    </StyledPanel>
  );
};

const StyledPanel = styled("div", {
  base: {
    position: "fixed",
    top: 0,
    right: 0,
    width: "50vw",
    height: "100vh",
    padding: "1rem",
    background: "white",
    boxShadow: "-4px 0 8px rgba(0,0,0,0.2)",
    overflow: "auto",
    zIndex: 2000,
    transition: "all 0.3s ease-in-out",
  },
});

// src/components/Card.tsx
import {
  Accessor,
  createEffect,
  createSignal,
  For,
  JSX,
  onMount,
  Show,
} from "solid-js";
import { styled } from "@macaron-css/solid";
import type { Card as CardProps } from "../schema/Card.js";
import { useDrag } from "../hooks/useDrag.js";
import { Dimmension } from "../schema/Point.js";
import { marked } from "marked";
import DOMPurify from "dompurify";
import { useResize } from "../hooks/useResize.js";
import { CSSProperties, style } from "@macaron-css/core";
import { MenuItem, useContextMenu } from "../hooks/useContextMenu.js";
import { Portal } from "solid-js/web";
import { updateCard } from "../hooks/useCardAPI.js";
import { EditorPanel } from "../EditorPanel/EditorPanel.jsx";
import { TagInput } from "../Tag/Tag.jsx";

export const Card = (props: {
  card: CardProps;
  scaleFactor: Accessor<number>;
}) => {
  let ref!: HTMLDivElement;

  const [pos, setPos] = createSignal<Dimmension>({ ...props.card.position });
  const [size, setSize] = createSignal<Dimmension>({ ...props.card.size });
  const [title, setTitle] = createSignal(props.card.title);
  const [tags, setTags] = createSignal(props.card.tag_ids);
  const [contents, setContents] = createSignal(props.card.contents);
  const [isEditing, setIsEditing] = createSignal(false);
  const menuItems: MenuItem[] = [
    { label: "コピー", action: () => console.log("コピーしました") },
    {
      label: "編集",
      action: () => {
        setIsEditing(true);
      },
    },
    { label: "削除", action: () => console.log("削除しました") },
  ];
  const { onContextMenu, ContextMenu } = useContextMenu(menuItems);
  const dirs = ["n", "s", "e", "w", "ne", "nw", "se", "sw"] as const;
  const handles = {} as Record<(typeof dirs)[number], HTMLDivElement>;

  // ドラッグ＆リサイズフックをマウント時に適用
  onMount(() => {
    useDrag(ref, pos, setPos, props.scaleFactor);
    dirs.forEach((dir) =>
      useResize(
        handles[dir],
        dir,
        pos,
        setPos,
        size,
        setSize,
        props.scaleFactor
      )
    );
  });

  // 外部 props.card が変わったら反映
  createEffect(() => setPos({ ...props.card.position }));
  createEffect(() => setSize({ ...props.card.size }));
  // （title/contents はユーザー編集で overwrite するので同期しない）

  const handleSaveCard = () => {
    updateCard({
      id: props.card.id,
      position: pos(),
      size: size(),
      title: title(),
      contents: contents(),
    });
  };

  return (
    <>
      <StyledCard
        onContextMenu={onContextMenu}
        onPointerDown={(e) => {
          console.log("Card.onPointerDown");
        }}
        style={{
          position: "absolute",
          left: `${pos().x}px`,
          top: `${pos().y}px`,
          width: `${size().x}px`,
          height: `${size().y}px`,
        }}
      >
        <StyledCardHeader ref={ref}></StyledCardHeader>
        <StyledCardContent>
          <div>
            <h1>{title()}</h1>
            <p>
              x:{pos().x}, y:{pos().y}
            </p>
            <div class={style({ overflowX: "auto" })}>
              <TagInput />
            </div>
            <div innerHTML={DOMPurify.sanitize(marked(contents())) || ""}></div>
          </div>
          {dirs.map((dir) => (
            <div
              ref={(el) => (handles[dir] = el!)}
              class="resize-handle"
              style={getHandleStyle(dir, size())}
            />
          ))}
        </StyledCardContent>
      </StyledCard>

      <Portal>
        <ContextMenu />
        <Show when={isEditing()}>
          <EditorPanel
            initialTitle={title()}
            initialContents={contents()}
            onChangeTitle={setTitle}
            onChangeContents={setContents}
            onSave={() => {
              handleSaveCard();
              setIsEditing(false);
            }}
          />
        </Show>
      </Portal>
    </>
  );
};

const getHandleStyle = (direction: string, size: Dimmension): CSSProperties => {
  const half = 0;
  const handleSize = 10;
  const cursorMap: Record<string, string> = {
    n: "ns-resize",
    s: "ns-resize",
    e: "ew-resize",
    w: "ew-resize",
    ne: "nesw-resize",
    sw: "nesw-resize",
    nw: "nwse-resize",
    se: "nwse-resize",
  };
  const styles: Record<string, CSSProperties> = {
    n: {
      top: `${half}px`,
      left: `${handleSize}px`,
      height: `${handleSize}px`,
      width: `${size.x - 2 * handleSize}px`,
    },
    s: {
      bottom: `${half}px`,
      left: `${handleSize}px`,
      height: `${handleSize}px`,
      width: `${size.x - 2 * handleSize}px`,
    },
    e: {
      top: `${handleSize}px`,
      right: `${half}px`,
      height: `${size.y - 2 * handleSize}px`,
      width: `${handleSize}px`,
    },
    w: {
      top: `${handleSize}px`,
      left: `${half}px`,
      height: `${size.y - 2 * handleSize}px`,
      width: `${handleSize}px`,
    },
    ne: {
      top: `${half}px`,
      right: `${half}px`,
      height: `${handleSize}px`,
      width: `${handleSize}px`,
    },
    nw: {
      top: `${half}px`,
      left: `${half}px`,
      height: `${handleSize}px`,
      width: `${handleSize}px`,
    },
    se: {
      bottom: `${half}px`,
      right: `${half}px`,
      height: `${handleSize}px`,
      width: `${handleSize}px`,
    },
    sw: {
      bottom: `${half}px`,
      left: `${half}px`,
      height: `${handleSize}px`,
      width: `${handleSize}px`,
    },
  };
  return {
    position: "absolute",
    cursor: cursorMap[direction],
    ...styles[direction],
  };
};

const StyledCard = styled("div", {
  base: {
    position: "absolute",
    backgroundColor: "white",
    boxShadow: "0 0.5rem 1rem rgba(0, 0, 0, 0.15)",
    borderRadius: "0.75rem",
    padding: "0.75rem",
    overflow: "hidden",
    touchAction: "none",
    userSelect: "none",
    display: "flex",
    flexDirection: "column",
    "& li": {
      listStyle: "disc",
      marginLeft: "1rem",
    },
  },
});

const StyledCardHeader = styled("div", {
  base: {
    width: "100%",
    height: "1rem",
  },
});

const StyledCardContent = styled("div", {
  base: {
    overflow: "hidden",
    width: "100%",
    height: "100%",
    flexGrow: 1,
  },
});

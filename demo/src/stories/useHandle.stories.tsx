import type { Meta, StoryObj } from "@storybook/react";
import ResizableExpr, { NewResizableProps, ResizableRefHandle } from "../../../src/experamintal/Resizable";

import { Button } from "./Button";
import React from "react";
import MrtTable from "./Table/MrtTable";
import MrtCustomHeadless from "./Table/MrtCustomHeadless/MrtCustomHeadless";
import useResizeable from "../../../src/experamintal/useResizeable";
import useResizeableHandle, { UseHandleProps } from "../../../src/experamintal/useResizeableHandle";

const UseHandleDemo = (args) => {
  const nodeRef = React.useRef<HTMLDivElement>(null);
  const horizontalHandleRef = React.useRef<HTMLElement>(null);
  // const verticalHandleRef = React.useRef<HTMLElement>(null);
  // const { style: rs, eventHandlers } = useResizeable({ nodeRef, handleRef: horizontalHandleRef, ...args });
  const { eventHandlers } = useResizeableHandle({ nodeRef, handleRef: horizontalHandleRef, ...args });
  return (
    <div>
      <div style={{ ...BoxStyle }} ref={nodeRef}>
        box
      </div>
      <div {...eventHandlers} style={{ cursor: "ew-resize", userSelect: "none" }}>
        horizontal-handle
      </div>
    </div>
  );
};

// More on how to set up stories at: https://storybook.js.org/docs/writing-stories#default-export
const meta = {
  title: "my-react-components/useResizeableHandle",
  component: UseHandleDemo,
  parameters: {
    // Optional parameter to center the component in the Canvas. More info: https://storybook.js.org/docs/configure/story-layout
    layout: "centered",
  },
  // This component will have an automatically generated Autodocs entry: https://storybook.js.org/docs/writing-docs/autodocs
  tags: ["autodocs"],
  // More on argTypes: https://storybook.js.org/docs/api/argtypes
  argTypes: {
    // backgroundColor: { control: "color" },
  },
} satisfies Meta<UseHandleProps>;

export default meta;
type Story = StoryObj<typeof meta>;

const BoxStyle = {
  border: "solid",
  borderRadius: 12,
  // width: 120,
  display: "flex",
  flexDirection: "column",
  justifyContent: "center",
  alignItems: "center",
  padding: 12,
} as React.CSSProperties;

export const ResizeableWithHooks: Story = {
  args: {
    disableControl: false,
    resetOnDisableControl: false,
    // height: null,
    // width: null,
    // enableRelativeOffset: false,
  },
  // render: (args) => {
  //   console.log("args", args);
  //   const nodeRef = React.useRef<HTMLDivElement>(null);
  //   const horizontalHandleRef = React.useRef<HTMLElement>(null);
  //   // const verticalHandleRef = React.useRef<HTMLElement>(null);
  //   // const { style: rs, eventHandlers } = useResizeable({ nodeRef, handleRef: horizontalHandleRef, ...args });
  //   const { eventHandlers } = useResizeableHandle({ nodeRef, handleRef: horizontalHandleRef, ...args });
  //   console.log("r", eventHandlers);
  //   return (
  //     <div>
  //       <div style={{ ...BoxStyle }} ref={nodeRef}>
  //         box
  //       </div>
  //       <div {...eventHandlers} style={{ cursor: "ew-resize", userSelect: "none" }}>
  //         horizontal-handle
  //       </div>
  //     </div>
  //   );
  // },
};

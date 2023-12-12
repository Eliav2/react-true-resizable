import type { Meta, StoryObj } from "@storybook/react";
import ResizableExpr, { NewResizableProps, ResizableRefHandle } from "../../../src/experamintal/Resizable";

import { Button } from "./Button";
import React from "react";
import MrtTable from "./Table/MrtTable";
import MrtCustomHeadless from "./Table/MrtCustomHeadless/MrtCustomHeadless";
import useResizeable from "../../../src/experamintal/useResizeable";

// More on how to set up stories at: https://storybook.js.org/docs/writing-stories#default-export
const meta = {
  title: "my-react-components/Resizable",
  component: ResizableExpr,
  parameters: {
    // Optional parameter to center the component in the Canvas. More info: https://storybook.js.org/docs/configure/story-layout
    layout: "centered",
  },
  // This component will have an automatically generated Autodocs entry: https://storybook.js.org/docs/writing-docs/autodocs
  tags: ["autodocs"],
  // More on argTypes: https://storybook.js.org/docs/api/argtypes
  argTypes: {
    backgroundColor: { control: "color" },
  },
} satisfies Meta<typeof NewResizableProps>;

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

// More on writing stories with args: https://storybook.js.org/docs/writing-stories/args
export const SimpleResizeable: Story = {
  args: {
    // primary: true,
    // label: "Button",
  },
  render: (args) => {
    return (
      <ResizableExpr {...args}>
        <div style={BoxStyle}>box</div>
      </ResizableExpr>
    );
  },
};
export const MrtResizeableColumn: Story = {
  args: {
    // primary: true,
    // label: "Button",
  },
  render: (args) => {
    return <MrtTable />;
  },
};
export const MrtCustomHeadlessTableStory: Story = {
  args: {
    // primary: true,
    // label: "Button",
  },
  render: (args) => {
    return <MrtCustomHeadless />;
  },
};

export const ResizeableWithHooks: Story = {
  args: {
    // primary: true,
    // label: "Button",
  },
  render: (args) => {
    const nodeRef = React.useRef<HTMLDivElement>(null);
    const handleRef = React.useRef<HTMLElement>(null);
    const { style: rs, eventHandlers } = useResizeable({ nodeRef, handleRef });
    console.log("r", eventHandlers);
    return (
      <div>
        <div style={{ ...BoxStyle }} ref={nodeRef}>
          box
        </div>
        <div {...eventHandlers}>handle</div>
      </div>
    );
  },
};

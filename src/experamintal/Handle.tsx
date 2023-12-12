import React from "react";
import HandleBase, { HandleBaseProps } from "./HandleBase";
import { getRelativeSizeValue } from "shared/utils";
import { RelativeSize } from "shared/types";

export interface HandleProps extends Omit<HandleBaseProps, "children"> {
  // handleBaseProps?: Partial<HandleBaseProps>;
  size?: number;
  allowResize?: HandleBaseProps["allowResize"];
  offset?: HandleBaseProps["offset"];
  style?: React.CSSProperties;
  handleWidth?: RelativeSize;
  handleHeight?: RelativeSize;
  handleCursor?: React.CSSProperties["cursor"];
  transform?: React.CSSProperties["transform"];
  children?: React.ReactNode;
}

/** abstraction over HandleBase */
const Handle: React.FC<HandleProps> = (props) => {
  let {
    children,
    size = children ? null : 12,
    offset,
    allowResize,
    handleWidth = size ?? 12,
    handleHeight = size ?? 12,
    handleCursor = "pointer",
    style,
    transform,
    ...handleBaseProps
  } = props;
  // if (!props.handleHeight && !props.handleWidth) {
  //   handleWidth = 0;
  //   handleHeight = 0;
  // }
  return (
    <HandleBase offset={offset} allowResize={allowResize} {...handleBaseProps}>
      {({ style: s, eventHandlers, context: { calculatedWidth, calculatedHeight } }) => (
        <div
          {...eventHandlers}
          style={{
            ...s,
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            alignItems: "center",
            boxSizing: "border-box",
            height: getRelativeSizeValue(handleHeight, calculatedHeight),
            width: getRelativeSizeValue(handleWidth, calculatedWidth),
            cursor: handleCursor,
            transform,
            ...style,

            // @remove
            // background: "red",
            // border: "solid blue",
            // zIndex: -1,
          }}
        >
          {children}
        </div>
      )}
    </HandleBase>
  );
};

export default Handle;

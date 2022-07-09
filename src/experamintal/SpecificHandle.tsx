import React from "react";
import HandleBase, { HandleBaseProps } from "./HandleBase";
import { getRelativeSizeValue } from "shared/utils";
import { RelativeSize } from "shared/types";

export interface SpecificHandleProps {
  handleBaseProps?: Partial<HandleBaseProps>;
  size?: number;
  allowResize?: HandleBaseProps["allowResize"];
  offset?: HandleBaseProps["offset"];
  handleStyle?: React.CSSProperties;
  handleWidth?: RelativeSize;
  handleHeight?: RelativeSize;
  handleCursor?: React.CSSProperties["cursor"];
  transform?: React.CSSProperties["transform"];
  children?: React.ReactNode;
}

/** the default handle component */
const SpecificHandle: React.FC<SpecificHandleProps> = (props) => {
  let {
    children,
    size = children ? 0 : 12,
    offset,
    allowResize,
    handleWidth = size,
    handleHeight = size,
    handleCursor = "pointer",
    handleBaseProps,
    handleStyle,
    transform,
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
            ...handleStyle,

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

export default SpecificHandle;

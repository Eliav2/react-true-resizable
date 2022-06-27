import React, { useLayoutEffect } from "react";
import { useResizableBase } from "./ResizableBase";
import { PossiblySpecifyAxis } from "./Resizable";

interface ResizableElementProps {
  nodeRef: React.RefObject<HTMLElement>;
  disableControl?: PossiblySpecifyAxis<boolean>;
  height?: number | string;
  width?: number | string;
  enableRelativeOffset?: boolean;
  children: React.ReactElement;
}

/** Responsible to change the dom properties of a DOM node based on the state of the closest ResizableState context
 *
 * This component will read the state, and sets the DOM node's style properties to match the state.
 * */
export const ResizableElement: React.FC<ResizableElementProps> = (p) => {
  // let { nodeRef, disableControl, height, width, enableRelativeOffset, children } = props;
  const ResizableState = useResizableBase();
  const { calculatedHeight, calculatedWidth, calculatedTop, calculatedLeft, initialHeight, initialWidth } =
    ResizableState;

  // control and update the size of the node on each render
  const disableWidthControl = typeof p.disableControl === "boolean" ? p.disableControl : p.disableControl?.horizontal;
  const disableHeightControl = typeof p.disableControl === "boolean" ? p.disableControl : p.disableControl?.vertical;
  let height;
  if (height) p.height = typeof p.height === "number" ? `${p.height}px` : p.height;
  else {
    height = !disableHeightControl ? calculatedHeight ?? p.nodeRef?.current?.style?.height : undefined;
    if (height) height += "px";
  }
  let width;
  if (width) p.width = typeof p.width === "number" ? `${p.width}px` : p.width;
  else {
    width = !disableWidthControl ? calculatedWidth ?? p.nodeRef?.current?.style?.width : undefined;
    if (width) width += "px";
  }

  if (p.nodeRef?.current) {
    if (!disableHeightControl && !!height) {
      p.nodeRef.current.style.height = height;
      if (p.enableRelativeOffset) p.nodeRef.current.style.top = calculatedTop + "px";
    }
    if (!disableWidthControl && !!width) {
      p.nodeRef.current.style.width = width;
      if (p.enableRelativeOffset) p.nodeRef.current.style.left = calculatedLeft + "px";
    }
  }
  // set required style properties on target DOM node
  useLayoutEffect(() => {
    if (p.nodeRef?.current) {
      p.nodeRef.current.style.boxSizing = "border-box";
      // "border-box" sizing is required for correct positioning of handles
      p.nodeRef.current.style.touchAction = "none";
    }
  }, [p.nodeRef.current]);

  // when disabling the control, the width/height should be reset to initial value
  useLayoutEffect(() => {
    if (p.nodeRef.current && disableHeightControl) ResizableState.setCalculatedHeight(null);
    // after first render
    if (p.nodeRef.current && calculatedHeight) p.nodeRef.current.style.height = initialHeight;
  }, [disableHeightControl]);
  useLayoutEffect(() => {
    if (p.nodeRef.current && disableWidthControl) ResizableState.setCalculatedWidth(null);
    // after first render
    if (p.nodeRef.current && calculatedWidth) p.nodeRef.current.style.width = initialWidth;
  }, [disableWidthControl]);

  return React.cloneElement(p.children, {
    ref: p.nodeRef,
  });
};

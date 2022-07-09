import React, { useLayoutEffect } from "react";
import { useResizableBase } from "./ResizableBase";
import { PossiblySpecifyAxis } from "./Resizable";
import usePassRef from "shared/hooks/usePassRef";

interface ResizableElementProps {
  nodeRef?: React.RefObject<HTMLElement>;
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
// export const ResizableElement: React.FC<ResizableElementProps> = (p) => {
const ResizableElementForward = React.forwardRef<HTMLElement, ResizableElementProps>(function ResizableElement(
  p,
  forwardedRef
) {
  // let { nodeRef, disableControl, height, width, enableRelativeOffset, children } = props;
  const ResizableState = useResizableBase();
  let {
    calculatedHeight,
    calculatedWidth,
    calculatedTop,
    calculatedLeft,
    initialHeight,
    initialWidth,
    nodeRef,
    render,
  } = ResizableState;

  const childNodeRef = usePassRef<HTMLElement>(p.children);
  // @ts-ignore
  // noinspection JSConstantReassignment
  nodeRef.current = nodeRef.current || childNodeRef.current;
  // if ref for the target DOM node is explicitly passed, use it instead extracting it from the children
  if (p?.nodeRef) {
    // @ts-ignore
    // noinspection JSConstantReassignment
    nodeRef.current = props.nodeRef.current;
  }
  // if wrapper component tried to access the inner DOM node, let it do so
  if (forwardedRef && typeof forwardedRef == "object" && "current" in forwardedRef && nodeRef)
    forwardedRef.current = nodeRef.current;

  // control and update the size of the node on each render
  const disableWidthControl = typeof p.disableControl === "boolean" ? p.disableControl : p.disableControl?.horizontal;
  const disableHeightControl = typeof p.disableControl === "boolean" ? p.disableControl : p.disableControl?.vertical;
  let height;
  if (height) p.height = typeof p.height === "number" ? `${p.height}px` : p.height;
  else {
    height = !disableHeightControl ? calculatedHeight ?? nodeRef?.current?.style?.height : undefined;
    if (height) height += "px";
  }
  let width;
  if (width) p.width = typeof p.width === "number" ? `${p.width}px` : p.width;
  else {
    width = !disableWidthControl ? calculatedWidth ?? nodeRef?.current?.style?.width : undefined;
    if (width) width += "px";
  }

  if (nodeRef?.current) {
    if (!disableHeightControl && !!height) {
      nodeRef.current.style.height = height;
      if (p.enableRelativeOffset) nodeRef.current.style.top = calculatedTop + "px";
    }
    if (!disableWidthControl && !!width) {
      nodeRef.current.style.width = width;
      if (p.enableRelativeOffset) nodeRef.current.style.left = calculatedLeft + "px";
    }
  }
  // set required style properties on target DOM node
  useLayoutEffect(() => {
    if (nodeRef?.current) {
      nodeRef.current.style.boxSizing = "border-box";
      // "border-box" sizing is required for correct positioning of handles
      nodeRef.current.style.touchAction = "none";
    }
    render();
  }, [nodeRef.current]);

  // when disabling the control, the width/height should be reset to initial value
  useLayoutEffect(() => {
    if (nodeRef.current && disableHeightControl) ResizableState.setCalculatedHeight(null);
    // after first render
    if (nodeRef.current && calculatedHeight) nodeRef.current.style.height = initialHeight;
  }, [disableHeightControl]);
  useLayoutEffect(() => {
    if (nodeRef.current && disableWidthControl) ResizableState.setCalculatedWidth(null);
    // after first render
    if (nodeRef.current && calculatedWidth) nodeRef.current.style.width = initialWidth;
  }, [disableWidthControl]);

  return React.cloneElement(p.children, {
    ref: nodeRef,
  });
});

export default ResizableElementForward;

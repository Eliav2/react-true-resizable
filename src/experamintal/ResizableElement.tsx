import React, { useLayoutEffect } from "react";
import { useResizableBase } from "./ResizableBase";
import { PossiblySpecifyAxis, ResizableProps } from "./Resizable";
import usePassRef from "shared/hooks/usePassRef";
import { useOneTimeWarn } from "shared/hooks/useOneTimeWarn";
import { useResizableWarn } from "./utils";

export interface ResizableElementProps {
  children?: React.ReactElement;
  nodeRef?: React.RefObject<HTMLElement>;
  disableControl?: PossiblySpecifyAxis<boolean>;
  height?: number | string;
  width?: number | string;
  enableRelativeOffset?: boolean;
}

/** Responsible to change the dom properties of a DOM node based on the state of the closest ResizableState context
 *
 * This component will read the state, and sets the DOM node's style properties to match the state.
 * */
// export const ResizableElement: React.FC<ResizableElementProps> = (p) => {
const ResizableElementForward = React.forwardRef<HTMLElement, ResizableElementProps>(function ResizableElement(p, forwardedRef) {
  // let { nodeRef, disableControl, height, width, enableRelativeOffset, children } = props;
  const ResizableState = useResizableBase();
  let { calculatedHeight, calculatedWidth, calculatedTop, calculatedLeft, initialHeight, initialWidth, nodeRef, render } = ResizableState;

  const childNodeRef = usePassRef<HTMLElement>(p.children);
  // @ts-ignore
  // noinspection JSConstantReassignment
  nodeRef.current = nodeRef.current || childNodeRef.current;
  // if ref for the target DOM node is explicitly passed, use it instead extracting it from the children
  if (p?.nodeRef) {
    // @ts-ignore
    // noinspection JSConstantReassignment
    nodeRef.current = p.nodeRef.current;
  }
  // if wrapper component tried to access the inner DOM node, let it do so
  if (forwardedRef && typeof forwardedRef == "object" && "current" in forwardedRef && nodeRef) forwardedRef.current = nodeRef.current;

  // control and update the size of the node on each render
  const disableWidthControl = typeof p.disableControl === "boolean" ? p.disableControl : p.disableControl?.horizontal;
  const disableHeightControl = typeof p.disableControl === "boolean" ? p.disableControl : p.disableControl?.vertical;
  let height;
  if (p.height) height = typeof p.height === "number" ? `${p.height}px` : p.height;
  else {
    height = !disableHeightControl ? calculatedHeight ?? nodeRef?.current?.style?.height : undefined;
    if (height) height += "px";
  }
  let width;
  if (p.width) width = typeof p.width === "number" ? `${p.width}px` : p.width;
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
    if (nodeRef?.current?.style) {
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

  // strip away checks in production build
  if (!process.env.NODE_ENV || process.env.NODE_ENV !== "production") checkProps(p, nodeRef);

  return (
    (p.children &&
      React.cloneElement(p.children, {
        ref: nodeRef,
      })) ??
    null
  );
});

export default ResizableElementForward;

export const checkProps = (props: ResizableProps, nodeRef: React.RefObject<HTMLElement>) => {
  const warn = useResizableWarn();

  if (props.children) {
    if (typeof props.children.type == "string") {
      // this is a host React element (div, span, etc)
    } else {
      // this is a React component instance
      // @ts-ignore
      const isForwardRef = props.children?.type?.$$typeof?.toString() == Symbol("react.forward_ref").toString();
      if (!isForwardRef && !props.nodeRef) {
        warn(
          `element '${props.children?.type?.name}' is a React component, therefore it should be wrapped with React.forwardRef in order to work properly with Resizable\n see https://reactjs.org/docs/forwarding-refs.html`
        );
      }
    }

    // React.Children.only(props.children);
    if (typeof props.children == "string" || typeof props.children == "number" || typeof props.children == "boolean")
      warn(
        `Resizable: element '${props.children}' is not valid child for Resizable, wrap it simple element like div element\nFor example - <div>${props.children}</div>`
      );
  }
  if (!props.nodeRef && !props.children) warn("at least one property: 'nodeRef' or 'children' should be passed to Resizable");
  if (nodeRef.current) {
    const node = nodeRef.current;
    if (props.enableRelativeOffset || (node.style?.position && node.style?.position == "static")) {
      warn(
        `enableRelativeOffset is set to true, so style.position should be set to value other than 'static',currently it is '${node.style?.position}'`
      );
    }
  }
};

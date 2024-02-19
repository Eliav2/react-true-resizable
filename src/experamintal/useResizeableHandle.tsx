import { ResizableBaseContextProps, useResizableBase } from "./ResizableBase";
import { usePassRef } from "shared/hooks/usePassChildrenRef";
import React, { useImperativeHandle, useLayoutEffect, useRef, useState } from "react";
import { checkProps } from "./ResizableElement";
import usePosition, { positionType } from "shared/hooks/usePosition";
import useRerender from "shared/hooks/useRerender";
import { getRelativeSizeValue, parseRelativeSize } from "shared/utils";
import { AllowResize } from "./HandleOld";
import { parsePossiblyAxis } from "./HandleBase";
import { PossiblySpecifyAxis } from "./Resizable";
import type { MapNonNullable, RelativeSize, RespectDefaultProps } from "shared/types";
import { mergeDefaultValues } from "./utils";

type OnResizeEvent = (newPos: { height: number; width: number }, prevPos: Exclude<positionType, null>) => void;
type OnResizeUpdate<T> = (newPos: T, prevPos: Exclude<positionType, null>) => void;

type HandleFunc = (event: React.PointerEvent<HTMLDivElement>) => void;

export interface UseHandleProps {
  nodeRef: React.RefObject<HTMLElement>;
  handleRef: React.RefObject<HTMLElement>;
  allowResize?: AllowResize;
  grid?: PossiblySpecifyAxis<number>;
  resizeRatio?: PossiblySpecifyAxis<number>;
  onResizeEnd?: (prevPos: Exclude<positionType, null>) => void;
  onResizeStart?: (prevPos: Exclude<positionType, null>) => void;
  onResize?:
    | OnResizeEvent
    | {
        horizontal?: OnResizeUpdate<{ width: number }>;
        vertical?: OnResizeUpdate<{ height: number }>;
      };
  disableControl?: PossiblySpecifyAxis<boolean>;

  /**
   * reset width/height to initial value when disabled
   * @default true
   */
  resetOnDisableControl?: PossiblySpecifyAxis<boolean>;

  height?: number | string;
  width?: number | string;
  enableRelativeOffset?: boolean;
  // offset?: { left?: RelativeSize; top?: RelativeSize };
}

const useResizeableHandle = (_props: UseHandleProps) => {
  console.log("useResizeableHandle render");
  const defaultProps = {
    allowResize: { vertical: true, horizontal: true },
    grid: { vertical: 0, horizontal: 0 },
    resizeRatio: { vertical: 1, horizontal: 1 },
    disableControl: { vertical: false, horizontal: false },
    enableRelativeOffset: false,
    // offset: { left: "0%", top: "0%" },
    resetOnDisableControl: { vertical: true, horizontal: true },
  } as const;
  const props = mergeDefaultValues(_props, defaultProps);

  // console.log("useResizeable", props);
  // let { nodeRef, disableControl, height, width, enableRelativeOffset, children } = props;
  // const ResizableState = useResizableBase();
  // let { calculatedHeight, calculatedWidth, calculatedTop, calculatedLeft, initialHeight, initialWidth, nodeRef, render } = ResizableState;

  const { nodeRef, handleRef } = props;
  const nodePosition = usePosition(nodeRef.current);
  const handlesParentPosition = usePosition(handleRef.current);

  const [initialHeight, setInitialHeight] = useState<string | undefined>();
  const [initialWidth, setInitialWidth] = useState<string | undefined>();
  const [calculatedHeight, setCalculatedHeight] = useState<number | null | undefined>(undefined);
  const [calculatedWidth, setCalculatedWidth] = useState<number | null | undefined>(undefined);
  const [heightBeforeReset, setHeightBeforeReset] = useState<number | null | undefined>(undefined);
  const [widthBeforeReset, setWidthBeforeReset] = useState<number | null | undefined>(undefined);

  const [calculatedLeft, setCalculatedLeft] = useState<number | null | undefined>(0);
  const [calculatedTop, setCalculatedTop] = useState<number | null | undefined>(0);

  const [endDraggingOffsetTop, setEndDraggingOffsetTop] = useState(0);
  const [endDraggingOffsetLeft, setEndDraggingOffsetLeft] = useState(0);

  const [initialDraggingElementSize, setInitialDraggingElementSize] = useState({
    height: 0,
    width: 0,
  });
  const [initialDraggingPointerPos, setInitialDraggingPointerPos] = useState({
    y: 0,
    x: 0,
  });

  const [isDragging, setIsDragging] = useState(false);
  const [pointerId, setPointerId] = useState<number>(0);

  const render = useRerender();

  // rerender when nodeRef changes
  useLayoutEffect(() => {
    render();
  }, [nodeRef.current]);

  // update the calculated height/width when the component is rendered
  useLayoutEffect(() => {
    if (nodeRef.current) {
      let { height, width } = nodeRef.current.getBoundingClientRect?.() ?? {};
      // console.log("useLayoutEffect", nodeRef.style.height, nodeRef.style.width);

      setCalculatedHeight(height);
      setCalculatedWidth(width);
      // if (nodeRef.current.style) {
      setInitialHeight(nodeRef.current.style.height);
      setInitialWidth(nodeRef.current.style.width);
      // }
    }
  }, [nodeRef.current]);

  // add event listeners to the window on mount, and render on resize
  useLayoutEffect(() => {
    window.addEventListener("resize", render);
    return () => {
      window.removeEventListener("resize", render);
    };
  }, []);

  const _1 = props.allowResize?.["vertical"];
  const reverseVerticalDrag = typeof _1 === "boolean" ? false : _1?.reverseDrag ?? false;
  const _2 = props.allowResize?.["horizontal"];
  const reverseHorizontalDrag = typeof _2 === "boolean" ? false : _2?.reverseDrag ?? false;

  const grid = parsePossiblyAxis(props.grid);
  const resizeRatio = parsePossiblyAxis(props.resizeRatio, 1);

  const getEnableRelativeOffsetTop = (event) => {
    let top = (event.clientY - initialDraggingPointerPos.y) * resizeRatio.vertical;
    if (grid.vertical) top -= (event.clientY % grid.vertical) - (initialDraggingPointerPos.y % grid.vertical);
    return top;
  };
  const getEnableRelativeOffsetLeft = (event) => {
    let left = (event.clientX - initialDraggingPointerPos.x) * resizeRatio.horizontal;
    if (grid.horizontal) left -= (event.clientX % grid.horizontal) - (initialDraggingPointerPos.x % grid.horizontal);
    return left;
  };

  const resizeStart = (event: React.PointerEvent<HTMLDivElement>) => {
    // console.log("handleResizeStart", event.button);
    // event.nativeEvent.stopImmediatePropagation();
    setIsDragging(true);
    // lock the pointer events to this element until release - this way we don't need to listen to global mouse events
    // handleRef.current?.setPointerCapture(event.pointerId);
    (event.target as HTMLDivElement).setPointerCapture(event.pointerId);

    setPointerId(event.pointerId);
    const dims = nodePosition;
    dims &&
      setInitialDraggingElementSize({
        width: dims.width,
        height: dims.height,
      });
    setInitialDraggingPointerPos({
      x: event.clientX,
      y: event.clientY,
    });
    if (typeof props?.onResizeStart === "function" && nodePosition) props.onResizeStart(nodePosition);
  };
  const resizeEnd = (event: React.PointerEvent<HTMLDivElement>) => {
    // console.log("handleResizeEnd");
    // release the pointer events lock to this element
    (event.target as HTMLDivElement).releasePointerCapture(pointerId);
    // handleRef.current?.releasePointerCapture(pointerId);
    setIsDragging(false);
    if (reverseVerticalDrag) {
      let top = getEnableRelativeOffsetTop(event) + endDraggingOffsetTop;
      if (calculatedHeight && calculatedHeight < 0) top += calculatedHeight;
      setEndDraggingOffsetTop(top);
    }
    if (reverseHorizontalDrag) {
      let left = getEnableRelativeOffsetLeft(event) + endDraggingOffsetLeft;
      if (calculatedWidth && calculatedWidth < 0) left += calculatedWidth;
      setEndDraggingOffsetLeft(left);
    }
    if (typeof props?.onResizeEnd === "function" && nodePosition) props.onResizeEnd(nodePosition);
  };
  // const disableWidthControl = typeof props.disableControl === "boolean" ? props.disableControl : props.disableControl?.horizontal;
  // const disableHeightControl = typeof props.disableControl === "boolean" ? props.disableControl : props.disableControl?.vertical;
  const disableControl = parsePossiblyAxis(props.disableControl, false);

  const resize = (event: React.PointerEvent<HTMLDivElement>) => {
    // console.log("handleResize");
    // event.nativeEvent.stopImmediatePropagation();

    if (isDragging) {
      const dragDirVertical = reverseVerticalDrag ? -1 : 1;
      let height =
        initialDraggingElementSize.height - //  move relative to the elements size
        // change position relative to the pointer position
        (initialDraggingPointerPos.y - event.clientY) * dragDirVertical * resizeRatio.vertical;
      if (grid.vertical)
        // snap to grid with initial grid offset
        height -=
          ((event.clientY % grid.vertical) - (initialDraggingPointerPos.y % grid.vertical)) * dragDirVertical * resizeRatio.vertical;
      // enable natural resize of top handle
      if (props.height) height = typeof props.height === "string" ? parseFloat(props.height) : props.height;

      if (props.enableRelativeOffset && dragDirVertical === -1) {
        if (height > 0) setCalculatedTop(getEnableRelativeOffsetTop(event) + endDraggingOffsetTop);
      }

      const dragDirHorizontal = reverseHorizontalDrag ? -1 : 1;
      let width =
        initialDraggingElementSize.width - //  move relative to the elements size
        // change position relative to the pointer position
        (initialDraggingPointerPos.x - event.clientX) * dragDirHorizontal * resizeRatio.horizontal;
      if (grid.horizontal)
        // snap to ResizableProps.grid with initial ResizableProps.grid offset
        width -=
          ((event.clientX % grid.horizontal) - (initialDraggingPointerPos.x % grid.horizontal)) *
          dragDirHorizontal *
          resizeRatio.horizontal;

      if (props.width) width = typeof props.width === "string" ? parseFloat(props.width) : props.width;

      // enable natural resize of left handle
      if (props.enableRelativeOffset && dragDirHorizontal === -1) {
        if (width > 0) setCalculatedLeft(getEnableRelativeOffsetLeft(event) + endDraggingOffsetLeft);
      }

      if (props.allowResize && nodePosition) {
        if ("vertical" in props.allowResize && props.allowResize["vertical"] && !disableControl.vertical) {
          setCalculatedHeight(height);
          if (typeof props?.onResize === "object") props.onResize.vertical?.({ height }, nodePosition);
        }
        // console.log(props.onResize);
        if ("horizontal" in props.allowResize && props.allowResize["horizontal"] && !disableControl.horizontal) {
          setCalculatedWidth(width);
          if (typeof props?.onResize === "object") props.onResize.horizontal?.({ width }, nodePosition);
        }
        if (typeof props?.onResize === "function") props.onResize({ height, width }, nodePosition);
      }
    }
  };

  // const leftRel = parseRelativeSize(props?.offset?.left ?? "0%");
  // const topRel = parseRelativeSize(props?.offset?.top ?? "0%");
  // const left =
  //   handlesParentPosition && nodePosition
  //     ? nodePosition.left - handlesParentPosition.left + (leftRel.percent * nodePosition.width + leftRel.abs)
  //     : 0;
  // const top =
  //   handlesParentPosition && nodePosition
  //     ? nodePosition.top - handlesParentPosition.top + (topRel.percent * nodePosition.height + topRel.abs)
  //     : 0;

  // control and update the size of the node on each render
  let height;
  if (props.height) height = typeof props.height === "number" ? `${props.height}px` : props.height;
  else {
    height = !disableControl.vertical ? calculatedHeight ?? nodeRef?.current?.style?.height : undefined;
    if (height) height += "px";
  }
  let width;
  if (props.width) width = typeof props.width === "number" ? `${props.width}px` : props.width;
  else {
    width = !disableControl.horizontal ? calculatedWidth ?? nodeRef?.current?.style?.width : undefined;
    if (width) width += "px";
  }

  // mutate the DOM node directly
  if (nodeRef?.current) {
    if (!disableControl.vertical && !!height) {
      nodeRef.current.style.height = height;

      if (props.enableRelativeOffset) nodeRef.current.style.top = calculatedTop + "px";
    }
    if (!disableControl.horizontal && !!width) {
      nodeRef.current.style.width = width;
      if (props.enableRelativeOffset) nodeRef.current.style.left = calculatedLeft + "px";
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

  const resetOnDisableControl = parsePossiblyAxis(props.resetOnDisableControl, true);
  console.log("resetOnDisableControl", resetOnDisableControl);
  console.log("disableControl", disableControl);
  // when disabling the control, the width/height should be reset to initial value
  useLayoutEffect(() => {
    if (nodeRef.current) {
      if (resetOnDisableControl.vertical) {
        if (disableControl.vertical) {
          setCalculatedHeight(null);
          setHeightBeforeReset(calculatedHeight);
        } else {
          setCalculatedHeight(heightBeforeReset);
        }
      }
    }
    // // after first render
    // if (nodeRef.current && calculatedHeight) nodeRef.current.style.height = initialHeight;
  }, [disableControl.vertical, resetOnDisableControl.vertical]);
  useLayoutEffect(() => {
    if (nodeRef.current)
      if (resetOnDisableControl.horizontal) {
        if (disableControl.horizontal) {
          setCalculatedWidth(null);
          setWidthBeforeReset(calculatedWidth);
        } else {
          setCalculatedWidth(widthBeforeReset);
        }
      }
    // // after first render
    // if (nodeRef.current && calculatedWidth) nodeRef.current.style.width = initialWidth;
  }, [disableControl.horizontal, resetOnDisableControl.horizontal]);

  // const final_height = getRelativeSizeValue(handleHeight, calculatedHeight);
  // const final_width = getRelativeSizeValue(handleWidth, calculatedWidth);

  // // strip away checks in production build
  // if (!import.meta.env.NODE_ENV || import.meta.env.NODE_ENV !== "production") checkProps(props, nodeRef);

  return {
    // style: {
    //   // left,
    //   // top,
    //   // position: "absolute",
    //   // transform: `translate(-${leftP}%,-${topP}%)`,
    //   // transform: `translate(-${leftRel.percent * 100}%,-${topRel.percent * 100}%)`,
    //   cursor: "n-resize",
    // },
    eventHandlers: { onPointerDown: resizeStart, onPointerMove: resize, onPointerUp: resizeEnd },
  };

  // return (
  //   (p.children &&
  //     React.cloneElement(p.children, {
  //       ref: nodeRef,
  //     })) ??
  //   null
  // );
};
export default useResizeableHandle;

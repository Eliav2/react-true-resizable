import React, { useRef, useState } from "react";
import usePosition, { positionType } from "shared/hooks/usePosition";
import type { Primitive } from "shared/types";
import { ResizableDefaultProps, ResizablePropsDP } from "./Resizable";
import type { HandleNameType, HandleStyleFnType } from "../HandleFns";
import { parsePossiblySpecific, PossiblySpecific } from "shared/utils/props";
import { useResizableBase } from "./ResizableBase";

export type ResizeDir = "horizontal" | "vertical";
export type AllowResize = { [key in ResizeDir]?: boolean | { reverseDrag: boolean } };
export type HandleOptions = {
  allowResize: AllowResize;
  size: number;
};

export type HandlesOptions = { [key in HandleNameType]?: Partial<HandleOptions> };

export interface HandleProps {
  ResizableProps: ResizablePropsDP;
  nodePosition: Exclude<positionType, null>;
  nodeRef: React.RefObject<HTMLElement>;
  HandleStyleFn: HandleStyleFnType;
  handlesParentPosition: positionType;
  handleOptions: HandleOptions;
  handlesOptions: HandlesOptions;
  handleStyle: React.CSSProperties;
  createEventHandlers?: PossiblySpecific<CreateEventHandle, "start" | "move" | "end">;
  size: number;
}

export type CreateEventHandle = (e, handler: () => void) => void;

const parsePossiblyAxis = <
  Spec extends string[],
  Prop extends PossiblySpecific<Primitive, "horizontal" | "vertical">,
  Default extends NonNullable<Primitive> | undefined = undefined
>(
  prop: Prop,
  defaultProp?: Default
) => parsePossiblySpecific<["horizontal", "vertical"], Prop, Default>(prop, ["horizontal", "vertical"], defaultProp);

export const HandleOld = React.forwardRef(function HandleForward(
  {
    size = 10,
    nodeRef,
    nodePosition,
    HandleStyleFn,
    handlesParentPosition,
    handleOptions,
    handlesOptions,
    ResizableProps,
    handleStyle,
  }: HandleProps,
  ref
) {
  // console.log("Handle");

  const {
    setCalculatedHeight,
    setCalculatedWidth,
    calculatedHeight,
    calculatedWidth,
    setCalculatedLeft,
    setCalculatedTop,
    setEndDraggingOffsetTop,
    setEndDraggingOffsetLeft,
    endDraggingOffsetTop,
    endDraggingOffsetLeft,
    calculatedLeft,
    calculatedTop,
  } = useResizableState();

  const [initialDraggingElementSize, setInitialDraggingElementSize] = useState({
    height: 0,
    width: 0,
  });
  const [initialDraggingPointerPos, setInitialDraggingPointerPos] = useState({
    y: 0,
    x: 0,
  });

  const reverseVerticalDrag = handleOptions.allowResize["vertical"]?.reverseDrag;
  const reverseHorizontalDrag = handleOptions.allowResize["horizontal"]?.reverseDrag;

  const [isDragging, setIsDragging] = useState(false);
  const [pointerId, setPointerId] = useState<number>(0);

  const handleRef = useRef<HTMLDivElement>(null);
  // we get only the initial position, and we are confident that the element is not moving relative to its parent
  const handlePos = usePosition(handleRef.current);

  // const grid = parsePossiblyAxis(ResizableProps.grid);
  const grid = parsePossiblyAxis(ResizableProps.grid);
  const resizeRatio = parsePossiblyAxis(ResizableProps.resizeRatio, ResizableDefaultProps.resizeRatio);

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

  const onPointerDown = (event: React.PointerEvent<HTMLDivElement>) => {
    // console.log("onPointerDown", event.button);
    event.nativeEvent.stopImmediatePropagation();
    setIsDragging(true);
    // lock the pointer events to this element until release - this way we don't need to listen to global mouse events
    handleRef.current?.setPointerCapture(event.pointerId);
    setPointerId(event.pointerId);
    const dims = nodePosition;
    setInitialDraggingElementSize({
      width: dims.width,
      height: dims.height,
    });
    setInitialDraggingPointerPos({
      x: event.clientX,
      y: event.clientY,
    });
    if (typeof ResizableProps?.onResizeStart === "function") ResizableProps.onResizeStart(nodePosition);
  };
  const onPointerUp = (event: React.PointerEvent<HTMLDivElement>) => {
    // console.log("onPointerUp");
    // release the pointer events lock to this element
    handleRef.current?.releasePointerCapture(pointerId);
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
    if (typeof ResizableProps?.onResizeEnd === "function") ResizableProps.onResizeEnd(nodePosition);
  };
  const onPointerMove = (event: React.PointerEvent<HTMLDivElement>) => {
    // console.log("onPointerMove");
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
          ((event.clientY % grid.vertical) - (initialDraggingPointerPos.y % grid.vertical)) *
          dragDirVertical *
          resizeRatio.vertical;
      // enable natural resize of top handle
      if (ResizableProps.enableRelativeOffset && dragDirVertical === -1) {
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
      // enable natural resize of left handle
      if (ResizableProps.enableRelativeOffset && dragDirHorizontal === -1) {
        if (width > 0) setCalculatedLeft(getEnableRelativeOffsetLeft(event) + endDraggingOffsetLeft);
      }

      if ("vertical" in handleOptions.allowResize) {
        setCalculatedHeight(height);
        if (typeof ResizableProps?.onResize === "object") ResizableProps.onResize.vertical?.({ height }, nodePosition);
      }
      if ("horizontal" in handleOptions.allowResize) {
        setCalculatedWidth(width);
        if (typeof ResizableProps?.onResize === "object") ResizableProps.onResize.horizontal?.({ width }, nodePosition);
      }
      if (typeof ResizableProps?.onResize === "function") ResizableProps.onResize({ height, width }, nodePosition);
    }
  };

  const style = HandleStyleFn({
    nodePosition,
    handlePos,
    handlesParentPosition,
    handleSize: handleOptions.size,
    handlesOptions: handlesOptions,
  });

  // // apparently this is not needed anymore
  // useEffect(() => {
  //   const handleTouchStart = (e: TouchEvent) => {
  //     // console.log("touchstart");
  //     // if (e.cancelable) e.preventDefault();
  //   };
  //   const handleTouchMove = (e: TouchEvent) => {
  //     // console.log("touchmove");
  //     // if (e.cancelable) e.preventDefault();
  //   };
  //   const handleTouchCancel = (e: TouchEvent) => {
  //     // console.log("touchcancel");
  //     // e.preventDefault();
  //   };
  //
  //   nodeRef.current?.addEventListener("touchstart", handleTouchStart);
  //   nodeRef.current?.addEventListener("touchmove", handleTouchMove);
  //   nodeRef.current?.addEventListener("touchcancel", handleTouchCancel);
  //
  //   return () => {
  //     nodeRef.current?.removeEventListener("touchstart", handleTouchStart);
  //     nodeRef.current?.removeEventListener("touchmove", handleTouchMove);
  //   };
  // }, [nodeRef.current]);

  return (
    <div
      ref={handleRef}
      style={{
        // background: "green",
        position: "absolute",
        ...style,
        ...handleStyle,
      }}
      onPointerMove={onPointerMove}
      onPointerDown={onPointerDown}
      onPointerUp={onPointerUp}
      onTouchStart={() => {
        console.log("onTouchStart");
      }}
    />
  );
});

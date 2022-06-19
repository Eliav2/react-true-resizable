import React, { useEffect, useRef, useState } from "react";
import usePosition, { positionType } from "shared/hooks/usePosition";
import type { Expand, Primitive } from "shared/types";
import { pick } from "shared/utils";
import {
  HandleNameType,
  PossiblySpecific,
  PossiblySpecifyAxis,
  ResizableDefaultProps,
  ResizableProps,
  ResizablePropsDP,
  SpecifyAxis,
} from "./Resizable";
import useRerender from "shared/hooks/useRerender";
import type { HandleStyleFnType } from "./HandleFns";

export type AllowResize = "horizontal" | "vertical";
export type HandleOptions = {
  allowResize: { [key in AllowResize]?: { reverseDrag: boolean } };
  size: number;
};

export type HandlesOptions = { [key in HandleNameType]?: Partial<HandleOptions> };

export interface HandleProps {
  ResizableProps: ResizablePropsDP;
  nodePosition: Exclude<positionType, null>;
  nodeRef: React.RefObject<HTMLElement>;
  setCalculatedHeight: React.Dispatch<React.SetStateAction<number | null | undefined>>;
  setCalculatedWidth: React.Dispatch<React.SetStateAction<number | null | undefined>>;
  calculatedHeight: number | null | undefined;
  calculatedWidth: number | null | undefined;
  setCalculatedLeft: React.Dispatch<React.SetStateAction<number | null | undefined>>;
  setCalculatedTop: React.Dispatch<React.SetStateAction<number | null | undefined>>;
  setEndDraggingOffsetTop: React.Dispatch<React.SetStateAction<number>>;
  setEndDraggingOffsetLeft: React.Dispatch<React.SetStateAction<number>>;
  endDraggingOffsetTop: number;
  endDraggingOffsetLeft: number;
  HandleStyleFn: HandleStyleFnType;
  handlesParentPosition: positionType;
  handleOptions: HandleOptions;
  handlesOptions: HandlesOptions;
  handleStyle: React.CSSProperties;
  createEventHandlers?:
    | CreateEventHandle
    | { start: CreateEventHandle; move: CreateEventHandle; end: CreateEventHandle };
}

type CreateEventHandle = (e, handler: () => void) => void;

/**
 * will always return a more specific type than the default
 * @param prop - prop supplied by the used
 * @param fields
 * @param defaultValue
 *
 * example:
 * - parsePossiblySpecific(10, ["horizontal"]) => { horizontal: 10 }
 * - parsePossiblySpecific(10, ["horizontal", "vertical"]) => { horizontal: 10, vertical: 10 }
 * - parsePossiblySpecific(null, ["horizontal"],5) => { horizontal: 5 }
 * - parsePossiblySpecific(10, ["horizontal"],5) => { horizontal: 10 }
 */
const parsePossiblySpecific = <
  Spec extends string[],
  Prop extends PossiblySpecific<Primitive, Spec[number]>,
  Default extends NonNullable<Primitive> | undefined = undefined
>(
  prop: Prop,
  fields: [...Spec],
  defaultValue?: Default
): {
  [key in Spec[number]]: Prop extends Primitive ? Prop : Prop extends { [key in keyof Spec]: infer V } ? V : Default;
} => {
  if (typeof prop === "object") {
    return fields.reduce((prev, field) => ({ ...prev, [field]: prop?.[field] ?? defaultValue }), {}) as any;
  } else {
    return fields.reduce((prev, field) => ({ ...prev, [field]: prop ?? defaultValue }), {}) as any;
  }
};

const parsePossiblyAxis = <
  Spec extends string[],
  Prop extends PossiblySpecific<Primitive, "horizontal" | "vertical">,
  Default extends NonNullable<Primitive> | undefined = undefined
>(
  prop: Prop,
  defaultProp?: Default
) => parsePossiblySpecific<["horizontal", "vertical"], Prop, Default>(prop, ["horizontal", "vertical"], defaultProp);

// const parsePossiblyAxis = <
//   Prop extends PossiblySpecifyAxis<Primitive>,
//   Default extends NonNullable<Primitive> | undefined = undefined
// >(
//   prop: Prop,
//   defaultValue?: Default
// ): {
//   horizontal: Prop extends Primitive ? Prop : Prop extends { horizontal: infer V } ? V : Default;
//   vertical: Prop extends Primitive ? Prop : Prop extends { vertical: infer V } ? V : Default;
// } => {
//   if (typeof prop === "object") {
//     // @ts-ignore todo:fix
//     return { horizontal: prop?.horizontal ?? defaultValue, vertical: prop?.vertical ?? defaultValue };
//   } else {
//     // @ts-ignore todo:fix
//     return { horizontal: prop ?? defaultValue, vertical: prop ?? defaultValue };
//   }
// };

export const Handle = React.forwardRef(function HandleForward(
  {
    nodeRef,
    nodePosition,
    setCalculatedHeight,
    setCalculatedWidth,
    setCalculatedLeft,
    calculatedHeight,
    calculatedWidth,
    setCalculatedTop,
    HandleStyleFn,
    handlesParentPosition,
    handleOptions,
    handlesOptions,
    ResizableProps,
    setEndDraggingOffsetTop,
    setEndDraggingOffsetLeft,
    endDraggingOffsetTop,
    endDraggingOffsetLeft,
    handleStyle,
  }: HandleProps,
  ref
) {
  const render = useRerender();

  const [initialDraggingElementSize, setInitialDraggingElementSize] = useState({
    height: 0,
    width: 0,
  });
  const [initialDraggingPointerPos, setInitialDraggingPointerPos] = useState({
    y: 0,
    x: 0,
  });

  // useLayoutEffect(() => {
  //   window.addEventListener("resize", (e) => {
  //     render();
  //   });
  // }, []);
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
    let top = event.clientY - initialDraggingPointerPos.y;
    if (grid.vertical) top -= (event.clientY % grid.vertical) - (initialDraggingPointerPos.y % grid.vertical);
    return top;
  };
  const getEnableRelativeOffsetLeft = (event) => {
    let left = event.clientX - initialDraggingPointerPos.x;
    if (grid.horizontal) left -= (event.clientX % grid.horizontal) - (initialDraggingPointerPos.x % grid.horizontal);
    return left;
  };

  const onPointerDown = (event: React.PointerEvent<HTMLDivElement>) => {
    // console.log("onPointerDown", event.button);
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
    // console.log("onPointerMove", event);
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

  useEffect(() => {
    console.log("handle nodeRef mount!");

    const touchProps = ["clientX", "clientY", "identifier"] as const;
    const ongoingTouches: Pick<Touch, typeof touchProps[number]>[] = [];

    function copyTouch(e: Touch) {
      return pick(e, ["clientX", "clientY", "identifier"]);
    }

    const handleTouchStart = (e: TouchEvent) => {
      // console.log("touch start", e);

      const touches = e.changedTouches;
      for (let i = 0; i < touches.length; i++) {
        ongoingTouches.push(copyTouch(touches[i]));
      }
    };
    const handleTouchMove = (e: TouchEvent) => {
      // console.log("touch move", e);
      e.preventDefault();
    };
    const handleTouchEnd = (e: TouchEvent) => {
      // console.log("touch start", e);
    };

    nodeRef.current?.addEventListener("touchstart", handleTouchStart);
    nodeRef.current?.addEventListener("touchmove", handleTouchMove);
    nodeRef.current?.addEventListener("touchend", handleTouchEnd);
    return () => {};
  }, [nodeRef.current]);

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
    />
  );
});

// const useGetHandleStyle = ({
//   nodePosition,
//   handlePos,
//   handlesParentPosition,
//   handleSize,
//   handlesOptions,
//   handlePrevPos,
// }) => {
//   if (!nodePosition || !handlePos || !handlesParentPosition) return {};
//   const calc = nodePosition.width - handleSize + nodePosition.left - handlePos.left;
//   const r = useRef();
//   let left = calc;
//   // we don't want the 'left' value to leap back and forth so check if the previous value was stable(==0) and if so use it
//   if (handlePrevPos) if (calc == 0) left = nodePosition.width - handleSize + nodePosition.left - handlePrevPos.left;
//   return {
//     top: nodePosition.top - handlesParentPosition.top,
//     left: left,
//     cursor: "e-resize",
//     height: nodePosition?.height,
//     width: handleSize,
//   };
// };

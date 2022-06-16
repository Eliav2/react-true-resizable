import React, { useRef, useState } from "react";
import usePosition, { positionType } from "shared/hooks/usePosition";
import { handleNameType, ResizableProps } from "./Resizable";
import useRerender from "shared/hooks/useRerender";
import { HandleStyleFnType } from "./HandleFns";

export type allowResizeType = "horizontal" | "vertical";
export type handleOptionsType = {
  allowResize: { [key in allowResizeType]?: { reverseDrag: boolean } };
  size: number;
};

export type handlesOptionsType = { [key in handleNameType]?: Partial<handleOptionsType> };

export interface HandleProps {
  ResizableProps: ResizableProps;
  nodePosition: positionType;
  nodeRef: React.RefObject<any>;
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
  handleOptions: handleOptionsType;
  handlesOptions: handlesOptionsType;
  handleStyle: React.CSSProperties;
}

/** receives prop and returns a parsed prop(the most expanded form) with a default value */
const parseProp = (prop) => {};

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

  let gridH: number | undefined, gridV: number | undefined;
  if (typeof ResizableProps.grid === "number") {
    gridH = ResizableProps.grid;
    gridV = ResizableProps.grid;
  } else {
    gridH = ResizableProps.grid?.horizontal;
    gridV = ResizableProps.grid?.vertical;
  }
  const getEnableRelativeOffsetTop = (event) => {
    let top = event.clientY - initialDraggingPointerPos.y;
    if (gridV) top -= (event.clientY % gridV) - (initialDraggingPointerPos.y % gridV);
    return top;
  };
  const getEnableRelativeOffsetLeft = (event) => {
    let left = event.clientX - initialDraggingPointerPos.x;
    if (gridH) left -= (event.clientX % gridH) - (initialDraggingPointerPos.x % gridH);
    return left;
  };

  const onPointerDown = (event: React.PointerEvent<HTMLDivElement>) => {
    setIsDragging(true);
    // lock the pointer events to this element until release - this way we don't need to listen to global mouse events
    handleRef.current?.setPointerCapture(event.pointerId);
    setPointerId(event.pointerId);
    const dims = nodeRef?.current?.getBoundingClientRect();
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
    if (isDragging) {
      if ("vertical" in handleOptions.allowResize) {
        const dragDirVertical = reverseVerticalDrag ? -1 : 1;
        let height =
          initialDraggingElementSize.height - //  move relative to the elements size
          // change position relative to the pointer position
          (initialDraggingPointerPos.y - event.clientY) * dragDirVertical;
        if (gridV)
          // snap to grid with initial grid offset
          height -= ((event.clientY % gridV) - (initialDraggingPointerPos.y % gridV)) * dragDirVertical;
        // enable natural resize of top handle
        if (ResizableProps.enableRelativeOffset && dragDirVertical === -1) {
          if (height > 0) setCalculatedTop(getEnableRelativeOffsetTop(event) + endDraggingOffsetTop);
        }

        setCalculatedHeight(height);
      }
      if ("horizontal" in handleOptions.allowResize) {
        const dragDirHorizontal = reverseHorizontalDrag ? -1 : 1;
        let width =
          initialDraggingElementSize.width - //  move relative to the elements size
          // change position relative to the pointer position
          (initialDraggingPointerPos.x - event.clientX) * dragDirHorizontal;
        if (gridH)
          // snap to ResizableProps.grid with initial ResizableProps.grid offset
          width -= ((event.clientX % gridH) - (initialDraggingPointerPos.x % gridH)) * dragDirHorizontal;
        // enable natural resize of left handle
        if (ResizableProps.enableRelativeOffset && dragDirHorizontal === -1) {
          if (width > 0) setCalculatedLeft(getEnableRelativeOffsetLeft(event) + endDraggingOffsetLeft);
        }

        setCalculatedWidth(width);
      }
      if (typeof ResizableProps?.onResize === "function") ResizableProps.onResize(nodePosition);
    }
  };

  const style = HandleStyleFn({
    nodePosition,
    handlePos,
    handlesParentPosition,
    handleSize: handleOptions.size,
    handlesOptions: handlesOptions,
  });

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

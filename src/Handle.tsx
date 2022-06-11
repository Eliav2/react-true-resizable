import React, { useRef, useState } from "react";
import usePosition, { positionType } from "shared/hooks/usePosition";
import { handleNameType, handleOptionsType, ResizableProps } from "./Resizable";
import useRerender from "shared/hooks/useRerender";
import { HandleStyleFnType } from "./HandleFns";

export interface HandleProps {
  ResizableProps: ResizableProps;
  nodePosition: positionType;
  nodeRef: React.RefObject<any>;
  setCalculatedHeight: React.Dispatch<React.SetStateAction<number | null | undefined>>;
  setCalculatedWidth: React.Dispatch<React.SetStateAction<number | null | undefined>>;
  grid: number | undefined;
  HandleStyleFn: HandleStyleFnType;
  handlesParentPosition: positionType;
  handleOptions: handleOptionsType;
  handlesOptions: { [key in handleNameType]: handleOptionsType };
}

export const HandleForward = React.forwardRef(function Handle(
  {
    nodeRef,
    nodePosition,
    setCalculatedHeight,
    setCalculatedWidth,
    grid,
    HandleStyleFn,
    handlesParentPosition,
    handleOptions,
    handlesOptions,
    ResizableProps,
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

  const [isDragging, setIsDragging] = useState(false);
  const [pointerId, setPointerId] = useState<number>(0);

  const handlerRef = useRef<HTMLDivElement>(null);
  // we get only the initial position, and we are confident that the element is not moving relative to its parent
  const handlerPos = usePosition(handlerRef.current);

  const onPointerDown = (event: React.PointerEvent<HTMLDivElement>) => {
    setIsDragging(true);
    handlerRef.current?.setPointerCapture(event.pointerId);
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
  };
  const onPointerUp = (event: React.PointerEvent<HTMLDivElement>) => {
    setIsDragging(false);
    handlerRef.current?.releasePointerCapture(pointerId);
  };
  const onPointerMove = (event: React.PointerEvent<HTMLDivElement>) => {
    if (isDragging) {
      if ("vertical" in handleOptions.allowResize) {
        const dragDirVertical = handleOptions.allowResize["vertical"]?.reverseDrag ? -1 : 1;
        let height =
          initialDraggingElementSize.height - //  move relative to the elements size
          // change position relative to the pointer position
          (initialDraggingPointerPos.y - event.clientY) * dragDirVertical;
        if (grid)
          // snap to grid with initial grid offset
          height -= ((event.clientY % grid) - (initialDraggingPointerPos.y % grid)) * dragDirVertical;
        // if (ResizableProps.minHeight && height < ResizableProps.minHeight) height = ResizableProps.minHeight; @toRemove
        setCalculatedHeight(height);
      }
      if ("horizontal" in handleOptions.allowResize) {
        const dragDirHorizontal = handleOptions.allowResize["horizontal"]?.reverseDrag ? -1 : 1;
        let width =
          initialDraggingElementSize.width - //  move relative to the elements size
          // change position relative to the pointer position
          (initialDraggingPointerPos.x - event.clientX) * dragDirHorizontal;
        if (grid)
          // snap to grid with initial grid offset
          width -= ((event.clientX % grid) - (initialDraggingPointerPos.x % grid)) * dragDirHorizontal;
        // if (ResizableProps.minWidth && width < ResizableProps.minWidth) width = ResizableProps.minWidth; @toRemove

        setCalculatedWidth(width);
      }
    }
  };

  const style = HandleStyleFn({
    nodePosition,
    handlerPos,
    handlesParentPosition,
    handlerSize: handleOptions.size,
    handlesOptions: handlesOptions,
  });

  return (
    <div
      ref={handlerRef}
      style={{
        // background: "green",
        position: "absolute",
        ...style,
        ...handleOptions.style,
      }}
      onPointerMove={onPointerMove}
      onPointerDown={onPointerDown}
      onPointerUp={onPointerUp}
    />
  );
});

// const useGetHandlerStyle = ({
//   nodePosition,
//   handlerPos,
//   handlersParentPosition,
//   handlerSize,
//   handlersOptions,
//   handlerPrevPos,
// }) => {
//   if (!nodePosition || !handlerPos || !handlersParentPosition) return {};
//   const calc = nodePosition.width - handlerSize + nodePosition.left - handlerPos.left;
//   const r = useRef();
//   let left = calc;
//   // we don't want the 'left' value to leap back and forth so check if the previous value was stable(==0) and if so use it
//   if (handlerPrevPos) if (calc == 0) left = nodePosition.width - handlerSize + nodePosition.left - handlerPrevPos.left;
//   return {
//     top: nodePosition.top - handlersParentPosition.top,
//     left: left,
//     cursor: "e-resize",
//     height: nodePosition?.height,
//     width: handlerSize,
//   };
// };

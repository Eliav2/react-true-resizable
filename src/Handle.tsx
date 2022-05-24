import React, { useRef, useState } from "react";
import usePosition, { positionType } from "shared/hooks/usePosition";
import { handlerNameType, handlerOptionsType, ResizableProps } from "./Resizable";
import useRerender from "shared/hooks/useRerender";
import { HandleStyleFnType } from "./HandleFns";

export interface HandlerProps {
  ResizableProps: ResizableProps;
  nodePosition: positionType;
  nodeRef: React.RefObject<any>;
  setCalculatedHeight: React.Dispatch<React.SetStateAction<number | null>>;
  setCalculatedWidth: React.Dispatch<React.SetStateAction<number | null>>;
  grid: number | undefined;
  HandleStyleFn: HandleStyleFnType;
  handlersParentPosition: positionType;
  handlerOptions: handlerOptionsType;
  handlersOptions: { [key in handlerNameType]: handlerOptionsType };
  delayRenders?: number;
}

export const Handle: React.FC<HandlerProps> = React.forwardRef(
  (
    {
      nodeRef,
      nodePosition,
      setCalculatedHeight,
      setCalculatedWidth,
      grid,
      HandleStyleFn,
      handlersParentPosition,
      handlerOptions,
      handlersOptions,
      ResizableProps,
    },
    ref
  ) => {
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
        const dragDir = handlerOptions.reverseDrag ? -1 : 1;
        if (handlerOptions.allowResize.includes("vertical")) {
          let height =
            initialDraggingElementSize.height - //  move relative to the elements size
            // change position relative to the pointer position
            (initialDraggingPointerPos.y - event.clientY) * dragDir;
          if (grid)
            // snap to grid with initial grid offset
            height -= ((event.clientY % grid) - (initialDraggingPointerPos.y % grid)) * dragDir;
          if (ResizableProps.minHeight && height < ResizableProps.minHeight) height = ResizableProps.minHeight;
          setCalculatedHeight(height);
        }
        if (handlerOptions.allowResize.includes("horizontal")) {
          let width =
            initialDraggingElementSize.width - //  move relative to the elements size
            // change position relative to the pointer position
            (initialDraggingPointerPos.x - event.clientX) * dragDir;
          if (grid)
            // snap to grid with initial grid offset
            width -= ((event.clientX % grid) - (initialDraggingPointerPos.x % grid)) * dragDir;
          if (ResizableProps.minWidth && width < ResizableProps.minWidth) width = ResizableProps.minWidth;

          setCalculatedWidth(width);
        }
      }
    };

    const style = HandleStyleFn({
      nodePosition,
      handlerPos,
      handlersParentPosition,
      handlerSize: handlerOptions.size,
      handlersOptions: handlersOptions,
    });

    return (
      <div
        ref={handlerRef}
        style={{
          // background: "green",
          position: "absolute",
          ...style,
          ...handlerOptions.style,
        }}
        onPointerMove={onPointerMove}
        onPointerDown={onPointerDown}
        onPointerUp={onPointerUp}
      />
    );
  }
);

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

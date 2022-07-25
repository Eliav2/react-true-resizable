import React, { FC, useState } from "react";
import { ResizableBaseContextProps, useResizableBase } from "./ResizableBase";
import { positionType } from "shared/hooks/usePosition";
import { HandlesParentInjectedChildrenProps, HandlesParentState } from "./HandlesParent";
import type { MapNonNullable, Primitive, RelativeSize, RespectDefaultProps } from "shared/types";
import { PossiblySpecifyAxis } from "./Resizable";
import { AllowResize } from "./HandleOld";
import { parsePossiblySpecific, PossiblySpecific } from "shared/utils/props";
import { parseRelativeSize } from "shared/utils";
import { useResizableWarn } from "./utils";

type OnResizeEvent = (newPos: { height: number; width: number }, prevPos: Exclude<positionType, null>) => void;
type OnResizeUpdate<T> = (newPos: T, prevPos: Exclude<positionType, null>) => void;

type HandleFunc = (event: React.PointerEvent<HTMLDivElement>) => void;

export interface HandleBaseProps {
  children: (args: {
    style: Pick<React.CSSProperties, "left" | "top" | "position">;
    eventHandlers: { onPointerDown: HandleFunc; onPointerMove: HandleFunc; onPointerUp: HandleFunc };
    context: MapNonNullable<ResizableBaseContextProps>;
  }) => React.ReactNode;

  offset?: { left?: RelativeSize; top?: RelativeSize };
  allowResize?: AllowResize;
  grid?: PossiblySpecifyAxis<number>;
  resizeRatio?: PossiblySpecifyAxis<number>;
  onResizeEnd?: (prevPos: Exclude<positionType, null>) => void;
  onResizeStart?: (prevPos: Exclude<positionType, null>) => void;
  onResize?: OnResizeEvent | { horizontal?: OnResizeUpdate<{ width: number }>; vertical?: OnResizeUpdate<{ height: number }> };
  enableRelativeOffset?: boolean;

  disableControl?: PossiblySpecifyAxis<boolean>;
}

interface HandleNewFinalProps extends HandleBaseProps, HandlesParentInjectedChildrenProps {}

/** This Component creates and passes eventHandles, style, and context to children
 * this component does not create DOM node of its own, it's only used to pass props to children
 * @param _props.children - function that receives props (HandleBaseProps['children]) and returns a ReactNode
 * */
const HandleBase: FC<HandleBaseProps> = (_props) => {
  // console.log("HandleBase");
  const props = _props as RespectDefaultProps<HandleNewFinalProps, typeof HandleNewDefaultProps>;

  const ResizableState = useResizableBase();
  const {
    nodePosition,
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
  } = ResizableState;
  // const { handlesParentPosition } = props;
  const { handlesParentPosition, contextAppear } = React.useContext(HandlesParentState);
  const warn = useResizableWarn();
  if (!process.env.NODE_ENV || process.env.NODE_ENV !== "production")
    if (!contextAppear)
      warn(
        "Handle is used without HandlesParent wrapper. wrap HandlesParent around your Handle component.\n for example: \n <HandlesParent><Handle><div/></Handle></HandlesParent>"
      );

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

  if (!nodePosition) return <div />;

  const _1 = props.allowResize?.["vertical"];
  const reverseVerticalDrag = typeof _1 === "boolean" ? false : _1?.reverseDrag ?? false;
  const _2 = props.allowResize?.["horizontal"];
  const reverseHorizontalDrag = typeof _2 === "boolean" ? false : _2?.reverseDrag ?? false;

  const grid = parsePossiblyAxis(props.grid);
  const resizeRatio = parsePossiblyAxis(props.resizeRatio, HandleNewDefaultProps.resizeRatio);

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
    setInitialDraggingElementSize({
      width: dims.width,
      height: dims.height,
    });
    setInitialDraggingPointerPos({
      x: event.clientX,
      y: event.clientY,
    });
    if (typeof props?.onResizeStart === "function") props.onResizeStart(nodePosition);
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
    if (typeof props?.onResizeEnd === "function") props.onResizeEnd(nodePosition);
  };
  const disableWidthControl = typeof props.disableControl === "boolean" ? props.disableControl : props.disableControl?.horizontal;
  const disableHeightControl = typeof props.disableControl === "boolean" ? props.disableControl : props.disableControl?.vertical;

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
      // enable natural resize of left handle
      if (props.enableRelativeOffset && dragDirHorizontal === -1) {
        if (width > 0) setCalculatedLeft(getEnableRelativeOffsetLeft(event) + endDraggingOffsetLeft);
      }

      if ("vertical" in props.allowResize && props.allowResize["vertical"] && !disableHeightControl) {
        setCalculatedHeight(height);
        if (typeof props?.onResize === "object") props.onResize.vertical?.({ height }, nodePosition);
      }
      if ("horizontal" in props.allowResize && props.allowResize["horizontal"] && !disableWidthControl) {
        setCalculatedWidth(width);
        if (typeof props?.onResize === "object") props.onResize.horizontal?.({ width }, nodePosition);
      }
      if (typeof props?.onResize === "function") props.onResize({ height, width }, nodePosition);
    }
  };

  const leftRel = parseRelativeSize(props.offset.left ?? "0%");
  const topRel = parseRelativeSize(props.offset.top ?? "0%");
  const left = handlesParentPosition
    ? nodePosition.left - handlesParentPosition.left + (leftRel.percent * nodePosition.width + leftRel.abs)
    : 0;
  const top = handlesParentPosition
    ? nodePosition.top - handlesParentPosition.top + (topRel.percent * nodePosition.height + topRel.abs)
    : 0;

  return props.children({
    style: {
      left,
      top,
      position: "absolute",
      // transform: `translate(-${leftP}%,-${topP}%)`,
      // transform: `translate(-${leftRel.percent * 100}%,-${topRel.percent * 100}%)`,
    },
    eventHandlers: { onPointerDown: resizeStart, onPointerMove: resize, onPointerUp: resizeEnd },
    context: ResizableState as MapNonNullable<ResizableBaseContextProps>,
  });
};

const HandleNewDefaultProps = {
  offset: { left: "0%", top: "0%" },
  resizeRatio: 1,
  allowResize: {},
  disableControl: false,
} as const;
HandleBase.defaultProps = HandleNewDefaultProps;

const parsePossiblyAxis = <
  Spec extends string[],
  Prop extends PossiblySpecific<Primitive, "horizontal" | "vertical">,
  Default extends NonNullable<Primitive> | undefined = undefined
>(
  prop: Prop,
  defaultProp?: Default
) => parsePossiblySpecific<["horizontal", "vertical"], Prop, Default>(prop, ["horizontal", "vertical"], defaultProp);

export default HandleBase;

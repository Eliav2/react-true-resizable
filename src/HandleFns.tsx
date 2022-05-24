import { round } from "./utils";
import React, { useLayoutEffect, useRef } from "react";
import { positionType } from "shared/hooks/usePosition";
import { handlerNameType, handlerOptionsType } from "./Resizable";

// this is possible hook or possibly normal function
export type HandleStyleFnType = (arg: {
  nodePosition: positionType;
  handlerPos: positionType;
  handlersParentPosition: positionType;
  handlerSize: number;
  handlersOptions: { [key in handlerNameType]?: handlerOptionsType };
}) => React.CSSProperties | undefined;
/**
 *  Handles Styles
 *
 *  'right' special case (since the relative position depends on him) - for him, we will get the wanted style
 *  via relatively complicated special hook which can remembers last stable position and adjust the new style based on the
 *  last stable position.
 ***************************************************************/

export const topHandlerStyle: HandleStyleFnType = ({
  nodePosition,
  handlerPos,
  handlersParentPosition,
  handlerSize,
  handlersOptions,
}) => {
  if (!nodePosition || !handlerPos || !handlersParentPosition) return {};
  let top = nodePosition.top - handlersParentPosition.top;

  return {
    top: round(top),
    left: round(nodePosition.left - handlersParentPosition.left + (handlersOptions.left?.size ?? 0)),
    cursor: "n-resize",
    width: round(nodePosition?.width - (handlersOptions.left?.size ?? 0) - (handlersOptions.right?.size ?? 0)),
    height: handlerSize,
  };
};
export const bottomHandlerStyle: HandleStyleFnType = ({
  nodePosition,
  handlerPos,
  handlersParentPosition,
  handlerSize,
  handlersOptions,
}) => {
  if (!nodePosition || !handlerPos || !handlersParentPosition) return {};
  let top = nodePosition.top + nodePosition.height - handlersParentPosition.top - handlerSize;

  return {
    top: round(top),
    left: round(nodePosition.left - handlersParentPosition.left + (handlersOptions.left?.size ?? 0)),
    cursor: "n-resize",
    width: round(nodePosition?.width - (handlersOptions.left?.size ?? 0) - (handlersOptions.right?.size ?? 0)),
    height: handlerSize,
  };
};
export const leftHandlerStyle: HandleStyleFnType = ({
  nodePosition,
  handlerPos,
  handlersParentPosition,
  handlerSize,
}) => {
  if (!nodePosition || !handlerPos || !handlersParentPosition) return {};
  return {
    top: nodePosition.top - handlersParentPosition.top,
    left: nodePosition.left - handlersParentPosition.left,
    cursor: "e-resize",
    height: nodePosition?.height,
    width: handlerSize,
  };
};
export const useRightHandlerStyle: HandleStyleFnType = ({
  nodePosition,
  handlerPos,
  handlersParentPosition,
  handlerSize,
}) => {
  if (!nodePosition || !handlerPos || !handlersParentPosition) return {};
  let left = nodePosition.width - handlerSize - (handlersParentPosition.left - nodePosition.left);

  return {
    top: round(nodePosition.top - handlersParentPosition.top),
    left: round(left),
    cursor: "e-resize",
    height: round(nodePosition?.height),
    width: round(handlerSize),
  };
};
export const defaultHandlersFn = {
  top: topHandlerStyle,
  left: leftHandlerStyle,
  bottom: bottomHandlerStyle,
  right: useRightHandlerStyle,
} as const;

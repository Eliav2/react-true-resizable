import { round } from "./utils";
import React from "react";
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
    cursor: "ns-resize",
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
    cursor: "ns-resize",
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
    cursor: "ew-resize",
    height: nodePosition?.height,
    width: handlerSize,
  };
};
export const rightHandlerStyle: HandleStyleFnType = ({
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
    cursor: "ew-resize",
    height: round(nodePosition?.height),
    width: round(handlerSize),
  };
};
export const bottomRightHandlerStyle: HandleStyleFnType = ({
  nodePosition,
  handlerPos,
  handlersParentPosition,
  handlerSize,
}) => {
  if (!nodePosition || !handlerPos || !handlersParentPosition) return {};
  let left = nodePosition.width - handlerSize - (handlersParentPosition.left - nodePosition.left);

  return {
    top: round(nodePosition.top - handlersParentPosition.top + nodePosition.height - handlerSize),
    left: round(left),
    cursor: "nwse-resize",
    height: round(handlerSize),
    width: round(handlerSize),
    background: "blue",
  } as React.CSSProperties;
};

export const bottomLeftHandlerStyle: HandleStyleFnType = ({
  nodePosition,
  handlerPos,
  handlersParentPosition,
  handlerSize,
}) => {
  if (!nodePosition || !handlerPos || !handlersParentPosition) return {};
  return {
    top: nodePosition.height + -handlerSize + nodePosition.top - handlersParentPosition.top,
    left: nodePosition.left - handlersParentPosition.left,
    cursor: "nesw-resize",
    height: handlerSize,
    width: handlerSize,
    background: "blue",
  } as React.CSSProperties;
};
export const topRightHandlerStyle: HandleStyleFnType = ({
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
    cursor: "nesw-resize",
    height: round(handlerSize),
    width: round(handlerSize),
    background: "red",
  };
};
export const topLeftHandlerStyle: HandleStyleFnType = ({
  nodePosition,
  handlerPos,
  handlersParentPosition,
  handlerSize,
}) => {
  if (!nodePosition || !handlerPos || !handlersParentPosition) return {};

  return {
    top: round(nodePosition.top - handlersParentPosition.top),
    left: round(nodePosition.left - handlersParentPosition.left),
    cursor: "nwse-resize",
    height: round(handlerSize),
    width: round(handlerSize),
    background: "purple",
  };
};

export const defaultHandlersFn = {
  top: topHandlerStyle,
  left: leftHandlerStyle,
  bottom: bottomHandlerStyle,
  right: rightHandlerStyle,
  bottomRight: bottomRightHandlerStyle,
  bottomLeft: bottomLeftHandlerStyle,
  topRight: topRightHandlerStyle,
  topLeft: topLeftHandlerStyle,
} as const;

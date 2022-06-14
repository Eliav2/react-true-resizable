import React from "react";
import { positionType } from "shared/hooks/usePosition";
import { handlesOptionsType } from "./Handle";
import { round } from "./utils.js";

// this is possible hook or possibly normal function
export type HandleStyleFnType = (arg: {
  nodePosition: positionType;
  handlerPos: positionType;
  handlesParentPosition: positionType;
  handlerSize: number;
  handlesOptions: handlesOptionsType;
}) => React.CSSProperties | undefined;

/**
 *  Handles Styles
 *
 ***************************************************************/

export const topHandlerStyle: HandleStyleFnType = ({
  nodePosition,
  handlerPos,
  handlesParentPosition,
  handlerSize,
  handlesOptions,
}) => {
  if (!nodePosition || !handlerPos || !handlesParentPosition) return {};
  let top = nodePosition.top - handlesParentPosition.top;

  return {
    top: round(top),
    left: round(nodePosition.left - handlesParentPosition.left + (handlesOptions.left?.size ?? 0)),
    cursor: "ns-resize",
    width: round(nodePosition?.width - (handlesOptions.left?.size ?? 0) - (handlesOptions.right?.size ?? 0)),
    height: handlerSize,
  };
};
export const bottomHandlerStyle: HandleStyleFnType = ({
  nodePosition,
  handlerPos,
  handlesParentPosition,
  handlerSize,
  handlesOptions,
}) => {
  if (!nodePosition || !handlerPos || !handlesParentPosition) return {};
  let top = nodePosition.top + nodePosition.height - handlesParentPosition.top - handlerSize;

  return {
    top: round(top),
    left: round(nodePosition.left - handlesParentPosition.left + (handlesOptions.left?.size ?? 0)),
    cursor: "ns-resize",
    width: round(nodePosition?.width - (handlesOptions.left?.size ?? 0) - (handlesOptions.right?.size ?? 0)),
    height: handlerSize,
  };
};
export const leftHandlerStyle: HandleStyleFnType = ({
  nodePosition,
  handlerPos,
  handlesParentPosition,
  handlerSize,
}) => {
  if (!nodePosition || !handlerPos || !handlesParentPosition) return {};
  return {
    top: nodePosition.top - handlesParentPosition.top,
    left: nodePosition.left - handlesParentPosition.left,
    cursor: "ew-resize",
    height: nodePosition?.height,
    width: handlerSize,
  };
};
export const rightHandlerStyle: HandleStyleFnType = ({
  nodePosition,
  handlerPos,
  handlesParentPosition,
  handlerSize,
}) => {
  if (!nodePosition || !handlerPos || !handlesParentPosition) return {};
  let left = nodePosition.width - handlerSize - (handlesParentPosition.left - nodePosition.left);

  return {
    top: round(nodePosition.top - handlesParentPosition.top),
    left: round(left),
    cursor: "ew-resize",
    height: round(nodePosition?.height),
    width: round(handlerSize),
  };
};
export const bottomRightHandlerStyle: HandleStyleFnType = ({
  nodePosition,
  handlerPos,
  handlesParentPosition,
  handlerSize,
}) => {
  if (!nodePosition || !handlerPos || !handlesParentPosition) return {};
  let left = nodePosition.width - handlerSize - (handlesParentPosition.left - nodePosition.left);

  return {
    top: round(nodePosition.top - handlesParentPosition.top + nodePosition.height - handlerSize),
    left: round(left),
    cursor: "nwse-resize",
    height: round(handlerSize),
    width: round(handlerSize),
  } as React.CSSProperties;
};

export const bottomLeftHandlerStyle: HandleStyleFnType = ({
  nodePosition,
  handlerPos,
  handlesParentPosition,
  handlerSize,
}) => {
  if (!nodePosition || !handlerPos || !handlesParentPosition) return {};
  return {
    top: nodePosition.height + -handlerSize + nodePosition.top - handlesParentPosition.top,
    left: nodePosition.left - handlesParentPosition.left,
    cursor: "nesw-resize",
    height: handlerSize,
    width: handlerSize,
  } as React.CSSProperties;
};
export const topRightHandlerStyle: HandleStyleFnType = ({
  nodePosition,
  handlerPos,
  handlesParentPosition,
  handlerSize,
}) => {
  if (!nodePosition || !handlerPos || !handlesParentPosition) return {};
  let left = nodePosition.width - handlerSize - (handlesParentPosition.left - nodePosition.left);

  return {
    top: round(nodePosition.top - handlesParentPosition.top),
    left: round(left),
    cursor: "nesw-resize",
    height: round(handlerSize),
    width: round(handlerSize),
  };
};
export const topLeftHandlerStyle: HandleStyleFnType = ({
  nodePosition,
  handlerPos,
  handlesParentPosition,
  handlerSize,
}) => {
  if (!nodePosition || !handlerPos || !handlesParentPosition) return {};

  return {
    top: round(nodePosition.top - handlesParentPosition.top),
    left: round(nodePosition.left - handlesParentPosition.left),
    cursor: "nwse-resize",
    height: round(handlerSize),
    width: round(handlerSize),
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

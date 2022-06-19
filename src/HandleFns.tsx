import React from "react";
import { positionType } from "shared/hooks/usePosition";
import { HandlesOptions } from "./Handle";
import { round } from "./utils.js";

// this is possible hook or possibly normal function
export type HandleStyleFnType = (arg: {
  nodePosition: positionType;
  handlePos: positionType;
  handlesParentPosition: positionType;
  handleSize: number;
  handlesOptions: HandlesOptions;
}) => React.CSSProperties | undefined;

/**
 *  Handles Styles
 *
 ***************************************************************/

export const topHandleStyle: HandleStyleFnType = ({
  nodePosition,
  handlePos,
  handlesParentPosition,
  handleSize,
  handlesOptions,
}) => {
  if (!nodePosition || !handlePos || !handlesParentPosition) return {};
  let top = nodePosition.top - handlesParentPosition.top;

  return {
    top: round(top),
    left: round(nodePosition.left - handlesParentPosition.left + (handlesOptions.left?.size ?? 0)),
    cursor: "ns-resize",
    width: round(nodePosition?.width - (handlesOptions.left?.size ?? 0) - (handlesOptions.right?.size ?? 0)),
    height: handleSize,
  };
};
export const bottomHandleStyle: HandleStyleFnType = ({
  nodePosition,
  handlePos,
  handlesParentPosition,
  handleSize,
  handlesOptions,
}) => {
  if (!nodePosition || !handlePos || !handlesParentPosition) return {};
  let top = nodePosition.top + nodePosition.height - handlesParentPosition.top - handleSize;

  return {
    top: round(top),
    left: round(nodePosition.left - handlesParentPosition.left + (handlesOptions.left?.size ?? 0)),
    cursor: "ns-resize",
    width: round(nodePosition?.width - (handlesOptions.left?.size ?? 0) - (handlesOptions.right?.size ?? 0)),
    height: handleSize,
  };
};
export const leftHandleStyle: HandleStyleFnType = ({ nodePosition, handlePos, handlesParentPosition, handleSize }) => {
  if (!nodePosition || !handlePos || !handlesParentPosition) return {};
  return {
    top: nodePosition.top - handlesParentPosition.top,
    left: nodePosition.left - handlesParentPosition.left,
    cursor: "ew-resize",
    height: nodePosition?.height,
    width: handleSize,
  };
};
export const rightHandleStyle: HandleStyleFnType = ({ nodePosition, handlePos, handlesParentPosition, handleSize }) => {
  if (!nodePosition || !handlePos || !handlesParentPosition) return {};
  let left = nodePosition.width - handleSize - (handlesParentPosition.left - nodePosition.left);

  return {
    top: round(nodePosition.top - handlesParentPosition.top),
    left: round(left),
    cursor: "ew-resize",
    height: round(nodePosition?.height),
    width: round(handleSize),
  };
};
export const bottomRightHandleStyle: HandleStyleFnType = ({
  nodePosition,
  handlePos,
  handlesParentPosition,
  handleSize,
}) => {
  if (!nodePosition || !handlePos || !handlesParentPosition) return {};
  let left = nodePosition.width - handleSize - (handlesParentPosition.left - nodePosition.left);

  return {
    top: round(nodePosition.top - handlesParentPosition.top + nodePosition.height - handleSize),
    left: round(left),
    cursor: "nwse-resize",
    height: round(handleSize),
    width: round(handleSize),
  } as React.CSSProperties;
};

export const bottomLeftHandleStyle: HandleStyleFnType = ({
  nodePosition,
  handlePos,
  handlesParentPosition,
  handleSize,
}) => {
  if (!nodePosition || !handlePos || !handlesParentPosition) return {};
  return {
    top: nodePosition.height + -handleSize + nodePosition.top - handlesParentPosition.top,
    left: nodePosition.left - handlesParentPosition.left,
    cursor: "nesw-resize",
    height: handleSize,
    width: handleSize,
  } as React.CSSProperties;
};
export const topRightHandleStyle: HandleStyleFnType = ({
  nodePosition,
  handlePos,
  handlesParentPosition,
  handleSize,
}) => {
  if (!nodePosition || !handlePos || !handlesParentPosition) return {};
  let left = nodePosition.width - handleSize - (handlesParentPosition.left - nodePosition.left);

  return {
    top: round(nodePosition.top - handlesParentPosition.top),
    left: round(left),
    cursor: "nesw-resize",
    height: round(handleSize),
    width: round(handleSize),
  };
};
export const topLeftHandleStyle: HandleStyleFnType = ({
  nodePosition,
  handlePos,
  handlesParentPosition,
  handleSize,
}) => {
  if (!nodePosition || !handlePos || !handlesParentPosition) return {};

  return {
    top: round(nodePosition.top - handlesParentPosition.top),
    left: round(nodePosition.left - handlesParentPosition.left),
    cursor: "nwse-resize",
    height: round(handleSize),
    width: round(handleSize),
  };
};

export const defaultHandlesFn = {
  top: topHandleStyle,
  left: leftHandleStyle,
  bottom: bottomHandleStyle,
  right: rightHandleStyle,
  bottomRight: bottomRightHandleStyle,
  bottomLeft: bottomLeftHandleStyle,
  topRight: topRightHandleStyle,
  topLeft: topLeftHandleStyle,
} as const;

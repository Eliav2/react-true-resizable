import React, { useImperativeHandle, useRef } from "react";
import usePosition, { positionType } from "shared/hooks/usePosition";
import type { PossiblyArray } from "shared/types";
import { useResizableBase } from "./ResizableBase";
import ReactDOM from "react-dom";

export type HandlesParentState = { handleParentRef: React.RefObject<HTMLElement>; handlesParentPosition: positionType };
export const HandlesParentState = React.createContext<HandlesParentState>({
  handleParentRef: { current: null },
  handlesParentPosition: null,
});

export interface HandlesParentProps {
  children: PossiblyArray<React.ReactElement>;
}

export interface HandlesParentInjectedChildrenProps {
  handleParentRef?: React.RefObject<HTMLDivElement>;
  handlesParentPosition?: positionType;
}

export interface HandlesParentRefHandle {
  handleParentRef: React.RefObject<HTMLDivElement>;
  handlesParentPosition: positionType;
}

/**
 * injects parent handles as a children of the target DOM node using portal
 */
const HandlesParent = React.forwardRef<HandlesParentRefHandle, HandlesParentProps>(({ children }, ref) => {
  // console.log("HandlesParent");
  const handleParentRef = useRef<HTMLDivElement>(null);
  const handlesParentPosition = usePosition(handleParentRef.current);
  const ResizableState = useResizableBase();
  const { nodeRef } = ResizableState;

  useImperativeHandle(ref, () => ({
    handleParentRef,
    handlesParentPosition,
  }));

  return (
    nodeRef.current && (
      // inject handles as children to target DOM node
      <HandlesParentState.Provider value={{ handleParentRef, handlesParentPosition }}>
        {ReactDOM.createPortal(
          <div style={{ position: "absolute" }} ref={handleParentRef} children={children} />,
          nodeRef.current
        )}
      </HandlesParentState.Provider>
    )
  );
});

export default HandlesParent;

import React, { useImperativeHandle, useLayoutEffect, useRef, useState } from "react";
import { RespectDefaultProps } from "shared/types/utils";
import { checkProps } from "./ResizableElement";
import { ResizableDefaultProps } from "./Resizable";
import { useOneTimeWarn } from "shared/hooks/useOneTimeWarn";
import usePosition, { positionType } from "shared/hooks/usePosition";
import useRerender from "shared/hooks/useRerender";
import { useResizableWarn } from "./utils";

interface ResizableBaseProps {
  children: React.ReactNode;
  imperativeRef?: React.RefObject<{}>;
}

/**
 * Provides a shared context state for each individual Resizable component (Handle,HandleBase,HandlesParents,ResizableElement) inside it.
 * does not inject handles
 */
const ResizableBaseForward = React.forwardRef<HTMLElement, ResizableBaseProps>(function ResizableBase(
  _props: ResizableBaseProps,
  forwardedRef
) {
  const props = _props as RespectDefaultProps<ResizableBaseProps, typeof ResizableDefaultProps>;

  let nodeRef = useRef<HTMLElement>(null);
  const nodePosition = usePosition(nodeRef.current);

  const [initialHeight, setInitialHeight] = useState("");
  const [initialWidth, setInitialWidth] = useState("");
  const [calculatedHeight, setCalculatedHeight] = useState<number | null | undefined>(undefined);
  const [calculatedWidth, setCalculatedWidth] = useState<number | null | undefined>(undefined);

  const [calculatedLeft, setCalculatedLeft] = useState<number | null | undefined>(0);
  const [calculatedTop, setCalculatedTop] = useState<number | null | undefined>(0);

  const [endDraggingOffsetTop, setEndDraggingOffsetTop] = useState(0);
  const [endDraggingOffsetLeft, setEndDraggingOffsetLeft] = useState(0);

  const render = useRerender();

  // rerender when nodeRef changes
  useLayoutEffect(() => {
    render();
  }, [nodeRef.current]);

  useLayoutEffect(() => {
    if (nodeRef.current) {
      let { height, width } = nodeRef.current.getBoundingClientRect?.() ?? {};
      // console.log("useLayoutEffect", nodeRef.style.height, nodeRef.style.width);

      setCalculatedHeight(height);
      setCalculatedWidth(width);
      if (nodeRef.current.style) {
        setInitialHeight(nodeRef.current.style.height ?? "");
        setInitialWidth(nodeRef.current.style.width ?? "");
      }
    }
  }, [nodeRef.current]);

  // add event listeners to the window on mount
  useLayoutEffect(() => {
    window.addEventListener("resize", render);
    return () => {
      window.removeEventListener("resize", render);
    };
  }, []);

  const val = {
    contextAppear: true,

    nodeRef,
    // setNodeRef,
    nodePosition,

    initialHeight,
    initialWidth,
    calculatedHeight,
    calculatedWidth,
    calculatedLeft,
    calculatedTop,
    endDraggingOffsetTop,
    endDraggingOffsetLeft,
    setInitialHeight,
    setInitialWidth,
    setCalculatedHeight,
    setCalculatedWidth,
    setCalculatedLeft,
    setCalculatedTop,
    setEndDraggingOffsetTop,
    setEndDraggingOffsetLeft,

    render,
  };

  useImperativeHandle(props.imperativeRef, () => val);

  return (
    (props.children && (
      <ResizableBaseContext.Provider value={val}>
        {/*<ResizableElement {...resizableElementProps}>{props.children}</ResizableElement>*/}
        {props.children}
      </ResizableBaseContext.Provider>
    )) ||
    null
  );
});

export const useResizableBase = () => {
  const val = React.useContext(ResizableBaseContext);
  if (process.env.NODE_ENV !== "production") {
    const warn = useResizableWarn();
    if (!val.contextAppear) warn("Component is not wrapped with ResizableState, so it will not work properly");
  }
  return React.useContext(ResizableBaseContext);
};

export interface ResizableBaseContextProps {
  /** to indicate whether ResizableContext is wrapper around Resizable */
  contextAppear: boolean;

  /** react ref to the target DOM node */
  nodeRef: React.RefObject<HTMLElement>;
  /** current position of the target DOM node */
  nodePosition: positionType;

  initialHeight: string;
  initialWidth: string;
  calculatedHeight: number | null | undefined;
  calculatedWidth: number | null | undefined;
  calculatedLeft: number | null | undefined;
  calculatedTop: number | null | undefined;
  endDraggingOffsetTop: number;
  endDraggingOffsetLeft: number;
  setInitialHeight: React.Dispatch<React.SetStateAction<string>>;
  setInitialWidth: React.Dispatch<React.SetStateAction<string>>;
  setCalculatedHeight: React.Dispatch<React.SetStateAction<number | null | undefined>>;
  setCalculatedWidth: React.Dispatch<React.SetStateAction<number | null | undefined>>;
  setCalculatedLeft: React.Dispatch<React.SetStateAction<number | null | undefined>>;
  setCalculatedTop: React.Dispatch<React.SetStateAction<number | null | undefined>>;
  setEndDraggingOffsetTop: React.Dispatch<React.SetStateAction<number>>;
  setEndDraggingOffsetLeft: React.Dispatch<React.SetStateAction<number>>;

  render: () => void;
}

const ResizableBaseContext = React.createContext<ResizableBaseContextProps>({
  contextAppear: false,

  nodeRef: { current: null },
  nodePosition: null,

  initialHeight: "",
  initialWidth: "",
  calculatedHeight: null,
  calculatedWidth: null,
  calculatedLeft: null,
  calculatedTop: null,
  endDraggingOffsetTop: 0,
  endDraggingOffsetLeft: 0,
  setInitialHeight: () => {},
  setInitialWidth: () => {},
  setCalculatedHeight: () => {},
  setCalculatedWidth: () => {},
  setCalculatedLeft: () => {},
  setCalculatedTop: () => {},
  setEndDraggingOffsetTop: () => {},
  setEndDraggingOffsetLeft: () => {},

  render: () => {},
});

export default ResizableBaseForward;

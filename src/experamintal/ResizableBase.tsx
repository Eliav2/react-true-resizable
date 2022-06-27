import React, { useImperativeHandle, useLayoutEffect, useState } from "react";
import { RespectDefaultProps } from "shared/types/utils";
import usePassRef from "shared/hooks/usePassRef";
import { ResizableElement } from "./ResizableElement";
import { ResizableDefaultProps, ResizableProps } from "./Resizable";
import { useOneTimeWarn } from "shared/hooks/useOneTimeWarn";
import usePosition, { positionType } from "shared/hooks/usePosition";
import useRerender from "shared/hooks/useRerender";

interface ResizableBaseProps extends ResizableProps {
  handlesElem?: React.ReactNode;
  imperativeRef?: React.RefObject<{}>;
}

/**
 * Provides a shared context state for each individual Resizable component (HandleBase) inside it.
 * does not inject handles
 */
const ResizableBaseForward = React.forwardRef<HTMLElement, ResizableBaseProps>(function ResizableBase(
  _props: ResizableBaseProps,
  forwardedRef
) {
  const props = _props as RespectDefaultProps<ResizableBaseProps, typeof ResizableDefaultProps>;
  let nodeRef = usePassRef<HTMLElement>(props.children);
  // if ref for the target DOM node is explicitly passed, use it instead extracting it from the children
  if (props?.nodeRef) {
    // @ts-ignore
    // noinspection JSConstantReassignment
    nodeRef.current = props.nodeRef.current;
  }
  // if wrapper component tried to access the inner DOM node, let it do so
  if (forwardedRef && typeof forwardedRef == "object" && "current" in forwardedRef && nodeRef)
    forwardedRef.current = nodeRef.current;

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

  // strip away checks in production build
  if (!process.env.NODE_ENV || process.env.NODE_ENV !== "production") checkProps(props, nodeRef);

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
      setInitialHeight(nodeRef.current.style.height ?? "");
      setInitialWidth(nodeRef.current.style.width ?? "");
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

  const { nodeRef: _1, ...resizableElementProps } = props;

  return (
    (props.children && (
      <ResizableBaseContext.Provider value={val}>
        <ResizableElement nodeRef={nodeRef} {...resizableElementProps}>
          {props.children}
        </ResizableElement>
        {props.handlesElem}
      </ResizableBaseContext.Provider>
    )) ||
    null
  );
});

export const useResizableBase = () => {
  const val = React.useContext(ResizableBaseContext);
  if (process.env.NODE_ENV !== "production") {
    const warn = useOneTimeWarn("Resizable: ");
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

const checkProps = (props: ResizableProps, nodeRef: React.RefObject<HTMLElement>) => {
  const warn = useOneTimeWarn("Resizable: ");

  if (props.children) {
    if (typeof props.children.type == "string") {
      // this is a simple React element (div, span, etc)
    } else {
      // this is a React component instance
      // @ts-ignore
      const isForwardRef = props.children?.type?.$$typeof?.toString() == Symbol("react.forward_ref").toString();
      if (!isForwardRef && !props.nodeRef) {
        warn(
          `element '${props.children.type.name}' is a React component, therefore it should be wrapped with React.forwardRef in order to work properly with Resizable\n see https://reactjs.org/docs/forwarding-refs.html`
        );
      }
    }

    React.Children.only(props.children);
    if (typeof props.children == "string" || typeof props.children == "number" || typeof props.children == "boolean")
      warn(
        `Resizable: element '${props.children}' is not valid child for Resizable, wrap it simple element like div element\nFor example - <div>${props.children}</div>`
      );
  }
  if (!props.nodeRef && !props.children)
    warn("at least one property: 'nodeRef' or 'children' should be passed to Resizable");
  if (nodeRef.current) {
    const node = nodeRef.current;
    if ((props.enableRelativeOffset && !node.style.position) || node.style.position == "static") {
      warn(
        `enableRelativeOffset is set to true, so style.position should be set to value other than 'static',currently it is '${node.style.position}'`
      );
    }
  }
};

export default ResizableBaseForward;

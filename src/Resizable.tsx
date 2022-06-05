import React, { useEffect, useLayoutEffect, useRef, useState } from "react";
import usePassRef from "shared/hooks/usePassRef";
import useRerender from "shared/hooks/useRerender";
import { Handle } from "./Handle";
import usePosition, { positionType } from "shared/hooks/usePosition";
import { cloneDeep, merge } from "lodash";
import ReactDOM from "react-dom";
import { defaultHandlersFn } from "./HandleFns";

export interface ResizableProps {
  // A simple React element(like div) or React forwardRef element(React element which passed down a ref to a DOM element)
  children?: React.ReactElement;
  // Allow resize with respect to a grid
  grid?: number;
  // a callback that is called after resize ended and the DOM element is updated
  onResizeEffect?: ((dims: positionType) => void) | null;

  // renderRef?: React.RefObject<any>; // @deprecated

  // An array handlers to enable
  handles?: handleNameType[];
  // options that will be passed to all handles
  allHandlerOptions?: Partial<Partial<handleOptionsType>>;
  handlersOptions?: { [key in handleNameType]?: Partial<handleOptionsType> };
  minHeight?: number;
  minWidth?: number;
  nodeRef?: React.RefObject<any>;
}

const Resizable: React.FC<ResizableProps> = React.forwardRef((props: ResizableProps, ref) => {
  // console.log("Resizable");
  let {
    grid,
    children,
    onResizeEffect,
    // renderRef,
    handles = Object.keys(defaultHandlersFn) as handleNameType[],
    allHandlerOptions = {},
    handlersOptions = {},
  } = props;
  let mergedHandlersOptions = merge(cloneDeep(defaultHandlersOptions), handlersOptions);
  let mergedHandlerOptions = merge(cloneDeep(defaultHandlerOptions), allHandlerOptions);
  const render = useRerender();

  // if the children passed a ref - copy its value instead of creating a new one
  let nodeRef = usePassRef(children);
  if (props.nodeRef) nodeRef = props.nodeRef;

  // if Resizable would be wrapped with other components - the node ref would be passed to the wrapper
  if (ref && nodeRef) ref.current = nodeRef.current;

  const nodePosition = usePosition(nodeRef.current);

  const handlerParentRef = useRef(null);
  const handlesParentPosition = usePosition(handlerParentRef.current);

  const [calculatedHeight, setCalculatedHeight] = useState<number | null>(null);
  const [calculatedWidth, setCalculatedWidth] = useState<number | null>(null);

  // add event listeners to the window on mount
  useLayoutEffect(() => {
    // if (renderRef)
    //   // @ts-ignore
    //   renderRef.current = render;
    window.addEventListener("resize", render);
    return () => {
      window.removeEventListener("resize", render);
    };
  }, []);

  useLayoutEffect(() => {
    let { height, width } = nodeRef?.current?.getBoundingClientRect?.() ?? {};
    setCalculatedHeight(height);
    setCalculatedWidth(width);
  }, [nodeRef.current]);

  useLayoutEffect(() => {
    onResizeEffect && onResizeEffect(nodePosition);
  }, [calculatedHeight, calculatedWidth]);

  // strip away checks in production build
  if (!process.env.NODE_ENV || process.env.NODE_ENV !== "production") checkProps(props);

  let finalHandlersOptions = {} as { [key in handleNameType]: handleOptionsType };
  // fill up empty handles sizes
  for (const handle of handles) {
    if (handle in mergedHandlersOptions) {
      finalHandlersOptions[handle] = merge(cloneDeep(mergedHandlerOptions), mergedHandlersOptions[handle]);
    }
  }

  // const enableHorizontal = handlers.includes("left") || handlers.includes("right");
  // const enableVertical = handlers.includes("top") || handlers.includes("bottom");
  const enableHorizontal = handles.find((h) => h.toLowerCase().includes("left") || h.toLowerCase().includes("right"));
  const enableVertical = handles.find((h) => h.toLowerCase().includes("top") || h.toLowerCase().includes("bottom"));
  const height = enableVertical ? calculatedHeight ?? children?.props?.style?.height ?? undefined : undefined;
  const width = enableHorizontal ? calculatedWidth ?? children?.props?.style?.width ?? undefined : undefined;

  // control the size of the node
  if (nodeRef?.current) {
    if (height) nodeRef.current.style.height = height + "px";
    if (width) nodeRef.current.style.width = width + "px";
  }
  // "border-box" sizing is required for correct positioning of handles
  useEffect(() => {
    if (nodeRef?.current) nodeRef.current.style.boxSizing = "border-box";
  }, [nodeRef.current]);

  return (
    <>
      {/* children element with injected styles*/}
      {children &&
        React.cloneElement(
          children,
          // inject required styles such border-box, and height/width if enabled
          {
            // inject ref to the element in not present from parent
            ref: nodeRef,
            key: "ResizableNode", // required after transpile
            //// todo: should we pass the styles to the child? or should we manipulate styles at the DOM directly?
            // style: {
            //   // boxSizing: "border-box",
            //   height: height,
            //   width: width,
            //   ...omit(children?.props?.style, ["height", "width"]),
            // },
            // //pass rest of props to children
            // ...omit(children?.props, ["style", "ref"]),
          },
          children?.props.children
        )}
      {/* handles */}
      {nodeRef.current &&
        ReactDOM.createPortal(
          <div style={{ position: "absolute" }} ref={handlerParentRef} key={"ResizableHandlerParent"}>
            {/*handles*/}
            {nodePosition &&
              handles.map((handlerName) => {
                // console.log(handlerName);
                return (
                  <Handle
                    key={handlerName}
                    {...{
                      nodeRef,
                      nodePosition,
                      setCalculatedHeight,
                      setCalculatedWidth,
                      grid,
                      HandleStyleFn: defaultHandlersFn[handlerName],
                      handlesParentPosition,
                      handleOptions: finalHandlersOptions[handlerName],
                      handlesOptions: finalHandlersOptions,
                    }}
                    ResizableProps={props}
                  />
                );
              })}
          </div>,
          nodeRef.current
        )}
    </>
  );
});

const checkProps = ({ children, nodeRef }: ResizableProps) => {
  {
    if (children) {
      React.Children.only(children);
      if (typeof children == "string" || typeof children == "number" || typeof children == "boolean")
        console.error(
          `Resizable: element '${children}' is not valid child for Resizable, wrap it simple element like div element\nFor example - <div>${children}</div>`
        );

      if (typeof children.type == "string") {
        // this is a simple React element (div, span, etc)
      } else {
        // this is a React component instance
        // @ts-ignore
        const isForwardRef = children?.type?.$$typeof?.toString() == Symbol("react.forward_ref").toString();
        if (!isForwardRef) {
          console.error(
            `Resizable: element '${children.type.name}' is a React component, therefore it should be wrapped with React.forwardRef in order to work properly with Resizable\n see https://reactjs.org/docs/forwarding-refs.html`
          );
        }
      }
    }
    if (!nodeRef && !children)
      console.error("Resizable: at least one property: 'nodeRef' or 'children' should be passed to Resizable");
  }
};

type allowResizeType = "horizontal" | "vertical";
export type handleOptionsType = {
  allowResize: { [key in allowResizeType]?: { reverseDrag: boolean } };
  size: number;
  style: React.CSSProperties;
};

const defaultHandlerOptions: Partial<handleOptionsType> = {
  size: 10,
};

const defaultHandlersOptions: { [key in handleNameType]: Partial<handleOptionsType> } = {
  top: { allowResize: { vertical: { reverseDrag: true } } },
  left: { allowResize: { horizontal: { reverseDrag: true } } },
  bottom: { allowResize: { vertical: { reverseDrag: false } } },
  right: { allowResize: { horizontal: { reverseDrag: false } } },
  bottomRight: { allowResize: { horizontal: { reverseDrag: false }, vertical: { reverseDrag: false } } },
  bottomLeft: { allowResize: { horizontal: { reverseDrag: true }, vertical: { reverseDrag: false } } },
  topRight: { allowResize: { horizontal: { reverseDrag: false }, vertical: { reverseDrag: true } } },
  topLeft: { allowResize: { horizontal: { reverseDrag: true }, vertical: { reverseDrag: true } } },
};

export type handleNameType = keyof typeof defaultHandlersFn;

Resizable.defaultProps = {
  handles: Object.keys(defaultHandlersFn) as handleNameType[],
  minWidth: 0,
  minHeight: 0,
};

// export default DelayedResizable;
export default Resizable;

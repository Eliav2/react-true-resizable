import React, { useEffect, useLayoutEffect, useRef, useState } from "react";
import usePassRef from "shared/hooks/usePassRef";
import useRerender from "shared/hooks/useRerender";
import { Handle } from "./Handle";
import usePosition, { positionType } from "shared/hooks/usePosition";
import { cloneDeep, merge } from "lodash";
import ReactDOM from "react-dom";
import { defaultHandlersFn } from "./HandleFns";

export interface ResizableProps {
  children?: React.ReactElement;
  // children: React.ReactElement<any, React.ReactHTML[keyof React.ReactHTML]>;
  grid?: number;
  onResize?: ((dims: positionType) => void) | null;
  renderRef?: React.RefObject<any>;
  delayRenders?: number;
  handlers?: handlerNameType[];
  onResizeTop?: ((dims: positionType) => positionType) | null;
  allHandlerOptions?: Partial<Partial<handlerOptionsType>>;
  handlersOptions?: { [key in handlerNameType]?: Partial<handlerOptionsType> };
  reverseDrag?: boolean;
  minHeight?: number;
  minWidth?: number;
  strategy?: "dom-tree" | "react-tree";
  nodeRef?: React.RefObject<any>;
}

const Resizable: React.FC<ResizableProps> = React.forwardRef<any, ResizableProps>((props, ref) => {
  // console.log("Resizable");
  let {
    grid,
    children,
    onResize,
    renderRef,
    handlers = Object.keys(defaultHandlersFn) as handlerNameType[],
    allHandlerOptions = {},
    handlersOptions = {},
    strategy,
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
  const handlersParentPosition = usePosition(handlerParentRef.current);

  const [calculatedHeight, setCalculatedHeight] = useState<number | null>(null);
  const [calculatedWidth, setCalculatedWidth] = useState<number | null>(null);
  useLayoutEffect(() => {
    if (renderRef)
      // @ts-ignore
      renderRef.current = render;
    window.addEventListener("resize", (e) => {
      render();
    });
  }, []);

  useLayoutEffect(() => {
    let { height, width } = nodeRef?.current?.getBoundingClientRect?.() ?? {};
    setCalculatedHeight(height);
    setCalculatedWidth(width);
  }, [nodeRef.current]);

  useLayoutEffect(() => {
    onResize && onResize(nodePosition);
  }, [calculatedHeight, calculatedWidth]);

  // strip away checks in production build
  if (!process.env.NODE_ENV || process.env.NODE_ENV !== "production") checkProps(props);

  let finalHandlersOptions = {} as { [key in handlerNameType]: handlerOptionsType };
  // fill up empty handles sizes
  for (const handle of handlers) {
    if (handle in mergedHandlersOptions) {
      finalHandlersOptions[handle] = merge(cloneDeep(mergedHandlerOptions), mergedHandlersOptions[handle]);
    }
  }

  const enableHorizontal = handlers.includes("left") || handlers.includes("right");
  const enableVertical = handlers.includes("top") || handlers.includes("bottom");
  const height = enableVertical ? calculatedHeight ?? children?.props?.style?.height ?? undefined : undefined;
  const width = enableHorizontal ? calculatedWidth ?? children?.props?.style?.width ?? undefined : undefined;
  // console.log(children);
  // console.log("Resizable", handlerParentRef.current, children?.props.children);

  if (nodeRef?.current) {
    if (height) nodeRef.current.style.height = height + "px";
    if (width) nodeRef.current.style.width = width + "px";
  }
  useEffect(() => {
    if (nodeRef?.current) nodeRef.current.style.boxSizing = "border-box";
  }, [nodeRef.current]);

  // console.log(nodeRef.current.parentElement);

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
              handlers.map((handlerName) => {
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
                      handlersParentPosition,
                      handlerOptions: finalHandlersOptions[handlerName],
                      handlersOptions: finalHandlersOptions,
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

// const DelayedResizable: React.FC<ResizableProps> = React.forwardRef<any, ResizableProps>((props, ref) => {
//   // console.log("DelayedResizeable");
//   const delayRenders = props.delayRenders ?? 3;
//   return <DelayedComponent delayRenders={delayRenders}>{() => <Resizable {...props} ref={ref} />}</DelayedComponent>;
// });

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
export type handlerOptionsType = {
  allowResize: allowResizeType[];
  reverseDrag: boolean;
  size: number;
  style: React.CSSProperties;
};

const defaultHandlerOptions: Partial<handlerOptionsType> = {
  reverseDrag: false,
  size: 10,
};

const defaultHandlersOptions: { [key in handlerNameType]: Partial<handlerOptionsType> } = {
  top: { allowResize: ["vertical"], reverseDrag: true },
  left: { allowResize: ["horizontal"], reverseDrag: true },
  bottom: { allowResize: ["vertical"], reverseDrag: false },
  right: { allowResize: ["horizontal"], reverseDrag: false },
};

export type handlerNameType = keyof typeof defaultHandlersFn;

Resizable.defaultProps = {
  handlers: Object.keys(defaultHandlersFn) as handlerNameType[],
  minWidth: 0,
  minHeight: 0,
  strategy: "react-tree",
};

// export default DelayedResizable;
export default Resizable;

import React, { useEffect, useImperativeHandle, useLayoutEffect, useRef, useState } from "react";
import usePassRef from "shared/hooks/usePassRef";
import useRerender from "shared/hooks/useRerender";
import { cloneDeepNoFunction, mergeRecursive } from "shared/utils";
import { Handle, handleOptionsType, handlesOptionsType } from "./Handle";
import usePosition, { positionType } from "shared/hooks/usePosition";
import ReactDOM from "react-dom";
import { defaultHandlersFn } from "./HandleFns";
import { omitItems } from "./utils";

export type PossiblySpecifyAxis<T> = T | { horizontal?: T; vertical?: T };

export interface ResizableProps {
  /** A simple React element(like div) or React forwardRef element(React element which passed down a ref to a DOM element) */
  children?: React.ReactElement;
  /** a reference to the target DOM node. use this in cases you need more flexibility in your React Tree
   * optional. this is alternative to passing children as a prop.
   * if passed, children prop will be ignored.
   * */
  nodeRef?: React.RefObject<any>;

  /** Allow resize with respect to a grid
   *
   * examples:
   *  - `grid={20}` - allow resize with respect to a grid of 20px (both horizontal and vertical axis)
   *  - `grid={{horizontal:20}}` - allow resize with respect to a horizontal grid of 20px
   * */
  grid?: number | { horizontal: number; vertical: number };
  // todo:fix
  // grid?: PossiblySpecifyAxis<number>;

  /** An array handlers to enable */
  enabledHandles?: handleNameType[];
  /** options that will be passed to all handles */
  handlerOptions?: Partial<handleOptionsType>;
  /** options that will be passed to specific handles. overrides handlerOptions */
  handlersOptions?: { [key in handleNameType]?: Partial<handleOptionsType> };

  /** the height/width target DOM node won't be controlled
   * when set to false, initial height/width is restored
   *
   * examples:
   *  - `disableControl={true}` - will disable the control on height/width of the target DOM node
   *  - `disableControl={{horizontal: true}}` -  will disable the control on height of the target DOM node
   * */
  // disableControl?: boolean | { horizontal: boolean; vertical: boolean };
  disableControl?: PossiblySpecifyAxis<boolean>;

  /** style that will be passed to all handles */
  handleStyle?: React.CSSProperties;
  /** style that will be passed to specific handles. overrides handleStyle */
  handlesStyle?: { [key in handleNameType]?: React.CSSProperties };

  // todo
  //  handleProps
  //  handleComponent
  //  handlesProps
  //  handlesComponent

  // todo
  onResizeEnd?: PossiblySpecifyAxis<(dims: positionType) => void>;
  onResizeStart?: PossiblySpecifyAxis<(dims: positionType) => void>;
  onResize?: PossiblySpecifyAxis<(dims: positionType) => void>;

  /** a callback that is called after resize ended and the DOM element is updated */
  onResizeEffect?: ((dims: positionType) => void) | null;

  /** an imperative ref to Resizable component. ca be used to imperatively trigger actions like height and width control reset */
  ResizableRef?: React.RefObject<ResizableHandle>;

  /** will offset the element using style.left and style.top to make the resize feel more natural
   * affects left and top handles
   * Note: style.position must not be 'static' in order left and top take effect */
  enableRelativeOffset?: boolean;
}

export interface ResizableHandle {
  restControl: (resetHeight?: boolean, resetWidth?: boolean) => void;
}

const Resizable = React.forwardRef<HTMLElement, ResizableProps>(function ResizableForward(
  props: ResizableProps,
  forwardedRef
) {
  // console.log("Resizable");
  let {
    grid,
    children,
    onResizeEffect,
    enabledHandles = Object.keys(defaultHandlersFn) as handleNameType[],
    handlerOptions = {},
    handlersOptions = {},
    // disableHeightControl = false,
    // disableWidthControl = false,
    disableControl = false,
    handleStyle = {},
    handlesStyle = {},
  } = props;
  let mergedHandlersOptions = mergeRecursive(cloneDeepNoFunction(defaultHandlersOptions), handlersOptions);
  let mergedHandlerOptions = mergeRecursive(cloneDeepNoFunction(defaultHandlerOptions), handlerOptions);
  let mergedHandlesStyle = handlesStyle;
  let mergedHandleStyle = handleStyle;
  const render = useRerender();

  // if the children passed a ref - copy its value instead of creating a new one
  let nodeRef = usePassRef<HTMLElement>(children);
  if (props.nodeRef) nodeRef = props.nodeRef;

  // if Resizable would be wrapped with other components - the node ref would be passed to the wrapper
  if (forwardedRef && typeof forwardedRef == "object" && nodeRef) forwardedRef.current = nodeRef.current;

  const nodePosition = usePosition(nodeRef.current);

  const handlerParentRef = useRef(null);
  const handlesParentPosition = usePosition(handlerParentRef.current);

  const [initialHeight, setInitialHeight] = useState("");
  const [initialWidth, setInitialWidth] = useState("");
  const [calculatedHeight, setCalculatedHeight] = useState<number | null | undefined>(undefined);
  const [calculatedWidth, setCalculatedWidth] = useState<number | null | undefined>(undefined);

  const [calculatedLeft, setCalculatedLeft] = useState<number | null | undefined>(0);
  const [calculatedTop, setCalculatedTop] = useState<number | null | undefined>(0);

  const [endDraggingOffsetTop, setEndDraggingOffsetTop] = useState(0);
  const [endDraggingOffsetLeft, setEndDraggingOffsetLeft] = useState(0);

  // console.log(calculatedTop, calculatedHeight);

  // strip away checks in production build
  if (!process.env.NODE_ENV || process.env.NODE_ENV !== "production") checkProps(props);

  let finalHandlesOptions = {} as handlesOptionsType;

  // fill up empty handles sizes
  for (const handle of enabledHandles) {
    if (handle in mergedHandlersOptions) {
      finalHandlesOptions[handle] = mergeRecursive(
        cloneDeepNoFunction(mergedHandlerOptions),
        mergedHandlersOptions[handle]
      );
    }
  }
  let finalHandlesStyle = {} as { [key in handleNameType]?: React.CSSProperties };
  for (const handle of enabledHandles) {
    finalHandlesStyle[handle] = mergeRecursive(cloneDeepNoFunction(handleStyle), handlesStyle?.[handle] ?? {});
  }

  const disableWidthControl = typeof disableControl === "boolean" ? disableControl : disableControl?.horizontal;
  const disableHeightControl = typeof disableControl === "boolean" ? disableControl : disableControl?.vertical;
  const enableHorizontal =
    !disableWidthControl &&
    !!enabledHandles.find((h) => h.toLowerCase().includes("left") || h.toLowerCase().includes("right"));
  const enableVertical =
    !disableHeightControl &&
    !!enabledHandles.find((h) => h.toLowerCase().includes("top") || h.toLowerCase().includes("bottom"));

  // when disabling the control, the width/height should be reset to initial value
  useLayoutEffect(() => {
    if (nodeRef.current && !enableVertical) setCalculatedHeight(null);
    // after first render
    if (nodeRef.current && calculatedHeight) nodeRef.current.style.height = initialHeight;
  }, [enableVertical]);
  useLayoutEffect(() => {
    if (nodeRef.current && !enableHorizontal) setCalculatedWidth(null);
    // after first render
    if (nodeRef.current && calculatedWidth) nodeRef.current.style.width = initialWidth;
  }, [enableHorizontal]);

  // allow imperative reset of height/width
  useImperativeHandle(props.ResizableRef, () => ({
    restControl: (resetHeight = true, resetWidth = true) => {
      if (nodeRef.current && resetHeight) {
        setCalculatedHeight(null);
        nodeRef.current.style.height = initialHeight;
      }
      if (nodeRef.current && resetWidth) {
        setCalculatedWidth(null);
        nodeRef.current.style.width = initialWidth;
      }
    },
  }));

  // add event listeners to the window on mount
  useLayoutEffect(() => {
    window.addEventListener("resize", render);
    return () => {
      window.removeEventListener("resize", render);
    };
  }, []);

  useLayoutEffect(() => {
    if (nodeRef.current) {
      let { height, width } = nodeRef.current?.getBoundingClientRect?.() ?? {};
      setCalculatedHeight(height);
      setCalculatedWidth(width);
      setInitialHeight(nodeRef.current?.style.height);
      setInitialWidth(nodeRef.current?.style.width);
    }
  }, [nodeRef.current]);

  useLayoutEffect(() => {
    onResizeEffect && onResizeEffect(nodePosition);
  }, [calculatedHeight, calculatedWidth]);

  // control and update the size of the node on each render
  const height = enableVertical ? calculatedHeight ?? nodeRef?.current?.style?.height ?? undefined : undefined;
  const width = enableHorizontal ? calculatedWidth ?? nodeRef?.current?.style?.width ?? undefined : undefined;
  if (nodeRef?.current) {
    if (!disableHeightControl && !!height) {
      nodeRef.current.style.height = height + "px";
      if (props.enableRelativeOffset) nodeRef.current.style.top = calculatedTop + "px";
    }
    if (!disableWidthControl && !!width) {
      nodeRef.current.style.width = width + "px";
      if (props.enableRelativeOffset) nodeRef.current.style.left = calculatedLeft + "px";
    }
  }
  // "border-box" sizing is required for correct positioning of handles
  useEffect(() => {
    if (nodeRef?.current) nodeRef.current.style.boxSizing = "border-box";
  }, [nodeRef.current]);

  // another render is required when adding or removing a handle
  useEffect(() => {
    render();
  }, [props.enabledHandles, disableHeightControl, disableWidthControl]);

  // remove unnecessary handles
  if (disableHeightControl) enabledHandles = omitItems(enabledHandles, ["top", "bottom"]);
  if (disableWidthControl) enabledHandles = omitItems(enabledHandles, ["left", "right"]);
  const controlDisabled = disableHeightControl && disableWidthControl;
  if (controlDisabled) enabledHandles = [];

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
        !controlDisabled &&
        ReactDOM.createPortal(
          <div style={{ position: "absolute" }} ref={handlerParentRef} key={"ResizableHandlerParent"}>
            {/*handles*/}
            {nodePosition &&
              enabledHandles.map((handlerName) => {
                // console.log(handlerName);
                return (
                  <Handle
                    key={handlerName}
                    {...{
                      nodeRef,
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
                      calculatedLeft,
                      calculatedTop,
                      HandleStyleFn: defaultHandlersFn[handlerName],
                      handlesParentPosition,
                      handleOptions: finalHandlesOptions[handlerName] as handleOptionsType,
                      handlesOptions: finalHandlesOptions,
                      handleStyle: finalHandlesStyle[handlerName] as React.CSSProperties,
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
  enabledHandles: Object.keys(defaultHandlersFn) as handleNameType[],
};

// export default DelayedResizable;
export default Resizable;

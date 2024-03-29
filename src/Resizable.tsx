import React, { useEffect, useImperativeHandle, useLayoutEffect, useMemo, useRef, useState } from "react";
import usePassRef from "shared/hooks/usePassRef";
import useRerender from "shared/hooks/useRerender";
import { cloneDeepNoFunction, mergeRecursive } from "shared/utils";
import { CreateEventHandle, Handle, HandleOptions, HandlesOptions } from "./Handle";
import usePosition, { positionType } from "shared/hooks/usePosition";
import ReactDOM from "react-dom";
import { defaultHandlesFn, HandleNameType, PossibleHandle } from "./HandleFns";
import { omitItems } from "./utils";
import type { RespectDefaultProps, Expand, ExpandRecursively } from "shared/types";
import { useOneTimeWarn } from "shared/hooks/useOneTimeWarn";
import { PossiblySpecific } from "shared/utils/props";

export type SpecifyAxis<T> = { horizontal?: T; vertical?: T };
export type PossiblySpecifyAxis<T> = T | SpecifyAxis<T>;

type OnResizeEvent = (newPos: { height: number; width: number }, prevPos: Exclude<positionType, null>) => void;
type OnResizeUpdate<T> = (newPos: T, prevPos: Exclude<positionType, null>) => void;

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
  // grid?: number | { horizontal: number; vertical: number };
  // todo:fix
  grid?: PossiblySpecifyAxis<number>;

  /** multiple scale diff by this number
   * examples:
   *  - `resizeRatio={2}` - double the resizing ratio
   *  - `resizeRatio={{horizontal:2}}` - double the resizing ratio only horizontally
   * */
  resizeRatio?: PossiblySpecifyAxis<number>;

  /** the height/width target DOM node won't be controlled
   * when set to false, initial height/width is restored
   *
   * examples:
   *  - `disableControl={true}` - will disable the control on height/width of the target DOM node
   *  - `disableControl={{horizontal: true}}` -  will disable the control on height of the target DOM node
   * */
  disableControl?: PossiblySpecifyAxis<boolean>;

  /** controlled height.
   * Note! the height won't be controlled by Resizable anymore, but by prop given from parent component
   *
   * example:
   * - `height={100}` - will set the height of the target DOM node to 100px
   * - `height={"100px"}` - will set the height of the target DOM node to 100px
   * - `height={"50%"}` - will set the height of the target DOM node to 50% of the parent node
   * - `height={30vh}` - will set the height of the target DOM node to 30% percent of the viewport height
   * */
  height?: number | string;
  /** controlled width.
   * Note! the width won't be controlled by Resizable anymore, but by prop given from parent component */
  width?: number | string;

  // todo
  //  handleProps
  //  handleComponent
  //  handlesProps
  //  handlesComponent

  onResizeEnd?: (prevPos: Exclude<positionType, null>) => void;
  onResizeStart?: (prevPos: Exclude<positionType, null>) => void;
  onResize?: OnResizeEvent | { horizontal?: OnResizeUpdate<{ width: number }>; vertical?: OnResizeUpdate<{ height: number }> };
  // todo: enable events on specially horizontally or vertically
  // onResizeEnd?: PossiblySpecifyAxis<(dims: positionType) => void>;
  // onResizeStart?: PossiblySpecifyAxis<(dims: positionType) => void>;
  // onResize?: PossiblySpecifyAxis<(dims: positionType) => void>;

  /** a callback that is called after resize ended and the DOM element is updated */
  onResizeEffect?: ((pos: positionType) => void) | null;

  /** an imperative ref to Resizable component. ca be used to imperatively trigger actions like height and width control reset */
  ResizableRef?: React.RefObject<ResizableRefHandle>;

  /** will offset the element using style.left and style.top to make the resize feel more natural
   * affects left and top handles
   * Note: style.position must not be 'static' in order left and top take effect */
  enableRelativeOffset?: boolean;

  // createEventHandlers?: PossiblySpecific<CreateEventHandle, "start" | "move" | "end">;

  handle?: HandleType;

  /** An array handles to enable */
  enabledHandles?: HandleNameType[];
  /** options that will be passed to all handles */
  handleOptions?: Partial<HandleOptions>;
  /** options that will be passed to specific handles. overrides handleOptions */
  handlesOptions?: PossibleHandle<Partial<HandleOptions>>;

  /** style that will be passed to all handles */
  handleStyle?: React.CSSProperties;
  /** style that will be passed to specific handles. overrides handleStyle */
  handlesStyle?: { [key in HandleNameType]?: React.CSSProperties };
}

type Handle = { size: number; style?: React.CSSProperties; props?: any; render: any; createEventHandlers?: any };
// type HandleType = Spread<{ specific: { [key in HandleNameType]?: Handle } }, Handle>;
type HandleType = Expand<Handle & { specific: { [key in HandleNameType]?: Handle } }>;

export interface ResizableRefHandle {
  /** function that resets the height/width of the target DOM node to initial state*/
  restControl: (resetHeight?: boolean, resetWidth?: boolean) => void;
  /** react ref to the target DOM node */
  nodeRef: React.RefObject<HTMLElement>;
  /** current position of the target DOM node */
  nodePosition: positionType;
  /** react ref to the handles parent DOM node */
  handleParentRef: React.RefObject<HTMLDivElement>;
  /** current position of the handles parent DOM node */
  handlesParentPosition: positionType;
  /** when called re-renders Resizable */
  render: () => void;
}

// ResizableProps type after merge with default props
export type ResizablePropsDP = RespectDefaultProps<ResizableProps, typeof ResizableDefaultProps>;
const Resizable = React.forwardRef<HTMLElement, ResizableProps>(function ResizableForward(_props: ResizableProps, forwardedRef) {
  // console.log("Resizable");
  const props = _props as ResizablePropsDP;
  let { children, onResizeEffect, enabledHandles, handleOptions, handlesOptions, disableControl, handleStyle, handlesStyle } = props;

  const render = useRerender();

  // if the children passed a ref - copy its value instead of creating a new one
  let nodeRef = usePassRef<HTMLElement>(children);
  if (props?.nodeRef) {
    // if ref for the target DOM node is explicitly passed, use it instead extracting it from the children
    nodeRef.current = props.nodeRef.current;
  }

  // if Resizable would be wrapped with other components - the node ref would be passed to the wrapper
  if (forwardedRef && typeof forwardedRef == "object" && nodeRef) forwardedRef.current = nodeRef.current;

  const nodePosition = usePosition(nodeRef.current);

  const handleParentRef = useRef<HTMLDivElement>(null);
  const handlesParentPosition = usePosition(handleParentRef.current);

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
  if (!import.meta.env.NODE_ENV || import.meta.env.NODE_ENV !== "production") checkProps(props, nodeRef);

  const finalHandlesOptions = useFinalHandlesOptions(enabledHandles, handleOptions, handlesOptions);

  let finalHandlesStyle = {} as { [key in HandleNameType]?: React.CSSProperties };
  for (const handle of enabledHandles) {
    finalHandlesStyle[handle] = mergeRecursive(cloneDeepNoFunction(handleStyle), handlesStyle?.[handle] ?? {});
  }

  const disableWidthControl = typeof disableControl === "boolean" ? disableControl : disableControl?.horizontal;
  const disableHeightControl = typeof disableControl === "boolean" ? disableControl : disableControl?.vertical;
  const enableHorizontal =
    !disableWidthControl && !!enabledHandles.find((h) => h.toLowerCase().includes("left") || h.toLowerCase().includes("right"));
  const enableVertical =
    !disableHeightControl && !!enabledHandles.find((h) => h.toLowerCase().includes("top") || h.toLowerCase().includes("bottom"));

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
  useImperativeHandle<ResizableRefHandle, ResizableRefHandle>(props.ResizableRef, () => ({
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
    nodeRef,
    nodePosition,
    handleParentRef,
    handlesParentPosition,
    render,
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
      setInitialHeight(nodeRef.current.style.height);
      setInitialWidth(nodeRef.current.style.width);
    }
  }, [nodeRef.current]);

  useLayoutEffect(() => {
    onResizeEffect && onResizeEffect(nodePosition);
  }, [calculatedHeight, calculatedWidth]);

  // control and update the size of the node on each render
  const height = enableVertical ? calculatedHeight ?? nodeRef?.current?.style?.height ?? undefined : undefined;
  const width = enableHorizontal ? calculatedWidth ?? nodeRef?.current?.style?.width ?? undefined : undefined;
  if (nodeRef?.current) {
    if (props.height) nodeRef.current.style.height = typeof props.height === "number" ? `${props.height}px` : props.height;
    else if (!disableHeightControl && !!height) {
      nodeRef.current.style.height = height + "px";
      if (props.enableRelativeOffset) nodeRef.current.style.top = calculatedTop + "px";
    }
    if (props.width) nodeRef.current.style.width = typeof props.width === "number" ? `${props.width}px` : props.width;
    else if (!disableWidthControl && !!width) {
      nodeRef.current.style.width = width + "px";
      if (props.enableRelativeOffset) nodeRef.current.style.left = calculatedLeft + "px";
    }
  }
  // "border-box" sizing is required for correct positioning of handles
  useEffect(() => {
    if (nodeRef?.current) {
      nodeRef.current.style.boxSizing = "border-box";
      nodeRef.current.style.touchAction = "none";
      // if (props.enableRelativeOffset) {
      //   nodeRef.current.style.position = "absolute";
      // }
    }
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
            ...(!props.nodeRef ? { ref: nodeRef } : {}),
            ...(!props.nodeRef ? { ref: nodeRef } : {}),
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
          <div style={{ position: "absolute" }} ref={handleParentRef} key={"ResizableHandleParent"}>
            {/*handles*/}
            {nodePosition &&
              enabledHandles.map((handleName) => {
                // console.log(handleName);
                return (
                  <Handle
                    key={handleName}
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
                      HandleStyleFn: defaultHandlesFn[handleName],
                      handlesParentPosition,
                      handleOptions: finalHandlesOptions[handleName] as HandleOptions,
                      handlesOptions: finalHandlesOptions,
                      handleStyle: finalHandlesStyle[handleName] as React.CSSProperties,
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
export const ResizableDefaultProps = {
  enabledHandles: Object.keys(defaultHandlesFn) as HandleNameType[],
  handleOptions: {},
  handlesOptions: {},
  disableControl: false,
  handleStyle: {},
  handlesStyle: {},
  resizeRatio: 1,
};
Resizable.defaultProps = ResizableDefaultProps;

// extracted to a separate function in order to be memoized
const getFinalHandlesOptions = (
  enabledHandles: ResizablePropsDP["enabledHandles"],
  mergedHandlesOptions: { [key in HandleNameType]: Partial<HandleOptions> },
  mergedHandleOptions: ResizablePropsDP["handleOptions"]
) => {
  let finalHandlesOptions = {} as HandlesOptions;

  // fill up empty handles sizes
  for (const handle of enabledHandles) {
    if (handle in mergedHandlesOptions) {
      finalHandlesOptions[handle] = mergeRecursive(cloneDeepNoFunction(mergedHandleOptions), mergedHandlesOptions[handle]);
    }
  }
  return finalHandlesOptions;
};

// a hook to get a memorized final handles style
const useFinalHandlesOptions = (
  enabledHandles: ResizablePropsDP["enabledHandles"],
  handleOptions: ResizablePropsDP["handleOptions"],
  handlesOptions: ResizablePropsDP["handlesOptions"]
) => {
  let mergedHandlesOptions = useMemo(() => {
    // console.log("recalculates handles options");
    return mergeRecursive(cloneDeepNoFunction(defaultHandlesOptions), handlesOptions);
  }, [handlesOptions]);
  let mergedHandleOptions = useMemo(() => mergeRecursive(cloneDeepNoFunction(defaultHandleOptions), handleOptions), [handleOptions]);
  return useMemo(
    () => getFinalHandlesOptions(enabledHandles, mergedHandlesOptions, mergedHandleOptions),
    [enabledHandles, handlesOptions, handleOptions]
  );
};

const checkProps = (props: ResizableProps, nodeRef: React.RefObject<HTMLElement>) => {
  const warn = useOneTimeWarn("Resizable: ");
  if (props.children) {
    React.Children.only(props.children);
    if (typeof props.children == "string" || typeof props.children == "number" || typeof props.children == "boolean")
      warn(
        `Resizable: element '${props.children}' is not valid child for Resizable, wrap it simple element like div element\nFor example - <div>${children}</div>`
      );

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
  }
  if (!props.nodeRef && !props.children) warn("at least one property: 'nodeRef' or 'children' should be passed to Resizable");
  if (nodeRef.current) {
    const node = nodeRef.current;
    if ((props.enableRelativeOffset && !node.style.position) || node.style.position == "static") {
      warn(
        `enableRelativeOffset is set to true, so style.position should be set to value other than 'static',currently it is '${node.style.position}'`
      );
    }
  }
};

const defaultHandleOptions: Partial<HandleOptions> = {
  size: 10,
};

const defaultHandlesOptions: { [key in HandleNameType]: Partial<HandleOptions> } = {
  top: { allowResize: { vertical: { reverseDrag: true } } },
  left: { allowResize: { horizontal: { reverseDrag: true } } },
  bottom: { allowResize: { vertical: { reverseDrag: false } } },
  right: { allowResize: { horizontal: { reverseDrag: false } } },
  bottomRight: { allowResize: { horizontal: { reverseDrag: false }, vertical: { reverseDrag: false } } },
  bottomLeft: { allowResize: { horizontal: { reverseDrag: true }, vertical: { reverseDrag: false } } },
  topRight: { allowResize: { horizontal: { reverseDrag: false }, vertical: { reverseDrag: true } } },
  topLeft: { allowResize: { horizontal: { reverseDrag: true }, vertical: { reverseDrag: true } } },
} as const;

// export default DelayedResizable;
export default Resizable;

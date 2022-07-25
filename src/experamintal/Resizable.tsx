import React, { useImperativeHandle, useLayoutEffect, useRef } from "react";
import { cloneDeepNoFunction, mergeRecursive } from "shared/utils";
import { HandleOld, HandleOptions } from "./HandleOld";
import usePosition, { positionType } from "shared/hooks/usePosition";
import { defaultHandlesFn, PossibleHandle } from "../HandleFns";
import { omitItems } from "../utils";
import type { Expand, RespectDefaultProps } from "shared/types";
import ResizableBaseForward, { ResizableBaseContextProps, useResizableBase } from "./ResizableBase";
import { PossiblySpecific } from "shared/utils/props";
import HandlesParentForward, { HandlesParentRefHandle } from "./HandlesParent";
import { HandleBaseProps } from "./HandleBase";
import Handle, { HandleProps } from "./Handle";
import ResizableElement, { ResizableElementProps } from "./ResizableElement";
import { pick } from "shared/utils";
// export type SpecifyAxis<T> = { horizontal?: T; vertical?: T };
// export type PossiblySpecifyAxis<T> = T | SpecifyAxis<T>;
export type PossiblySpecifyAxis<T> = PossiblySpecific<T, "horizontal" | "vertical">;

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
  enabledHandles?: HandleNamePropType[];
  /** options that will be passed to all handles */
  handleOptions?: Partial<HandleOptions>;
  /** options that will be passed to specific handles. overrides handleOptions */
  handlesOptions?: PossibleHandle<Partial<HandleOptions>>;

  /** style that will be passed to all handles */
  handleStyle?: React.CSSProperties;
  /** style that will be passed to specific handles. overrides handleStyle */
  handlesStyle?: { [key in HandleNameType]?: React.CSSProperties };
}

// type HandleProps = { size: number; style?: React.CSSProperties; props?: any; render: any; createEventHandlers?: any };
// // type HandleType = Spread<{ specific: { [key in HandleNameType]?: Handle } }, Handle>;
// type HandleType = Expand<HandleOld & { specific: { [key in HandleNameType]?: HandleOld } }>;
//

// // ResizableProps type after merge with default props
// export type ResizablePropsDP = RespectDefaultProps<ResizableProps, typeof ResizableDefaultProps>;
// const ResizableBaseOldForward = React.forwardRef<HTMLElement, ResizableProps>(function ResizableBase(
//   _props: ResizableProps,
//   forwardedRef
// ) {
//   // console.log("ResizableExpr");
//   const props = _props as ResizablePropsDP;
//   let {
//     children,
//     onResizeEffect,
//     enabledHandles,
//     handleOptions,
//     handlesOptions,
//     disableControl,
//     handleStyle,
//     handlesStyle,
//   } = props;
//
//   const ResizableState = useResizableBase();
//   const {
//     contextAppear,
//     initialHeight,
//     initialWidth,
//     calculatedHeight,
//     calculatedWidth,
//     calculatedLeft,
//     calculatedTop,
//     endDraggingOffsetTop,
//     endDraggingOffsetLeft,
//     setInitialHeight,
//     setInitialWidth,
//     setCalculatedHeight,
//     setCalculatedWidth,
//     setCalculatedLeft,
//     setCalculatedTop,
//     setEndDraggingOffsetTop,
//     setEndDraggingOffsetLeft,
//     nodePosition,
//     nodeRef,
//     render,
//   } = ResizableState;
//
//   // if Resizable would be wrapped with other components - the node ref would be passed to the wrapper
//   if (forwardedRef && typeof forwardedRef == "object" && nodeRef) forwardedRef.current = nodeRef.current;
//
//   const handleParentRef = useRef<HTMLDivElement>(null);
//   const handlesParentPosition = usePosition(handleParentRef.current);
//
//   // console.log(calculatedTop, calculatedHeight);
//
//   // strip away checks in production build
//   if (!process.env.NODE_ENV || process.env.NODE_ENV !== "production") checkProps(props, ResizableState, nodeRef);
//
//   const finalHandlesOptions = useFinalHandlesOptions(enabledHandles, handleOptions, handlesOptions);
//
//   let finalHandlesStyle = {} as { [key in HandleNameType]?: React.CSSProperties };
//   for (const handle of enabledHandles) {
//     finalHandlesStyle[handle] = mergeRecursive(cloneDeepNoFunction(handleStyle), handlesStyle?.[handle] ?? {});
//   }
//
//   const disableWidthControl = typeof disableControl === "boolean" ? disableControl : disableControl?.horizontal;
//   const disableHeightControl = typeof disableControl === "boolean" ? disableControl : disableControl?.vertical;
//   const enableHorizontal =
//     !disableWidthControl &&
//     !!enabledHandles.find((h) => h.toLowerCase().includes("left") || h.toLowerCase().includes("right"));
//   const enableVertical =
//     !disableHeightControl &&
//     !!enabledHandles.find((h) => h.toLowerCase().includes("top") || h.toLowerCase().includes("bottom"));
//
//   // when disabling the control, the width/height should be reset to initial value
//   useLayoutEffect(() => {
//     if (nodeRef.current && !enableVertical) setCalculatedHeight(null);
//     // after first render
//     if (nodeRef.current && calculatedHeight) nodeRef.current.style.height = initialHeight;
//   }, [enableVertical]);
//   useLayoutEffect(() => {
//     if (nodeRef.current && !enableHorizontal) setCalculatedWidth(null);
//     // after first render
//     if (nodeRef.current && calculatedWidth) nodeRef.current.style.width = initialWidth;
//   }, [enableHorizontal]);
//
//   // allow imperative reset of height/width
//   useImperativeHandle<ResizableRefHandle, ResizableRefHandle>(props.ResizableRef, () => ({
//     restControl: ({ resetHeight = true, resetWidth = true, callback } = {}) => {
//       if (nodeRef.current && resetHeight) {
//         setCalculatedHeight(null);
//         nodeRef.current.style.height = initialHeight;
//       }
//       if (nodeRef.current && resetWidth) {
//         setCalculatedWidth(null);
//         nodeRef.current.style.width = initialWidth;
//       }
//       callback?.(initialHeight, initialWidth);
//     },
//     nodeRef,
//     nodePosition,
//     handleParentRef,
//     handlesParentPosition,
//     render,
//   }));
//
//   // useLayoutEffect(() => {
//   //   if (nodeRef.current) {
//   //     let { height, width } = nodeRef.current?.getBoundingClientRect?.() ?? {};
//   //     setCalculatedHeight(height);
//   //     setCalculatedWidth(width);
//   //     setInitialHeight(nodeRef.current.style.height);
//   //     setInitialWidth(nodeRef.current.style.width);
//   //   }
//   // }, [nodeRef.current]);
//
//   useLayoutEffect(() => {
//     onResizeEffect && onResizeEffect(nodePosition);
//   }, [calculatedHeight, calculatedWidth]);
//
//   // remove unnecessary handles
//   if (disableHeightControl) enabledHandles = omitItems(enabledHandles, ["top", "bottom"]);
//   if (disableWidthControl) enabledHandles = omitItems(enabledHandles, ["left", "right"]);
//   const controlDisabled = disableHeightControl && disableWidthControl;
//   if (controlDisabled) enabledHandles = [];
//
//   return (
//     <>
//       {/* children element with injected styles*/}
//       {children &&
//         React.cloneElement(
//           children,
//           // inject required styles such border-box, and height/width if enabled
//           {
//             // inject ref to the element in not present from parent
//             ...(!props.nodeRef ? { ref: nodeRef } : {}),
//             key: "ResizableNode", // required after transpile
//             //// todo: should we pass the styles to the child? or should we manipulate styles at the DOM directly?
//             // style: {
//             //   // boxSizing: "border-box",
//             //   height: height,
//             //   width: width,
//             //   ...omit(children?.props?.style, ["height", "width"]),
//             // },
//             // //pass rest of props to children
//             // ...omit(children?.props, ["style", "ref"]),
//           },
//           children?.props.children
//         )}
//       {/*/!* handles *!/*/}
//       {/*{nodeRef.current &&*/}
//       {/*  !controlDisabled &&*/}
//       {/*  ReactDOM.createPortal(*/}
//       {/*    <div style={{ position: "absolute" }} ref={handleParentRef} key={"ResizableHandleParent"}>*/}
//       {/*      /!*handles*!/*/}
//       {/*      {nodePosition &&*/}
//       {/*        enabledHandles.map((handleName) => {*/}
//       {/*          // console.log(handleName);*/}
//       {/*          return (*/}
//       {/*            <Handle*/}
//       {/*              key={handleName}*/}
//       {/*              {...{*/}
//       {/*                nodeRef,*/}
//       {/*                nodePosition,*/}
//       {/*                HandleStyleFn: defaultHandlesFn[handleName],*/}
//       {/*                handlesParentPosition,*/}
//       {/*                handleOptions: finalHandlesOptions[handleName] as HandleOptions,*/}
//       {/*                handlesOptions: finalHandlesOptions,*/}
//       {/*                handleStyle: finalHandlesStyle[handleName] as React.CSSProperties,*/}
//       {/*              }}*/}
//       {/*              ResizableProps={props}*/}
//       {/*            />*/}
//       {/*          );*/}
//       {/*        })}*/}
//       {/*    </div>,*/}
//       {/*    nodeRef.current*/}
//       {/*  )}*/}
//     </>
//   );
// });
// export const ResizableDefaultProps = {
//   enabledHandles: Object.keys(defaultHandlesFn) as HandleNameType[],
//   handleOptions: {},
//   handlesOptions: {},
//   disableControl: false,
//   handleStyle: {},
//   handlesStyle: {},
//   resizeRatio: 1,
// };
// ResizableBaseOldForward.defaultProps = ResizableDefaultProps;

interface NewResizableProps extends ResizableElementProps {
  children?: React.ReactElement;
  nodeRef?: React.RefObject<HTMLElement>;
  // handleStyle?: React.CSSProperties;
  // handleProps?: HandleBaseProps;
  imperativeRef?: React.RefObject<ResizableRefHandle>;

  enabledHandles?: HandleNameType[];
  HandlesProps?: HandleProps;
  HandleProps?: { [key in HandleNameType]?: HandleProps };
  extraHandles?: React.ReactNode;

  // ResizableElementProps?: ResizableElementProps
  // grid?: PossiblySpecifyAxis<number>;
  // resizeRatio?: PossiblySpecifyAxis<number>;
  // disableControl?: PossiblySpecifyAxis<boolean>;
  // height?: number | string;
  // width?: number | string;
  // onResizeEnd?: (prevPos: Exclude<positionType, null>) => void;
  // onResizeStart?: (prevPos: Exclude<positionType, null>) => void;
  // onResize?: OnResizeEvent | { horizontal?: OnResizeUpdate<{ width: number }>; vertical?: OnResizeUpdate<{ height: number }> };
  // onResizeEffect?: ((pos: positionType) => void) | null;
  // ResizableRef?: React.RefObject<ResizableRefHandle>;
  // enableRelativeOffset?: boolean;
}

const ResizableForward = React.forwardRef<HTMLElement, NewResizableProps>(function Resizable(_props: ResizableProps, forwardedRef) {
  const { children, ...props } = _props as NewResizableProps;

  // allow imperative actions
  const HandlesParentRef = useRef<HandlesParentRefHandle>(null);
  const ResizableBaseRef = useRef<ResizableBaseContextProps>(null);

  const rs = ResizableBaseRef.current;
  useImperativeHandle<ResizableRefHandle, ResizableRefHandle>(props.imperativeRef, () => ({
    restControl: ({ resetHeight = true, resetWidth = true, callback } = {}) => {
      if (!rs) return;
      if (rs.nodeRef.current && resetHeight) {
        rs.setCalculatedHeight(null);
        rs.nodeRef.current.style.height = rs.initialHeight;
      }
      if (rs.nodeRef.current && resetWidth) {
        rs.setCalculatedWidth(null);
        rs.nodeRef.current.style.width = rs.initialWidth;
      }
      callback?.(rs.initialHeight, rs.initialWidth);
    },
    ResizableRef: ResizableBaseRef,
    HandlesParentRef: HandlesParentRef,
    render: rs?.render ?? null,
  }));

  const ResizableElemProps: ResizableElementProps = pick(props, ["nodeRef", "disableControl", "height", "width", "enableRelativeOffset"]);
  const finalHandleProps = props.enabledHandles?.reduce(
    (acc, handleName) => ({
      ...acc,
      [handleName]: { ...props.HandlesProps, ...(props.HandleProps ?? {})[handleName] },
    }),
    {}
  ) as { [key in NonNullable<typeof props.enabledHandles>[number]]: React.ReactElement };

  return (
    (children && (
      <ResizableBaseForward imperativeRef={ResizableBaseRef}>
        <ResizableElement {...ResizableElemProps}>{children}</ResizableElement>
        <HandlesParentForward ref={HandlesParentRef}>
          {props.enabledHandles?.map((handleName) => {
            const Comp = defaultHandlesMap[handleName];
            return <Comp {...finalHandleProps[handleName]} key={handleName} />;
          })}

          {/*/!* sides *!/*/}
          {/*{eh?.includes("top") && <TopHandle style={props.handleStyle} />}*/}
          {/*{eh?.includes("right") && <RightHandle style={props.handleStyle} />}*/}
          {/*{eh?.includes("bottom") && <BottomHandle style={props.handleStyle} />}*/}
          {/*{eh?.includes("left") && <LeftHandle style={props.handleStyle} />}*/}
          {/*/!* corners *!/*/}
          {/*{eh?.includes("topLeft") && <TopLeftHandle style={props.handleStyle} />}*/}
          {/*{eh?.includes("topRight") && <TopRightHandle style={props.handleStyle} />}*/}
          {/*{eh?.includes("bottomLeft") && <BottomLeftHandle style={props.handleStyle} />}*/}
          {/*{eh?.includes("bottomRight") && <BottomRightHandle style={props.handleStyle} />}*/}

          {/* possibly extra handles */}
          {props.extraHandles}
        </HandlesParentForward>
      </ResizableBaseForward>
    )) ||
    null
  );
});

// const defaultHandlesNames = ["top", "right", "bottom", "left", "topLeft", "topRight", "bottomLeft", "bottomRight"] as const;
// type HandleNameSynonyms = "horizontal" | "vertical" | "corners" | "sides";
type HandleNameType = keyof typeof defaultHandlesMap;
// type HandleNamePropType = HandleNameType | HandleNameSynonyms;

// const handlesSynonymsOpposite = {
//   right: ["horizontal", "sides"],
//   left: ["horizontal", "sides"],
//   bottom: ["vertical", "sides"],
//   top: ["vertical", "sides"],
//   topLeft: ["corners"],
//   topRight: ["corners"],
//   bottomLeft: ["corners"],
//   bottomRight: ["corners"]
// } as const;

export interface ResizableRefHandle {
  /** function that resets the height/width of the target DOM node to initial state*/
  restControl: (options?: { resetHeight?: boolean; resetWidth?: boolean; callback?: (initialHeight, initialWidth) => void }) => void;

  ResizableRef: React.RefObject<ResizableBaseContextProps>;
  HandlesParentRef: React.RefObject<HandlesParentRefHandle>;
  /** when called re-renders Resizable */
  render: (() => void) | null;
}

const TopHandle: React.FC<HandleProps> = (props) => {
  return (
    <Handle
      allowResize={{ vertical: { reverseDrag: true } }}
      handleWidth={"100%"}
      handleCursor={"n-resize"}
      transform={"translateY(-50%)"}
      {...props}
    />
  );
};
const BottomHandle: React.FC<HandleProps> = (props) => {
  return (
    <Handle
      offset={{ left: "0%", top: "100%" }}
      allowResize={{ vertical: { reverseDrag: false } }}
      handleWidth={"100%"}
      handleCursor={"n-resize"}
      transform={"translateY(-50%)"}
      {...props}
    />
  );
};
const LeftHandle: React.FC<HandleProps> = (props) => {
  return (
    <Handle
      allowResize={{ horizontal: { reverseDrag: true } }}
      handleHeight={"100%"}
      handleCursor={"e-resize"}
      transform={"translateX(-50%)"}
      {...props}
    />
  );
};
const RightHandle: React.FC<HandleProps> = (props) => {
  return (
    <Handle
      offset={{ left: "100%", top: "0%" }}
      allowResize={{ horizontal: { reverseDrag: false } }}
      handleHeight={"100%"}
      handleCursor={"e-resize"}
      transform={"translateX(-50%)"}
      {...props}
    />
  );
};

const TopLeftHandle: React.FC<HandleProps> = (props) => {
  return (
    <Handle
      allowResize={{ horizontal: { reverseDrag: true }, vertical: { reverseDrag: true } }}
      handleCursor={"nwse-resize"}
      transform={"translate(-50%, -50%)"}
      {...props}
    />
  );
};
const TopRightHandle: React.FC<HandleProps> = (props) => {
  return (
    <Handle
      offset={{ left: "100%", top: "0%" }}
      allowResize={{ horizontal: true, vertical: { reverseDrag: true } }}
      handleCursor={"nesw-resize"}
      transform={"translate(-50%, -50%)"}
      {...props}
    />
  );
};
const BottomLeftHandle: React.FC<HandleProps> = (props) => {
  return (
    <Handle
      offset={{ left: "0%", top: "100%" }}
      allowResize={{ horizontal: { reverseDrag: true }, vertical: true }}
      handleCursor={"nesw-resize"}
      transform={"translate(-50%, -50%)"}
      {...props}
    />
  );
};
const BottomRightHandle: React.FC<HandleProps> = (props) => {
  return (
    <Handle
      offset={{ left: "100%", top: "100%" }}
      allowResize={{ horizontal: true, vertical: true }}
      handleCursor={"nwse-resize"}
      transform={"translate(-50%, -50%)"}
      {...props}
    />
  );
};

const defaultHandlesMap = {
  top: TopHandle,
  bottom: BottomHandle,
  left: LeftHandle,
  right: RightHandle,
  topLeft: TopLeftHandle,
  topRight: TopRightHandle,
  bottomLeft: BottomLeftHandle,
  bottomRight: BottomRightHandle,
} as const;

export const ResizableDefaultProps = {
  // enabledHandles: Object.keys(defaultHandlesFn) as HandleNameType[],
  handleOptions: {},
  handlesOptions: {},
  disableControl: false,
  handleStyle: {},
  handlesStyle: {},
  resizeRatio: 1,
  enabledHandles: Object.keys(defaultHandlesMap) as HandleNameType[],
} as const;
ResizableForward.defaultProps = ResizableDefaultProps;

export default ResizableForward;

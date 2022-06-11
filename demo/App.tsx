import React, { useRef, useState } from "react";
import ResizableProd, { handleNameType } from "react-true-resizable";
import ResizableDev, { ResizableHandle } from "../src/Resizable";
import useRerender from "shared/hooks/useRerender";
import { Box, Paper } from "@mui/material";
import "./App.css";
import Draggable from "react-draggable";

function App() {
  console.log("App rendered");
  const reredner = useRerender();

  const divRef = useRef<HTMLDivElement>(null);
  const forwardDivRef = useRef<HTMLDivElement>(null);
  // console.log("divRef", divRef.current);

  return (
    <div style={{ textAlign: "center" }}>
      <button onClick={() => reredner()}>rerender</button>

      <ResizableDev
        enableRelativeOffset
        // grid={20}
        // allHandlerOptions={{ style: { background: "red" } }}
      >
        <div
          style={{
            position: "relative",
            border: "2px solid black",
            height: 200,
            display: "flex",
            justifyContent: "center",
            alignItems: "center",

            // minHeight: 100,
          }}
        >
          enableRelativeOffset
        </div>
      </ResizableDev>

      {/*<GridResizable />*/}

      {/*/!* nested components that need to access the dom node*!/*/}

      {/*<Examples.WithDraggable />*/}
      {/*<Examples.NestedResizeable />*/}

      {/*<ResizableExample />*/}

      {/*<div style={{ border: "solid", margin: 16 }}>normal div</div>*/}

      {/*<Resizable handlerOptions={{ style: { background: "red" } }} strategy={"dom-tree"} nodeRef={forwardDivRef} />*/}
      {/*<MyDiv passRef={forwardDivRef} />*/}

      {/*function component */}
      {/*<Resizable handlerOptions={{ style: { background: "red" } }} grid={10}>*/}
      {/*  <MyDivForward>asd</MyDivForward>*/}
      {/*</Resizable>*/}

      {/* class component */}
      {/*<Resizable handlerOptions={{ style: { background: "red" } }}>*/}
      {/*  <MyClassDivForward>Class</MyClassDivForward>*/}
      {/*</Resizable>*/}

      {/*<Resizable handlerOptions={{ style: { background: "red" } }}>*/}
      {/*  <Box style={{ border: "solid", margin: 16 }}>asd</Box>*/}
      {/*</Resizable>*/}
    </div>
  );
}

const ResizableMuiBottomBar = () => {
  return (
    <ResizableProd handles={["top"]} allHandlerOptions={{ style: { background: "blue" } }}>
      <Paper
        sx={{
          height: 80,
          position: "fixed",
          bottom: 0,
          left: 0,
          right: 0,
          border: "1px solid black",
          p: 2,
          minHeight: 40,
        }}
      >
        <Box>Mui Resizable Bottom bar</Box>
      </Paper>
    </ResizableProd>
  );
};

const GridResizable = ({ reredner = () => {} }) => {
  const [allowHResize, setAllowHResize] = useState(false);
  const [allowVResize, setAllowVResize] = useState(false);
  const handles: handleNameType[] = [];
  if (allowHResize) handles.push("left", "right");
  if (allowVResize) handles.push("top", "bottom");

  const ResizableRef = useRef<ResizableHandle>(null);
  return (
    <div style={{ border: "solid" }}>
      allow horizontal resize
      <input type="checkbox" checked={allowHResize} onChange={() => setAllowHResize(!allowHResize)} />
      allow vertical resize
      <input type="checkbox" checked={allowVResize} onChange={() => setAllowVResize(!allowVResize)} />
      <button onClick={() => ResizableRef.current?.restControl()}>rest resizable</button>
      <ResizableProd
        ResizableRef={ResizableRef}
        grid={20}
        enabledHandles={handles}
        disableHeightControl={!allowVResize}
        disableWidthControl={!allowHResize}
        allHandlerOptions={{ style: { background: "blue" } }}
        onResizeEffect={reredner}
      >
        <Box className={"grid-resizable"} style={{ border: "2px solid black", height: 200 }}>
          resizable only vertically {allowHResize && "and horizontally"} with grid 20
        </Box>
      </ResizableProd>
    </div>
  );
};

export const ResizableExample = () => {
  const reredner = useRerender();

  return (
    <>
      {/*<button onClick={() => reredner()}>rerender</button>*/}

      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", position: "relative" }}>
        root Resizable
        <ResizableProd onResizeEffect={reredner} allHandlerOptions={{ style: { background: "red" } }}>
          <div style={{ border: "20px grey solid", overflow: "hidden" }}>
            <div style={{ height: 200, border: "dashed 1px", marginBottom: 16 }}>
              with relative size
              <ResizableProd
                allHandlerOptions={{ style: { background: "red" } }}
                handlersOptions={{ left: { size: 24 }, top: { size: 4 } }}
              >
                <div style={{ border: "solid", height: "50%" }}>
                  my initial size is 50% of parent
                  <br />
                  I'm resizable both horizontally and vertically
                  <br />
                  <br />
                  my handles have different sizes
                </div>
              </ResizableProd>
            </div>
            <GridResizable reredner={reredner} />
            <div style={{ border: "dashed 1px" }}>
              display: flex; justify-content: center;
              <div style={{ display: "flex", justifyContent: "center" }}>
                <ResizableProd allHandlerOptions={{ style: {} }} grid={10} onResizeEffect={reredner}>
                  <Box sx={{ border: "2px solid black", p: 1, height: 100 }}>Box1</Box>
                </ResizableProd>
                <ResizableProd allHandlerOptions={{ style: {} }} grid={10} onResizeEffect={reredner}>
                  <Box sx={{ border: "2px solid black", p: 1, height: 100 }}>Box2</Box>
                </ResizableProd>
              </div>
            </div>
          </div>
        </ResizableProd>
      </div>
      <ResizableProd>
        <div style={{ border: "solid", margin: 16 }}>ResizableProd</div>
      </ResizableProd>
      <ResizableDev>
        <div style={{ border: "solid", margin: 16 }}>ResizableDev</div>
      </ResizableDev>
      <ResizableMuiBottomBar />
    </>
  );
};

const MyDivForward = React.forwardRef<any, any>(function ({ children, style, ...props }, ref) {
  // console.log("MyDivForward", style);
  return (
    <div style={{ border: "solid", margin: 16 }} ref={ref}>
      {children}
    </div>
  );
});

const MyDiv = (props) => {
  console.log("MyDiv", props);
  return (
    <div style={{ border: "solid", margin: 16 }} ref={props.passRef}>
      Resizable
    </div>
  );
};

class MyClassDiv extends React.Component<any, any> {
  render() {
    const { style, children, innerRef, ...props } = this.props;
    return (
      <div style={{ border: "solid", margin: 16, ...style }} ref={innerRef} {...props}>
        {this.props.children}
      </div>
    );
  }
}

const MyClassDivForward = React.forwardRef<any, any>((props, ref) => <MyClassDiv innerRef={ref} {...props} />);

const Div3 = React.forwardRef<any, any>((props, ref) => (
  <div ref={ref} style={{ border: "solid" }}>
    asd
  </div>
));

const Examples = {
  WithDraggable: () => {
    const divRef = useRef<HTMLDivElement>(null);
    return (
      <>
        <ResizableDev nodeRef={divRef} enabledHandles={["right", "bottom", "bottomRight"]} />
        <Draggable nodeRef={divRef}>
          <div style={{ border: "2px solid black", height: 50 }} ref={divRef}>
            resizable with draggable
          </div>
        </Draggable>
      </>
    );
  },
  NestedResizeable: () => {
    const divRef = useRef<HTMLDivElement>(null);
    return (
      <>
        <ResizableDev nodeRef={divRef} />
        {/*<ResizableDev>*/}
        <ResizableDev disableHeightControl disableWidthControl>
          <div style={{ border: "2px solid black", height: 50 }} ref={divRef}>
            test
          </div>
        </ResizableDev>
        {/*</ResizableDev>*/}
      </>
    );
  },
};

export default App;

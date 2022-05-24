import React, { useRef, useState } from "react";
import Resizable from "react-true-resizable";
import useRerender from "shared/hooks/useRerender";
import { Box, Paper } from "@mui/material";

const ResizableMuiBottomBar = () => {
  return (
    <Resizable handlers={["top"]} allHandlerOptions={{ style: { background: "blue" } }} minHeight={40}>
      <Paper sx={{ height: 60, position: "absolute", bottom: 0, left: 0, right: 0, border: "1px solid black", p: 2 }}>
        <Box>Mui Resizable Bottom bar</Box>
      </Paper>
    </Resizable>
  );
};

const ResizableExample = () => {
  const reredner = useRerender();

  return (
    <>
      {/*<button onClick={() => reredner()}>rerender</button>*/}

      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", position: "relative" }}>
        root Resizable
        <Resizable onResize={reredner} allHandlerOptions={{ style: { background: "red" } }}>
          <div style={{ border: "20px grey solid", overflow: "hidden" }}>
            <div style={{ height: 200, border: "dashed 1px", marginBottom: 16 }}>
              with relative size
              <Resizable
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
              </Resizable>
            </div>
            <Resizable
              grid={20}
              handlers={["top", "bottom"]}
              allHandlerOptions={{ style: { background: "blue" } }}
              onResize={reredner}
            >
              <Box style={{ border: "2px solid black", padding: 8, margin: 16 }}>
                resizable only vertically with grid 20
              </Box>
            </Resizable>

            <div style={{ border: "dashed 1px" }}>
              display: flex; justify-content: center;
              <div style={{ display: "flex", justifyContent: "center" }}>
                <Resizable allHandlerOptions={{ style: {} }} grid={10} minHeight={80}>
                  <Box sx={{ border: "2px solid black", p: 1, height: 100 }}>Box1</Box>
                </Resizable>
                <Resizable allHandlerOptions={{ style: {} }} grid={10} minHeight={80}>
                  <Box sx={{ border: "2px solid black", p: 1, height: 100 }}>Box2</Box>
                </Resizable>
              </div>
            </div>
          </div>
        </Resizable>
      </div>
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

function App() {
  console.log("App rendered");
  const reredner = useRerender();

  const divRef = useRef<HTMLDivElement>(null);
  const forwardDivRef = useRef<HTMLDivElement>(null);
  // console.log("divRef", divRef.current);

  return (
    <div style={{ textAlign: "center" }}>
      <button onClick={() => reredner()}>rerender</button>

      <ResizableExample />

      {/*<Resizable>*/}
      {/*  <div style={{ border: "solid", margin: 16 }}>Simple resizable div</div>*/}
      {/*</Resizable>*/}

      <div style={{ border: "solid", margin: 16 }}>normal div</div>

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

export default App;

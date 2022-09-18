import React from "react";
import Resizable, { ResizableBase, ResizableElement, HandlesParent, Handle } from "react-true-resizable";

import ResizableDev, { ResizableBase as ResizableBaseDev } from "react-true-resizable";
import ResizableElementDev from "../../src/experamintal/ResizableElement";
import HandlesParentDev from "../../src/experamintal/HandlesParent";
import HandleDev from "../../src/experamintal/Handle";

export const BoxStyle = {
  border: "solid",
  borderRadius: 12,
  // width: 120,
  // display: "flex",
  // flexDirection: "column",
  // justifyContent: "center",
  // alignItems: "center",
} as React.CSSProperties;

const App2 = (props) => {
  return (
    <div>
      <h1> App </h1>
      <h2>Resizable (top level wrapper)</h2>
      <Resizable>
        <div style={BoxStyle}>box</div>
      </Resizable>
      <h2>ResizableBase</h2>
      <ResizableBase>
        <ResizableElement>
          <div style={BoxStyle}>box</div>
        </ResizableElement>
        <HandlesParent>
          <Handle offset={{ left: "50%", top: "50%" }} allowResize={{ vertical: true, horizontal: true }} resizeRatio={2}>
            <div
              style={{
                border: "solid blue",
                borderRadius: "50%",
                padding: 8,
                textAlign: "center",
                cursor: "pointer",
              }}
            >
              resize me
            </div>
          </Handle>
        </HandlesParent>
      </ResizableBase>
    </div>
  );
};

export default App2;

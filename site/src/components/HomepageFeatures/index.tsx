import React from "react";
import Resizable from "react-true-resizable";

const BoxStyle = {
  border: "solid",
  borderRadius: 12,
  padding: 8,
  margin: 2,
  display: "flex",
  flexDirection: "column",
  justifyContent: "center",
  alignItems: "center",
  overflow: "hidden",
} as const;

export default function HomepageFeatures() {
  const [boxes, setBoxex] = React.useState([{ id: 0 }, { id: 1 }, { id: 2 }]);
  const removeBox = (id) => {
    setBoxex(boxes.filter((box) => box.id !== id));
  };
  const addBox = () => {
    let nextId = (boxes.length && Math.max(...boxes.map((box) => box.id)) + 1) || 0;
    setBoxex([...boxes, { id: nextId }]);
  };
  return (
    <section style={{ textAlign: "center" }}>
      <button className={"button button--secondary"} style={{ margin: 32 }} onClick={addBox}>
        Add Box
      </button>

      <div style={{ display: "flex", justifyContent: "center", flexWrap: "wrap" }}>
        {boxes.map((box) => (
          <Resizable key={box.id} resizeRatio={{ horizontal: 2 }}>
            <div style={BoxStyle}>
              Resizable {box.id}
              <br />
              <button className={"button button--secondary button--sm"} onClick={() => removeBox(box.id)}>
                X
              </button>
            </div>
          </Resizable>
        ))}
      </div>
    </section>
  );
}

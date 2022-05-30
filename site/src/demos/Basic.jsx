import React from "react";
import Resizable from "react-true-resizable";

export const BoxStyle = {
  border: "solid",
  borderRadius: 12,
  padding: 8,
  margin: 2,
  display: "flex",
  flexDirection: "column",
  justifyContent: "center",
  alignItems: "center",
};

export default function BasicExample() {
  return (
    <Resizable>
      <div style={BoxStyle}>Resizable</div>
    </Resizable>
  );
}

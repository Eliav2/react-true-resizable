"use strict";(self.webpackChunksite=self.webpackChunksite||[]).push([[987],{6987:function(e,n,t){t.r(n),n.default='import React, { useRef } from "react";\nimport Resizable from "react-true-resizable";\nimport Draggable from "react-draggable";\n\nexport const BoxStyle = {\n  border: "solid",\n  borderRadius: 12,\n  width: 120,\n  display: "flex",\n  flexDirection: "column",\n  justifyContent: "center",\n  alignItems: "center",\n  position: "absolute",\n};\n\nexport default function ResizableAndDraggable() {\n  const divRef = useRef(null);\n  return (\n    <div style={{ height: 50 }}>\n      <Resizable nodeRef={divRef} enableRelativeOffset />\n      <Draggable>\n        <div style={BoxStyle} ref={divRef}>\n          Resizable\n        </div>\n      </Draggable>\n    </div>\n  );\n}\n'}}]);
"use strict";(self.webpackChunksite=self.webpackChunksite||[]).push([[765],{5765:function(e,n,t){t.r(n),n.default='import React, { useRef, useState } from "react";\nimport Resizable from "react-true-resizable";\n\nexport const BoxStyle = {\n  border: "solid",\n  borderRadius: 12,\n  width: 120,\n  display: "flex",\n  flexDirection: "column",\n  justifyContent: "center",\n  alignItems: "center",\n};\n\nexport default function handleStyles() {\n  return (\n    <Resizable\n      handlesStyle={{\n        top: { background: "red" },\n        topLeft: { background: "green" },\n        bottomLeft: { background: "green" },\n        topRight: { background: "green" },\n        bottomRight: { background: "green" },\n      }}\n      handleStyle={{ background: "blue" }}\n      enabledHandles={["top", "left", "bottom", "right", "topLeft", "bottomLeft", "bottomRight", "topRight"]}\n    >\n      <div style={BoxStyle}>Resizable</div>\n    </Resizable>\n  );\n}\n'}}]);
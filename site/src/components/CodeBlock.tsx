import React, { FC } from "react";

import DocusaurusCodeBlock, { Props as DocusaurusCodeBlockProps } from "@theme/CodeBlock";
import { Box, ToggleButton, ToggleButtonGroup, Tooltip } from "@mui/material";
import { Code as CodeIcon, CodeOff as CodeOffIcon } from "@mui/icons-material";

interface CodeBlockProps {
  simpleSource?: string;
  fullSource?: string;
}

const CodeBlock: FC<CodeBlockProps> = (props) => {
  const [alignment, setAlignment] = React.useState("simple");

  return (
    <Box sx={{ my: 2 }}>
      <ToggleButtonGroup color="primary" value={alignment} exclusive onChange={(e, v) => setAlignment(v)}>
        <ToggleButton value="simple">
          <Tooltip title="Simple Source">
            <CodeOffIcon />
          </Tooltip>
        </ToggleButton>
        <ToggleButton value="full">
          <Tooltip title="Full Source">
            <CodeIcon />
          </Tooltip>
        </ToggleButton>
      </ToggleButtonGroup>
      {alignment === "simple" && <DocusaurusCodeBlock language="jsx">{props.simpleSource}</DocusaurusCodeBlock>}
      {alignment === "full" && <DocusaurusCodeBlock language="jsx">{props.fullSource}</DocusaurusCodeBlock>}
    </Box>
  );
};

export default CodeBlock;

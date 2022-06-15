import React, { FC } from "react";

import DocusaurusCodeBlock, { Props as DocusaurusCodeBlockProps } from "@theme/CodeBlock";
import { Box, ToggleButton, ToggleButtonGroup, Tooltip } from "@mui/material";
import CodeIcon from "@mui/icons-material/Code";
import CodeOffIcon from "@mui/icons-material/CodeOff";
import PlayArrowIcon from "@mui/icons-material/PlayArrow";

interface CodeBlockProps {
  simpleSource?: string;
  fullSource?: string;
  // live?: string;
  // extraTabs?: { title: string; elem: JSX.Element }[];
}

import Tabs from "@theme/Tabs";
import TabItem from "@theme/TabItem";

const CodeBlock: FC<CodeBlockProps> = (props) => {
  const tabs = [
    <TabItem
      key={"simple"}
      value="simple"
      // @ts-ignore
      label={
        <Tooltip title="Simple Source">
          <CodeOffIcon />
        </Tooltip>
      }
      default
    >
      <DocusaurusCodeBlock showLineNumbers language="jsx">
        {props.simpleSource}
      </DocusaurusCodeBlock>
    </TabItem>,
    <TabItem
      key={"full"}
      value="full"
      // @ts-ignore
      label={
        <Tooltip title="Full Source">
          <CodeIcon />
        </Tooltip>
      }
    >
      <DocusaurusCodeBlock showLineNumbers language="jsx">
        {props.fullSource}
      </DocusaurusCodeBlock>
    </TabItem>,
  ];

  // @formatter:off
  // if (props.live) {
  //   tabs.push(
  //     <TabItem
  //       key="live"
  //       value="live"
  //       // @ts-ignore
  //       label={
  //         <Tooltip title="Live Edit">
  //           <PlayArrowIcon />
  //         </Tooltip>
  //       }
  //     ></TabItem>
  //   );
  // }
  // if (props.extraTabs)
  //   tabs.push(
  //     ...props.extraTabs.map((tab, i) => (
  //       <TabItem value={tab.title} key={tab.title}>
  //         {tab.elem}
  //       </TabItem>
  //     ))
  //   );
  // @formatter:on
  return (
    <Box sx={{ my: 2 }}>
      <Tabs>{tabs}</Tabs>
    </Box>
  );
};

// // mui implementation
// const CodeBlock: FC<CodeBlockProps> = (props) => {
//   const [alignment, setAlignment] = React.useState("simple");
//   console.log(props.simpleSource);
//
//   return (
//     <Box sx={{ my: 2 }}>
//       <ToggleButtonGroup color="primary" value={alignment} exclusive onChange={(e, v) => setAlignment(v)}>
//         <ToggleButton value="simple">
//           <Tooltip title="Simple Source">
//             <CodeOffIcon />
//           </Tooltip>
//         </ToggleButton>
//         <ToggleButton value="full">
//           <Tooltip title="Full Source">
//             <CodeIcon />
//           </Tooltip>
//         </ToggleButton>
//       </ToggleButtonGroup>
//       {alignment === "simple" && (
//         <DocusaurusCodeBlock showLineNumbers language="jsx">
//           {props.simpleSource}
//         </DocusaurusCodeBlock>
//       )}
//       {alignment === "full" && (
//         <DocusaurusCodeBlock showLineNumbers language="jsx">
//           {props.fullSource}
//         </DocusaurusCodeBlock>
//       )}
//     </Box>
//   );
// };

export default CodeBlock;

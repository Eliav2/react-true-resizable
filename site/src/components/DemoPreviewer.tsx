import React, { FC, useEffect, useLayoutEffect, useState } from "react";
import Basic from "@site/src/demos/Basic";
import CodeBlock from "@site/src/components/CodeBlock";
import { Button, Paper } from "@mui/material";

const useDynamicDemoImport = (name) => {
  const [raw, setRaw] = useState(null);
  const [rawSimple, setRawSimple] = useState(null);
  // const Comp = React.lazy(() => import(`@site/src/demos/${name}`)); @react18
  useEffect(() => {
    let resolvedRaw = false;
    let resolvedRawSimple = false;
    let resolvedComp = false;
    import(`!!raw-loader!@site/src/demos/${name}/index`)
      .then((m) => {
        if (!resolvedRaw) {
          resolvedRaw = true;
          setRaw(m.default);
        }
      })
      .catch(console.error);
    import(`!!raw-loader!@site/src/demos/${name}/simple`)
      .then((m) => {
        if (!resolvedRawSimple) {
          resolvedRawSimple = true;
          setRawSimple(m.default);
        }
      })
      .catch(console.error);
    return () => {
      resolvedRaw = true;
      resolvedRawSimple = true;
      resolvedComp = true;
    };
  }, []);
  return [
    // Comp, // @react18
    raw,
    rawSimple,
  ];
};

interface DemoPreviewerProps {
  name: string;
  Comp: React.FC; // @react18
}

const RootDemoPreviewer: FC<DemoPreviewerProps> = (props) => {
  return (
    // <React.Suspense fallback={<div>Loading...</div>}> // @react18
    <DemoPreviewer {...props} />
    // </React.Suspense> // @react18
  );
};

const DemoPreviewer: FC<DemoPreviewerProps> = (props) => {
  const [
    // Comp, // @react18
    raw,
    rawSimple,
  ] = useDynamicDemoImport(props.name);
  const [shouldReset, setShouldReset] = useState(false);
  useLayoutEffect(() => {
    setShouldReset(false);
  }, [shouldReset]);
  return (
    <Paper sx={{ position: "relative" }}>
      <div
        className={"button button--secondary"}
        style={{ position: "absolute", right: 0 }}
        onClick={() => setShouldReset(true)}
      >
        reset
      </div>
      {!shouldReset && <props.Comp />}
      <CodeBlock simpleSource={rawSimple} fullSource={raw} />
    </Paper>
  );
};

export default RootDemoPreviewer;

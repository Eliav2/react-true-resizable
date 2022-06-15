import React, { FC, useEffect, useLayoutEffect, useState } from "react";
import Basic from "@site/src/demos/Basic";
import CodeBlock from "@site/src/components/CodeBlock";
import { Button, Paper } from "@mui/material";

const useDynamicDemoImport = (name) => {
  const [raw, setRaw] = useState(null);
  const [rawSimple, setRawSimple] = useState(null);
  const Comp = React.lazy(() => import(`@site/src/demos/${name}`));
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
  return [Comp, raw, rawSimple];
};

interface DemoPreviewerProps {
  name: string;
}

const RootDemoPreviewer: FC<DemoPreviewerProps> = (props) => {
  return (
    <React.Suspense fallback={<div>Loading...</div>}>
      <DemoPreviewer {...props} />
    </React.Suspense>
  );
};

const DemoPreviewer: FC<DemoPreviewerProps> = (props) => {
  const [Comp, raw, rawSimple] = useDynamicDemoImport(props.name);
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
      <Comp />
      <CodeBlock simpleSource={rawSimple} fullSource={raw} />
    </Paper>
  );
};

export default RootDemoPreviewer;

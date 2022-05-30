import React, { FC, useEffect } from "react";
import CodeBlock from "@theme/CodeBlock";

interface CodeWithSourceProps {
  importPath: string;
}

const CodeWithSource: FC<CodeWithSourceProps> = (props) => {
  const Component = React.lazy(() => import(props.importPath));
  const [ComponentSource, setComponentSource] = React.useState<string>("");

  console.log(Component);
  useEffect(() => {
    // import(`!!raw-loader!${props.importPath}`).then((source) => {
    //   console.log(source);
    //   setComponentSource(source.default);
    // });
  }, []);

  return (
    <div>
      <React.Suspense fallback={<div>Loading</div>}>
        <Component />
        <details>
          <summary>Show Source</summary>
          <div>
            <CodeBlock language="jsx">{ComponentSource}</CodeBlock>
          </div>
        </details>
      </React.Suspense>
    </div>
  );
};

export default CodeWithSource;

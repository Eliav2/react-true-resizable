import React, { FC, ReactElement, ValidationMap, WeakValidationMap } from "react";

interface CompProps {
  name?: string;
}
interface FinalCompProps {
  name: string;
}

const Comp: FC<CompProps> = (_props) => {
  const props = _props as FinalCompProps;
  return <div>{props.name.toUpperCase()}</div>; // no errors
};
Comp.defaultProps = {
  name: "",
};
type FC<P = {}> = FunctionComponent<P>;

interface FunctionComponent<P = {}> {
  (props: P, context?: any): ReactElement<any, any> | null;
  propTypes?: WeakValidationMap<P> | undefined;
  contextTypes?: ValidationMap<any> | undefined;
  defaultProps?: Partial<P> | undefined;
  displayName?: string | undefined;
}

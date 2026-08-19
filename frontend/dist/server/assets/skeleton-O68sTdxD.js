import { jsx } from "react/jsx-runtime";
import { c as cn } from "./router-Ccz3J_v4.js";
function Skeleton({
  className,
  ...props
}) {
  return /* @__PURE__ */ jsx(
    "div",
    {
      className: cn("animate-pulse rounded-md bg-primary/10", className),
      ...props
    }
  );
}
export {
  Skeleton as S
};

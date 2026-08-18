import { jsx } from "react/jsx-runtime";
import { S as Skeleton } from "./skeleton-BsPIQX8r.js";
import { c as cn } from "./router-CU8xXL5-.js";
function ChartFrame({
  loading,
  className,
  children
}) {
  if (loading) {
    return /* @__PURE__ */ jsx(Skeleton, { className: cn("h-full w-full", className) });
  }
  return /* @__PURE__ */ jsx(
    "div",
    {
      className: cn(
        "h-full animate-in fade-in-0 zoom-in-95 duration-500",
        className
      ),
      children
    }
  );
}
export {
  ChartFrame as C
};

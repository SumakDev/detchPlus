"use client";
import * as React from "react";
export const Textarea = React.forwardRef<HTMLTextAreaElement, React.TextareaHTMLAttributes<HTMLTextAreaElement>>(function T(props, ref) {
  const { className = "", ...rest } = props;
  return <textarea ref={ref} className={`border rounded px-3 py-2 text-sm ${className}`} {...rest} />;
});
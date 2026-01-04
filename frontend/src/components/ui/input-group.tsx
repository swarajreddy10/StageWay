"use client";

import * as React from "react";

import { cn } from "@/lib/utils";
import { Button, type ButtonProps } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

const InputGroup = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      className={cn(
        "flex min-w-0 w-full items-stretch gap-2 rounded-md border border-input bg-background px-2 py-1.5 focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-2",
        className
      )}
      {...props}
    />
  )
);
InputGroup.displayName = "InputGroup";

type InputGroupAddonAlign = "inline-start" | "inline-end" | "block-start" | "block-end";

interface InputGroupAddonProps extends React.HTMLAttributes<HTMLDivElement> {
  align?: InputGroupAddonAlign;
}

const InputGroupAddon = React.forwardRef<HTMLDivElement, InputGroupAddonProps>(
  ({ className, align = "inline-start", ...props }, ref) => {
    const alignClass =
      align === "inline-start"
        ? "order-first"
        : align === "inline-end"
          ? "ml-auto"
          : align === "block-start"
            ? "self-start"
            : "self-end";

    return (
      <div
        ref={ref}
        className={cn("flex items-center gap-1 text-muted-foreground", alignClass, className)}
        {...props}
      />
    );
  }
);
InputGroupAddon.displayName = "InputGroupAddon";

const InputGroupInput = React.forwardRef<HTMLInputElement, React.ComponentProps<typeof Input>>(
  ({ className, ...props }, ref) => (
    <Input
      ref={ref}
      data-slot="input-group-control"
      className={cn(
        "h-8 min-w-0 border-0 bg-transparent px-2 py-1 text-sm shadow-none focus-visible:ring-0 focus-visible:ring-offset-0",
        className
      )}
      {...props}
    />
  )
);
InputGroupInput.displayName = "InputGroupInput";

const InputGroupTextarea = React.forwardRef<
  HTMLTextAreaElement,
  React.ComponentProps<typeof Textarea>
>(({ className, ...props }, ref) => (
  <Textarea
    ref={ref}
    data-slot="input-group-control"
    className={cn(
      "min-h-16 border-0 bg-transparent px-2 py-1 text-sm shadow-none focus-visible:ring-0 focus-visible:ring-offset-0",
      className
    )}
    {...props}
  />
));
InputGroupTextarea.displayName = "InputGroupTextarea";

const InputGroupText = ({ className, ...props }: React.HTMLAttributes<HTMLSpanElement>) => (
  <span className={cn("text-xs text-muted-foreground", className)} {...props} />
);

type InputGroupButtonSize = "xs" | "icon-xs" | "sm" | "icon-sm" | "default" | "lg" | "icon";

interface InputGroupButtonProps extends Omit<ButtonProps, "size"> {
  size?: InputGroupButtonSize;
}

const InputGroupButton = React.forwardRef<HTMLButtonElement, InputGroupButtonProps>(
  ({ size = "xs", className, ...props }, ref) => {
    const sizeMap: Record<string, ButtonProps["size"]> = {
      xs: "sm",
      "icon-xs": "icon",
      sm: "sm",
      "icon-sm": "icon",
      default: "default",
      lg: "lg",
      icon: "icon",
    };
    const resolvedSize = sizeMap[size] ?? "default";
    const sizeClass =
      size === "xs"
        ? "h-8 px-2 text-xs"
        : size === "icon-xs"
          ? "h-8 w-8"
          : size === "icon-sm"
            ? "h-9 w-9"
            : "";
    return <Button ref={ref} size={resolvedSize} className={cn(sizeClass, className)} {...props} />;
  }
);
InputGroupButton.displayName = "InputGroupButton";

export {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupInput,
  InputGroupText,
  InputGroupTextarea,
};

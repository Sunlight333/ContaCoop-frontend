import * as React from "react";
import { cn } from "@/lib/utils";

interface AnimatedCardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'glow' | 'lift' | 'border' | 'border-active';
  delay?: number;
}

const AnimatedCard = React.forwardRef<HTMLDivElement, AnimatedCardProps>(
  ({ className, variant = 'default', delay = 0, style, children, ...props }, ref) => {
    const variantClasses = {
      default: 'hover-lift',
      glow: 'hover-glow hover-lift',
      lift: 'hover-lift',
      border: 'animated-border hover-lift',
      'border-active': 'animated-border animated-border-active hover-lift',
    };

    return (
      <div
        ref={ref}
        className={cn(
          "rounded-lg border bg-card text-card-foreground shadow-sm transition-all duration-300",
          "animate-slide-up",
          variantClasses[variant],
          className
        )}
        style={{
          ...style,
          animationDelay: delay ? `${delay}ms` : undefined,
          animationFillMode: delay ? 'backwards' : undefined,
        }}
        {...props}
      >
        {children}
      </div>
    );
  }
);
AnimatedCard.displayName = "AnimatedCard";

const AnimatedCardHeader = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("flex flex-col space-y-1.5 p-6", className)}
    {...props}
  />
));
AnimatedCardHeader.displayName = "AnimatedCardHeader";

const AnimatedCardTitle = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLHeadingElement>
>(({ className, ...props }, ref) => (
  <h3
    ref={ref}
    className={cn(
      "text-2xl font-semibold leading-none tracking-tight",
      className
    )}
    {...props}
  />
));
AnimatedCardTitle.displayName = "AnimatedCardTitle";

const AnimatedCardDescription = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>
>(({ className, ...props }, ref) => (
  <p
    ref={ref}
    className={cn("text-sm text-muted-foreground", className)}
    {...props}
  />
));
AnimatedCardDescription.displayName = "AnimatedCardDescription";

const AnimatedCardContent = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div ref={ref} className={cn("p-6 pt-0", className)} {...props} />
));
AnimatedCardContent.displayName = "AnimatedCardContent";

const AnimatedCardFooter = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("flex items-center p-6 pt-0", className)}
    {...props}
  />
));
AnimatedCardFooter.displayName = "AnimatedCardFooter";

export {
  AnimatedCard,
  AnimatedCardHeader,
  AnimatedCardFooter,
  AnimatedCardTitle,
  AnimatedCardDescription,
  AnimatedCardContent,
};

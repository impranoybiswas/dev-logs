"use client";

import { motion, HTMLMotionProps } from "framer-motion";
import { ReactNode } from "react";
import { Spin } from "antd";
import { LoadingOutlined } from "@ant-design/icons";

interface PremiumButtonProps extends HTMLMotionProps<"button"> {
  children: ReactNode;
  variant?: "primary" | "secondary" | "outline" | "glass";
  size?: "sm" | "md" | "lg" | "xl";
  loading?: boolean;
  icon?: ReactNode;
  fullWidth?: boolean;
}

const PremiumButton = ({
  children,
  variant = "primary",
  size = "md",
  loading = false,
  icon,
  fullWidth = false,
  className = "",
  type = "button",
  ...props
}: PremiumButtonProps) => {
  const sizeClasses = {
    sm: "px-4 py-2 text-xs rounded-xl",
    md: "px-6 py-3 text-sm rounded-2xl",
    lg: "px-8 py-4 text-base rounded-2xl",
    xl: "px-10 py-5 text-lg rounded-3xl",
  };

  const variantClasses = {
    primary:
      "bg-linear-to-r from-primary via-accent to-secondary text-white shadow-xl shadow-primary/20 hover:shadow-primary/40",
    secondary:
      "bg-linear-to-r from-accent to-secondary text-white shadow-xl shadow-accent/20 hover:shadow-accent/40",
    outline:
      "bg-transparent border-2 border-border hover:border-primary text-foreground backdrop-blur-sm hover:bg-primary/5",
    glass:
      "glass bg-white/5 hover:bg-white/10 text-foreground border border-white/10",
  };

  return (
    <motion.button
      whileHover={{ scale: 1.02, y: -2 }}
      whileTap={{ scale: 0.98 }}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      type={type}
      disabled={loading || props.disabled}
      className={`
        relative overflow-hidden font-bold tracking-tight transition-all duration-300
        flex items-center justify-center gap-2.5 disabled:opacity-50 disabled:cursor-not-allowed
        ${sizeClasses[size]}
        ${variantClasses[variant]}
        ${fullWidth ? "w-full" : "w-max"}
        ${className}
      `}
      {...props}
    >
      {loading ? (
        <Spin
          indicator={<LoadingOutlined className="text-white" spin />}
          size="small"
        />
      ) : (
        <>
          {icon && (
            <span className="flex items-center justify-center text-lg">
              {icon}
            </span>
          )}
          <span className="relative z-10">{children}</span>
        </>
      )}

      {/* Shine effect on hover */}
      <motion.div
        className="absolute inset-0 bg-linear-to-r from-white/0 via-white/20 to-white/0 -translate-x-full pointer-events-none"
        initial={{ x: "-100%" }}
        whileHover={{ x: "100%" }}
        transition={{ duration: 0.6, ease: "easeInOut" }}
      />
    </motion.button>
  );
};

export default PremiumButton;

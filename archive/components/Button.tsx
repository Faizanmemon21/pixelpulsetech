import type { ReactNode } from "react";

type ButtonProps = {
  id?: string;
  title: string;
  leftIcon?: ReactNode;
  rightIcon?: ReactNode;
  containerClass?: string;
};

const Button = ({ id, title, leftIcon, rightIcon, containerClass }: ButtonProps) => {
  return (
    <button
      id={id}
      className={`group relative z-10 w-fit cursor-pointer overflow-hidden rounded-full px-7 py-3 text-black ${containerClass ?? ""}`}
    >
      {leftIcon}

      <span className="relative inline-flex overflow-hidden text-xs font-semibold uppercase tracking-wide">
        {title}
      </span>

      {rightIcon}
    </button>
  );
};

export default Button;

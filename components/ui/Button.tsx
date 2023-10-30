import React from "react"
import styles from "@/styles/ui.module.scss"
import ChildrenWithIcon, { IconProps } from "./ChildrenWithIcon"

type ButtonProps = IconProps & React.ButtonHTMLAttributes<HTMLButtonElement>;

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(({icon, iconOnly, hiddenText, hiddenTextBeforeRegular, ...props}, ref) => {
  let className = props.className;

  if (icon) {
    if (iconOnly) className += ' ' + styles.iconOnlyBtn;
    else className += ' ' + styles.withIconBtn;
  }
  else className += ' ' + styles.btn;

  const iconProps = {icon, iconOnly, hiddenText, hiddenTextBeforeRegular};

  return (
    <button
      type="button"
      ref={ref}
      {...props}
      className={className}
    >
      <ChildrenWithIcon {...iconProps}>{props.children}</ChildrenWithIcon>
    </button>
  )
})

export { Button }
import React from "react"
import styles from "@/styles/ui.module.scss"
import { FiLogOut } from 'react-icons/fi'

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  icon?: 'logout',
  iconOnly?: boolean, // default false
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(({icon, iconOnly, ...props}, ref) => {
  let className = props.className;
  let iconElement: React.ReactElement|undefined;
  if (icon) {
    if (iconOnly) className += ' ' + styles.iconOnlyBtn;
    else className += ' ' + styles.withIconBtn;
    switch (icon) {
      case 'logout':
        iconElement = <FiLogOut />
        break;
    }
  }
  else {
    className += ' ' + styles.btn;
  }
  return (
    <button
      type="button"
      ref={ref}
      {...props}
      className={className}
    >
      {iconElement ? iconElement : ''}
      {props.children}
    </button>
  )
})

export { Button }
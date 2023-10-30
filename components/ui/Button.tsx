import React from "react"
import styles from "@/styles/ui.module.scss"
import { AiFillCaretDown, AiFillCaretUp, AiOutlineEdit, AiOutlineClose, AiOutlineSave } from 'react-icons/ai'
import { FaRegTrashAlt } from 'react-icons/fa'
import { FiLogOut } from 'react-icons/fi'

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  icon?: 'delete' | 'edit' | 'logout' | 'moveUp' | 'moveDown' | 'save' | 'x',
  iconOnly?: boolean, // default false
  hiddenText?: string, // for assistive technology
  hiddenTextBeforeRegular?: boolean, // default false
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(({icon, iconOnly, hiddenText, hiddenTextBeforeRegular, ...props}, ref) => {
  let className = props.className;

  let iconElement: React.ReactElement|undefined;
  if (icon) {
    if (iconOnly) className += ' ' + styles.iconOnlyBtn;
    else className += ' ' + styles.withIconBtn;
    switch (icon) {
      case 'delete':
        iconElement = <FaRegTrashAlt />
        break;
      case 'edit':
        iconElement = <AiOutlineEdit />
        break;
      case 'logout':
        iconElement = <FiLogOut />
        break;
      case 'moveDown':
        iconElement = <AiFillCaretDown />
        break;
      case 'moveUp':
        iconElement = <AiFillCaretUp />
        break;
      case 'save':
        iconElement = <AiOutlineSave />
        break;
      case 'x':
        iconElement = <AiOutlineClose />
        break;
    }
  }
  else {
    className += ' ' + styles.btn;
  }

  let hiddenElement = <span className="sr-only">{hiddenText}</span>;

  return (
    <button
      type="button"
      ref={ref}
      {...props}
      className={className}
    >
      {iconElement ? iconElement : ''}
      {hiddenText && hiddenTextBeforeRegular ? hiddenElement : ''}
      {props.children}
      {hiddenText && !hiddenTextBeforeRegular ? hiddenElement : ''}
    </button>
  )
})

export { Button }
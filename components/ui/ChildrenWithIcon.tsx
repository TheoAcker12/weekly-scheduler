import React from "react"
import { AiFillCaretDown, AiFillCaretUp, AiOutlineEdit, AiOutlineClose, AiOutlineSave } from 'react-icons/ai'
import { FaRegTrashAlt } from 'react-icons/fa'
import { FiLogOut } from 'react-icons/fi'

export type IconProps = {
  icon?: 'delete' | 'edit' | 'logout' | 'moveUp' | 'moveDown' | 'save' | 'x',
  iconOnly?: boolean, // default false
  hiddenText?: string, // for assistive technology
  hiddenTextBeforeRegular?: boolean, // default false
  children?: React.ReactNode
}

export default function ChildrenWithIcon(props: IconProps) {
  let icon: React.ReactElement|undefined;
  if (props.icon) switch (props.icon) {
    case 'delete':
      icon = <FaRegTrashAlt />
      break;
    case 'edit':
      icon = <AiOutlineEdit />
      break;
    case 'logout':
      icon = <FiLogOut />
      break;
    case 'moveDown':
      icon = <AiFillCaretDown />
      break;
    case 'moveUp':
      icon = <AiFillCaretUp />
      break;
    case 'save':
      icon = <AiOutlineSave />
      break;
    case 'x':
      icon = <AiOutlineClose />
      break;
  }
  let hiddenElement = props.hiddenText ? <span className="sr-only">{props.hiddenText}</span> : '';
  return (<>
    {icon}
    {props.hiddenTextBeforeRegular ? hiddenElement : ''}
    {props.children}
    {!props.hiddenTextBeforeRegular ? hiddenElement : ''}
  </>)
}
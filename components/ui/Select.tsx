import React from "react"
import styles from "@/styles/ui.module.scss"

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  labelText?: string,
  hideLabel?: boolean,
  defaultOption?: string, // makes the first option this
  parentProps?: React.HTMLAttributes<HTMLDivElement>
}


const Select = React.forwardRef<HTMLSelectElement, SelectProps>(({labelText, hideLabel, defaultOption, parentProps, ...props}, ref) => {
  const parentClass = parentProps?.className + ' ' + styles.select;
  return (
    <div {...parentProps} className={parentClass}>
      {labelText ? <label htmlFor={props.id} className={hideLabel ? 'sr-only' : ''}>{labelText} </label> : ''}
      <select
        ref={ref}
        {...props}
      >
        {defaultOption ? <option value='default'>{defaultOption}</option> : ''}
        {props.children}
      </select>
    </div>
  )
})

export { Select }
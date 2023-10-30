import React from "react"
import styles from "@/styles/ui.module.scss"

// accept all properties for normal input elements, then add our own
interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  labelText?: string,
  labelAfterInput?: boolean,
  hideLabel?: boolean,
  description?: string | React.ReactElement,
  parentProps?: React.HTMLAttributes<HTMLDivElement>
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(({labelText, labelAfterInput, hideLabel, description, parentProps, ...props}, ref) => {

  // label/description
  const labelElement = labelText ? <label htmlFor={props.id} className={styles.input + (hideLabel ? " sr-only" : "")}>{labelText}</label> : "";
  const descriptionElement = description ? <span id={props.id + '-description'} className={styles.description}>{description}</span> : "";
  const label = <>
    {labelElement}
    {descriptionElement}
  </>

  return (
    <div {...parentProps}>
      {labelAfterInput ? "" : label}
      <input
        aria-describedby={description ? props.id + '-description' : props["aria-describedby"]}
        ref={ref}
        {...props}
      />
      {labelAfterInput ? label : ""}
    </div>
  );
})

export { Input }
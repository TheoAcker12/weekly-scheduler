import React from "react"
import styles from "@/styles/ui.module.scss"

interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string,
  description?: string,
  parentProps?: React.HTMLAttributes<HTMLDivElement>
}

export default function Textarea({ label, description, parentProps, ...props }: TextareaProps) {
  const parentClass = parentProps?.className + ' ' + styles.textarea;
  return (
    <div {...parentProps} className={parentClass}>
      {label ? <label htmlFor={props.id}>{label}</label> : ''}
      {description ? <span id={props.id + '-description'} className="description">{description}</span> : ''}
      <textarea
        aria-describedby={description ? props.id + '-description' : props["aria-describedby"]}
        {...props}
      />
    </div>
  )
}
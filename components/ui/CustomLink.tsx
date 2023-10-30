// to streamline process of creating icon links, etc.

import Link from "next/link";
import React from "react";
import ChildrenWithIcon, { IconProps } from "./ChildrenWithIcon"
import styles from "@/styles/ui.module.scss"

type LinkProps = IconProps & React.ComponentProps<typeof Link>;

export default function CustomLink({icon, iconOnly, hiddenText, hiddenTextBeforeRegular, children, ...props}: LinkProps) {
  let className = props.className ?? '';

  if (icon) {
    if (iconOnly) className += ' ' + styles.iconOnlyLink;
    else className += ' ' + styles.withIconLink;
  }
  else className += ' ' + styles.btnLink;

  const iconProps = {icon, iconOnly, hiddenText, hiddenTextBeforeRegular};

  return (
    <div className={className}>
      <Link {...props}>
        <ChildrenWithIcon {...iconProps}>{children}</ChildrenWithIcon>
      </Link>
    </div>
  )
}
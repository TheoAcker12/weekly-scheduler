// to streamline process of creating icon links, etc.

import Link from "next/link";
import React from "react";
import ChildrenWithIcon, { IconProps } from "./ChildrenWithIcon"
import styles from "@/styles/ui.module.scss"

type LinkProps = IconProps & React.ComponentProps<typeof Link>;

export default function CustomLink({icon, iconOnly, hiddenText, hiddenTextBeforeRegular, children, className, ...props}: LinkProps) {
  let newClassName = className ?? '';

  if (icon) {
    if (iconOnly) newClassName += ' ' + styles.iconOnlyLink;
    else newClassName += ' ' + styles.withIconLink;
  }
  else newClassName += ' ' + styles.btnLink;

  const iconProps = {icon, iconOnly, hiddenText, hiddenTextBeforeRegular};

  return (
    <div className={newClassName}>
      <Link {...props}>
        <ChildrenWithIcon {...iconProps}>{children}</ChildrenWithIcon>
      </Link>
    </div>
  )
}
// provides important information for pages - used for popuplating navbar
export type Page = {
  route: string, // relative url
  menu: string, // text for the page link in the nav
}
export type GenericError = { id?: string, error?: string, msg?: string }
export type HeadingLevel = '1' | '2' | '3' | '4' | '5' | '6'
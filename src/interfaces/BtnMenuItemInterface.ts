/** Account Menu Item Interface */
export default interface BtnMenuItem {
  title?: string /** Item Name of i18n string ID */;
  text?: string;
  isSelected?: boolean;
  id?: string /** Item ID */;
  icon?: string | null;
  iconAppend?: string /** Item Icon */;
  iconSize?: number /** Item Size */;
  enableIcon?: any;
  link?: () => any | null | undefined;
  topDivider?: boolean;
  hide?: boolean /** is active */;
  group?: BtnMenuItem[] /** Sub Items */;
}

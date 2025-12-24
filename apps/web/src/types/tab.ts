export interface IframeTab {
  key: string;
  title: string;
  url: string;
  closable?: boolean;
  icon?: string;
}

export interface TabState {
  tabs: IframeTab[];
  activeKey: string;
}

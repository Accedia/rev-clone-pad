declare namespace AppCssNamespace {
  export interface IAppCss {
    file: string;
    mappings: string;
    names: string;
    sources: string;
    version: string;
  }
}

declare const AppCssModule: AppCssNamespace.IAppCss & {
  /** WARNING: Only available when `css-loader` is used without `style-loader` or `mini-css-extract-plugin` */
  locals: AppCssNamespace.IAppCss;
};

export = AppCssModule;

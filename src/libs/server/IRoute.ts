export interface IRoute {

  route: string | RegExp;

  method: string;

  context: string;

  permissions?: string | string[];

  instance?: string;

  params?: any;

  controller?: string;

  controllerMethod?: string;

  authorized?: boolean;

  serveStatic?: boolean;
}

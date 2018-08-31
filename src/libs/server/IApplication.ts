

export interface IApplication {

  use(...args:any[]):IApplication;

  get(...args:any[]):IApplication;

  post(...args:any[]):IApplication;
}

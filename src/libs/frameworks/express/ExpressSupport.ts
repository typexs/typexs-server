import {IFrameworkSupport} from "../IFrameworkSupport";
import {IExpressOptions} from "./IExpressOptions";
import * as express from "express";
import {IExpress} from "./IExpress";
import {PlatformUtils} from "typexs-base";


export class ExpressSupport implements IFrameworkSupport {

  static LIB: Function;

  instance: IExpress;

  options: IExpressOptions;


  constructor(options: IExpressOptions) {
    this.options = options;
    ExpressSupport.LIB = PlatformUtils.load('./Express').Express;
    this.instance = Reflect.construct(ExpressSupport.LIB, [this,options]);
    //  this.app.disable("x-powered-by");

  }
}

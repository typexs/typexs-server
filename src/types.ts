import {IRoutingController} from "./libs/IRoutingController";
import {IStaticFiles} from "./libs/IStaticFiles";

export type ROUTE_TYPE = 'static_files' | 'routing_controller'
export type ROUTE = IRoutingController | IStaticFiles

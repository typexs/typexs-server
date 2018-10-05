import {IRoutingController} from "./libs/web/IRoutingController";
import {IStaticFiles} from "./libs/web/IStaticFiles";


export const C_DEFAULT = 'default';
export const C_SERVER = 'server';
export const K_CORE_LIB_CONTROLLERS = 'server.controllers';
export const K_META_CONTEXT_ARGS = 'controller.contexts';
export const K_META_CREDENTIALS_ARGS = 'controller.credentials';
export const K_ROUTE_STATIC = 'static_files';
export const K_ROUTE_CONTROLLER = 'routing_controller';

export type ROUTE_TYPE = 'static_files' | 'routing_controller'
export type ROUTE = IRoutingController | IStaticFiles


export const API_SYSTEM_MODULES = '/api/system/modules';
export const API_SYSTEM_ROUTES = '/api/system/routes';
export const API_SYSTEM_CONFIG = '/api/system/config';
export const API_SYSTEM_STORAGES = '/api/system/storages';

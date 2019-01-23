import {IRoutingController} from "./web/IRoutingController";
import {IStaticFiles} from "./web/IStaticFiles";

export const PERMISSION_ALLOW_ROUTES_VIEW = 'allow routes view';
export const PERMISSION_ALLOW_MODULES_VIEW = 'allow modules view';
export const PERMISSION_ALLOW_GLOBAL_CONFIG_VIEW = 'allow global config view';
export const PERMISSION_ALLOW_STORAGES_VIEW = 'allow storages view';
export const PERMISSION_ALLOW_STORAGE_ENTITY_VIEW = 'allow storages entity view';


export const K_ROUTE_CACHE = 'route_cache';
export const C_DEFAULT = 'default';
export const C_SERVER = 'server';
export const K_CORE_LIB_CONTROLLERS = 'server.controllers';
export const K_META_CONTEXT_ARGS = 'controller.contexts';
export const K_META_PERMISSIONS_ARGS = 'controller.permissions';
export const K_ROUTE_STATIC = 'static_files';
export const K_ROUTE_CONTROLLER = 'routing_controller';
export type ROUTE_TYPE = 'static_files' | 'routing_controller'
export type ROUTE = IRoutingController | IStaticFiles
export const API_SYSTEM_MODULES = '/api/system/modules';
export const API_SYSTEM_ROUTES = '/api/system/routes';
export const API_SYSTEM_CONFIG = '/api/system/config';
export const API_SYSTEM_STORAGES = '/api/system/storages';

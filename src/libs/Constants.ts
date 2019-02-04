

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

export const API_SYSTEM_MODULES = '/api/system/modules';
export const API_SYSTEM_ROUTES = '/api/system/routes';
export const API_SYSTEM_CONFIG = '/api/system/config';
export const API_SYSTEM_STORAGES = '/api/system/storages';


export const API_STORAGE_PREFIX = '/storage';


/**
 * Metadata
 */
export const PERMISSION_ALLOW_ACCESS_STORAGE_METADATA = 'allow access storage metadata';
export const API_STORAGE_METADATA = '/metadata';
export const API_STORAGE_METADATA_ALL_STORES = API_STORAGE_METADATA + '/schemas';
export const API_STORAGE_METADATA_GET_STORE = API_STORAGE_METADATA + '/schema/:name';
export const API_STORAGE_METADATA_ALL_ENTITIES = API_STORAGE_METADATA + '/entities';
export const API_STORAGE_METADATA_CREATE_ENTITY = API_STORAGE_METADATA + '/entity';
export const API_STORAGE_METADATA_GET_ENTITY = API_STORAGE_METADATA + '/entity/:name';



export const API_STORAGE_FIND_ENTITY = '/entity/:name';
export const API_STORAGE_GET_ENTITY = '/entity/:name/:id';
export const PERMISSION_ALLOW_ACCESS_STORAGE_ENTITY = 'allow access storage entity';
export const PERMISSION_ALLOW_ACCESS_STORAGE_ENTITY_PATTERN = 'allow access storage entity :name';

export const API_STORAGE_SAVE_ENTITY = '/entity/:name';
export const PERMISSION_ALLOW_SAVE_STORAGE_ENTITY = 'allow edit storage entity';
export const PERMISSION_ALLOW_SAVE_STORAGE_ENTITY_PATTERN = 'allow edit storage entity :name';

export const API_STORAGE_UPDATE_ENTITY = '/entity/:name/:id';
export const PERMISSION_ALLOW_UPDATE_STORAGE_ENTITY = 'allow edit storage entity';
export const PERMISSION_ALLOW_UPDATE_STORAGE_ENTITY_PATTERN = 'allow edit storage entity :name';

export const API_STORAGE_DELETE_ENTITY = '/entity/:name/:id';
export const PERMISSION_ALLOW_DELETE_STORAGE_ENTITY = 'allow delete storage entity';
export const PERMISSION_ALLOW_DELETE_STORAGE_ENTITY_PATTERN = 'allow delete storage entity :name';

export const XS_P_URL = '$url';
export const XS_P_LABEL = '$label';


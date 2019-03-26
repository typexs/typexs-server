






export const K_ROUTE_CACHE = 'route_cache';
export const C_DEFAULT = 'default';
export const C_SERVER = 'server';
export const K_CORE_LIB_CONTROLLERS = 'server.controllers';
export const K_META_CONTEXT_ARGS = 'controller.contexts';
export const K_META_PERMISSIONS_ARGS = 'controller.permissions';
export const K_ROUTE_STATIC = 'static_files';
export const K_ROUTE_CONTROLLER = 'routing_controller';
export type ROUTE_TYPE = 'static_files' | 'routing_controller'


export const _API_SYSTEM = '/system';
export const API_SYSTEM = '/api' + _API_SYSTEM;

export const PERMISSION_ALLOW_MODULES_VIEW = 'allow modules view';
export const _API_SYSTEM_MODULES = '/modules';
export const API_SYSTEM_MODULES = API_SYSTEM + _API_SYSTEM_MODULES;

export const PERMISSION_ALLOW_ROUTES_VIEW = 'allow routes view';
export const _API_SYSTEM_ROUTES = '/routes';
export const API_SYSTEM_ROUTES = API_SYSTEM + _API_SYSTEM_ROUTES;

export const PERMISSION_ALLOW_GLOBAL_CONFIG_VIEW = 'allow global config view';
export const _API_SYSTEM_CONFIG = '/config';
export const API_SYSTEM_CONFIG = API_SYSTEM + _API_SYSTEM_CONFIG;

export const PERMISSION_ALLOW_STORAGES_VIEW = 'allow storages view';
export const _API_SYSTEM_STORAGES = '/storages';
export const API_SYSTEM_STORAGES = API_SYSTEM + _API_SYSTEM_STORAGES;

export const PERMISSION_ALLOW_RUNTIME_INFO_VIEW = 'allow runtime info view';
export const _API_SYSTEM_RUNTIME_INFO = '/info';
export const API_SYSTEM_RUNTIME_INFO = API_SYSTEM + _API_SYSTEM_RUNTIME_INFO;

export const PERMISSION_ALLOW_RUNTIME_NODE_VIEW = 'allow runtime node view';
export const _API_SYSTEM_RUNTIME_NODE = '/node';
export const API_SYSTEM_RUNTIME_NODE = API_SYSTEM + _API_SYSTEM_RUNTIME_NODE;

export const PERMISSION_ALLOW_RUNTIME_NODES_VIEW = 'allow runtime nodes view';
export const _API_SYSTEM_RUNTIME_NODES = '/nodes';
export const API_SYSTEM_RUNTIME_NODES = API_SYSTEM + _API_SYSTEM_RUNTIME_NODES;

export const PERMISSION_ALLOW_RUNTIME_REMOTE_INFOS_VIEW = 'allow runtime remote infos view';
export const _API_SYSTEM_RUNTIME_REMOTE_INFOS = '/remote_infos';
export const API_SYSTEM_RUNTIME_REMOTE_INFOS = API_SYSTEM + _API_SYSTEM_RUNTIME_REMOTE_INFOS;

export const PERMISSION_ALLOW_STORAGE_ENTITY_VIEW = 'allow storages entity view';



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
export const PERMISSION_ALLOW_SAVE_STORAGE_ENTITY = 'allow save storage entity';
export const PERMISSION_ALLOW_SAVE_STORAGE_ENTITY_PATTERN = 'allow save storage entity :name';

export const API_STORAGE_UPDATE_ENTITY = '/entity/:name/:id';
export const PERMISSION_ALLOW_UPDATE_STORAGE_ENTITY = 'allow edit storage entity';
export const PERMISSION_ALLOW_UPDATE_STORAGE_ENTITY_PATTERN = 'allow edit storage entity :name';

export const API_STORAGE_DELETE_ENTITY = '/entity/:name/:id';
export const PERMISSION_ALLOW_DELETE_STORAGE_ENTITY = 'allow delete storage entity';
export const PERMISSION_ALLOW_DELETE_STORAGE_ENTITY_PATTERN = 'allow delete storage entity :name';



export const API_DISTRIBUTED_STORAGE = '/distributed';

export const _API_DISTRIBUTED_STORAGE_FIND_ENTITY = '/query/:name';
export const API_DISTRIBUTED_STORAGE_FIND_ENTITY = API_DISTRIBUTED_STORAGE + _API_DISTRIBUTED_STORAGE_FIND_ENTITY;
export const _API_DISTRIBUTED_STORAGE_GET_ENTITY = '/entity/:nodeId/:name/:id';
export const API_DISTRIBUTED_STORAGE_GET_ENTITY = API_DISTRIBUTED_STORAGE + _API_DISTRIBUTED_STORAGE_GET_ENTITY;
export const PERMISSION_ALLOW_ACCESS_DISTRIBUTED_STORAGE_ENTITY = 'allow access distributed storage entity';
export const PERMISSION_ALLOW_ACCESS_DISTRIBUTED_STORAGE_ENTITY_PATTERN = 'allow access distributed storage entity :name';



export const XS_P_URL = '$url';
export const XS_P_LABEL = '$label';









export const K_ROUTE_CACHE = 'route_cache';
export const C_DEFAULT = 'default';
export const C_SERVER = 'server';
export const K_CORE_LIB_CONTROLLERS = 'server.controllers';
export const K_META_CONTEXT_ARGS = 'controller.contexts';
export const K_META_PERMISSIONS_ARGS = 'controller.permissions';
export const K_ROUTE_STATIC = 'static_files';
export const K_ROUTE_CONTROLLER = 'routing_controller';
export type ROUTE_TYPE = 'static_files' | 'routing_controller';

export const C_API = 'api';
export const _API_SYSTEM = '/system';
// export const API_SYSTEM = '/api' + _API_SYSTEM;

export const PERMISSION_ALLOW_MODULES_VIEW = 'allow modules view';
export const _API_SYSTEM_MODULES = '/modules';
export const API_SYSTEM_MODULES = _API_SYSTEM + _API_SYSTEM_MODULES;

export const PERMISSION_ALLOW_ROUTES_VIEW = 'allow routes view';
export const _API_SYSTEM_ROUTES = '/routes';
export const API_SYSTEM_ROUTES = _API_SYSTEM + _API_SYSTEM_ROUTES;

export const PERMISSION_ALLOW_GLOBAL_CONFIG_VIEW = 'allow global config view';
export const _API_SYSTEM_CONFIG = '/config';
export const API_SYSTEM_CONFIG = _API_SYSTEM + _API_SYSTEM_CONFIG;

export const PERMISSION_ALLOW_STORAGES_VIEW = 'allow storages view';
export const _API_SYSTEM_STORAGES = '/storages';
export const API_SYSTEM_STORAGES = _API_SYSTEM + _API_SYSTEM_STORAGES;

export const PERMISSION_ALLOW_RUNTIME_INFO_VIEW = 'allow runtime info view';
export const _API_SYSTEM_RUNTIME_INFO = '/info';
export const API_SYSTEM_RUNTIME_INFO = _API_SYSTEM + _API_SYSTEM_RUNTIME_INFO;

export const PERMISSION_ALLOW_RUNTIME_NODE_VIEW = 'allow runtime node view';
export const _API_SYSTEM_RUNTIME_NODE = '/node';
export const API_SYSTEM_RUNTIME_NODE = _API_SYSTEM + _API_SYSTEM_RUNTIME_NODE;

export const PERMISSION_ALLOW_RUNTIME_NODES_VIEW = 'allow runtime nodes view';
export const _API_SYSTEM_RUNTIME_NODES = '/nodes';
export const API_SYSTEM_RUNTIME_NODES = _API_SYSTEM + _API_SYSTEM_RUNTIME_NODES;

export const PERMISSION_ALLOW_RUNTIME_REMOTE_INFOS_VIEW = 'allow runtime remote infos view';
export const _API_SYSTEM_RUNTIME_REMOTE_INFOS = '/remote_infos';
export const API_SYSTEM_RUNTIME_REMOTE_INFOS = _API_SYSTEM + _API_SYSTEM_RUNTIME_REMOTE_INFOS;

export const PERMISSION_ALLOW_WORKERS_INFO = 'list worker information';
export const _API_SYSTEM_WORKERS = '/workers';
export const API_SYSTEM_WORKERS = _API_SYSTEM + _API_SYSTEM_WORKERS;


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
export const API_STORAGE_DELETE_ENTITIES = '/entity/:name';
export const PERMISSION_ALLOW_DELETE_STORAGE_ENTITY = 'allow delete storage entity';
export const PERMISSION_ALLOW_DELETE_STORAGE_ENTITY_PATTERN = 'allow delete storage entity :name';


export const _API_DISTRIBUTED_STORAGE = '/distributed';
export const API_DISTRIBUTED_STORAGE = '/api' + _API_DISTRIBUTED_STORAGE;


export const _API_DISTRIBUTED_STORAGE_FIND_ENTITY = '/query/:name';
export const API_DISTRIBUTED_STORAGE_FIND_ENTITY = API_DISTRIBUTED_STORAGE + _API_DISTRIBUTED_STORAGE_FIND_ENTITY;
export const _API_DISTRIBUTED_STORAGE_GET_ENTITY = '/entity/:nodeId/:name/:id';
export const API_DISTRIBUTED_STORAGE_GET_ENTITY = API_DISTRIBUTED_STORAGE + _API_DISTRIBUTED_STORAGE_GET_ENTITY;
export const PERMISSION_ALLOW_ACCESS_DISTRIBUTED_STORAGE_ENTITY = 'allow access distributed storage entity';
export const PERMISSION_ALLOW_ACCESS_DISTRIBUTED_STORAGE_ENTITY_PATTERN = 'allow access distributed storage entity :name';



export const XS_P_URL = '$url';
export const XS_P_LABEL = '$label';

/**
 * TasksController constants
 */
export const _API_TASKS = '/tasks';
export const _API_TASKS_LIST = '/list';
export const API_TASKS_LIST = _API_TASKS + _API_TASKS_LIST;
export const PERMISSION_ALLOW_TASKS_LIST = 'tasks list view';

export const _API_TASKS_METADATA = '/metadata';
export const API_TASKS_METADATA = _API_TASKS + _API_TASKS_METADATA;
export const PERMISSION_ALLOW_TASKS_METADATA = 'task metadata view';

export const _API_TASK_GET_METADATA = '/metadata/:taskName';
export const _API_TASK_GET_METADATA_VALUE = '/metadata/:taskName/provider/:incomingName';
export const API_TASK_GET_METADATA = _API_TASKS + _API_TASK_GET_METADATA;
export const API_TASK_GET_METADATA_VALUE = _API_TASKS + _API_TASK_GET_METADATA_VALUE;
export const PERMISSION_ALLOW_TASK_GET_METADATA = PERMISSION_ALLOW_TASKS_METADATA;
export const PERMISSION_ALLOW_TASK_GET_METADATA_PATTERN = 'task :taskName metadata view';

export const _API_TASK_EXEC = '/exec/:taskName';
export const API_TASK_EXEC = _API_TASKS + _API_TASK_EXEC;
export const PERMISSION_ALLOW_TASK_EXEC = 'task execute';
export const PERMISSION_ALLOW_TASK_EXEC_PATTERN = 'task :taskName execute';

export const _API_TASK_LOG = '/log/:nodeId/:runnerId';
export const API_TASK_LOG = _API_TASKS + _API_TASK_LOG;
export const PERMISSION_ALLOW_TASK_LOG = 'task log view';

export const _API_TASK_STATUS = '/status/:nodeId/:runnerId';
export const API_TASK_STATUS = _API_TASKS + _API_TASK_STATUS;
export const PERMISSION_ALLOW_TASK_STATUS = 'task status view';

export const _API_TASKS_RUNNING = '/running/:nodeId/:runnerId';
export const API_TASK_RUNNING = _API_TASKS + _API_TASKS_RUNNING;
export const PERMISSION_ALLOW_TASK_RUNNING = 'task running view';

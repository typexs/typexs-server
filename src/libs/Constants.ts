export const K_ROUTE_CACHE = 'route_cache';
export const C_DEFAULT = 'default';
export const C_SERVER = 'server';
export const K_CORE_LIB_CONTROLLERS = 'server.controllers';
export const K_META_CONTEXT_ARGS = 'controller.contexts';
export const K_META_PERMISSIONS_ARGS = 'controller.permissions';
export const K_ROUTE_STATIC = 'static_files';
export const K_ROUTE_CONTROLLER = 'routing_controller';
export type ROUTE_TYPE = 'static_files' | 'routing_controller';


export const K_CONFIG_ANONYMOUS_ALLOW = 'config.anonymous.allow';

/**
 * Access key for config key permissions, the logic is
 *
 * config:
 *  permissions:
 *    'key.to.secure':
 *      - 'allow this some stuff'
 */
export const K_CONFIG_PERMISSIONS = 'config.permissions';

export const C_API = 'api';

/**
 * Server status controller links
 */
export const _API_CTRL_SERVER_PING = '/ping';
export const API_CTRL_SERVER_PING = _API_CTRL_SERVER_PING;

export const _API_CTRL_SERVER_STATUS = '/status';
export const API_CTRL_SERVER_STATUS = _API_CTRL_SERVER_STATUS;

// moved from system in 1.0.4 cause this is a server context
// export const PERMISSION_SERVER_ROUTES_VIEW = 'allow routes view';
export const _API_CTRL_SERVER_ROUTES = '/routes';
export const API_CTRL_SERVER_ROUTES = _API_CTRL_SERVER_ROUTES;

export const _API_CTRL_SERVER_CONFIG = '/config';
export const API_CTRL_SERVER_CONFIG = _API_CTRL_SERVER_CONFIG;

export const _API_CTRL_SERVER_CONFIG_KEY = '/config/:key';
export const API_CTRL_SERVER_CONFIG_KEY = _API_CTRL_SERVER_CONFIG_KEY;


/**
 * User
 */
export const DEFAULT_ANONYMOUS = '__DEFAULT_ANONYMOUS__';

/**
 * System
 */
export const _API_CTRL_SYSTEM = '/system';
// export const API_CTRL_SYSTEM = '/api' + _API_CTRL_SYSTEM;


export const PERMISSION_ALLOW_MODULES_VIEW = 'allow modules view';
export const _API_CTRL_SYSTEM_MODULES = '/modules';
export const API_CTRL_SYSTEM_MODULES = _API_CTRL_SYSTEM + _API_CTRL_SYSTEM_MODULES;

// export const PERMISSION_ALLOW_GLOBAL_CONFIG_VIEW = 'allow global config view';
// export const _API_CTRL_SYSTEM_CONFIG = '/config';
// export const API_CTRL_SYSTEM_CONFIG = _API_CTRL_SYSTEM + _API_CTRL_SYSTEM_CONFIG;

export const PERMISSION_ALLOW_STORAGES_VIEW = 'allow storages view';
export const _API_CTRL_SYSTEM_STORAGES = '/storages';
export const API_CTRL_SYSTEM_STORAGES = _API_CTRL_SYSTEM + _API_CTRL_SYSTEM_STORAGES;

export const PERMISSION_ALLOW_RUNTIME_INFO_VIEW = 'allow runtime info view';
export const _API_CTRL_SYSTEM_RUNTIME_INFO = '/info';
export const API_CTRL_SYSTEM_RUNTIME_INFO = _API_CTRL_SYSTEM + _API_CTRL_SYSTEM_RUNTIME_INFO;

export const PERMISSION_ALLOW_RUNTIME_NODE_VIEW = 'allow runtime node view';
export const _API_CTRL_SYSTEM_RUNTIME_NODE = '/node';
export const API_CTRL_SYSTEM_RUNTIME_NODE = _API_CTRL_SYSTEM + _API_CTRL_SYSTEM_RUNTIME_NODE;

export const PERMISSION_ALLOW_RUNTIME_NODES_VIEW = 'allow runtime nodes view';
export const _API_CTRL_SYSTEM_RUNTIME_NODES = '/nodes';
export const API_CTRL_SYSTEM_RUNTIME_NODES = _API_CTRL_SYSTEM + _API_CTRL_SYSTEM_RUNTIME_NODES;

export const PERMISSION_ALLOW_RUNTIME_REMOTE_INFOS_VIEW = 'allow runtime remote infos view';
export const _API_CTRL_SYSTEM_RUNTIME_REMOTE_INFOS = '/remote_infos';
export const API_CTRL_SYSTEM_RUNTIME_REMOTE_INFOS = _API_CTRL_SYSTEM + _API_CTRL_SYSTEM_RUNTIME_REMOTE_INFOS;

export const PERMISSION_ALLOW_WORKERS_INFO = 'list worker information';
export const _API_CTRL_SYSTEM_WORKERS = '/workers';
export const API_CTRL_SYSTEM_WORKERS = _API_CTRL_SYSTEM + _API_CTRL_SYSTEM_WORKERS;


export const PERMISSION_ALLOW_STORAGE_ENTITY_VIEW = 'allow storages entity view';


/**
 * Storage Metadata
 */
export const API_CTRL_STORAGE_PREFIX = '/storage';


export const PERMISSION_ALLOW_ACCESS_STORAGE_METADATA = 'allow access storage metadata';
export const _API_CTRL_STORAGE_METADATA = '/metadata';

export const _API_CTRL_STORAGE_METADATA_ALL_STORES = _API_CTRL_STORAGE_METADATA + '/schemas';
export const API_CTRL_STORAGE_METADATA_ALL_STORES = API_CTRL_STORAGE_PREFIX + _API_CTRL_STORAGE_METADATA_ALL_STORES;

export const _API_CTRL_STORAGE_METADATA_GET_STORE = _API_CTRL_STORAGE_METADATA + '/schema/:name';
export const API_CTRL_STORAGE_METADATA_GET_STORE = API_CTRL_STORAGE_PREFIX + _API_CTRL_STORAGE_METADATA_GET_STORE;

export const _API_CTRL_STORAGE_METADATA_ALL_ENTITIES = _API_CTRL_STORAGE_METADATA + '/entities';
export const API_CTRL_STORAGE_METADATA_ALL_ENTITIES = API_CTRL_STORAGE_PREFIX + _API_CTRL_STORAGE_METADATA_ALL_ENTITIES;

export const _API_CTRL_STORAGE_METADATA_CREATE_ENTITY = _API_CTRL_STORAGE_METADATA + '/entity';
export const API_CTRL_STORAGE_METADATA_CREATE_ENTITY = API_CTRL_STORAGE_PREFIX + _API_CTRL_STORAGE_METADATA_CREATE_ENTITY;

export const _API_CTRL_STORAGE_METADATA_GET_ENTITY = _API_CTRL_STORAGE_METADATA + '/entity/:name';
export const API_CTRL_STORAGE_METADATA_GET_ENTITY = API_CTRL_STORAGE_PREFIX + _API_CTRL_STORAGE_METADATA_GET_ENTITY;

export const _API_CTRL_STORAGE_FIND_ENTITY = '/find/:name';
export const API_CTRL_STORAGE_FIND_ENTITY = API_CTRL_STORAGE_PREFIX + _API_CTRL_STORAGE_FIND_ENTITY;

export const _API_CTRL_STORAGE_AGGREGATE_ENTITY = '/aggregate/:name';
export const API_CTRL_STORAGE_AGGREGATE_ENTITY = API_CTRL_STORAGE_PREFIX + _API_CTRL_STORAGE_AGGREGATE_ENTITY;

export const _API_CTRL_STORAGE_GET_ENTITY = '/entity/:name/:id';
export const API_CTRL_STORAGE_GET_ENTITY = API_CTRL_STORAGE_PREFIX + _API_CTRL_STORAGE_GET_ENTITY;

export const PERMISSION_ALLOW_ACCESS_STORAGE_ENTITY = 'allow access storage entity';
export const PERMISSION_ALLOW_ACCESS_STORAGE_ENTITY_PATTERN = 'allow access storage entity :name';

export const _API_CTRL_STORAGE_SAVE_ENTITY = '/save/:name';
export const API_CTRL_STORAGE_SAVE_ENTITY = API_CTRL_STORAGE_PREFIX + _API_CTRL_STORAGE_SAVE_ENTITY;
export const PERMISSION_ALLOW_SAVE_STORAGE_ENTITY = 'allow save storage entity';
export const PERMISSION_ALLOW_SAVE_STORAGE_ENTITY_PATTERN = 'allow save storage entity :name';

export const _API_CTRL_STORAGE_UPDATE_ENTITY = '/update/:name/:id';
export const API_CTRL_STORAGE_UPDATE_ENTITY = API_CTRL_STORAGE_PREFIX + _API_CTRL_STORAGE_UPDATE_ENTITY;
export const _API_CTRL_STORAGE_UPDATE_ENTITIES_BY_CONDITION = '/update/:name';

export const API_CTRL_STORAGE_UPDATE_ENTITIES_BY_CONDITION = API_CTRL_STORAGE_PREFIX + _API_CTRL_STORAGE_UPDATE_ENTITIES_BY_CONDITION;
export const PERMISSION_ALLOW_UPDATE_STORAGE_ENTITY = 'allow edit storage entity';
export const PERMISSION_ALLOW_UPDATE_STORAGE_ENTITY_PATTERN = 'allow edit storage entity :name';

export const _API_CTRL_STORAGE_DELETE_ENTITY = '/delete/:name/:id';
export const API_CTRL_STORAGE_DELETE_ENTITY = API_CTRL_STORAGE_PREFIX + _API_CTRL_STORAGE_DELETE_ENTITY;

export const _API_CTRL_STORAGE_DELETE_ENTITIES_BY_CONDITION = '/update/:name';
export const API_CTRL_STORAGE_DELETE_ENTITIES_BY_CONDITION = API_CTRL_STORAGE_PREFIX + _API_CTRL_STORAGE_DELETE_ENTITIES_BY_CONDITION;

export const PERMISSION_ALLOW_DELETE_STORAGE_ENTITY = 'allow delete storage entity';
export const PERMISSION_ALLOW_DELETE_STORAGE_ENTITY_PATTERN = 'allow delete storage entity :name';

/**
 * Distributed storage url paths
 */

export const API_CTRL_DISTRIBUTED_STORAGE = '/distributed';

// Get method
export const _API_CTRL_DISTRIBUTED_STORAGE_FIND_ENTITY = '/find/:name';
export const API_CTRL_DISTRIBUTED_STORAGE_FIND_ENTITY =
  API_CTRL_DISTRIBUTED_STORAGE +
  _API_CTRL_DISTRIBUTED_STORAGE_FIND_ENTITY;

// Get method
export const _API_CTRL_DISTRIBUTED_STORAGE_GET_ENTITY = '/entity/:nodeId/:name/:id';
export const API_CTRL_DISTRIBUTED_STORAGE_GET_ENTITY =
  API_CTRL_DISTRIBUTED_STORAGE +
  _API_CTRL_DISTRIBUTED_STORAGE_GET_ENTITY;

export const PERMISSION_ALLOW_DISTRIBUTED_STORAGE_ACCESS_ENTITY = 'allow access distributed storage entity';
export const PERMISSION_ALLOW_DISTRIBUTED_STORAGE_ACCESS_ENTITY_PATTERN = 'allow access distributed storage entity :name';

// Post method
export const _API_CTRL_DISTRIBUTED_STORAGE_SAVE_ENTITY = '/save/:nodeId/:name';
export const API_CTRL_DISTRIBUTED_STORAGE_SAVE_ENTITY =
  API_CTRL_DISTRIBUTED_STORAGE +
  _API_CTRL_DISTRIBUTED_STORAGE_SAVE_ENTITY;

export const PERMISSION_ALLOW_DISTRIBUTED_STORAGE_SAVE_ENTITY = 'allow save distributed storage entity';
export const PERMISSION_ALLOW_DISTRIBUTED_STORAGE_SAVE_ENTITY_PATTERN = 'allow save distributed storage entity :name';

// Post method
export const _API_CTRL_DISTRIBUTED_STORAGE_UPDATE_ENTITY = '/update/:nodeId/:name/:id';
export const API_CTRL_DISTRIBUTED_STORAGE_UPDATE_ENTITY =
  API_CTRL_DISTRIBUTED_STORAGE +
  _API_CTRL_DISTRIBUTED_STORAGE_UPDATE_ENTITY;

// Put method
export const _API_CTRL_DISTRIBUTED_STORAGE_UPDATE_ENTITIES_BY_CONDITION = '/update/:nodeId/:name';
export const API_CTRL_DISTRIBUTED_STORAGE_UPDATE_ENTITIES_BY_CONDITION =
  API_CTRL_DISTRIBUTED_STORAGE +
  _API_CTRL_DISTRIBUTED_STORAGE_UPDATE_ENTITIES_BY_CONDITION;

export const PERMISSION_ALLOW_DISTRIBUTED_STORAGE_UPDATE_ENTITY = 'allow update distributed storage entity';
export const PERMISSION_ALLOW_DISTRIBUTED_STORAGE_UPDATE_ENTITY_PATTERN = 'allow update distributed storage entity :name';


// Delete method
export const _API_CTRL_DISTRIBUTED_STORAGE_DELETE_ENTITY = '/delete/:nodeId/:name/:id';
export const API_CTRL_DISTRIBUTED_STORAGE_DELETE_ENTITY =
  API_CTRL_DISTRIBUTED_STORAGE +
  _API_CTRL_DISTRIBUTED_STORAGE_DELETE_ENTITY;

export const _API_CTRL_DISTRIBUTED_STORAGE_DELETE_ENTITIES_BY_CONDITION = '/delete/:nodeId/:name';
export const API_CTRL_DISTRIBUTED_STORAGE_DELETE_ENTITIES_BY_CONDITION =
  API_CTRL_DISTRIBUTED_STORAGE +
  _API_CTRL_DISTRIBUTED_STORAGE_DELETE_ENTITIES_BY_CONDITION;

export const PERMISSION_ALLOW_DISTRIBUTED_STORAGE_DELETE_ENTITY = 'allow delete distributed storage entity';
export const PERMISSION_ALLOW_DISTRIBUTED_STORAGE_DELETE_ENTITY_PATTERN = 'allow delete distributed storage entity :name';


export const XS_P_$URL = '$url';
export const XS_P_$LABEL = '$label';

/**
 * TasksController constants
 */
export const _API_CTRL_TASKS = '/tasks';
export const _API_CTRL_TASKS_LIST = '/list';
export const API_CTRL_TASKS_LIST = _API_CTRL_TASKS + _API_CTRL_TASKS_LIST;
export const PERMISSION_ALLOW_TASKS_LIST = 'tasks list view';

export const _API_CTRL_TASKS_METADATA = '/metadata';
export const API_CTRL_TASKS_METADATA = _API_CTRL_TASKS + _API_CTRL_TASKS_METADATA;
export const PERMISSION_ALLOW_TASKS_METADATA = 'task metadata view';

export const _API_CTRL_TASK_GET_METADATA = '/metadata/:taskName';
export const _API_CTRL_TASK_GET_METADATA_VALUE = '/metadata/:taskName/provider/:incomingName';
export const API_CTRL_TASK_GET_METADATA = _API_CTRL_TASKS + _API_CTRL_TASK_GET_METADATA;
export const API_CTRL_TASK_GET_METADATA_VALUE = _API_CTRL_TASKS + _API_CTRL_TASK_GET_METADATA_VALUE;
export const PERMISSION_ALLOW_TASK_GET_METADATA = PERMISSION_ALLOW_TASKS_METADATA;
export const PERMISSION_ALLOW_TASK_GET_METADATA_PATTERN = 'task :taskName metadata view';

export const _API_CTRL_TASK_EXEC = '/exec/:taskName';
export const API_CTRL_TASK_EXEC = _API_CTRL_TASKS + _API_CTRL_TASK_EXEC;
export const PERMISSION_ALLOW_TASK_EXEC = 'task execute';
export const PERMISSION_ALLOW_TASK_EXEC_PATTERN = 'task :taskName execute';

export const _API_CTRL_TASK_LOG = '/log/:nodeId/:runnerId';
export const API_CTRL_TASK_LOG = _API_CTRL_TASKS + _API_CTRL_TASK_LOG;
export const PERMISSION_ALLOW_TASK_LOG = 'task log view';

export const _API_CTRL_TASK_STATUS = '/status/:runnerId';
export const API_CTRL_TASK_STATUS = _API_CTRL_TASKS + _API_CTRL_TASK_STATUS;
export const PERMISSION_ALLOW_TASK_STATUS = 'task status view';

export const _API_CTRL_TASK_RUNNING = '/running/:nodeId';
export const API_CTRL_TASK_RUNNING = _API_CTRL_TASKS + _API_CTRL_TASK_RUNNING;
export const PERMISSION_ALLOW_TASK_RUNNING = 'task running view';

export const _API_CTRL_TASKS_RUNNING = '/running';
export const API_CTRL_TASKS_RUNNING = _API_CTRL_TASKS + _API_CTRL_TASKS_RUNNING;

export const PERMISSION_ALLOW_TASK_RUNNER_INFO_VIEW = 'task runners view';
export const _API_CTRL_TASKS_RUNNERS_INFO = '/runners';
export const API_CTRL_TASKS_RUNNERS_INFO = _API_CTRL_TASKS + _API_CTRL_TASKS_RUNNERS_INFO;

export const _API_CTRL_TASKS_RUNNING_ON_NODE = '/running_tasks/:nodeId';
export const API_CTRL_TASKS_RUNNING_ON_NODE = _API_CTRL_TASKS + _API_CTRL_TASKS_RUNNING_ON_NODE;
export const PERMISSION_ALLOW_TASKS_RUNNING = 'task running_tasks view';


/**
 * File System
 */
export const API_CTRL_FILESYSTEM = '/fs';

export const _API_CTRL_FILESYSTEM_READ = '/read';
export const API_CTRL_FILESYSTEM_READ = API_CTRL_FILESYSTEM + _API_CTRL_FILESYSTEM_READ;

export const PERMISSION_ACCESS_FILES = 'access files';

export const PERMISSION_ACCESS_FILE_PATH = 'access files on :path';


/**
 * Registry constants
 */
export const API_CTRL_REGISTRY = '/registry';

export const PERMISSION_ALLOW_ACCESS_REGISTRY_NAMESPACES = 'allow list registry namespaces';
export const _API_CTRL_REGISTRY_NAMESPACES = '/list/namespaces';
export const API_CTRL_REGISTRY_NAMESPACES = API_CTRL_REGISTRY + _API_CTRL_REGISTRY_NAMESPACES;

export const PERMISSION_ALLOW_ACCESS_REGISTRY_ENTITY_REFS = 'allow access registry entity-refs';
export const PERMISSION_ALLOW_ACCESS_REGISTRY_ENTITY_REFS_BY_NAMESPACE = 'allow access registry :namespace entity-refs';
export const _API_CTRL_REGISTRY_DATA = '/:namespace/entity-refs';
export const API_CTRL_REGISTRY_DATA = API_CTRL_REGISTRY + _API_CTRL_REGISTRY_DATA;

export const PERMISSION_ALLOW_ACCESS_REGISTRY_SCHEMAS = 'allow list registry schemas';
export const _API_CTRL_REGISTRY_SCHEMAS = '/list/schemas';
export const API_CTRL_REGISTRY_SCHEMAS = API_CTRL_REGISTRY + _API_CTRL_REGISTRY_SCHEMAS;

export const _API_CTRL_REGISTRY_SCHEMA = '/:namespace/schema-ref/:schema';
export const API_CTRL_REGISTRY_SCHEMA = API_CTRL_REGISTRY + _API_CTRL_REGISTRY_SCHEMA;

export const _API_CTRL_REGISTRY_ENTITY = '/:namespace/entity-ref/:entity';
export const API_CTRL_REGISTRY_ENTITY = API_CTRL_REGISTRY + _API_CTRL_REGISTRY_ENTITY;

import * as _ from 'lodash';
import {CurrentUser, Get, JsonController} from 'routing-controllers';
import {
  _API_CTRL_SERVER_CONFIG,
  _API_CTRL_SERVER_CONFIG_KEY,
  _API_CTRL_SERVER_PING,
  _API_CTRL_SERVER_ROUTES,
  _API_CTRL_SERVER_STATUS,
  C_API,
  DEFAULT_ANONYMOUS,
  K_CONFIG_ANONYMOUS_ALLOW,
  K_CONFIG_PERMISSIONS
} from '../libs/Constants';
import {ContextGroup} from '../decorators/ContextGroup';
import {Config, Inject, Invoker, System} from '@typexs/base';
import {IRolesHolder, PermissionHelper} from '@typexs/roles-api/index';
import {ClassLoader, WalkValues} from 'commons-base/index';
import {ServerStatusApi} from '../api/ServerStatus.api';
import {C_CONFIG_FILTER_KEYS} from '@typexs/base/browser';
import {ForbiddenError, Param} from 'routing-controllers/index';
import {ServerRegistry} from '../libs/server/ServerRegistry';
import {Helper} from '../libs/Helper';
import {IRoute} from '../libs/server/IRoute';

@ContextGroup(C_API)
@JsonController()
export class ServerStatusAPIController {

  @Inject(System.NAME)
  system: System;

  @Inject(Invoker.NAME)
  invoker: Invoker;

  @Inject(ServerRegistry.NAME)
  serverRegistry: ServerRegistry;

  private static isAnonymous(user: any) {
    return !user || (_.isString(user) && user === DEFAULT_ANONYMOUS);
  }

  /**
   * Ping for server time
   */
  @Get(_API_CTRL_SERVER_PING)
  ping(): any {
    return {time: new Date()};
  }


  @Get(_API_CTRL_SERVER_STATUS)
  async status(@CurrentUser() user: any) {
    const nodeId = _.get(this.system, 'node.nodeId', null);
    const status: any = {
      time: new Date(),
      nodeId: nodeId,
    };
    await this.invoker.use(ServerStatusApi).prepareServerStatus(status, user);
    return status;
  }


  /**
   * Listen for route defined in _API_CTRL_SERVER_CONFIG and return the full configuration if allowed
   *
   * @param user
   */
  @Get(_API_CTRL_SERVER_CONFIG)
  getFullConfig(@CurrentUser() user?: any) {
    return this.getConfig(null, user);
  }

  /**
   * Listen for route defined in _API_CTRL_SERVER_CONFIG with additional key parameter and
   * return the configuration defined under key if allowed
   *
   * @param key
   * @param user
   */
  @Get(_API_CTRL_SERVER_CONFIG_KEY)
  async getConfig(@Param('key') key?: string, @CurrentUser() user?: any) {
    const permissionsCheck = !ServerStatusAPIController.isAnonymous(user);
    let userPermissions = user && user.getRoles ? PermissionHelper.getPermissionFromRoles(user.getRoles()) : [];
    // config key => permission
    // TODO cache results for permissions combination
    const configPermissions = Config.get(K_CONFIG_PERMISSIONS, {});
    // verify if anonymous and allowed
    if (!permissionsCheck) {
      const allowed = Config.get(K_CONFIG_ANONYMOUS_ALLOW, false);
      if (!allowed) {
        throw new ForbiddenError('Access not allowed');
      }
      userPermissions = ['*'];
    }

    // check if key allowed
    const filterKeys = this.getFilterKeys();
    const _orgCfg = key ? Config.get(key) : Config.get();
    const cfg = _.cloneDeepWith(_orgCfg);

    await Helper.walk(cfg, async (x: WalkValues) => {
      // TODO make this list configurable! system.info.hide.keys!
      if (_.isString(x.key)) {
        const path = !!key ? [key, ...x.location].join('.') : x.location.join('.');
        if (filterKeys.indexOf(x.key) !== -1 || filterKeys.indexOf(path) !== -1) {
          delete x.parent[x.key];
          return;
        } else {
          const cfgPermission = configPermissions[path];
          const hasPermissions = !!cfgPermission && !_.isEmpty(cfgPermission);
          if (hasPermissions) {
            if (!_.isEmpty(userPermissions)) {
              if (_.isArray(cfgPermission)) {
                if (!await PermissionHelper.checkPermissions(userPermissions, cfgPermission)) {
                  delete x.parent[x.key];
                  return;
                }
              } else if (_.isString(cfgPermission)) {
                if (!await PermissionHelper.checkPermission(userPermissions, cfgPermission)) {
                  delete x.parent[x.key];
                  return;
                }
              }
            } else {
              delete x.parent[x.key];
              return;
            }
          }
        }
      }
      if (_.isFunction(x.value)) {
        if (_.isArray(x.parent)) {
          x.parent[x.index] = ClassLoader.getClassName(x.value);
        } else {
          x.parent[x.key] = ClassLoader.getClassName(x.value);
        }
      }
    });
    this.invoker.use(ServerStatusApi).prepareConfig(cfg, user);
    return cfg;
  }


  @Get(_API_CTRL_SERVER_ROUTES)
  async listRoutes(@CurrentUser() user: IRolesHolder): Promise<IRoute[]> {
    // if null and userchecker not configured then list all, else check if user has permissions
    const permissionsCheck = !ServerStatusAPIController.isAnonymous(user);
    const userPermissions = user && user.getRoles ? PermissionHelper.getPermissionFromRoles(user.getRoles()) : [];
    const routes: IRoute[] = [];
    const instanceNames = this.serverRegistry.getInstanceNames();
    for (const instanceName of instanceNames) {
      const instance = this.serverRegistry.get(instanceName);
      const instanceRoutes = instance.getRoutes();
      for (const _route of instanceRoutes) {
        const hasPermissions = _route.permissions && !_.isEmpty(_route.permissions);
        if (permissionsCheck && hasPermissions) {

          if (!_.isEmpty(userPermissions)) {
            if (_.isArray(_route.permissions) && await PermissionHelper.checkPermissions(userPermissions, _route.permissions)) {
              routes.push(_route);
            } else if (_.isString(_route.permissions) && await PermissionHelper.checkPermission(userPermissions, _route.permissions)) {
              routes.push(_route);
            }
          }
        } else {
          routes.push(_route);
        }
      }
    }
    this.invoker.use(ServerStatusApi).prepareRoutes(routes, user);
    return routes;
  }


  private getFilterKeys(): string[] {
    // TODO cache this!
    let filterKeys = C_CONFIG_FILTER_KEYS; // get them from base/ConfigUtils
    const res: string[][] = <string[][]><any>this.invoker.use(ServerStatusApi).filterConfigKeys();
    if (res && _.isArray(res)) {
      filterKeys = _.uniq(_.concat(filterKeys, ...res.filter(x => _.isArray(x))).filter(x => !_.isEmpty(x)));
    }
    return filterKeys;
  }
}
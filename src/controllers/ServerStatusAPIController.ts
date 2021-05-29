import * as _ from 'lodash';
import {CurrentUser, ForbiddenError, Get, JsonController, Param} from 'routing-controllers';
import {
  _API_CTRL_SERVER_CONFIG,
  _API_CTRL_SERVER_CONFIG_KEY,
  _API_CTRL_SERVER_PING,
  _API_CTRL_SERVER_ROUTES,
  _API_CTRL_SERVER_STATUS,
  C_API,
  K_CONFIG_ANONYMOUS_ALLOW,
  K_CONFIG_PERMISSIONS
} from '../libs/Constants';
import {ContextGroup} from '../decorators/ContextGroup';
import {C_CONFIG_FILTER_KEYS, Config, Inject, Invoker, System} from '@typexs/base';
import {IRolesHolder, PermissionHelper} from '@typexs/roles-api';
import {ClassLoader} from '@allgemein/base';
import {ServerStatusApi} from '../api/ServerStatus.api';
import {ServerRegistry} from '../libs/server/ServerRegistry';
import {Helper, WalkValues} from '../libs/Helper';
import {IRoute} from '../libs/server/IRoute';
import {ServerUtils} from '../libs/server/ServerUtils';


@ContextGroup(C_API)
@JsonController()
export class ServerStatusAPIController {

  @Inject(System.NAME)
  system: System;

  @Inject(Invoker.NAME)
  invoker: Invoker;

  @Inject(ServerRegistry.NAME)
  serverRegistry: ServerRegistry;


  /**
   * Ping for server time
   */
  @Get(_API_CTRL_SERVER_PING)
  ping(): any {
    return {time: new Date()};
  }


  @Get(_API_CTRL_SERVER_STATUS)
  async status(@CurrentUser() user: IRolesHolder) {
    const nodeId = _.get(this.system, 'node.nodeId', null);
    const status: any = {
      time: new Date(),
      nodeId: nodeId,
    };

    // if (ServerUtils.hasPermissionCheck(user) && user) {
    //   const perms = PermissionHelper.getPermissionFromRoles(user.getRoles());
    //   // if()
    // }

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
    const permissionsCheck = ServerUtils.hasPermissionCheck(user);
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
                if (!await PermissionHelper.checkOnePermission(userPermissions, cfgPermission)) {
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
    const permissionsCheck = ServerUtils.hasPermissionCheck(user);
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
            // use reverse check up
            let routePermissions = !_.isArray(_route.permissions) ? [_route.permissions] : _route.permissions;
            routePermissions = routePermissions.map(x => x.replace(/:[^\s]+/g, ' * ').replace(/\s{2,}/g, ' ').trim());
            if (await PermissionHelper.checkOnePermission(userPermissions, routePermissions)) {
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

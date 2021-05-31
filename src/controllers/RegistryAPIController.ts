import {isEmpty} from 'lodash';
import {Get, JsonController, NotFoundError, Param, QueryParam} from 'routing-controllers';
import {
  _API_CTRL_REGISTRY_DATA,
  _API_CTRL_REGISTRY_ENTITY,
  _API_CTRL_REGISTRY_NAMESPACES,
  _API_CTRL_REGISTRY_SCHEMA,
  _API_CTRL_REGISTRY_SCHEMAS,
  API_CTRL_REGISTRY,
  C_API,
  PERMISSION_ALLOW_ACCESS_REGISTRY_ENTITY_REFS,
  PERMISSION_ALLOW_ACCESS_REGISTRY_ENTITY_REFS_BY_NAMESPACE,
  PERMISSION_ALLOW_ACCESS_REGISTRY_NAMESPACES,
  PERMISSION_ALLOW_ACCESS_REGISTRY_SCHEMAS
} from '../libs/Constants';
import {ContextGroup} from '../decorators/ContextGroup';
import {IJsonSchemaSerializeOptions, JsonSchema, RegistryFactory, supportsJsonSchemaExport} from '@allgemein/schema-api';
import {Access} from '../decorators/Access';

@ContextGroup(C_API)
@JsonController(API_CTRL_REGISTRY)
export class RegistryAPIController {


  /**
   * Return the existing namespaces
   */
  @Access(PERMISSION_ALLOW_ACCESS_REGISTRY_NAMESPACES)
  @Get(_API_CTRL_REGISTRY_NAMESPACES)
  getNamespaces(): string[] {
    return RegistryFactory.getNamespaces();
  }

  /**
   * Return the data of a registry
   */
  @Access([
    PERMISSION_ALLOW_ACCESS_REGISTRY_ENTITY_REFS,
    PERMISSION_ALLOW_ACCESS_REGISTRY_ENTITY_REFS_BY_NAMESPACE
  ])
  @Get(_API_CTRL_REGISTRY_DATA)
  getRegistry(@Param('namespace') namespace: string,
              @QueryParam('options') options?: IJsonSchemaSerializeOptions): any {
    const registry = RegistryFactory.get(namespace);
    options = options || {};
    if (supportsJsonSchemaExport(registry)) {
      return registry.toJsonSchema(options);
    } else {
      const serializer = JsonSchema.getSerializer(options);
      for (const entityRef of registry.getEntityRefs()) {
        serializer.serialize(entityRef);
      }
      return serializer.getJsonSchema();
    }
  }

  @Access(PERMISSION_ALLOW_ACCESS_REGISTRY_SCHEMAS)
  @Get(_API_CTRL_REGISTRY_SCHEMAS)
  getRegistrySchemas(): any {
    const data = [];
    for (const namespace of RegistryFactory.getNamespaces()) {
      const registry = RegistryFactory.get(namespace);
      let schemaRefs: any[] = [];
      try {
        schemaRefs = registry.getSchemaRefs();
      } catch (e) {
        schemaRefs = [];
      }
      let schemaNames = schemaRefs.map((value, index) => value.name);
      if (isEmpty(schemaNames)) {
        schemaNames = [];
      }
      data.push({
        registry: namespace,
        schemas: schemaNames
      });
    }
    return data;
  }


  @Access([
    PERMISSION_ALLOW_ACCESS_REGISTRY_ENTITY_REFS,
    PERMISSION_ALLOW_ACCESS_REGISTRY_ENTITY_REFS_BY_NAMESPACE
  ])
  @Get(_API_CTRL_REGISTRY_SCHEMA)
  getRegistrySchema(@Param('namespace') namespace: string,
                    @Param('schema') schemaName: string,
                    @QueryParam('options') options?: IJsonSchemaSerializeOptions): any {
    const registry = RegistryFactory.get(namespace);
    if (isEmpty(schemaName)) {
      const serializer = JsonSchema.getSerializer(options);
      for (const entityRef of registry.getEntityRefs()) {
        serializer.serialize(entityRef);
      }
      return serializer.getJsonSchema();
    } else {
      const schemaRef = registry.getSchemaRefs().find(x => x.name === schemaName);
      if (schemaRef) {
        const serializer = JsonSchema.getSerializer(options);
        for (const entityRef of schemaRef.getEntityRefs()) {
          serializer.serialize(entityRef);
        }
        return serializer.getJsonSchema();
      }
    }
    throw new NotFoundError('no entities found in registry ' + namespace + ' with schema ' + schemaName);
  }

  @Access([
    PERMISSION_ALLOW_ACCESS_REGISTRY_ENTITY_REFS,
    PERMISSION_ALLOW_ACCESS_REGISTRY_ENTITY_REFS_BY_NAMESPACE
  ])
  @Get(_API_CTRL_REGISTRY_ENTITY)
  getRegistryEntity(@Param('namespace') namespace: string,
                    @Param('entity') entityName: string,
                    @QueryParam('options') options?: IJsonSchemaSerializeOptions): any {
    const entityRef = RegistryFactory.get(namespace).getEntityRefFor(entityName);
    if (entityRef) {
      if (supportsJsonSchemaExport(entityRef)) {
        return entityRef.toJsonSchema(options);
      } else {
        return JsonSchema.serialize(entityRef, options);
      }
    }
    throw new NotFoundError('no entity of name ' + entityName + ' found in registry ' + namespace);
  }

}

import { Injectable } from '@angular/core';
import * as jsyaml from 'js-yaml';
import { generateId } from '../utils/id-generator';
import type {
  ApiInfo,
  Entity,
  GlobalSecurity,
  Operation,
  OperationParameter,
  OperationResponse,
  Path,
  RequestBody,
  Response,
  Schema,
  SchemaProperty,
  SecurityScheme,
  Server,
  WizardState,
} from '../models/openapi.model';
import { createEmptyState } from '../constants/templates';
import { DEFAULT_GLOBAL_SECURITY, DEFAULT_SECURITY_SCHEMES } from '../constants/default-security';
import { GENERIC_ERROR_RESPONSES } from '../constants/default-responses';

@Injectable({ providedIn: 'root' })
export class YamlImportService {
  import(yamlContent: string): WizardState {
    const doc = jsyaml.load(yamlContent) as Record<string, unknown>;

    if (!doc || typeof doc !== 'object') {
      throw new Error('Invalid YAML document');
    }

    const state = createEmptyState();

    state.info = this.parseInfo(doc['info'] as Record<string, unknown> | undefined);
    state.servers = this.parseServers(doc['servers'] as Array<Record<string, unknown>> | undefined);
    state.globalSecurity = this.parseGlobalSecurity(
      doc['security'] as Array<Record<string, unknown>> | undefined,
    );

    const components = (doc['components'] ?? {}) as Record<string, unknown>;

    state.securitySchemes = this.parseSecuritySchemes(
      components['securitySchemes'] as Record<string, Record<string, unknown>> | undefined,
    );

    state.responses = this.parseResponses(
      components['responses'] as Record<string, Record<string, unknown>> | undefined,
    );

    state.requestBodies = this.parseRequestBodies(
      components['requestBodies'] as Record<string, Record<string, unknown>> | undefined,
    );

    state.schemas = this.parseSchemas(
      components['schemas'] as Record<string, Record<string, unknown>> | undefined,
    );

    state.paths = this.parsePaths(
      doc['paths'] as Record<string, Record<string, unknown>> | undefined,
    );

    state.entities = this.schemasToEntities(state.schemas);
    state.currentStep = 1;

    return state;
  }

  private schemasToEntities(schemas: Schema[]): Entity[] {
    const excludedNames = new Set(['Problem', 'Error', 'ErrorResponse', 'ProblemDetail']);

    return schemas
      .filter((schema) => {
        const name = schema.name;
        if (excludedNames.has(name)) return false;
        if (schema.properties.length === 0) return false;
        return true;
      })
      .map((schema) => {
        const idField = this.inferIdField(schema.properties);
        const path = this.toKebabCase(schema.name);

        // Add id field at the beginning if not present
        const properties = [...schema.properties];
        if (!idField) {
          const idProperty: SchemaProperty = {
            id: generateId(),
            name: 'id',
            type: 'integer',
            format: 'int64',
            description: `Identificador único de ${schema.name}`,
            example: '',
            minimum: '',
            maximum: '',
            pattern: '',
            required: true,
            ref: '',
            enumValues: [],
            nullable: false,
            maxLength: '',
          };
          properties.unshift(idProperty);
        }

        return {
          id: generateId(),
          name: schema.name,
          tableName: this.toSnakeCase(schema.name).toUpperCase(),
          path: `/${path}`,
          description: schema.description,
          idField: idField || 'id',
          pkComment: idField
            ? `Identificador único de ${schema.name}`
            : `Identificador único de ${schema.name}`,
          generateCrud: false,
          properties: properties.map((p) => ({ ...p, id: generateId() })),
        };
      });
  }

  private inferIdField(properties: SchemaProperty[]): string {
    const idProps = properties.filter(
      (p) =>
        p.type === 'integer' &&
        (p.name.toLowerCase() === 'id' ||
          p.name.toLowerCase().endsWith('id') ||
          p.name.toLowerCase().startsWith('id')),
    );

    if (idProps.length === 1) return idProps[0].name;
    if (idProps.length > 1) {
      const pkProp = idProps.find(
        (p) => p.name.toLowerCase().endsWith('id') && !p.name.toLowerCase().startsWith('id'),
      );
      if (pkProp) return pkProp.name;
      return idProps[0].name;
    }

    return '';
  }

  private toKebabCase(str: string): string {
    return str
      .replace(/([a-z])([A-Z])/g, '$1-$2')
      .replace(/[\s_]+/g, '-')
      .toLowerCase();
  }

  private toSnakeCase(str: string): string {
    return str
      .replace(/([a-z])([A-Z])/g, '$1_$2')
      .replace(/[\s-]+/g, '_')
      .toLowerCase();
  }

  private parseInfo(raw: Record<string, unknown> | undefined): ApiInfo {
    if (!raw) {
      return {
        title: '',
        description: '',
        version: '',
        termsOfService: '',
        contact: { name: '', email: '', url: '' },
        license: { name: '', url: '' },
      };
    }
    const contact = (raw['contact'] ?? {}) as Record<string, unknown>;
    const license = (raw['license'] ?? {}) as Record<string, unknown>;
    return {
      title: String(raw['title'] ?? ''),
      description: String(raw['description'] ?? ''),
      version: String(raw['version'] ?? ''),
      termsOfService: String(raw['termsOfService'] ?? ''),
      contact: {
        name: String(contact['name'] ?? ''),
        email: String(contact['email'] ?? ''),
        url: String(contact['url'] ?? ''),
      },
      license: {
        name: String(license['name'] ?? ''),
        url: String(license['url'] ?? ''),
      },
    };
  }

  private parseServers(raw: Array<Record<string, unknown>> | undefined): Server[] {
    if (!raw || !Array.isArray(raw)) return [];
    return raw.map((s) => ({
      id: generateId(),
      url: String(s['url'] ?? ''),
      description: String(s['description'] ?? ''),
    }));
  }

  private parseGlobalSecurity(raw: Array<Record<string, unknown>> | undefined): GlobalSecurity[] {
    if (!raw || !Array.isArray(raw)) {
      return DEFAULT_GLOBAL_SECURITY.map((gs) => ({ ...gs, id: generateId() }));
    }
    return raw.map((item) => {
      const name = Object.keys(item)[0] ?? '';
      const scopesVal = item[name];
      const scopes = Array.isArray(scopesVal) ? scopesVal.join(', ') : String(scopesVal ?? '');
      return { id: generateId(), name, scopes };
    });
  }

  private parseSecuritySchemes(
    raw: Record<string, Record<string, unknown>> | undefined,
  ): SecurityScheme[] {
    if (!raw) {
      return DEFAULT_SECURITY_SCHEMES.map((ss) => ({ ...ss, id: generateId() }));
    }

    return Object.entries(raw).map(([name, scheme]) => {
      const type = String(scheme['type'] ?? 'apiKey');
      const result: SecurityScheme = {
        id: generateId(),
        name,
        type,
        in: '',
        keyName: '',
        scheme: '',
        bearerFormat: '',
        flowType: 'clientCredentials',
        tokenUrl: '',
        authorizationUrl: '',
        scopes: [],
        openIdConnectUrl: '',
      };

      if (type === 'apiKey') {
        result.in = String(scheme['in'] ?? 'header');
        result.keyName = String(scheme['name'] ?? name);
      } else if (type === 'http') {
        result.scheme = String(scheme['scheme'] ?? '');
        result.bearerFormat = String(scheme['bearerFormat'] ?? '');
      } else if (type === 'oauth2') {
        const flows = (scheme['flows'] ?? {}) as Record<string, Record<string, unknown>>;
        const flowType = Object.keys(flows)[0] ?? 'clientCredentials';
        const flow = flows[flowType] ?? {};
        result.flowType = flowType;
        result.tokenUrl = String(flow['tokenUrl'] ?? '');
        result.authorizationUrl = String(flow['authorizationUrl'] ?? '');
        const rawScopes = (flow['scopes'] ?? {}) as Record<string, string>;
        result.scopes = Object.entries(rawScopes).map(([sn, sd]) => ({
          name: sn,
          description: String(sd ?? ''),
        }));
      } else if (type === 'openIdConnect') {
        result.openIdConnectUrl = String(scheme['openIdConnectUrl'] ?? '');
      }

      return result;
    });
  }

  private parseResponses(raw: Record<string, Record<string, unknown>> | undefined): Response[] {
    if (!raw) {
      return this.buildGenericResponses();
    }

    const responses: Response[] = [];

    for (const [name, resp] of Object.entries(raw)) {
      const description = String(resp['description'] ?? '');
      const content = (resp['content'] ?? {}) as Record<string, Record<string, unknown>>;
      const contentType = Object.keys(content)[0] ?? 'application/json';
      const mediaType = content[contentType] ?? {};
      const schemaObj = (mediaType['schema'] ?? {}) as Record<string, unknown>;
      const schemaRef = String(schemaObj['$ref'] ?? '');

      const examples: Array<{ name: string; value: string }> = [];
      const rawExamples = (mediaType['examples'] ?? {}) as Record<string, Record<string, unknown>>;
      for (const [exName, exVal] of Object.entries(rawExamples)) {
        const value = exVal['value'];
        examples.push({
          name: exName,
          value: typeof value === 'string' ? value : JSON.stringify(value, null, 2),
        });
      }

      responses.push({
        id: generateId(),
        name,
        description,
        schemaRef,
        contentType,
        examples,
      });
    }

    for (const generic of GENERIC_ERROR_RESPONSES) {
      if (!responses.some((r) => r.name === generic.name)) {
        responses.push({
          id: generateId(),
          name: generic.name,
          description: generic.description,
          schemaRef: '#/components/schemas/Problem',
          contentType: 'application/json',
          examples: [
            {
              name: `'${generic.code}'`,
              value: JSON.stringify({
                type: generic.typeUri,
                status: Number(generic.code),
                title: generic.title,
                detail: generic.detail,
                instance: `https://api.example.com/problems/${generic.code}`,
              }),
            },
          ],
        });
      }
    }

    return responses;
  }

  private buildGenericResponses(): Response[] {
    return GENERIC_ERROR_RESPONSES.map((def) => ({
      id: generateId(),
      name: def.name,
      description: def.description,
      schemaRef: '#/components/schemas/Problem',
      contentType: 'application/json',
      examples: [
        {
          name: `'${def.code}'`,
          value: JSON.stringify({
            type: def.typeUri,
            status: Number(def.code),
            title: def.title,
            detail: def.detail,
            instance: `https://api.example.com/problems/${def.code}`,
          }),
        },
      ],
    }));
  }

  private parseRequestBodies(
    raw: Record<string, Record<string, unknown>> | undefined,
  ): RequestBody[] {
    if (!raw) return [];

    return Object.entries(raw).map(([name, body]) => {
      const description = String(body['description'] ?? '');
      const required = Boolean(body['required'] ?? false);
      const content = (body['content'] ?? {}) as Record<string, Record<string, unknown>>;
      const contentType = Object.keys(content)[0] ?? 'application/json';
      const mediaType = content[contentType] ?? {};
      const schemaObj = (mediaType['schema'] ?? {}) as Record<string, unknown>;
      const schemaRef = String(schemaObj['$ref'] ?? '');

      const examples: Array<{ name: string; summary: string; value: string }> = [];
      const rawExamples = (mediaType['examples'] ?? {}) as Record<string, Record<string, unknown>>;
      for (const [exName, exVal] of Object.entries(rawExamples)) {
        const value = exVal['value'];
        examples.push({
          name: exName,
          summary: String(exVal['summary'] ?? ''),
          value: typeof value === 'string' ? value : JSON.stringify(value, null, 2),
        });
      }

      return {
        id: generateId(),
        name,
        description,
        schemaRef,
        contentType,
        required,
        examples,
      };
    });
  }

  private parseSchemas(raw: Record<string, Record<string, unknown>> | undefined): Schema[] {
    if (!raw) return [];

    return Object.entries(raw).map(([name, schema]) => {
      const description = String(schema['description'] ?? '');
      const additionalProperties = schema['additionalProperties'] === false ? false : null;
      const requiredFields = new Set(((schema['required'] as string[]) ?? []).map(String));

      const rawProps = (schema['properties'] ?? {}) as Record<string, Record<string, unknown>>;
      const properties: SchemaProperty[] = Object.entries(rawProps).map(([propName, prop]) =>
        this.parseSchemaProperty(propName, prop, requiredFields),
      );

      return {
        id: generateId(),
        name,
        description,
        additionalProperties,
        properties,
      };
    });
  }

  private parseSchemaProperty(
    name: string,
    raw: Record<string, unknown>,
    requiredFields: Set<string>,
  ): SchemaProperty {
    const ref = String(raw['$ref'] ?? '');
    const type = ref ? 'object' : String(raw['type'] ?? 'string');
    const format = String(raw['format'] ?? '');
    const description = String(raw['description'] ?? '');
    const example = raw['example'] !== undefined ? String(raw['example']) : '';
    const minimum = raw['minimum'] !== undefined ? String(raw['minimum']) : '';
    const maximum = raw['maximum'] !== undefined ? String(raw['maximum']) : '';
    const pattern = String(raw['pattern'] ?? '');
    const nullable = Boolean(raw['nullable'] ?? false);
    const maxLength = raw['maxLength'] !== undefined ? String(raw['maxLength']) : '';
    const enumValues = Array.isArray(raw['enum']) ? raw['enum'].map(String) : [];

    return {
      id: generateId(),
      name,
      type,
      format,
      description,
      example,
      minimum,
      maximum,
      pattern,
      required: requiredFields.has(name),
      ref,
      enumValues,
      nullable,
      maxLength,
    };
  }

  private parsePaths(raw: Record<string, Record<string, unknown>> | undefined): Path[] {
    if (!raw) return [];

    const httpMethods = new Set([
      'get',
      'post',
      'put',
      'patch',
      'delete',
      'options',
      'head',
      'trace',
    ]);

    return Object.entries(raw).map(([pathStr, pathItem]) => {
      const operations: Operation[] = [];

      for (const [method, opRaw] of Object.entries(pathItem)) {
        if (!httpMethods.has(method)) continue;
        const op = opRaw as Record<string, unknown>;
        operations.push(this.parseOperation(method, op));
      }

      return {
        id: generateId(),
        path: pathStr,
        operations,
      };
    });
  }

  private parseOperation(method: string, raw: Record<string, unknown>): Operation {
    const summary = String(raw['summary'] ?? '');
    const description = String(raw['description'] ?? '');
    const operationId = String(raw['operationId'] ?? '');
    const tags = Array.isArray(raw['tags']) ? raw['tags'].map(String) : [];

    const parameters: OperationParameter[] = (
      (raw['parameters'] as Array<Record<string, unknown>>) ?? []
    ).map((p) => this.parseParameter(p));

    const requestBody = raw['requestBody'] as Record<string, unknown> | undefined;
    const requestBodyRef = requestBody?.['$ref'] ? String(requestBody['$ref']) : '';
    const requestBodyRequired = Boolean(requestBody?.['required'] ?? false);

    const responses: OperationResponse[] = [];
    const rawResponses = (raw['responses'] ?? {}) as Record<string, Record<string, unknown>>;
    for (const [code, resp] of Object.entries(rawResponses)) {
      const ref = String(resp['$ref'] ?? '');
      const desc = String(resp['description'] ?? '');
      responses.push({
        id: generateId(),
        code,
        ref,
        description: ref ? '' : desc,
      });
    }

    return {
      id: generateId(),
      method,
      summary,
      description,
      operationId,
      tags,
      parameters,
      requestBodyRef,
      requestBodyRequired,
      responses,
    };
  }

  private parseParameter(raw: Record<string, unknown>): OperationParameter {
    const schema = (raw['schema'] ?? {}) as Record<string, unknown>;
    return {
      id: generateId(),
      name: String(raw['name'] ?? ''),
      in: String(raw['in'] ?? 'query') as OperationParameter['in'],
      description: String(raw['description'] ?? ''),
      required: Boolean(raw['required'] ?? false),
      type: String(schema['type'] ?? 'string'),
      format: String(schema['format'] ?? ''),
      example: schema['example'] !== undefined ? String(schema['example']) : '',
    };
  }
}

import { Injectable, inject } from '@angular/core';
import * as jsyaml from 'js-yaml';
import { WizardStateService } from './wizard-state.service';

interface OpenApiSpec {
  openapi: string;
  info?: Record<string, unknown>;
  servers?: Array<Record<string, unknown>>;
  security?: Array<Record<string, unknown>>;
  paths?: Record<string, unknown>;
  components?: Record<string, unknown>;
}

@Injectable({ providedIn: 'root' })
export class YamlGeneratorService {
  private readonly wizardState = inject(WizardStateService);

  generateYaml(): string {
    const spec = this.buildSpec();
    return jsyaml.dump(spec, {
      lineWidth: -1,
      noRefs: true,
      sortKeys: false,
      forceQuotes: false,
    });
  }

  private buildSpec(): OpenApiSpec {
    const state = this.wizardState.state();
    const spec: OpenApiSpec = { openapi: '3.0.3' };

    spec.info = this.buildInfo(state.info);

    if (state.servers.length > 0) {
      spec.servers = state.servers.map((s) => {
        const srv: Record<string, unknown> = { url: s.url };
        if (s.description) srv['description'] = s.description;
        return srv;
      });
    }

    if (state.globalSecurity.length > 0) {
      spec.security = state.globalSecurity.map((gs) => {
        const item: Record<string, unknown> = {};
        item[gs.name] = gs.scopes
          ? gs.scopes
              .split(',')
              .map((s) => s.trim())
              .filter(Boolean)
          : [];
        return item;
      });
    }

    spec.paths = this.buildPaths(state);

    const components = this.buildComponents(state);
    if (Object.keys(components).length > 0) {
      spec.components = components;
    }

    return spec;
  }

  private buildInfo(info: {
    title: string;
    description: string;
    version: string;
    termsOfService: string;
    contact: { name: string; email: string; url: string };
    license: { name: string; url: string };
  }): Record<string, unknown> {
    const result: Record<string, unknown> = {};

    if (info.title) result['title'] = info.title;
    if (info.description) result['description'] = info.description;
    if (info.version) result['version'] = info.version;
    if (info.termsOfService) result['termsOfService'] = info.termsOfService;

    const contact: Record<string, unknown> = {};
    if (info.contact.name) contact['name'] = info.contact.name;
    if (info.contact.email) contact['email'] = info.contact.email;
    if (info.contact.url) contact['url'] = info.contact.url;
    if (Object.keys(contact).length > 0) result['contact'] = contact;

    const license: Record<string, unknown> = {};
    if (info.license.name) license['name'] = info.license.name;
    if (info.license.url) license['url'] = info.license.url;
    if (Object.keys(license).length > 0) result['license'] = license;

    return result;
  }

  private buildPaths(state: {
    paths: Array<{
      path: string;
      operations: Array<{
        method: string;
        summary: string;
        description: string;
        operationId: string;
        tags: string[];
        parameters: Array<{
          name: string;
          in: string;
          description: string;
          required: boolean;
          type: string;
          format: string;
          example: string;
        }>;
        requestBodyRef: string;
        requestBodyRequired: boolean;
        responses: Array<{ code: string; ref: string; description: string }>;
      }>;
    }>;
  }): Record<string, unknown> {
    const paths: Record<string, unknown> = {};

    state.paths.forEach((p) => {
      const pathItem: Record<string, unknown> = {};

      p.operations.forEach((op) => {
        const operation: Record<string, unknown> = {};

        if (op.summary) operation['summary'] = op.summary;
        if (op.description) operation['description'] = op.description;
        if (op.operationId) operation['operationId'] = op.operationId;
        if (op.tags && op.tags.length > 0) operation['tags'] = op.tags;

        if (op.parameters.length > 0) {
          operation['parameters'] = op.parameters.map((param) => {
            const pr: Record<string, unknown> = { name: param.name, in: param.in };
            if (param.description) pr['description'] = param.description;
            if (param.required) pr['required'] = true;

            const schema: Record<string, unknown> = { type: param.type };
            if (param.format) schema['format'] = param.format;
            if (param.example) {
              schema['example'] = isNaN(Number(param.example))
                ? param.example
                : Number(param.example);
            }
            pr['schema'] = schema;

            return pr;
          });
        }

        if (op.requestBodyRef) {
          const requestBody: Record<string, unknown> = {
            $ref: op.requestBodyRef,
          };
          if (op.requestBodyRequired) requestBody['required'] = true;
          operation['requestBody'] = requestBody;
        }

        const responses: Record<string, unknown> = {};
        if (op.responses.length > 0) {
          op.responses.forEach((r) => {
            const resp: Record<string, unknown> = {};
            if (r.ref) {
              resp['$ref'] = r.ref;
            } else {
              if (r.description) resp['description'] = r.description;
            }
            responses[r.code] = resp;
          });
        } else {
          responses['200'] = { description: 'Successful operation' };
        }
        operation['responses'] = responses;

        pathItem[op.method] = operation;
      });

      paths[p.path] = pathItem;
    });

    return paths;
  }

  private buildComponents(state: {
    schemas: Array<{
      name: string;
      description: string;
      additionalProperties: boolean | null;
      properties: Array<{
        name: string;
        type: string;
        format: string;
        description: string;
        example: string;
        minimum: string;
        maximum: string;
        pattern: string;
        required: boolean;
        ref: string;
        enumValues: string[];
        nullable: boolean;
        maxLength: string;
      }>;
    }>;
    requestBodies: Array<{
      name: string;
      description: string;
      schemaRef: string;
      contentType: string;
      required: boolean;
      examples: Array<{ name: string; summary: string; value: string }>;
    }>;
    responses: Array<{
      name: string;
      description: string;
      schemaRef: string;
      contentType: string;
      examples: Array<{ name: string; value: string }>;
    }>;
    securitySchemes: Array<{
      name: string;
      type: string;
      in: string;
      keyName: string;
      scheme: string;
      bearerFormat: string;
      flowType: string;
      tokenUrl: string;
      authorizationUrl: string;
      scopes: Array<{ name: string; description: string }>;
      openIdConnectUrl: string;
    }>;
  }): Record<string, unknown> {
    const components: Record<string, unknown> = {};

    if (state.schemas.length > 0) {
      const schemas: Record<string, unknown> = {};

      state.schemas.forEach((s) => {
        const schema: Record<string, unknown> = { type: 'object' };

        if (s.description) schema['description'] = s.description;
        if (s.additionalProperties === false) schema['additionalProperties'] = false;

        const required = s.properties.filter((p) => p.required).map((p) => p.name);
        if (required.length > 0) schema['required'] = required;

        if (s.properties.length > 0) {
          const properties: Record<string, unknown> = {};

          s.properties.forEach((p) => {
            const prop: Record<string, unknown> = {};

            if (p.ref) {
              prop['$ref'] = p.ref;
            } else {
              prop['type'] = p.type;
              if (p.format) prop['format'] = p.format;
              if (p.description) prop['description'] = p.description;

              if (p.example !== undefined && p.example !== '') {
                prop['example'] =
                  p.type === 'integer' || p.type === 'number' ? Number(p.example) : p.example;
              }

              if (p.minimum !== undefined && p.minimum !== '') prop['minimum'] = Number(p.minimum);
              if (p.maximum !== undefined && p.maximum !== '') prop['maximum'] = Number(p.maximum);
              if (p.pattern) prop['pattern'] = p.pattern;
              if (p.enumValues && p.enumValues.length > 0) prop['enum'] = p.enumValues;
              if (p.nullable) prop['nullable'] = true;
              if (p.maxLength && p.maxLength !== '') prop['maxLength'] = Number(p.maxLength);
            }

            properties[p.name] = prop;
          });

          schema['properties'] = properties;
        }

        schemas[s.name] = schema;
      });

      components['schemas'] = schemas;
    }

    if (state.requestBodies.length > 0) {
      const requestBodies: Record<string, unknown> = {};

      state.requestBodies.forEach((rb) => {
        const body: Record<string, unknown> = {};

        if (rb.description) body['description'] = rb.description;

        const content: Record<string, unknown> = {};
        const contentType = rb.contentType || 'application/json';

        const mediaType: Record<string, unknown> = {};
        if (rb.schemaRef) {
          mediaType['schema'] = { $ref: rb.schemaRef };
        }

        if (rb.examples && rb.examples.length > 0) {
          const examples: Record<string, unknown> = {};
          rb.examples.forEach((ex) => {
            try {
              examples[ex.name] = {
                summary: ex.summary,
                value: JSON.parse(ex.value),
              };
            } catch {
              examples[ex.name] = {
                summary: ex.summary,
                value: ex.value,
              };
            }
          });
          mediaType['examples'] = examples;
        }

        content[contentType] = mediaType;
        body['content'] = content;

        if (rb.required) body['required'] = true;

        requestBodies[rb.name] = body;
      });

      components['requestBodies'] = requestBodies;
    }

    if (state.responses.length > 0) {
      const responses: Record<string, unknown> = {};

      state.responses.forEach((r) => {
        const resp: Record<string, unknown> = {};
        resp['description'] = r.description || '';

        if (r.schemaRef) {
          const content: Record<string, unknown> = {};
          const contentType = r.contentType || 'application/json';

          const mediaType: Record<string, unknown> = {
            schema: { $ref: r.schemaRef },
          };

          if (r.examples && r.examples.length > 0) {
            const examples: Record<string, unknown> = {};
            r.examples.forEach((ex) => {
              try {
                examples[ex.name] = { value: JSON.parse(ex.value) };
              } catch {
                examples[ex.name] = { value: ex.value };
              }
            });
            mediaType['examples'] = examples;
          }

          content[contentType] = mediaType;
          resp['content'] = content;
        }

        responses[r.name] = resp;
      });

      components['responses'] = responses;
    }

    if (state.securitySchemes.length > 0) {
      const securitySchemes: Record<string, unknown> = {};

      state.securitySchemes.forEach((ss) => {
        const scheme: Record<string, unknown> = { type: ss.type };

        if (ss.type === 'apiKey') {
          if (ss.in) scheme['in'] = ss.in;
          if (ss.keyName) scheme['name'] = ss.keyName;
        } else if (ss.type === 'http') {
          if (ss.scheme) scheme['scheme'] = ss.scheme;
          if (ss.bearerFormat) scheme['bearerFormat'] = ss.bearerFormat;
        } else if (ss.type === 'oauth2') {
          const flows: Record<string, unknown> = {};
          const flowType = ss.flowType || 'clientCredentials';
          const flow: Record<string, unknown> = {};

          if (ss.tokenUrl) flow['tokenUrl'] = ss.tokenUrl;
          if (ss.authorizationUrl) flow['authorizationUrl'] = ss.authorizationUrl;

          if (ss.scopes && ss.scopes.length > 0) {
            const scopes: Record<string, unknown> = {};
            ss.scopes.forEach((sc) => {
              scopes[sc.name] = sc.description;
            });
            flow['scopes'] = scopes;
          }

          flows[flowType] = flow;
          scheme['flows'] = flows;
        } else if (ss.type === 'openIdConnect') {
          if (ss.openIdConnectUrl) scheme['openIdConnectUrl'] = ss.openIdConnectUrl;
        }

        securitySchemes[ss.name] = scheme;
      });

      components['securitySchemes'] = securitySchemes;
    }

    return components;
  }
}

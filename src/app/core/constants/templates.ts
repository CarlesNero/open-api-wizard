import type {
  ApiInfo,
  Entity,
  Operation,
  OperationResponse,
  Path,
  RequestBody,
  Response,
  Schema,
  Server,
  WizardState,
} from '../models/openapi.model';
import { DEFAULT_GLOBAL_SECURITY, DEFAULT_SECURITY_SCHEMES } from '../constants/default-security';
import { GENERIC_ERROR_RESPONSES, PROBLEM_SCHEMA } from '../constants/default-responses';
import { generateId } from '../utils/id-generator';

function createGenericResponses(): Response[] {
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

function buildCrudOperations(entity: Entity): Operation[] {
  const idFieldName = 'id';

  return [
    {
      id: generateId(),
      method: 'get',
      summary: `Listar ${entity.name}`,
      description: `Obtiene todos los registros de ${entity.name}. Soporta paginación mediante los parámetros offset y limit.`,
      operationId: `getAll${entity.name}`,
      tags: [entity.name],
      parameters: [
        {
          id: generateId(),
          name: 'offset',
          in: 'query',
          description: 'Número de registros a saltar',
          required: false,
          type: 'integer',
          format: 'int32',
          example: '0',
        },
        {
          id: generateId(),
          name: 'limit',
          in: 'query',
          description: 'Número máximo de registros a devolver',
          required: false,
          type: 'integer',
          format: 'int32',
          example: '20',
        },
      ],
      requestBodyRef: '',
      requestBodyRequired: false,
      responses: [
        {
          id: generateId(),
          code: '200',
          ref: '',
          description: 'Lista de registros obtenida correctamente',
        },
        {
          id: generateId(),
          code: '400',
          ref: '#/components/responses/BadRequest',
          description: '',
        },
        {
          id: generateId(),
          code: '401',
          ref: '#/components/responses/Unauthorized',
          description: '',
        },
        {
          id: generateId(),
          code: '500',
          ref: '#/components/responses/UnexpectedError',
          description: '',
        },
      ] as OperationResponse[],
    },
    {
      id: generateId(),
      method: 'get',
      summary: `Obtener ${entity.name} por ID`,
      description: `Obtiene un registro de ${entity.name} por su identificador único.`,
      operationId: `get${entity.name}ById`,
      tags: [entity.name],
      parameters: [
        {
          id: generateId(),
          name: idFieldName,
          in: 'path',
          description: entity.pkComment,
          required: true,
          type: 'integer',
          format: 'int64',
          example: '1',
        },
      ],
      requestBodyRef: '',
      requestBodyRequired: false,
      responses: [
        { id: generateId(), code: '200', ref: '', description: 'Registro encontrado' },
        { id: generateId(), code: '404', ref: '#/components/responses/NotFound', description: '' },
        {
          id: generateId(),
          code: '500',
          ref: '#/components/responses/UnexpectedError',
          description: '',
        },
      ] as OperationResponse[],
    },
    {
      id: generateId(),
      method: 'post',
      summary: `Crear ${entity.name}`,
      description: `Crea un nuevo registro en ${entity.name}.`,
      operationId: `create${entity.name}`,
      tags: [entity.name],
      parameters: [],
      requestBodyRef: `#/components/requestBodies/create${entity.name}Request`,
      requestBodyRequired: true,
      responses: [
        { id: generateId(), code: '201', ref: '', description: 'Registro creado correctamente' },
        {
          id: generateId(),
          code: '400',
          ref: '#/components/responses/BadRequest',
          description: '',
        },
        {
          id: generateId(),
          code: '401',
          ref: '#/components/responses/Unauthorized',
          description: '',
        },
        {
          id: generateId(),
          code: '500',
          ref: '#/components/responses/UnexpectedError',
          description: '',
        },
      ] as OperationResponse[],
    },
    {
      id: generateId(),
      method: 'put',
      summary: `Actualizar ${entity.name}`,
      description: `Actualiza un registro existente en ${entity.name}.`,
      operationId: `update${entity.name}`,
      tags: [entity.name],
      parameters: [
        {
          id: generateId(),
          name: idFieldName,
          in: 'path',
          description: entity.pkComment,
          required: true,
          type: 'integer',
          format: 'int64',
          example: '1',
        },
      ],
      requestBodyRef: `#/components/requestBodies/update${entity.name}Request`,
      requestBodyRequired: true,
      responses: [
        {
          id: generateId(),
          code: '200',
          ref: '',
          description: 'Registro actualizado correctamente',
        },
        {
          id: generateId(),
          code: '400',
          ref: '#/components/responses/BadRequest',
          description: '',
        },
        { id: generateId(), code: '404', ref: '#/components/responses/NotFound', description: '' },
        {
          id: generateId(),
          code: '500',
          ref: '#/components/responses/UnexpectedError',
          description: '',
        },
      ] as OperationResponse[],
    },
    {
      id: generateId(),
      method: 'delete',
      summary: `Eliminar ${entity.name}`,
      description: `Elimina un registro de ${entity.name} por su identificador único.`,
      operationId: `delete${entity.name}`,
      tags: [entity.name],
      parameters: [
        {
          id: generateId(),
          name: idFieldName,
          in: 'path',
          description: entity.pkComment,
          required: true,
          type: 'integer',
          format: 'int64',
          example: '1',
        },
      ],
      requestBodyRef: '',
      requestBodyRequired: false,
      responses: [
        { id: generateId(), code: '204', ref: '', description: 'Registro eliminado correctamente' },
        { id: generateId(), code: '404', ref: '#/components/responses/NotFound', description: '' },
        {
          id: generateId(),
          code: '500',
          ref: '#/components/responses/UnexpectedError',
          description: '',
        },
      ] as OperationResponse[],
    },
  ];
}

function buildCrudPaths(entity: Entity): Path[] {
  const operations = buildCrudOperations(entity);

  return [
    { id: generateId(), path: entity.path, operations: [operations[0], operations[2]] },
    {
      id: generateId(),
      path: `${entity.path}/{id}`,
      operations: [operations[1], operations[3], operations[4]],
    },
  ];
}

function buildCrudRequestBodies(entity: Entity): RequestBody[] {
  const nonPkProps = entity.properties.filter((p) => p.name !== 'id');
  const exampleObj: Record<string, unknown> = {};

  nonPkProps.forEach((prop) => {
    if (prop.name === 'createdDate' || prop.name === 'lastModifiedDate') return;
    const val = prop.example
      ? prop.type === 'integer' || prop.type === 'number'
        ? Number(prop.example)
        : prop.example
      : prop.type === 'string'
        ? 'string'
        : 0;
    exampleObj[prop.name] = val;
  });

  const exampleValue = JSON.stringify(exampleObj, null, 2);

  return [
    {
      id: generateId(),
      name: `create${entity.name}Request`,
      description: `Datos para crear un registro de ${entity.name}`,
      schemaRef: `#/components/schemas/${entity.name}`,
      contentType: 'application/json',
      required: true,
      examples: [{ name: 'ejemplo1', summary: `Creación de ${entity.name}`, value: exampleValue }],
    },
    {
      id: generateId(),
      name: `update${entity.name}Request`,
      description: `Datos para actualizar un registro de ${entity.name}`,
      schemaRef: `#/components/schemas/${entity.name}`,
      contentType: 'application/json',
      required: true,
      examples: [
        { name: 'ejemplo1', summary: `Actualización de ${entity.name}`, value: exampleValue },
      ],
    },
  ];
}

function buildProblemSchema(): Schema {
  return {
    ...PROBLEM_SCHEMA,
    id: generateId(),
    properties: PROBLEM_SCHEMA.properties.map((p) => ({ ...p, id: generateId() })),
  };
}

export function createEmptyState(): WizardState {
  return {
    currentStep: 0,
    info: {
      title: '',
      description: '',
      version: '',
      termsOfService: '',
      contact: { name: '', email: '', url: '' },
      license: { name: '', url: '' },
    },
    servers: [],
    entities: [],
    paths: [],
    schemas: [],
    requestBodies: [],
    responses: createGenericResponses(),
    globalSecurity: DEFAULT_GLOBAL_SECURITY.map((gs) => ({ ...gs, id: generateId() })),
    securitySchemes: DEFAULT_SECURITY_SCHEMES.map((ss) => ({ ...ss, id: generateId() })),
    completed: false,
  };
}

export function buildStateFromEntities(
  info: Partial<ApiInfo>,
  servers: Omit<Server, 'id'>[],
  entities: Entity[],
): WizardState {
  const state = createEmptyState();

  state.info = {
    title: info.title || '',
    description: info.description || '',
    version: info.version || '',
    termsOfService: info.termsOfService || '',
    contact: {
      name: info.contact?.name || '',
      email: info.contact?.email || '',
      url: info.contact?.url || '',
    },
    license: {
      name: info.license?.name || '',
      url: info.license?.url || '',
    },
  };

  state.servers = servers.map((s) => ({ ...s, id: generateId() }));
  state.entities = entities;

  const schemas: Schema[] = [buildProblemSchema()];
  const paths: Path[] = [];
  const requestBodies: RequestBody[] = [];

  entities.forEach((entity) => {
    const schema: Schema = {
      id: generateId(),
      name: entity.name,
      description: entity.description,
      additionalProperties: null,
      properties: entity.properties.map((p) => ({ ...p, id: generateId() })),
    };
    schemas.push(schema);

    if (entity.generateCrud) {
      paths.push(...buildCrudPaths(entity));
      requestBodies.push(...buildCrudRequestBodies(entity));
    }
  });

  state.schemas = schemas;
  state.paths = paths;
  state.requestBodies = requestBodies;

  return state;
}

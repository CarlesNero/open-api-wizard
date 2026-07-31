export interface ApiInfo {
  title: string;
  description: string;
  version: string;
  termsOfService: string;
  contact: {
    name: string;
    email: string;
    url: string;
  };
  license: {
    name: string;
    url: string;
  };
}

export interface Server {
  id: string;
  url: string;
  description: string;
}

export interface SchemaProperty {
  id: string;
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
}

export interface Schema {
  id: string;
  name: string;
  description: string;
  additionalProperties: boolean | null;
  properties: SchemaProperty[];
}

export interface Entity {
  id: string;
  name: string;
  tableName: string;
  path: string;
  description: string;
  idField: string;
  pkComment: string;
  properties: SchemaProperty[];
  generateCrud: boolean;
}

export interface OperationParameter {
  id: string;
  name: string;
  in: 'query' | 'header' | 'path' | 'cookie';
  description: string;
  required: boolean;
  type: string;
  format: string;
  example: string;
}

export interface OperationResponse {
  id: string;
  code: string;
  ref: string;
  description: string;
}

export interface Operation {
  id: string;
  method: string;
  summary: string;
  description: string;
  operationId: string;
  tags: string[];
  parameters: OperationParameter[];
  requestBodyRef: string;
  requestBodyRequired: boolean;
  responses: OperationResponse[];
}

export interface Path {
  id: string;
  path: string;
  operations: Operation[];
}

export interface RequestBodyExample {
  name: string;
  summary: string;
  value: string;
}

export interface RequestBody {
  id: string;
  name: string;
  description: string;
  schemaRef: string;
  contentType: string;
  required: boolean;
  examples: RequestBodyExample[];
}

export interface ResponseExample {
  name: string;
  value: string;
}

export interface Response {
  id: string;
  name: string;
  description: string;
  schemaRef: string;
  contentType: string;
  examples: ResponseExample[];
}

export interface SecurityScheme {
  id: string;
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
}

export interface GlobalSecurity {
  id: string;
  name: string;
  scopes: string;
}

export interface WizardState {
  currentStep: number;
  info: ApiInfo;
  servers: Server[];
  entities: Entity[];
  paths: Path[];
  schemas: Schema[];
  requestBodies: RequestBody[];
  responses: Response[];
  globalSecurity: GlobalSecurity[];
  securitySchemes: SecurityScheme[];
  completed: boolean;
}

export const STEP_KEYS = ['welcome', 'info', 'servers', 'entities', 'review'] as const;
export type StepKey = (typeof STEP_KEYS)[number];

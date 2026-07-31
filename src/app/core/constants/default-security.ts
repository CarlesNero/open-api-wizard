import type { GlobalSecurity, SecurityScheme } from '../models/openapi.model';

export const DEFAULT_SECURITY_SCHEMES: Omit<SecurityScheme, 'id'>[] = [
  {
    name: 'Application-Id',
    type: 'apiKey',
    in: 'header',
    keyName: 'Application-Id',
    scheme: '',
    bearerFormat: '',
    flowType: 'clientCredentials',
    tokenUrl: '',
    authorizationUrl: '',
    scopes: [],
    openIdConnectUrl: '',
  },
  {
    name: 'OAuth',
    type: 'oauth2',
    in: '',
    keyName: '',
    scheme: '',
    bearerFormat: '',
    flowType: 'clientCredentials',
    tokenUrl: 'https://example.com/oauth/token',
    authorizationUrl: '',
    scopes: [
      { name: 'read', description: 'Acceso lectura' },
      { name: 'write', description: 'Acceso escritura' },
    ],
    openIdConnectUrl: '',
  },
];

export const DEFAULT_GLOBAL_SECURITY: Omit<GlobalSecurity, 'id'>[] = [
  { name: 'Application-Id', scopes: '' },
  { name: 'OAuth', scopes: 'read, write' },
];

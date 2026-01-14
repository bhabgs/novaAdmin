import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder, OpenAPIObject } from '@nestjs/swagger';
import { AppModule } from './app.module';
import { TransformInterceptor, HttpExceptionFilter } from '@nova-admin/shared';
import axios from 'axios';

const SERVICE_SWAGGER_URLS = {
  auth: process.env.AUTH_SERVICE_URL || 'http://localhost:3001',
  rbac: process.env.RBAC_SERVICE_URL || 'http://localhost:3002',
  system: process.env.SYSTEM_SERVICE_URL || 'http://localhost:3003',
};

async function fetchServiceSwagger(name: string, baseUrl: string): Promise<OpenAPIObject | null> {
  try {
    const response = await axios.get(`${baseUrl}/api/docs-json`, { timeout: 5000 });
    return response.data;
  } catch (error) {
    console.warn(`Failed to fetch swagger from ${name} service: ${error.message}`);
    return null;
  }
}

function updateRefs(obj: any, schemaMapping: Record<string, string>): any {
  if (obj === null || obj === undefined) {
    return obj;
  }

  if (typeof obj === 'string') {
    // Update $ref strings
    if (obj.startsWith('#/components/schemas/')) {
      const schemaName = obj.replace('#/components/schemas/', '');
      if (schemaMapping[schemaName]) {
        return `#/components/schemas/${schemaMapping[schemaName]}`;
      }
    }
    return obj;
  }

  if (Array.isArray(obj)) {
    return obj.map((item) => updateRefs(item, schemaMapping));
  }

  if (typeof obj === 'object') {
    const updated: any = {};
    for (const [key, value] of Object.entries(obj)) {
      updated[key] = updateRefs(value, schemaMapping);
    }
    return updated;
  }

  return obj;
}

function mergeSwaggerDocs(
  baseDoc: OpenAPIObject,
  serviceDocs: { name: string; doc: OpenAPIObject }[],
): OpenAPIObject {
  const mergedDoc = { ...baseDoc };
  mergedDoc.paths = { ...baseDoc.paths };
  mergedDoc.components = {
    ...baseDoc.components,
    schemas: { ...baseDoc.components?.schemas },
  };
  mergedDoc.tags = [...(baseDoc.tags || [])];

  for (const { name, doc } of serviceDocs) {
    // Build schema name mapping for this service
    const schemaMapping: Record<string, string> = {};
    if (doc.components?.schemas) {
      for (const schemaName of Object.keys(doc.components.schemas)) {
        const prefixedName = `${name.charAt(0).toUpperCase() + name.slice(1)}_${schemaName}`;
        schemaMapping[schemaName] = prefixedName;
      }
    }

    // Merge paths with service prefix and update refs
    if (doc.paths) {
      for (const [path, pathItem] of Object.entries(doc.paths)) {
        const prefixedPath = `/api/${name}${path.replace('/api', '')}`;
        mergedDoc.paths[prefixedPath] = updateRefs(pathItem, schemaMapping);
      }
    }

    // Merge schemas with service prefix to avoid conflicts
    if (doc.components?.schemas) {
      for (const [schemaName, schema] of Object.entries(doc.components.schemas)) {
        const prefixedName = `${name.charAt(0).toUpperCase() + name.slice(1)}_${schemaName}`;
        mergedDoc.components.schemas[prefixedName] = updateRefs(schema, schemaMapping);
      }
    }

    // Merge tags
    if (doc.tags) {
      for (const tag of doc.tags) {
        if (!mergedDoc.tags.find((t) => t.name === tag.name)) {
          mergedDoc.tags.push(tag);
        }
      }
    }
  }

  return mergedDoc;
}

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.enableCors();
  app.setGlobalPrefix('api');
  app.useGlobalPipes(new ValidationPipe({ transform: true, whitelist: true }));
  app.useGlobalInterceptors(new TransformInterceptor());
  app.useGlobalFilters(new HttpExceptionFilter());

  const config = new DocumentBuilder()
    .setTitle('Nova Admin API')
    .setDescription('Nova Admin API Gateway - Aggregated Documentation')
    .setVersion('2.0')
    .addBearerAuth()
    .build();

  let document = SwaggerModule.createDocument(app, config);

  // Fetch and merge swagger docs from all services
  const serviceDocs: { name: string; doc: OpenAPIObject }[] = [];
  for (const [name, baseUrl] of Object.entries(SERVICE_SWAGGER_URLS)) {
    const doc = await fetchServiceSwagger(name, baseUrl);
    if (doc) {
      serviceDocs.push({ name, doc });
      console.log(`Merged swagger from ${name} service`);
    }
  }

  if (serviceDocs.length > 0) {
    document = mergeSwaggerDocs(document, serviceDocs);
  }

  SwaggerModule.setup('api/docs', app, document);

  const port = process.env.GATEWAY_PORT || 3000;
  await app.listen(port);
  console.log(`Gateway is running on http://localhost:${port}`);
  console.log(`Swagger docs available at http://localhost:${port}/api/docs`);
}
bootstrap();

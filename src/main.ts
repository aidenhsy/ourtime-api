import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import * as fs from 'fs';
import * as yaml from 'js-yaml';
import * as dotenv from 'dotenv';
import * as cookieParser from 'cookie-parser';

dotenv.config();

async function bootstrap() {
  const app = await NestFactory.create(AppModule, { cors: true });
  app.setGlobalPrefix('api');
  app.use(cookieParser());
  const config = new DocumentBuilder()
    .setTitle('OURTIME API')
    .setDescription('OURTIME API DOCUMENTATION')
    .setVersion('0.1')
    .addBearerAuth()
    .addServer(process.env.BASE_URL)
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('docs', app, document);

  fs.writeFileSync('./openapi.json', JSON.stringify(document, null, 2));

  // Convert JSON document to YAML and write to file
  const yamlDocument = yaml.dump(document);
  fs.writeFileSync('./openapi.yaml', yamlDocument);

  app
    .getHttpAdapter()
    .getInstance()
    .get('/openapi.json', (req, res) => {
      res.send(document);
    });

  // Create endpoint to serve YAML document
  app
    .getHttpAdapter()
    .getInstance()
    .get('/openapi.yaml', (req, res) => {
      res.type('text/yaml');
      res.send(yamlDocument);
    });

  await app.listen(3100);
}
bootstrap();

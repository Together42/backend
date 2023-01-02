import swaggerAutogen from 'swagger-autogen'

const options = {
  openapi: '3.0.0',
  info: {
    title : 'Together42 web service API',
    version: '1.0.0',
    description: 'Together42 web service, Express and documented with Swagger',
  },
  host: 'http://localhost:9999',
  contact: {
    name: 'tkim',
    url: 'https://github.com/kth2624',
    email: 'dev.tkim42@gmail.com',
  },
  schemes: ['http'],
  securityDefinitions: {
    bearerAuth: {
      type: 'http',
      scheme: 'bearer',
      in: 'header',
      bearerFormat: 'JWT',
    },
  },
}

const outputFile = './src/swagger/swagger-docs.json'
const endpointsFiles = ['../app.js']

swaggerAutogen(outputFile, endpointsFiles, options)

/**
 * Swagger 設定檔
 * 用於生成 API 文檔
 */

import swaggerJsdoc from 'swagger-jsdoc';

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: '營養管理系統 API',
      version: '1.0.0',
      description: '營養管理系統的 RESTful API 文檔',
      contact: {
        name: 'API Support',
      },
    },
    servers: [
      {
        url: 'http://localhost:3000',
        description: '開發環境',
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
          description: '請在 Authorization header 中輸入 Bearer {token}',
        },
      },
      schemas: {
        ApiResponse: {
          type: 'object',
          properties: {
            success: {
              type: 'boolean',
              example: true,
            },
            data: {
              type: 'object',
            },
            message: {
              type: 'string',
            },
          },
        },
        ErrorResponse: {
          type: 'object',
          properties: {
            success: {
              type: 'boolean',
              example: false,
            },
            error: {
              type: 'object',
              properties: {
                code: {
                  type: 'string',
                },
                message: {
                  type: 'string',
                },
                details: {
                  type: 'object',
                },
              },
            },
          },
        },
        PaginatedResponse: {
          type: 'object',
          properties: {
            success: {
              type: 'boolean',
              example: true,
            },
            data: {
              type: 'object',
              properties: {
                items: {
                  type: 'array',
                },
                pagination: {
                  type: 'object',
                  properties: {
                    page: {
                      type: 'number',
                    },
                    limit: {
                      type: 'number',
                    },
                    total: {
                      type: 'number',
                    },
                    totalPages: {
                      type: 'number',
                    },
                  },
                },
              },
            },
          },
        },
      },
    },
    tags: [
      {
        name: 'Auth',
        description: '認證相關 API',
      },
      {
        name: 'Users',
        description: '使用者相關 API',
      },
      {
        name: 'Foods',
        description: '食物相關 API',
      },
    ],
  },
  apis: ['./src/routes/*.ts', './src/controllers/*.ts'], // 掃描這些文件中的註解
};

export const swaggerSpec = swaggerJsdoc(options);

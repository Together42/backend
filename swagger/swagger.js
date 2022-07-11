const swaggerOptions = {
	definition: {
		openapi: '3.0.0',
		info: {
			title : 'Together42 web service API',
			version: '1.0.0',
			description: 'Together42 web service, Express and documented with Swagger',
		},
		contact: {
			name: 'tkim',
			url: 'https://github.com/kth2624',
			email: 'dev.tkim42@gmail.com',
		},
		server: [
			{
				url: 'http://localhost:8080',
			},
		],
	},
	apis: ['./routes/*.routes.js'],
};

export default swaggerOptions;

import {ApplicationConfig, DemoApplication} from './application';

export * from './application';

export async function main(options: ApplicationConfig = {}) {
  const app = new DemoApplication(options);
  await app.boot();
  await app.start();

  const url = app.restServer.url;
  console.log(`Server is running at ${url}`);
  console.log(`Try ${url}/ping`);

  const httpUrl = await app.getHttpUrl();
  console.log('socket.io server', httpUrl);
  console.log('%s/ping will be redirected to %s/ping', httpUrl, url);

  return app;
}

if (require.main === module) {
  // Run the application
  const config = {
    rest: {
      port: +(process.env.HTTPS_PORT ?? 3003),
      host: process.env.HOST,
      gracePeriodForClose: 5000, // 5 seconds
      openApiSpec: {
        // useful when used with OpenAPI-to-GraphQL to locate your application
        setServersFromRequest: true,
      },
    },
  };
  main(config).catch(err => {
    console.error('Cannot start the application.', err);
    process.exit(1);
  });
}

import {
  ApplicationConfig, BindingKey,
  ContextTags,
  CoreBindings,
  inject,
  lifeCycleObserver
} from '@loopback/core';
import {SocketIoApplication} from '@loopback/socketio';
import {SocketIoController} from './controllers';

export const SUB_APPLICATION_HTTP = BindingKey.create<SocketIoApplication>(
  'sub-application-for-http',
);

/**
 * A sub-application for health check endpoint to listen on a separate http port
 */
@lifeCycleObserver('', {
  tags: {[ContextTags.KEY]: SUB_APPLICATION_HTTP},
})
export class SubApplicationForHttp extends SocketIoApplication {
  constructor(
    @inject(CoreBindings.APPLICATION_CONFIG) mainAppConfig: ApplicationConfig,
  ) {
    const options = {...mainAppConfig};
    options.rest = {
      ...options.rest,
      port: +(process.env.HTTP_PORT ?? 3001),
      protocol: 'http',
    };
    super(options);

    this.socketServer.use((socket, next) => {
      console.info('Global middleware - socket:', socket.id);
      next();
    });

    const ns = this.socketServer.route(SocketIoController);
    ns.use((socket, next) => {
      console.info(
        'Middleware for namespace %s - socket: %s',
        socket.nsp.name,
        socket.id,
      );
      next();
    });
  }
}

//NOTE: create our own decorator
//data is what inside the decorator, request is the Express request object itself

import { createParamDecorator, ExecutionContext } from '@nestjs/common';

export const User = createParamDecorator((data, context: ExecutionContext) => {
  const req = context.switchToHttp().getRequest();
  return data ? req.user[data] : req.user;
});

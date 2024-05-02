import {
  ExecutionContext,
  InternalServerErrorException,
  createParamDecorator,
} from '@nestjs/common';

export const GetUser = createParamDecorator(
  (params: string[], ctx: ExecutionContext) => {
    const req = ctx.switchToHttp().getRequest();
    const user = req.user;

    if (!user) {
      throw new InternalServerErrorException('User not found (request)');
    }

    if (!params) {
      return user;
    }

    var returnUser = {};
    params.map((param) => {
      console.log('pa->', param);
      returnUser[param] = user[param];
    });

    return returnUser;
  },
);

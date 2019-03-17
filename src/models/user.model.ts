import {Entity, model, property} from '@loopback/repository';
import * as jwt from 'jsonwebtoken';

@model()
export class User extends Entity {
  @property({
    type: 'string',
    id: true,
    required: true,
  })
  userId: string;

  @property({
    type: 'string',
    required: true,
  })
  username: string;

  @property({
    type: 'string',
    required: true,
  })
  password: string;

  @property({
    type: 'string',
  })
  displayName?: string;

  @property({
    type: 'string',
    required: true,
    default: 'user',
  })
  role?: string;

  @property({
    type: 'date',
    default: new Date(),
  })
  registerDate?: string;

  constructor(data?: Partial<User>) {
    super(data);
  }

  generateToken() {
    const secret = <jwt.Secret>process.env.TOKEN_SECRET;
    return jwt.sign({id: this.userId}, secret);
  }
}

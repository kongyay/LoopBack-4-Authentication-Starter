import {Provider, inject, ValueOrPromise} from '@loopback/context';
import {Strategy} from 'passport';
import {
  AuthenticationBindings,
  AuthenticationMetadata,
} from '@loopback/authentication';
import {BasicStrategy} from 'passport-http';
import {Strategy as BearerStrategy} from 'passport-http-bearer';
import {repository} from '@loopback/repository';
import {UserRepository} from '../repositories';
import * as bcrypt from 'bcrypt';
import * as jwt from 'jsonwebtoken';

interface DataStoredInToken {
  id: string;
}

export class MyAuthStrategyProvider implements Provider<Strategy | undefined> {
  constructor(
    @repository(UserRepository)
    public userRepository: UserRepository,
    @inject(AuthenticationBindings.METADATA)
    private metadata: AuthenticationMetadata,
  ) {}

  value(): ValueOrPromise<Strategy | undefined> {
    // The function was not decorated, so we shouldn't attempt authentication
    if (!this.metadata) {
      return undefined;
    }

    const name = this.metadata.strategy;
    if (name === 'BasicStrategy') {
      return new BasicStrategy(this.verifyBasic.bind(this));
    } else if (name === 'BearerStrategy') {
      return new BearerStrategy(this.verifyToken.bind(this));
    } else {
      return Promise.reject(`The strategy ${name} is not available.`);
    }
  }

  async verifyToken(
    token: string,
    cb: (err: Error | null, user?: object | false) => void,
  ) {
    const payload = (await jwt.verify(token, process.env
      .TOKEN_SECRET as string)) as DataStoredInToken;
    // find user by id
    const user = await this.userRepository.findOne({
      where: {userId: payload.id},
    });
    if (user) {
      cb(null, user);
    } else {
      cb(null, false);
    }
  }

  async verifyBasic(
    username: string,
    password: string,
    cb: (err: Error | null, user?: object | false) => void,
  ) {
    // find user by name & password
    const user = await this.userRepository.findOne({
      where: {username: username},
    });
    if (user && user.role === 'mungod') {
      const bChecked = await bcrypt.compare(password, user.password);
      if (bChecked) {
        cb(null, user);
      } else {
        cb(null, false);
      }
    } else {
      cb(null, false);
    }
    // call cb(null, false) when user not found
    // call cb(null, user) when user is authenticated
  }
}

import {inject} from '@loopback/context';
import {
  AuthenticationBindings,
  authenticate,
  UserProfile,
} from '@loopback/authentication';
import {
  Count,
  CountSchema,
  Filter,
  repository,
  Where,
} from '@loopback/repository';
import {
  post,
  param,
  get,
  getFilterSchemaFor,
  getWhereSchemaFor,
  patch,
  put,
  del,
  requestBody,
  HttpErrors,
} from '@loopback/rest';
import {User} from '../models';
import {UserRepository} from '../repositories';
const hasher = require('wordpress-hash-node');
import * as bcrypt from 'bcrypt';

class LoginCreditials {
  username: string;
  password: string;
}

export class UserController {
  constructor(
    @inject(AuthenticationBindings.CURRENT_USER, {optional: true})
    private userAuthen: User,
    @repository(UserRepository)
    public userRepository: UserRepository,
  ) {}

  @post('/login', {
    responses: {
      '200': {
        description: 'Login API',
        content: {'application/json': {schema: {'x-ts-type': LoginCreditials}}},
      },
    },
  })
  async login(@requestBody() creditials: LoginCreditials): Promise<object> {
    let user = await this.userRepository.findOne({
      where: {username: creditials.username},
    });
    if (!user) {
      throw new HttpErrors.NotFound('User Not Found');
    }

    // (just in case) Using old method (wordpress) => convert to bcrypt
    const wpChecked = hasher.CheckPassword(creditials.password, user.password);
    if (wpChecked) {
      const hashed = await bcrypt.hash(creditials.password, 13);
      user.password = hashed;
      this.userRepository.updateById(user.userId, user);
    } else {
      // Using new method (bcrypt)
      const bChecked = await bcrypt.compare(creditials.password, user.password);
      if (!bChecked) {
        throw new HttpErrors.BadRequest('Username or password was incorrect');
      }
    }

    const token = user.generateToken();
    return {
      token: token,
    };
  }

  @authenticate('BearerStrategy')
  @get('/users/me', {
    responses: {
      '200': {
        description: 'User model fo token sender',
        content: {
          'application/json': {
            schema: {type: 'array', items: {'x-ts-type': User}},
          },
        },
      },
    },
  })
  async findMe(): Promise<User | null> {
    return await this.userRepository.findOne({
      where: {userId: this.userAuthen.userId},
    });
  }

  @authenticate('BasicStrategy')
  @post('/users', {
    responses: {
      '200': {
        description: 'User model instance',
        content: {'application/json': {schema: {'x-ts-type': User}}},
      },
    },
  })
  async create(@requestBody() user: User): Promise<User> {
    user.password = hasher.HashPassword(user.password);
    return await this.userRepository.create(user);
  }

  @authenticate('BasicStrategy')
  @get('/users/count', {
    responses: {
      '200': {
        description: 'User model count',
        content: {'application/json': {schema: CountSchema}},
      },
    },
  })
  async count(
    @param.query.object('where', getWhereSchemaFor(User)) where?: Where,
  ): Promise<Count> {
    return await this.userRepository.count(where);
  }

  @authenticate('BasicStrategy')
  @get('/users', {
    responses: {
      '200': {
        description: 'Array of User model instances',
        content: {
          'application/json': {
            schema: {type: 'array', items: {'x-ts-type': User}},
          },
        },
      },
    },
  })
  async find(
    @param.query.object('filter', getFilterSchemaFor(User)) filter?: Filter,
  ): Promise<User[]> {
    return await this.userRepository.find(filter);
  }

  @authenticate('BasicStrategy')
  @patch('/users', {
    responses: {
      '200': {
        description: 'User PATCH success count',
        content: {'application/json': {schema: CountSchema}},
      },
    },
  })
  async updateAll(
    @requestBody() user: User,
    @param.query.object('where', getWhereSchemaFor(User)) where?: Where,
  ): Promise<Count> {
    return await this.userRepository.updateAll(user, where);
  }

  @authenticate('BasicStrategy')
  @get('/users/{id}', {
    responses: {
      '200': {
        description: 'User model instance',
        content: {'application/json': {schema: {'x-ts-type': User}}},
      },
    },
  })
  async findById(@param.path.string('id') id: string): Promise<User> {
    return await this.userRepository.findById(id);
  }

  @authenticate('BasicStrategy')
  @patch('/users/{id}', {
    responses: {
      '204': {
        description: 'User PATCH success',
      },
    },
  })
  async updateById(
    @param.path.string('id') id: string,
    @requestBody() user: User,
  ): Promise<void> {
    await this.userRepository.updateById(id, user);
  }

  @authenticate('BasicStrategy')
  @put('/users/{id}', {
    responses: {
      '204': {
        description: 'User PUT success',
      },
    },
  })
  async replaceById(
    @param.path.string('id') id: string,
    @requestBody() user: User,
  ): Promise<void> {
    await this.userRepository.replaceById(id, user);
  }

  @authenticate('BasicStrategy')
  @del('/users/{id}', {
    responses: {
      '204': {
        description: 'User DELETE success',
      },
    },
  })
  async deleteById(@param.path.string('id') id: string): Promise<void> {
    await this.userRepository.deleteById(id);
  }
}

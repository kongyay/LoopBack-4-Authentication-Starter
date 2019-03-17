import {DefaultCrudRepository} from '@loopback/repository';
import {User} from '../models';
import {AccountDsDataSource} from '../datasources';
import {inject} from '@loopback/core';

export class UserRepository extends DefaultCrudRepository<
  User,
  typeof User.prototype.userId
> {
  constructor(
    @inject('datasources.accountDS') dataSource: AccountDsDataSource,
  ) {
    super(User, dataSource);
  }
}

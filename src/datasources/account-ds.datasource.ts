import {inject} from '@loopback/core';
import {juggler} from '@loopback/repository';
import * as config from './account-ds.datasource.json';

export class AccountDsDataSource extends juggler.DataSource {
  static dataSourceName = 'accountDS';

  constructor(
    @inject('datasources.config.accountDS', {optional: true})
    dsConfig: object = config,
  ) {
    super(dsConfig);
  }
}

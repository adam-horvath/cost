import request from 'utils/request';
import { CredentialsModel, CredentialsResponseModel } from 'models/auth.model';

export class AuthService {
  static async login(credentials: CredentialsModel) {
    return await request<CredentialsResponseModel>({
      resource: '/login',
      data: credentials,
    });
  }
}

export interface CredentialsModel {
  email: string,
  password: string,
}

export interface CredentialsResponseModel {
  success: boolean;
  token: string;
  id: string;
}
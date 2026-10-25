export default class APIError extends Error {
  code: string;
  statusCode: number;

  constructor(code: string, message: string, statusCode = 422) {
    super(message);

    this.name = this.constructor.name;
    this.code = code;
    this.statusCode = statusCode;
  }
}

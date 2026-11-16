// An error with an HTTP status code that is safe to show to the client.
export class AppError extends Error {
  constructor(statusCode, message, details) {
    super(message)
    this.statusCode = statusCode
    this.details = details
  }
}

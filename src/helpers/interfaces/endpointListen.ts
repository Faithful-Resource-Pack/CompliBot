export interface EndpointMessage {
  type: string,
  content: {
    message: string | null,
    code: number,
    err: any,
    req: any
  }
}

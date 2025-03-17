export interface batchOpPayload {
  projectId?: string;
  limit: number;
  offset: number;
}

export interface batchOpUserPayload {
  userId?: string;
  limit: number;
  offset: number;
}

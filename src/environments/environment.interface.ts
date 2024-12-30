export interface Environment {
  production: boolean;
  appwrite: {
    endpoint: string;
    projectId: string;
    bucketId: string;
    databaseId: string;
  };
}

export type Maybe<T> = T | null;
export type InputMaybe<T> = Maybe<T>;
export type Exact<T extends { [key: string]: unknown }> = {
  [K in keyof T]: T[K];
};
export type MakeOptional<T, K extends keyof T> = Omit<T, K> & {
  [SubKey in K]?: Maybe<T[SubKey]>;
};
export type MakeMaybe<T, K extends keyof T> = Omit<T, K> & {
  [SubKey in K]: Maybe<T[SubKey]>;
};
export type MakeEmpty<
  T extends { [key: string]: unknown },
  K extends keyof T,
> = { [_ in K]?: never };
export type Incremental<T> =
  | T
  | {
      [P in keyof T]?: P extends " $fragmentName" | "__typename" ? T[P] : never;
    };
/** All built-in and custom scalars, mapped to their actual values */
export type Scalars = {
  ID: { input: string; output: string };
  String: { input: string; output: string };
  Boolean: { input: boolean; output: boolean };
  Int: { input: number; output: number };
  Float: { input: number; output: number };
  AWSDate: { input: string; output: string };
  AWSDateTime: { input: string; output: string };
  AWSEmail: { input: string; output: string };
  AWSIPAddress: { input: string; output: string };
  AWSJSON: { input: string; output: string };
  AWSPhone: { input: string; output: string };
  AWSTime: { input: string; output: string };
  AWSTimestamp: { input: number; output: number };
  AWSURL: { input: string; output: string };
};

export type AddClubInput = {
  newAdminEmail: Scalars["AWSEmail"]["input"];
  newClubName: Scalars["String"]["input"];
  suppressInvitationEmail?: InputMaybe<Scalars["Boolean"]["input"]>;
};

export type AddClubResponse = {
  __typename?: "AddClubResponse";
  clubId: Scalars["String"]["output"];
  userId: Scalars["String"]["output"];
};

export type ExampleLambdaDataSourceInput = {
  contentType?: InputMaybe<Scalars["String"]["input"]>;
  extension: Scalars["String"]["input"];
};

export type ExampleLambdaDataSourceOutput = {
  __typename?: "ExampleLambdaDataSourceOutput";
  exampleOutputField: Scalars["String"]["output"];
};

export type Mutation = {
  __typename?: "Mutation";
  addClub: AddClubResponse;
  removeClubAndAdmin: RemoveClubAndAdminResponse;
};

export type MutationAddClubArgs = {
  input: AddClubInput;
};

export type MutationRemoveClubAndAdminArgs = {
  input: RemoveClubAndAdminInput;
};

export type Query = {
  __typename?: "Query";
  exampleLambdaDataSource: ExampleLambdaDataSourceOutput;
};

export type QueryExampleLambdaDataSourceArgs = {
  input?: InputMaybe<ExampleLambdaDataSourceInput>;
};

export type RemoveClubAndAdminInput = {
  clubId: Scalars["String"]["input"];
  userId: Scalars["String"]["input"];
};

export type RemoveClubAndAdminResponse = {
  __typename?: "RemoveClubAndAdminResponse";
  status: Scalars["String"]["output"];
};

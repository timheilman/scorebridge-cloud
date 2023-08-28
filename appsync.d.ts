export type Maybe<T> = T | null;
export type InputMaybe<T> = Maybe<T>;
export type Exact<T extends { [key: string]: unknown }> = { [K in keyof T]: T[K] };
export type MakeOptional<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]?: Maybe<T[SubKey]> };
export type MakeMaybe<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]: Maybe<T[SubKey]> };
export type MakeEmpty<T extends { [key: string]: unknown }, K extends keyof T> = { [_ in K]?: never };
export type Incremental<T> = T | { [P in keyof T]?: P extends ' $fragmentName' | '__typename' ? T[P] : never };
/** All built-in and custom scalars, mapped to their actual values */
export type Scalars = {
  ID: { input: string; output: string; }
  String: { input: string; output: string; }
  Boolean: { input: boolean; output: boolean; }
  Int: { input: number; output: number; }
  Float: { input: number; output: number; }
  AWSDate: { input: string; output: string; }
  AWSDateTime: { input: string; output: string; }
  AWSEmail: { input: string; output: string; }
  AWSIPAddress: { input: string; output: string; }
  AWSJSON: { input: string; output: string; }
  AWSPhone: { input: string; output: string; }
  AWSTime: { input: string; output: string; }
  AWSTimestamp: { input: number; output: number; }
  AWSURL: { input: string; output: string; }
};

export type Club = {
  __typename?: 'Club';
  createdAt?: Maybe<Scalars['AWSDateTime']['output']>;
  id?: Maybe<Scalars['String']['output']>;
  name?: Maybe<Scalars['String']['output']>;
};

export type ClubDevice = {
  __typename?: 'ClubDevice';
  createdAt?: Maybe<Scalars['AWSDateTime']['output']>;
  id?: Maybe<Scalars['AWSEmail']['output']>;
  name?: Maybe<Scalars['String']['output']>;
};

export type CreateClubDeviceInput = {
  clubId: Scalars['String']['input'];
  tabletName: Scalars['String']['input'];
  tabletRegToken: Scalars['String']['input'];
};

export type CreateClubDeviceResponse = {
  __typename?: 'CreateClubDeviceResponse';
  status: Scalars['String']['output'];
};

export type CreateClubInput = {
  newAdminEmail: Scalars['AWSEmail']['input'];
  newClubName: Scalars['String']['input'];
  recaptchaToken?: InputMaybe<Scalars['String']['input']>;
  suppressInvitationEmail?: InputMaybe<Scalars['Boolean']['input']>;
};

export type CreateClubResponse = {
  __typename?: 'CreateClubResponse';
  clubId: Scalars['String']['output'];
  userId: Scalars['String']['output'];
};

export type DeleteClubAndAdminInput = {
  clubId: Scalars['String']['input'];
  userId: Scalars['String']['input'];
};

export type DeleteClubAndAdminResponse = {
  __typename?: 'DeleteClubAndAdminResponse';
  status: Scalars['String']['output'];
};

export type ExampleLambdaDataSourceInput = {
  contentType?: InputMaybe<Scalars['String']['input']>;
  extension: Scalars['String']['input'];
};

export type ExampleLambdaDataSourceOutput = {
  __typename?: 'ExampleLambdaDataSourceOutput';
  exampleOutputField: Scalars['String']['output'];
};

export type ListClubDevicesInput = {
  clubId: Scalars['String']['input'];
  limit?: InputMaybe<Scalars['Int']['input']>;
  nextToken?: InputMaybe<Scalars['String']['input']>;
};

export type ListClubDevicesOutput = {
  __typename?: 'ListClubDevicesOutput';
  clubDevices: Array<Maybe<ClubDevice>>;
  nextToken?: Maybe<Scalars['String']['output']>;
};

export type ListClubOutput = {
  __typename?: 'ListClubOutput';
  tablets: Array<Maybe<Club>>;
};

export type Mutation = {
  __typename?: 'Mutation';
  createClub: CreateClubResponse;
  createClubDevice: CreateClubDeviceResponse;
  deleteClubAndAdmin: DeleteClubAndAdminResponse;
  unexpectedError: UnexpectedErrorResponse;
};


export type MutationCreateClubArgs = {
  input: CreateClubInput;
};


export type MutationCreateClubDeviceArgs = {
  input: CreateClubDeviceInput;
};


export type MutationDeleteClubAndAdminArgs = {
  input: DeleteClubAndAdminInput;
};

export type Query = {
  __typename?: 'Query';
  exampleLambdaDataSource: ExampleLambdaDataSourceOutput;
  getClub?: Maybe<Club>;
  listClubDevices: ListClubDevicesOutput;
};


export type QueryExampleLambdaDataSourceArgs = {
  input: ExampleLambdaDataSourceInput;
};


export type QueryGetClubArgs = {
  clubId: Scalars['String']['input'];
};


export type QueryListClubDevicesArgs = {
  input?: InputMaybe<ListClubDevicesInput>;
};

export type UnexpectedErrorResponse = {
  __typename?: 'UnexpectedErrorResponse';
  neverGetsReturned: Scalars['String']['output'];
};

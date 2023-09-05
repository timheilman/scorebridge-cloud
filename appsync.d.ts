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
  createdAt: Scalars['AWSDateTime']['output'];
  id: Scalars['String']['output'];
  name: Scalars['String']['output'];
  updatedAt: Scalars['AWSDateTime']['output'];
};

export type ClubDevice = {
  __typename?: 'ClubDevice';
  clubDeviceId: Scalars['String']['output'];
  clubId: Scalars['String']['output'];
  createdAt: Scalars['AWSDateTime']['output'];
  email: Scalars['AWSEmail']['output'];
  name: Scalars['String']['output'];
  table?: Maybe<Scalars['Int']['output']>;
  updatedAt: Scalars['AWSDateTime']['output'];
};

export type CreateClubDeviceInput = {
  clubId: Scalars['String']['input'];
  deviceName: Scalars['String']['input'];
  regToken: Scalars['String']['input'];
};

export type CreateClubInput = {
  newAdminEmail: Scalars['AWSEmail']['input'];
  newClubName: Scalars['String']['input'];
  recaptchaToken: Scalars['String']['input'];
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

export type DeleteClubDeviceInput = {
  clubDeviceId: Scalars['String']['input'];
  clubId: Scalars['String']['input'];
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

export type Mutation = {
  __typename?: 'Mutation';
  createClub: CreateClubResponse;
  createClubDevice: ClubDevice;
  deleteClubAndAdmin: DeleteClubAndAdminResponse;
  deleteClubDevice: ClubDevice;
  unexpectedError: UnexpectedErrorResponse;
  updateClub: Club;
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


export type MutationDeleteClubDeviceArgs = {
  input: DeleteClubDeviceInput;
};


export type MutationUpdateClubArgs = {
  input: UpdateClubInput;
};

export type Query = {
  __typename?: 'Query';
  getClub: Club;
  listClubDevices: ListClubDevicesOutput;
};


export type QueryGetClubArgs = {
  clubId: Scalars['String']['input'];
};


export type QueryListClubDevicesArgs = {
  input: ListClubDevicesInput;
};

export type Subscription = {
  __typename?: 'Subscription';
  createdClubDevice?: Maybe<ClubDevice>;
  deletedClubDevice?: Maybe<ClubDevice>;
  updatedClub?: Maybe<Club>;
};


export type SubscriptionCreatedClubDeviceArgs = {
  clubId: Scalars['String']['input'];
};


export type SubscriptionDeletedClubDeviceArgs = {
  clubId: Scalars['String']['input'];
};


export type SubscriptionUpdatedClubArgs = {
  id: Scalars['String']['input'];
};

export type UnexpectedErrorResponse = {
  __typename?: 'UnexpectedErrorResponse';
  neverGetsReturned: Scalars['String']['output'];
};

export type UpdateClubInput = {
  id: Scalars['String']['input'];
  name?: InputMaybe<Scalars['String']['input']>;
};

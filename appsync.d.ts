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
  newClubId: Scalars["String"]["output"];
  newUserId: Scalars["String"]["output"];
};

export type ExampleLambdaDataSourceInput = {
  contentType?: InputMaybe<Scalars["String"]["input"]>;
  extension: Scalars["String"]["input"];
};

export type ExampleLambdaDataSourceOutput = {
  __typename?: "ExampleLambdaDataSourceOutput";
  exampleOutputField: Scalars["String"]["output"];
};

export type IProfile = {
  backgroundImageUrl?: Maybe<Scalars["AWSURL"]["output"]>;
  bio?: Maybe<Scalars["String"]["output"]>;
  birthdate?: Maybe<Scalars["AWSDate"]["output"]>;
  createdAt: Scalars["AWSDateTime"]["output"];
  followersCount?: Maybe<Scalars["Int"]["output"]>;
  followingCount?: Maybe<Scalars["Int"]["output"]>;
  id: Scalars["ID"]["output"];
  imageUrl?: Maybe<Scalars["AWSURL"]["output"]>;
  likesCounts?: Maybe<Scalars["Int"]["output"]>;
  location?: Maybe<Scalars["String"]["output"]>;
  name: Scalars["String"]["output"];
  screenName: Scalars["String"]["output"];
  tweets: TweetsPage;
  tweetsCount?: Maybe<Scalars["Int"]["output"]>;
  website?: Maybe<Scalars["AWSURL"]["output"]>;
};

export type ITweet = {
  createdAt: Scalars["AWSDateTime"]["output"];
  id: Scalars["ID"]["output"];
  profile: IProfile;
};

export type Mutation = {
  __typename?: "Mutation";
  addClub: AddClubResponse;
  doTracerBulletMutation: TracerBulletOutput;
  editMyProfile: MyProfile;
  follow: Scalars["Boolean"]["output"];
  like: Scalars["Boolean"]["output"];
  removeClubAndAdmin: RemoveClubAndAdminResponse;
  reply: Reply;
  retweet: Scalars["Boolean"]["output"];
  tweet: Tweet;
  unfollow: Scalars["Boolean"]["output"];
  unlike: Scalars["Boolean"]["output"];
  unretweet: Scalars["Boolean"]["output"];
};

export type MutationAddClubArgs = {
  input: AddClubInput;
};

export type MutationDoTracerBulletMutationArgs = {
  tracerBulletMutationInput?: InputMaybe<TracerBulletMutationInput>;
};

export type MutationEditMyProfileArgs = {
  newProfile: ProfileInput;
};

export type MutationFollowArgs = {
  userId: Scalars["ID"]["input"];
};

export type MutationLikeArgs = {
  tweetId: Scalars["ID"]["input"];
};

export type MutationRemoveClubAndAdminArgs = {
  input: RemoveClubAndAdminInput;
};

export type MutationReplyArgs = {
  text: Scalars["String"]["input"];
  tweetId: Scalars["ID"]["input"];
};

export type MutationRetweetArgs = {
  tweetId: Scalars["ID"]["input"];
};

export type MutationTweetArgs = {
  text: Scalars["String"]["input"];
};

export type MutationUnfollowArgs = {
  userId: Scalars["ID"]["input"];
};

export type MutationUnlikeArgs = {
  tweetId: Scalars["ID"]["input"];
};

export type MutationUnretweetArgs = {
  tweetId: Scalars["ID"]["input"];
};

export type MyProfile = IProfile & {
  __typename?: "MyProfile";
  backgroundImageUrl?: Maybe<Scalars["AWSURL"]["output"]>;
  bio?: Maybe<Scalars["String"]["output"]>;
  birthdate?: Maybe<Scalars["AWSDate"]["output"]>;
  createdAt: Scalars["AWSDateTime"]["output"];
  followersCount?: Maybe<Scalars["Int"]["output"]>;
  followingCount?: Maybe<Scalars["Int"]["output"]>;
  id: Scalars["ID"]["output"];
  imageUrl?: Maybe<Scalars["AWSURL"]["output"]>;
  likesCounts?: Maybe<Scalars["Int"]["output"]>;
  location?: Maybe<Scalars["String"]["output"]>;
  name: Scalars["String"]["output"];
  screenName: Scalars["String"]["output"];
  tweets: TweetsPage;
  tweetsCount?: Maybe<Scalars["Int"]["output"]>;
  website?: Maybe<Scalars["AWSURL"]["output"]>;
};

export type OtherProfile = IProfile & {
  __typename?: "OtherProfile";
  backgroundImageUrl?: Maybe<Scalars["AWSURL"]["output"]>;
  bio?: Maybe<Scalars["String"]["output"]>;
  birthdate?: Maybe<Scalars["AWSDate"]["output"]>;
  createdAt: Scalars["AWSDateTime"]["output"];
  followedBy: Scalars["Boolean"]["output"];
  followersCount?: Maybe<Scalars["Int"]["output"]>;
  following: Scalars["Boolean"]["output"];
  followingCount?: Maybe<Scalars["Int"]["output"]>;
  id: Scalars["ID"]["output"];
  imageUrl?: Maybe<Scalars["AWSURL"]["output"]>;
  likesCounts?: Maybe<Scalars["Int"]["output"]>;
  location?: Maybe<Scalars["String"]["output"]>;
  name: Scalars["String"]["output"];
  screenName: Scalars["String"]["output"];
  tweets: TweetsPage;
  tweetsCount?: Maybe<Scalars["Int"]["output"]>;
  website?: Maybe<Scalars["AWSURL"]["output"]>;
};

export type ProfileInput = {
  backgroundImageUrl?: InputMaybe<Scalars["AWSURL"]["input"]>;
  bio?: InputMaybe<Scalars["String"]["input"]>;
  birthdate?: InputMaybe<Scalars["AWSDate"]["input"]>;
  imageUrl?: InputMaybe<Scalars["AWSURL"]["input"]>;
  location?: InputMaybe<Scalars["String"]["input"]>;
  name: Scalars["String"]["input"];
  website?: InputMaybe<Scalars["AWSURL"]["input"]>;
};

export type ProfilesPage = {
  __typename?: "ProfilesPage";
  nextToken?: Maybe<Scalars["String"]["output"]>;
  profiles?: Maybe<Array<IProfile>>;
};

export type Query = {
  __typename?: "Query";
  exampleLambdaDataSource: ExampleLambdaDataSourceOutput;
  getFollowers: ProfilesPage;
  getFollowing: ProfilesPage;
  getLikes: TweetsPage;
  getMyProfile: MyProfile;
  getMyTimeline: TweetsPage;
  getProfile: OtherProfile;
  getTracerBulletData: TracerBulletOutput;
  getTweets: TweetsPage;
};

export type QueryExampleLambdaDataSourceArgs = {
  input?: InputMaybe<ExampleLambdaDataSourceInput>;
};

export type QueryGetFollowersArgs = {
  limit: Scalars["Int"]["input"];
  nextToken?: InputMaybe<Scalars["String"]["input"]>;
  userId: Scalars["ID"]["input"];
};

export type QueryGetFollowingArgs = {
  limit: Scalars["Int"]["input"];
  nextToken?: InputMaybe<Scalars["String"]["input"]>;
  userId: Scalars["ID"]["input"];
};

export type QueryGetLikesArgs = {
  limit: Scalars["Int"]["input"];
  nextToken?: InputMaybe<Scalars["String"]["input"]>;
  userId: Scalars["ID"]["input"];
};

export type QueryGetMyTimelineArgs = {
  limit: Scalars["Int"]["input"];
  nextToken?: InputMaybe<Scalars["String"]["input"]>;
};

export type QueryGetProfileArgs = {
  screenName: Scalars["String"]["input"];
};

export type QueryGetTracerBulletDataArgs = {
  tracerBulletQueryInput?: InputMaybe<TracerBulletQueryInput>;
};

export type QueryGetTweetsArgs = {
  limit: Scalars["Int"]["input"];
  nextToken?: InputMaybe<Scalars["String"]["input"]>;
  userId: Scalars["ID"]["input"];
};

export type RemoveClubAndAdminInput = {
  clubId: Scalars["String"]["input"];
  userId: Scalars["String"]["input"];
};

export type RemoveClubAndAdminResponse = {
  __typename?: "RemoveClubAndAdminResponse";
  status: Scalars["String"]["output"];
};

export type Reply = ITweet & {
  __typename?: "Reply";
  createdAt: Scalars["AWSDateTime"]["output"];
  id: Scalars["ID"]["output"];
  inReplyToTweet: ITweet;
  inReplyToUsers?: Maybe<Array<IProfile>>;
  liked: Scalars["Boolean"]["output"];
  likes: Scalars["Int"]["output"];
  profile: IProfile;
  replies: Scalars["Int"]["output"];
  retweeted: Scalars["Boolean"]["output"];
  retweets: Scalars["Int"]["output"];
  text: Scalars["String"]["output"];
};

export type Retweet = ITweet & {
  __typename?: "Retweet";
  createdAt: Scalars["AWSDateTime"]["output"];
  id: Scalars["ID"]["output"];
  profile: IProfile;
  retweetOf: ITweet;
};

export type TracerBulletMutationInput = {
  tracerBulletMutationInputString: Scalars["String"]["input"];
};

export type TracerBulletOutput = {
  __typename?: "TracerBulletOutput";
  tracerBulletOutputString: Scalars["String"]["output"];
};

export type TracerBulletQueryInput = {
  tracerBulletQueryInputString: Scalars["String"]["input"];
};

export type Tweet = ITweet & {
  __typename?: "Tweet";
  createdAt: Scalars["AWSDateTime"]["output"];
  id: Scalars["ID"]["output"];
  liked: Scalars["Boolean"]["output"];
  likes: Scalars["Int"]["output"];
  profile: IProfile;
  replies: Scalars["Int"]["output"];
  retweeted: Scalars["Boolean"]["output"];
  retweets: Scalars["Int"]["output"];
  text: Scalars["String"]["output"];
};

export type TweetsPage = {
  __typename?: "TweetsPage";
  nextToken?: Maybe<Scalars["String"]["output"]>;
  tweets?: Maybe<Array<ITweet>>;
};

import { gql } from "graphql-tag";

export const GET_COPILOT_SUBSCRIPTION_COUNT = gql`
  query GetCopilotSubscriptionCount(
    $projectExId: String!
    $sessionType: CopilotSessionType!
  ) {
    copilotSubscriptionCount(
      projectExId: $projectExId
      sessionType: $sessionType
    )
  }
`;

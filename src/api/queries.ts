const GET_ALL_ISSUES: string = `{
  repository(owner: "zeikar", name: "issueage") {
    issues(first: 5, filterBy: {states: OPEN}) {
      nodes {
        title
        body
        createdAt
        labels(first: 10) {
          nodes {
            name
            color
          }
        }
        assignees(first: 10) {
          nodes {
            name
            login
            email
            avatarUrl
            url
          }
        }
        comments(first: 10) {
          nodes {
            author {
              login
              avatarUrl
              url
            }
            body
            createdAt
            lastEditedAt
          }
          pageInfo {
            hasNextPage
          }
        }
      }
      pageInfo {
        hasNextPage
      }
    }
  }
}`;

export { GET_ALL_ISSUES };

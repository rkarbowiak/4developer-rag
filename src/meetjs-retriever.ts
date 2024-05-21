import axios from "axios";
import fs from "fs";
import "dotenv/config";

const GITHUB_API_URL = "https://api.github.com";
const OWNER = "meetjspl";
const REPO = "poznan";
const ACCESS_TOKEN = process.env.GITHUB_ACCESS_TOKEN!;

// Function to retrieve issues from GitHub
async function getGithubIssues() {
  const url = `${GITHUB_API_URL}/repos/${OWNER}/${REPO}/issues`;

  try {
    const response = await axios.get(url, {
      headers: {
        Authorization: `token ${ACCESS_TOKEN}`,
        Accept: "application/vnd.github.v3+json",
      },
    });
    return response.data;
  } catch (error) {
    console.error("Error retrieving issues:", error);
    return [];
  }
}

// Function to retrieve comments for a specific issue
async function getIssueComments(issueNumber: number) {
  const url = `${GITHUB_API_URL}/repos/${OWNER}/${REPO}/issues/${issueNumber}/comments`;

  try {
    const response = await axios.get(url, {
      headers: {
        Authorization: `token ${ACCESS_TOKEN}`,
        Accept: "application/vnd.github.v3+json",
      },
    });
    return response.data;
  } catch (error) {
    console.error(
      `Error retrieving comments for issue #${issueNumber}:`,
      error,
    );
    return [];
  }
}

// Function to fetch issues along with their comments and tags
async function fetchIssuesWithComments() {
  const issues = await getGithubIssues();
  console.log(issues[1]);
  const issuesWithComments = [];

  for (const issue of issues) {
    const comments = await getIssueComments(issue.number);
    issuesWithComments.push({
      title: issue.title,
      tags: issue.labels.map((label: { name: string }) => label.name),
      comments: comments.map((comment: { body: string }) => comment.body),
      body: issue.body,
    });
  }

  return issuesWithComments;
}

// Execute and display issues with comments and tags
fetchIssuesWithComments().then((issues) => {
  console.log(JSON.stringify(issues, null, 2));

  //save to file
  fs.writeFileSync("issues.json", JSON.stringify(issues, null, 2));
});

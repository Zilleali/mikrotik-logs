// netlify/functions/upload-logs.js
const fetch = require("node-fetch");

exports.handler = async (event, context) => {
  // Simple auth with a token
  const secret = process.env.UPLOAD_SECRET; // Set in Netlify environment variables
  const token = event.queryStringParameters.token;
  if (token !== secret) {
    return { statusCode: 403, body: "Forbidden" };
  }

  // Get date for filename
  const date = new Date().toISOString().replace(/[:.]/g, "-");
  const filename = `logs/mikrotik-log-${date}.txt`;

  // MikroTik will send the file in the body as plain text
  const logData = event.body;

  // Push to GitHub using API
  const githubToken = process.env.GITHUB_TOKEN; // Set in Netlify env vars
  const repoOwner = "zilleali";
  const repoName = "mikrotik-logs";

  const apiUrl = `https://api.github.com/repos/${repoOwner}/${repoName}/contents/${filename}`;
  const message = `Add log file ${filename}`;

  const contentBase64 = Buffer.from(logData).toString("base64");

  const response = await fetch(apiUrl, {
    method: "PUT",
    headers: {
      "Authorization": `token ${githubToken}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      message,
      content: contentBase64
    })
  });

  if (!response.ok) {
    const errorText = await response.text();
    return { statusCode: 500, body: `GitHub API error: ${errorText}` };
  }

  return { statusCode: 200, body: "Log saved to GitHub" };
};

const head = `<head><title>email title</title></head>`;
const heading = `<h2>Welcome to the ScoreBridge-\${sls:stage} Portal</h2>`;
const list = `<ul><li>Username: {username}</li><li>Password: {####}</li></ul>`;
const footer = `<hr/><a href="https://localhost:3000/">https://localhost:3000/</a>`;
const info = `<p>Please use these credentials to <a href="http://localhost:3000/">login</a>:</p>${list}${footer}`;
const body = `<body>${heading}${info}</body>`;
export const inviteMessageTemplate = `<html>${head}${body}</html>`;

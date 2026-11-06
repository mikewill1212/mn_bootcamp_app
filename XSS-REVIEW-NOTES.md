# XSS Review Notes

Name: Michael Kofi Awuete Baidoo
Date: 6 November 2026

## Finding 1: Reflected XSS in the /search route

- Where untrusted data enters: the q value in the web address (req.query.q)
- Where it is output: written into the page by res.send
- Why it is dangerous: The app put whatever the visitor typed straight into the HTML page. The browser could not tell the difference between my input and the page's own code. When I searched for <b>hello</b>, the word showed in bold, which proved the browser was obeying my input as HTML. If it runs a bold tag, it would also run a script tag. An attacker could send someone a link with a script in it and use it to steal their session cookie, show a fake login form on a trusted page, or change what the page says.
- Fix applied:
  1. Output encoding. The search text is encoded before it goes into the page, so < becomes &lt;, > becomes &gt;, and & " ' are made safe too. At first I wrote my own escapeHtml function, but Snyk Code still flagged the line. I replaced it with the well-known escape-html library, and the finding cleared.
  2. Input validation. The value is converted to text, and searches longer than 100 characters are rejected with a 400 error.
  3. Content Security Policy. Every response now has the header Content-Security-Policy: default-src 'self', which tells the browser not to run scripts written inside the page.
- Defence layers used: validation on input / encoding on output / CSP in the browser (all three)
- How I retested:
  - Opened http://localhost:3000/search?q=<b>hello</b>. The tags now show as plain text with no bold. Viewing the source (Ctrl+U) shows &lt;b&gt;hello&lt;/b&gt;.
  - Checked that http://localhost:3000/search?q=hello still works normally.
  - In DevTools (F12 → Network → Response Headers) I confirmed the Content-Security-Policy: default-src 'self' header is sent.
  - Ran snyk code test again. The Cross-site Scripting finding is gone.

## What SonarQube for IDE said about /search

SonarQube for IDE did not report any XSS issue in the /search route. In standalone mode it does not trace data from the web address (req.query.q) through to res.send, so it cannot detect injection flaws like XSS or SQL injection. Snyk Code found the XSS because it follows data from source to sink (taint analysis).

SonarQube did report a different security issue on the line const app = express();:
- Rule javascript:S5689, "Web application technologies should not disclose version information".
- Express sends an X-Powered-By: Express header on every response by default. This tells attackers which software the server uses, so they can look up known vulnerabilities for it.
- Fix: disable the header with app.disable('x-powered-by'), or use the Helmet library, which removes it and adds other security headers. I will fix this on Thursday with Helmet.

This shows the two tools are good at different things. Snyk Code is better at tracing injection flaws, and SonarQube is better at insecure settings and code quality. A review needs both.

## One thing I would check in the next app I review

I would check every place where user input is written into a page, and make sure it goes through a trusted encoding library, not a home-made function. My own escapeHtml function looked correct, but the SAST tool did not recognise it as a sanitiser. That means a reviewer or tool could miss real problems, or give false alarms, when developers write their own. I would also check that a Content Security Policy header is set, as a second layer in case encoding is missed somewhere.
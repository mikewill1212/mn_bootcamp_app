# Secure Development Checklist

Name: DripGhad
Date: 5 November 2026

## 1. Pipeline map

| Stage | Security activity | Example tool | Gate (what blocks progress) |
| --- | --- | --- | --- |
| Plan | Write security requirements and assess risk | Checklist, gap analysis | Requirements approved |
| Design | Threat modelling | STRIDE | Top threats have countermeasures |
| Code | Scan while you type and peer review | SonarQube for IDE, Snyk IDE plugin | No hard-coded secrets, pull request reviewed |
| Build | SAST, SCA and secrets scan | Snyk, Dependency-Check | No new High or Critical findings |
| Test | Security tests and DAST | OWASP ZAP, penetration test | No open High findings |
| Deploy | Harden configuration and protect secrets | Security headers, secrets manager | Configuration checklist signed off |
| Operate | Monitor, patch and audit | Dependabot, logs, scheduled scans | Critical patches within agreed time |



## 2. My own additions (one more security activity for each stage)

- Plan: Define the security goals, risks, and requirements before coding begins.
- Design: Identify threats and decide how the system will defend against them.
- Code: Review code and scan for issues such as secrets, unsafe inputs, or vulnerable logic.
- Build: Check dependencies, code scanning results, and secret exposure before creating the build.
- Test: Validate that security controls work and that attacks like injection or misconfigurations are blocked.
- Deploy: Harden the live configuration, protect secrets, and confirm the environment is secure.
- Operate: Monitor the application, patch issues quickly, and keep security controls up to date.

## 3. My pass or fail rules for three gates

1. Gate: Build. Rule: the build fails if Snyk reports any High or Critical issue.
2. Gate:
3. Gate:

## 4. SonarQube for IDE warnings I saw in app.js

- Issue: The `/user` route accepted untrusted query input directly in the SQL query, allowing injection payloads such as `name=x' OR '1'='1`.
  - Solution: Validate the `name` value before using it and use a parameterized query so the input is treated as data, not executable SQL.
  - Result: The app now rejects unsafe input and only returns matching records for valid names.

- Issue: The app was exposing framework version details via the default `X-Powered-By` header.
  - Solution: Disable the header with `app.disable('x-powered-by')` or use Helmet middleware.

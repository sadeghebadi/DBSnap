# Page snapshot

```yaml
- generic [ref=e1]:
  - generic [ref=e2]:
    - generic [ref=e3]:
      - generic [ref=e5]:
        - img [ref=e6]
        - text: DBSnap
      - blockquote [ref=e9]:
        - paragraph [ref=e10]: “Create an account to start managing your database snapshots securely.”
    - generic [ref=e12]:
      - generic [ref=e13]:
        - heading "Create an account" [level=1] [ref=e14]
        - paragraph [ref=e15]: Enter your email below to create your account
      - generic [ref=e16]:
        - generic [ref=e18]:
          - generic [ref=e19]:
            - generic [ref=e20]: Email
            - textbox "Email" [ref=e21]:
              - /placeholder: name@example.com
              - text: register-1767787151424@dbsnap.com
          - generic [ref=e22]:
            - generic [ref=e23]: Password
            - textbox "Password" [active] [ref=e24]: Password123!
          - button "Sign Up" [ref=e25]
        - generic [ref=e30]: Or continue with
        - button "Google" [ref=e31]:
          - img [ref=e32]
          - text: Google
      - paragraph [ref=e37]:
        - link "Already have an account? Sign In" [ref=e38] [cursor=pointer]:
          - /url: /login
  - button "Open Next.js Dev Tools" [ref=e44] [cursor=pointer]:
    - img [ref=e45]
  - alert [ref=e48]
```
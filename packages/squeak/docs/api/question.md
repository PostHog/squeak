# Question

Used to create a new question

**URL** : `/api/question`

**Method** : `POST`

**Auth required** : YES

**Data constraints**

```json
{
  "token": "[supabase user access token]",
  "slug": "[url of the page the question relates to, normally window.location.pathname]",
  "subject": "[subject of the question]",
  "body": "[body of the question]"
}
```

**Data example**

```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJhdWQiOiJhdXRoZW50aWNhdGVkIiwiZXhwIjoxNjQ2OTQ0MjY4LCJzdWIiOiIwM2NkNGVmNy0xZDM3LTRkZjItYTNkZC02MGVkNTI2OTZiZGUiLCJlbWFpbCI6ImpvZXNhdW5kZXJzb25AbWUuY29tIiwicGhvbmUiOiIiLCJhcHBfbWV0YWRhdGEiOnsicHJvdmlkZXIiOiJlbWFpbCIsInByb3ZpZGVycyI6WyJlbWFpbCIsImdpdGh1YiJdfSwidXNlcl9tZXRhZGF0YSI6eyJhdmF0YXJfdXJsIjoiaHR0cHM6Ly9hdmF0YXJzLmdpdGh1YnVzZXJjb250ZW50LmNvbS91LzExMjcyNTA5P3Y9NCIsImVtYWlsIjoiam9lc2F1bmRlcnNvbkBtZS5jb20iLCJlbWFpbF92ZXJpZmllZCI6dHJ1ZSwiZnVsbF9uYW1lIjoiSm9lIFNhdW5kZXJzb24iLCJpc3MiOiJodHRwczovL2FwaS5naXRodWIuY29tIiwibmFtZSI6IkpvZSBTYXVuZGVyc29uIiwicHJlZmVycmVkX3VzZXJuYW1lIjoiam9lc2F1bmRlcnNvbiIsInByb3ZpZGVyX2lkIjoiMTEyNzI1MDkiLCJzdWIiOiIxMTI3MjUwOSIsInVzZXJfbmFtZSI6ImpvZXNhdW5kZXJzb24ifSwicm9sZSI6ImF1dGhlbnRpY2F0ZWQifQ.PaW8-dDQwBY9K4fnQBkNAGRZXMXqt7botkjtev8DJ58",
  "slug": "/docs/getting-started",
  "subject": "How do I do this?",
  "body": "I am trying to do this, but getting that."
}
```

## Success Response

**Code** : `200 OK`

**Content example**

```json
{
  "messageId": 246,
  "profileId": "d5470552-431d-4ac4-abfb-55fbcbb5b6a7",
  "subject": "How do I do this?",
  "body": "I am trying to do this, but getting that.",
  "slug": [
    "/docs/getting-started"
  ]
}
```

## Error Response

**Condition** : If a required field is missing

**Code** : `400 BAD REQUEST`

**Content** :

```json
{
  "error": "Missing required fields"
}
```

**Condition** : If a user is not authenticated

**Code** : `401 UNAUTHORIZED`

**Content** :

```json
{
  "error": "Unauthorized"
}
```

**Condition** : If something went wrong adding the message

**Code** : `500 INTERNAL SERVER ERROR`

**Content** :

```json
{
  "error": "[Error message]"
}
```
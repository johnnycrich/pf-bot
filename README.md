# Petfinder auto-responder 🐾

This is a bot that will authenticate to an adoption agency's Gmail inbox, read recent messages and see if any are Petfinder inquiries, and query an agency's internal DB to see if the dog in question is pending adoption. If so, an auto-reply stating so goes to sender, then the inquiry is marked read, labelled.

**TODO:**

*  Mongo model for dog schema.
*  GraphQL schema and mutation.
*  Send response.
*  Tag emails.
*  Subscribe to inbox to poll changes.
*  Log and save all errors, if exception occurs, keep email unread and flag.
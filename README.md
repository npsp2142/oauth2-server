# oauth2-server

This program act as a user agent in the oauth2 protocol. 

## Installation 

1. Download and run keycloak docker image.
2. Fill in `.env` for define environment variable. The below is the sample `.env` file

```
GOOGLE_CLIENT_ID = 776342123456-77njualb0b6of6m5cdsibh779r7sap5o.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET = GOCSPX-j5YBNogHXKbi1dOpP-123456789
MONGO_CONNECTION_STRING = mongodb+srv://admin:admin@cluster0.123456789.mongodb.net/internet_sec_project?retryWrites=true&w=majority

KEYCLOAK_AUTHORIZATION_URL = http://localhost:8081/realms/master/protocol/openid-connect/auth
KEYCLOAK_TOKEN_UTL = http://localhost:8081/realms/master/protocol/openid-connect/token
KEYCLOAK_CLIENT_ID = comp-internet-sec
KEYCLOAK_CLIENT_SECRET = bdeOQGB3n6sQMPPbl0pnQEZUgRNsCDFf
KEYCLOAK_CALLBACK_URL = http://localhost:5000/auth/securityproject/callback
```


1. Type `npm install` to install the javascript libraries.
2. Type `npm start` to run the node server. 
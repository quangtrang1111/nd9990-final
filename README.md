# My Album app

## Functionality of the application

The idea of this app is an app could help you create photo albums.
And upload multiple photos into your ablum.

## System architecture

The application use the same architecture of the nd9990 project 4:
* Severless for backend
* ReactJS for the frontend

## CI/CD

I integrated this Github repo with Travis CI to deploy the client app to S3 static website hosting (with CloudFront distribution).
![Alt text](images/travis-ci-1.png?raw=true)
![Alt text](images/travis-ci-2.png?raw=true)

## How to build this app?

### Backend

```
cd backend
npm install
serverless deploy --verbose
```

### Frontend

```
cd client
npm install
npm start
```

## How to test this app?

1. Open the CloudFront url [d3oduij8wgokna.cloudfront.net](https://d3oduij8wgokna.cloudfront.net)
2. Click Login button -> login your account with Auth0
3. Enter your new ablum name -> click add button
4. In Home pahe -> click eye icon to view your album -> upload multiple photos to S3
5. In Home pahe -> click X icon to delete the album from DynamoDB


![Alt text](images/home-page.png?raw=true)
![Alt text](images/view-album.png?raw=true)

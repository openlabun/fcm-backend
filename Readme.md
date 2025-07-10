# FCM Backend

Service for sending Firebase Cloud Messaging (FCM) notifications.

docker build -t fcm-backend-image .
docker run -d -it -p 5040:3000 --restart unless-stopped --name fcm-backend fcm-backend-image
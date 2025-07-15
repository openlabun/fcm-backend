# FCM Backend

Service for sending Firebase Cloud Messaging (FCM) notifications.

docker build -t fcm-backend-image .
docker run -d -it -p 5040:3000 --restart unless-stopped --name fcm-backend fcm-backend-image


curl -X POST "http://localhost:5040/subscribe"   -H "Content-Type: application/json"   -d "{\"token\":\"cx-eEovCR76W6IDK8uTGOc:APA91bGpUIX_xxBLtF8NFuvkSJMS3YopDmhOTSUQ0-0rOkwaeaV3FCdbt6xR5x0WAB09xPjaPdTqes-yt-5z-YWUBPXeEBfwX02gtDo_-3cyzOMerT15Iy8\",\"topic\":\"activityUpdate\"}"
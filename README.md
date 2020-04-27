## Install Dependencies

### `npm install`

## To Run

1. Configure App
   1.1 Create .env file set `PORT=<PORT>`

2. Run App
   2.1 To run demo video player with user interaction with player being logged in console run `npm start`

3. Connecting to socket server
   3.1 After running. navigate to `/room/<SOCKET_SERVER_URL>:<SOCKET_SERVER_PORT&<ROOM_NAME>&<ACTION>`
   3.1.1 Example: `/room/localhost:8090&party_room&create`
   3.2 Watch console logs

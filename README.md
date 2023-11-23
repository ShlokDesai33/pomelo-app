# Hello!

- This readme will show you how to run this application locally.

## Run

After you've cloned this repo, navigate to it's root directory. From your terminal:

```sh
npm run build . -t pomelo-app
docker compose up
```

This runs the server and the database in tandem.

Next, navigate to http://localhost:3000/setup to setup the postgress db. You will see the following response: 

```json
{ success: true }
```

Finally, navigate to http://localhost:3000 and voila!

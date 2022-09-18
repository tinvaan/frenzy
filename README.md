# Frenzy ![Continous Integration](https://github.com/tinvaan/frenzy/actions/workflows/ci.yml/badge.svg)

The service is publicly hosted on a Heroku dyno and is available at https://phrenzy.herokuapp.com

## API Usage

The frenzy service exposes the following API endpoints. (Declared in `app/routes.js`)

* `GET /users` - List all users.
* `GET /users/<user-id>` - Display information about a user.
* `GET /users/<user-id>/purchases` - Lists the purchase history for the requested user.
* `POST /users/<user-d>/purchase` - Initiate a purchase under a user.
   ```bash
   -d {
      'dish': 'Sweetbreads',
      'restaurant': <restaurant-id>,
      'price': 45.6  // [OPTIONAL] Offerred purchase pric, overrides the price given on the menu
   }
   ```

* `GET /restaurants` - List all restaurants.
* `GET /restaurants/<restaurant-id>` - Display information about a restaurant.
* `GET /restaurants/open?time=<datetime ISO string>` - List all restaurants open at a certain datetime.
* `GET /restaurants/sort?x=<int>&y=<int>&price=<float>` - Alphabetically sorted restaurants with dishes within a price range. <br/>
    &nbsp; &nbsp;`x` - number of dishes falling within price range. <br/>
    &nbsp; &nbsp;`y` - number of restaurants to be returned. <br/>
    &nbsp; &nbsp;`price` - price range to filter against.
* `GET /restaurants/search?name=<string>` - Search for restaurants or dishes by name.

## ETL scripts
Launch the ETL scripts to setup the database via `npm` command.
```bash
▶ npm run store -- up  // setup the database

> frenzy@1.0.0 store
> node --no-deprecation data/store.js


▶ npm run store -- down  // Cleanup the database

> frenzy@1.0.0 store
> node --no-deprecation data/store.js

```

## Development

Frenzy is built using `Node.js` and uses `sqlite` as the database interfaced via an ORM (`Sequelize`).

To run the server locally,

```bash
▶ git clone https://github.com/tinvaan/frenzy.git
▶ cd frenzy
▶ npm ci
▶ npm start

> frenzy@1.0.0 prestart
> node --no-deprecation data/store.js up


> frenzy@1.0.0 start
> node --no-deprecation app/index.js start

frenzy listening at http://[::]:3000

```

The server should be up and running locally at port 3000. You may choose to edit the port from the config files under `config/` folder.

Optionally, you can use the provided `Dockerfile` to run the service in a container.
```bash
▶ docker build -t frenzy/latest .
▶ docker run -p 3000:3000 frenzy:latest

> frenzy@1.0.0 prestart /frenzy
> node --no-deprecation data/store.js up


> frenzy@1.0.0 start /frenzy
> node --no-deprecation app/index.js start

frenzy listening at http://[::]:3000

```
Navigate to http://localhost:3000 to access the service.

## Unit tests

Make use of the `npm test` script to launch the test suite.
```bash
▶ npm test

> frenzy@1.0.0 test
> jest --silent --runInBand --testTimeout=1000000

 PASS  tests/app/views/restaurants.js (7.506 s)
 PASS  tests/app/views/users.js (6.023 s)
 PASS  tests/utils/datetime.js
 PASS  tests/data/store.js (27.551 s)
-----------------|---------|----------|---------|---------|--------------------
File             | % Stmts | % Branch | % Funcs | % Lines | Uncovered Line #s
-----------------|---------|----------|---------|---------|--------------------
All files        |   94.87 |    84.72 |     100 |   94.87 |
 app             |   96.38 |    77.77 |     100 |   96.38 |
  index.js       |      95 |    77.77 |     100 |      95 | 58-60
  routes.js      |     100 |      100 |     100 |     100 |
 app/models      |     100 |      100 |     100 |     100 |
  restaurants.js |     100 |      100 |     100 |     100 |
  users.js       |     100 |      100 |     100 |     100 |
 app/views       |   94.64 |    86.11 |     100 |   94.64 |
  restaurants.js |   93.97 |       85 |     100 |   93.97 | 48-50,55-56
  users.js       |   95.29 |     87.5 |     100 |   95.29 | 81-84
 config          |     100 |      100 |     100 |     100 |
  default.js     |     100 |      100 |     100 |     100 |
 data            |      89 |       75 |     100 |      89 |
  store.js       |      89 |       75 |     100 |      89 | 77-78,87-88,94-100
 tests/fixtures  |   91.66 |       50 |     100 |   91.66 |
  index.js       |   91.66 |       50 |     100 |   91.66 | 9
 utils           |     100 |      100 |     100 |     100 |
  datetime.js    |     100 |      100 |     100 |     100 |
-----------------|---------|----------|---------|---------|--------------------

Test Suites: 4 passed, 4 total
Tests:       18 passed, 18 total
Snapshots:   0 total
Time:        41.787 s
```

## Deployment

Once all unit tests pass and the CI is green, you may deploy your source to Heroku via the CI. Simply push your changes to the `deploy` branch and watch Github Actions do the rest.


## Contributing

Report issues via the Github issue tracker and or reach out to Harish Navnit <harishnavnit@gmail.com> for any queries. Pull requests are welcome!

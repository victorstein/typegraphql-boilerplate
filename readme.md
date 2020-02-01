# TYPEGRAPHQL BOILERPLATE

This is a boilerplate project to quickly create a graphql API with all the gooddies that come along with typescript.

## Installation

* Clone the repo
	```git clone https://github.com/victorstein/typegraphql-boilerplate.git```

* Enter the repo directory
	```cd typegraphql-boilerplate```

* Install the dependencies
	```npm install```

* Create a .env file with the following set up. (examples in parentheses)

```
NODE_ENV = string (development || production)
PORT = int (4000)
TOKEN_SECRET = string (tokensecret)
REFRESH_TOKEN_SECRET = string (refreshtokensecret)
TOKEN_SECRET_EXPIRATION = string (15m)
REFRESH_TOKEN_SECRET_EXPIRATION = string (1d)
DB_USER = string (mongodb user)
DB_PASS = string (mongodb pass)
DB_URI = string (@test.mongodb.net/test?retryWrites=forge&w=majority)
EMAIL_PROVIDER_HOST = string (smtp.gamil.com)
EMAIL_PROVIDER_TLS_PORT = int (587)
EMAIL_PROVIDER_SSL_PORT = int (465)
EMAIL_PROVIDER_USER = string (smtp user)
EMAIL_PROVIDER_PASS = string (smtp password)
DOMAIN = string (localhost)
GLOBAL_SECRET = string (globalsecret)
EMAIL_VERIFICATION_EXPIRY = string (1w)
PASSWORD_RESET_REQUEST_EXPIRY = string (1d)
OFFENSE_EXPIRY = string (1m | 1h | 1d | 1w | 1y)[n]
ALLOWED_ORIGINS = string[] ('http://localhost:3000')
```

* Finally, just run ```npm run dev``` for development, or ```npm run build``` for webpack, or ```npm start``` (once built) to run production

* I you want to quickly run the API for development (no type checking) you may user the command ```npm run fast-dev```

## Contributing

Feel free to submit your PRs for review. There's currently no template for contribution. As the project grows we will look into further implementation of this.

## Authors

<!-- prettier-ignore -->
<table><tr><td align="center"><a href="http://victorstein.github.io"><img src="https://avatars3.githubusercontent.com/u/11080740?v=3" width="100px;" /><br /><sub><b>Alfonso Gomez</b></sub></a><br /><a href="#question" title="Answering Questions">💬</a> <a href="#" title="Documentation">📖</a><a href="#tool" title="Tools">🔧</a> <a href="#review" title="Reviewed Pull Requests">👀</a> <a href="#maintenance" title="Maintenance">😎</a></td></table>

## License

This project is licensed under the ISC License 
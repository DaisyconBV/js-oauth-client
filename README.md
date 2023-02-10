# Daisycon oAuth CLI client

## Installation

### Using yarn
```text
yarn add @daisycon/js-oauth-client
```

### Using npm
```text
npm install @daisycon/js-oauth-client
```

## Usage in your code

To start the oAuth request in your initial starting page add the following snippit

```typescript
import {OauthService, PkceService} from '@daisycon/js-oauth-client';

const oAuthService: OauthService = new OauthService(new PkceService());
oAuthService.startAuthorizationRequest(YOUR_CLIENT_ID, YOUR_AUTHORIZED_REDIRECT_URI);
```

Then on the authorized redirect URI add the following snippet. 
Then store the returned tokens somewhere safe.

```typescript
import {AccessTokenResponseInterface, OauthService, PkceService} from '@daisycon/js-oauth-client';

const oAuthService: OauthService = new OauthService(new PkceService());
const accessTokens: AccessTokenResponseInterface = oAuthService.startAccessTokenExchange(YOUR_CLIENT_ID, YOUR_AUTHORIZED_REDIRECT_URI);
console.log(accessTokens);
```

## Running as CLI script
# js-oauth-client

import {config} from 'src/config';
import {GrantTypeEnum} from 'src/enums/grant-type.enum';
import {AccessTokenRequestInterface} from 'src/interfaces/access-token-request.interface';
import {AccessTokenResponseInterface} from 'src/interfaces/access-token-response.interface';
import {AuthRequestInterface} from 'src/interfaces/auth-request.interface';
import {AuthResponseInterface} from 'src/interfaces/auth-response.interface';
import {PkceService} from 'src/pkce.service';

export class OauthService {
	private static readonly STORAGE_CODE_VERIFIER: string = 'code_verifier';

	constructor(
		private pkceService: PkceService
	) {}

	public async getAccessToken(
		clientId: string,
		redirectUri: string,
		authorizationCode: string,
		codeVerifier: string,
		clientSecret: string = ''
	): Promise<AccessTokenResponseInterface> {
		const data: AccessTokenRequestInterface = {
			client_id: clientId,
			client_secret: clientSecret, // Leave empty on client side requests
			code: authorizationCode,
			code_verifier: codeVerifier,
			grant_type: GrantTypeEnum.AUTHORIZATION_CODE,
			redirect_uri: redirectUri,
		};

		console.log(data);

		try {
			const response: Response = await fetch(
				config.accessTokenUri,
				{
					method: 'POST',
					headers: {'Content-Type': 'application/json'},
					body: JSON.stringify(data)
				}
			);
			return <AccessTokenResponseInterface><unknown>response.json();
		}
		catch (e) {
			throw e;
		}
	}

	public async getAuthorizationRequestUri(clientId: string, redirectUri: string, codeVerifier: string): Promise<string> {
		const codeChallenge: string = await this.pkceService.generateCodeChallenge(codeVerifier);
		const requestParams: AuthRequestInterface = {
			response_type: 'code',
			client_id: clientId,
			code_challenge_method: 'S256',
			code_challenge: codeChallenge,
			redirect_uri: redirectUri
		};
		return `${config.authorizeUri}?${new URLSearchParams(<Record<string, string>><unknown>requestParams).toString()}`;
	}

	public async refreshAccessToken(clientId: string, redirectUri: string, refreshToken: string, clientSecret: string = ''): Promise<AccessTokenResponseInterface> {
		const data: AccessTokenRequestInterface = {
			grant_type: GrantTypeEnum.REFRESH_TOKEN,
			refresh_token: refreshToken,
			client_id: clientId,
			client_secret: clientSecret, // Leave empty on client side requests
			redirect_uri: redirectUri
		};

		try {
			const response: Response = await fetch(
				config.accessTokenUri,
				{
					method: 'POST',
					headers: {'Content-Type': 'application/json'},
					body: JSON.stringify(data)
				}
			);
			return <AccessTokenResponseInterface><unknown>response.json();
		}
		catch (e) {
			throw e;
		}
	}

	public async startAuthorizationRequest(clientId: string, redirectUri: string): Promise<void> {
		const codeVerifier: string = this.pkceService.generateRandomString();
		sessionStorage.setValue(OauthService.STORAGE_CODE_VERIFIER, codeVerifier);

		document.location.href = await this.getAuthorizationRequestUri(clientId, redirectUri, codeVerifier);
	}

	public async startAccessTokenExchange(clientId: string, redirectUri: string): Promise<AccessTokenResponseInterface> {
		return this.getAccessToken(
			clientId,
			redirectUri,
			this.getAuthorizationCodeFromURI(),
			sessionStorage.getValue(OauthService.STORAGE_CODE_VERIFIER)
		);
	}

	public getAuthorizationCodeFromURI(): string|null {
		const urlSearchParams: URLSearchParams = new URLSearchParams(window.location.search);
		const queryParams: AuthResponseInterface = <AuthResponseInterface><unknown>Object.fromEntries(urlSearchParams.entries());
		return queryParams?.code || null;
	}
}

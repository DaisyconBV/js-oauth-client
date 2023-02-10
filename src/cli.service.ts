import * as fs from 'fs';
import * as readline from 'readline';
import {Interface} from 'readline';
import {config} from 'src/config';
import {AccessTokenResponseInterface} from 'src/interfaces/access-token-response.interface';
import {CliArgumentsInterface} from 'src/interfaces/cli-arguments.interface';
import {OauthService} from 'src/oauth.service';
import {PkceService} from 'src/pkce.service';
import {parse} from 'ts-command-line-args';

export class CliService {
	private static readonly MAX_ATTEMPTS: number = 3;

	private codeVerifier: string;
	private oAuthService: OauthService;
	private pkceService: PkceService;
	private cliArguments: CliArgumentsInterface;

	constructor() {
		this.pkceService = new PkceService();
		this.oAuthService = new OauthService(this.pkceService);
	}

	private loadCliArguments(): void {
		this.cliArguments = parse<CliArgumentsInterface>({
			// @ts-ignore
			clientId: {type: String},
			clientSecret: {type: String, optional: true},
			redirectUri: {type: String, optional: true},
			outputFile: {type: String, optional: true},
		});
	}

	public async run(): Promise<void> {
		// if (require.main !== module) {
		// 	throw new Error('Script can only be run via CLI');
		// }
		this.loadCliArguments();

		this.codeVerifier = this.pkceService.generateRandomString();
		const authorizationUrl: string = await this.oAuthService.getAuthorizationRequestUri(
			this.cliArguments.clientId,
			this.cliArguments.redirectUri || config.cliRedirectUri,
			this.codeVerifier
		);

		// Comma separated console.log adds whitespace
		console.log('Please open the following URL in your browser, then copy paste the responded "code" back here\n\n');
		console.log(authorizationUrl);
		console.log('\n\n');

		this.askForResponse();
	}

	private askForResponse(attempt: number = 0): void {
		const prompt: Interface = readline.createInterface({
			input: process.stdin,
			output: process.stdout
		});
		prompt.question(
			'Please enter the response code:\n',
			(authorizationCode: string) => {
				prompt.close();
				++attempt;
				if (!authorizationCode?.trim()?.length) {
					if (attempt >= CliService.MAX_ATTEMPTS) {
						console.log('No response provided, exiting...\n');
						process.exit();
						return;
					}

					console.log('\n\n');
					return this.askForResponse(attempt);
				}

				this.handleCodeResponse(authorizationCode);
			}
		);
	}

	private handleCodeResponse(authorizationCode: string): void {
		this.oAuthService.getAccessToken(
			this.cliArguments.clientId,
			this.cliArguments.redirectUri || config.cliRedirectUri,
			authorizationCode,
			this.codeVerifier,
			this.cliArguments.clientSecret || ''
		).then((tokens: AccessTokenResponseInterface) => this.handleTokens(tokens));
	}

	private handleTokens(tokens: AccessTokenResponseInterface): void {
		if (!this.cliArguments.outputFile?.length) {
			console.log('Here are your access tokens, save them somewhere safe\n\n');
			console.log(tokens);
			return;
		}

		fs.writeFileSync(this.cliArguments.outputFile, JSON.stringify(tokens));

		console.log(`Tokens written to output file: ${this.cliArguments.outputFile}\n\n`);
		process.exit();
	}
}

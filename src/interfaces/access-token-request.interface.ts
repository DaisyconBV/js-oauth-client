import {GrantTypeEnum} from 'src/enums/grant-type.enum';

export interface AccessTokenRequestInterface {
	client_id: string;
	client_secret: string;
	code?: string;
	code_verifier?: string;
	grant_type: GrantTypeEnum;
	redirect_uri: string;
	refresh_token?: string;
	state?: string;
}

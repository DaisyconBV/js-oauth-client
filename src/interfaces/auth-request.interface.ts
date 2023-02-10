export interface AuthRequestInterface {
	client_id: string;
	code_challenge: string;
	code_challenge_method: 'S256';
	redirect_uri: string;
	response_type: 'code';
}

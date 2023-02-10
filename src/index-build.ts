import {OauthService} from 'src/oauth.service';
import {PkceService} from 'src/pkce.service';

module.exports = () => new OauthService(new PkceService());

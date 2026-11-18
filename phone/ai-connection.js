import config from './local-config.json';
export const outfitUrl=config.helperUrl+'/outfit';
export const requestHeaders={'Content-Type':'application/json','X-Matchmaker-Token':config.token};

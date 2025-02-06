const DEV_API_URL = 'http://192.168.1.92:5000';
const PROD_API_URL = 'https://votre-api-production.com';

export const API_URL = __DEV__ ? DEV_API_URL : PROD_API_URL; 
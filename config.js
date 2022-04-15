import dotenv from 'dotenv';
dotenv.config();

function required(key, defaultValue = undefined) {
	const value = process.env[key] || defaultValue;
	if(value == null){
		throw new Error(`Key ${key} is undefined`); 
	}
	return value;
}

export const config = {
	jwt: {
		secretKey: required('JWT_SECRET'),
		expiresInSec: parseInt(required('JWT_EXPIRES_SEC',86400)),
	},
	bcrypt: {
		saltRounds: parseInt(required('BCRYPT_SALT_ROUNDS',10)),
	},
	host: {
		port: parseInt(required('HOST_PORT', 8080)),
	},
	db: {
		host: required('DB_HOST'),
		user: required('DB_USER'),
		database: required('DB_DATABASE'),
		password: required('DB_PASSWORD'),
	},
};

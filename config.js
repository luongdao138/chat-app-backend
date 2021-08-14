const domain = 'https://luong-auth-app-2.herokuapp.com';
// const domain = 'http://localhost:5000';

module.exports = {
  google: {
    clientID:
      '63402635672-qg2gll1l0hojkojtknn2e2r4t4dlhfgj.apps.googleusercontent.com',
    clientSecret: 'JHUhWbI4kOy0w6QHR9i_5sS3',
    callbackURL: `${domain}/api/auth/google/callback`,
  },
  facebook: {
    clientID: '231533002213191',
    clientSecret: 'babbb96d7a4db3e6f9a82de907e92b39',
    callbackURL: `${domain}/api/auth/facebook/callback`,
  },
  github: {
    clientID: 'Iv1.a066822365cc5999',
    clientSecret: '3b95dd30b2146e8a05cd4c83cd39dbad922bf79d',
    callbackURL: `${domain}/api/auth/github/callback`,
  },
};

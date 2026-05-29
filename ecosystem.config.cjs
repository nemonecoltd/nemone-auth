module.exports = {
  apps: [{
    name: 'auth',
    script: 'node_modules/.bin/next',
    args: 'start -p 3003',
    cwd: '/var/www/auth',
    env: {
      NODE_ENV: 'production',
      HOSTNAME: '0.0.0.0'
    }
  }]
};

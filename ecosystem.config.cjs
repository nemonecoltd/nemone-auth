module.exports = {
  apps: [{
    name: 'auth',
    script: 'npm',
    args: 'start',
    cwd: '/var/www/auth',
    env: {
      NODE_ENV: 'production',
      PORT: 3003,
      HOSTNAME: '0.0.0.0'
    }
  }]
};

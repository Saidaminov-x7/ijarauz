module.exports = {
  apps: [
    {
      name: 'ijara-uz',
      script: './node_modules/next/dist/bin/next',
      args: 'start -p ' + (process.env.PORT || 3000),
      exec_mode: 'cluster',
      instances: 'max', // Use all available CPU cores
      autorestart: true,
      watch: false,
      max_memory_restart: '1G',
      env: {
        NODE_ENV: 'production',
        PORT: process.env.PORT || 3000,
      },
      env_production: {
        NODE_ENV: 'production',
        PORT: process.env.PORT || 3000,
      },
      node_args: [
        '--optimize-for-size',
        '--max-old-space-size=2048', // Limit memory usage
        '--gc-interval=100' // Run garbage collection more frequently
      ],
      output: './logs/out.log',
      error: './logs/error.log',
      merge_logs: true,
      log_date_format: 'YYYY-MM-DD HH:mm Z'
    }
  ],
  
  deploy: {
    production: {
      user: 'node',
      host: process.env.DEPLOY_HOST || 'your-server-ip',
      ref: 'origin/main',
      repo: 'git@github.com:your-username/ijara.uz.git',
      path: '/var/www/ijara.uz',
      'post-deploy': 'npm install && npm run build && pm2 reload ecosystem.config.js --env production',
      env: {
        NODE_ENV: 'production'
      }
    }
  }
};
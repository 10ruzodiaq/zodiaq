// Configuration PM2 pour le bot Discord
// Utilise cette config avec : pm2 start ecosystem.config.js
module.exports = {
  apps: [
    {
      name: 'bot-combo',
      script: 'src/index.js',
      watch: false,
      autorestart: true,           // Redémarre automatiquement en cas de crash
      max_restarts: 10,            // Max 10 redémarrages en 15 min
      min_uptime: '10s',           // Le bot doit tourner au moins 10s pour compter comme "stable"
      max_memory_restart: '200M',  // Redémarre si le bot dépasse 200 MB de RAM
      env: {
        NODE_ENV: 'production'
      },
      // Logs
      error_file: './logs/error.log',
      out_file: './logs/output.log',
      log_date_format: 'YYYY-MM-DD HH:mm:ss',
      merge_logs: true
    }
  ]
};

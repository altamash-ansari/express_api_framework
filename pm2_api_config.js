module.exports = {
  apps: [{
    name           : process.env.NODE_APP_NAME || "api",
    script         : process.env.NODE_API_CODE_PATH || "server.js",
    log_date_format: "YYYY-MM-DD HH:mm Z",
    kill_timeout   : 2000,
    merge_logs     : true,
    instances      : process.env.NODE_WORKERS || 1,
    out_file       : process.env.NODE_STDOUT_LOG || "stdout.log",
    error_file     : process.env.NODE_STDERR_LOG || "stderr.log",
    pid_file       : process.env.NODE_IPC || "api.pid",
    exec_mode      : "cluster",
    wait_ready     : true,
    env            : {
      NODE_ENV: process.env.NODE_ENV || "test"
    }
  }]
}
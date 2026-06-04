const logger = {
  info: (message, data = null) => console.log(`[INFO] ${message}`, data || ''),
  warn: (message, data = null) => console.warn(`[WARN] ${message}`, data || ''),
  error: (message, data = null) => console.error(`[ERROR] ${message}`, data || ''),
  getLogFilePath: () => '',
  getFileLogs: async () => 'Logger disabled.',
  getLogs: async () => [],
  clearLogs: async () => {}
};

export default logger;

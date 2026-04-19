import AsyncStorage from '@react-native-async-storage/async-storage';
import RNFS from 'react-native-fs';

const LOG_KEY = '@app_debug_logs';
const MAX_LOGS = 200;
const LOG_FILE_PATH = `${RNFS.DocumentDirectoryPath}/app_debug_logs.txt`;

const logger = {
  info: async (message, data = null) => {
    await logger._save('INFO', message, data);
  },
  
  warn: async (message, data = null) => {
    await logger._save('WARN', message, data);
  },
  
  error: async (message, data = null) => {
    await logger._save('ERROR', message, data);
  },

  _save: async (level, message, data) => {
    try {
      const timestamp = new Date().toISOString();
      const newEntry = {
        timestamp,
        level,
        message,
        data: data ? JSON.stringify(data) : null,
      };

      console.log(`[${level}] ${message}`, data || '');

      const existingLogsStr = await AsyncStorage.getItem(LOG_KEY);
      let logs = existingLogsStr ? JSON.parse(existingLogsStr) : [];
      
      logs.unshift(newEntry);
      
      // Keep only recent logs
      if (logs.length > MAX_LOGS) {
        logs = logs.slice(0, MAX_LOGS);
      }

      await AsyncStorage.setItem(LOG_KEY, JSON.stringify(logs));

      // APPEND TO LOCAL FILE
      const fileEntry = `[${timestamp}] [${level}] ${message} ${data ? `Data: ${JSON.stringify(data)}` : ''}\n`;
      await RNFS.appendFile(LOG_FILE_PATH, fileEntry, 'utf8');
      
    } catch (e) {
      console.error('Logging failed', e);
    }
  },

  getLogFilePath: () => LOG_FILE_PATH,

  getFileLogs: async () => {
    try {
      if (await RNFS.exists(LOG_FILE_PATH)) {
        return await RNFS.readFile(LOG_FILE_PATH, 'utf8');
      }
      return 'No file logs found.';
    } catch (e) {
      return 'Error reading log file.';
    }
  },

  getLogs: async () => {
    try {
      const logs = await AsyncStorage.getItem(LOG_KEY);
      return logs ? JSON.parse(logs) : [];
    } catch (e) {
      return [];
    }
  },

  clearLogs: async () => {
    await AsyncStorage.removeItem(LOG_KEY);
  }
};

export default logger;

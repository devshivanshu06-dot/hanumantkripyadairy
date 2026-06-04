import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, RefreshControl, Share } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/MaterialIcons';
import logger from '../utils/logger';

const DebugLogsScreen = ({ navigation }) => {
  const [logs, setLogs] = useState([]);
  const [refreshing, setRefreshing] = useState(false);

  const fetchLogs = async () => {
    setRefreshing(true);
    const storedLogs = await logger.getLogs();
    setLogs(storedLogs);
    setRefreshing(false);
  };

  useEffect(() => {
    fetchLogs();
  }, []);

  const handleClear = async () => {
    await logger.clearLogs();
    setLogs([]);
  };

  const handleShare = async () => {
    const textBlob = logs.map(l => `[${l.timestamp}] ${l.level}: ${l.message} ${l.data || ''}`).join('\n');
    try {
      await Share.share({
        title: 'App Debug Logs',
        message: textBlob,
      });
    } catch (error) {
      console.error(error);
    }
  };

  const getLevelColor = (level) => {
    switch(level) {
      case 'ERROR': return '#ef4444';
      case 'WARN': return '#f59e0b';
      default: return '#3b82f6';
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      <View className="flex-row items-center justify-between px-4 py-4 bg-white border-b border-gray-200">
        <View className="flex-row items-center">
          <TouchableOpacity onPress={() => navigation.goBack()} className="p-2 mr-2">
            <Icon name="arrow-back" size={24} color="#1e3a8a" />
          </TouchableOpacity>
          <Text className="text-lg font-bold text-blue-900">Debug Logs</Text>
        </View>
        <View className="flex-row">
          <TouchableOpacity onPress={handleShare} className="p-2 mr-2">
            <Icon name="share" size={24} color="#3b82f6" />
          </TouchableOpacity>
          <TouchableOpacity onPress={handleClear} className="p-2">
            <Icon name="delete-sweep" size={24} color="#ef4444" />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView 
        className="flex-1 p-2"
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={fetchLogs} />}
      >
        {logs.length === 0 ? (
          <View className="p-10 items-center">
            <Text className="text-gray-400 font-bold">No logs found.</Text>
          </View>
        ) : (
          logs.map((log, index) => (
            <View key={index} className="bg-white p-3 rounded-lg mb-2 border-l-4 shadow-sm" style={{ borderLeftColor: getLevelColor(log.level) }}>
              <View className="flex-row justify-between mb-1">
                <Text className="text-[10px] font-bold text-gray-400">{new Date(log.timestamp).toLocaleTimeString()}</Text>
                <Text className="text-[10px] font-black" style={{ color: getLevelColor(log.level) }}>{log.level}</Text>
              </View>
              <Text className="text-xs font-bold text-gray-800">{log.message}</Text>
              {log.data ? (
                <Text className="text-[9px] text-gray-500 mt-1 bg-gray-50 p-1 rounded font-mono">
                  {log.data}
                </Text>
              ) : null}
            </View>
          ))
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

export default DebugLogsScreen;

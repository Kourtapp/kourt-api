import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  Dimensions,
} from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

const { width, height } = Dimensions.get('window');

export default function MatchTrackingScreen() {
  const params = useLocalSearchParams();
  const [showHeatmap, setShowHeatmap] = useState(false);
  const [showWeeklyHeatmap, setShowWeeklyHeatmap] = useState(false);
  const [showPOI, setShowPOI] = useState(true);
  const [is3D, setIs3D] = useState(false);

  const [timer, setTimer] = useState('00:00');
  const [score, setScore] = useState({ a: 0, b: 0 });
  const [sets, setSets] = useState(0);

  const matchId = (params.matchId as string) || '1';
  const sport = (params.sport as string) || 'BeachTennis';
  const venue = (params.venue as string) || 'Arena Ibirapuera';

  const handleStart = () => {
    router.push(`/match/live/${matchId}` as any);
  };

  const handleExpand = () => {
    router.push(`/match/live/${matchId}` as any);
  };

  return (
    <SafeAreaView className="flex-1 bg-gray-100">
      <StatusBar barStyle="dark-content" />

      {/* Map Container */}
      <View className="flex-1 relative">
        {/* Simulated Map Background */}
        <View className="flex-1 bg-gray-200">
          {/* Map Elements */}
          <View className="flex-1 items-center justify-center">
            {/* Distance Indicator */}
            <View className="absolute left-4 top-4 bg-white/90 px-3 py-1.5 rounded-lg">
              <Text className="text-xs text-gray-600">850m</Text>
            </View>

            {/* Court Visual */}
            <View className="w-32 h-20 bg-yellow-400/80 rounded-lg border-2 border-yellow-500 items-center justify-center shadow-lg transform rotate-12">
              <View className="absolute w-0.5 h-full bg-white/60" />
              <View className="absolute w-full h-0.5 bg-white/60" />
              <View className="w-4 h-4 bg-white/40 rounded-full" />
            </View>

            {/* Location Markers */}
            <View className="absolute top-1/4 left-1/4">
              <View className="w-4 h-4 bg-blue-500 rounded-full border-2 border-white" />
            </View>
            <View className="absolute top-1/3 right-1/3">
              <View className="w-4 h-4 bg-blue-500 rounded-full border-2 border-white" />
            </View>
            <View className="absolute bottom-1/3 left-1/3">
              <View className="w-4 h-4 bg-blue-500 rounded-full border-2 border-white" />
            </View>

            {/* Venue Label */}
            <View className="absolute bottom-1/4 left-1/4 bg-[#22C55E] px-3 py-1.5 rounded-full">
              <Text className="text-white text-xs font-medium">{venue}</Text>
            </View>
          </View>
        </View>

        {/* Map Controls - Right Side */}
        <View className="absolute top-4 right-4 space-y-2">
          {/* Global Heatmap */}
          <TouchableOpacity
            onPress={() => setShowHeatmap(!showHeatmap)}
            className={`flex-row items-center px-3 py-2 rounded-full ${
              showHeatmap ? 'bg-orange-500' : 'bg-white'
            }`}
          >
            <Text className={`text-xs font-medium ${showHeatmap ? 'text-white' : 'text-gray-700'}`}>
              Global Heatmap
            </Text>
            <View className={`w-3 h-3 rounded-full ml-2 ${showHeatmap ? 'bg-white' : 'bg-orange-500'}`} />
          </TouchableOpacity>

          {/* Weekly Heatmap */}
          <TouchableOpacity
            onPress={() => setShowWeeklyHeatmap(!showWeeklyHeatmap)}
            className={`flex-row items-center px-3 py-2 rounded-full mt-2 ${
              showWeeklyHeatmap ? 'bg-green-500' : 'bg-white'
            }`}
          >
            <Text className={`text-xs font-medium ${showWeeklyHeatmap ? 'text-white' : 'text-gray-700'}`}>
              Weekly Heatmap
            </Text>
            <View className={`w-3 h-3 rounded-full ml-2 ${showWeeklyHeatmap ? 'bg-white' : 'bg-green-500'}`} />
          </TouchableOpacity>

          {/* Points of Interest */}
          <TouchableOpacity
            onPress={() => setShowPOI(!showPOI)}
            className={`flex-row items-center px-3 py-2 rounded-full mt-2 ${
              showPOI ? 'bg-blue-500' : 'bg-white'
            }`}
          >
            <Text className={`text-xs font-medium ${showPOI ? 'text-white' : 'text-gray-700'}`}>
              Points of Interest
            </Text>
            <View className="ml-2 bg-gray-200 px-1.5 py-0.5 rounded">
              <Text className="text-[10px] text-gray-600">11</Text>
            </View>
          </TouchableOpacity>

          {/* 3D Toggle */}
          <TouchableOpacity
            onPress={() => setIs3D(!is3D)}
            className={`items-center justify-center w-10 h-10 rounded-lg mt-2 ${
              is3D ? 'bg-gray-800' : 'bg-white'
            }`}
          >
            <Text className={`text-xs font-bold ${is3D ? 'text-white' : 'text-gray-700'}`}>3D</Text>
          </TouchableOpacity>
        </View>

        {/* Compass */}
        <View className="absolute top-4 left-4">
          <View className="w-10 h-10 bg-white rounded-full items-center justify-center shadow">
            <MaterialIcons name="navigation" size={20} color="#374151" />
          </View>
        </View>
      </View>

      {/* Bottom Match Info Card */}
      <View className="bg-white rounded-t-3xl shadow-lg px-6 pt-4 pb-8">
        {/* Drag Handle */}
        <View className="items-center mb-4">
          <View className="w-10 h-1 bg-gray-300 rounded-full" />
        </View>

        {/* Sport Title with Expand Button */}
        <View className="flex-row items-center justify-between mb-4">
          <Text className="text-xl font-bold text-gray-900">{sport}</Text>
          <TouchableOpacity
            onPress={handleExpand}
            className="w-8 h-8 items-center justify-center"
          >
            <MaterialIcons name="open-in-full" size={20} color="#6B7280" />
          </TouchableOpacity>
        </View>

        {/* Stats Row */}
        <View className="flex-row items-center justify-between mb-6">
          {/* Tempo */}
          <View className="items-center flex-1">
            <Text className="text-3xl font-bold text-gray-900">{timer}</Text>
            <Text className="text-sm text-gray-500 mt-1">Tempo</Text>
          </View>

          {/* Divider */}
          <View className="w-px h-12 bg-gray-200" />

          {/* Placar */}
          <View className="items-center flex-1">
            <Text className="text-3xl font-bold text-gray-900">
              {score.a}-{score.b}
            </Text>
            <Text className="text-sm text-gray-500 mt-1">Placar</Text>
          </View>

          {/* Divider */}
          <View className="w-px h-12 bg-gray-200" />

          {/* Sets */}
          <View className="items-center flex-1">
            <Text className="text-3xl font-bold text-gray-900">{sets}</Text>
            <Text className="text-sm text-gray-500 mt-1">Sets</Text>
          </View>
        </View>

        {/* Start Button */}
        <TouchableOpacity onPress={handleStart}>
          <LinearGradient
            colors={['#22C55E', '#16A34A']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            className="rounded-xl py-4 flex-row items-center justify-center"
          >
            <View className="w-8 h-8 rounded-full bg-white/20 items-center justify-center mr-3">
              <MaterialIcons name="play-arrow" size={20} color="#fff" />
            </View>
            <Text className="text-white font-semibold text-base">Iniciar</Text>
          </LinearGradient>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

/**
 * 統計分析頁面
 * 顯示營養攝取趨勢與期間統計
 */

import React, { useState, useEffect } from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  BarChart,
  Bar,
} from 'recharts';
import { FiTrendingUp, FiCalendar } from 'react-icons/fi';
import { toast } from 'react-toastify';
import { MainLayout } from '../components/layout';
import { Card, Button, Loading } from '../components/common';
import { statisticsService, type StatisticsOverview } from '../services/statisticsService';
import { formatDate, getToday } from '../utils/formatDate';

// 取得預設日期範圍（過去 7 天）
const getDefaultDateRange = () => {
  const end = new Date();
  const start = new Date();
  start.setDate(start.getDate() - 6);
  return {
    startDate: formatDate(start),
    endDate: formatDate(end),
  };
};

export const StatisticsPage: React.FC = () => {
  const defaultRange = getDefaultDateRange();
  const [startDate, setStartDate] = useState(defaultRange.startDate);
  const [endDate, setEndDate] = useState(defaultRange.endDate);
  const [data, setData] = useState<StatisticsOverview | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const loadOverview = async () => {
    if (!startDate || !endDate) return;
    const start = new Date(startDate);
    const end = new Date(endDate);
    if (start > end) {
      toast.error('開始日期不可晚於結束日期');
      return;
    }
    const days = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1;
    if (days > 31) {
      toast.error('日期範圍最多 31 天');
      return;
    }
    setIsLoading(true);
    try {
      const result = await statisticsService.getOverview(startDate, endDate);
      setData(result);
    } catch (error: any) {
      toast.error(error.response?.data?.error?.message || '載入統計失敗');
      setData(null);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadOverview();
  }, []);

  // 熱量趨勢圖資料（每日）
  const calorieChartData = data?.periodSummary.dailySummaries.map((d) => ({
    date: d.date.slice(5), // MM-DD
    fullDate: d.date,
    熱量: Math.round(d.totalCalories),
    目標: data.nutritionTarget ? Math.round(data.nutritionTarget.dailyCalories) : null,
  })) ?? [];

  // 三大營養素每日平均長條圖用
  const macroChartData = data?.periodSummary.dailySummaries.length
    ? [
        {
          name: '蛋白質',
          攝取: Math.round(data.periodSummary.periodAverage.protein),
          目標: data.nutritionTarget ? Math.round(data.nutritionTarget.protein) : 0,
        },
        {
          name: '碳水化合物',
          攝取: Math.round(data.periodSummary.periodAverage.carbohydrates),
          目標: data.nutritionTarget ? Math.round(data.nutritionTarget.carbohydrates) : 0,
        },
        {
          name: '脂肪',
          攝取: Math.round(data.periodSummary.periodAverage.fat),
          目標: data.nutritionTarget ? Math.round(data.nutritionTarget.fat) : 0,
        },
      ]
    : [];

  return (
    <MainLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">統計分析</h1>
          <p className="text-gray-600 mt-1">查看營養攝取趨勢與期間統計</p>
        </div>

        {/* 日期範圍 */}
        <Card>
          <div className="flex flex-wrap items-end gap-4">
            <div className="flex items-center gap-2">
              <FiCalendar className="w-5 h-5 text-emerald-600" />
              <label className="text-sm font-medium text-gray-700">開始日期</label>
              <input
                type="date"
                value={startDate}
                max={getToday()}
                onChange={(e) => setStartDate(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
              />
            </div>
            <div className="flex items-center gap-2">
              <label className="text-sm font-medium text-gray-700">結束日期</label>
              <input
                type="date"
                value={endDate}
                max={getToday()}
                onChange={(e) => setEndDate(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
              />
            </div>
            <Button onClick={loadOverview} disabled={isLoading}>
              {isLoading ? '載入中...' : '查詢'}
            </Button>
          </div>
        </Card>

        {isLoading && (
          <Card>
            <Loading text="載入統計資料..." />
          </Card>
        )}

        {!isLoading && data && (
          <>
            {/* 期間總計與平均 */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <Card>
                <p className="text-sm text-gray-600 mb-1">期間總熱量</p>
                <p className="text-2xl font-bold text-red-600">
                  {Math.round(data.periodSummary.periodTotal.calories)}
                  <span className="text-sm font-normal text-gray-500 ml-1">大卡</span>
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  平均每日 {Math.round(data.periodSummary.periodAverage.calories)} 大卡
                </p>
              </Card>
              <Card>
                <p className="text-sm text-gray-600 mb-1">期間總蛋白質</p>
                <p className="text-2xl font-bold text-blue-600">
                  {Math.round(data.periodSummary.periodTotal.protein)}
                  <span className="text-sm font-normal text-gray-500 ml-1">g</span>
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  平均每日 {Math.round(data.periodSummary.periodAverage.protein)} g
                </p>
              </Card>
              <Card>
                <p className="text-sm text-gray-600 mb-1">期間總碳水化合物</p>
                <p className="text-2xl font-bold text-yellow-600">
                  {Math.round(data.periodSummary.periodTotal.carbohydrates)}
                  <span className="text-sm font-normal text-gray-500 ml-1">g</span>
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  平均每日 {Math.round(data.periodSummary.periodAverage.carbohydrates)} g
                </p>
              </Card>
              <Card>
                <p className="text-sm text-gray-600 mb-1">期間總脂肪</p>
                <p className="text-2xl font-bold text-green-600">
                  {Math.round(data.periodSummary.periodTotal.fat)}
                  <span className="text-sm font-normal text-gray-500 ml-1">g</span>
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  平均每日 {Math.round(data.periodSummary.periodAverage.fat)} g
                </p>
              </Card>
            </div>

            {/* 熱量趨勢圖 */}
            <Card>
              <Card.Header
                title="每日熱量趨勢"
                subtitle={`${data.periodSummary.startDate} ~ ${data.periodSummary.endDate}（共 ${data.periodSummary.totalDays} 天）`}
              />
              <Card.Body>
                {calorieChartData.length === 0 ? (
                  <div className="h-64 flex items-center justify-center text-gray-500">
                    此期間尚無飲食記錄
                  </div>
                ) : (
                  <div className="h-80">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={calorieChartData} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                        <XAxis dataKey="date" tick={{ fontSize: 12 }} />
                        <YAxis tick={{ fontSize: 12 }} />
                        <Tooltip
                          labelFormatter={(_, payload) =>
                            payload?.[0]?.payload?.fullDate ?? ''
                          }
                          formatter={(value: number) => [`${value} 大卡`, '']}
                        />
                        <Legend />
                        <Line
                          type="monotone"
                          dataKey="熱量"
                          stroke="#ef4444"
                          strokeWidth={2}
                          dot={{ r: 4 }}
                          name="實際攝取"
                        />
                        {data.nutritionTarget && (
                          <Line
                            type="monotone"
                            dataKey="目標"
                            stroke="#10b981"
                            strokeWidth={2}
                            strokeDasharray="5 5"
                            dot={false}
                            name="每日目標"
                          />
                        )}
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                )}
              </Card.Body>
            </Card>

            {/* 三大營養素平均 vs 目標 */}
            {macroChartData.length > 0 && (
              <Card>
                <Card.Header
                  title="每日平均營養素 vs 目標"
                  subtitle="期間內每日平均攝取與設定的每日目標"
                />
                <Card.Body>
                  <div className="h-72">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart
                        data={macroChartData}
                        layout="vertical"
                        margin={{ top: 5, right: 30, left: 80, bottom: 5 }}
                      >
                        <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                        <XAxis type="number" tick={{ fontSize: 12 }} />
                        <YAxis type="category" dataKey="name" width={70} tick={{ fontSize: 12 }} />
                        <Tooltip
                          formatter={(value: number, name: string) => [
                            `${value} g`,
                            name === '攝取' ? '平均攝取' : '每日目標',
                          ]}
                        />
                        <Legend />
                        <Bar dataKey="攝取" fill="#3b82f6" name="平均攝取" radius={[0, 4, 4, 0]} />
                        <Bar dataKey="目標" fill="#10b981" name="每日目標" radius={[0, 4, 4, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </Card.Body>
              </Card>
            )}

            {data.nutritionTarget && (
              <Card>
                <Card.Header title="每日營養目標" subtitle="來自個人資料設定" />
                <Card.Body>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="bg-red-50 rounded-lg p-3">
                      <p className="text-sm text-red-600">熱量</p>
                      <p className="text-xl font-bold text-red-700">
                        {Math.round(data.nutritionTarget.dailyCalories)} 大卡
                      </p>
                    </div>
                    <div className="bg-blue-50 rounded-lg p-3">
                      <p className="text-sm text-blue-600">蛋白質</p>
                      <p className="text-xl font-bold text-blue-700">
                        {Math.round(data.nutritionTarget.protein)} g
                      </p>
                    </div>
                    <div className="bg-yellow-50 rounded-lg p-3">
                      <p className="text-sm text-yellow-600">碳水化合物</p>
                      <p className="text-xl font-bold text-yellow-700">
                        {Math.round(data.nutritionTarget.carbohydrates)} g
                      </p>
                    </div>
                    <div className="bg-green-50 rounded-lg p-3">
                      <p className="text-sm text-green-600">脂肪</p>
                      <p className="text-xl font-bold text-green-700">
                        {Math.round(data.nutritionTarget.fat)} g
                      </p>
                    </div>
                  </div>
                </Card.Body>
              </Card>
            )}
          </>
        )}

        {!isLoading && !data && (
          <Card>
            <div className="text-center py-12 text-gray-500">
              <FiTrendingUp className="w-12 h-12 mx-auto mb-4 text-gray-300" />
              <p>請選擇日期範圍並點擊「查詢」以載入統計</p>
            </div>
          </Card>
        )}
      </div>
    </MainLayout>
  );
};

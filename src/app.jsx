import React, { useState, useEffect } from 'react';
import { Calculator, History, DollarSign, Calendar, Settings } from 'lucide-react';

export default function FoodExpenseRecorder() {
  const [amount, setAmount] = useState('');
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [client, setClient] = useState('');
  const [mealRates, setMealRates] = useState({
    weekdayLunch: 50,
    weekdaySupper: 50,
    fridayLunch: 120,
    fridaySupper: 50
  });
  const [records, setRecords] = useState([]);
  const [showAdjust, setShowAdjust] = useState(false);
  const [showRecords, setShowRecords] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem('foodExpenseRecords');
    if (saved) {
      setRecords(JSON.parse(saved));
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('foodExpenseRecords', JSON.stringify(records));
  }, [records]);

  const getDayOfWeek = (dateStr) => {
    const date = new Date(dateStr);
    return date.getDay();
  };

  const calculateMeals = () => {
    if (!amount || parseFloat(amount) <= 0) {
      alert('Please enter a valid amount');
      return;
    }

    const totalAmount = parseFloat(amount);
    const startDate = new Date(selectedDate);
    let remainingAmount = totalAmount;
    let mealsCalculated = [];
    let currentDate = new Date(startDate);
    let mealCount = 0;

    while (remainingAmount > 0) {
      const dayOfWeek = currentDate.getDay();
      const isFriday = dayOfWeek === 5;
      
      const lunchCost = isFriday ? mealRates.fridayLunch : mealRates.weekdayLunch;
      const supperCost = isFriday ? mealRates.fridaySupper : mealRates.weekdaySupper;
      
      if (remainingAmount >= lunchCost) {
        remainingAmount -= lunchCost;
        mealCount++;
        mealsCalculated.push({
          date: currentDate.toISOString().split('T')[0],
          type: 'Lunch',
          cost: lunchCost,
          day: isFriday ? 'Friday' : getDayName(dayOfWeek)
        });
      }
      
      if (remainingAmount >= supperCost) {
        remainingAmount -= supperCost;
        mealCount++;
        mealsCalculated.push({
          date: currentDate.toISOString().split('T')[0],
          type: 'Supper',
          cost: supperCost,
          day: isFriday ? 'Friday' : getDayName(dayOfWeek)
        });
      }
      
      if (remainingAmount < Math.min(lunchCost, supperCost)) {
        break;
      }
      
      currentDate.setDate(currentDate.getDate() + 1);
      
      if (mealCount > 100) break;
    }

    const newRecord = {
      id: Date.now(),
      date: selectedDate,
      amount: totalAmount,
      client: client || 'Default',
      mealCount: mealCount,
      excessAmount: remainingAmount.toFixed(2),
      mealsDetail: mealsCalculated,
      mealRatesUsed: { ...mealRates },
      timestamp: new Date().toISOString()
    };

    setRecords([newRecord, ...records]);
    
    alert(`Calculation Complete!\n\nTotal Meals: ${mealCount}\nExcess Amount: ${remainingAmount.toFixed(2)} tk\n\nLast meal date: ${mealsCalculated[mealsCalculated.length - 1]?.date || 'N/A'}`);
    
    setAmount('');
  };

  const getDayName = (dayNum) => {
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    return days[dayNum];
  };

  const updateMealRates = (field, value) => {
    setMealRates({
      ...mealRates,
      [field]: parseFloat(value) || 0
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-amber-100 p-4">
      <div className="max-w-2xl mx-auto">
        <div className="bg-white rounded-3xl shadow-2xl overflow-hidden">
          <div className="bg-gradient-to-r from-orange-500 to-amber-500 p-6 text-white">
            <div className="flex items-center justify-center mb-2">
              <div className="bg-white rounded-full p-3">
                <DollarSign className="w-8 h-8 text-orange-500" />
              </div>
            </div>
            <h1 className="text-3xl font-bold text-center">Food Expense Recorder</h1>
            <p className="text-center text-orange-100 mt-1">Track your meal expenses efficiently</p>
          </div>

          <div className="p-6">
            <div className="bg-amber-50 rounded-2xl p-6 mb-6">
              <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center">
                <Calculator className="w-5 h-5 mr-2 text-orange-500" />
                New Expense Entry
              </h2>
              <p className="text-sm text-gray-600 mb-4">Enter your meal expense details</p>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    💰 Amount (tk)
                  </label>
                  <input
                    type="number"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    placeholder="Enter amount"
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    🗓️ Date
                  </label>
                  <div className="relative">
                    <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <input
                      type="date"
                      value={selectedDate}
                      onChange={(e) => setSelectedDate(e.target.value)}
                      className="w-full pl-12 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    🏢 Meal Provider (Client)
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={client}
                      onChange={(e) => setClient(e.target.value)}
                      placeholder="Select a client"
                      className="flex-1 px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                    />
                    <button className="bg-orange-500 text-white px-4 rounded-xl hover:bg-orange-600 transition-colors">
                      +
                    </button>
                  </div>
                </div>

                <div className="bg-white rounded-xl p-4 border-2 border-gray-100">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="font-bold text-gray-800 flex items-center">
                      💵 Current Meal Rates
                    </h3>
                    <button
                      onClick={() => setShowAdjust(!showAdjust)}
                      className="text-sm text-orange-600 hover:text-orange-700 flex items-center"
                    >
                      <Settings className="w-4 h-4 mr-1" />
                      Adjust
                    </button>
                  </div>

                  {showAdjust ? (
                    <div className="space-y-3">
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="text-xs text-gray-600">🍱 Weekday Lunch</label>
                          <input
                            type="number"
                            value={mealRates.weekdayLunch}
                            onChange={(e) => updateMealRates('weekdayLunch', e.target.value)}
                            className="w-full px-3 py-2 border rounded-lg mt-1"
                          />
                        </div>
                        <div>
                          <label className="text-xs text-gray-600">🍛 Weekday Supper</label>
                          <input
                            type="number"
                            value={mealRates.weekdaySupper}
                            onChange={(e) => updateMealRates('weekdaySupper', e.target.value)}
                            className="w-full px-3 py-2 border rounded-lg mt-1"
                          />
                        </div>
                        <div>
                          <label className="text-xs text-gray-600">🍽️ Friday Lunch</label>
                          <input
                            type="number"
                            value={mealRates.fridayLunch}
                            onChange={(e) => updateMealRates('fridayLunch', e.target.value)}
                            className="w-full px-3 py-2 border rounded-lg mt-1"
                          />
                        </div>
                        <div>
                          <label className="text-xs text-gray-600">🍖 Friday Supper</label>
                          <input
                            type="number"
                            value={mealRates.fridaySupper}
                            onChange={(e) => updateMealRates('fridaySupper', e.target.value)}
                            className="w-full px-3 py-2 border rounded-lg mt-1"
                          />
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="grid grid-cols-2 gap-3">
                      <div className="bg-orange-50 rounded-lg p-3">
                        <p className="text-xs text-gray-600">🍱 Weekday Lunch</p>
                        <p className="text-lg font-bold text-orange-600">{mealRates.weekdayLunch} tk</p>
                      </div>
                      <div className="bg-orange-50 rounded-lg p-3">
                        <p className="text-xs text-gray-600">🍛 Weekday Supper</p>
                        <p className="text-lg font-bold text-orange-600">{mealRates.weekdaySupper} tk</p>
                      </div>
                      <div className="bg-amber-50 rounded-lg p-3">
                        <p className="text-xs text-gray-600">🍽️ Friday Lunch</p>
                        <p className="text-lg font-bold text-amber-600">{mealRates.fridayLunch} tk</p>
                      </div>
                      <div className="bg-amber-50 rounded-lg p-3">
                        <p className="text-xs text-gray-600">🍖 Friday Supper</p>
                        <p className="text-lg font-bold text-amber-600">{mealRates.fridaySupper} tk</p>
                      </div>
                    </div>
                  )}
                </div>

                <button
                  onClick={calculateMeals}
                  className="w-full bg-gradient-to-r from-orange-500 to-amber-500 text-white py-4 rounded-xl font-bold text-lg hover:from-orange-600 hover:to-amber-600 transition-all shadow-lg"
                >
                  🧮 Calculate Meals
                </button>
              </div>
            </div>

            <button
              onClick={() => setShowRecords(!showRecords)}
              className="w-full bg-white border-2 border-orange-200 text-orange-600 py-3 rounded-xl font-semibold hover:bg-orange-50 transition-all flex items-center justify-center"
            >
              <History className="w-5 h-5 mr-2" />
              📋 View Past Records
            </button>

            {showRecords && records.length > 0 && (
              <div className="mt-6 space-y-3">
                {records.map((record) => (
                  <div key={record.id} className="bg-gradient-to-r from-orange-50 to-amber-50 rounded-xl p-4 border-2 border-orange-100">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <p className="font-bold text-gray-800">{record.client}</p>
                        <p className="text-sm text-gray-600">{record.date}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-2xl font-bold text-orange-600">{record.amount} tk</p>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-2 mt-3">
                      <div className="bg-white rounded-lg p-2">
                        <p className="text-xs text-gray-600">Total Meals</p>
                        <p className="text-lg font-bold text-gray-800">{record.mealCount}</p>
                      </div>
                      <div className="bg-white rounded-lg p-2">
                        <p className="text-xs text-gray-600">Excess Amount</p>
                        <p className="text-lg font-bold text-green-600">{record.excessAmount} tk</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
                  }
